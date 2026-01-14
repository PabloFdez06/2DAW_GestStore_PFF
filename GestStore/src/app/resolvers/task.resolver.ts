import { inject } from '@angular/core';
import { type ResolveFn, Router } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';
import { TaskService } from '../services/task.service';
import type { Task } from '../models/task.model';

export const taskResolver: ResolveFn<Task> = (route) => {
  const router = inject(Router);
  const taskService = inject(TaskService);

  const rawId = route.paramMap.get('id');
  const id = rawId ? Number(rawId) : NaN;

  if (!Number.isFinite(id)) {
    router.navigate(['/not-found'], { replaceUrl: true });
    return EMPTY;
  }

  return taskService.getTaskById(id).pipe(
    catchError(() => {
      router.navigate(['/not-found'], { replaceUrl: true });
      return EMPTY;
    })
  );
};
