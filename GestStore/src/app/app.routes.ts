import { Routes } from '@angular/router';
import { StyleGuideComponent } from './pages/style-guide/style-guide.component';
import { LoginFormComponent } from './components/shared/login-form/login-form.component';
import { RegisterFormComponent } from './components/shared/register-form/register-form.component';
import { ProfileFormComponent } from './components/shared/profile-form/profile-form.component';

export const routes: Routes = [
  {
    path: '',
    component: StyleGuideComponent
  },
  {
    path: 'login',
    component: LoginFormComponent
  },
  {
    path: 'register',
    component: RegisterFormComponent
  },
  {
    path: 'profile',
    component: ProfileFormComponent
  }
];
