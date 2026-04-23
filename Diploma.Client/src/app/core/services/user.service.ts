import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, tap } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private api = inject(ApiService);
  
  // Існуючий сигнал для списку (адмінка)
  users = signal<User[]>([]);
  
  // НОВИЙ сигнал для поточного користувача (кабінет)
  currentUser = signal<User | null>(null);

  // --- МЕТОДИ ДЛЯ КАБІНЕТУ (НОВІ) ---

  // Отримати дані саме того, хто залогінений
getProfile(): Observable<User> {
  return this.api.get<User>('users/profile').pipe(
    tap(user => {
      // Створюємо об'єкт користувача з усіма полями
      const mappedUser: User = { 
        ...user, 
        roles: user.roles || ['User'],
        // Якщо раптом firstName порожній, можемо взяти UserName
        firstName: user.firstName || user.userName 
      };
      this.currentUser.set(mappedUser);
    })
  );
}

  // --- МЕТОДИ ДЛЯ АДМІНКИ (ІСНУЮЧІ) ---

  getUsers(): Observable<User[]> {
    return this.api.get<User[]>('users').pipe(
      tap(data => {
        const mappedData = data.map(u => ({ ...u, roles: u.roles || ['User'] }));
        this.users.set(mappedData);
      })
    );
  }

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

// updateProfile(userData: User): Observable<User> {
//   return this.api.put<User>('users/profile', userData).pipe(
//     tap(updatedUser => {
//       this.currentUser.set(updatedUser); // Відразу оновлюємо дані в інтерфейсі
//     })
//   );
// }

updateProfile(formData: FormData): Observable<any> {
  return this.api.put<any>('users/profile', formData);
}
// src/app/core/services/user.service.ts

getAddresses(): Observable<any[]> {
  return this.api.get<any[]>('addresses');
}

addAddress(address: any): Observable<any> {
  return this.api.post<any>('addresses', address);
}

deleteAddress(id: number): Observable<void> {
  return this.api.delete<void>(`addresses/${id}`);
}
}