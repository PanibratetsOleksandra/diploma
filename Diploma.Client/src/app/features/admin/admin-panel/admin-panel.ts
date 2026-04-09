// src/app/features/admin/admin-panel.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CommonModule } from '@angular/common';
import { Product } from '../../../data/product.model';
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterOutlet],
  templateUrl: './admin-panel.html'
})
export class AdminPanelComponent implements OnInit {
  private fb = inject(FormBuilder);
  productService = inject(ProductService);
editingProductId: number | null = null;
  // Список доступних розмірів для вашого бренду
  sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  selectedSizes: string[] = [];

  productForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(1)]],
    materials: ['100% Cotton', Validators.required],
    photoUrl: ['', Validators.required]
  });
  
getMainPhotoUrl(product: Product): string {
  // Шукаємо головне фото
  const mainPhoto = product.photos?.find(p => p.isMain);
  
  // Якщо головне фото знайдено — повертаємо його URL
  // Якщо ні — беремо перше доступне або ставимо "заглушку"
  return mainPhoto?.url || product.photos?.[0]?.url || 'assets/images/placeholder.jpg';
}

ngOnInit() {
  this.productService.getProducts().subscribe({
    next: (products) => {
      // Якщо з сервера прийшло 0 товарів, додаємо наші демо-товари для краси
      if (products.length === 0) {
        this.productService.products.set(this.demoProducts);
      }
    },
    error: (err) => {
      console.error('Помилка завантаження: - admin-panel.ts:49', err);
      // Навіть якщо сервер лежить, показуємо демо-товари, щоб адмінка не була порожньою
      this.productService.products.set(this.demoProducts);
    }
  });
}

  toggleSize(size: string) {
    if (this.selectedSizes.includes(size)) {
      this.selectedSizes = this.selectedSizes.filter(s => s !== size);
    } else {
      this.selectedSizes.push(size);
    }
  }
editProduct(product: Product) {
  this.editingProductId = product.id;

  // Заповнюємо форму основними даними
  this.productForm.patchValue({
    name: product.name,
    description: product.description,
    price: product.price,
    materials: product.materials,
    photoUrl: this.getMainPhotoUrl(product)
  });

  // Оновлюємо вибрані розміри
  this.selectedSizes = [...product.availableSizes];

  // Прокручуємо до форми (опціонально, для зручності)
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
  // onSave() {
  //   if (this.productForm.valid) {
  //     const payload = {
  //       ...this.productForm.value,
  //       availableSizes: this.selectedSizes
  //     };
  //     this.productService.createProduct(payload as any).subscribe(() => {
  //       this.productForm.reset({ price: 0, materials: '100% Cotton' });
  //       this.selectedSizes = [];
  //     });
  //   }
  // }
onSave() {
  if (this.productForm.valid) {
    const rawValue = this.productForm.value;

    // Карта для перетворення тексту в числа (Enum для C#)
    const sizeMap: { [key: string]: number } = {
      'XS': 0, 'S': 1, 'M': 2, 'L': 3, 'XL': 4, 'XXL': 5
    };

    // Формуємо об'єкт продукту
    const productData: any = {
      name: rawValue.name ?? '',
      description: rawValue.description ?? '',
      price: rawValue.price ?? 0,
      materials: rawValue.materials ?? '100% Cotton',
      // Мапимо вибрані розміри в числа
      availableSizes: this.selectedSizes.map(size => sizeMap[size]),
      // Формуємо масив фото
      photos: rawValue.photoUrl ? [{ url: rawValue.photoUrl, isMain: true }] : []
    };

    if (this.editingProductId) {
      // --- РЕЖИМ РЕДАГУВАННЯ ---
      productData.id = this.editingProductId;

      this.productService.updateProduct(this.editingProductId, productData).subscribe({
        next: () => {
          console.log('Успішно оновлено! - admin-panel.ts:120');
          this.resetAfterSave();
        },
        error: (err) => {
          console.error('Помилка оновлення: - admin-panel.ts:124', err);
          alert('Не вдалося оновити: ' + (err.error?.title || err.message));
        }
      });
    } else {
      // --- РЕЖИМ СТВОРЕННЯ ---
      // Видаляємо id, щоб база згенерувала його сама
      delete productData.id;

      this.productService.createProduct(productData).subscribe({
        next: (res) => {
          console.log('Збережено в БД! - admin-panel.ts:135', res);
          this.resetAfterSave();
        },
        error: (err) => {
          console.error('Помилка збереження 400: - admin-panel.ts:139', err.error?.errors);
          alert('Помилка збереження! Перевір консоль (F12), там деталі валідації.');
        }
      });
    }
  }
}
// Допоміжний метод для очищення форми та оновлення списку
resetAfterSave() {
  this.productForm.reset({ price: 0, materials: '100% Cotton' });
  this.selectedSizes = [];
  this.editingProductId = null;
  // Оновлюємо список товарів у таблиці, щоб побачити зміни
  this.productService.getProducts().subscribe();
}

// Онови тип та початкове значення
activeTab: 'products' | 'users' | 'stats' | 'orders' = 'products';

// Метод залишається той самий, він універсальний
setTab(tab: 'products' | 'users' | 'stats' | 'orders') {
  this.activeTab = tab;
}

  // Тимчасові змінні, щоб шаблон не сварився на (isExpanded$ | async)
  // Ми просто кажемо, що панель завжди розгорнута
  isExpanded = true;
  isHovered = false;
  isMobileOpen = false;
deleteProduct(id: number) {
  if (confirm('Ви впевнені, що хочете видалити цей виріб?')) {
    this.productService.deleteProduct(id).subscribe({
      next: () => {
        console.log('Товар видалено з бази - admin-panel.ts:172');
        // Список у таблиці оновиться автоматично, бо ми використовуємо Signal у сервісі
      },
      error: (err) => {
        console.error('Помилка видалення: - admin-panel.ts:176', err);
        alert('Не вдалося видалити товар.');
      }
    });
  }
}

  // Пуста функція, щоб не було помилок при наведенні
  onSidebarMouseEnter() { this.isHovered = true; }
  onSidebarMouseLeave() { this.isHovered = false; }
mockOrders = [
  { id: 101, customer: 'Марія Коваль', product: 'Лонгслів "Магія Роду"', price: 2500, status: 'Нове', date: '2026-04-09' },
  { id: 102, customer: 'Іван Петренко', product: 'Худі Custom Paint', price: 3200, status: 'Відправлено', date: '2026-04-08' },
];
// Дані для демонстрації (Mock Data)
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
