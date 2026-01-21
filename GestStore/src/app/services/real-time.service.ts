import { Injectable, signal, computed, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, Subject, Subscription, of, timer } from 'rxjs';
import { takeUntil, switchMap, catchError, map, tap } from 'rxjs/operators';
import { NotificationService } from './notification.service';

/**
 * Estado de conexión del servicio de tiempo real
 */
export type ConnectionState = 'connected' | 'disconnected' | 'connecting' | 'reconnecting' | 'error';

/**
 * Evento de actualización en tiempo real
 */
export interface RealTimeEvent {
  type: 'task_created' | 'task_updated' | 'task_deleted' | 'product_updated' | 'stock_alert' | 'sync' | 'reconnected';
  payload?: unknown;
  timestamp: Date;
}

/**
 * Configuración del servicio de tiempo real
 */
export interface RealTimeConfig {
  /** Intervalo de polling en ms (por defecto 30000) */
  pollInterval: number;
  /** Número máximo de reintentos antes de dar error (por defecto 5) */
  maxRetries: number;
  /** Delay base para backoff exponencial en ms (por defecto 1000) */
  baseRetryDelay: number;
  /** Delay máximo entre reintentos en ms (por defecto 60000) */
  maxRetryDelay: number;
}

const DEFAULT_CONFIG: RealTimeConfig = {
  pollInterval: 30000,      // 30 segundos
  maxRetries: 15,            // 5 reintentos
  baseRetryDelay: 2000,     // 1 segundo base
  maxRetryDelay: 60000      // 1 minuto máximo
};

/**
 * Servicio de actualizaciones en tiempo real usando polling con reconexión automática.
 * 
 * ## Características
 * 
 * - **Polling periódico**: Consulta el servidor cada 30 segundos
 * - **Reconexión automática**: Backoff exponencial en caso de fallos
 * - **Detección de cambios**: Compara contadores para detectar actualizaciones
 * - **Notificaciones**: Informa al usuario de eventos importantes
 * - **Estado reactivo**: Signals para estado de conexión
 * 
 * ## ¿Por qué polling en lugar de WebSockets?
 * 
 * Para GestStore (gestión de tareas y stock), el polling es la mejor opción porque:
 * 
 * 1. **Simplicidad**: No requiere configuración especial del servidor
 * 2. **Compatibilidad**: Funciona a través de proxies, firewalls y CDNs
 * 3. **Tolerancia a fallos**: Se recupera automáticamente de desconexiones
 * 4. **Adecuación al caso de uso**: La latencia de 30s es aceptable para gestión de tareas
 * 
 * WebSockets serían más apropiados para:
 * - Chat en tiempo real (latencia crítica)
 * - Trading/finanzas (actualizaciones instantáneas)
 * - Juegos multijugador
 * 
 * ## Estrategia de reconexión (Backoff Exponencial)
 * 
 * Cuando hay un fallo de conexión:
 * 1. Primer reintento: 1 segundo
 * 2. Segundo reintento: 2 segundos
 * 3. Tercer reintento: 4 segundos
 * 4. Cuarto reintento: 8 segundos
 * 5. Quinto reintento: 16 segundos
 * 
 * Después de 5 fallos consecutivos, entra en estado de error.
 * El usuario puede forzar reconexión manual con `reconnect()`.
 * 
 * @example
 * ```typescript
 * // En un componente
 * constructor(private realTime: RealTimeService) {
 *   this.realTime.updates$.subscribe(event => {
 *     if (event.type === 'task_updated') {
 *       this.reloadTasks();
 *     }
 *   });
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class RealTimeService implements OnDestroy {
  private readonly API_URL = '/api';
  private config: RealTimeConfig = DEFAULT_CONFIG;
  
  // ============================================================================
  // ESTADO REACTIVO (Signals)
  // ============================================================================
  
  private connectionStateSignal = signal<ConnectionState>('disconnected');
  private lastSyncSignal = signal<Date | null>(null);
  private eventsSignal = signal<RealTimeEvent[]>([]);
  private retryCountSignal = signal<number>(0);
  private errorMessageSignal = signal<string | null>(null);
  
  // Señales públicas de solo lectura
  readonly connectionState = computed(() => this.connectionStateSignal());
  readonly isConnected = computed(() => this.connectionStateSignal() === 'connected');
  readonly isReconnecting = computed(() => this.connectionStateSignal() === 'reconnecting');
  readonly hasError = computed(() => this.connectionStateSignal() === 'error');
  readonly lastSync = computed(() => this.lastSyncSignal());
  readonly events = computed(() => this.eventsSignal());
  readonly retryCount = computed(() => this.retryCountSignal());
  readonly errorMessage = computed(() => this.errorMessageSignal());
  
  // ============================================================================
  // CONTROL DE POLLING Y RECONEXIÓN
  // ============================================================================
  
  private pollingSubscription: Subscription | null = null;
  private reconnectSubscription: Subscription | null = null;
  private destroy$ = new Subject<void>();
  private consecutiveErrors = 0;
  
  // Subject para notificar cambios a los componentes
  private updateSubject = new Subject<RealTimeEvent>();
  readonly updates$ = this.updateSubject.asObservable();
  
  // Datos de la última sincronización para detectar cambios
  private lastTaskCount: number | null = null;
  private lastProductCount: number | null = null;
  private lastLowStockCount: number | null = null;
  
  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}
  
  ngOnDestroy(): void {
    this.stopPolling();
    this.cancelReconnect();
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  // ============================================================================
  // MÉTODOS PÚBLICOS
  // ============================================================================
  
  /**
   * Configura el servicio con opciones personalizadas
   */
  configure(config: Partial<RealTimeConfig>): void {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }
  
  /**
   * Inicia el polling de actualizaciones
   */
  startPolling(): void {
    if (this.pollingSubscription) {
      console.log('[RealTimeService] Polling ya activo');
      return;
    }
    
    console.log('[RealTimeService] Iniciando polling...');
    this.connectionStateSignal.set('connecting');
    this.resetErrorState();
    
    // Realizar primera sincronización inmediatamente
    this.performSyncWithRetry().subscribe();
    
    // Configurar polling periódico
    this.pollingSubscription = interval(this.config.pollInterval).pipe(
      takeUntil(this.destroy$),
      switchMap(() => this.performSyncWithRetry())
    ).subscribe();
  }
  
  /**
   * Detiene el polling de actualizaciones
   */
  stopPolling(): void {
    if (this.pollingSubscription) {
      console.log('[RealTimeService] Deteniendo polling...');
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = null;
    }
    this.cancelReconnect();
    this.connectionStateSignal.set('disconnected');
    this.resetErrorState();
  }
  
  /**
   * Fuerza una reconexión manual (útil después de un error)
   */
  reconnect(): void {
    console.log('[RealTimeService] Reconexión manual solicitada');
    this.stopPolling();
    this.startPolling();
    this.notificationService.info('Reconectando...');
  }
  
  /**
   * Realiza una sincronización manual sin esperar al intervalo
   */
  refresh(): void {
    console.log('[RealTimeService] Sincronización manual');
    this.performSyncWithRetry().subscribe();
  }
  
  /**
   * Notifica un cambio de datos (para que otros componentes se actualicen)
   */
  notifyDataChange(type: RealTimeEvent['type'], payload?: unknown): void {
    const event: RealTimeEvent = {
      type,
      payload,
      timestamp: new Date()
    };
    this.emitEvent(event);
  }
  
  // ============================================================================
  // MÉTODOS PRIVADOS - RECONEXIÓN
  // ============================================================================
  
  /**
   * Resetea el estado de error
   */
  private resetErrorState(): void {
    this.consecutiveErrors = 0;
    this.retryCountSignal.set(0);
    this.errorMessageSignal.set(null);
  }
  
  /**
   * Cancela cualquier reintento pendiente
   */
  private cancelReconnect(): void {
    if (this.reconnectSubscription) {
      this.reconnectSubscription.unsubscribe();
      this.reconnectSubscription = null;
    }
  }
  
  /**
   * Calcula el delay para el próximo reintento (backoff exponencial)
   * 
   * Fórmula: min(baseDelay * 2^(intentos-1), maxDelay)
   * Ejemplo con defaults: 1s → 2s → 4s → 8s → 16s → 32s → ... → 60s (máximo)
   */
  private calculateRetryDelay(): number {
    const exponentialDelay = this.config.baseRetryDelay * Math.pow(2, this.consecutiveErrors - 1);
    return Math.min(exponentialDelay, this.config.maxRetryDelay);
  }
  
  /**
   * Programa un reintento de conexión
   */
  private scheduleReconnect(): void {
    this.cancelReconnect();
    
    const delay = this.calculateRetryDelay();
    console.log(`[RealTimeService] Reintentando en ${delay / 1000}s (intento ${this.consecutiveErrors}/${this.config.maxRetries})`);
    
    this.reconnectSubscription = timer(delay).pipe(
      takeUntil(this.destroy$),
      switchMap(() => this.performSyncWithRetry())
    ).subscribe();
  }
  
  // ============================================================================
  // MÉTODOS PRIVADOS - SINCRONIZACIÓN
  // ============================================================================
  
  /**
   * Ejecuta sincronización con gestión de errores y reconexión
   */
  private performSyncWithRetry() {
    return this.performSync().pipe(
      tap({
        next: () => {
          // Éxito: notificar si estábamos en error
          if (this.consecutiveErrors > 0) {
            console.log('[RealTimeService] ✓ Conexión restaurada');
            this.emitEvent({
              type: 'reconnected',
              timestamp: new Date()
            });
            this.notificationService.success('Conexión restaurada');
          }
          this.resetErrorState();
        }
      }),
      catchError(error => {
        this.handleSyncError(error);
        return of(null);
      })
    );
  }
  
  /**
   * Ejecuta la sincronización con el servidor
   */
  private performSync() {
    return this.http.get<{ 
      taskCount: number; 
      productCount: number;
      lowStockCount: number;
      timestamp: string;
    }>(`${this.API_URL}/sync/status`).pipe(
      map(response => {
        this.connectionStateSignal.set('connected');
        this.lastSyncSignal.set(new Date());
        
        // Detectar cambios en tareas
        if (this.lastTaskCount !== null && response.taskCount !== this.lastTaskCount) {
          const diff = response.taskCount - this.lastTaskCount;
          const event: RealTimeEvent = {
            type: diff > 0 ? 'task_created' : 'task_deleted',
            payload: { 
              count: response.taskCount, 
              previousCount: this.lastTaskCount,
              difference: diff
            },
            timestamp: new Date()
          };
          this.emitEvent(event);
        }
        
        // Detectar cambios en productos
        if (this.lastProductCount !== null && response.productCount !== this.lastProductCount) {
          const event: RealTimeEvent = {
            type: 'product_updated',
            payload: { 
              count: response.productCount, 
              previousCount: this.lastProductCount 
            },
            timestamp: new Date()
          };
          this.emitEvent(event);
        }
        
        // Detectar nuevas alertas de stock bajo
        if (this.lastLowStockCount !== null && response.lowStockCount > this.lastLowStockCount) {
          const event: RealTimeEvent = {
            type: 'stock_alert',
            payload: { 
              lowStockCount: response.lowStockCount,
              newAlerts: response.lowStockCount - this.lastLowStockCount
            },
            timestamp: new Date()
          };
          this.emitEvent(event);
        }
        
        // Actualizar contadores
        this.lastTaskCount = response.taskCount;
        this.lastProductCount = response.productCount;
        this.lastLowStockCount = response.lowStockCount;
        
        return response;
      }),
      catchError(error => {
        // Si el endpoint no existe (404), usar fallback
        if (error.status === 404) {
          return this.performFallbackSync();
        }
        throw error;
      })
    );
  }
  
  /**
   * Sincronización fallback cuando /api/sync/status no existe.
   * Usa los endpoints de estadísticas existentes.
   */
  private performFallbackSync() {
    return this.http.get<{ data: { totalTasks: number } }>(`${this.API_URL}/tasks/statistics`).pipe(
      map(response => {
        this.connectionStateSignal.set('connected');
        this.lastSyncSignal.set(new Date());
        
        const taskCount = response.data?.totalTasks ?? 0;
        
        // Detectar cambios
        if (this.lastTaskCount !== null && taskCount !== this.lastTaskCount) {
          const event: RealTimeEvent = {
            type: 'task_updated',
            payload: { count: taskCount, previousCount: this.lastTaskCount },
            timestamp: new Date()
          };
          this.emitEvent(event);
        }
        
        this.lastTaskCount = taskCount;
        
        return { taskCount, productCount: 0, lowStockCount: 0, timestamp: new Date().toISOString() };
      }),
      catchError(() => {
        // Si también falla, marcar como conectado (modo degradado)
        this.connectionStateSignal.set('connected');
        this.lastSyncSignal.set(new Date());
        return of(null);
      })
    );
  }
  
  /**
   * Maneja errores de sincronización con reconexión automática
   */
  private handleSyncError(error: unknown): void {
    this.consecutiveErrors++;
    this.retryCountSignal.set(this.consecutiveErrors);
    
    const errorMsg = error instanceof Error ? error.message : 'Error de conexión';
    this.errorMessageSignal.set(errorMsg);
    
    console.warn(`[RealTimeService] ✗ Error de sincronización (intento ${this.consecutiveErrors}/${this.config.maxRetries}):`, error);
    
    if (this.consecutiveErrors >= this.config.maxRetries) {
      // Máximo de reintentos alcanzado
      this.connectionStateSignal.set('error');
      this.notificationService.error('Error de conexión. Pulsa para reintentar.');
      console.error('[RealTimeService] Máximo de reintentos alcanzado, entrando en estado de error');
    } else {
      // Programar reconexión con backoff exponencial
      this.connectionStateSignal.set('reconnecting');
      this.scheduleReconnect();
    }
  }
  
  // ============================================================================
  // MÉTODOS PRIVADOS - EVENTOS
  // ============================================================================
  
  /**
   * Emite un evento y notifica a los suscriptores
   */
  private emitEvent(event: RealTimeEvent): void {
    // Añadir al historial (máximo 50 eventos)
    const current = this.eventsSignal();
    const updated = [event, ...current].slice(0, 50);
    this.eventsSignal.set(updated);
    
    // Notificar a suscriptores
    this.updateSubject.next(event);
    
    // Notificaciones al usuario según tipo
    this.notifyUser(event);
  }
  
  /**
   * Muestra notificaciones al usuario según el tipo de evento
   */
  private notifyUser(event: RealTimeEvent): void {
    switch (event.type) {
      case 'task_created':
        const taskPayload = event.payload as { difference?: number } | undefined;
        if (taskPayload?.difference && taskPayload.difference > 0) {
          this.notificationService.info(`${taskPayload.difference} nueva(s) tarea(s)`);
        }
        break;
        
      case 'stock_alert':
        const stockPayload = event.payload as { newAlerts?: number } | undefined;
        if (stockPayload?.newAlerts && stockPayload.newAlerts > 0) {
          this.notificationService.warning(`${stockPayload.newAlerts} producto(s) con stock bajo`);
        }
        break;
        
      // task_updated, task_deleted, product_updated, reconnected: ya manejados o no notificar
    }
  }
}
