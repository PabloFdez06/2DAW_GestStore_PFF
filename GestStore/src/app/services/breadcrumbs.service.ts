import { Injectable, signal } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import type { Task } from '../models/task.model';

export interface Breadcrumb {
  label: string;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbsService {
  readonly breadcrumbs = signal<Breadcrumb[]>([]);

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        const root = this.router.routerState.snapshot.root;
        this.breadcrumbs.set(this.build(root));
      });

    const root = this.router.routerState.snapshot.root;
    this.breadcrumbs.set(this.build(root));
  }

  private build(route: ActivatedRouteSnapshot, url = ''): Breadcrumb[] {
    const path = route.url.map(s => s.path).join('/');
    const nextUrl = path ? `${url}/${path}` : url;

    const current = this.breadcrumbFrom(route, nextUrl);

    const children = route.children.flatMap(child => this.build(child, nextUrl));

    return current ? [current, ...children] : children;
  }

  private breadcrumbFrom(route: ActivatedRouteSnapshot, url: string): Breadcrumb | null {
    const rawLabel = route.data?.['breadcrumb'] as string | undefined;

    if (!rawLabel) {
      return null;
    }

    if (route.data?.['task']) {
      const task = route.data['task'] as Task;
      if (task?.title) {
        if (rawLabel === 'Editar') {
          return { label: `Editar: ${task.title}`, url: url || '/' };
        }
        return { label: task.title, url: url || '/' };
      }
    }

    if (rawLabel === 'Detalle') {
      const id = route.paramMap.get('id');
      if (id) {
        return { label: `Tarea #${id}`, url: url || '/' };
      }
    }

    return { label: rawLabel, url: url || '/' };
  }
}
