import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg [class]="getIconClasses()" [attr.viewBox]="viewBox">
      <use [attr.href]="'#' + name"></use>
    </svg>
  `,
  styleUrl: './icon.component.scss'
})
export class IconComponent {
  @Input() name: string = 'default';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() color: string = 'currentColor';
  @Input() viewBox: string = '0 0 24 24';

  getIconClasses(): string {
    return `icon icon--${this.size}`;
  }
}
