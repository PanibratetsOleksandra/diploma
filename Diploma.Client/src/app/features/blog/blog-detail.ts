// blog-detail.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BlogService, Article } from '../../core/services/blog.service';
import { ImageService } from '../../core/services/image.service';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './blog-detail.html' // переконайся, що назва шаблону збігається
})
export class BlogDetailComponent implements OnInit {
   public imageService = inject(ImageService);
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private blogService = inject(BlogService);

  // Сигнал для збереження завантаженої статті
  article = signal<Article | null>(null);

  // Допоміжні сигнали для розпарсених списків
  parsedParagraphs = signal<string[]>([]);
  parsedBullets = signal<string[]>([]);

  ngOnInit() {
    // Зчитуємо ID статті з URL-маршруту
    const articleId = Number(this.route.snapshot.paramMap.get('id'));

    if (articleId) {
      this.blogService.getArticleById(articleId).subscribe({
        next: (data) => {
          this.article.set(data);
          this.parseContent(data);
        },
        error: (err) => {
          console.error('Помилка завантаження детальних даних статті: - blog-detail.ts:38', err);
        }
      });
    }
  }

  // Метод перетворення рядка з роздільником "|" у масив для відображення в HTML
  private parseContent(item: Article) {
    if (item.paragraphsText) {
      // Розбиваємо текст на масив абзаців за символом '|'
      const paragraphs = item.paragraphsText
        .split('|')
        .map(p => p.trim())
        .filter(p => p.length > 0);
      this.parsedParagraphs.set(paragraphs);
    } else {
      this.parsedParagraphs.set([]);
    }

    if (item.bulletsText) {
      // Розбиваємо список порад за символом '|'
      const bullets = item.bulletsText
        .split('|')
        .map(b => b.trim())
        .filter(b => b.length > 0);
      this.parsedBullets.set(bullets);
    } else {
      this.parsedBullets.set([]);
    }
  }

  goBack() {
    this.location.back();
  }
}