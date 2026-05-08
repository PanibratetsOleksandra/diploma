
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  protected http = inject(HttpClient);
  protected readonly baseUrl = 'https://localhost:7001/api';

  post<T>(path: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${path}`, body);
  }

  get<T>(path: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${path}`);
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${path}`);
  }

  // put<T>(path: string, body: any, p0: { headers: { 'Content-Type': string; }; }): Observable<T> {
  //   return this.http.put<T>(`${this.baseUrl}/${path}`, body);
  // }

  // api.service.ts

put<T>(path: string, body: any, options?: { headers?: any }): Observable<T> {
  // Тепер options (або твій p0) є опціональним завдяки знаку "?"
  // Якщо ти захочеш колись передати заголовки, ми передаємо їх у http-запит:
  return this.http.put<T>(`${this.baseUrl}/${path}`, body, options);
}
}