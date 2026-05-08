// home.component.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../../core/services/product.service';
import { Product } from '../../../../data/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss' // або .css залежно від проекту
})
export class HomeComponent implements OnInit {
  public productService = inject(ProductService);

  // Сигнал для збереження популярних товарів
  featuredProducts = signal<Product[]>([]);

  // Локальні відгуки для красивої секції відгуків
  reviews = signal([
    {
      name: 'Софія Мартинець',
      text: 'Якість просто неймовірна! Кожен виріб — це справжній витвір мистецтва на тканині. Малюнок тримається чудово навіть після багатьох циклів прання!',
      stars: 5,
      role: 'Постійний покупець'
    },
    {
      name: 'Олександр Черняк',
      text: 'Нарешті знайшов бренд, який повністю відображає мою індивідуальність. Створення власного дизайну через конструктор сайту — це чистий кайф!',
      stars: 5,
      role: 'Креативний дизайнер'
    },
    {
      name: 'Емма Вілсон',
      text: 'ШІ-стиліст допоміг мені згенерувати ідеальний традиційний етно-орнамент для джинсовки. Сервіс та підтримка художників на найвищому рівні!',
      stars: 5,
      role: 'Slow Fashion ентузіаст'
    }
  ]);

  ngOnInit() {
    // Беремо перші 3 товари з нашого сервісу як Featured Collection
    this.productService.getProducts().subscribe({
      next: (products) => {
        if (products.length > 0) {
          this.featuredProducts.set(products.slice(0, 3));
        } else {
          // Якщо товарів у базі немає, завантажуємо заглушки
          this.featuredProducts.set(this.demoProducts);
        }
      },
      error: () => {
        this.featuredProducts.set(this.demoProducts);
      }
    });
  }

  // Отримання головної фотографії для товарів
  getMainPhotoUrl(product: Product): string {
    const mainPhoto = product.photos?.find(p => p.isMain);
    const photoUrl = mainPhoto?.url || product.photos?.[0]?.url;
    if (!photoUrl) return 'assets/images/placeholder.jpg';
    return photoUrl.startsWith('http') ? photoUrl : `http://localhost:5000${photoUrl}`;
  }

  // Демо-продукти на випадок, якщо локальна база пуста при першому запуску
  demoProducts: any[] = [
    {
      id: 1,
      name: 'Лонгслів "Магія Роду"',
      price: 2450,
      description: 'Ручний розпис традиційних українських орнаментів.',
      photos: [{ url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=400', isMain: true }]
    },
    {
      id: 2,
      name: 'Худі "Sunset Dreams"',
      price: 3200,
      description: 'Абстрактні акрилові мазки на трьохнитці.',
      photos: [{ url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=400', isMain: true }]
    },
    {
      id: 3,
      name: 'Куртка "Abstract Art"',
      price: 4500,
      description: 'Джинсова куртка з унікальним художнім портретом на спині.',
      photos: [{ url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=400', isMain: true }]
    }
  ];
}