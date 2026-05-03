import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DesignerService {
  private http = inject(HttpClient);
  private baseUrl = 'https://localhost:7001/api/designer';

  // 1. Збереження нового дизайну (Front + Back)
  saveManualDesign(data: { frontBase64: string, backBase64: string, garmentType: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/save-manual-design`, data);
  }

  // 2. Отримання всіх ручних дизайнів користувача для вкладки "My Creations"
  getMyManualDesigns(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/my-manual-designs`);
  }

  // 3. Видалення дизайну за ID
  deleteDesign(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  // 4. Додатково: Отримання конкретного дизайну, якщо захочеш зробити сторінку детального перегляду
  getDesignById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }
}