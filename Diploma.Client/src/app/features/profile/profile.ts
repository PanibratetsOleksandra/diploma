
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/services/user.service';
import { FormsModule } from '@angular/forms';
import { ImageService } from '../../core/services/image.service';
import { AiService } from '../../core/services/ai.service';
import { RouterLink } from '@angular/router';
import { DesignerService } from '../../core/services/designer.service';
@Component({
  selector: 'app-profile',
  standalone: true,
imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.html'
})
export class ProfileComponent implements OnInit {
  private designerService = inject(DesignerService)
  private userService = inject(UserService);
  private imageService = inject(ImageService);
private aiService = inject(AiService);
  isEditing = signal(false);
  editForm = signal<any>({});
  user = this.userService.currentUser;
  userOrders = signal<any[]>([]);
  userCreations = signal<any[]>([]);
activeTab = signal<'orders' | 'personal' | 'shipping' | 'ai-designs' | 'creations'>('orders');
  selectedFile: File | null = null;

getAvatarUrl(): string {
  return this.imageService.getFullImageUrl(this.user()?.avatarUrl);
}

getPreviewUrl(): string {
  return this.imageService.getFullImageUrl(this.editForm().avatarUrl);
}

  ngOnInit() {
    this.userService.getProfile().subscribe({
      next: (userData: any) => {
        // URL вже трансформований в сервісі
        this.userService.currentUser.set(userData);
        this.userOrders.set(userData?.orders ?? []);       
        this.loadAddresses();
      },
      
      error: (err) => {
        console.error('Помилка при завантаженні профілю: - profile.ts:47', err);
      }
    });
  }
// У ngOnInit або при зміні табу на 'shipping'
loadAddresses() {
  this.userService.getAddresses().subscribe(data => {
    this.userAddresses.set(data);
  });
}

// Додай нові сигнали
isEditingAddress = signal(false);

// Метод для початку редагування
startEditAddress(addr: any) {
  this.newAddress = { ...addr }; // Копіюємо дані в об'єкт форми
  this.isEditingAddress.set(true);
  this.isAddingAddress.set(true); // Відкриваємо ту саму форму
}

// Оновлений saveAddress
saveAddress() {
  if (this.isEditingAddress()) {
    // РЕДАГУВАННЯ — тепер через метод сервісу
    this.userService.updateAddress(this.newAddress.id, this.newAddress).subscribe({
      next: () => {
        this.loadAddresses();
        this.closeAddressForm();
      },
      error: (err) => console.error('Помилка оновлення адреси: - profile.ts:77', err)
    });
  } else {
    // СТВОРЕННЯ НОВОЇ (тут все було ок)
    this.userService.addAddress(this.newAddress).subscribe({
      next: () => {
        this.loadAddresses();
        this.closeAddressForm();
      },
      error: (err) => console.error('Помилка збереження адреси: - profile.ts:86', err)
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

    // Додаємо всі текстові поля в FormData
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined && key !== 'avatarUrl' && key !== 'id' && key !== 'roles') {
        if (key === 'birthDate' && data[key]) {
          formData.append(key, new Date(data[key]).toISOString());
        } else {
          formData.append(key, data[key]);
        }
      }
    });

    // Додаємо файл, якщо він був обраний
    if (this.selectedFile) {
      formData.append('photo', this.selectedFile);
    }

    this.userService.updateProfile(formData).subscribe({
      next: (updatedUser: any) => {
        this.userService.currentUser.set(updatedUser);
        this.isEditing.set(false);
        this.selectedFile = null;
      },
      error: (err) => console.error('Error saving profile - profile.ts:151', err)
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
      alert('Будь ласка, оберіть файл зображення.');
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
      console.error('Помилка завантаження AI дизайнів: - profile.ts:249', err);
    }
  });
}
getDesignImageUrl(url: string): string {
  return this.imageService.getFullImageUrl(url);
}
loadUserCreations() {
    this.designerService.getMyManualDesigns().subscribe({
      next: (data) => this.userCreations.set(data),
      error: (err) => console.error('Помилка creations: - profile.ts:259', err)
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
      console.error('Помилка видалення дизайну: - profile.ts:282', err);
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
    
}