import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html' // Переконайся, що файл називається profile.html, а не profile.component.html
})
export class ProfileComponent implements OnInit {
  private userService = inject(UserService);
  
  // Беремо дані користувача з сервісу (там вони зберігаються в сигналі)
  user = this.userService.currentUser;
  
  // Сигнал для замовлень, який ми використовуємо в HTML через userOrders()
  userOrders = signal<any[]>([]); 

  ngOnInit() {
    this.userService.getProfile().subscribe({
      next: (userData: any) => {
        // Якщо в об'єкті з бекенду прийдуть замовлення — записуємо їх
        if (userData && userData.orders) {
          this.userOrders.set(userData.orders);
        }
      },
      error: (err) => {
        console.error('Помилка при завантаженні профілю: - profile.ts:29', err);
      }
    });
  }

  // Метод для стилізації статусів замовлень
  getStatusClass(status: string) {
    const classes: Record<string, string> = {
      'In Progress': 'bg-orange-100 text-orange-600',
      'Delivered': 'bg-green-100 text-green-600',
      'Pending': 'bg-blue-100 text-blue-600'
    };
    return classes[status] || 'bg-gray-100 text-gray-600';
  }
}