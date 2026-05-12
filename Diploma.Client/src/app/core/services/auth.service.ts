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
      console.error('Помилка декодування токена: - auth.service.ts:45', error);
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

  isAdmin(): boolean {
    const user = this.currentUser();
    if (!user || !user.roles) return false;
    
    return user.roles.some(role => role.toLowerCase() === 'admin');
  }

  get isAuthenticated(): boolean {
    return !!this.currentUserToken();
  }
}