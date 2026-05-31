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
  imports: [CommonModule, FormsModule],
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

  contactInfo = signal({
    email: '',
    firstName: '',
    lastName: '',
    phone: ''
  });

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

  toastMessage = signal<string>('');
  toastType = signal<'success' | 'error'>('success');

  showToast(message: string, type: 'success' | 'error' = 'success'): void {
    this.toastMessage.set(message);
    this.toastType.set(type);
    setTimeout(() => this.toastMessage.set(''), 3000);
  }

  isPaymentModalOpen = signal(false);
  isPaying = signal(false);
  cardData = signal({ number: '', expiry: '', cvv: '' });
  maskedCvv = signal<string>('');
  private cvvTimeout: any = null;

  ngOnInit() {

    const currentUser = this.userService.currentUser();
    if (currentUser) {
      this.contactInfo.set({
        email: currentUser.email || '',
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        phone: currentUser.phoneNumber || ''
      });
    }

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
      this.showToast('Будь ласка, заповніть усі контактні дані! ✍️', 'error');
      return;
    }

    if (!info.email.includes('@')) {
      this.showToast('Будь ласка, введіть коректний Email! 📬', 'error');
      return;
    }

    if (this.isNewAddress()) {
      const addr = this.newAddress();

      if (!addr.region.trim() || !addr.city.trim()) {
        this.showToast('Будь ласка, вкажіть Область та Місто для доставки! 🏙️', 'error');
        return;
      }

      if (addr.deliveryType === 'Courier') {
        if (!addr.street.trim() || !addr.building.trim()) {
          this.showToast('Для кур\'єрської доставки обов\'язково вкажіть Вулицю та Номер будинку! 🏠', 'error');
          return;
        }
      } else {
        if (!addr.warehouseNumber.trim()) {
          this.showToast('Будь ласка, вкажіть номер Відділення або Поштомату! 📦', 'error');
          return;
        }
      }
    } else {
      if (!this.selectedAddressId() && this.userAddresses().length > 0) {
        this.showToast('Будь ласка, оберіть одну зі збережених адрес або створіть нову! 🗺️', 'error');
        return;
      }

      if (this.userAddresses().length === 0) {
        this.showToast('У вас немає збережених адрес. Заповніть нову адресу доставки! ✍️', 'error');
        this.isNewAddress.set(true);
        return;
      }
    }

    this.currentStep.set(2);
  }

  saveAddressChanges() {
    const updated = this.newAddress();
    this.userAddresses.update(addresses =>
      addresses.map(a => a.id === this.editingAddressId() ? { ...a, ...updated } : a)
    );
    this.editingAddressId.set(null);
    this.showToast('Адресу успішно оновлено! 🗺️', 'success');
  }

  placeOrder() {
    if (this.isSubmitting() || this.isPaying()) return;
    if (this.paymentMethod() === 'cash') {
      this.confirmAndPlaceOrder('Очікує підтвердження (Післяплата)');
      return;
    }
    this.cardData.set({ number: '', expiry: '', cvv: '' });
    this.maskedCvv.set('');
    this.isPaymentModalOpen.set(true);
  }


  simulateCardPayment() {
    const card = this.cardData();


    const cleanNumber = card.number.replace(/\s+/g, '');
    if (cleanNumber.length !== 16) {
      this.showToast('Номер картки повинен містити рівно 16 цифр! 💳', 'error');
      return;
    }


    if (!/^\d{2}\/\d{2}$/.test(card.expiry)) {
      this.showToast('Некоректний формат дати! Використовуйте MM/YY 📅', 'error');
      return;
    }


    const [monthStr, yearStr] = card.expiry.split('/');
    const month = parseInt(monthStr, 10);
    const year = parseInt(yearStr, 10);

    if (month < 1 || month > 12) {
      this.showToast('Місяць вказано некоректно (має бути від 01 до 12)! 🛑', 'error');
      return;
    }


    const currentYearShort = new Date().getFullYear() % 100;
    if (year < currentYearShort) {
      this.showToast('Термін дії картки закінчився! ⏳', 'error');
      return;
    }


    if (card.cvv.length !== 3) {
      this.showToast('Код CVV2 повинен містити рівно 3 цифри! 🔐', 'error');
      return;
    }

    this.isPaying.set(true);

    setTimeout(() => {
      this.isPaying.set(false);
      this.isPaymentModalOpen.set(false);
      this.confirmAndPlaceOrder('Оплачено (Card Sandbox Emulator)');
    }, 2000);
  }


  onCardNumberInput(event: any) {
    let input = event.target.value.replace(/\D/g, '');
    if (input.length > 16) input = input.substr(0, 16);


    const formatted = input.match(/.{1,4}/g)?.join(' ') || input;
    this.cardData.update(c => ({ ...c, number: formatted }));


    event.target.value = formatted;
  }

  onExpiryInput(event: any) {
    let input = event.target.value.replace(/\D/g, '');
    if (input.length > 4) input = input.substr(0, 4);

    if (input.length >= 2) {
      input = input.substr(0, 2) + '/' + input.substr(2);
    }

    this.cardData.update(c => ({ ...c, expiry: input }));
    event.target.value = input;
  }

  onCvvInput(event: any) {
    if (this.cvvTimeout) clearTimeout(this.cvvTimeout);

    const target = event.target;
    const rawVal = target.value;


    let currentCvv = this.cardData().cvv;

    if (rawVal.length < this.maskedCvv().length) {

      currentCvv = currentCvv.substring(0, rawVal.length);
    } else if (rawVal.length > 0) {

      const lastChar = rawVal.charAt(rawVal.length - 1);
      if (/\D/.test(lastChar)) {

        target.value = this.maskedCvv();
        return;
      }
      if (currentCvv.length < 3) {
        currentCvv += lastChar;
      }
    }

    this.cardData.update(c => ({ ...c, cvv: currentCvv }));


    let tempMask = '';
    for (let i = 0; i < currentCvv.length; i++) {
      if (i === currentCvv.length - 1) {
        tempMask += currentCvv.charAt(i);
      } else {
        tempMask += '•';
      }
    }

    this.maskedCvv.set(tempMask);
    target.value = tempMask;

    this.cvvTimeout = setTimeout(() => {
      const finalMask = '•'.repeat(this.cardData().cvv.length);
      this.maskedCvv.set(finalMask);
      target.value = finalMask;
    }, 1500);
  }


  private confirmAndPlaceOrder(paymentStatusNote: string) {
    this.isSubmitting.set(true);

    const finalOrder = {
      customerEmail: this.contactInfo().email,
      customerFullName: `${this.contactInfo().firstName} ${this.contactInfo().lastName}`,
      customerPhone: this.contactInfo().phone,
      shippingDetails: JSON.stringify(this.isNewAddress() ? this.newAddress() : this.userAddresses().find(a => a.id === this.selectedAddressId())),
      paymentMethod: this.paymentMethod(),
      totalAmount: this.cartService.totalPrice(),
      notes: paymentStatusNote,


      items: this.cartService.items().map(item => {
        const isManualDesign = item.type === 'manual-design';

        return {
          name: item.name,
          type: item.type,
          size: item.size,
          notes: item.notes,
          price: item.price,
          quantity: item.quantity,

          imageUrl: item.imageUrl,


          frontImageUrl: isManualDesign ? item.imageUrl : null,
          backImageUrl: isManualDesign && item.additionalPhotos?.length ? item.additionalPhotos[0] : null
        };
      })
    };

    this.userService.createOrder(finalOrder).subscribe({
      next: (res) => {
        console.log('Order created successfully: - checkout.ts:329', res);
        this.cartService.clearCart();
        this.isSubmitting.set(false);
        this.showToast(`Замовлення №${res.id} успішно оформлено! Дякуємо! ✨🎨`, 'success');

        setTimeout(() => {
          this.router.navigate(['/profile']);
        }, 2000);
      },
      error: (err) => {
        console.error('Order error: - checkout.ts:339', err);
        this.showToast('Сталася помилка під час збереження замовлення. Спробуйте ще раз.', 'error');
        this.isSubmitting.set(false);
      }
    });
  }
}