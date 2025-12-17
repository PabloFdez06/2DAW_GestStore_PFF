import { 
  Component, 
  inject, 
  OnInit, 
  OnDestroy,
  signal,
  computed,
  HostBinding
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification, NotificationType } from '../../../services/notification.service';
import { Subscription } from 'rxjs';

/**
 * ToastComponent - Componente para mostrar notificaciones toast
 * 
 * Se suscribe al NotificationService para mostrar notificaciones
 * de forma automática cuando se emiten desde cualquier parte de la aplicación.
 * 
 * Características:
 * - Diferentes estilos según el tipo de notificación
 * - Animaciones de entrada y salida
 * - Botón de cierre opcional
 * - Barra de progreso para auto-dismiss
 * - Posicionamiento configurable
 */
@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="toast-container"
      [class]="'toast-container--' + position()"
      role="region"
      aria-label="Notificaciones"
      aria-live="polite">
      
      @for (notification of notifications(); track notification.id) {
        <div 
          class="toast"
          [class]="'toast--' + notification.type"
          [class.toast--dismissing]="dismissingIds().includes(notification.id)"
          role="alert"
          [attr.aria-labelledby]="'toast-title-' + notification.id"
          [attr.aria-describedby]="'toast-message-' + notification.id">
          
          <!-- Icono -->
          <span class="toast__icon" aria-hidden="true">
            @switch (notification.type) {
              @case ('success') {
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <polyline points="22 4 12 14.01 9 11.01" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              }
              @case ('error') {
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" stroke-width="2"/>
                  <line x1="15" y1="9" x2="9" y2="15" stroke-width="2" stroke-linecap="round"/>
                  <line x1="9" y1="9" x2="15" y2="15" stroke-width="2" stroke-linecap="round"/>
                </svg>
              }
              @case ('warning') {
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.05h16.94a2 2 0 0 0 1.71-3.05L13.71 3.86a2 2 0 0 0-3.42 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <line x1="12" y1="9" x2="12" y2="13" stroke-width="2" stroke-linecap="round"/>
                  <line x1="12" y1="17" x2="12.01" y2="17" stroke-width="2" stroke-linecap="round"/>
                </svg>
              }
              @default {
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" stroke-width="2"/>
                  <line x1="12" y1="16" x2="12" y2="12" stroke-width="2" stroke-linecap="round"/>
                  <line x1="12" y1="8" x2="12.01" y2="8" stroke-width="2" stroke-linecap="round"/>
                </svg>
              }
            }
          </span>
          
          <!-- Contenido -->
          <div class="toast__content">
            @if (notification.title) {
              <strong [id]="'toast-title-' + notification.id" class="toast__title">
                {{ notification.title }}
              </strong>
            }
            <p [id]="'toast-message-' + notification.id" class="toast__message">
              {{ notification.message }}
            </p>
            
            @if (notification.action) {
              <button 
                class="toast__action"
                (click)="onAction(notification)"
                type="button">
                {{ notification.action.label }}
              </button>
            }
          </div>
          
          <!-- Botón cerrar -->
          @if (notification.dismissible) {
            <button 
              class="toast__close"
              (click)="dismiss(notification.id)"
              type="button"
              aria-label="Cerrar notificación">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" stroke-width="2" stroke-linecap="round"/>
                <line x1="6" y1="6" x2="18" y2="18" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          }
          
          <!-- Barra de progreso -->
          @if (notification.duration && notification.duration > 0) {
            <div 
              class="toast__progress"
              [style.animation-duration.ms]="notification.duration">
            </div>
          }
        </div>
      }
    </div>
  `,
  styleUrl: './toast.component.scss'
})
export class ToastContainerComponent implements OnInit, OnDestroy {
  private notificationService = inject(NotificationService);
  private subscriptions: Subscription[] = [];
  
  // Signal para IDs que están en proceso de dismissing (para animación)
  dismissingIds = signal<string[]>([]);
  
  // Computed que expone las notificaciones del servicio
  notifications = computed(() => this.notificationService.notifications());
  
  // Posición del contenedor
  position = signal<string>('top-right');
  
  ngOnInit(): void {
    // Obtener posición de la configuración
    const config = this.notificationService.getConfig();
    this.position.set(config.position);
  }
  
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  /**
   * Inicia el proceso de dismiss con animación
   */
  dismiss(id: string): void {
    // Añadir a la lista de dismissing para la animación
    this.dismissingIds.update(ids => [...ids, id]);
    
    // Esperar a que termine la animación y luego eliminar
    setTimeout(() => {
      this.notificationService.dismiss(id);
      this.dismissingIds.update(ids => ids.filter(i => i !== id));
    }, 300);
  }
  
  /**
   * Ejecuta la acción de la notificación
   */
  onAction(notification: Notification): void {
    if (notification.action?.callback) {
      notification.action.callback();
    }
    this.dismiss(notification.id);
  }
}
