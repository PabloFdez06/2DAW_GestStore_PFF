import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="getBadgeClasses()">
      <ng-content></ng-content>
    </span>
  `,
  styleUrl: './badge.component.scss'
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'primary';
  @Input() size: 'small' | 'medium' = 'small';

  getBadgeClasses(): string {
    return `badge badge--${this.variant} badge--${this.size}`;
  }
}
