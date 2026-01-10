import { Component } from '@angular/core';
import { ApiService } from './api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <button (click)="load()">GET</button>
    <button (click)="send()">POST</button>
  `
})
export class HomeComponent {

   test={name: "Olya" }
  constructor(private api: ApiService) { }

  load() {
    this.api.getData().subscribe(res => console.log(res));
  }

  send() {
    this.api.postData(this.test).subscribe(res => console.log(res));
  }
}
