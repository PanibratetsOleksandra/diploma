// import { Component } from '@angular/core';
// import { RouterLink, RouterLinkActive } from '@angular/router';
// @Component({
//   selector: 'app-header',
//   imports: [RouterLink],
//   templateUrl: './header.component.html',
//   styleUrl: './header.component.scss',
// })
// export class HeaderComponent {
// // authService: any;

// }
import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  public authService = inject(AuthService);
  private router = inject(Router);

  logout() {
    this.authService.logout();
    this.router.navigate(['/']); 
  }
}