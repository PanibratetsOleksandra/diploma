import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../data/product.model';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './shop.html',
  styles: [`
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class ShopComponent implements OnInit {
  productService = inject(ProductService);

  // Стан фільтрів
  searchQuery = signal('');
  selectedCategory = signal<string>('All');
  sortBy = signal<string>('newest');
  
  // НОВІ ФІЛЬТРИ
  selectedSizes = signal<string[]>([]);
  minPrice = signal<number | null>(null);
  maxPrice = signal<number | null>(null);

  categories = ['All', 'Denim', 'Leather', 'Cotton', 'Silk', 'Accessories'];
  allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  selectedType = signal<string>('Усі вироби');
  types = ['Усі вироби', 'Футболка', 'Худі', 'Світшот', 'Куртка', 'Шоппер'];

  ngOnInit() {
    this.productService.getProducts().subscribe();
  }

  // Метод для перемикання розмірів
  toggleSize(size: string) {
    this.selectedSizes.update(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  }

  // Обчислюємо відфільтрований список
  filteredProducts = computed(() => {
    let products = this.productService.products();

    // 1. Фільтр за категорією
    if (this.selectedCategory() !== 'All') {
      products = products.filter(p => 
        p.materials.toLowerCase().includes(this.selectedCategory().toLowerCase())
      );
    }

    // 2. Пошук за назвою
    if (this.searchQuery()) {
      products = products.filter(p => 
        p.name.toLowerCase().includes(this.searchQuery().toLowerCase())
      );
    }

    // 3. Фільтр за розмірами
    if (this.selectedSizes().length > 0) {
      products = products.filter(p => 
        p.availableSizes.some(size => {
          const name = typeof size === 'number' ? this.allSizes[size] : size;
          return this.selectedSizes().includes(name as string);
        })
      );
    }

    if (this.selectedType() !== 'Усі вироби') {
      products = products.filter(p => {
        const name = p.name.toLowerCase();
        const type = this.selectedType();

        if (type === 'Футболка') return name.includes('футболк') || name.includes('t-shirt') || name.includes('лонгслів');
        if (type === 'Худі')     return name.includes('худі') || name.includes('hoodie');
        if (type === 'Світшот')  return name.includes('світшот') || name.includes('sweatshirt');
        if (type === 'Куртка')   return name.includes('куртк') || name.includes('джинс');
        if (type === 'Шоппер')   return name.includes('шоппер') || name.includes('сумк') || name.includes('tote');
        
        return name.includes(type.toLowerCase());
      });
    }

    // 4. Фільтр за ціною
    if (this.minPrice() !== null) products = products.filter(p => p.price >= this.minPrice()!);
    if (this.maxPrice() !== null) products = products.filter(p => p.price <= this.maxPrice()!);

    // 5. Сортування
    return [...products].sort((a, b) => {
      if (this.sortBy() === 'price-low') return a.price - b.price;
      if (this.sortBy() === 'price-high') return b.price - a.price;
      return b.id - a.id;
    });
  });


  

  getProductImage(product: Product): string {
    const mainPhoto = product.photos?.find(p => p.isMain) || product.photos?.[0];
    if (!mainPhoto) return 'assets/images/placeholder.jpg';
    return mainPhoto.url.startsWith('http') ? mainPhoto.url : `http://localhost:5000${mainPhoto.url}`;
  }

  // Допоміжний метод для назв розмірів у картці
  getSizeLabel(size: any): string {
    return typeof size === 'number' ? this.allSizes[size] : size;
  }

isNewProduct(createdAt: string | Date | undefined): boolean {
  console.log('DATE: - shop.ts:116', createdAt);

  if (!createdAt) return false;

  const dateAdded = new Date(createdAt);
  console.log('PARSED: - shop.ts:121', dateAdded);

  if (isNaN(dateAdded.getTime())) return false;

  const today = new Date();
  const diffTime = today.getTime() - dateAdded.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  console.log('DAYS: - shop.ts:129', diffDays);

  return diffDays >= -1 && diffDays <= 14;
}
  resetFilters() {
  this.searchQuery.set('');
  this.selectedCategory.set('All');
  this.selectedType.set('Усі вироби');
  this.selectedSizes.set([]);
  this.minPrice.set(null);
  this.maxPrice.set(null);
  this.sortBy.set('newest');
  
}

}