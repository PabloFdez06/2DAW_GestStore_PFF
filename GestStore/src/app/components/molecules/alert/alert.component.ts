import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AlertType = 'success' | 'warning' | 'error' | 'info';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside [class]="getAlertClasses()" role="alert" [attr.aria-live]="type === 'error' ? 'assertive' : 'polite'">
      <span class="alert__icon" aria-hidden="true">
        <svg class="alert__icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <ng-container [ngSwitch]="type">
            <ng-container *ngSwitchCase="'success'">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="22 4 12 14.01 9 11.01" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </ng-container>
            <ng-container *ngSwitchCase="'warning'">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.05h16.94a2 2 0 0 0 1.71-3.05L13.71 3.86a2 2 0 0 0-3.42 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="12" y1="9" x2="12" y2="13" stroke-width="2" stroke-linecap="round"/>
              <line x1="12" y1="17" x2="12.01" y2="17" stroke-width="2" stroke-linecap="round"/>
            </ng-container>
            <ng-container *ngSwitchCase="'error'">
              <circle cx="12" cy="12" r="10" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="15" y1="9" x2="9" y2="15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="9" y1="9" x2="15" y2="15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </ng-container>
            <ng-container *ngSwitchDefault>
              <circle cx="12" cy="12" r="10" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="12" y1="16" x2="12" y2="12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="12" y1="8" x2="12.01" y2="8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </ng-container>
          </ng-container>
        </svg>
      </span>
      <p class="alert__content">
        <ng-content></ng-content>
      </p>
      <button 
        *ngIf="closable" 
        class="alert__close" 
        (click)="onClose()"
        type="button"
        aria-label="Cerrar alerta">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18" stroke-width="2" stroke-linecap="round"/>
          <line x1="6" y1="6" x2="18" y2="18" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </aside>
  `,
  styleUrl: './alert.component.scss'
})
export class AlertComponent {
  @Input() type: AlertType = 'info';
  @Input() closable: boolean = false;

  getAlertClasses(): string {
    return `alert alert--${this.type}`;
  }

  onClose(): void {
    // Emit close event o lógica
  }
}
