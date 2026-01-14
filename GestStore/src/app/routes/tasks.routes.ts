import { Routes } from '@angular/router';
import { pendingChangesGuard } from '../guards/pending-changes.guard';
import { taskResolver } from '../resolvers/task.resolver';

export const TASK_ROUTES: Routes = [
  {
    path: '',
    data: { breadcrumb: 'Tareas' },
    loadComponent: () => import('../pages/tasks/tasks.component').then(m => m.TasksComponent)
  },
  {
    path: ':id/editar',
    resolve: { task: taskResolver },
    canDeactivate: [pendingChangesGuard],
    data: { breadcrumb: 'Editar' },
    loadComponent: () => import('../pages/task-edit/task-edit.component').then(m => m.TaskEditComponent)
  },
  {
    path: ':id',
    resolve: { task: taskResolver },
    data: { breadcrumb: 'Detalle' },
    loadComponent: () => import('../pages/task-detail/task-detail.component').then(m => m.TaskDetailComponent)
  }
];
