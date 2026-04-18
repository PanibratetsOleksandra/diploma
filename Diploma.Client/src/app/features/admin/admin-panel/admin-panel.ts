import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CommonModule } from '@angular/common';
import { Product } from '../../../data/product.model';
import { RouterOutlet } from "@angular/router";
import { UserService } from '../../../core/services/user.service';
import { of } from 'rxjs';
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
  selectedFiles: File[] = [];
tempPreviewUrls: string[] = [];
existingPhotos: any[] = [];
productForm = this.fb.group({
  name: ['', [Validators.required, Validators.minLength(3)]],
  description: ['', Validators.required],
  price: [null as any, [Validators.required, Validators.min(1)]], 
  materials: ['', Validators.required], 
  photoUrl: ['']
});

  ngOnInit() {
    this.productService.getProducts().subscribe({
      next: (products) => {
        if (products.length === 0) {
          this.productService.products.set(this.demoProducts);
        }
      },
      error: (err) => {
        console.error('Помилка завантаження: - admin-panel.ts:43', err);
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
  const photoUrl = mainPhoto?.url || product.photos?.[0]?.url;

  if (!photoUrl) return 'assets/images/placeholder.jpg';

  // Якщо шлях починається з /, додаємо адресу бекенду
  if (photoUrl.startsWith('/')) {
    return `http://localhost:5000${photoUrl}`; // Вкажи свій порт API (5000 або 7001)
  }

  return photoUrl;
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
  // this.editingProductId = product.id;

  // this.productForm.patchValue({
  //   name: product.name,
  //   description: product.description,
  //   price: product.price,
  //   materials: product.materials,
  //   photoUrl: this.getMainPhotoUrl(product)
  // });
  
editProduct(product: Product) {
  this.editingProductId = product.id;
  this.existingPhotos = [...(product.photos || [])]; // Копіюємо існуючі фото
  
  this.productForm.patchValue({
    name: product.name,
    description: product.description,
    price: product.price,
    materials: product.materials
  });

  const names = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  this.selectedSizes = product.availableSizes.map(size => 
    typeof size === 'number' ? names[size] : size
  );

  window.scrollTo({ top: 0, behavior: 'smooth' });
};
removeExistingPhoto(photo: any) {
  this.existingPhotos = this.existingPhotos.filter(p => p !== photo);
}

// 3. Видалення нового (ще не завантаженого) файлу
removeNewFile(index: number) {
  this.selectedFiles.splice(index, 1);
  this.tempPreviewUrls.splice(index, 1);
}

// 4. Допоміжний метод для URL (як ми робили раніше)
getFullUrl(url: string): string {
  return url.startsWith('http') ? url : `http://localhost:5000${url}`;
}
onFileSelected(event: any) {
  const files = event.target.files;
  if (files) {
    this.selectedFiles = Array.from(files);
    
    // Створюємо локальні URL для прев'ю
    this.tempPreviewUrls = this.selectedFiles.map(file => URL.createObjectURL(file));
  }
}



  // onSave() {
  //   if (this.productForm.valid) {
  //     const rawValue = this.productForm.value;

  //     const sizeMap: { [key: string]: number } = {
  //       'XS': 0, 'S': 1, 'M': 2, 'L': 3, 'XL': 4, 'XXL': 5
  //     };

  //     const productData: any = {
  //       name: rawValue.name ?? '',
  //       description: rawValue.description ?? '',
  //       price: rawValue.price ?? 0,
  //       materials: rawValue.materials ?? '100% Cotton',
  //       availableSizes: this.selectedSizes.map(size => sizeMap[size] ?? size),
  //       photos: [{ url: rawValue.photoUrl ?? '', isMain: true }]
  //     };

  //     if (this.editingProductId) {
  //       productData.id = this.editingProductId;
  //       this.productService.updateProduct(this.editingProductId, productData).subscribe({
  //         next: () => {
  //           console.log('Успішно оновлено! - admin-panel.ts:155');
  //           this.resetAfterSave();
  //         },
  //         error: (err) => alert('Не вдалося оновити: ' + (err.error?.title || err.message))
  //       });
  //     } else {
  //       delete productData.id;
  //       this.productService.createProduct(productData).subscribe({
  //         next: () => {
  //           console.log('Збережено в БД! - admin-panel.ts:164');
  //           this.resetAfterSave();
  //         },
  //         error: (err) => {
  //           console.error('Помилка валідації: - admin-panel.ts:168', err.error?.errors);
  //           alert('Помилка збереження! Перевір валідність даних.');
  //         }
  //       });
  //     }
  //   }
  // }
// async onSave() {
//   if (this.productForm.valid) {
//     const rawValue = this.productForm.value;

//     // 1. Створюємо FormData для відправки файлів на бекенд
//     const formData = new FormData();
//     if (this.selectedFiles.length > 0) {
//       this.selectedFiles.forEach(file => {
//         formData.append('files', file); // 'files' має збігатися з назвою в контролері C#
//       });
//     }

//     // 2. Спочатку викликаємо завантаження фото
//     this.productService.uploadImages(formData).subscribe({
//       next: (uploadedUrls: string[]) => {
        
//         // 3. Коли фото завантажені, готуємо дані товару
//         const sizeMap: { [key: string]: number } = {
//           'XS': 0, 'S': 1, 'M': 2, 'L': 3, 'XL': 4, 'XXL': 5
//         };

//         const productData: any = {
//           name: rawValue.name ?? '',
//           description: rawValue.description ?? '',
//           price: rawValue.price ?? 0,
//           materials: rawValue.materials ?? '100% Cotton',
//           availableSizes: this.selectedSizes.map(size => sizeMap[size] ?? size),
//           // Додаємо отримані URL в масив Photos
//           photos: uploadedUrls.map((url, index) => ({
//             url: url,
//             isMain: index === 0 // Робимо перше завантажене фото головним
//           }))
//         };

//         // 4. Зберігаємо або оновлюємо товар у базі
//         if (this.editingProductId) {
//           productData.id = this.editingProductId;
//           this.productService.updateProduct(this.editingProductId, productData).subscribe({
//             next: () => {
//               console.log('Успішно оновлено! - admin-panel.ts:232');
//               this.resetAfterSave();
//             },
//             error: (err) => alert('Не вдалося оновити: ' + (err.error?.title || err.message))
//           });
//         } else {
//           this.productService.createProduct(productData).subscribe({
//             next: () => {
//               console.log('Збережено в БД! - admin-panel.ts:240');
//               this.resetAfterSave();
//             },
//             error: (err) => {
//               console.error('Помилка валідації: - admin-panel.ts:244', err.error?.errors);
//               alert('Помилка збереження!');
//             }
//           });
//         }
//       },
//       error: (err) => {
//         alert('Помилка при завантаженні зображень: ' + err.message);
//       }
//     });
//   }
// }
async onSave() {
  if (this.productForm.valid) {
    const rawValue = this.productForm.value;
    const formData = new FormData();
    this.selectedFiles.forEach(file => formData.append('files', file));

    // Спочатку вантажимо НОВІ фото (якщо вони є)
    const uploadObs = this.selectedFiles.length > 0 
      ? this.productService.uploadImages(formData) 
      : of([]); // Якщо нових фото немає, просто повертаємо порожній масив

    uploadObs.subscribe({
      next: (newUrls: string[]) => {
        const sizeMap: { [key: string]: number } = { 'XS': 0, 'S': 1, 'M': 2, 'L': 3, 'XL': 4, 'XXL': 5 };

        // ОБ'ЄДНУЄМО: старі фото (які залишилися) + нові завантажені
        const allPhotos = [
          ...this.existingPhotos,
          ...newUrls.map((url, index) => ({
            url: url,
            isMain: this.existingPhotos.length === 0 && index === 0 // Main, якщо старих немає
          }))
        ];

        const productData: any = {
          name: rawValue.name,
          description: rawValue.description,
          price: rawValue.price,
          materials: rawValue.materials,
          availableSizes: this.selectedSizes.map(size => sizeMap[size] ?? size),
          photos: allPhotos
        };

        if (this.editingProductId) {
          productData.id = this.editingProductId;
          this.productService.updateProduct(this.editingProductId, productData).subscribe({
            next: () => this.resetAfterSave(),
            error: (err) => alert('Помилка оновлення')
          });
        } else {
          this.productService.createProduct(productData).subscribe({
            next: () => this.resetAfterSave(),
            error: (err) => alert('Помилка збереження')
          });
        }
      }
    });
  }
}
  deleteProduct(id: number) {
    if (confirm('Ви впевнені, що хочете видалити цей виріб?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => console.log('Товар видалено - admin-panel.ts:309'),
        error: (err) => alert('Не вдалося видалити товар.')
      });
    }
  }

resetAfterSave() {
  // Скидаємо форму до порожніх значень
  this.productForm.reset();
  
  // Очищуємо всі дані, пов'язані з розмірами та фото
  this.selectedSizes = [];
  this.existingPhotos = [];   // <--- Обов'язково очищуємо старі фото
  this.selectedFiles = [];    // <--- Очищуємо обрані файли
  this.tempPreviewUrls = [];  // <--- Очищуємо прев'ю картинки
  
  this.editingProductId = null;
  
  // Оновлюємо список товарів з сервера
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