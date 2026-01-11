// src/app/core/services/auth.service.ts
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service'; // Импортируем базовый сервис
import { AuthResponse, LoginRequest } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService); // Внедряем базовый сервис
  
  // Состояние токена (Signal)
  currentUserToken = signal<string | null>(localStorage.getItem('token'));

  login(credentials: LoginRequest): Observable<AuthResponse> {
    // Используем метод post из ApiService
    return this.api.post<AuthResponse>('auth/login', credentials).pipe(
      tap(response => {
        this.setToken(response.token);
      })
    );
  }
register(data: any): Observable<any> {
  return this.api.post('auth/register', data);
}

  setToken(token: string) {
    localStorage.setItem('token', token);
    this.currentUserToken.set(token);
  }

  logout() {
    localStorage.removeItem('token');
    this.currentUserToken.set(null);
  }

  get isAuthenticated(): boolean {
    return !!this.currentUserToken();
  }
}