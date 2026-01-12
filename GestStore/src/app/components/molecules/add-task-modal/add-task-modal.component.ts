import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../atoms/icon/icon.component';

interface Priority {
  label: string;
  value: string;
  color: string;
}

@Component({
  selector: 'app-add-task-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './add-task-modal.component.html',
  styleUrl: './add-task-modal.component.scss'
})
export class AddTaskModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() taskAdded = new EventEmitter<any>();

  // Form data
  title: string = '';
  date: string = '';
  description: string = '';
  selectedPriority: string = '';

  priorities: Priority[] = [
    { label: 'Absoluta', value: 'absolute', color: '#F21E1E' },
    { label: 'Moderada', value: 'moderate', color: '#42ADE2' },
    { label: 'Baja', value: 'low', color: '#05A301' }
  ];

  selectPriority(priority: string) {
    this.selectedPriority = priority;
  }

  onSubmit() {
    if (!this.title || !this.date || !this.description || !this.selectedPriority) {
      return;
    }

    const newTask = {
      title: this.title,
      date: this.date,
      description: this.description,
      priority: this.selectedPriority
    };

    this.taskAdded.emit(newTask);
    this.close.emit();
  }

  onCancel() {
    this.close.emit();
  }
}
