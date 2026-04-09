import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, tap } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private api = inject(ApiService);
  
  // Використовуємо Signal для списку користувачів
  users = signal<User[]>([]);

  // Завантажити всіх з api/users
  getUsers(): Observable<User[]> {
    return this.api.get<User[]>('users').pipe(
      tap(data => {
        // Додаємо кожному користувачу масив roles, якщо його немає
        const mappedData = data.map(u => ({ ...u, roles: u.roles || ['User'] }));
        this.users.set(mappedData);
      })
    );
  }

  // Видалити користувача
  deleteUser(id: string): Observable<void> {
    return this.api.delete<void>(`users/${id}`).pipe(
      tap(() => {
        this.users.update(prev => prev.filter(u => u.id !== id));
      })
    );
  }
  toggleLock(id: string): Observable<{isLocked: boolean}> {
  return this.api.post<{isLocked: boolean}>(`users/${id}/toggle-lock`, {});
}
}