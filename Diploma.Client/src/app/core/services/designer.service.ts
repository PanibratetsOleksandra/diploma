// import { HttpClient } from '@angular/common/http';
// import { Injectable } from '@angular/core';

// @Injectable({ providedIn: 'root' })
// export class DesignerService {
//   private baseUrl = 'https://localhost:7001/api/designer';

//   constructor(private http: HttpClient) {}

//   saveManualDesign(data: any) {
//     return this.http.post(`${this.baseUrl}/save-manual-design`, data);
//   }
// }

// designer.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DesignerService {
  private apiUrl = 'https://localhost:7001/api/designer';

  constructor(private http: HttpClient) {}

  saveManualDesign(payload: { 
    frontBase64?: string; 
    backBase64?: string; 
    garmentType: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/save-manual-design`, payload);
  }
}