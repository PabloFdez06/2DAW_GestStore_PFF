import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../atoms/icon/icon.component';

export type StatCardColor = 'primary' | 'success' | 'warning' | 'info' | 'error';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <article [class]="getCardClasses()">
      <span class="stat-card__icon-wrapper" [class]="'stat-card__icon-wrapper--' + bgColor">
        <app-icon [name]="icon" size="medium" class="stat-card__icon"></app-icon>
      </span>
      <section class="stat-card__content">
        <h3 class="stat-card__title">{{ title }}</h3>
        <p class="stat-card__value">{{ value }}</p>
        <p class="stat-card__trend" [class]="getTrendClasses()">
          <app-icon 
            [name]="trendType === 'positive' ? 'trending-up' : 'trending-down'" 
            size="small">
          </app-icon>
          <span>{{ trend }}</span>
          <span class="stat-card__trend-label">vs último mes</span>
        </p>
      </section>
    </article>
  `,
  styleUrl: './stat-card.component.scss'
})
export class StatCardComponent {
  @Input() title: string = '';
  @Input() value: string = '';
  @Input() icon: string = 'trending-up';
  @Input() trend: string = '';
  @Input() trendType: 'positive' | 'negative' | 'neutral' = 'neutral';
  @Input() bgColor: StatCardColor = 'primary';
  @Input() hoverable: boolean = true;

  getCardClasses(): string {
    return `stat-card ${this.hoverable ? 'stat-card--hoverable' : ''}`;
  }

  getTrendClasses(): string {
    return `stat-card__trend stat-card__trend--${this.trendType}`;
  }
}
