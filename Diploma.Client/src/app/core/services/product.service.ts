import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { Product } from '../../data/product.model';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private api = inject(ApiService);
  
  products = signal<Product[]>([]);

  getProducts(): Observable<Product[]> {
    return this.api.get<Product[]>('products').pipe(
      tap(data => this.products.set(data))
    );
  }
uploadImages(formData: FormData): Observable<string[]> {
  return this.api.post<string[]>('products/upload', formData);
}
  createProduct(product: Partial<Product>): Observable<Product> {
    return this.api.post<Product>('products', product).pipe(
      tap(newProduct => {
        this.products.update(prev => [...prev, newProduct]);
      })
    );
  }

  // --- НОВИЙ МЕТОД ДЛЯ РЕДАГУВАННЯ ---
  updateProduct(id: number, product: Partial<Product>): Observable<Product> {
    return this.api.put<Product>(`products/${id}`, product).pipe(
      tap(updatedProduct => {
        // Оновлюємо товар у списку Signal локально
        this.products.update(prev => 
          prev.map(p => p.id === id ? { ...p, ...updatedProduct } : p)
        );
      })
    );
  }

  deleteProduct(id: number): Observable<void> {
    return this.api.delete<void>(`products/${id}`).pipe(
      tap(() => {
        this.products.update(prev => prev.filter(p => p.id !== id));
      })
    );
  }
}