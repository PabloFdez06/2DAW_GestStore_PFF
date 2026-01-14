import { inject } from '@angular/core';
import { type ResolveFn, Router } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';
import { TaskService } from '../services/task.service';
import type { Task } from '../models/task.model';

export const taskResolver: ResolveFn<Task> = (route) => {
  const router = inject(Router);
  const taskService = inject(TaskService);

  const rawId = route.paramMap.get('id');

  if (!rawId || rawId.trim().length === 0) {
    router.navigate(['/not-found'], { replaceUrl: true });
    return EMPTY;
  }

  return taskService.getTaskById(rawId).pipe(
    catchError(() => {
      router.navigate(['/not-found'], { replaceUrl: true });
      return EMPTY;
    })
  );
};
