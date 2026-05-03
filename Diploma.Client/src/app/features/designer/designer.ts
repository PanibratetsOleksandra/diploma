import { Component, AfterViewInit, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
  private canvas!: Canvas;
  private history: string[] = [];
  private historyIndex = -1;
  private isRestoring = false;

  private router = inject(Router);
  public authService = inject(AuthService);
  private designerService = inject(DesignerService);

  selectedView = signal<GarmentView>('front');
  selectedTool = signal<Tool>(null);
  selectedGarment = signal<Garment>('hoodie');
  selectedColor = signal('#000000');
  layers = signal<FabricObject[]>([]);

  frontDesign = signal<string | null>(null);
  backDesign = signal<string | null>(null);

  // JSON-стан canvas для кожної сторони окремо
  private frontCanvasJSON: string | null = null;
  private backCanvasJSON: string | null = null;

  private mockupBaseUrl = 'http://localhost:5000/images/mockups';

  garments = [
    { 
      id: 'tshirt' as Garment, 
      name: 'T-Shirt', 
      icon: '👕', 
      views: { 
        front: `${this.mockupBaseUrl}/tshirt-front.png`, 
        back: `${this.mockupBaseUrl}/tshirt-back.png` 
      } 
    },
    { 
      id: 'sweatshirt' as Garment, 
      name: 'Sweatshirt', 
      icon: '🧥', 
      views: { 
        front: `${this.mockupBaseUrl}/sweatshirt-front.png`, 
        back: `${this.mockupBaseUrl}/sweatshirt-back.png` 
      } 
    },
    { 
      id: 'hoodie' as Garment, 
      name: 'Hoodie', 
      icon: '👚', 
      views: { 
        front: `${this.mockupBaseUrl}/hoodie-front.png`, 
        back: `${this.mockupBaseUrl}/hoodie-back.png` 
      } 
    },
    { 
      id: 'tote' as Garment, 
      name: 'Tote Bag', 
      icon: '👜', 
      views: { 
        front: `${this.mockupBaseUrl}/tote-bag-front.png`, 
        back: `${this.mockupBaseUrl}/tote-bag-back.png` 
      } 
    },
    { 
      id: 'denimJacket' as Garment, 
      name: 'Denim Jacket', 
      icon: '👔', 
      views: { 
        front: `${this.mockupBaseUrl}/denim-jacket-front.png`, 
        back: `${this.mockupBaseUrl}/denim-jacket-back.png` 
      } 
    }
  ];

  colors = [
    '#000000', '#ffffff', '#ff5f5f', '#4ecdc4', '#45b7d1', 
    '#ff9671', '#8dd3c7', '#f9d56e', '#b388c9', '#8795a1'
  ];

ngOnInit(): void {
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

  // loadGarmentMockup тепер автоматично підхопить frontCanvasJSON/backCanvasJSON
  // якщо вони були відновлені в ngOnInit
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

    const imageUrl = garment.views[this.selectedView()];

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
      console.error('Error loading mockup: - designer.ts:245', e);
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
    // Скидаємо збережені стани при зміні виробу
    this.frontCanvasJSON = null;
    this.backCanvasJSON = null;
    this.loadGarmentMockup();
  }

  chooseTool(tool: Tool): void {
    this.selectedTool.set(tool);
    this.canvas.isDrawingMode = false;

    if (tool === 'brush') {
      this.canvas.isDrawingMode = true;
      const brush = new PencilBrush(this.canvas);
      brush.color = this.selectedColor();
      brush.width = 4;
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
      fontSize: 34,
      fill: this.selectedColor(),
      originX: 'center',
      originY: 'center',
      fontWeight: 'bold',
      name: 'Text'
    });
    this.canvas.add(text);
    this.canvas.setActiveObject(text);
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
      console.log('✅ Design saved! - designer.ts:513');
    },
    error: (err) => {
      console.error('❌ Save error: - designer.ts:516', err);
      console.error('❌ Validation errors: - designer.ts:517', JSON.stringify(err.error?.errors));
    }
  });
}

// Рендерить вказану сторону у тимчасовий off-screen canvas і повертає dataUrl
private async renderSideToDataUrl(view: GarmentView, savedJSON: string | null): Promise<string> {
  const garment = this.garments.find(g => g.id === this.selectedGarment());
  if (!garment) return '';

  const imageUrl = garment.views[view];

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
    console.error('Error rendering side: - designer.ts:572', e);
    tempCanvas.dispose();
    return '';
  }
}

}