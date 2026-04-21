// import { Component, OnInit, inject, signal } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { UserService } from '../../core/services/user.service';
// import { FormsModule } from '@angular/forms';
// @Component({
//   selector: 'app-profile',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './profile.html' // Переконайся, що файл називається profile.html, а не profile.component.html
// })
// export class ProfileComponent implements OnInit {
//   private userService = inject(UserService);
//   isEditing = signal(false);
//  editForm = signal<any>({}); // Об'єкт для редагування
//   // Беремо дані користувача з сервісу (там вони зберігаються в сигналі)
//   user = this.userService.currentUser;
  
//   // Сигнал для замовлень, який ми використовуємо в HTML через userOrders()
//   userOrders = signal<any[]>([]); 

//   ngOnInit() {
//     this.userService.getProfile().subscribe({
//       next: (userData: any) => {
//         // Якщо в об'єкті з бекенду прийдуть замовлення — записуємо їх
//         if (userData && userData.orders) {
//           this.userOrders.set(userData.orders);
//         }
//       },
//       error: (err) => {
//         console.error('Помилка при завантаженні профілю: - profile.ts:30', err);
//       }
//     });
//   }

//   // Метод для стилізації статусів замовлень
//   getStatusClass(status: string) {
//     const classes: Record<string, string> = {
//       'In Progress': 'bg-orange-100 text-orange-600',
//       'Delivered': 'bg-green-100 text-green-600',
//       'Pending': 'bg-blue-100 text-blue-600'
//     };
//     return classes[status] || 'bg-gray-100 text-gray-600';
//   }
// activeTab = signal<'orders' | 'personal' | 'shipping' | 'style'>('orders');

// // Коли натискаємо "Edit"
// startEditing() {
//   const current = this.user();
//   this.editForm.set({ ...current }); // Копіюємо дані, щоб не змінювати оригінал до збереження
//   this.isEditing.set(true);
// }

// // Збереження
// saveProfile() {
//   const dataToSave = this.editForm();
  
//   this.userService.updateProfile(dataToSave).subscribe({
//     next: () => {
//       this.isEditing.set(false); // Закриваємо режим редагування
//       // Можна додати якесь повідомлення про успіх
//     },
//     error: (err) => {
//       console.error('Помилка при збереженні: - profile.ts:63', err);
//       // Тут можна вивести alert користувачу
//     }
//   });
// }

// }
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/services/user.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html'
})
export class ProfileComponent implements OnInit {
  private userService = inject(UserService);

  isEditing = signal(false);
  editForm = signal<any>({});
  user = this.userService.currentUser;
  userOrders = signal<any[]>([]);
  activeTab = signal<'orders' | 'personal' | 'shipping' | 'style'>('orders');

  ngOnInit() {
    this.userService.getProfile().subscribe({
      next: (userData: any) => {
        // ОНОВЛЮЄМО самого користувача
        this.userService.currentUser.set(userData);

        // Окремо замовлення
        this.userOrders.set(userData?.orders ?? []);
      },
      error: (err) => {
        console.error('Помилка при завантаженні профілю: - profile.ts:100', err);
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
    this.editForm.set({ ...current });
    this.isEditing.set(true);
  }

  saveProfile() {
    const dataToSave = this.editForm();

    this.userService.updateProfile(dataToSave).subscribe({
      next: (updatedUser: any) => {
        this.userService.currentUser.set(updatedUser ?? dataToSave);
        this.isEditing.set(false);
      },
      error: (err) => {
        console.error('Помилка при збереженні: - profile.ts:129', err);
      }
    });
  }
}