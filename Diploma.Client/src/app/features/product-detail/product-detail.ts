import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../data/product.model';
import { CartService } from '../../core/services/cart.service';
import { CartItem } from '../../core/models/cart-item.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-detail.html'
})
export class ProductDetailComponent implements OnInit {
  private cartService = inject(CartService);
  private route = inject(ActivatedRoute);
  public productService = inject(ProductService);
isModalOpen = signal<boolean>(false);
  // Стан товару
  product = signal<Product | null>(null);
  selectedSize = signal<string | null>(null);
  selectedPhoto = signal<string | null>(null);
  quantity = signal<number>(1);
  
  // Опції видання (Edition)
  selectedOption = signal<string>('Original');
  options = ['Original', 'Custom Request'];

  allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  // Схожі товари (автоматично оновлюються, коли змінюється product)
  relatedProducts = computed(() => 
    this.productService.products()
      .filter(p => p.id !== this.product()?.id)
      .slice(0, 4)
  );

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      this.productService.getProducts().subscribe(products => {
        const found = products.find(p => p.id === id);
        if (found) {
          this.product.set(found);
          this.selectedPhoto.set(this.getFullUrl(this.getMainPhoto(found)));
        }
      });
      // Плавний скрол вгору при переході на новий товар
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  getMainPhoto(product: Product): string {
    return product.photos?.find(p => p.isMain)?.url || product.photos?.[0]?.url || '';
  }
// Додай до списку сигналів у класі
isAdded = signal(false);

addToCart() {
  const p = this.product();
  if (!p || !this.selectedSize()) {
    alert('Будь ласка, оберіть розмір! ✨');
    return;
  }

  const cartItem: CartItem = {
    id: `product-${p.id}-${this.selectedSize()}`,
    originalId: p.id,
    name: p.name,
    price: p.price,
    imageUrl: this.selectedPhoto() || this.getFullUrl(p.photos?.[0]?.url),
    additionalPhotos: p.photos?.slice(1).map(ph => ph.url),
    quantity: 1,
    type: 'product',
    size: this.selectedSize()!
  };

  this.cartService.addToCart(cartItem);

  // --- ЛОГІКА КНОПКИ ---
  this.isAdded.set(true); // Змінюємо текст на "Added"

  setTimeout(() => {
    this.isAdded.set(false); // Через 2 секунди повертаємо назад
  }, 2000);
}

  

  toggleModal(isOpen: boolean) {
    this.isModalOpen.set(isOpen);
    // Блокуємо скрол основної сторінки, коли вікно відкрите
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    } }

  getFullUrl(url: string): string {
    if (!url) return 'assets/images/placeholder.jpg';
    return url.startsWith('http') ? url : `http://localhost:5000${url}`;
  }

  updateQuantity(val: number) {
    if (this.quantity() + val > 0) this.quantity.update(q => q + val);
  }

  getSizeName(size: any): string {
    if (typeof size === 'number') {
      return this.allSizes[size] || size.toString();
    }
    return String(size);
  }
}