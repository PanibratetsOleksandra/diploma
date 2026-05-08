// blog.component.ts
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface Article {
  id: number;
  title: string;
  excerpt: string;
  content?: string;
  category: 'Care Tips' | 'Inspiration' | 'Behind the Scenes';
  date: Date;
  author: string;
  readTime: string;
  imageUrl: string;
}

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './blog.html'
})
export class BlogComponent implements OnInit {
  // Сигнали для фільтрації та пошуку
  searchQuery = signal<string>('');
  selectedCategory = signal<string>('All Articles');
  newsletterEmail = signal<string>('');
  newsletterSubscribed = signal<boolean>(false);

  // Категорії для фільтрації
  categories = ['All Articles', 'Care Tips', 'Inspiration', 'Behind the Scenes'];

  // Популярні теги для сайдбару
  popularTags = [
    '#Hand-Painted', '#Care Guide', '#Art Process', 
    '#Color Theory', '#Studio Life', '#Fashion Tips', 
    '#Sustainability', '#Custom Design'
  ];

  // Масив статей блогу (відповідає твоїм скріншотам)
  articles = signal<Article[]>([
    {
      id: 1,
      title: 'How to Care for Your Hand-Painted Clothing',
      excerpt: 'Essential tips to keep your wearable art looking vibrant and beautiful for years to come.',
      category: 'Care Tips',
      date: new Date('2025-11-07'),
      author: 'Sarah Johnson',
      readTime: '5 min read',
      imageUrl: 'https://images.unsplash.com/photo-1545042679-41d22b2ca130?q=80&w=600' // Стійка з білим одягом
    },
    {
      id: 2,
      title: 'Finding Inspiration: The Creative Process Behind Our Designs',
      excerpt: 'Explore the artistic journey from initial concept to finished wearable masterpiece.',
      category: 'Inspiration',
      date: new Date('2025-11-05'),
      author: 'Alex Martinez',
      readTime: '7 min read',
      imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600' // Ескізи/натхнення
    },
    {
      id: 3,
      title: 'Behind the Scenes: A Day in Our Art Studio',
      excerpt: 'Take a peek into our creative space where magic happens every day.',
      category: 'Behind the Scenes',
      date: new Date('2025-11-03'),
      author: 'Emma Wilson',
      readTime: '6 min read',
      imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600' // Процес розпису
    },
    {
      id: 4,
      title: 'Color Theory in Wearable Art',
      excerpt: 'Understanding how colors work together to create stunning, harmonious clothing designs.',
      category: 'Inspiration',
      date: new Date('2025-10-30'),
      author: 'Alex Martinez',
      readTime: '8 min read',
      imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=600' // Пензлі та фарби
    },
    {
      id: 5,
      title: 'Washing Tips for Painted Fabrics',
      excerpt: 'Step-by-step guide to properly clean and iron your custom hand-painted garments.',
      category: 'Care Tips',
      date: new Date('2025-10-28'),
      author: 'Sarah Johnson',
      readTime: '4 min read',
      imageUrl: 'https://images.unsplash.com/photo-1520591799316-6b30425b0433?q=80&w=600' // Прання/Догляд
    },
    {
      id: 6,
      title: 'Meet Our Artists: Stories & Techniques',
      excerpt: 'Get to know the talented artists who bring your custom designs to life.',
      category: 'Behind the Scenes',
      date: new Date('2025-10-25'),
      author: 'Emma Wilson',
      readTime: '10 min read',
      imageUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=600' // Фарби/Майстерня
    }
  ]);

  // Обчислювальний сигнал для відфільтрованих статей (Live Search + Category Filter)
  filteredArticles = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const cat = this.selectedCategory();
    
    return this.articles().filter(article => {
      const matchesCategory = cat === 'All Articles' || article.category === cat;
      const matchesSearch = article.title.toLowerCase().includes(query) || 
                            article.excerpt.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  });

  // Останні 3 статті для сайдбару (Recent Articles)
  recentArticles = computed(() => {
    return [...this.articles()]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 3);
  });

  ngOnInit() {}

  // Обробка підписки на новини
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

  // Швидкий клік по тегу в сайдбарі запускає пошук по цьому слову
  selectTag(tag: string) {
    const cleanTag = tag.replace('#', '');
    this.searchQuery.set(cleanTag);
    this.selectedCategory.set('All Articles');
  }
}