import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CommonModule } from '@angular/common';
import { Product } from '../../../data/product.model';
import { RouterOutlet } from "@angular/router";
import { UserService } from '../../../core/services/user.service';
@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-panel.html'
})
export class AdminPanelComponent implements OnInit {
  private fb = inject(FormBuilder);
  productService = inject(ProductService);
  userService = inject(UserService);
  editingProductId: number | null = null;
  activeTab: 'products' | 'users' | 'stats' | 'orders' = 'products';

  sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  selectedSizes: string[] = [];

  productForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(1)]],
    materials: ['100% Cotton', Validators.required],
    photoUrl: ['', Validators.required]
  });

  ngOnInit() {
    this.productService.getProducts().subscribe({
      next: (products) => {
        if (products.length === 0) {
          this.productService.products.set(this.demoProducts);
        }
      },
      error: (err) => {
        console.error('Помилка завантаження: - admin-panel.ts:40', err);
        this.productService.products.set(this.demoProducts);
      }
    });
    this.userService.getUsers().subscribe();
  }
    toggleUserLock(user: any) {
  this.userService.toggleLock(user.id).subscribe({
    next: (res) => {
      // Оновлюємо статус локально, щоб миттєво побачити зміни
      user.isLocked = res.isLocked; 
      // Або просто перевантажуємо список
      this.userService.getUsers().subscribe();
    }
  });
}

// Допоміжний метод для перевірки статусу в HTML
isUserLocked(user: any): boolean {
  if (!user.lockoutEnd) return false;
  return new Date(user.lockoutEnd) > new Date();
}
deleteUser(id: string) {
    if (confirm('Ви впевнені, що хочете видалити цього користувача?')) {
      this.userService.deleteUser(id).subscribe({
        error: (err) => alert('Не вдалося видалити: ' + err.message)
      });
    }  }
  getMainPhotoUrl(product: Product): string {
    const mainPhoto = product.photos?.find(p => p.isMain);
    return mainPhoto?.url || product.photos?.[0]?.url || 'assets/images/placeholder.jpg';
  }

  setTab(tab: 'products' | 'users' | 'stats' | 'orders') {
    this.activeTab = tab;
  }

  toggleSize(size: string) {
    if (this.selectedSizes.includes(size)) {
      this.selectedSizes = this.selectedSizes.filter(s => s !== size);
    } else {
      this.selectedSizes.push(size);
    }
  }

  // editProduct(product: Product) {
  //   this.editingProductId = product.id;
  //   this.productForm.patchValue({
  //     name: product.name,
  //     description: product.description,
  //     price: product.price,
  //     materials: product.materials,
  //     photoUrl: this.getMainPhotoUrl(product)
  //   });
  //   this.selectedSizes = [...product.availableSizes as any];
  //   window.scrollTo({ top: 0, behavior: 'smooth' });
  // }

  editProduct(product: Product) {
  this.editingProductId = product.id;

  this.productForm.patchValue({
    name: product.name,
    description: product.description,
    price: product.price,
    materials: product.materials,
    photoUrl: this.getMainPhotoUrl(product)
  });

  // Конвертуємо цифри з бази назад у букви для кнопок форми
  const names = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  this.selectedSizes = product.availableSizes.map(size => 
    typeof size === 'number' ? names[size] : size
  );

  window.scrollTo({ top: 0, behavior: 'smooth' });
}
  onSave() {
    if (this.productForm.valid) {
      const rawValue = this.productForm.value;

      const sizeMap: { [key: string]: number } = {
        'XS': 0, 'S': 1, 'M': 2, 'L': 3, 'XL': 4, 'XXL': 5
      };

      const productData: any = {
        name: rawValue.name ?? '',
        description: rawValue.description ?? '',
        price: rawValue.price ?? 0,
        materials: rawValue.materials ?? '100% Cotton',
        availableSizes: this.selectedSizes.map(size => sizeMap[size] ?? size),
        photos: [{ url: rawValue.photoUrl ?? '', isMain: true }]
      };

      if (this.editingProductId) {
        productData.id = this.editingProductId;
        this.productService.updateProduct(this.editingProductId, productData).subscribe({
          next: () => {
            console.log('Успішно оновлено! - admin-panel.ts:138');
            this.resetAfterSave();
          },
          error: (err) => alert('Не вдалося оновити: ' + (err.error?.title || err.message))
        });
      } else {
        delete productData.id;
        this.productService.createProduct(productData).subscribe({
          next: () => {
            console.log('Збережено в БД! - admin-panel.ts:147');
            this.resetAfterSave();
          },
          error: (err) => {
            console.error('Помилка валідації: - admin-panel.ts:151', err.error?.errors);
            alert('Помилка збереження! Перевір валідність даних.');
          }
        });
      }
    }
  }

  deleteProduct(id: number) {
    if (confirm('Ви впевнені, що хочете видалити цей виріб?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => console.log('Товар видалено - admin-panel.ts:162'),
        error: (err) => alert('Не вдалося видалити товар.')
      });
    }
  }

  resetAfterSave() {
    this.productForm.reset({ price: 0, materials: '100% Cotton' });
    this.selectedSizes = [];
    this.editingProductId = null;
    this.productService.getProducts().subscribe();
  }

  // Sidebar mocks
  isExpanded = true;
  isHovered = false;
  isMobileOpen = false;
  onSidebarMouseEnter() { this.isHovered = true; }
  onSidebarMouseLeave() { this.isHovered = false; }

getSizeName(size: any): string {
  const names = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  // Якщо прийшло число (з бази) — беремо назву з масиву
  if (typeof size === 'number') {
    return names[size] || 'Unknown';
  }
  // Якщо вже рядок (демо-дані) — повертаємо як є
  return size;
}

  mockOrders = [
    { id: 101, customer: 'Марія Коваль', product: 'Лонгслів "Магія Роду"', price: 2500, status: 'Нове', date: '2026-04-09' },
    { id: 102, customer: 'Іван Петренко', product: 'Худі Custom Paint', price: 3200, status: 'Відправлено', date: '2026-04-08' },
  ];

  demoProducts: any[] = [
    {
      id: 1,
      name: 'Лонгслів "Магія Роду"',
      description: 'Ручний розпис з використанням традиційних українських орнаментів у сучасному стилі.',
      materials: '100% Бавовна',
      price: 2450,
      availableSizes: ['S', 'M', 'L'],
      photos: [{ url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=400', isMain: true }]
    },
    {
      id: 2,
      name: 'Худі "Gravity Paint"',
      description: 'Абстрактні підтьоки фарби, створені спеціальною технікою нашарування.',
      materials: 'Трьохнитка на флісі',
      price: 3800,
      availableSizes: ['M', 'L', 'XL'],
      photos: [{ url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=400', isMain: true }]
    },
    {
      id: 3,
      name: 'Футболка "Сила Духу"',
      description: 'Мінімалістичний принт на грудях, виконаний стійкими акриловими фарбами для текстилю.',
      materials: '95% Бавовна, 5% Еластан',
      price: 1200,
      availableSizes: ['XS', 'S', 'M'],
      photos: [{ url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=400', isMain: true }]
    }
  ];


}