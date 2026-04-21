// // src/app/core/services/api.service.ts
// import { HttpClient } from '@angular/common/http';
// import { inject, Injectable } from '@angular/core';
// import { Observable } from 'rxjs';

// @Injectable({ providedIn: 'root' })
// export class ApiService {
//   protected http = inject(HttpClient);
//   protected readonly baseUrl = 'https://localhost:7001/api';



//   // Универсальный метод для POST
//   post<T>(path: string, body: any): Observable<T> {
//     return this.http.post<T>(`${this.baseUrl}/${path}`, body);
//   }

//   // Универсальный метод для GET
//   get<T>(path: string): Observable<T> {
//     return this.http.get<T>(`${this.baseUrl}/${path}`);
//   }

//   delete<T>(path: string): Observable<T> {
//     return this.http.delete<T>(`${this.baseUrl}/${path}`);
//   }

//   // Також корисно додати PUT для майбутнього редагування
//   put<T>(path: string, body: any): Observable<T> {
//     return this.http.put<T>(`${this.baseUrl}/${path}`, body);
//   }
// }

// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { inject, Injectable } from '@angular/core';
// import { Observable } from 'rxjs';

// @Injectable({ providedIn: 'root' })
// export class ApiService {
//   protected http = inject(HttpClient);
//   protected readonly baseUrl = 'https://localhost:7001/api';

// private getHeaders(): HttpHeaders {
//   const token = localStorage.getItem('token');

//   if (!token) {
//     return new HttpHeaders();
//   }

//   return new HttpHeaders({
//     Authorization: `Bearer ${token}`
//   });
// }

//   post<T>(path: string, body: any): Observable<T> {
//     return this.http.post<T>(`${this.baseUrl}/${path}`, body, { headers: this.getHeaders() });
//   }

//   get<T>(path: string): Observable<T> {
//     return this.http.get<T>(`${this.baseUrl}/${path}`, { headers: this.getHeaders() });
//   }

//   delete<T>(path: string): Observable<T> {
//     return this.http.delete<T>(`${this.baseUrl}/${path}`, { headers: this.getHeaders() });
//   }

//   put<T>(path: string, body: any): Observable<T> {
//     return this.http.put<T>(`${this.baseUrl}/${path}`, body, { headers: this.getHeaders() });
//   }
// }

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

  put<T>(path: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${path}`, body);
  }
}