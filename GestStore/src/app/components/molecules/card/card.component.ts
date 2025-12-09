import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="getCardClasses()">
      <div *ngIf="title" class="card__header">
        <h3 class="card__title">{{ title }}</h3>
      </div>
      <div class="card__body">
        <ng-content></ng-content>
      </div>
      <div *ngIf="footer" class="card__footer">
        <ng-content select="[card-footer]"></ng-content>
      </div>
    </div>
  `,
  styleUrl: './card.component.scss'
})
export class CardComponent {
  @Input() title: string = '';
  @Input() footer: boolean = false;
  @Input() hoverable: boolean = true;
  @Input() shadow: 'small' | 'medium' | 'large' = 'medium';

  getCardClasses(): string {
    return `card card--shadow-${this.shadow} ${this.hoverable ? 'card--hoverable' : ''}`;
  }
}
