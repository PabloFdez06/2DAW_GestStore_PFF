import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TaskMenuAction {
  type: 'important' | 'edit' | 'delete' | 'complete' | 'start';
}

@Component({
  selector: 'app-task-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-menu.component.html',
  styleUrl: './task-menu.component.scss'
})
export class TaskMenuComponent {
  @Input() isImportant: boolean = false;
  @Input() status: string = '';
  @Output() action = new EventEmitter<TaskMenuAction>();

  onStart(event: Event) {
    event.stopPropagation();
    this.action.emit({ type: 'start' });
  }

  onToggleImportant(event: Event) {
    event.stopPropagation();
    this.action.emit({ type: 'important' });
  }

  onEdit(event: Event) {
    event.stopPropagation();
    this.action.emit({ type: 'edit' });
  }

  onDelete(event: Event) {
    event.stopPropagation();
    this.action.emit({ type: 'delete' });
  }

  onComplete(event: Event) {
    event.stopPropagation();
    this.action.emit({ type: 'complete' });
  }
}
