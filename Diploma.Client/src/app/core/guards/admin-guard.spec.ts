import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Перевіряємо, чи залогінений користувач і чи має він роль Admin
  if (authService.currentUser()?.roles.includes('Admin')) {
    return true;
  }

  // Якщо ні — викидаємо на головну або сторінку входу
  router.navigate(['/login']);
  return false;
};