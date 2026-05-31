// blog-detail.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute} from '@angular/router';
import { BlogService } from '../../core/services/blog.service';
import { Article } from '../../core/models/article.model';
import { ImageService } from '../../core/services/image.service';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './blog-detail.html'
})
export class BlogDetailComponent implements OnInit {
  public imageService = inject(ImageService);
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private blogService = inject(BlogService);

  article = signal<Article | null>(null);

  parsedParagraphs = signal<string[]>([]);
  parsedBullets = signal<string[]>([]);

  ngOnInit() {

    const articleId = Number(this.route.snapshot.paramMap.get('id'));

    if (articleId) {
      this.blogService.getArticleById(articleId).subscribe({
        next: (data) => {
          this.article.set(data);
          this.parseContent(data);
        },
        error: (err) => {
          console.error('Помилка завантаження детальних даних статті: - blog-detail.ts:36', err);
        }
      });
    }
  }


  private parseContent(item: Article) {
    if (item.paragraphsText) {

      const paragraphs = item.paragraphsText
        .split('|')
        .map(p => p.trim())
        .filter(p => p.length > 0);
      this.parsedParagraphs.set(paragraphs);
    } else {
      this.parsedParagraphs.set([]);
    }

    if (item.bulletsText) {

      const bullets = item.bulletsText
        .split('|')
        .map(b => b.trim())
        .filter(b => b.length > 0);
      this.parsedBullets.set(bullets);
    } else {
      this.parsedBullets.set([]);
    }
  }

  getCategoryLabel(category: string): string {
    const map: Record<string, string> = {
      'Care Tips': 'Поради з догляду',
      'Inspiration': 'Натхнення',
      'Behind the Scenes': 'Залаштунки процесу',
    };
    return map[category] ?? category;
  }

  goBack() {
    this.location.back();
  }
}