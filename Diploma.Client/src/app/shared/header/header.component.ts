import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { CartService } from '../../core/services/cart.service';
import { ImageService } from '../../core/services/image.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  public authService = inject(AuthService);
  public cartService = inject(CartService); // Додаємо цей рядок
  private router = inject(Router);
public imageService = inject(ImageService);
  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }


  navigateToDashboard() {
    const user = this.authService.currentUser();
    
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    const isAdmin = user.roles?.some(role => role.toLowerCase() === 'admin');

    if (isAdmin) {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/profile']);
    }
  }
}