import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AiService {
  private api = inject(ApiService);

  generateDesign(vision: string): Observable<any> {
    return this.api.post<any>('ai/generate-image', { vision });
  }
}