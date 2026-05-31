
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service'; 

@Injectable({ providedIn: 'root' })
export class DesignerService {
  private api = inject(ApiService);


  saveManualDesign(payload: { frontBase64: string, backBase64: string, garmentType: string }): Observable<any> {
    return this.api.post<any>('designer/save-manual-design', payload);
  }

  getMyManualDesigns(): Observable<any[]> {
    return this.api.get<any[]>('designer/my-manual-designs');
  }

  deleteDesign(id: number): Observable<any> {
    return this.api.delete<any>(`designer/${id}`);
  }

  getDesignById(id: number): Observable<any> {
    return this.api.get<any>(`designer/${id}`);
  }
}