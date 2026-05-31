// custom-detail.component.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-custom-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './custom-detail.html'
})
export class CustomDetailComponent implements OnInit {
  private router = inject(Router);
  private location = inject(Location);
  private authService = inject(AuthService);

  customItem = signal<any | null>(null);

  get isAdmin(): boolean {
    const userRoles = this.authService.currentUser()?.roles || [];
    return userRoles.some((role: string) => role.toLowerCase() === 'admin');
  }

  ngOnInit() {
    const state = this.location.getState() as any;

    if (!state?.item) {
      this.router.navigate(['/']);
      return;
    }

    const item = { ...state.item };

    let frontImage = '';
    let backImage = '';

    if (item.imageUrl && item.imageUrl.includes('|')) {
      const [front, back] = item.imageUrl.split('|');
      frontImage = front;
      backImage = back;
    }

    else if (item.additionalPhotos?.length) {
      frontImage = item.imageUrl;

      backImage = item.additionalPhotos.find((p: string) => p && p !== item.imageUrl) || '';
    }

    else {
      frontImage = item.imageUrl;
      backImage = '';
    }

    item.frontImage = frontImage;
    item.backImage = backImage;

    this.customItem.set(item);
  }

  getFullUrl(url: string): string {
    if (!url) return 'assets/images/placeholder.jpg';
    return url.startsWith('http') ? url : `http://localhost:5000${url}`;
  }

  goBack() {
    this.location.back();
  }
}