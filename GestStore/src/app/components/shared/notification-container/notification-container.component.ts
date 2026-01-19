import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../services/notification.service';
import { AlertComponent } from '../../molecules/alert/alert.component';

@Component({
  selector: 'app-notification-container',
  standalone: true,
  imports: [CommonModule, AlertComponent],
  template: `
    <aside class="notification-container" aria-live="polite" aria-label="Notificaciones">
      @for (notification of notificationService.notifications(); track notification.id) {
        <app-alert 
          [type]="notification.type" 
          [closable]="true"
          (close)="notificationService.dismiss(notification.id)"
          class="notification-container__item">
          {{ notification.message }}
        </app-alert>
      }
    </aside>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 999999;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-width: 400px;
      width: 100%;
      pointer-events: none;

      @media (max-width: 480px) {
        right: 0.5rem;
        left: 0.5rem;
        max-width: calc(100% - 1rem);
      }
    }

    .notification-container__item {
      pointer-events: auto;
      animation: slideIn 0.3s ease-out;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25), 0 2px 8px rgba(0, 0, 0, 0.15);
      border: 1px solid rgba(0, 0, 0, 0.1);
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `]
})
export class NotificationContainerComponent {
  notificationService = inject(NotificationService);
}
