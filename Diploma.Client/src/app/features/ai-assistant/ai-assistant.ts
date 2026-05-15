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
// 🛡️ Константи для валідації
private readonly MAX_FIELD_LENGTH = 250;
private readonly FORBIDDEN_PATTERNS = [
  /фото|photograph|photo|3d рендер|3d render|qr.?код|qr.?code|штрих.?код|barcode/i,
  /мікро.?текст|microtext|пікселі|pixels|вектор|vector|svg|png|jpg|resolution|роздільн/i,
  /nike|adidas|gucci|louis vuitton|supreme|balenciaga|off.?white|бренд|brand/i
];

private readonly FORBIDDEN_CATEGORIES = [
  'взуття', 'кросівки', 'кеди', 'шкарпетки', 'сумка', 'штани', 'джинси',
  'фотографія людини', 'реалістичне обличчя', '3d hologram', 'moving animation'
];

// Сигнал для відстеження помилок по кожному полю окремо
fieldErrors = signal<Record<string, string>>({});


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
  }, 3000);
}




examples = [
  'Біла оверсайз футболка з великим центральним принтом: соняшник у стилі ботанічної ілюстрації, тонкі лінії олівцем, пастельно-жовтий та зелений, реалістична деталізація пелюсток, на білому тлі, якісний мокап одягу.',
  'Чорне худі з мінімалістичним написом у стилі Old English на грудях, великі літери, білий і золотий кольори, вивітрена текстура, вулична естетика, ізольоване на білому тлі, реалістичний мокап.',
  'Молочне оверсайз худі з великим принтом на спині: японська хвиля Хокусай у переосмисленому пастельному стилі, рожевий та блакитний градієнт, чисті контури, естетика 90-х, білий фон, деталізований мокап.',
  'Чорна футболка з рок-принтом: череп у квітах у стилі гравюри, чорно-білий, деталізовані штрихи, темна вулична естетика, центральне розміщення, ізоляція на білому, реалістична тканина.',
  'Пісочний лонгслів з принтом на рукаві: геометричний орнамент у стилі вишиванки, теракота та бордо, етнічні мотиви, акуратне розміщення вздовж рукава, сучасна інтерпретація, якісний мокап.',
  'Білий бомбер з вишивкою на грудях: троянда в реалістичному стилі, яскраво-червоний та зелений, обємний ефект, вінтажна естетика, невелике розміщення на лівому боці, детальний мокап куртки.'
];



  generate(): void {
const vision = this.userVision();
  const visionError = this.validateVisionText(vision);
  
  // Перевірка головного тексту та наявності будь-яких помилок у полях
  const hasFieldErrors = Object.values(this.fieldErrors()).some(err => err !== '');

  if (visionError || hasFieldErrors || !vision.trim()) {
    this.showToast(visionError || 'Будь ласка, виправте помилки у полях', 'error');
    return;
  }

  this.isLoading.set(true);
  this.errorMessage.set('');
  this.generatedImage.set(null);

  // 1. Спочатку "олюднюємо" і перекладаємо промпт через Gemini
  this.aiService.translatePrompt(vision).subscribe({
    next: (translationRes) => {
      const englishPrompt = translationRes.translatedPrompt;
      console.log('translated prompt: - ai-assistant.ts:95', englishPrompt);

      // 2. Тепер генеруємо зображення, використовуючи англійський текст
      this.aiService.generateDesign(englishPrompt).subscribe({
        next: (response: any) => {
          this.generatedImage.set(response?.imageUrl || null);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.errorMessage.set('Помилка генерації зображення.');
          this.isLoading.set(false);
        }
      });
    },
    error: (err) => {
      console.error('Translation error: - ai-assistant.ts:110', err);
      // Якщо переклад впав, пробуємо згенерувати як є (fallback)
      this.aiService.generateDesign(vision).subscribe({
        next: (response: any) => {
          this.generatedImage.set(response?.imageUrl || null);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.isLoading.set(false);
        }
      });
    }
  });
}

useExample(example: string): void {
  this.userVision.set(example);
  this.closeInspirationModal();
}


// ✅ Валідація коротких полів (основа, стиль, кольори)
validateField(fieldName: string, value: string): string {
  if (!value.trim()) return '';
  if (value.trim().length < 3) return 'Опишіть детальніше';
  if (value.trim().length > this.MAX_FIELD_LENGTH) return `Максимум ${this.MAX_FIELD_LENGTH} символів`;

  for (const pattern of this.FORBIDDEN_PATTERNS) {
    if (pattern.test(value)) return 'Не підходить для ручного розпису';
  }
if (!/[a-zA-Zа-яА-ЯіІїЇєЄґҐ']/.test(value)) return 'Введіть текст, а не лише символи';
  return '';
}

// ✅ Валідація головного текстового опису
validateVisionText(value: string): string {
  const lowerValue = value.toLowerCase();
  if (!value.trim()) return '';
  if (value.trim().length < 10) return 'Опишіть ідею детальніше (мінімум 10 символів)';
  if (value.trim().length > 250) return 'Максимум 250 символів';      
if (!/[a-zA-Zа-яА-ЯіІїЇєЄґҐ']/.test(value)) return 'Введіть текст, а не лише символи';

  for (const pattern of this.FORBIDDEN_PATTERNS) {
    if (pattern.test(value)) return 'Такий вміст ми не зможемо нанести на одяг';
  }
  for (const word of this.FORBIDDEN_CATEGORIES) {
    if (lowerValue.includes(word)) return `Ми не працюємо з категорією: ${word}`;
  }
  return '';
}

// Обробники змін для HTML
onVisionChange(value: string) {
  this.userVision.set(value);
  this.fieldErrors.update(prev => ({ ...prev, vision: this.validateVisionText(value) }));
}

onCustomGarmentChange(value: string) {
  this.customGarment.set(value);
  this.fieldErrors.update(prev => ({ ...prev, garment: this.validateField('garment', value) }));
  this.buildPrompt();
}

onCustomPlacementChange(value: string) {
  this.customPlacement.set(value);
  this.fieldErrors.update(prev => ({ ...prev, placement: this.validateField('placement', value) }));
  this.buildPrompt();
}

onCustomStyleChange(value: string) {
  this.customStyle.set(value);
  this.fieldErrors.update(prev => ({ ...prev, style: this.validateField('style', value) }));
  this.buildPrompt();
}

onCustomColorsChange(value: string) {
  this.customColors.set(value);
  this.fieldErrors.update(prev => ({ ...prev, colors: this.validateField('colors', value) }));
  this.buildPrompt();
}

onDesignIdeaChange(value: string) {
  this.designIdea.set(value);
  this.fieldErrors.update(prev => ({ ...prev, idea: this.validateField('idea', value) }));
  this.buildPrompt();
}

garments = [
  'біла оверсайз футболка',
  'чорна футболка стандартного крою',
  'бежева футболка',
  'чорне худі',
  'сіре меланжеве худі',
  'молочне оверсайз худі',
  'чорний бомбер',
  'джинсова куртка',
  'білий лонгслів',
  'чорний лонгслів',
  'темно-синя толстовка без капюшона',
  'бежевий світшот'
];

placements = [
  'великий центральний принт на грудях',
  'великий принт на всю спину',
  'малий лого-принт на лівому боці грудей',
  'принт по всій поверхні',
  'принт вздовж рукава',
  'принт на плечі',
  'злегка зміщений принт ліворуч на грудях',
  'горизонтальний принт по низу футболки'
];
styles = [
  'мінімалізм — чисті лінії, без зайвих деталей',
  'ручний розпис — видимі мазки пензля, жива текстура',
  'акварель — прозорі шари, плавні переходи',
  'гравюра — штрихування, чорно-білий графічний стиль',
  'вінтаж / ретро — подряпини, вицвілі кольори, старіння',
  'стріт-арт / графіті — жирні лінії, урбан-естетика',
  'аніме / манга — великі очі, динамічні лінії',
  'кіберпанк — неон, цифрові глітчі, футуризм',
  'ботанічна ілюстрація — детальні рослини, наукова точність',
  'геометрія — симетрія, абстрактні форми, орнамент',
  'вишиванка / етно — традиційні орнаменти, народні мотиви',
  'японський стиль — мінімалізм, каліграфія, природа'
];

colorPalettes = [
  'чорний та білий (класичний контраст)',
  'чорний та золотий (розкіш)',
  'білий та теракота (тепла земля)',
  'пастельний рожевий та лавандовий',
  'глибокий бордо та темно-синій',
  'яскравий неоново-рожевий та електрик',
  'пісочний, беж та коричневий (нейтральний)',
  'смарагдовий та золотий',
  'блакитний та молочно-білий (свіжість)',
  'червоний та чорний (агресивний контраст)',
  'олива та коричневий (мілітарі)',
  'мультиколор — яскрава палітра без обмежень'
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
    `${garment || 'футболка'} ` +
    `з ${placement || 'принтом спереду'}. ` +
    `${idea ? `Головний елемент: ${idea}. ` : ''}` +
    `${style ? `Стиль: ${style}. ` : ''}` +
    `${colors ? `Кольори: ${colors}. ` : ''}` +
    `макет професійного одягу, центральне розташування, реалістична текстура тканини, прозорий фон, висока деталізація, сучасний брендинг у сфері моди`;

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
      this.showToast('✨ Дизайн збережено у вашій колекції!', 'success');
    },
    error: (err) => {
      this.isSaving.set(false);
      console.error(err);
      this.showToast('Сталася помилка. Спробуйте ще раз.', 'error');
    }
  });
}
}

