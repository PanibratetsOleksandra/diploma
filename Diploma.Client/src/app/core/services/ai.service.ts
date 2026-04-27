import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AiService {
  private api = inject(ApiService);

  generateDesign(vision: string): Observable<any> {
    return this.api.post<any>('ai/generate-image', { vision });
  }

saveDesign(payload: { base64Image: string | null, prompt: string }): Observable<any> {
  return this.api.post<any>('ai/save-design', payload);
}

getMyDesigns() {
  return this.api.get<any[]>('ai/my-designs');
}

deleteDesign(id: number) {
  return this.api.delete<any>(`ai/designs/${id}`);
}

}
