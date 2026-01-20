import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="getSpinnerClasses()" [attr.aria-label]="ariaLabel"></div>
  `,
  styles: [`
    @use '../../../../styles/00-settings/variables' as *;

    .spinner {
      display: inline-block;
      border: 4px solid rgba($color-primary, 0.1);
      border-top-color: $color-primary;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .spinner--light {
      border-color: rgba(255, 255, 255, 0.3);
      border-top-color: #ffffff;
    }

    .spinner-small {
      width: 20px;
      height: 20px;
      border-width: 2px;
    }

    .spinner-medium {
      width: 40px;
      height: 40px;
      border-width: 4px;
    }

    .spinner-large {
      width: 60px;
      height: 60px;
      border-width: 6px;
    }

    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  `]
})
export class SpinnerComponent {
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() variant: 'default' | 'light' = 'default';
  @Input() ariaLabel: string = 'Cargando...';

  getSpinnerClasses(): string {
    const classes = ['spinner', `spinner-${this.size}`];
    if (this.variant === 'light') {
      classes.push('spinner--light');
    }
    return classes.join(' ');
  }
}
