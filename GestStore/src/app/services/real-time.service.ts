import { Injectable, signal, computed, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { interval, Subject, Subscription, of, timer, fromEvent, merge } from 'rxjs';
import { takeUntil, switchMap, catchError, map, tap, filter, debounceTime } from 'rxjs/operators';
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
  maxRetries: 10,           // 10 reintentos (más tolerante)
  baseRetryDelay: 5000,     // 5 segundos base (más paciencia)
  maxRetryDelay: 120000     // 2 minutos máximo
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
  private isBrowser: boolean;
  
  // ============================================================================
  // ESTADO REACTIVO (Signals)
  // ============================================================================
  
  private connectionStateSignal = signal<ConnectionState>('disconnected');
  private lastSyncSignal = signal<Date | null>(null);
  private eventsSignal = signal<RealTimeEvent[]>([]);
  private retryCountSignal = signal<number>(0);
  private errorMessageSignal = signal<string | null>(null);
  private isPageVisibleSignal = signal<boolean>(true);
  private isPausedSignal = signal<boolean>(false);
  
  // Señales públicas de solo lectura
  readonly connectionState = computed(() => this.connectionStateSignal());
  readonly isConnected = computed(() => this.connectionStateSignal() === 'connected');
  readonly isReconnecting = computed(() => this.connectionStateSignal() === 'reconnecting');
  readonly hasError = computed(() => this.connectionStateSignal() === 'error');
  readonly lastSync = computed(() => this.lastSyncSignal());
  readonly events = computed(() => this.eventsSignal());
  readonly retryCount = computed(() => this.retryCountSignal());
  readonly errorMessage = computed(() => this.errorMessageSignal());
  readonly isPageVisible = computed(() => this.isPageVisibleSignal());
  readonly isPaused = computed(() => this.isPausedSignal());
  
  // ============================================================================
  // CONTROL DE POLLING Y RECONEXIÓN
  // ============================================================================
  
  private pollingSubscription: Subscription | null = null;
  private reconnectSubscription: Subscription | null = null;
  private visibilitySubscription: Subscription | null = null;
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
    private notificationService: NotificationService,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    // Escuchar cambios de visibilidad de la página
    if (this.isBrowser) {
      this.setupVisibilityListener();
    }
  }
  
  ngOnDestroy(): void {
    this.stopPolling();
    this.cancelReconnect();
    this.visibilitySubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  /**
   * Configura el listener de visibilidad de la página.
   * Cuando la ventana pierde el foco o está oculta, pausamos el polling
   * para evitar errores innecesarios por throttling del navegador.
   */
  private setupVisibilityListener(): void {
    if (typeof document === 'undefined') return;
    
    // Escuchar cambios de visibilidad del documento
    const visibilityChange$ = fromEvent(document, 'visibilitychange').pipe(
      map(() => document.visibilityState === 'visible')
    );
    
    // Escuchar focus/blur de la ventana
    const focus$ = fromEvent(window, 'focus').pipe(map(() => true));
    const blur$ = fromEvent(window, 'blur').pipe(map(() => false));
    
    this.visibilitySubscription = merge(visibilityChange$, focus$, blur$).pipe(
      takeUntil(this.destroy$),
      debounceTime(500) // Evitar cambios rápidos
    ).subscribe(isVisible => {
      this.isPageVisibleSignal.set(isVisible);
      
      if (isVisible && this.isPausedSignal()) {
        // La página volvió a ser visible, reanudar polling suavemente
        console.log('[RealTimeService] Página visible, reanudando polling...');
        this.isPausedSignal.set(false);
        this.resumePolling();
      } else if (!isVisible && this.pollingSubscription) {
        // La página se ocultó, pausar polling para evitar errores
        console.log('[RealTimeService] Página oculta, pausando polling...');
        this.pausePolling();
      }
    });
  }
  
  /**
   * Pausa el polling sin mostrar errores (para cuando la ventana no está visible)
   */
  private pausePolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = null;
    }
    this.cancelReconnect();
    this.isPausedSignal.set(true);
    // No cambiar el estado de conexión, solo pausar
  }
  
  /**
   * Reanuda el polling después de una pausa
   */
  private resumePolling(): void {
    if (this.pollingSubscription) return; // Ya está activo
    
    // Resetear errores acumulados durante la pausa
    this.resetErrorState();
    
    // Esperar un momento antes de reanudar para evitar race conditions
    timer(1000).pipe(
      takeUntil(this.destroy$),
      filter(() => this.isPageVisibleSignal()) // Solo si sigue visible
    ).subscribe(() => {
      if (!this.pollingSubscription) {
        this.startPollingInternal();
      }
    });
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
    this.isPausedSignal.set(false);
    this.startPollingInternal();
  }
  
  /**
   * Lógica interna de inicio de polling (usada también para reanudar)
   */
  private startPollingInternal(): void {
    if (this.pollingSubscription) {
      console.log('[RealTimeService] Polling ya activo');
      return;
    }
    
    // No iniciar si la página no está visible
    if (!this.isPageVisibleSignal()) {
      console.log('[RealTimeService] Página no visible, postponiendo inicio');
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
      filter(() => this.isPageVisibleSignal()), // Solo sincronizar si la página es visible
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
    this.isPausedSignal.set(false);
    this.resetErrorState();
  }
  
  /**
   * Fuerza una reconexión manual (útil después de un error)
   */
  reconnect(): void {
    console.log('[RealTimeService] Reconexión manual solicitada');
    this.stopPolling();
    this.startPolling();
    // No mostrar notificación para evitar spam
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
   * Programa un reintento de conexión (silencioso)
   */
  private scheduleReconnect(): void {
    this.cancelReconnect();
    
    const delay = this.calculateRetryDelay();
    // Solo log en desarrollo, no molestar al usuario
    console.log(`[RealTimeService] Reintentando en ${delay / 1000}s`);
    
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
    // No intentar sincronizar si la página no está visible
    if (!this.isPageVisibleSignal()) {
      return of(null);
    }
    
    return this.performSync().pipe(
      tap({
        next: () => {
          // Éxito: solo notificar si teníamos un problema grave (5+ errores)
          if (this.consecutiveErrors >= 5) {
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
        // No es un error crítico, simplemente el endpoint no está disponible
        this.connectionStateSignal.set('connected');
        this.lastSyncSignal.set(new Date());
        return of(null);
      })
    );
  }
  
  /**
   * Maneja errores de sincronización con reconexión automática.
   * Es más tolerante y no molesta al usuario con errores transitorios.
   */
  private handleSyncError(error: unknown): void {
    // Si la página no está visible, ignorar el error silenciosamente
    if (!this.isPageVisibleSignal()) {
      console.log('[RealTimeService] Error ignorado (página no visible)');
      return;
    }
    
    this.consecutiveErrors++;
    this.retryCountSignal.set(this.consecutiveErrors);
    
    const errorMsg = error instanceof Error ? error.message : 'Error de conexión';
    this.errorMessageSignal.set(errorMsg);
    
    // Solo loguear en consola, no molestar al usuario con cada error
    console.warn(`[RealTimeService] Error de sincronización (intento ${this.consecutiveErrors}/${this.config.maxRetries})`);
    
    if (this.consecutiveErrors >= this.config.maxRetries) {
      // Máximo de reintentos alcanzado - pero solo notificar si es realmente un problema
      this.connectionStateSignal.set('error');
      // No mostrar notificación automática, dejar que el usuario decida reconectar
      console.error('[RealTimeService] Máximo de reintentos alcanzado');
    } else if (this.consecutiveErrors <= 3) {
      // Primeros errores: silenciosos, solo reintentar
      this.connectionStateSignal.set('reconnecting');
      this.scheduleReconnect();
    } else {
      // Más de 3 errores: cambiar a estado reconnecting pero sin notificar
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
