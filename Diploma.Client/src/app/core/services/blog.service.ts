// core/services/blog.service.ts
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Article } from '../models/article.model';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private api = inject(ApiService);

private apiUrl = 'articles'
  getArticles(): Observable<Article[]> {
    return this.api.get<Article[]>(this.apiUrl);
  }

  getArticleById(id: number): Observable<Article> {
    return this.api.get<Article>(`${this.apiUrl}/${id}`);
  }

  createArticle(article: Article): Observable<Article> {
    return this.api.post<Article>(this.apiUrl, article);
  }

  updateArticle(id: number, article: Article): Observable<Article> {
    return this.api.put<Article>(`${this.apiUrl}/${id}`, article);
  }

  deleteArticle(id: number): Observable<any> {
    return this.api.delete(`${this.apiUrl}/${id}`);
  }
}