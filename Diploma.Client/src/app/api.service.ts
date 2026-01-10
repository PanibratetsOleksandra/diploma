import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ApiService {

  private baseUrl = 'https://localhost:7001/api/test';

  constructor(private http: HttpClient) { }

  getData() {
    return this.http.get(this.baseUrl);
  }

  postData(data: any) {
    return this.http.post(this.baseUrl, data, {
      headers: { 'Content-Type': 'application/json' }});
  }

}
