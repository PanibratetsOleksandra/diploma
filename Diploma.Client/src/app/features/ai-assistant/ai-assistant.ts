import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../core/services/ai.service';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
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
  isSaving = signal(false);
toastMessage = signal('');
toastType = signal<'success' | 'error'>('success');
  errorMessage = signal('');
  generatedImage = signal<string | null>(null);
public authService = inject(AuthService);
private router = inject(Router);

ngOnInit(): void {
  const savedImage = sessionStorage.getItem('pendingAiImage');

  if (savedImage) {
    this.generatedImage.set(savedImage);
  }
}
showToast(message: string, type: 'success' | 'error' = 'success'): void {
  this.toastMessage.set(message);
  this.toastType.set(type);

  setTimeout(() => {
    this.toastMessage.set('');
  }, 10000);
}

  examples = [
    'Clean apparel mockup of a white oversized T-shirt with a centered hand-painted daisy illustration. Minimal composition, soft brush strokes, slightly textured paint effect, balanced placement on chest area, isolated on white background, high-quality fashion mockup.',
    'Modern black hoodie with a minimalist geometric print in black and white, clean sharp lines, abstract shapes, centered chest placement, high contrast, streetwear aesthetic, isolated on white background, realistic clothing mockup.',
    'Summer T-shirt design featuring a stylized blue ocean wave, flowing dynamic shape, soft gradients and highlights, centered front print, light and fresh aesthetic, white T-shirt mockup, clean background, high-quality apparel design.',
    'Streetwear black T-shirt with a grunge splatter print in black and deep red, chaotic paint splashes, distressed texture, edgy urban aesthetic, slightly off-center composition, bold contrast, high-quality fashion mockup, isolated on white background.',
    'Light blue denim jacket with a pastel floral design on the back, soft delicate flowers, watercolor style, gentle color palette, large centered back print, aesthetic fashion mockup, clean white background, high detail.',
    'Black T-shirt with a cyberpunk-inspired front print in neon pink and electric blue, glowing elements, futuristic design, digital glitch effects, centered composition, high contrast, modern streetwear mockup, white background.'
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
        console.error('AI Error: - ai-assistant.ts:69', err);
        console.error('AI Error body: - ai-assistant.ts:70', err?.error);

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
  this.closeInspirationModal();
  this.generate();
}

  garments = [
  'white oversized T-shirt',
  'black hoodie',
  'summer T-shirt',
  'denim jacket',
  'black streetwear T-shirt',
  'cream sweatshirt'
];

placements = [
  'centered chest print',
  'large back print',
  'small front logo print',
  'sleeve print',
  'slightly off-center front print'
];

styles = [
  'minimalist',
  'hand-painted',
  'watercolor',
  'grunge streetwear',
  'cyberpunk',
  'pastel floral',
  'geometric',
  'vintage'
];

colorPalettes = [
  'black and white',
  'pastel pink and blue',
  'deep red and black',
  'neon pink and electric blue',
  'soft blue and white',
  'warm orange and yellow'
];

selectedGarment = signal('');
selectedPlacement = signal('');
selectedStyle = signal('');
selectedColors = signal('');
designIdea = signal('');

buildPrompt(): void {
  const garment = this.customGarment().trim() || this.selectedGarment();
  const placement = this.customPlacement().trim() || this.selectedPlacement();
  const style = this.customStyle().trim() || this.selectedStyle();
  const colors = this.customColors().trim() || this.selectedColors();
  const idea = this.designIdea().trim();

  const prompt =
    `Clean apparel mockup of a ${garment || 'piece of clothing'} ` +
    `with a ${placement || 'front print'}. ` +
    `${idea ? `Design idea: ${idea}. ` : ''}` +
    `${style ? `Style: ${style}. ` : ''}` +
    `${colors ? `Color palette: ${colors}. ` : ''}` +
    `High-quality fashion mockup, realistic clothing, isolated on white background, balanced composition.`;

  this.userVision.set(prompt);
}
customGarment = signal('');
customPlacement = signal('');
customStyle = signal('');
customColors = signal('');


isInspirationModalOpen = signal(false);

openInspirationModal(): void {
  this.isInspirationModalOpen.set(true);
}

closeInspirationModal(): void {
  this.isInspirationModalOpen.set(false);
}

// saveToProfile(): void {
//   const imageUrl = this.generatedImage();

//   if (!imageUrl) return;

//   // const token = localStorage.getItem('token');

// if (!this.authService.currentUser()) {
//   sessionStorage.setItem('pendingAiImage', imageUrl);

//   this.router.navigate(['/login'], {
//    queryParams: { returnUrl: '/ai-assistant' }
//   });

//   return;
// }

//     const payload = {
//       base64Image: this.generatedImage(),
//       prompt: this.userVision()
//     };

//     this.isLoading.set(true);
//     this.aiService.saveDesign(payload).subscribe({
//       next: () => {
//         this.isLoading.set(false);
//         alert('✨ Design saved to your collection!');
//       },
//       error: (err) => {
//         this.isLoading.set(false);
//         console.error(err);
//       }
//     });
//   }

saveToProfile(): void {
  const imageUrl = this.generatedImage();

  if (!imageUrl) return;

  if (!this.authService.currentUser()) {
    sessionStorage.setItem('pendingAiImage', imageUrl);

    this.router.navigate(['/login'], {
      queryParams: { returnUrl: '/ai-assistant' }
    });

    return;
  }

  const payload = {
    base64Image: imageUrl,
    prompt: this.userVision()
  };

  this.isSaving.set(true);

  this.aiService.saveDesign(payload).subscribe({
    next: () => {
      this.isSaving.set(false);
      sessionStorage.removeItem('pendingAiImage');
      this.showToast('✨ Design saved to your collection!', 'success');
    },
    error: (err) => {
      this.isSaving.set(false);
      console.error(err);
      this.showToast('Something went wrong. Try again.', 'error');
    }
  });
}
}

