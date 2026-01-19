import { Injectable, signal, computed } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSignal = signal<Notification[]>([]);
  private nextId = 0;

  notifications = computed(() => this.notificationsSignal());

  /**
   * Muestra una notificación
   */
  show(message: string, type: NotificationType = 'info', duration: number = 4000): void {
    const id = this.nextId++;
    const notification: Notification = { id, type, message, duration };
    
    this.notificationsSignal.update(notifications => [...notifications, notification]);

    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
  }

  /**
   * Muestra una notificación de éxito
   */
  success(message: string, duration: number = 4000): void {
    this.show(message, 'success', duration);
  }

  /**
   * Muestra una notificación de error
   */
  error(message: string, duration: number = 5000): void {
    this.show(message, 'error', duration);
  }

  /**
   * Muestra una notificación de advertencia
   */
  warning(message: string, duration: number = 4500): void {
    this.show(message, 'warning', duration);
  }

  /**
   * Muestra una notificación informativa
   */
  info(message: string, duration: number = 4000): void {
    this.show(message, 'info', duration);
  }

  /**
   * Cierra una notificación
   */
  dismiss(id: number): void {
    this.notificationsSignal.update(notifications => 
      notifications.filter(n => n.id !== id)
    );
  }

  /**
   * Cierra todas las notificaciones
   */
  dismissAll(): void {
    this.notificationsSignal.set([]);
  }
}
