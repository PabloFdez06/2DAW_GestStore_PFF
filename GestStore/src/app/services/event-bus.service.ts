import { Injectable, inject } from '@angular/core';
import { Subject, Observable, filter, map } from 'rxjs';

/**
 * Interfaz para los eventos del bus
 */
export interface EventBusMessage<T = unknown> {
  type: string;
  payload?: T;
  timestamp: number;
  source?: string;
}

/**
 * Tipos de eventos predefinidos del sistema
 */
export enum SystemEvents {
  // Eventos de autenticación
  USER_LOGIN = 'auth:user_login',
  USER_LOGOUT = 'auth:user_logout',
  SESSION_EXPIRED = 'auth:session_expired',
  
  // Eventos de navegación
  ROUTE_CHANGE = 'nav:route_change',
  MENU_TOGGLE = 'nav:menu_toggle',
  
  // Eventos de datos
  DATA_REFRESH = 'data:refresh',
  DATA_UPDATED = 'data:updated',
  DATA_DELETED = 'data:deleted',
  
  // Eventos de UI
  MODAL_OPEN = 'ui:modal_open',
  MODAL_CLOSE = 'ui:modal_close',
  SIDEBAR_TOGGLE = 'ui:sidebar_toggle',
  
  // Eventos de notificación
  NOTIFICATION_NEW = 'notification:new',
  NOTIFICATION_CLEAR = 'notification:clear',
  
  // Eventos de formulario
  FORM_SUBMITTED = 'form:submitted',
  FORM_RESET = 'form:reset',
  FORM_VALIDATION_ERROR = 'form:validation_error'
}

/**
 * EventBusService - Servicio de bus de eventos
 * 
 * Implementa el patrón Publish/Subscribe para permitir comunicación
 * desacoplada entre componentes hermanos o cualquier parte de la aplicación.
 * 
 * Características:
 * - Comunicación desacoplada entre componentes
 * - Tipado genérico para payloads
 * - Filtrado por tipo de evento
 * - Historial de eventos opcional
 * - Eventos con timestamp para debugging
 * 
 * Uso básico:
 * ```typescript
 * // Emitir evento
 * eventBus.emit('user:selected', { userId: 123 });
 * 
 * // Escuchar evento
 * eventBus.on<{ userId: number }>('user:selected').subscribe(event => {
 *   console.log('Usuario seleccionado:', event.payload.userId);
 * });
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class EventBusService {
  private eventSubject = new Subject<EventBusMessage>();
  
  /** Historial de eventos (para debugging) */
  private eventHistory: EventBusMessage[] = [];
  private readonly maxHistorySize = 100;
  private historyEnabled = false;
  
  /**
   * Emite un evento al bus
   * @param type - Tipo/nombre del evento
   * @param payload - Datos asociados al evento
   * @param source - Identificador opcional del emisor
   */
  emit<T = unknown>(type: string, payload?: T, source?: string): void {
    const message: EventBusMessage<T> = {
      type,
      payload,
      timestamp: Date.now(),
      source
    };
    
    if (this.historyEnabled) {
      this.addToHistory(message);
    }
    
    this.eventSubject.next(message);
  }
  
  /**
   * Escucha eventos de un tipo específico
   * @param eventType - Tipo de evento a escuchar
   * @returns Observable que emite solo los eventos del tipo especificado
   */
  on<T = unknown>(eventType: string): Observable<EventBusMessage<T>> {
    return this.eventSubject.asObservable().pipe(
      filter(event => event.type === eventType),
      map(event => event as EventBusMessage<T>)
    );
  }
  
  /**
   * Escucha eventos que coincidan con un patrón (usando prefijo)
   * @param prefix - Prefijo del tipo de evento (ej: 'auth:' para todos los eventos de auth)
   * @returns Observable que emite eventos que empiecen con el prefijo
   */
  onPrefix<T = unknown>(prefix: string): Observable<EventBusMessage<T>> {
    return this.eventSubject.asObservable().pipe(
      filter(event => event.type.startsWith(prefix)),
      map(event => event as EventBusMessage<T>)
    );
  }
  
  /**
   * Escucha todos los eventos del bus
   * @returns Observable con todos los eventos
   */
  onAll(): Observable<EventBusMessage> {
    return this.eventSubject.asObservable();
  }
  
  /**
   * Emite un evento del sistema predefinido
   * @param systemEvent - Evento del sistema
   * @param payload - Datos asociados
   */
  emitSystem<T = unknown>(systemEvent: SystemEvents, payload?: T): void {
    this.emit(systemEvent, payload, 'system');
  }
  
  /**
   * Escucha un evento del sistema predefinido
   * @param systemEvent - Evento del sistema a escuchar
   */
  onSystem<T = unknown>(systemEvent: SystemEvents): Observable<EventBusMessage<T>> {
    return this.on<T>(systemEvent);
  }
  
  // ============================================
  // Métodos de historial (para debugging)
  // ============================================
  
  /**
   * Habilita el registro de historial de eventos
   */
  enableHistory(): void {
    this.historyEnabled = true;
  }
  
  /**
   * Deshabilita el registro de historial
   */
  disableHistory(): void {
    this.historyEnabled = false;
  }
  
  /**
   * Obtiene el historial de eventos
   * @param eventType - Filtrar por tipo de evento (opcional)
   */
  getHistory(eventType?: string): EventBusMessage[] {
    if (eventType) {
      return this.eventHistory.filter(e => e.type === eventType);
    }
    return [...this.eventHistory];
  }
  
  /**
   * Limpia el historial de eventos
   */
  clearHistory(): void {
    this.eventHistory = [];
  }
  
  private addToHistory(message: EventBusMessage): void {
    this.eventHistory.push(message);
    
    // Mantener el tamaño máximo del historial
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }
}

// ============================================
// Decorador para auto-unsubscribe (helper)
// ============================================

/**
 * Helper para crear una suscripción que se auto-destruye
 * Usar con takeUntil en el componente
 */
export function createEventSubscription<T>(
  eventBus: EventBusService,
  eventType: string,
  callback: (event: EventBusMessage<T>) => void,
  destroy$: Subject<void>
): void {
  eventBus.on<T>(eventType)
    .pipe(
      filter(() => true) // placeholder para takeUntil(destroy$) en el componente
    )
    .subscribe(callback);
}
