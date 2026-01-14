import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { BreadcrumbsComponent } from '../../components/layout/breadcrumbs/breadcrumbs.component';
import { FormInputComponent } from '../../components/shared/form-input/form-input.component';
import { FormTextareaComponent } from '../../components/shared/form-textarea/form-textarea.component';
import { FormSelectComponent, type SelectOption } from '../../components/shared/form-select/form-select.component';

import { TaskService } from '../../services/task.service';
import { CanComponentDeactivate } from '../../guards/pending-changes.guard';
import { TaskPriority, TaskStatus, type Task, type TaskRequest } from '../../models/task.model';

@Component({
  selector: 'app-task-edit',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    BreadcrumbsComponent,
    FormInputComponent,
    FormTextareaComponent,
    FormSelectComponent
  ],
  templateUrl: './task-edit.component.html',
  styleUrl: './task-edit.component.scss'
})
export class TaskEditComponent implements OnInit, CanComponentDeactivate {
  task!: Task;

  model: TaskRequest = {
    title: '',
    description: '',
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    dueDate: '',
    notes: '',
    important: false
  };

  statusOptions: SelectOption[] = [
    { value: TaskStatus.PENDING, label: 'Pendiente' },
    { value: TaskStatus.IN_PROGRESS, label: 'En progreso' },
    { value: TaskStatus.COMPLETED, label: 'Completada' },
    { value: TaskStatus.CANCELLED, label: 'Cancelada' }
  ];

  priorityOptions: SelectOption[] = [
    { value: TaskPriority.LOW, label: 'Baja' },
    { value: TaskPriority.MEDIUM, label: 'Media' },
    { value: TaskPriority.HIGH, label: 'Alta' }
  ];

  isSaving = false;
  errorMessage = '';

  private initialSnapshot = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    this.task = this.route.snapshot.data['task'] as Task;

    this.model = {
      title: this.task.title ?? '',
      description: this.task.description ?? '',
      status: this.task.status,
      priority: this.task.priority,
      dueDate: this.toDateInputValue(this.task.dueDate),
      notes: this.task.notes ?? '',
      important: this.task.important ?? false
    };

    this.initialSnapshot = JSON.stringify(this.model);
  }

  onStatusChange(value: string | number): void {
    this.model.status = value as TaskStatus;
  }

  onPriorityChange(value: string | number): void {
    this.model.priority = value as TaskPriority;
  }

  canDeactivate(): boolean {
    if (!this.isDirty()) return true;
    return confirm('Tienes cambios sin guardar. ¿Seguro que quieres salir?');
  }

  isDirty(): boolean {
    return JSON.stringify(this.model) !== this.initialSnapshot;
  }

  save(): void {
    if (this.isSaving) return;

    this.errorMessage = '';

    if (!this.model.title?.trim()) {
      this.errorMessage = 'El título es obligatorio.';
      return;
    }

    this.isSaving = true;

    const payload: TaskRequest = {
      ...this.model,
      title: this.model.title.trim(),
      description: (this.model.description ?? '').trim(),
      dueDate: this.model.dueDate || undefined,
      notes: this.model.notes?.trim() || undefined
    };

    this.taskService.updateTask(this.task.id, payload).subscribe({
      next: (updated: Task) => {
        this.isSaving = false;
        this.initialSnapshot = JSON.stringify({
          ...payload,
          dueDate: this.toDateInputValue(updated.dueDate)
        });

        const q = this.route.snapshot.queryParamMap.get('q');
        this.router.navigate(['/tareas', updated.id], {
          queryParams: q ? { q } : {},
          fragment: 'detalle'
        });
      },
      error: () => {
        this.isSaving = false;
        this.errorMessage = 'No se pudo guardar la tarea. Inténtalo de nuevo.';
      }
    });
  }

  cancel(): void {
    const q = this.route.snapshot.queryParamMap.get('q');
    this.router.navigate(['/tareas', this.task.id], {
      queryParams: q ? { q } : {},
      fragment: 'detalle'
    });
  }

  private toDateInputValue(value?: string): string {
    if (!value) return '';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      const match = String(value).match(/^\d{4}-\d{2}-\d{2}/);
      return match ? match[0] : '';
    }

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
