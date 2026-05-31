// home.component.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../../core/services/product.service';
import { Product } from '../../../../core/models/product.model';
import { ImageService } from '../../../../core/services/image.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  public imageService = inject(ImageService);
  public productService = inject(ProductService);

  featuredProducts = signal<Product[]>([]);
  ngOnInit() {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.featuredProducts.set(products.slice(0, 3));
      },
      error: () => {
        this.featuredProducts.set([]);
      }
    });
  }

  getMainPhotoUrl(product: Product): string {
    const mainPhoto = product.photos?.find(p => p.isMain);
    const photoUrl = mainPhoto?.url || product.photos?.[0]?.url;
    if (!photoUrl) return 'assets/images/placeholder.jpg';
    return photoUrl.startsWith('http') ? photoUrl : `http://localhost:5000${photoUrl}`;
  }
}