// src/app/core/services/product.service.ts
import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { Product } from '../../data/product.model';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private api = inject(ApiService);
  
  // Використовуємо Signal для збереження списку товарів (реактивність)
  products = signal<Product[]>([]);

  // Завантажити всі товари
  getProducts(): Observable<Product[]> {
    return this.api.get<Product[]>('products').pipe(
      tap(data => this.products.set(data))
    );
  }

  // Додати новий виріб з ручним розписом
  createProduct(product: Partial<Product>): Observable<Product> {
    return this.api.post<Product>('products', product).pipe(
      tap(newProduct => {
        // Оновлюємо список товарів локально без перезавантаження сторінки
        this.products.update(prev => [...prev, newProduct]);
      })
    );
  }

  // Видалити товар
  deleteProduct(id: number): Observable<void> {
    return this.api.delete<void>(`products/${id}`).pipe(
      tap(() => {
        this.products.update(prev => prev.filter(p => p.id !== id));
      })
    );
  }
}