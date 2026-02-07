// src/app/features/admin/admin-panel.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CommonModule } from '@angular/common';
import { Product } from '../../../data/product.model';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-panel.html'
})
export class AdminPanelComponent implements OnInit {
  private fb = inject(FormBuilder);
  productService = inject(ProductService);

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
    this.productService.getProducts().subscribe();
  }

  toggleSize(size: string) {
    if (this.selectedSizes.includes(size)) {
      this.selectedSizes = this.selectedSizes.filter(s => s !== size);
    } else {
      this.selectedSizes.push(size);
    }
  }

  onSave() {
    if (this.productForm.valid) {
      const payload = {
        ...this.productForm.value,
        availableSizes: this.selectedSizes
      };
      this.productService.createProduct(payload as any).subscribe(() => {
        this.productForm.reset({ price: 0, materials: '100% Cotton' });
        this.selectedSizes = [];
      });
    }
  }
}