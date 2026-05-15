import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CommonModule } from '@angular/common';
import { Product } from '../../../data/product.model';
import { UserService } from '../../../core/services/user.service';
import { of } from 'rxjs';
import { OrderStatus } from '../../../core/enums/order-status.enum';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { FormsModule } from '@angular/forms'; 
@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,FormsModule,],
  templateUrl: './admin-panel.html'
})
export class AdminPanelComponent implements OnInit {
  private fb = inject(FormBuilder);
  productService = inject(ProductService);
  userService = inject(UserService);
private router = inject(Router);
public authService = inject(AuthService);
  editingProductId: number | null = null;
activeTab: 'products' | 'users' | 'stats' | 'orders' | 'prices' = 'products';
  revenueTab = signal<'months' | 'years'>('months');
  garmentPrices = signal<any[]>([]);
  
  sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  selectedSizes: string[] = [];
  selectedFiles: File[] = [];
  tempPreviewUrls: string[] = [];
  existingPhotos: any[] = [];

  // Реальні замовлення
  orders = signal<any[]>([]);
  selectedOrder = signal<any | null>(null);
  isOrderDetailsOpen = signal(false);
  toastMessage = signal('');
  toastType = signal<'success' | 'error'>('success');

  // Статуси замовлень
orderStatuses = Object.values(OrderStatus);

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
        console.error('Помилка завантаження товарів: - admin-panel.ts:61', err);
        this.productService.products.set(this.demoProducts);
      }
    });

    this.userService.getUsers().subscribe();
    this.loadRealOrders(); 
    this.loadGarmentPrices();
  }

  
  loadRealOrders() {
    this.userService.getAllOrders().subscribe({
      next: (data) => {
        this.orders.set(data);
      },
      error: (err) => console.error('Помилка завантаження замовлень: - admin-panel.ts:77', err)
    });
  }
// admin-panel.ts

// admin-panel.ts

navigateToProduct(item: any) {
  // Отримуємо ID продукту
  const productId = item.originalId || item.id;
  
  // Спочатку закриваємо модалку деталей, щоб не заважала
  this.closeOrderDetails();

  if (item.type === 'product' && productId) {
    // Звичайний товар веде на свою публічну сторінку
    this.router.navigate(['/product', productId]);
  } else {
    // Кастомний ШІ-дизайн або конструктор ведуть на нову інтерактивну сторінку
    // Передаємо весь об'єкт item у state роутера
    this.router.navigate(['/custom-detail/:id'], { state: { item: item } });
  }
}

 changeOrderStatus(orderId: number, event: Event) {
  const selectElement = event.target as HTMLSelectElement;

  const newStatus = selectElement.value as OrderStatus;

  this.userService.updateOrderStatus(orderId, newStatus).subscribe({
    next: () => {
      this.orders.update(allOrders =>
        allOrders.map(o =>
          o.id === orderId
            ? { ...o, status: newStatus }
            : o
        )
      );

      console.log(
        `Статус замовлення #${orderId} оновлено на: ${newStatus}`
      );
    },
    error: (err) => {
      console.error(err);
      alert('Не вдалося змінити статус замовлення');
    }
  });
}


  // Відкриття та закриття модалки замовлення
  viewOrderDetails(order: any) {
    this.selectedOrder.set(order);
    this.isOrderDetailsOpen.set(true);
  }

  closeOrderDetails() {
    this.selectedOrder.set(null);
    this.isOrderDetailsOpen.set(false);
  }

  // Парсинг JSON-адреси
  parseShipping(shippingStr: string) {
    try {
      return JSON.parse(shippingStr);
    } catch {
      return shippingStr;
    }
  }

  // ... [Решта твоїх існуючих методів: deleteUser, toggleUserLock, editProduct, removeExistingPhoto, і т.д.] ...
  toggleUserLock(user: any) {
    this.userService.toggleLock(user.id).subscribe({
      next: (res) => {
        user.isLocked = res.isLocked;
        this.userService.getUsers().subscribe();
      }
    });
  }

  isUserLocked(user: any): boolean {
    if (!user.lockoutEnd) return false;
    return new Date(user.lockoutEnd) > new Date();
  }

  deleteUser(id: string) {
    if (confirm('Ви впевнені, що хочете видалити цього користувача?')) {
      this.userService.deleteUser(id).subscribe({
        error: (err) => alert('Не вдалося видалити: ' + err.message)
      });
    }  
  }

  getMainPhotoUrl(product: Product): string {
    const mainPhoto = product.photos?.find(p => p.isMain);
    const photoUrl = mainPhoto?.url || product.photos?.[0]?.url;
    if (!photoUrl) return 'assets/images/placeholder.jpg';
    if (photoUrl.startsWith('/')) {
      return `http://localhost:5000${photoUrl}`;
    }
    return photoUrl;
  }

setTab(tab: 'products' | 'users' | 'stats' | 'orders' | 'prices') {
  this.activeTab = tab;
  if (tab === 'orders') {
    this.loadRealOrders();
  }
  if (tab === 'prices') {
    this.loadGarmentPrices(); 
  }
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
    this.existingPhotos = [...(product.photos || [])];
    this.productForm.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      materials: product.materials
    });
    const names = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    this.selectedSizes = product.availableSizes.map(size => typeof size === 'number' ? names[size] : size );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  removeExistingPhoto(photo: any) {
    this.existingPhotos = this.existingPhotos.filter(p => p !== photo);
  }

  removeNewFile(index: number) {
    this.selectedFiles.splice(index, 1);
    this.tempPreviewUrls.splice(index, 1);
  }

  getFullUrl(url: string): string {
    return url.startsWith('http') ? url : `http://localhost:5000${url}`;
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files) {
      this.selectedFiles = Array.from(files);
      this.tempPreviewUrls = this.selectedFiles.map(file => URL.createObjectURL(file));
    }
  }

  async onSave() {
    if (this.productForm.valid) {
      const rawValue = this.productForm.value;
      const formData = new FormData();
      this.selectedFiles.forEach(file => formData.append('files', file));

      const uploadObs = this.selectedFiles.length > 0 ? this.productService.uploadImages(formData) : of([]);

      uploadObs.subscribe({
        next: (newUrls: string[]) => {
          const sizeMap: { [key: string]: number } = { 'XS': 0, 'S': 1, 'M': 2, 'L': 3, 'XL': 4, 'XXL': 5 };
          const allPhotos = [
            ...this.existingPhotos,
            ...newUrls.map((url, index) => ({
              url: url,
              isMain: this.existingPhotos.length === 0 && index === 0
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
        next: () => console.log('Товар видалено - admin-panel.ts:282'),
        error: (err) => alert('Не вдалося видалити товар.')
      });
    }
  }

  resetAfterSave() {
    this.productForm.reset();
    this.selectedSizes = [];
    this.existingPhotos = [];
    this.selectedFiles = [];
    this.tempPreviewUrls = [];
    this.editingProductId = null;
    this.productService.getProducts().subscribe();
  }

  getSizeName(size: any): string {
    const names = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    if (typeof size === 'number') {
      return names[size] || 'Unknown';
    }
    return size;
  }

  demoProducts: any[] = [
    { id: 1, name: 'Лонгслів "Магія Роду"', description: 'Ручний розпис з використанням традиційних українських орнаментів у сучасному стилі.', materials: '100% Бавовна', price: 2450, availableSizes: ['S', 'M', 'L'], photos: [{ url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=400', isMain: true }] }
  ];

// 🔥 ЧИСТА ФІЛЬТРАЦІЯ: Виводимо в таблицю ТІЛЬКИ користувачів з роллю "User"
  get filteredUsers(): any[] {
    const allUsers = this.userService.users() || [];
    const currentAdminId = this.authService.currentUser()?.id;

    return allUsers.filter(user => {
      // 1. Перевіряємо, чи масив ролей користувача містить роль 'User' (регістронезалежно)
      const hasUserRole = user.roles?.some((role: string) => role.toLowerCase() === 'user');
      
      // 2. Перевіряємо, щоб це не був твій власний акаунт, з якого ти зараз сидиш
      const isNotMe = user.id !== currentAdminId;

      // Користувач проходить у таблицю, тільки якщо він клієнт і це не поточний адмін
      return hasUserRole && isNotMe;
    });
  }

// 1. Загальний дохід (Revenue)
get totalRevenue(): number {
  return this.orders().reduce((sum, order) => sum + (order.totalAmount || 0), 0);
}

// 2. Середній чек (Average Order Value - AOV)
get averageOrderValue(): number {
  const count = this.orders().length;
  return count > 0 ? Math.round(this.totalRevenue / count) : 0;
}

// 3. Кількість кастомних замовлень (AI + Конструктор) для маркетингового фокусу
get customOrdersCount(): number {
  return this.orders().reduce((count, order) => {
    const hasCustom = order.items?.some((item: any) => item.type === 'manual-design' || item.type === 'ai-design');
    return count + (hasCustom ? 1 : 0);
  }, 0);
}

// 4. Розрахунок відсотка унікальних кастомів у замовленнях (для диплома про "AI та персоналізацію")
get customSharePercentage(): number {
  const total = this.orders().length;
  if (total === 0) return 0;
  return Math.round((this.customOrdersCount / total) * 100);
}

// 5. Отримання даних для графіка продажів по днях (останні 7 замовлень)
get salesGraphData() {
  const lastOrders = [...this.orders()]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .slice(-7);
    
  const maxAmount = Math.max(...lastOrders.map(o => o.totalAmount || 1), 1000);
  
  return lastOrders.map(o => ({
    id: o.id,
    date: new Date(o.createdAt).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' }),
    amount: o.totalAmount,
    // Розраховуємо висоту стовпчика у відсотках для CSS
    heightPercent: Math.min(Math.round((o.totalAmount / maxAmount) * 100), 100)
  }));
}

// 6. Співвідношення категорій (для кругової діаграми)
get categoryDistribution() {
  let productCount = 0;
  let manualCount = 0;
  let aiCount = 0;

  this.orders().forEach(order => {
    order.items?.forEach((item: any) => {
      if (item.type === 'product') productCount += item.quantity || 1;
      if (item.type === 'manual-design') manualCount += item.quantity || 1;
      if (item.type === 'ai-design') aiCount += item.quantity || 1;
    });
  });

  const total = productCount + manualCount + aiCount || 1;
  return {
    product: { count: productCount, percent: Math.round((productCount / total) * 100) },
    manual: { count: manualCount, percent: Math.round((manualCount / total) * 100) },
    ai: { count: aiCount, percent: Math.round((aiCount / total) * 100) }
  };
}
// admin-panel.ts (Додаємо аналітику трендів, логістики та екологічного ефекту)

// 1. АНАЛІТИКА AI-ПРОМПТІВ: аналізуємо слова, які найчастіше зустрічаються в notes для ai-design
get topAiKeywords() {
  const aiItems = this.orders()
    .flatMap(o => o.items || [])
    .filter((item: any) => item.type === 'ai-design' && item.notes);

  if (aiItems.length === 0) {
    // Дефолтні тренди для демонстрації, якщо реальних замовлень з ШІ ще замало
    return [
      { word: 'український орнамент', count: 12, percentage: 85 },
      { word: 'тризуб', count: 8, percentage: 56 },
      { word: 'етно-модерн', count: 6, percentage: 42 },
      { word: 'квіти', count: 5, percentage: 35 }
    ];
  }

  const wordCounts: { [key: string]: number } = {};
  
  // Простий парсер слів (ігноруємо прийменники)
  const stopWords = ['в', 'на', 'з', 'і', 'та', 'для', 'як', 'це', 'у', 'а', 'то'];
  
  aiItems.forEach((item: any) => {
    const words = item.notes.toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "") // прибираємо пунктуацію
      .split(/\s+/);
      
    words.forEach((w: string) => {
      if (w.length > 3 && !stopWords.includes(w)) {
        wordCounts[w] = (wordCounts[w] || 0) + 1;
      }
    });
  });

  const sortedKeywords = Object.keys(wordCounts)
    .map(key => ({
      word: key,
      count: wordCounts[key],
      percentage: Math.min(Math.round((wordCounts[key] / aiItems.length) * 100), 100)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  return sortedKeywords;
}

// 2. ГЕОГРАФІЯ ТА ЛОГІСТИКА: аналізуємо міста та типи доставки з JSON-рядка shippingDetails
get logisticsAnalytics() {
  const stats = {
    cities: {} as { [key: string]: number },
    methods: { novaPoshta: 0, ukrPoshta: 0, self: 0 },
    types: { warehouse: 0, postomat: 0, courier: 0 }
  };

  let analyzedCount = 0;

  this.orders().forEach(order => {
    if (!order.shippingDetails) return;
    try {
      const shipping = JSON.parse(order.shippingDetails);
      if (!shipping) return;
      
      analyzedCount++;

      // Рахуємо міста
      const city = shipping.city || 'Інші';
      stats.cities[city] = (stats.cities[city] || 0) + 1;

      // Рахуємо служби доставки
      const service = shipping.deliveryService?.toLowerCase() || '';
      if (service.includes('nova') || service.includes('novaposhta')) stats.methods.novaPoshta++;
      else if (service.includes('ukr')) stats.methods.ukrPoshta++;
      else stats.methods.self++;

      // Рахуємо типи точок
      const type = shipping.deliveryType?.toLowerCase() || '';
      if (type.includes('warehouse') || type.includes('відділення')) stats.types.warehouse++;
      else if (type.includes('postomaten') || type.includes('поштомат')) stats.types.postomat++;
      else stats.types.courier++;

    } catch (e) {
      // Якщо в базі лежить не JSON, а простий рядок
      const text = order.shippingDetails.toLowerCase();
      analyzedCount++;
      if (text.includes('київ')) stats.cities['Київ'] = (stats.cities['Київ'] || 0) + 1;
      else if (text.includes('житомир')) stats.cities['Житомир'] = (stats.cities['Житомир'] || 0) + 1;
      else stats.cities['Інші'] = (stats.cities['Інші'] || 0) + 1;
      
      stats.methods.novaPoshta++; // дефолт
    }
  });

  // Топ-3 міста
  const topCities = Object.keys(stats.cities)
    .map(name => ({
      name,
      count: stats.cities[name],
      percent: analyzedCount > 0 ? Math.round((stats.cities[name] / analyzedCount) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return {
    topCities: topCities.length > 0 ? topCities : [{ name: 'Житомир', count: 1, percent: 100 }],
    novaPercent: analyzedCount > 0 ? Math.round((stats.methods.novaPoshta / analyzedCount) * 100) : 100,
    warehousePercent: analyzedCount > 0 ? Math.round((stats.types.warehouse / analyzedCount) * 100) : 70,
    postomatPercent: analyzedCount > 0 ? Math.round((stats.types.postomat / analyzedCount) * 100) : 30
  };
}

// 3. ЕКОЛОГІЧНИЙ КАЛЬКУЛЯТОР (Sustainability Impact):
// Кожне кастомне замовлення зменшує споживання мас-маркету.
// Наукові константи: виробництво 1 нової худі/джинсовки витрачає ~2500 літрів води та виділяє ~10 кг CO2.
get sustainabilityImpact() {
  const customCount = this.customOrdersCount; // Використовуємо наш геттер кількості кастомів
  
  return {
    savedWater: customCount * 2500, // літрів
    savedCo2: customCount * 10,     // кг
    upcycledItems: customCount      // утилізовано/врятовано текстилю
  };
}



// admin-panel.ts (Додаткові метрики для супер-аналітики)

// 1. Щомісячний дохід за останні 6 місяців (Monthly revenue chart)
get monthlyRevenueData() {
  const monthsData: { [key: string]: number } = {};
  const today = new Date();

  // Ініціалізуємо останні 6 місяців нулями
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthKey = d.toLocaleDateString('uk-UA', { month: 'short', year: '2-digit' });
    monthsData[monthKey] = 0;
  }

  // Наповнюємо реальними сумами з бази
  this.orders().forEach(o => {
    const orderDate = new Date(o.createdAt);
    const monthKey = orderDate.toLocaleDateString('uk-UA', { month: 'short', year: '2-digit' });
    if (monthsData[monthKey] !== undefined) {
      monthsData[monthKey] += (o.totalAmount || 0);
    }
  });

  const maxRevenue = Math.max(...Object.values(monthsData), 1000);

  return Object.keys(monthsData).map(key => ({
    month: key,
    revenue: monthsData[key],
    heightPercent: Math.min(Math.round((monthsData[key] / maxRevenue) * 100), 100)
  }));
}

// 2. Розподіл замовлень за статусами (Order status breakdown)
get orderStatusBreakdown() {
  const counts: { [key: string]: number } = {};
  // Ініціалізуємо всіма можливими статусами з твого Enum
  this.orderStatuses.forEach(status => counts[status] = 0);

  this.orders().forEach(o => {
    if (counts[o.status] !== undefined) {
      counts[o.status]++;
    } else {
      counts[o.status] = 1;
    }
  });

  const total = this.orders().length || 1;
  return Object.keys(counts).map(status => ({
    status,
    count: counts[status],
    percent: Math.round((counts[status] / total) * 100)
  }));
}

// 3. Топ-продажів бренду за кількістю (Top selling products from orders)
get topSellingProducts() {
  const productSales: { [key: string]: { name: string, count: number, img: string } } = {};

  this.orders().forEach(order => {
    order.items?.forEach((item: any) => {
      // Нас цікавлять саме готові товари з каталогу
      if (item.type === 'product') {
        if (!productSales[item.name]) {
          productSales[item.name] = { 
            name: item.name, 
            count: 0, 
            img: item.imageUrl 
          };
        }
        productSales[item.name].count += item.quantity || 1;
      }
    });
  });

  return Object.values(productSales)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3); // Топ-3
}

// 4. Популярні розміри з усіх товарів та кастомів (Popular sizes)
get popularSizesData() {
  const sizeCounts: { [key: string]: number } = {};

  this.orders().forEach(order => {
    order.items?.forEach((item: any) => {
      const size = item.size?.toUpperCase() || 'M';
      sizeCounts[size] = (sizeCounts[size] || 0) + (item.quantity || 1);
    });
  });

  const total = Object.values(sizeCounts).reduce((sum, val) => sum + val, 0) || 1;

  return Object.keys(sizeCounts).map(size => ({
    size,
    count: sizeCounts[size],
    percent: Math.round((sizeCounts[size] / total) * 100)
  })).sort((a, b) => b.count - a.count).slice(0, 4);
}

// 5. Середня кількість товарів у замовленні (Average items per order)
get averageItemsPerOrder(): number {
  const totalOrders = this.orders().length;
  if (totalOrders === 0) return 0;

  const totalItems = this.orders().reduce((sum, order) => {
    const itemsCount = order.items?.reduce((iSum: number, item: any) => iSum + (item.quantity || 1), 0) || 0;
    return sum + itemsCount;
  }, 0);

  return parseFloat((totalItems / totalOrders).toFixed(1));
}

// 6. Розподіл методів оплати (Payment method distribution)
get paymentMethodDistribution() {
  let cardCount = 0;
  let cashCount = 0;

  this.orders().forEach(o => {
    if (o.paymentMethod === 'card') cardCount++;
    else cashCount++;
  });

  const total = this.orders().length || 1;
  return {
    cardPercent: Math.round((cardCount / total) * 100),
    cashPercent: Math.round((cashCount / total) * 100),
    cardCount,
    cashCount
  };
}

// 7. Показники утримання клієнтів: Нові проти Постійних (Customer retention metrics)
get customerRetentionData() {
  const customerOrders: { [key: string]: number } = {};

  this.orders().forEach(o => {
    const email = o.customerEmail?.toLowerCase().trim();
    if (email) {
      customerOrders[email] = (customerOrders[email] || 0) + 1;
    }
  });

  let newCustomers = 0;       // Зробили лише 1 замовлення
  let returningCustomers = 0; // Зробили 2 і більше замовлень

  Object.values(customerOrders).forEach(count => {
    if (count > 1) returningCustomers++;
    else newCustomers++;
  });

  const totalCustomers = (newCustomers + returningCustomers) || 1;

  return {
    newPercent: Math.round((newCustomers / totalCustomers) * 100),
    returningPercent: Math.round((returningCustomers / totalCustomers) * 100),
    newCount: newCustomers,
    returningCount: returningCustomers
  };
}

// Річний дохід за весь час (Yearly revenue chart)
get yearlyRevenueData() {
  const yearsData: { [key: string]: number } = {};

  // Групуємо суми замовлень по роках
  this.orders().forEach(o => {
    const year = new Date(o.createdAt).getFullYear().toString();
    yearsData[year] = (yearsData[year] || 0) + (o.totalAmount || 0);
  });

  // Якщо замовлень ще немає, покажемо поточний рік як нульовий орієнтир
  const currentYear = new Date().getFullYear().toString();
  if (Object.keys(yearsData).length === 0) {
    yearsData[currentYear] = 0;
  }

  const maxRevenue = Math.max(...Object.values(yearsData), 1000);

  // Сортуємо роки по порядку зростання
  return Object.keys(yearsData)
    .sort()
    .map(year => ({
      year,
      revenue: yearsData[year],
      heightPercent: Math.min(Math.round((yearsData[year] / maxRevenue) * 100), 100)
    }));


    
}


// 3. Метод завантаження
loadGarmentPrices() {
  // Використовуємо ApiService або HttpClient
  this.userService.getGarmentPrices().subscribe({
    next: (data) => this.garmentPrices.set(data),
    error: (err) => console.error('Помилка завантаження цін: - admin-panel.ts:714', err)
  });
}

// 4. Метод оновлення
updateGarmentPrice(item: any) {
  this.userService.updateGarmentPrice(item.id, item.basePrice).subscribe({
    next: () => {
      this.showToast(`Ціну на ${item.garmentType} успішно оновлено!`, 'success');
      this.loadGarmentPrices(); // освіжаємо дані
    },
    error: (err) => {
      this.showToast('Не вдалося оновити ціну', 'error');
      console.error(err);
    }
  });
}

showToast(message: string, type: 'success' | 'error' = 'success'): void {
    this.toastMessage.set(message);
    this.toastType.set(type);
    
    // Ховаємо повідомлення через 3 секунди
    setTimeout(() => {
      this.toastMessage.set('');
    }, 3000);
  }

  addNewGarment(type: string, price: number) {
  if (!type || !price) {
    this.showToast('Заповніть назву та ціну', 'error');
    return;
  }

  const newGarment = {
    garmentType: type,
    basePrice: price
  };

  // Викликаємо сервіс (потрібно буде додати метод postGarmentPrice у UserService)
  this.userService.postGarmentPrice(newGarment).subscribe({
    next: () => {
      this.showToast(`Виріб ${type} додано!`, 'success');
      this.loadGarmentPrices(); // Оновлюємо список
    },
    error: (err) => this.showToast('Такий тип вже існує або помилка сервера', 'error')
  });
}

deleteGarmentPrice(id: number) {
  if (confirm('Ви впевнені, що хочете видалити цей тип виробу? Це може вплинути на конструктор.')) {
    this.userService.deleteGarmentPrice(id).subscribe({
      next: () => {
        this.showToast('Категорію видалено', 'success');
        this.loadGarmentPrices(); // Оновлюємо список
      },
      error: () => this.showToast('Помилка при видаленні', 'error')
    });
  }
}

}