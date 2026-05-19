// blog.component.ts
import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BlogService, Article } from '../../core/services/blog.service';
import { UserService } from '../../core/services/user.service';
import { ImageService } from '../../core/services/image.service'; // 🔥 Імпортуємо твій сервіс картинок
import { AuthService } from '../../core/services/auth.service';


@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './blog.html'
})
export class BlogComponent implements OnInit {
  private blogService = inject(BlogService);
  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  public imageService = inject(ImageService); 
public authService = inject(AuthService);
  // Стан даних
  articles = signal<Article[]>([]);
  searchQuery = signal<string>('');
selectedCategory = signal<string>('Усі статті');
  newsletterEmail = signal<string>('');
  newsletterSubscribed = signal<boolean>(false);

  selectedFile = signal<File | null>(null);
  imagePreviewUrl = signal<string | null>(null);

isWriter = computed(() => this.authService.isAdmin());
toastMessage = signal<string>('');
toastType = signal<'success' | 'error'>('success');

  // Керування формою
  isFormOpen = signal<boolean>(false);
  editingArticleId = signal<number | null>(null);
  blogForm!: FormGroup;

  // Категорії та теги
  categories = ['Усі статті', 'Поради з догляду', 'Натхнення', 'Залаштунки процесу'];
 popularTags = ['#РучнийРозпис', '#ДоглядЗаОдягом', '#АртПроцес', '#ТеоріяКольору', '#МагіяРоду', '#FashionПоради', '#SlowFashion', '#КастомнийДизайн'];

  // Живий пошук
  filteredArticles = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const cat = this.selectedCategory();
    return this.articles().filter(article => {
      const matchesCategory = cat === 'Усі статті' || article.category === cat;
      const matchesSearch = article.title.toLowerCase().includes(query) || 
                            article.intro.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  });


  
  // Останні 3 статті
  recentArticles = computed(() => {
    return [...this.articles()]
      .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
      .slice(0, 3);
  });

  ngOnInit() {
    this.initForm();
    this.loadArticles();
  }

  initForm() {
    this.blogForm = this.fb.group({
      title: ['', Validators.required],
      category: ['Поради з догляду', Validators.required],
      author: ['Саша Панібратець', Validators.required],
      readTime: ['5 хв читання', Validators.required],
      imageUrl: [''],
      intro: ['', Validators.required],
      paragraphsText: ['', Validators.required],
      bulletsText: [''],
      quote: ['']
    });
  }

  loadArticles() {
    this.blogService.getArticles().subscribe({
      next: (data) => this.articles.set(data),
      error: (err) => console.error('Error loading articles from API: - blog.ts:90', err)
    });
  }

  openCreateModal() {
    this.editingArticleId.set(null);
    this.removeSelectedFile();
    this.blogForm.reset({
      category: 'Поради з догляду',
      author: 'Саша Панібратець',
      readTime: '5 хв читання',
      imageUrl: ''
    });
    this.isFormOpen.set(true);
  }

  openEditModal(article: Article) {
    this.editingArticleId.set(article.id || null);
    this.blogForm.patchValue(article);
    if (article.imageUrl) {
      this.imagePreviewUrl.set(this.imageService.getFullImageUrl(article.imageUrl));
    }
    this.isFormOpen.set(true);
  }

  closeModal() {
    this.isFormOpen.set(false);
    this.editingArticleId.set(null);
    this.removeSelectedFile();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile.set(file);
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrl.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  removeSelectedFile() {
    this.selectedFile.set(null);
    this.imagePreviewUrl.set(null);
    this.blogForm.patchValue({ imageUrl: '' });
  }

  onSubmit() {
    if (this.blogForm.invalid) return;

    const formData = new FormData();
    const formValue = this.blogForm.value;

    formData.append('title', formValue.title);
    formData.append('category', formValue.category);
    formData.append('author', formValue.author);
    formData.append('readTime', formValue.readTime);
    formData.append('intro', formValue.intro);
    formData.append('paragraphsText', formValue.paragraphsText);
    formData.append('bulletsText', formValue.bulletsText || '');
    formData.append('quote', formValue.quote || '');

    if (this.selectedFile()) {
      formData.append('imageFile', this.selectedFile()!, this.selectedFile()!.name);
    } else {
      formData.append('imageUrl', formValue.imageUrl || '');
    }

    if (this.editingArticleId()) {
      this.blogService.updateArticle(this.editingArticleId()!, formData as any).subscribe({
        next: () => {
          alert('Статтю успішно оновлено! 📝');
          this.loadArticles();
          this.closeModal();
        },
        error: (err) => console.error('Помилка оновлення: - blog.ts:167', err)
      });
    } else {
      this.blogService.createArticle(formData as any).subscribe({
        next: () => {
          alert('Статтю успішно опубліковано в базу даних! ✨');
          this.loadArticles();
          this.closeModal();
        },
        error: (err) => {
          alert('Помилка створення статті. Перевірте з\'єднання з бекендом.');
          console.error(err);
        }
      });
    }
  }

  deleteArticle(id: number, event: Event) {
    event.stopPropagation();
    if (confirm('Ви дійсно хочете видалити цю публікацію з бази даних? ❌')) {
      this.blogService.deleteArticle(id).subscribe({
        next: () => {
          this.loadArticles();
        },
        error: (err) => alert('Помилка видалення.')
      });
    }
  }


showToast(message: string, type: 'success' | 'error' = 'success'): void {
  this.toastMessage.set(message);
  this.toastType.set(type);
  
  // Ховаємо тост автоматично через 3 секунди
  setTimeout(() => {
    this.toastMessage.set('');
  }, 3000);
}


subscribeNewsletter() {
  const email = this.newsletterEmail() ? this.newsletterEmail().trim() : '';


  if (!email) {
    this.showToast('Поле Email не може бути порожнім! 📬', 'error');
    return;
  }

  if (email.length > 50) {
    this.showToast('Email занадто довгий (максимум 50 символів)! 🛑', 'error');
    return;
  }


  // Цей вираз перевіряє структуру: текст@текст.домен
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    this.showToast('Некоректний формат адреси! Перевірте наявність @ та домену (.com, .ua) 🧩', 'error');
    return;
  }

  this.userService.subscribeToNewsletter(email).subscribe({
    next: (res) => {
      this.newsletterSubscribed.set(true);
      this.showToast('Дякуємо за підписку! Вас додано до бази 📨✨', 'success');
      this.newsletterEmail.set('');
      setTimeout(() => this.newsletterSubscribed.set(false), 4000);
    },
    error: (err) => {
      let errorMessage = 'Не вдалося підписатися';
      if (err.error) {
        if (typeof err.error === 'string') {
          errorMessage = err.error;
        } else if (typeof err.error === 'object' && err.error.message) {
          errorMessage = err.error.message;
        }
      }
      this.showToast(errorMessage, 'error');
      console.error('Деталі помилки підписки: - blog.ts:247', err);
    }
  });
}

  selectTag(tag: string) {
    const cleanTag = tag.replace('#', '');
    this.searchQuery.set(cleanTag);
    this.selectedCategory.set('Усі статті');
  }
}