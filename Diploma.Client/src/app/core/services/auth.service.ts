// // src/app/core/services/auth.service.ts
// import { inject, Injectable, signal } from '@angular/core';
// import { Observable, tap } from 'rxjs';
// import { ApiService } from './api.service'; // Импортируем базовый сервис
// import { AuthResponse, LoginRequest } from '../models/auth.model';
// import { jwtDecode } from 'jwt-decode';
// @Injectable({ providedIn: 'root' })
// export class AuthService {
//   private api = inject(ApiService); // Внедряем базовый сервис
  
//   // Состояние токена (Signal)
//   currentUserToken = signal<string | null>(localStorage.getItem('token'));

//   login(credentials: LoginRequest): Observable<AuthResponse> {
//     // Используем метод post из ApiService
//     return this.api.post<AuthResponse>('auth/login', credentials).pipe(
//       tap(response => {
//         this.setToken(response.token);
//       })
//     );
//   }
// register(data: any): Observable<any> {
//   return this.api.post('auth/register', data);
// }

//   setToken(token: string) {
//     localStorage.setItem('token', token);
//     this.currentUserToken.set(token);
//   }

//   logout() {
//     localStorage.removeItem('token');
//     this.currentUserToken.set(null);
//   }

//   get isAuthenticated(): boolean {
//     return !!this.currentUserToken();
//   }
// }

import { inject, Injectable, signal, computed } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { AuthResponse, LoginRequest } from '../models/auth.model';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  nameid: string;
  email: string;
  fullName: string;
  role: string | string[];
  exp: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);
  
  // Зберігаємо сирий рядок токена
  currentUserToken = signal<string | null>(localStorage.getItem('token'));

  // Обчислювальний Signal (computed), який автоматично розшифровує токен
  currentUser = computed(() => {
    const token = this.currentUserToken();
    if (!token) return null;

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      
      // Перевіряємо, чи не прострочений токен (exp у секундах)
      const isExpired = Math.floor(Date.now() / 1000) >= decoded.exp;
      if (isExpired) {
        this.logout();
        return null;
      }

      return {
        id: decoded.nameid,
        email: decoded.email,
        fullName: decoded.fullName,
        // Перетворюємо ролі в масив, бо Identity може слати як один рядок, так і список
        roles: Array.isArray(decoded.role) ? decoded.role : [decoded.role]
      };
    } catch (error) {
      console.error('Помилка декодування токена: - auth.service.ts:85', error);
      return null;
    }
  });

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('auth/login', credentials).pipe(
      tap(response => {
        this.setToken(response.token);
      })
    );
  }

  register(data: any): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('auth/register', data).pipe(
      tap(response => {
        this.setToken(response.token);
      })
    );
  }

  setToken(token: string) {
    localStorage.setItem('token', token);
    this.currentUserToken.set(token);
  }

  logout() {
    localStorage.removeItem('token');
    this.currentUserToken.set(null);
  }

  // Швидка перевірка наявності ролі Admin
  isAdmin(): boolean {
    return this.currentUser()?.roles.includes('Admin') ?? false;
  }

  get isAuthenticated(): boolean {
    return !!this.currentUserToken();
  }
}