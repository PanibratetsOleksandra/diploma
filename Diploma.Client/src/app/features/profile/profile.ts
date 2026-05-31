
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/services/user.service';
import { FormsModule } from '@angular/forms';
import { ImageService } from '../../core/services/image.service';
import { AiService } from '../../core/services/ai.service';
import { RouterLink } from '@angular/router';
import { DesignerService } from '../../core/services/designer.service';
import { CartService } from '../../core/services/cart.service';
import { CartItem } from '../../core/models/cart-item.model';
import { OrderStatus } from '../../core/enums/order-status.enum';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.html'
})
export class ProfileComponent implements OnInit {
  [x: string]: any;
  private designerService = inject(DesignerService)
  private userService = inject(UserService);
  private imageService = inject(ImageService);
  private cartService = inject(CartService);
  private aiService = inject(AiService);
  isEditing = signal(false);
  editForm = signal<any>({});
  user = this.userService.currentUser;
  userOrders = signal<any[]>([]);
  userCreations = signal<any[]>([]);
  activeTab = signal<'orders' | 'personal' | 'shipping' | 'ai-designs' | 'creations'>('orders');
  selectedFile: File | null = null;
  getImg(url: string | undefined): string {
    if (!url) return 'https://placehold.net/600x600.png';
    return this.imageService.getFullImageUrl(url);
  }
  private router = inject(Router);
  getAvatarUrl(): string {
    return this.imageService.getFullImageUrl(this.user()?.avatarUrl);
  }
  toastMessage = signal<string | null>(null);
  toastType = signal<'success' | 'error'>('success');
  getPreviewUrl(): string {
    return this.imageService.getFullImageUrl(this.editForm().avatarUrl);
  }

  ngOnInit() {
    this.userService.getProfile().subscribe({
      next: (userData: any) => {
        this.userService.currentUser.set(userData);
        this.userOrders.set(userData?.orders ?? []);
        this.loadAddresses();
        this.loadOrders();
      },

      error: (err) => {
        console.error('Помилка при завантаженні профілю: - profile.ts:59', err);
      }
    });
  }
  loadAddresses() {
    this.userService.getAddresses().subscribe(data => {
      this.userAddresses.set(data);
    });
  }

  isEditingAddress = signal(false);

  startEditAddress(addr: any) {
    this.newAddress = { ...addr };
    this.isEditingAddress.set(true);
    this.isAddingAddress.set(true);
  }

  saveAddress() {
    if (this.isEditingAddress()) {

      this.userService.updateAddress(this.newAddress.id, this.newAddress).subscribe({
        next: () => {
          this.loadAddresses();
          this.closeAddressForm();
        },
        error: (err) => console.error('Помилка оновлення адреси: - profile.ts:85', err)
      });
    } else {
      this.userService.addAddress(this.newAddress).subscribe({
        next: () => {
          this.loadAddresses();
          this.closeAddressForm();
        },
        error: (err) => console.error('Помилка збереження адреси: - profile.ts:93', err)
      });
    }
  }

  closeAddressForm() {
    this.isAddingAddress.set(false);
    this.isEditingAddress.set(false);
    this.resetAddressForm();
  }

  removeAddress(id: number) {
    this.userService.deleteAddress(id).subscribe(() => {
      this.userAddresses.update(prev => prev.filter(a => a.id !== id));
    });
  }
  getStatusClass(status: string) {
    const classes: Record<string, string> = {
      'In Progress': 'bg-orange-100 text-orange-600',
      'Delivered': 'bg-green-100 text-green-600',
      'Pending': 'bg-blue-100 text-blue-600'
    };
    return classes[status] || 'bg-gray-100 text-gray-600';
  }

  startEditing() {
    const current = this.user();
    this.editForm.set({
      ...current,
      birthDate: this.formatDateForInput(current?.birthDate)
    });
    this.isEditing.set(true);
  }

  cancelEditing() {
    this.isEditing.set(false);
    this.selectedFile = null;
  }

  saveProfile() {
    const formData = new FormData();
    const data = this.editForm();

    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined && key !== 'avatarUrl' && key !== 'id' && key !== 'roles') {
        if (key === 'birthDate' && data[key]) {
          formData.append(key, new Date(data[key]).toISOString());
        } else {
          formData.append(key, data[key]);
        }
      }
    });
    if (this.selectedFile) {
      formData.append('photo', this.selectedFile);
    }

    this.userService.updateProfile(formData).subscribe({
      next: (updatedUser: any) => {
        this.userService.currentUser.set(updatedUser);
        this.isEditing.set(false);
        this.selectedFile = null;
      },
      error: (err) => console.error('Error saving profile - profile.ts:155', err)
    });
  }

  triggerFileInput(input: HTMLInputElement) {
    if (this.isEditing()) {
      input.click();
    }
  }

  formatDateForInput(date: string | Date | null | undefined): string {
    if (!date) return '';

    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return '';

    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const day = String(parsedDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  getGenderLabel(gender: string | null | undefined): string {
    const genderMap: Record<string, string> = {
      'Not Specified': 'Prefer not to say',
      'Female': 'Female',
      'Male': 'Male',
      'Other': 'Creative Soul',
      'Creative Soul': 'Creative Soul'
    };
    return gender ? (genderMap[gender] || gender) : '—';
  }

  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.showToast('Будь ласка, оберіть коректний файл зображення.', 'error');
      return;
    }

    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.editForm.update((current: any) => ({
        ...current,
        avatarUrl: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
  }
  isAddingAddress = signal(false);
  userAddresses = signal<any[]>([]);
  newAddress: any = {
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
  };

  resetAddressForm() {
    this.newAddress = {
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
    };

  }

  myDesigns = signal<any[]>([]);
  loadMyDesigns() {
    this.aiService.getMyDesigns().subscribe({
      next: (designs) => {
        this.myDesigns.set(designs);
      },
      error: (err) => {
        console.error('Помилка завантаження AI дизайнів: - profile.ts:253', err);
      }
    });
  }
  getDesignImageUrl(url: string): string {
    return this.imageService.getFullImageUrl(url);
  }
  loadUserCreations() {
    this.userCreations.set([]); // Очищуємо старі дані перед запитом
    this.designerService.getMyManualDesigns().subscribe({
      next: (data) => this.userCreations.set(data),
      error: (err) => console.error('Помилка creations: - profile.ts:264', err)
    });
  }
  setTab(tab: 'orders' | 'personal' | 'shipping' | 'ai-designs' | 'creations') {
    this.activeTab.set(tab);
    if (tab === 'shipping') this.loadAddresses();
    if (tab === 'ai-designs') this.loadMyDesigns();
    if (tab === 'creations') this.loadUserCreations();
  }

  deleteDesign(id: number): void {
    const confirmed = confirm('Delete this design?');

    if (!confirmed) return;

    this.aiService.deleteDesign(id).subscribe({
      next: () => {
        this.myDesigns.update(designs =>
          designs.filter(design => design.id !== id)
        );
      },
      error: (err) => {
        console.error('Помилка видалення дизайну: - profile.ts:286', err);
      }
    });
  }


  deleteCreation(id: number) {
    if (!confirm('Are you sure you want to delete this creation?')) return;
    this.designerService.deleteDesign(id).subscribe({
      next: () => {
        this.userCreations.update(items => items.filter(i => i.id !== id));
      }
    });
  }

  isOrderModalOpen = signal(false);
  selectedCreation = signal<any>(null);
  orderCustomDetails = signal({ size: 'M', comments: '' });

  openOrderForm(creation: any) {
    this.selectedCreation.set(creation);
    this.orderCustomDetails.set({ size: 'M', comments: '' });
    this.isOrderModalOpen.set(true);
  }

  confirmOrder() {
    const creation = this.selectedCreation();
    const details = this.orderCustomDetails();

    const isAi = creation.isAi;

    const mainImg = isAi ? creation.imageUrl : creation.frontImageUrl;
    const extraPhotos = [];

    if (!isAi && creation.backImageUrl) {
      extraPhotos.push(creation.backImageUrl);
    }

    const cartItem: CartItem = {
      id: `${isAi ? 'ai' : 'manual'}-${creation.id}-${Date.now()}`,
      originalId: creation.id,
      name: isAi ? `AI Concept: ${creation.prompt?.slice(0, 40) || 'Design'}` : `Hand-painted ${creation.garmentType}`,
      price: isAi ? 1350 : 1500,
      imageUrl: mainImg,
      additionalPhotos: extraPhotos,
      quantity: 1,
      type: isAi ? 'ai-design' : 'manual-design',
      size: details.size,
      notes: details.comments
    };

    this.cartService.addToCart(cartItem);
    this.isOrderModalOpen.set(false);
    this.showToast('Додано в кошик! ✨', 'success');
  }

  updateOrderSize(newSize: string) {
    this.orderCustomDetails.update(current => ({
      ...current,
      size: newSize
    }));
  }


  orders = signal<any[]>([]);

  loadOrders() {
    this.userService.getMyOrders().subscribe(data => {
      this.orders.set(data);
    });
  }

  showToast(message: string, type: 'success' | 'error' = 'success') {
    this.toastMessage.set(message);
    this.toastType.set(type);


    setTimeout(() => {
      this.toastMessage.set(null);
    }, 4000);
  }
  openAiOrderForm(design: any) {

    this.selectedCreation.set({ ...design, isAi: true });
    this.orderCustomDetails.set({ size: 'M', comments: '' });
    this.isOrderModalOpen.set(true);
  }


  selectedOrder = signal<any | null>(null);
  isOrderDetailsOpen = signal(false);

  viewOrderDetails(order: any) {
    this.selectedOrder.set(order);
    this.isOrderDetailsOpen.set(true);
  }

  closeOrderDetails() {
    this.isOrderDetailsOpen.set(false);
    this.selectedOrder.set(null);
  }

  parseShipping(shippingStr: string) {
    try {
      return JSON.parse(shippingStr);
    } catch {
      return shippingStr;
    }
  }

  cancelUserOrder(orderId: number) {
    if (confirm('Ви впевнені, що хочете скасувати це замовлення?')) {
      this.userService.updateOrderStatus(orderId, OrderStatus.Cancelled).subscribe({
        next: () => {


          this.orders.update(prevOrders =>
            prevOrders.map(o => o.id === orderId ? { ...o, status: OrderStatus.Cancelled } : o)
          );

          this.userOrders.update(prevUserOrders =>
            prevUserOrders.map(o => o.id === orderId ? { ...o, status: OrderStatus.Cancelled } : o)
          );


          const currentSelected = this.selectedOrder();
          if (currentSelected && currentSelected.id === orderId) {
            this.selectedOrder.set({ ...currentSelected, status: OrderStatus.Cancelled });
          }
          this.showToast('Замовлення успішно скасовано.', 'success');

        },
        error: (err) => {
          this.showToast('Не вдалося скасувати замовлення. Спробуйте пізніше.', 'error');
        }
      });
    }
  }

  navigateToProduct(item: any) {
    this.closeOrderDetails();
    const itemId = item.id;

    this.router.navigate([`/custom-detail/${itemId}`], {
      state: { item: item, isShopProduct: item.type === 'product' }
    });
  }
}