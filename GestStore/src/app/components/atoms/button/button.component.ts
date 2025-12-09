import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'success' | 'warning';
export type ButtonSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      [class]="getButtonClasses()"
      [disabled]="disabled"
      (click)="onClick()">
      <ng-content></ng-content>
    </button>
  `,
  styleUrl: './button.component.scss'
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'medium';
  @Input() disabled: boolean = false;
  @Input() fullWidth: boolean = false;

  getButtonClasses(): string {
    return `button button--${this.variant} button--${this.size} ${this.fullWidth ? 'button--full-width' : ''}`;
  }

  onClick(): void {
    // Emit event o lógica personalizada
  }
}
