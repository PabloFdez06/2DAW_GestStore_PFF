import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type TaskStatus = 'completed' | 'pending' | 'in-progress' | 'cancelled';

export interface Task {
  id: string | number;
  title: string;
  description: string;
  status: TaskStatus;
  completedAt?: Date;
  imageUrl?: string;
}

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="task-card" [class.task-card--hoverable]="hoverable">
      <!-- Contenido principal -->
      <div class="task-card__content">
        <!-- Icono de estado -->
        <div class="task-card__status-icon" [class]="'task-card__status-icon--' + status">
          <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="6" cy="6" r="5" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        
        <!-- Información de la tarea -->
        <div class="task-card__info">
          <h3 class="task-card__title">{{ title }}</h3>
          <p class="task-card__description">{{ description }}</p>
          <p class="task-card__status-text">
            Estatus: <span [class]="'task-card__status-value--' + status">{{ getStatusLabel() }}</span>
          </p>
          <p class="task-card__timestamp">{{ getTimestamp() }}</p>
        </div>
      </div>

      <!-- Thumbnail -->
      <div class="task-card__thumbnail" *ngIf="imageUrl">
        <img [src]="imageUrl" [alt]="title" class="task-card__image" />
      </div>
      <div class="task-card__thumbnail task-card__thumbnail--placeholder" *ngIf="!imageUrl"></div>

      <!-- Menú de opciones -->
      <button 
        class="task-card__menu" 
        (click)="onMenuClick($event)"
        aria-label="Opciones de tarea"
        type="button">
        <svg viewBox="0 0 16 4" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <circle cx="2" cy="2" r="1.5"/>
          <circle cx="8" cy="2" r="1.5"/>
          <circle cx="14" cy="2" r="1.5"/>
        </svg>
      </button>
    </article>
  `,
  styleUrl: './task-card.component.scss'
})
export class TaskCardComponent {
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() status: TaskStatus = 'pending';
  @Input() completedAt?: Date;
  @Input() imageUrl?: string;
  @Input() hoverable: boolean = true;

  @Output() menuClick = new EventEmitter<void>();

  getStatusLabel(): string {
    const labels: Record<TaskStatus, string> = {
      'completed': 'Completada',
      'pending': 'Pendiente',
      'in-progress': 'En progreso',
      'cancelled': 'Cancelada'
    };
    return labels[this.status];
  }

  getTimestamp(): string {
    if (!this.completedAt) {
      return '';
    }
    
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.completedAt.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `${this.getStatusAction()} hoy.`;
    } else if (diffDays === 1) {
      return `${this.getStatusAction()} hace 1 día.`;
    } else {
      return `${this.getStatusAction()} hace ${diffDays} días.`;
    }
  }

  private getStatusAction(): string {
    const actions: Record<TaskStatus, string> = {
      'completed': 'Completada',
      'pending': 'Creada',
      'in-progress': 'Actualizada',
      'cancelled': 'Cancelada'
    };
    return actions[this.status];
  }

  onMenuClick(event: Event): void {
    event.stopPropagation();
    this.menuClick.emit();
  }
}
