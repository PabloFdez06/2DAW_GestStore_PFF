import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type TagVariant = 'default' | 'primary' | 'success' | 'warning' | 'error';

@Component({
  selector: 'app-tag',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="getTagClasses()">
      <ng-content></ng-content>
    </span>
  `,
  styleUrl: './tag.component.scss'
})
export class TagComponent {
  @Input() variant: TagVariant = 'default';
  @Input() removable: boolean = false;

  getTagClasses(): string {
    return `tag tag--${this.variant} ${this.removable ? 'tag--removable' : ''}`;
  }

  onRemove(): void {
    // Emit remove event
  }
}
