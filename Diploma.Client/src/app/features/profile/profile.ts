// // import { Component, OnInit, inject, signal } from '@angular/core';
// // import { CommonModule } from '@angular/common';
// // import { UserService } from '../../core/services/user.service';
// // import { FormsModule } from '@angular/forms';

// // @Component({
// //   selector: 'app-profile',
// //   standalone: true,
// //   imports: [CommonModule, FormsModule],
// //   templateUrl: './profile.html'
// // })
// // export class ProfileComponent implements OnInit {
// //   private userService = inject(UserService);

// //   isEditing = signal(false);
// //   editForm = signal<any>({});
// //   user = this.userService.currentUser;
// //   userOrders = signal<any[]>([]);
// //   activeTab = signal<'orders' | 'personal' | 'shipping' | 'style'>('orders');

// //   ngOnInit() {
// //     this.userService.getProfile().subscribe({
// //       next: (userData: any) => {
// //         this.userService.currentUser.set(userData);
// //         this.userOrders.set(userData?.orders ?? []);
// //       },
// //       error: (err) => {
// //         console.error('Помилка при завантаженні профілю: - profile.ts:28', err);
// //       }
// //     });
// //   }

// //   getStatusClass(status: string) {
// //     const classes: Record<string, string> = {
// //       'In Progress': 'bg-orange-100 text-orange-600',
// //       'Delivered': 'bg-green-100 text-green-600',
// //       'Pending': 'bg-blue-100 text-blue-600'
// //     };
// //     return classes[status] || 'bg-gray-100 text-gray-600';
// //   }

// //   startEditing() {
// //     const current = this.user();

// //     this.editForm.set({
// //       ...current,
// //       birthDate: this.formatDateForInput(current?.birthDate)
// //     });

// //     this.isEditing.set(true);
// //   }

// //   saveProfile() {
// //     const dataToSave = this.editForm();

// //     this.userService.updateProfile(dataToSave).subscribe({
// //       next: (updatedUser: any) => {
// //         this.userService.currentUser.set(updatedUser ?? dataToSave);
// //         this.isEditing.set(false);
// //       },
// //       error: (err) => {
// //         console.error('Помилка при збереженні: - profile.ts:62', err);
// //       }
// //     });
// //   }

// // formatDateForInput(date: string | Date | null | undefined): string {
// //   if (!date) return '';

// //   // якщо вже string у форматі yyyy-MM-dd
// //   if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
// //     return date;
// //   }

// //   const parsedDate = new Date(date);
// //   if (isNaN(parsedDate.getTime())) return '';

// //   const year = parsedDate.getFullYear();
// //   const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
// //   const day = String(parsedDate.getDate()).padStart(2, '0');

// //   return `${year}-${month}-${day}`;
// // }

// //   getGenderLabel(gender: string | null | undefined): string {
// //     const genderMap: Record<string, string> = {
// //       'Not Specified': 'Prefer not to say',
// //       'Female': 'Female',
// //       'Male': 'Male',
// //       'Other': 'Creative Soul',
// //       'Creative Soul': 'Creative Soul'
// //     };

// //     return gender ? (genderMap[gender] || gender) : '—';
// //   }
// // }
// import { Component, OnInit, inject, signal } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { UserService } from '../../core/services/user.service';
// import { FormsModule } from '@angular/forms';

// @Component({
//   selector: 'app-profile',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './profile.html'
// })
// export class ProfileComponent implements OnInit {
//   private userService = inject(UserService);

//   isEditing = signal(false);
//   editForm = signal<any>({});
//   user = this.userService.currentUser;
//   userOrders = signal<any[]>([]);
//   activeTab = signal<'orders' | 'personal' | 'shipping' | 'style'>('orders');

//   ngOnInit() {
//     this.userService.getProfile().subscribe({
//       next: (userData: any) => {
//         this.userService.currentUser.set(userData);
//         this.userOrders.set(userData?.orders ?? []);
//       },
//       error: (err) => {
//         console.error('Помилка при завантаженні профілю: - profile.ts:124', err);
//       }
//     });
//   }

//   getStatusClass(status: string) {
//     const classes: Record<string, string> = {
//       'In Progress': 'bg-orange-100 text-orange-600',
//       'Delivered': 'bg-green-100 text-green-600',
//       'Pending': 'bg-blue-100 text-blue-600'
//     };
//     return classes[status] || 'bg-gray-100 text-gray-600';
//   }

//   startEditing() {
//     const current = this.user();

//     this.editForm.set({
//       ...current,
//       birthDate: this.formatDateForInput(current?.birthDate)
//     });

//     this.isEditing.set(true);
//   }
// selectedFile: File | null = null;

// onFileSelected(event: any) {
//   const file = event.target.files[0];
//   if (file) {
//     this.selectedFile = file;
    
//     // Показуємо прев'ю в editForm
//     const reader = new FileReader();
//     reader.onload = (e: any) => {
//       this.editForm.update(current => ({ ...current, avatarUrl: e.target.result }));
//     };
//     reader.readAsDataURL(file);
//   }
// }
// saveProfile() {
//   const formData = new FormData();
//   const data = this.editForm();

//   // Додаємо всі текстові поля в FormData
//   Object.keys(data).forEach(key => {
//     if (data[key] !== null && key !== 'avatarUrl') {
//       formData.append(key, data[key]);
//     }
//   });

//   // Додаємо файл, якщо він був обраний
//   if (this.selectedFile) {
//     formData.append('photo', this.selectedFile);
//   }

//   this.userService.updateProfile(formData).subscribe({
//     next: (updatedUser: any) => {
//       this.userService.currentUser.set(updatedUser);
//       this.isEditing.set(false);
//       this.selectedFile = null;
//     },
//     error: (err) => console.error('Error saving profile - profile.ts:185', err)
//   });
// }

// triggerFileInput(input: HTMLInputElement) {
//   if (this.isEditing()) {
//     input.click();
//   }
// }


//   formatDateForInput(date: string | Date | null | undefined): string {
//     if (!date) return '';

//     if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
//       return date;
//     }

//     const parsedDate = new Date(date);
//     if (isNaN(parsedDate.getTime())) return '';

//     const year = parsedDate.getFullYear();
//     const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
//     const day = String(parsedDate.getDate()).padStart(2, '0');

//     return `${year}-${month}-${day}`;
//   }

//   getGenderLabel(gender: string | null | undefined): string {
//     const genderMap: Record<string, string> = {
//       'Not Specified': 'Prefer not to say',
//       'Female': 'Female',
//       'Male': 'Male',
//       'Other': 'Creative Soul',
//       'Creative Soul': 'Creative Soul'
//     };

//     return gender ? (genderMap[gender] || gender) : '—';
//   }

//   onAvatarSelected(event: Event) {
//     const input = event.target as HTMLInputElement;
//     const file = input.files?.[0];

//     if (!file) return;

//     if (!file.type.startsWith('image/')) {
//       alert('Будь ласка, обери файл зображення.');
//       return;
//     }

//     const reader = new FileReader();

//     reader.onload = () => {
//       this.editForm.update((current: any) => ({
//         ...current,
//         avatarUrl: reader.result as string
//       }));
//     };

//     reader.readAsDataURL(file);
//   }
// }

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/services/user.service';
import { FormsModule } from '@angular/forms';
import { ImageService } from '../../core/services/image.service';
// @Component({
//   selector: 'app-profile',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './profile.html'
// })
// export class ProfileComponent implements OnInit {
//   private userService = inject(UserService);

//   isEditing = signal(false);
//   editForm = signal<any>({});
//   user = this.userService.currentUser;
//   userOrders = signal<any[]>([]);
//   activeTab = signal<'orders' | 'personal' | 'shipping' | 'style'>('orders');
//   selectedFile: File | null = null;

//   ngOnInit() {
//     this.userService.getProfile().subscribe({
//       next: (userData: any) => {
//         this.userService.currentUser.set(userData);
//         this.userOrders.set(userData?.orders ?? []);
//       },
//       error: (err) => {
//         console.error('Помилка при завантаженні профілю: - profile.ts:277', err);
//       }
//     });
//   }
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html'
})
export class ProfileComponent implements OnInit {
  private userService = inject(UserService);
  private imageService = inject(ImageService);

  isEditing = signal(false);
  editForm = signal<any>({});
  user = this.userService.currentUser;
  userOrders = signal<any[]>([]);
  activeTab = signal<'orders' | 'personal' | 'shipping' | 'style'>('orders');
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
      },
      error: (err) => {
        console.error('Помилка при завантаженні профілю: - profile.ts:314', err);
      }
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
      error: (err) => console.error('Error saving profile - profile.ts:368', err)
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
}