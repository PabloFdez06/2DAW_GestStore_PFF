import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'tareas-importantes',
    loadComponent: () => import('./pages/important-tasks/important-tasks.component').then(m => m.ImportantTasksComponent),
    canActivate: [authGuard]
  },
  {
    path: 'tareas',
    canActivate: [authGuard],
    loadChildren: () => import('./routes/tasks.routes').then(m => m.TASK_ROUTES)
  },
  {
    path: 'ajustes',
    loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'perfil/cambiar-contrasena',
    loadComponent: () => import('./pages/profile/update-password/update-password.component').then(m => m.UpdatePasswordComponent),
    canActivate: [authGuard]
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./components/shared/login-form/login-form.component').then(m => m.LoginFormComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./components/shared/register-form/register-form.component').then(m => m.RegisterFormComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'style-guide',
    loadComponent: () => import('./pages/style-guide/style-guide.component').then(m => m.StyleGuideComponent)
  },
  {
    path: 'not-found',
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent)
  },
  {
    path: '**',
    redirectTo: '/not-found'
  }
];
