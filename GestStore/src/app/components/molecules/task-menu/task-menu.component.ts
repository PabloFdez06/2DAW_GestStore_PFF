import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TaskMenuAction {
  type: 'important' | 'edit' | 'delete' | 'complete';
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
  @Output() action = new EventEmitter<TaskMenuAction>();

  onToggleImportant() {
    this.action.emit({ type: 'important' });
  }

  onEdit() {
    this.action.emit({ type: 'edit' });
  }

  onDelete() {
    this.action.emit({ type: 'delete' });
  }

  onComplete() {
    this.action.emit({ type: 'complete' });
  }
}
