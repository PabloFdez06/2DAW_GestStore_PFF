import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { Task, TaskStatus, TaskPriority } from '../../models/task.model';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './task-detail.component.html',
  styleUrl: './task-detail.component.scss'
})
export class TaskDetailComponent implements OnInit {
  task!: Task;
  isLoadingAction = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    this.task = this.route.snapshot.data['task'] as Task;
  }

  backToList(): void {
    const q = this.route.snapshot.queryParamMap.get('q');
    this.router.navigate(['/tareas'], {
      queryParams: q ? { q } : {},
      fragment: 'lista'
    });
  }

  edit(): void {
    const q = this.route.snapshot.queryParamMap.get('q');
    this.router.navigate(['/tareas', this.task.id, 'editar'], {
      queryParams: q ? { q } : {}
    });
  }

  start(): void {
    this.runAction(() => this.taskService.startTask(this.task.id));
  }

  complete(): void {
    this.runAction(() => this.taskService.completeTask(this.task.id));
  }

  cancel(): void {
    this.runAction(() => this.taskService.cancelTask(this.task.id));
  }

  private runAction(request: () => any): void {
    if (this.isLoadingAction) return;

    this.isLoadingAction = true;

    request().subscribe({
      next: (updated: Task) => {
        this.task = updated;
        this.isLoadingAction = false;
      },
      error: () => {
        this.isLoadingAction = false;
      }
    });
  }

  getPriorityLabel(priority: TaskPriority | string): string {
    const labels: Record<string, string> = {
      LOW: 'Baja',
      MEDIUM: 'Moderada',
      HIGH: 'Alta'
    };
    return labels[priority] ?? priority;
  }

  getStatusLabel(status: TaskStatus | string): string {
    const labels: Record<string, string> = {
      PENDING: 'Sin Comenzar',
      IN_PROGRESS: 'En Progreso',
      COMPLETED: 'Completada',
      CANCELLED: 'Cancelada'
    };
    return labels[status] ?? status;
  }
}
