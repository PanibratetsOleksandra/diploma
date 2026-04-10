import { Routes } from '@angular/router';
import { AdminPanelComponent } from './features/admin/admin-panel/admin-panel';
import { adminGuard } from './core/guards/admin-guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/components/home/home.component')
      .then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component')
      .then(m => m.RegisterComponent)
  },
{ 
    path: 'admin', 
    component: AdminPanelComponent,
    canActivate: [adminGuard]
  },
];
