import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';

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
  searchQuery = signal('');
  selectedCategory = signal<string>('Усі матеріали');
  sortBy = signal<string>('newest');
  currentPage = signal(1);
  itemsPerPage = 12;
  selectedSizes = signal<string[]>([]);
  minPrice = signal<number | null>(null);
  maxPrice = signal<number | null>(null);
  categories = ['Усі матеріали', 'Джинс', 'Шкіра', 'Бавовна', 'Льон', 'Поліестер'];
  allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  selectedType = signal<string>('Усі вироби');
  types = ['Усі вироби', 'Футболка', 'Худі', 'Світшот', 'Куртка', 'Шопер', 'Аксесуари'];

  ngOnInit() {
    this.productService.getProducts().subscribe();
  }

  toggleSize(size: string) {
    this.selectedSizes.update(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]

    );
    this.currentPage.set(1);
  }

  filteredProducts = computed(() => {
    let products = this.productService.products();

    if (this.selectedCategory() !== 'Усі матеріали') {
      products = products.filter(p =>
        p.materials.toLowerCase().includes(this.selectedCategory().toLowerCase())
      );
    }

    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase().trim();

      products = products.filter(p =>
        (p.name?.toLowerCase().includes(query)) ||
        (p.description?.toLowerCase().includes(query)) ||
        (p.materials?.toLowerCase().includes(query))
      );
    }

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
        if (type === 'Худі') return name.includes('худі') || name.includes('hoodie');
        if (type === 'Світшот') return name.includes('світшот') || name.includes('sweatshirt');
        if (type === 'Куртка') return name.includes('куртк') || name.includes('джинс');
        if (type === 'Шопер') return name.includes('шопер') || name.includes('сумк') || name.includes('tote');
        if (type === 'Аксесуари') return name.includes('аксесуар') || name.includes('гаманець');
        return name.includes(type.toLowerCase());
      });
    }

    if (this.minPrice() !== null) products = products.filter(p => p.price >= this.minPrice()!);
    if (this.maxPrice() !== null) products = products.filter(p => p.price <= this.maxPrice()!);

    return [...products].sort((a, b) => {
      if (this.sortBy() === 'price-low') return a.price - b.price;
      if (this.sortBy() === 'price-high') return b.price - a.price;
      return b.id - a.id;
    });
  });

  totalPages = computed(() =>
    Math.ceil(this.filteredProducts().length / this.itemsPerPage)
  );

  paginatedProducts = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;

    return this.filteredProducts().slice(start, end);
  });


  getProductImage(product: Product): string {
    const mainPhoto = product.photos?.find(p => p.isMain) || product.photos?.[0];
    if (!mainPhoto) return 'assets/images/placeholder.jpg';
    return mainPhoto.url.startsWith('http') ? mainPhoto.url : `http://localhost:5000${mainPhoto.url}`;
  }

  getSizeLabel(size: any): string {
    return typeof size === 'number' ? this.allSizes[size] : size;
  }

  isNewProduct(createdAt: string | Date | undefined): boolean {
    if (!createdAt) return false;
    const dateAdded = new Date(createdAt);
    if (isNaN(dateAdded.getTime())) return false;
    const today = new Date();
    const diffTime = today.getTime() - dateAdded.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays >= -1 && diffDays <= 14;
  }

  onMinPriceInput(event: any) {
    this.currentPage.set(1);

    const val = event.target.value;

    if (!val) {
      this.minPrice.set(null);
      return;
    }

    const num = +val;

    this.minPrice.set(num < 0 ? 0 : num);

    if (num < 0) event.target.value = 0;
  }

  onMaxPriceInput(event: any) {
    this.currentPage.set(1);

    const val = event.target.value;

    if (!val) {
      this.maxPrice.set(null);
      return;
    }

    const num = +val;

    this.maxPrice.set(num < 0 ? 0 : num);

    if (num < 0) event.target.value = 0;
  }

  pages = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  resetFilters() {
    this.searchQuery.set('');
    this.selectedCategory.set('Усі матеріали');
    this.selectedType.set('Усі вироби');
    this.selectedSizes.set([]);
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.sortBy.set('newest');
    this.currentPage.set(1);

  }

}