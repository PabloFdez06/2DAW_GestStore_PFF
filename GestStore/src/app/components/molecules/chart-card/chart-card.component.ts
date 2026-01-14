import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../atoms/icon/icon.component';

@Component({
  selector: 'app-chart-card',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <article class="chart-card">
      <header class="chart-card__header">
        <section class="chart-card__title-section">
          <h3 class="chart-card__title">{{ title }}</h3>
          <p *ngIf="subtitle" class="chart-card__subtitle">{{ subtitle }}</p>
        </section>
        <section class="chart-card__actions">
          <button class="chart-card__action-btn" aria-label="Opciones">
            <app-icon name="more-horizontal" size="small"></app-icon>
          </button>
        </section>
      </header>
      
      <section class="chart-card__body">
        <!-- Chart placeholder - aquí se integrará la librería de gráficos -->
        <section [class]="getChartClasses()">
          <figure class="chart-card__placeholder">
            <app-icon 
              [name]="getChartIcon()" 
              size="large" 
              class="chart-card__placeholder-icon">
            </app-icon>
            <p class="chart-card__placeholder-text">
              Gráfico {{ getChartLabel() }}
            </p>
          </figure>
        </section>
      </section>

      <footer *ngIf="showFooter" class="chart-card__footer">
        <ul class="chart-card__legend">
          <li class="chart-card__legend-item">
            <span class="chart-card__legend-dot chart-card__legend-dot--primary"></span>
            <span class="chart-card__legend-label">Actual</span>
          </li>
          <li class="chart-card__legend-item">
            <span class="chart-card__legend-dot chart-card__legend-dot--secondary"></span>
            <span class="chart-card__legend-label">Anterior</span>
          </li>
        </ul>
      </footer>
    </article>
  `,
  styleUrl: './chart-card.component.scss'
})
export class ChartCardComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() chartType: 'line' | 'bar' | 'donut' | 'area' = 'line';
  @Input() showFooter: boolean = true;

  getChartClasses(): string {
    return `chart-card__chart chart-card__chart--${this.chartType}`;
  }

  getChartIcon(): string {
    const iconMap: { [key: string]: string } = {
      'line': 'trending-up',
      'bar': 'bar-chart',
      'donut': 'pie-chart',
      'area': 'activity'
    };
    return iconMap[this.chartType] || 'trending-up';
  }

  getChartLabel(): string {
    const labelMap: { [key: string]: string } = {
      'line': 'de Líneas',
      'bar': 'de Barras',
      'donut': 'Circular',
      'area': 'de Área'
    };
    return labelMap[this.chartType] || 'de Líneas';
  }
}
