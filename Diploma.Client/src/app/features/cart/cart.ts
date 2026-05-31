import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { ImageService } from '../../core/services/image.service';
import { CartItem } from '../../core/models/cart-item.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.scss'
})
export class CartComponent {
  public cartService = inject(CartService);
  public imageService = inject(ImageService);
  activePhotoIndex = signal(0);

  increase(cartId: string | number) {
    this.cartService.updateQuantity(cartId, 1);
  }

  decrease(cartId: string | number) {
    this.cartService.updateQuantity(cartId, -1);
  }

  remove(cartId: string | number) {
    if (confirm('Ви дійсно хочете видалити цей виріб з кошика? ❌')) {
      this.cartService.removeFromCart(cartId);
    }
  }

  getImg(url: string) {
    return this.imageService.getFullImageUrl(url);
  }

  closeDetails() {
    this.cartService.closeDetails();
  }

  viewDetails(item: CartItem) {
    this.activePhotoIndex.set(0);
    this.cartService.viewDetails(item);
  }


}