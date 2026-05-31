import { Injectable, signal, computed, effect } from '@angular/core';
import { CartItem } from '../models/cart-item.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private cartItems = signal<CartItem[]>(this.loadCartFromStorage());
  selectedItem = signal<CartItem | null>(null);
  isDetailsOpen = signal(false);
  items = computed(() => this.cartItems());
  totalCount = computed(() => this.cartItems().reduce((acc, item) => acc + item.quantity, 0));
  totalPrice = computed(() => this.cartItems().reduce((acc, item) => acc + (item.price * item.quantity), 0));

  constructor() {

    effect(() => {
      localStorage.setItem('panibratets_cart', JSON.stringify(this.cartItems()));
    });
  }

  addToCart(item: CartItem) {
    this.cartItems.update(prev => {
      const existing = prev.find(i => i.originalId === item.originalId && i.type === item.type && i.size === item.size);

      if (existing) {
        return prev.map(i => i === existing
          ? { ...i, quantity: i.quantity + 1 }
          : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }

  removeFromCart(cartId: string | number) {
    this.cartItems.update(prev => prev.filter(i => i.id !== cartId));
  }

  updateQuantity(cartId: string | number, delta: number) {
    this.cartItems.update(prev => prev.map(i => {
      if (i.id === cartId) {
        const newQty = i.quantity + delta;
        return newQty > 0 ? { ...i, quantity: newQty } : i;
      }
      return i;
    }));
  }

  clearCart() {
    this.cartItems.set([]);
  }

  private loadCartFromStorage(): CartItem[] {
    const saved = localStorage.getItem('panibratets_cart');
    return saved ? JSON.parse(saved) : [];
  }

  viewDetails(item: CartItem) {
    this.selectedItem.set(item);
    this.isDetailsOpen.set(true);
  }

  closeDetails() {
    this.isDetailsOpen.set(false);
    this.selectedItem.set(null);
  }


  updateItemDetails(cartId: string | number, newSize: string, newNotes: string) {
    this.cartItems.update(prev => prev.map(item => {
      if (item.id === cartId) {

        const finalSize = item.type === 'product' ? item.size : newSize;
        return { ...item, size: finalSize, notes: newNotes };
      }
      return item;
    }));

    const currentSelected = this.selectedItem();
    if (currentSelected && currentSelected.id === cartId) {
      const finalSize = currentSelected.type === 'product' ? currentSelected.size : newSize;
      this.selectedItem.set({ ...currentSelected, size: finalSize, notes: newNotes });
    }
  }

}