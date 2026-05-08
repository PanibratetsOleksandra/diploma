// blog-detail.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

interface FullArticle {
  id: number;
  title: string;
  category: string;
  date: Date;
  author: string;
  readTime: string;
  imageUrl: string;
  intro: string;
  // Повний контент розбитий на параграфи для зручної гарної верстки
  paragraphs: string[];
  // Поради списком (особливо для Care Tips)
  bullets?: string[];
  quote?: string;
}

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: 'blog-detail.html'
})
export class BlogDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  // Сигнал для збереження активної статті
  article = signal<FullArticle | null>(null);

  // Велика база повних статей (відповідає твоїм скріншотам)
  private articlesDatabase: FullArticle[] = [
    {
      id: 1,
      title: 'How to Care for Your Hand-Painted Clothing',
      category: 'Care Tips',
      date: new Date('2025-11-07'),
      author: 'Sarah Johnson',
      readTime: '5 min read',
      imageUrl: 'https://images.unsplash.com/photo-1545042679-41d22b2ca130?q=80&w=1200',
      intro: 'Your new hand-painted garment is not just a piece of clothing — it is a wearable masterpiece. Since each design is meticulously painted by hand using professional acrylic textile mediums, proper maintenance is key to keeping those colors as vivid and brilliant as the day they were painted.',
      paragraphs: [
        'Arylic textile paints are incredibly durable once heat-set, but they still require gentler care than mass-produced factory prints. The friction of a standard heavy machine wash can, over time, micro-damage the paint surface, leading to fading or slight cracking.',
        'To ensure your custom denim jacket, blazer, or sweatshirt survives the test of time, we have compiled the ultimate washing and ironing guide. Follow these simple steps to preserve the integrity of the artwork.'
      ],
      bullets: [
        'Always wash inside out: This simple trick protects the painted surface from direct friction with other fabrics.',
        'Hand wash is gold: Wash in cool or lukewarm water (max 30°C) using a mild liquid detergent. Avoid harsh powder detergents or bleaches.',
        'Gentle cycle only: If you must use a washing machine, choose the "Delicates" or "Hand Wash" setting with absolute minimal spin (max 400 rpm).',
        'Never tumble dry: Lay the garment flat to dry naturally in a shaded area. Direct sunlight or tumble dryers can overheat and weaken the paint bond.',
        'Ironing rules: Never touch the iron directly to the paint. Iron on the reverse side (inside out) or place a baking paper / cotton cloth over the artwork. Use medium heat without steam.'
      ],
      quote: 'Proper care is the ultimate bridge between temporary fashion and lifelong wearable art.'
    },
    {
      id: 2,
      title: 'Finding Inspiration: The Creative Process Behind Our Designs',
      category: 'Inspiration',
      date: new Date('2025-11-05'),
      author: 'Alex Martinez',
      readTime: '7 min read',
      imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1200',
      intro: 'Where does art begin? For Panibratets Artwear, the journey starts long before the brush touches fabric. It begins with a spark of inspiration, a traditional symbol, or an AI-generated concept that is then carefully reimagined through the eyes of a real artist.',
      paragraphs: [
        'Every custom collection, such as our charity lineage line, is heavily rooted in storytelling. We explore historical archives, traditional ethnic ornaments, and modern urban shapes to create a visual dialogue on textile. The fabric itself dictates the movement of the brush — denim requires structured, bold lines, while soft cotton calls for delicate gradients.',
        'With the introduction of our AI Assistant, the inspiration process has become a collaborative dance between human creativity and technology. We use generative prompts to explore color palettes and layout options, which are then manually sketched, refined, and physically painted with precision.'
      ],
      bullets: [
        'Phase 1: Conceptualization & Prompt Engineering (or traditional research).',
        'Phase 2: Digital prototyping in our 2D designer tool.',
        'Phase 3: Fabric preparation (washing and priming the canvas).',
        'Phase 4: Multi-layered acrylic application (building shadows and highlights).',
        'Phase 5: Heat-pressing the final painting at 180°C to lock the pigments forever.'
      ],
      quote: 'We do not just paint on clothes; we transfer stories and emotions onto canvases that move with you.'
    },
    {
      id: 3,
      title: 'Behind the Scenes: A Day in Our Art Studio',
      category: 'Behind the Scenes',
      date: new Date('2025-11-03'),
      author: 'Emma Wilson',
      readTime: '6 min read',
      imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1200',
      intro: 'Step inside the physical space where digital concepts turn into heavy, textured denim masterpieces. Our art studio is a mixture of organized chaos, smelling of fresh textile pigments, coffee, and pure inspiration.',
      paragraphs: [
        'Our morning usually begins with sorting out custom orders from the website. Some clients trust our artist’s vision completely, leaving only small notes, while others provide highly detailed requests through our 2D designer or AI prompts.',
        'Once the layouts are finalized, the physical painting begins. We use professional Decola Textile Acrylics, mixing custom shades on wooden palettes. Painting on fabrics is a slow, meditative process. Unlike flat canvases, denim absorbs paint differently, requiring up to 3 separate layers to achieve maximum opacity and vibrancy.'
      ],
      bullets: [
        'Morning: Order review and sketch matching with incoming clothing sizes.',
        'Midday: Painting session under high-intensity daylight lamps (the most critical step).',
        'Afternoon: Heat-fixation, quality control checking under different light sources, and packaging.',
        'Evening: Logistics prep, packing custom boxes, and sending items worldwide.'
      ],
      quote: 'Every paint splash in this studio is a step towards making the world of fashion more unique and less mass-produced.'
    }
  ];

  ngOnInit() {
    // Зчитуємо ID статті з URL-адреси
    const articleId = Number(this.route.snapshot.paramMap.get('id'));
    
    // Шукаємо статтю в базі
    const foundArticle = this.articlesDatabase.find(a => a.id === articleId);

    if (foundArticle) {
      this.article.set(foundArticle);
    } else {
      // Якщо стаття не знайдена, завантажуємо першу дефолтну, щоб сторінка не ламалася
      this.article.set(this.articlesDatabase[0]);
    }
  }

  goBack() {
    this.location.back();
  }
}