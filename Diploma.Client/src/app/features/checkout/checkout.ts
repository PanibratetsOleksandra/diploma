import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { UserService } from '../../core/services/user.service';
import { ImageService } from '../../core/services/image.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss'
})
export class CheckoutComponent implements OnInit {
  public cartService = inject(CartService);
  private userService = inject(UserService);
  private imageService = inject(ImageService);
  private router = inject(Router);

  currentStep = signal(1);
  isSubmitting = signal(false);

  // Контакти
  contactInfo = signal({
    email: '',
    firstName: '',
    lastName: '',
    phone: ''
  });

  // Адреси
  userAddresses = signal<any[]>([]);
  selectedAddressId = signal<number | null>(null);
  isNewAddress = signal(false);
  editingAddressId = signal<number | null>(null);

  newAddress = signal({
    deliveryService: 'NovaPoshta',
    deliveryType: 'Warehouse',
    region: '',
    city: '',
    warehouseNumber: '',
    street: '',
    building: '',
    floor: '',
    apartment: '',
    hasElevator: false
  });

  paymentMethod = signal<'card' | 'cash'>('card');

  ngOnInit() {
    // Автозаповнення даних профілю
    const currentUser = this.userService.currentUser();
    if (currentUser) {
      this.contactInfo.set({
        email: currentUser.email || '',
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        phone: currentUser.phoneNumber || ''
      });
    }

    // Завантаження адрес
    this.userService.getAddresses().subscribe(data => {
      this.userAddresses.set(data);
      if (data.length > 0) {
        this.selectedAddressId.set(data[0].id);
      } else {
        this.isNewAddress.set(true);
      }
    });
  }

  selectSavedAddress(id: number) {
    this.selectedAddressId.set(id);
    this.isNewAddress.set(false);
    this.editingAddressId.set(null);
  }

  startEditingSaved(addr: any) {
    this.editingAddressId.set(addr.id);
    this.newAddress.set({ ...addr });
  }

  getImg(url: string) {
    return this.imageService.getFullImageUrl(url);
  }

  nextStep() {
    const info = this.contactInfo();
    if (!info.email || !info.firstName || !info.lastName || !info.phone) {
      alert('Заповніть контактні дані! ✍️');
      return;
    }
    this.currentStep.set(2);
  }
  // Метод для збереження змін у вже існуючій адресі
saveAddressChanges() {
  const updated = this.newAddress();
  this.userAddresses.update(addresses => 
    addresses.map(a => a.id === this.editingAddressId() ? { ...a, ...updated } : a)
  );
  this.editingAddressId.set(null); // Закриваємо форму після збереження
}

  placeOrder() {
    this.isSubmitting.set(true);
    // Тут буде виклик API для створення замовлення
    setTimeout(() => {
      this.cartService.clearCart();
      this.router.navigate(['/profile']);
      alert('Дякуємо за замовлення! Магія вже створюється. ✨🎨');
    }, 2000);
  }
}