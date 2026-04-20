import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen pt-32 px-6 lg:px-12 bg-white">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-4xl font-black italic mb-8 tracking-tighter uppercase">My Creative Space</h1>
        <div class="p-12 border-2 border-dashed border-gray-100 rounded-[3rem] text-center">
          <p class="text-gray-400 italic">Тут скоро будуть твої замовлення та налаштування, Саша. Робота триває... 🎨</p>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent {}