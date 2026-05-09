// core/services/blog.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Article {
  id?: number;
  title: string;
  category: string;
  author: string;
  readTime: string;
  imageUrl: string;
  intro: string;
  paragraphsText: string; // розділені "|"
  bulletsText?: string;   // розділені "|"
  quote?: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private http = inject(HttpClient);
private apiUrl = 'https://localhost:7001/api/articles';
  // Отримати всі статті
  getArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(this.apiUrl);
  }

  // Отримати статтю за ID
  getArticleById(id: number): Observable<Article> {
    return this.http.get<Article>(`${this.apiUrl}/${id}`);
  }

  // Створити статтю
  createArticle(article: Article): Observable<Article> {
    return this.http.post<Article>(this.apiUrl, article);
  }

  // Оновити статтю (додамо для майбутнього розширення)
  updateArticle(id: number, article: Article): Observable<Article> {
    return this.http.put<Article>(`${this.apiUrl}/${id}`, article);
  }

  // Видалити статтю
  deleteArticle(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}