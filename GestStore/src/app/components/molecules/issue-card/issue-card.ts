import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Issue, IssueSeverity } from '../../../models/issue.model';

/**
 * Componente Issue Card - Molécula del sistema de diseño
 * 
 * Este componente muestra una tarjeta con los datos de una incidencia reportada.
 * Lo he creado como componente standalone siguiendo el patrón de Atomic Design
 * del proyecto. Muestra el título, descripción, severidad y metadatos.
 * 
 * El color de la card y el badge de severidad cambian según el nivel de urgencia:
 * - HIGH: rojo (critical)
 * - MEDIUM: azul (normal)  
 * - LOW: verde (bajo impacto)
 */
@Component({
  selector: 'app-issue-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './issue-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IssueCardComponent {
  @Input() issue!: Issue;
  @Input() clickable: boolean = false;

  /**
   * Retorna las clases CSS para el contenedor principal
   */
  getCardClasses(): string {
    const classes = [
      'issue-card',
      this.clickable ? 'issue-card--clickable' : ''
    ].filter(c => c);
    return classes.join(' ');
  }

  /**
   * Retorna las clases para el badge de severidad
   */
  getSeverityClasses(): string {
    return `issue-card__severity issue-card__severity--${this.issue.severity.toLowerCase()}`;
  }

  /**
   * Retorna el texto legible para la severidad
   */
  getSeverityLabel(): string {
    const labels: Record<IssueSeverity, string> = {
      [IssueSeverity.HIGH]: 'Urgente',
      [IssueSeverity.MEDIUM]: 'Media',
      [IssueSeverity.LOW]: 'Baja'
    };
    return labels[this.issue.severity];
  }

  /**
   * Formatea la fecha de creación a un formato legible
   */
  getFormattedDate(): string {
    const date = new Date(this.issue.createdAt);
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  }
}