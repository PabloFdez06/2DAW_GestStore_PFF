import { 
  Component, 
  inject, 
  OnInit, 
  OnDestroy,
  signal,
  computed,
  HostBinding,
  Renderer2,
  ElementRef,
  ViewChild,
  AfterViewInit
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
      #toastContainer
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
export class ToastContainerComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('toastContainer', { read: ElementRef }) containerRef!: ElementRef<HTMLDivElement>;
  
  private notificationService = inject(NotificationService);
  private renderer = inject(Renderer2);
  private subscriptions: Subscription[] = [];
  
  // Signal para IDs que están en proceso de dismissing (para animación)
  dismissingIds = signal<string[]>([]);
  
  // Computed que expone las notificaciones del servicio
  notifications = computed(() => this.notificationService.notifications());
  
  // Posición del contenedor
  position = signal<string>('top-right');
  
  ngOnInit(): void {
    const config = this.notificationService.getConfig();
    this.position.set(config.position);
  }
  
  ngAfterViewInit(): void {
    this.subscriptions.push(
      this.notificationService.notifications$.subscribe((notifications) => {
        this.updateToastElements();
      })
    );
  }
  
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.cleanupAllToasts();
  }
  
  private updateToastElements(): void {
    if (!this.containerRef) return;
    
    const currentNotifications = this.notifications();
    const container = this.containerRef.nativeElement;
    
    currentNotifications.forEach(notification => {
      const existingToast = container.querySelector(`[data-toast-id="${notification.id}"]`);
      if (!existingToast) {
        this.createToastElement(notification);
      }
    });
  }
  
  private createToastElement(notification: Notification): void {
    if (!this.containerRef) return;
    
    const toastElement = this.renderer.createElement('div');
    this.renderer.addClass(toastElement, 'toast');
    this.renderer.addClass(toastElement, `toast--${notification.type}`);
    this.renderer.setAttribute(toastElement, 'data-toast-id', notification.id);
    this.renderer.setAttribute(toastElement, 'role', 'alert');
    
    const iconElement = this.createIconElement(notification.type);
    this.renderer.appendChild(toastElement, iconElement);
    
    const contentElement = this.renderer.createElement('div');
    this.renderer.addClass(contentElement, 'toast__content');
    
    if (notification.title) {
      const titleElement = this.renderer.createElement('strong');
      this.renderer.addClass(titleElement, 'toast__title');
      const titleText = this.renderer.createText(notification.title);
      this.renderer.appendChild(titleElement, titleText);
      this.renderer.appendChild(contentElement, titleElement);
    }
    
    const messageElement = this.renderer.createElement('p');
    this.renderer.addClass(messageElement, 'toast__message');
    const messageText = this.renderer.createText(notification.message);
    this.renderer.appendChild(messageElement, messageText);
    this.renderer.appendChild(contentElement, messageElement);
    
    this.renderer.appendChild(toastElement, contentElement);
    
    if (notification.dismissible) {
      const closeButton = this.createCloseButton(notification.id);
      this.renderer.appendChild(toastElement, closeButton);
    }
    
    this.renderer.appendChild(this.containerRef.nativeElement, toastElement);
    
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.removeToastElement(notification.id);
      }, notification.duration);
    }
  }
  
  private createIconElement(type: NotificationType): HTMLElement {
    const iconContainer = this.renderer.createElement('span');
    this.renderer.addClass(iconContainer, 'toast__icon');
    this.renderer.setAttribute(iconContainer, 'aria-hidden', 'true');
    
    const svg = this.renderer.createElement('svg', 'svg');
    this.renderer.setAttribute(svg, 'viewBox', '0 0 24 24');
    this.renderer.setAttribute(svg, 'fill', 'none');
    this.renderer.setAttribute(svg, 'stroke', 'currentColor');
    
    let path: any;
    switch (type) {
      case 'success':
        path = this.renderer.createElement('path', 'svg');
        this.renderer.setAttribute(path, 'd', 'M22 11.08V12a10 10 0 1 1-5.93-9.14');
        this.renderer.setAttribute(path, 'stroke-width', '2');
        this.renderer.appendChild(svg, path);
        const polyline = this.renderer.createElement('polyline', 'svg');
        this.renderer.setAttribute(polyline, 'points', '22 4 12 14.01 9 11.01');
        this.renderer.setAttribute(polyline, 'stroke-width', '2');
        this.renderer.appendChild(svg, polyline);
        break;
      case 'error':
        const circle = this.renderer.createElement('circle', 'svg');
        this.renderer.setAttribute(circle, 'cx', '12');
        this.renderer.setAttribute(circle, 'cy', '12');
        this.renderer.setAttribute(circle, 'r', '10');
        this.renderer.setAttribute(circle, 'stroke-width', '2');
        this.renderer.appendChild(svg, circle);
        const line1 = this.renderer.createElement('line', 'svg');
        this.renderer.setAttribute(line1, 'x1', '15');
        this.renderer.setAttribute(line1, 'y1', '9');
        this.renderer.setAttribute(line1, 'x2', '9');
        this.renderer.setAttribute(line1, 'y2', '15');
        this.renderer.setAttribute(line1, 'stroke-width', '2');
        this.renderer.appendChild(svg, line1);
        const line2 = this.renderer.createElement('line', 'svg');
        this.renderer.setAttribute(line2, 'x1', '9');
        this.renderer.setAttribute(line2, 'y1', '9');
        this.renderer.setAttribute(line2, 'x2', '15');
        this.renderer.setAttribute(line2, 'y2', '15');
        this.renderer.setAttribute(line2, 'stroke-width', '2');
        this.renderer.appendChild(svg, line2);
        break;
      default:
        const defaultCircle = this.renderer.createElement('circle', 'svg');
        this.renderer.setAttribute(defaultCircle, 'cx', '12');
        this.renderer.setAttribute(defaultCircle, 'cy', '12');
        this.renderer.setAttribute(defaultCircle, 'r', '10');
        this.renderer.setAttribute(defaultCircle, 'stroke-width', '2');
        this.renderer.appendChild(svg, defaultCircle);
    }
    
    this.renderer.appendChild(iconContainer, svg);
    return iconContainer;
  }
  
  private createCloseButton(notificationId: string): HTMLElement {
    const button = this.renderer.createElement('button');
    this.renderer.addClass(button, 'toast__close');
    this.renderer.setAttribute(button, 'type', 'button');
    this.renderer.setAttribute(button, 'aria-label', 'Cerrar notificación');
    this.renderer.listen(button, 'click', () => this.dismiss(notificationId));
    
    const svg = this.renderer.createElement('svg', 'svg');
    this.renderer.setAttribute(svg, 'viewBox', '0 0 24 24');
    this.renderer.setAttribute(svg, 'fill', 'none');
    this.renderer.setAttribute(svg, 'stroke', 'currentColor');
    
    const line1 = this.renderer.createElement('line', 'svg');
    this.renderer.setAttribute(line1, 'x1', '18');
    this.renderer.setAttribute(line1, 'y1', '6');
    this.renderer.setAttribute(line1, 'x2', '6');
    this.renderer.setAttribute(line1, 'y2', '18');
    this.renderer.setAttribute(line1, 'stroke-width', '2');
    this.renderer.appendChild(svg, line1);
    
    const line2 = this.renderer.createElement('line', 'svg');
    this.renderer.setAttribute(line2, 'x1', '6');
    this.renderer.setAttribute(line2, 'y1', '6');
    this.renderer.setAttribute(line2, 'x2', '18');
    this.renderer.setAttribute(line2, 'y2', '18');
    this.renderer.setAttribute(line2, 'stroke-width', '2');
    this.renderer.appendChild(svg, line2);
    
    this.renderer.appendChild(button, svg);
    return button;
  }
  
  private removeToastElement(notificationId: string): void {
    if (!this.containerRef) return;
    
    const toastElement = this.containerRef.nativeElement.querySelector(`[data-toast-id="${notificationId}"]`);
    if (toastElement) {
      this.dismissingIds.update(ids => [...ids, notificationId]);
      this.renderer.addClass(toastElement, 'toast--dismissing');
      
      setTimeout(() => {
        if (toastElement.parentNode) {
          this.renderer.removeChild(this.containerRef.nativeElement, toastElement);
        }
        this.dismissingIds.update(ids => ids.filter(id => id !== notificationId));
      }, 300);
    }
  }
  
  private cleanupAllToasts(): void {
    if (!this.containerRef) return;
    
    const allToasts = this.containerRef.nativeElement.querySelectorAll('.toast');
    allToasts.forEach(toast => {
      if (toast.parentNode) {
        this.renderer.removeChild(this.containerRef.nativeElement, toast);
      }
    });
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
