import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'success' | 'warning' | 'info' | 'error';
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
  @Input() active: boolean = false;

  getButtonClasses(): string {
    const classes = [
      'button',
      `button--${this.variant}`,
      `button--${this.size}`,
      this.fullWidth ? 'button--full-width' : '',
      this.active ? 'button--active' : ''
    ].filter(c => c);
    return classes.join(' ');
  }

  onClick(): void {
    // Emit event o lógica personalizada
  }
}
