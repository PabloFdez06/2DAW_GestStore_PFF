import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../atoms/icon/icon.component';

export type TaskCardStatus = 'COMPLETED' | 'PENDING' | 'IN_PROGRESS' | 'CANCELLED' | 'NOT_STARTED';
export type TaskCardPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type TaskCardVariant = 'default' | 'grid' | 'compact';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskCardComponent {
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() status: TaskCardStatus = 'PENDING';
  @Input() priority: TaskCardPriority = 'MEDIUM';
  @Input() imageUrl?: string;
  @Input() important: boolean = false;
  @Input() createdAt?: Date | string;
  @Input() completedAt?: Date | string;
  @Input() variant: TaskCardVariant = 'default';
  @Input() showMenu: boolean = true;
  @Input() isMenuOpen: boolean = false;

  @Output() cardClick = new EventEmitter<void>();
  @Output() menuClick = new EventEmitter<MouseEvent>();
  @Output() menuToggle = new EventEmitter<MouseEvent>();

  onCardClick(): void {
    this.cardClick.emit();
  }

  onMenuToggle(event: MouseEvent): void {
    event.stopPropagation();
    this.menuToggle.emit(event);
  }

  onMenuClick(event: MouseEvent): void {
    event.stopPropagation();
    this.menuClick.emit(event);
  }

  getStatusLabel(): string {
    const labels: Record<TaskCardStatus, string> = {
      'COMPLETED': 'Completada',
      'PENDING': 'Pendiente',
      'IN_PROGRESS': 'En progreso',
      'CANCELLED': 'Cancelada',
      'NOT_STARTED': 'Sin comenzar'
    };
    return labels[this.status] || 'Pendiente';
  }

  getPriorityLabel(): string {
    const labels: Record<TaskCardPriority, string> = {
      'HIGH': 'Alta',
      'MEDIUM': 'Media',
      'LOW': 'Baja'
    };
    return labels[this.priority] || 'Media';
  }

  getPriorityClass(): string {
    return this.priority?.toLowerCase() || 'medium';
  }

  getStatusClass(): string {
    const statusMap: Record<TaskCardStatus, string> = {
      'COMPLETED': 'completed',
      'PENDING': 'pending',
      'IN_PROGRESS': 'inprogress',
      'CANCELLED': 'cancelled',
      'NOT_STARTED': 'notstarted'
    };
    return statusMap[this.status] || 'pending';
  }

  formatDate(date?: Date | string): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  getCompletedAgo(): string {
    if (!this.completedAt) return '';
    
    const date = typeof this.completedAt === 'string' ? new Date(this.completedAt) : this.completedAt;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'hoy';
    if (diffDays === 1) return '1 día';
    return `${diffDays} días`;
  }
}
