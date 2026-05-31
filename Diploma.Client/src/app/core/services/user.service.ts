import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, tap } from 'rxjs';
import { User } from '../models/user.model';
import { OrderStatus } from '../../core/enums/order-status.enum';

@Injectable({ providedIn: 'root' })
export class UserService {
  private api = inject(ApiService);
  users = signal<User[]>([]);
  
  currentUser = signal<User | null>(null);
getProfile(): Observable<User> {
  return this.api.get<User>('users/profile').pipe(
    tap(user => {
      const mappedUser: User = { 
        ...user, 
        roles: user.roles || ['User'],
        firstName: user.firstName || user.userName 
      };
      this.currentUser.set(mappedUser);
    })
  );
}


  getUsers(): Observable<User[]> {
    return this.api.get<User[]>('users').pipe(
      tap(data => {
        const mappedData = data.map(u => ({ ...u, roles: u.roles || ['User'] }));
        this.users.set(mappedData);
      })
    );
  }

  deleteUser(id: string): Observable<void> {
    return this.api.delete<void>(`users/${id}`).pipe(
      tap(() => {
        this.users.update(prev => prev.filter(u => u.id !== id));
      })
    );
  }

  toggleLock(id: string): Observable<{isLocked: boolean}> {
    return this.api.post<{isLocked: boolean}>(`users/${id}/toggle-lock`, {});
  }

updateAddress(id: number, address: any): Observable<any> {
  return this.api.put<any>(`addresses/${id}`, address);
}
updateProfile(formData: FormData): Observable<any> {
  return this.api.put<any>('users/profile', formData);
}

getAddresses(): Observable<any[]> {
  return this.api.get<any[]>('addresses');
}

addAddress(address: any): Observable<any> {
  return this.api.post<any>('addresses', address);
}

deleteAddress(id: number): Observable<void> {
  return this.api.delete<void>(`addresses/${id}`);
}
createOrder(orderData: any): Observable<any> {
  return this.api.post<any>('orders', orderData);
}

getMyOrders(): Observable<any[]> {
  return this.api.get<any[]>('orders/my');
}

getAllOrders(): Observable<any[]> {
  return this.api.get<any[]>('orders');
}

updateOrderStatus(orderId: number, status: OrderStatus): Observable<any> {
  return this.api.put<any>(
    `orders/${orderId}/status`,
    { status }
  );
}

  getGarmentPrices(): Observable<any[]> {
    return this.api.get<any[]>('garmentprices');
  }

  updateGarmentPrice(id: number, basePrice: number): Observable<any> {
    return this.api.put<any>(`garmentprices/${id}`, basePrice);
  }

  postGarmentPrice(garment: any): Observable<any> {
  return this.api.post<any>('garmentprices', garment);
}

deleteGarmentPrice(id: number): Observable<any> {
  return this.api.delete<any>(`garmentprices/${id}`);
}

subscribeToNewsletter(email: string): Observable<any> {
return this.api.post<any>('newsletter/subscribe', { email });
}

getNewsletterSubscribers(): Observable<any[]> {
  return this.api.get<any[]>('newsletter/subscribers');
}
}