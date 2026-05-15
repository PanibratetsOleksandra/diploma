import { Component, AfterViewInit, signal, inject, OnInit, HostListener, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ImageService } from '../../core/services/image.service'; 


import { 
  Canvas, 
  FabricImage, 
  IText, 
  Circle, 
  Rect, 
  PencilBrush, 
  FabricObject 
} from 'fabric';

import { AuthService } from '../../core/services/auth.service';
import { DesignerService } from '../../core/services/designer.service';
import { UserService } from '../../core/services/user.service';

type Tool = 'brush' | 'circle' | 'square' | 'text' | 'upload' | null;
type Garment = 'tshirt' | 'sweatshirt' | 'hoodie' | 'tote' | 'denimJacket';
type GarmentView = 'front' | 'back';

@Component({
  selector: 'app-designer',
  standalone: true,
imports: [CommonModule, FormsModule],
  templateUrl: './designer.html',
  styleUrl: './designer.scss'
})
export class DesignerComponent implements AfterViewInit, OnInit {
public canvas!: Canvas;
  private history: string[] = [];
  private historyIndex = -1;
  private isRestoring = false;
private userService = inject(UserService);
garmentPricesList = signal<any[]>([]);
basePrice = signal<number>(0);         
artPriceBase = signal<number>(1000);   
toastMessage = signal('');
toastType = signal<'success' | 'error'>('success');
  
frontOverlay = signal<string | null>(null);
backOverlay = signal<string | null>(null);



  private router = inject(Router);
  public authService = inject(AuthService);
  private designerService = inject(DesignerService);
public imageService = inject(ImageService);
  selectedView = signal<GarmentView>('front');
  selectedTool = signal<Tool>(null);
  selectedGarment = signal<Garment>('hoodie');
  selectedColor = signal('#000000');
  selectedFontFamily = signal<string>('Arial');
  selectedFontSize = signal<number>(34);
  fonts = ['Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Impact', 'Comic Sans MS'];
  brushWidth = signal<number>(6);
  selectedOpacity = signal<number>(1); 
  layers = signal<FabricObject[]>([]);

  frontDesign = signal<string | null>(null);
  backDesign = signal<string | null>(null);

  // JSON-стан canvas для кожної сторони окремо
  private frontCanvasJSON: string | null = null;
  private backCanvasJSON: string | null = null;


 garments = [
    { id: 'tshirt' as Garment, name: 'T-Shirt', icon: '👕', views: { front: 'images/mockups/tshirt-front.png', back: 'images/mockups/tshirt-back.png' } },
    { id: 'sweatshirt' as Garment, name: 'Sweatshirt', icon: '🧥', views: { front: 'images/mockups/sweatshirt-front.png', back: 'images/mockups/sweatshirt-back.png' } },
    { id: 'hoodie' as Garment, name: 'Hoodie', icon: '👚', views: { front: 'images/mockups/hoodie-front.png', back: 'images/mockups/hoodie-back.png' } },
    { id: 'tote' as Garment, name: 'Tote Bag', icon: '👜', views: { front: 'images/mockups/tote-bag-front.png', back: 'images/mockups/tote-bag-back.png' } },
    { id: 'denimJacket' as Garment, name: 'Denim Jacket', icon: '👔', views: { front: 'images/mockups/denim-jacket-front.png', back: 'images/mockups/denim-jacket-back.png' } }
  ];

  colors = [
    '#000000', '#ffffff', '#ff5f5f', '#4ecdc4', '#45b7d1', 
    '#ff9671', '#8dd3c7', '#f9d56e', '#b388c9', '#8795a1'
  ];

// 🔥 Глобальне слухання клавіатури: Видалення та гарячі комбінації Ctrl+Z / Ctrl+Y
// 🔥 Надійне слухання клавіатури, яке працює на будь-якій розкладці (UA / EN)
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    const activeObject = this.canvas?.getActiveObject();
    
    // Якщо користувач зараз пише текст, гарячі клавіші не чіпаємо
    if (activeObject && activeObject.type === 'i-text' && (activeObject as any).isEditing) {
      return; 
    }

    // 1. Обробка комбінацій Ctrl + Z та Ctrl + Y через фізичні коди клавіш
    if (event.ctrlKey || event.metaKey) {
      if (event.code === 'KeyZ') {
        event.preventDefault();
        this.undo();
      } 
      else if (event.code === 'KeyY') {
        event.preventDefault();
        this.redo();
      }
      return;
    }

    // 2. Видалення об'єктів
    if (event.key === 'Delete' || event.key === 'Backspace') {
      this.deleteSelected();
    }
  }

ngOnInit(): void {
    this.loadPrices();
  const saved = sessionStorage.getItem('pendingManualDesign');
  if (saved) {
    const data = JSON.parse(saved);
    
    // Відновлюємо PNG сигнали
    this.frontDesign.set(data.front ?? null);
    this.backDesign.set(data.back ?? null);
  
    // Відновлюємо JSON стани canvas для обох сторін
    this.frontCanvasJSON = data.frontJSON ?? null;
    this.backCanvasJSON = data.backJSON ?? null;
    
    // Відновлюємо гарментт і сторону
    if (data.garment) this.selectedGarment.set(data.garment);
    if (data.view) this.selectedView.set(data.view);

    // Якщо вже залогінений — одразу зберігаємо і чистимо sessionStorage
    if (this.authService.currentUser()) {
      // Невелика затримка щоб canvas встиг ініціалізуватись в ngAfterViewInit
      setTimeout(() => {
        this.renderOtherSideAndSave();
        sessionStorage.removeItem('pendingManualDesign');
      }, 500);
    }
  }
}




// 1. Метод для отримання цін з бекенду
loadPrices(): void {
  this.userService.getGarmentPrices().subscribe({
    next: (data) => {
      this.garmentPricesList.set(data);
      // Відразу оновлюємо ціну для початкового виробу (hoodie)
      this.updatePriceByType(this.selectedGarment());
    },
    error: (err) => console.error('Помилка завантаження цін: - designer.ts:156', err)
  });
}

// 2. Допоміжний метод для пошуку ціни в списку за типом
updatePriceByType(type: string): void {
  const found = this.garmentPricesList().find(
    p => p.garmentType.toLowerCase() === type.toLowerCase()
  );
  if (found) {
    this.basePrice.set(found.basePrice);
  } else {
    this.basePrice.set(1000); 
  }
}

ngAfterViewInit(): void {
  this.canvas = new Canvas('designerCanvas', {
    width: 560,
    height: 560,
    backgroundColor: '#f7f8fa',
    preserveObjectStacking: true
  });

  this.canvas.on('object:added', () => this.onCanvasChanged());
  this.canvas.on('object:modified', () => this.onCanvasChanged());
  this.canvas.on('object:removed', () => this.onCanvasChanged());

    this.canvas.on('selection:created', (e) => {
      const active = e.selected?.[0];
      if (active) this.selectedOpacity.set(active.opacity ?? 1);
    });
    this.canvas.on('selection:updated', (e) => {
      const active = e.selected?.[0];
      if (active) this.selectedOpacity.set(active.opacity ?? 1);
    });


    this.canvas.on('selection:created', (e) => {
      const active = e.selected?.[0];
      if (active) {
        this.selectedOpacity.set(active.opacity ?? 1);
        // Якщо це текст, підтягуємо його параметри в повзунки
        if (active.type === 'i-text') {
          this.selectedFontFamily.set((active as any).fontFamily ?? 'Arial');
          this.selectedFontSize.set((active as any).fontSize ?? 34);
        }
      }
    });

    this.canvas.on('selection:updated', (e) => {
      const active = e.selected?.[0];
      if (active) {
        this.selectedOpacity.set(active.opacity ?? 1);
        if (active.type === 'i-text') {
          this.selectedFontFamily.set((active as any).fontFamily ?? 'Arial');
          this.selectedFontSize.set((active as any).fontSize ?? 34);
        }
      }
    });
  this.loadGarmentMockup();
}

  // Зберігає JSON user-об'єктів поточної сторони (без мокапу)
  private saveCurrentViewState(): void {
    const userObjects = this.canvas
      .getObjects()
      .filter(obj => (obj as any).name !== 'mockup');

    const tempData = {
      objects: userObjects.map(obj => obj.toObject(['name']))
    };

    const json = JSON.stringify(tempData);

    if (this.selectedView() === 'front') {
      this.frontCanvasJSON = json;
    } else {
      this.backCanvasJSON = json;
    }
  }

  // Зберігає PNG-знімок поточної сторони (для saveDesign)
  private saveCurrentView(): void {
    this.saveCurrentViewState();

    const dataUrl = this.canvas.toDataURL({ format: 'png', multiplier: 2 });
    if (this.selectedView() === 'front') {
      this.frontDesign.set(dataUrl);
    } else {
      this.backDesign.set(dataUrl);
    }
  }

  // Єдина точка завантаження — мокап + відновлення JSON поточної сторони
  async loadGarmentMockup(): Promise<void> {
    const garment = this.garments.find(g => g.id === this.selectedGarment());
    if (!garment) return;

const imageUrl = this.imageService.getFullImageUrl(garment.views[this.selectedView()]);

    this.canvas.clear();
    this.canvas.backgroundColor = '#f7f8fa';

    try {
      const img = await FabricImage.fromURL(imageUrl, { crossOrigin: 'anonymous' });
      const scale = Math.min(
        this.canvas.getWidth() / img.width!,
        this.canvas.getHeight() / img.height!
      );

      img.set({
        scaleX: scale,
        scaleY: scale,
        left: this.canvas.getWidth() / 2,
        top: this.canvas.getHeight() / 2,
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false,
        name: 'mockup'
      });

      // Отримуємо збережений JSON для поточної сторони
      const savedJSON = this.selectedView() === 'front'
        ? this.frontCanvasJSON
        : this.backCanvasJSON;

      if (savedJSON) {
        // Відновлюємо canvas: мокап + user-об'єкти з JSON
        const parsed = JSON.parse(savedJSON);
        await this.canvas.loadFromJSON({
          version: '6.0.0',
        objects: [img.toObject() as any, ...parsed.objects]
        });

        // Після loadFromJSON — знову робимо мокап non-interactive
        const mockupObj = this.canvas
          .getObjects()
          .find(o => (o as any).name === 'mockup');

        if (mockupObj) {
          mockupObj.set({ selectable: false, evented: false });
          this.canvas.sendObjectToBack(mockupObj);
        }
      } else {
        // Перше завантаження — просто додаємо мокап
        this.canvas.add(img);
        this.canvas.sendObjectToBack(img);
      }

      this.canvas.renderAll();
      this.saveHistory();
      this.updateLayers();

    } catch (e) {
      console.error('Error loading mockup: - designer.ts:312', e);
    }
  }

  // Більше не використовується окремо — залишено для сумісності
  async loadSavedView(): Promise<void> {
    await this.loadGarmentMockup();
  }

  chooseGarment(garment: Garment): void {
    // Зберігаємо поточну сторону перед зміною виробу
    this.saveCurrentViewState();
    this.selectedGarment.set(garment);
    this.updatePriceByType(garment);
    this.frontCanvasJSON = null;
    this.backCanvasJSON = null;
    this.loadGarmentMockup();
  }

  updateBrushWidth(width: number): void {
  this.brushWidth.set(width);
  if (this.canvas && this.canvas.isDrawingMode && this.canvas.freeDrawingBrush) {
    this.canvas.freeDrawingBrush.width = width;
  }
}

  chooseTool(tool: Tool): void {
    this.selectedTool.set(tool);
    this.canvas.isDrawingMode = false;

    if (tool === 'brush') {
      this.canvas.isDrawingMode = true;
      const brush = new PencilBrush(this.canvas);
      brush.color = this.selectedColor();
  brush.width = this.brushWidth();
      this.canvas.freeDrawingBrush = brush;
    } else if (tool === 'circle') {
      this.addCircle();
    } else if (tool === 'square') {
      this.addSquare();
    } else if (tool === 'text') {
      this.addText();
    }
    
  }

  selectColor(color: string): void {
    this.selectedColor.set(color);
    if (this.canvas.isDrawingMode && this.canvas.freeDrawingBrush) {
      this.canvas.freeDrawingBrush.color = color;
    }
    const active = this.canvas.getActiveObject();
    if (active) {
      active.set('fill', color);
      this.canvas.renderAll();
      this.saveHistory();
    }
  }


  // 🔥 Функція зміни прозорості обраного об'єкта
  updateSelectedOpacity(opacity: number): void {
    this.selectedOpacity.set(opacity);
    const active = this.canvas?.getActiveObject();
    
    // Змінюємо прозорість тільки якщо об'єкт виділено і це не фоновий мокап
    if (active && (active as any).name !== 'mockup') {
      active.set('opacity', opacity);
      this.canvas.renderAll();
      this.saveHistory(); // Зберігаємо крок в історію Ctrl+Z
    }
  }

  addCircle(): void {
    const circle = new Circle({
      left: 280,
      top: 280,
      radius: 45,
      fill: this.selectedColor(),
      originX: 'center',
      originY: 'center',
      name: 'Circle'
    });
    this.canvas.add(circle);
    this.canvas.setActiveObject(circle);
  }

  addSquare(): void {
    const square = new Rect({
      left: 280,
      top: 280,
      width: 100,
      height: 100,
      fill: this.selectedColor(),
      originX: 'center',
      originY: 'center',
      rx: 8,
      ry: 8,
      name: 'Square'
    });
    this.canvas.add(square);
    this.canvas.setActiveObject(square);
  }

  addText(): void {
    const text = new IText('Your Text', {
      left: 280,
      top: 280,
   fontSize: this.selectedFontSize(),
fontFamily: this.selectedFontFamily(),
      fill: this.selectedColor(),
      originX: 'center',
      originY: 'center',
      fontWeight: 'bold',
      name: 'Text'
    });
    this.canvas.add(text);
    this.canvas.setActiveObject(text);
  }
// 🔥 Зміна шрифту для виділеного тексту
  updateFontFamily(font: string): void {
    this.selectedFontFamily.set(font);
    const active = this.canvas?.getActiveObject();
    if (active && active.type === 'i-text') {
      active.set('fontFamily', font);
      this.canvas.renderAll();
      this.saveHistory();
    }
  }

  // 🔥 Зміна розміру для виділеного тексту
  updateFontSize(size: number): void {
    this.selectedFontSize.set(size);
    const active = this.canvas?.getActiveObject();
    if (active && active.type === 'i-text') {
      active.set('fontSize', size);
      this.canvas.renderAll();
      this.saveHistory();
    }
  }

  
  uploadImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const img = await FabricImage.fromURL(reader.result as string);
      const scale = 150 / img.width!;
      img.set({
        left: 280,
        top: 280,
        originX: 'center',
        originY: 'center',
        scaleX: scale,
        scaleY: scale,
        name: 'Uploaded Image'
      });
      this.canvas.add(img);
      this.canvas.setActiveObject(img);
      this.canvas.renderAll();
    };
    reader.readAsDataURL(file);
  }

  deleteSelected(): void {
    const active = this.canvas.getActiveObject();
    if (active && (active as any).name !== 'mockup') {
      this.canvas.remove(active);
      this.canvas.discardActiveObject();
      this.canvas.renderAll();
    }
  }

  // 🔥 Функція для дублювання обраного об'єкта
  duplicateSelected(): void {
    const active = this.canvas.getActiveObject();
    
    // Перевіряємо, чи є активний об'єкт і чи це не фоновий мокап одягу
    if (active && (active as any).name !== 'mockup') {
      active.clone().then((cloned) => {
        this.canvas.discardActiveObject();
        
        // Зміщуємо клонований об'єкт трохи вбік і вниз, щоб користувач побачив копію
        cloned.set({
          left: cloned.left! + 20,
          top: cloned.top! + 20,
          evented: true
        });

        // Якщо це текстове поле, скидаємо стан редагування для копії
        if (cloned.type === 'i-text') {
          (cloned as any).isEditing = false;
        }

        this.canvas.add(cloned);
        this.canvas.setActiveObject(cloned); // Автоматично виділяємо нову копію
        this.canvas.renderAll();
      });
    }
  }


  // 🔥 Віддзеркалити ліворуч / праворуч (по горизонталі)
  flipHorizontal(): void {
    const active = this.canvas?.getActiveObject();
    if (active && (active as any).name !== 'mockup') {
      active.set('flipX', !active.flipX);
      this.canvas.renderAll();
      this.saveHistory();
    }
  }

  // 🔥 Віддзеркалити вгору / вниз (по вертикалі)
  flipVertical(): void {
    const active = this.canvas?.getActiveObject();
    if (active && (active as any).name !== 'mockup') {
      active.set('flipY', !active.flipY);
      this.canvas.renderAll();
      this.saveHistory();
    }
  }

  undo(): void {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.restoreHistory();
    }
  }

  redo(): void {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.restoreHistory();
    }
  }

  private saveHistory(): void {
    if (this.isRestoring) return;
    const json = JSON.stringify(this.canvas.toJSON());
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(json);
    this.historyIndex = this.history.length - 1;
    this.updateLayers();
  }

  private async restoreHistory(): Promise<void> {
    this.isRestoring = true;
    await this.canvas.loadFromJSON(this.history[this.historyIndex]);
    this.canvas.renderAll();
    this.isRestoring = false;
    this.updateLayers();
  }

  private onCanvasChanged(): void {
    if (!this.isRestoring) {
      this.saveHistory();
    }
  }

  updateLayers(): void {
    const objects = this.canvas
      .getObjects()
      .filter(obj => (obj as any).name !== 'mockup');
    this.layers.set([...objects].reverse());
  }

  selectLayer(layer: FabricObject): void {
    this.canvas.setActiveObject(layer);
    this.canvas.renderAll();
  }

  getLayerName(layer: FabricObject): string {
    return (layer as any).name || layer.type || 'Layer';
  }

  // Перемикання сторони: зберегти → переключити → завантажити
  rotateLeft(): void {
    this.saveCurrentViewState();
    this.selectedView.set(this.selectedView() === 'front' ? 'back' : 'front');
    this.loadGarmentMockup();
  }

  rotateRight(): void {
    this.saveCurrentViewState();
    this.selectedView.set(this.selectedView() === 'front' ? 'back' : 'front');
    this.loadGarmentMockup();
  }

  downloadDesign(): void {
    const dataUrl = this.canvas.toDataURL({ format: 'png', multiplier: 2 });
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `custom-design-${Date.now()}.png`;
    link.click();
  }

saveDesign(): void {
  this.saveCurrentView();

  if (!this.authService.currentUser()) {
    // Зберігаємо повний стан перед редіректом
    const front = this.frontDesign();
    const back = this.backDesign();
    
    sessionStorage.setItem('pendingManualDesign', JSON.stringify({
      front,
      back,
      frontJSON: this.frontCanvasJSON,
      backJSON: this.backCanvasJSON,
      garment: this.selectedGarment(),
      view: this.selectedView()
    }));

    this.router.navigate(['/login'], { queryParams: { returnUrl: '/designer' } });
    return;
  }

  this.renderOtherSideAndSave();
}
private async renderOtherSideAndSave(): Promise<void> {
  const currentView = this.selectedView();
  const otherView: GarmentView = currentView === 'front' ? 'back' : 'front';

  // Отримуємо вже збережений знімок поточної сторони
  const currentDesign = currentView === 'front' ? this.frontDesign() : this.backDesign();

  // Отримуємо збережений JSON іншої сторони
  const otherJSON = otherView === 'front' ? this.frontCanvasJSON : this.backCanvasJSON;

  let otherDesign: string | null = otherView === 'front'
    ? this.frontDesign()
    : this.backDesign();

  // Якщо інша сторона має об'єкти або ще не має PNG — рендеримо її
  if (otherJSON || !otherDesign) {
    otherDesign = await this.renderSideToDataUrl(otherView, otherJSON);

    // Зберігаємо результат у сигнал
    if (otherView === 'front') {
      this.frontDesign.set(otherDesign);
    } else {
      this.backDesign.set(otherDesign);
    }
  }

  const front = currentView === 'front' ? currentDesign : otherDesign;
  const back  = currentView === 'back'  ? currentDesign : otherDesign;

  if (!front && !back) return;

  const payload = {
    frontBase64: front ?? '',
    backBase64: back ?? '',
    garmentType: this.selectedGarment()
  };

  this.designerService.saveManualDesign(payload).subscribe({
    next: () => {
      sessionStorage.removeItem('pendingManualDesign');
      this.showToast('Дизайн успішно збережено в кабінет!');
    },
    error: (err) => {
      console.error('❌ Save error: - designer.ts:677', err);
      console.error('❌ Validation errors: - designer.ts:678', JSON.stringify(err.error?.errors));
    }
  });
}

// Рендерить вказану сторону у тимчасовий off-screen canvas і повертає dataUrl
private async renderSideToDataUrl(view: GarmentView, savedJSON: string | null): Promise<string> {
  const garment = this.garments.find(g => g.id === this.selectedGarment());
  if (!garment) return '';

const imageUrl = this.imageService.getFullImageUrl(garment.views[view]);

  // Створюємо тимчасовий canvas поза DOM
  const tempCanvasEl = document.createElement('canvas');
  tempCanvasEl.width = 560;
  tempCanvasEl.height = 560;

  const tempCanvas = new Canvas(tempCanvasEl, {
    width: 560,
    height: 560,
    backgroundColor: '#f7f8fa'
  });

  try {
    const img = await FabricImage.fromURL(imageUrl, { crossOrigin: 'anonymous' });
    const scale = Math.min(560 / img.width!, 560 / img.height!);

    img.set({
      scaleX: scale,
      scaleY: scale,
      left: 280,
      top: 280,
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false,
      name: 'mockup'
    });

    if (savedJSON) {
      const parsed = JSON.parse(savedJSON);
      await tempCanvas.loadFromJSON({
        version: '6.0.0',
        objects: [{ ...img.toObject(), name: 'mockup' } as any, ...parsed.objects]
      });
    } else {
      tempCanvas.add(img);
    }

    tempCanvas.renderAll();
    const dataUrl = tempCanvas.toDataURL({ format: 'png', multiplier: 2 });
    tempCanvas.dispose();
    return dataUrl;

  } catch (e) {
    console.error('Error rendering side: - designer.ts:733', e);
    tempCanvas.dispose();
    return '';
  }
}


// Рендерить ТІЛЬКИ користувацькі шари на прозорому фоні для 3D-текстури
private async renderOverlayOnly(savedJSON: string | null): Promise<string> {
  if (!savedJSON) return '';

  const parsed = JSON.parse(savedJSON);
  const userObjects = parsed.objects.filter((obj: any) => obj.name !== 'mockup');
  
  if (userObjects.length === 0) return '';

  const tempCanvasEl = document.createElement('canvas');
  tempCanvasEl.width = 560;
  tempCanvasEl.height = 560;

  const tempCanvas = new Canvas(tempCanvasEl, {
    width: 560,
    height: 560,
    backgroundColor: '' 
  });

  try {
    await tempCanvas.loadFromJSON({
      version: '6.0.0',
      objects: userObjects
    });

    tempCanvas.renderAll();
    const dataUrl = tempCanvas.toDataURL({ 
      format: 'png',
      multiplier: 2,
      enableRetinaScaling: true
    });

    tempCanvas.dispose();
    return dataUrl;

  } catch (e) {
    console.error('Error rendering overlay: - designer.ts:776', e);
    tempCanvas.dispose();
    return '';
  }
}
// 1. Коефіцієнт складності на основі кількості шарів на ПОТОЧНІЙ стороні
// (Ми залишаємо це для візуального відображення коефіцієнта під час малювання)
complexityFactor = computed(() => {
  const count = this.layers().length;
  if (count <= 2) return 1;
  if (count <= 5) return 1.2;
  return 1.5;
});

// 2. Розрахунок вартості розпису з урахуванням ОБВОХ сторін
dynamicArtPrice = computed(() => {
  const baseArt = 1000;
  
  // Функція для підрахунку об'єктів у JSON-рядку
  const getObjectCount = (jsonString: string | null) => {
    if (!jsonString) return 0;
    try {
      const parsed = JSON.parse(jsonString);
      return parsed.objects ? parsed.objects.length : 0;
    } catch { return 0; }
  };

  // Рахуємо об'єкти на обох сторонах
  // Важливо: для поточної сторони беремо дані прямо з canvas (this.layers()), 
  // а для іншої — з її збереженого JSON
  const currentSideCount = this.layers().length;
  const otherSideJSON = this.selectedView() === 'front' ? this.backCanvasJSON : this.frontCanvasJSON;
  const otherSideCount = getObjectCount(otherSideJSON);

  // Логіка нарахування:
  // Якщо на стороні є хоча б один малюнок, додаємо вартість розпису для цієї сторони
  let totalArtPrice = 0;

  // Рахуємо ціну для першої сторони (якщо не порожня)
  if (currentSideCount > 0) {
    totalArtPrice += baseArt * this.calculateFactor(currentSideCount);
  }

  // Рахуємо ціну для другої сторони (якщо не порожня)
  if (otherSideCount > 0) {
    totalArtPrice += baseArt * this.calculateFactor(otherSideCount);
  }

  // Якщо обидві сторони порожні, але користувач у конструкторі — показуємо мін. ціну 1 сторони
  return totalArtPrice > 0 ? Math.round(totalArtPrice) : baseArt;
});

// Допоміжний метод (поза computed)
private calculateFactor(count: number): number {
  if (count <= 2) return 1;
  if (count <= 5) return 1.2;
  return 1.5;
}

totalEstimatedPrice = computed(() => {
  return this.basePrice() + this.dynamicArtPrice();
});
showToast(message: string, type: 'success' | 'error' = 'success'): void {
  this.toastMessage.set(message);
  this.toastType.set(type);
  
  // Приховуємо повідомлення через 3 секунди
  setTimeout(() => {
    this.toastMessage.set('');
  }, 3000);
}

}

