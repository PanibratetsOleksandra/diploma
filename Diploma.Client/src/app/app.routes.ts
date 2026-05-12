import { Routes } from '@angular/router';
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
    path: 'profile', 
    loadComponent: () => import('./features/profile/profile')
      .then(m => m.ProfileComponent) 
  },

  { 
    path: 'admin', 
    loadComponent: () => import('./features/admin/admin-panel/admin-panel')
      .then(m => m.AdminPanelComponent),
    canActivate: [adminGuard]
  },

  { 
    path: 'shop', 
    loadComponent: () => import('./features/shop/shop')
      .then(m => m.ShopComponent) 
  },
  { 
    path: 'product/:id', 
    loadComponent: () => import('./features/product-detail/product-detail')
      .then(m => m.ProductDetailComponent) 
  },

  {
    path: 'designer',
    loadComponent: () => import('./features/designer/designer')
      .then(m => m.DesignerComponent)
  },
  { 
    path: 'ai-assistant', 
    loadComponent: () => import('./features/ai-assistant/ai-assistant')
      .then(m => m.AiAssistantComponent) 
  },

  { 
    path: 'cart', 
    loadComponent: () => import('./features/cart/cart')
      .then(m => m.CartComponent) 
  },
  { 
    path: 'checkout', 
    loadComponent: () => import('./features/checkout/checkout')
      .then(m => m.CheckoutComponent) 
  },
  { 
    path: 'custom-detail/:id', 
    loadComponent: () => import('./features/custom-detail/custom-detail')
      .then(m => m.CustomDetailComponent) 
  },

  { 
    path: 'blog', 
    loadComponent: () => import('./features/blog/blog')
      .then(m => m.BlogComponent) 
  },
  { 
    path: 'blog/:id', 
    loadComponent: () => import('./features/blog/blog-detail')
      .then(m => m.BlogDetailComponent) 
  },

  {
    path: '**',
    redirectTo: ''
  }
];