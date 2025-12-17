import { Injectable, signal, computed } from '@angular/core';
import { Subject, Observable } from 'rxjs';

/**
 * Tipos de notificación disponibles
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

/**
 * Interfaz para la configuración de una notificación
 */
export interface Notification {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    callback: () => void;
  };
}

/**
 * Configuración por defecto para las notificaciones
 */
export interface NotificationConfig {
  duration: number;
  dismissible: boolean;
  maxNotifications: number;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const DEFAULT_CONFIG: NotificationConfig = {
  duration: 5000,
  dismissible: true,
  maxNotifications: 5,
  position: 'top-right'
};

/**
 * NotificationService - Servicio centralizado para gestionar notificaciones/toasts
 * 
 * Implementa el patrón Observable/Subject para permitir que múltiples componentes
 * se suscriban a las notificaciones de forma desacoplada.
 * 
 * Características:
 * - Diferentes tipos de notificación (success, error, warning, info)
 * - Auto-dismiss configurable
 * - Límite máximo de notificaciones simultáneas
 * - API simple para mostrar notificaciones
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private config: NotificationConfig = { ...DEFAULT_CONFIG };
  
  // Subject para emitir nuevas notificaciones
  private notificationSubject = new Subject<Notification>();
  
  // Subject para emitir eliminaciones de notificaciones
  private dismissSubject = new Subject<string>();
  
  // Signal para el array de notificaciones activas
  private notificationsSignal = signal<Notification[]>([]);
  
  // Computed para exponer las notificaciones como readonly
  readonly notifications = computed(() => this.notificationsSignal());
  
  // Observable público para suscribirse a nuevas notificaciones
  readonly notification$: Observable<Notification> = this.notificationSubject.asObservable();
  
  // Observable público para suscribirse a eliminaciones
  readonly dismiss$: Observable<string> = this.dismissSubject.asObservable();

  constructor() {
    // Suscribirse internamente para gestionar el array de notificaciones
    this.notificationSubject.subscribe(notification => {
      this.addNotification(notification);
    });
    
    this.dismissSubject.subscribe(id => {
      this.removeNotification(id);
    });
  }

  /**
   * Configura las opciones globales del servicio
   */
  configure(config: Partial<NotificationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Obtiene la configuración actual
   */
  getConfig(): NotificationConfig {
    return { ...this.config };
  }

  /**
   * Muestra una notificación de éxito
   */
  success(message: string, title?: string, options?: Partial<Notification>): string {
    return this.show({
      type: 'success',
      message,
      title: title || 'Éxito',
      ...options
    });
  }

  /**
   * Muestra una notificación de error
   */
  error(message: string, title?: string, options?: Partial<Notification>): string {
    return this.show({
      type: 'error',
      message,
      title: title || 'Error',
      duration: options?.duration ?? 0, // Los errores no se auto-cierran por defecto
      ...options
    });
  }

  /**
   * Muestra una notificación de advertencia
   */
  warning(message: string, title?: string, options?: Partial<Notification>): string {
    return this.show({
      type: 'warning',
      message,
      title: title || 'Advertencia',
      ...options
    });
  }

  /**
   * Muestra una notificación informativa
   */
  info(message: string, title?: string, options?: Partial<Notification>): string {
    return this.show({
      type: 'info',
      message,
      title: title || 'Información',
      ...options
    });
  }

  /**
   * Muestra una notificación personalizada
   */
  show(notification: Omit<Notification, 'id'>): string {
    const id = this.generateId();
    const fullNotification: Notification = {
      id,
      duration: this.config.duration,
      dismissible: this.config.dismissible,
      ...notification
    };
    
    this.notificationSubject.next(fullNotification);
    return id;
  }

  /**
   * Elimina una notificación por ID
   */
  dismiss(id: string): void {
    this.dismissSubject.next(id);
  }

  /**
   * Elimina todas las notificaciones
   */
  dismissAll(): void {
    const currentNotifications = this.notificationsSignal();
    currentNotifications.forEach(n => this.dismiss(n.id));
  }

  /**
   * Añade una notificación al array interno
   */
  private addNotification(notification: Notification): void {
    this.notificationsSignal.update(notifications => {
      // Limitar el número máximo de notificaciones
      let updated = [...notifications, notification];
      if (updated.length > this.config.maxNotifications) {
        updated = updated.slice(updated.length - this.config.maxNotifications);
      }
      return updated;
    });

    // Auto-dismiss si tiene duración configurada
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.dismiss(notification.id);
      }, notification.duration);
    }
  }

  /**
   * Elimina una notificación del array interno
   */
  private removeNotification(id: string): void {
    this.notificationsSignal.update(notifications => 
      notifications.filter(n => n.id !== id)
    );
  }

  /**
   * Genera un ID único para la notificación
   */
  private generateId(): string {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
