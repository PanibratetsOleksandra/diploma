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
  public imageService = inject(ImageService); // 🔥 Інжектуємо як public, щоб використовувати в HTML шаблоні
public authService = inject(AuthService);
  // Стан даних
  articles = signal<Article[]>([]);
  searchQuery = signal<string>('');
  selectedCategory = signal<string>('All Articles');
  newsletterEmail = signal<string>('');
  newsletterSubscribed = signal<boolean>(false);

  selectedFile = signal<File | null>(null);
  imagePreviewUrl = signal<string | null>(null);

isWriter = computed(() => this.authService.isAdmin());

  // Керування формою
  isFormOpen = signal<boolean>(false);
  editingArticleId = signal<number | null>(null);
  blogForm!: FormGroup;

  // Категорії та теги
  categories = ['All Articles', 'Care Tips', 'Inspiration', 'Behind the Scenes'];
  popularTags = ['#Hand-Painted', '#Care Guide', '#Art Process', '#Color Theory', '#Studio Life', '#Fashion Tips', '#Sustainability', '#Custom Design'];

  // Живий пошук
  filteredArticles = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const cat = this.selectedCategory();
    return this.articles().filter(article => {
      const matchesCategory = cat === 'All Articles' || article.category === cat;
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
      category: ['Care Tips', Validators.required],
      author: ['Sasha Panibratets', Validators.required],
      readTime: ['5 min read', Validators.required],
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
      error: (err) => console.error('Error loading articles from API: - blog.ts:86', err)
    });
  }

  openCreateModal() {
    this.editingArticleId.set(null);
    this.removeSelectedFile();
    this.blogForm.reset({
      category: 'Care Tips',
      author: 'Sasha Panibratets',
      readTime: '5 min read',
      imageUrl: ''
    });
    this.isFormOpen.set(true);
  }

  openEditModal(article: Article) {
    this.editingArticleId.set(article.id || null);
    this.blogForm.patchValue(article);
    if (article.imageUrl) {
      // Використовуємо твій сервіс для прев'ю при редагуванні
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
        error: (err) => console.error('Помилка оновлення: - blog.ts:164', err)
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

  subscribeNewsletter() {
    if (this.newsletterEmail() && this.newsletterEmail().includes('@')) {
      this.newsletterSubscribed.set(true);
      setTimeout(() => {
        this.newsletterEmail.set('');
        this.newsletterSubscribed.set(false);
      }, 4000);
    } else {
      alert('Будь ласка, введи коректну e-mail адресу! 📬');
    }
  }

  selectTag(tag: string) {
    const cleanTag = tag.replace('#', '');
    this.searchQuery.set(cleanTag);
    this.selectedCategory.set('All Articles');
  }
}