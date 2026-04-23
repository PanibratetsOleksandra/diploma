import { Routes } from '@angular/router';
import { AdminPanelComponent } from './features/admin/admin-panel/admin-panel';
import { adminGuard } from './core/guards/admin-guard';
import { ShopComponent } from './features/shop/shop';
import { ProductDetailComponent } from './features/product-detail/product-detail';
import { AiAssistantComponent } from './features/ai-assistant/ai-assistant';

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
  { path: 'shop', component: ShopComponent },
  { path: 'product/:id', component: ProductDetailComponent },
  { 
    path: 'profile', 
    loadComponent: () => import('./features/profile/profile').then(m => m.ProfileComponent) 
  },
  { path: 'ai-assistant', component: AiAssistantComponent }
];
