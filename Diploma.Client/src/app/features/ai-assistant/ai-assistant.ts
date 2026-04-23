import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../core/services/ai.service';

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-assistant.html',
  styleUrl: './ai-assistant.scss'
})
export class AiAssistantComponent {
  private aiService = inject(AiService);

  userVision = signal('');
  isLoading = signal(false);
  errorMessage = signal('');
  generatedImage = signal<string | null>(null);

  examples = [
    'A white oversized T-shirt with a hand-painted daisy in the center',
    'Minimalist black and white geometric print for a hoodie',
    'Blue ocean wave design for a summer T-shirt',
    'Grunge splatter streetwear print in black and red',
    'Pastel floral design for a denim jacket',
    'Cyberpunk neon pink and blue front print'
  ];

  generate(): void {
    const vision = this.userVision().trim();

    if (!vision) return;

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.generatedImage.set(null);

    this.aiService.generateDesign(vision).subscribe({
      next: (response: any) => {
        this.generatedImage.set(response?.imageUrl || null);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('AI Error: - ai-assistant.ts:45', err);
        console.error('AI Error body: - ai-assistant.ts:46', err?.error);

        this.errorMessage.set(
          typeof err?.error === 'string'
            ? err.error
            : 'Failed to generate AI image.'
        );

        this.isLoading.set(false);
      }
    });
  }

  useExample(example: string): void {
    this.userVision.set(example);
    this.generate();
  }
}