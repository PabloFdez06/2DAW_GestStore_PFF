import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../atoms/icon/icon.component';

export type StatCardColor = 'primary' | 'success' | 'warning' | 'info' | 'error';
export type StatCardVariant = 'default' | 'simple';
export type StatCardIndicator = 'none' | 'warning' | 'danger' | 'success';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatCardComponent {
  @Input() title: string = '';
  @Input() value: string | number = '';
  @Input() icon: string = 'trending-up';
  @Input() trend: string = '';
  @Input() trendType: 'positive' | 'negative' | 'neutral' = 'neutral';
  @Input() bgColor: StatCardColor = 'primary';
  @Input() hoverable: boolean = true;
  @Input() variant: StatCardVariant = 'default';
  @Input() indicator: StatCardIndicator = 'none';

  getCardClasses(): string {
    const classes = [
      'stat-card',
      this.hoverable ? 'stat-card--hoverable' : '',
      `stat-card--${this.variant}`
    ].filter(c => c);
    return classes.join(' ');
  }

  getTrendClasses(): string {
    return `stat-card__trend stat-card__trend--${this.trendType}`;
  }

  getIndicatorClasses(): string {
    return `stat-card__indicator stat-card__indicator--${this.indicator}`;
  }
}
