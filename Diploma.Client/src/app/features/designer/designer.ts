import { Component, AfterViewInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Canvas,
  FabricImage,
  IText,
  Circle,
  Rect,
  PencilBrush,
  FabricObject
} from 'fabric';

type Tool = 'brush' | 'circle' | 'square' | 'text' | 'upload' | null;
type Garment = 'tshirt' | 'sweatshirt' | 'hoodie' | 'tote' | 'denimJacket';
type GarmentView = 'front' | 'back';

@Component({
  selector: 'app-designer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './designer.html'
})
export class DesignerComponent implements AfterViewInit {
  private canvas!: Canvas;
  private history: string[] = [];
  private historyIndex = -1;
  private isRestoring = false;
  private backgroundImage: FabricImage | null = null;
  
  selectedView = signal<GarmentView>('front');
  selectedTool = signal<Tool>(null);
  selectedGarment = signal<Garment>('hoodie');
  selectedColor = signal('#000000');
  layers = signal<FabricObject[]>([]);

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
    '#000000',
    '#ffffff',
    '#ff5f5f',
    '#4ecdc4',
    '#45b7d1',
    '#ff9671',
    '#8dd3c7',
    '#f9d56e',
    '#b388c9',
    '#8795a1'
  ];

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

    this.loadGarmentMockup();
  }

  async loadGarmentMockup(): Promise<void> {
    const garment = this.garments.find(g => g.id === this.selectedGarment());
    if (!garment) return;

    const imageUrl = garment.views[this.selectedView()];
    
    // Очищаємо canvas, але зберігаємо всі об'єкти крім фону
    const designObjects = this.canvas.getObjects().filter(obj => obj !== this.backgroundImage && obj.selectable !== false);
    
    // Видаляємо тільки фон
    if (this.backgroundImage) {
      this.canvas.remove(this.backgroundImage);
    }
    
    // Завантажуємо нове фото
    try {
      const img = await FabricImage.fromURL(imageUrl);
      
      const canvasWidth = this.canvas.getWidth();
      const canvasHeight = this.canvas.getHeight();
      
      const imgWidth = img.width ?? 1;
      const imgHeight = img.height ?? 1;
      
      // Відступи
      const padding = 10;
      
      // Розраховуємо масштаб
      const scale = Math.min(
        (canvasWidth - padding) / imgWidth,
        (canvasHeight - padding) / imgHeight
      );
      
      img.scale(scale);
      
      // Центруємо
      img.set({
        left: (canvasWidth - imgWidth * scale) / 2,
        top: (canvasHeight - imgHeight * scale) / 2,
        selectable: false,
        objectCaching: false,
        evented: false
      });
      
      (img as any).name = `${garment.name} ${this.selectedView()}`;
      
      // Додаємо фон
      this.canvas.add(img);
      this.canvas.sendObjectToBack(img);
      this.backgroundImage = img;
      
      // Повертаємо всі дизайн-об'єкти назад
      designObjects.forEach(obj => {
        this.canvas.add(obj);
      });
      
      this.canvas.renderAll();
      this.saveHistory();
      this.updateLayers();
    } catch (error) {
      console.error('Error loading garment mockup: - designer.ts:175', error);
    }
  }

  chooseGarment(garment: Garment): void {
    this.selectedGarment.set(garment);
    this.selectedView.set('front');
    this.loadGarmentMockup();
  }

  chooseTool(tool: Tool): void {
    this.selectedTool.set(tool);
    
    if (this.canvas.isDrawingMode) {
      this.canvas.isDrawingMode = false;
    }

    if (tool === 'brush') {
      this.canvas.isDrawingMode = true;
      this.canvas.freeDrawingBrush = new PencilBrush(this.canvas);
      this.canvas.freeDrawingBrush.color = this.selectedColor();
      this.canvas.freeDrawingBrush.width = 4;
      return;
    }

    if (tool === 'circle') {
      this.addCircle();
    }

    if (tool === 'square') {
      this.addSquare();
    }

    if (tool === 'text') {
      this.addText();
    }
    
    // Скидаємо активний інструмент після додавання фігури
    if (tool !== 'brush' && tool !== 'upload') {
      this.selectedTool.set(null);
    }
  }

  selectColor(color: string): void {
    this.selectedColor.set(color);

    if (this.canvas.isDrawingMode && this.canvas.freeDrawingBrush) {
      this.canvas.freeDrawingBrush.color = color;
    }

    const active = this.canvas.getActiveObject();
    if (active && active !== this.backgroundImage) {
      active.set('fill', color);
      this.canvas.renderAll();
      this.saveHistory();
    }
  }

  addCircle(): void {
    const circle = new Circle({
      left: 230,
      top: 240,
      radius: 45,
      fill: this.selectedColor(),
      stroke: '#333',
      strokeWidth: 1,
      name: 'Circle'
    });

    this.canvas.add(circle);
    this.canvas.setActiveObject(circle);
    this.canvas.renderAll();
    this.saveHistory();
  }

  addSquare(): void {
    const square = new Rect({
      left: 220,
      top: 240,
      width: 100,
      height: 100,
      fill: this.selectedColor(),
      stroke: '#333',
      strokeWidth: 1,
      rx: 8,
      ry: 8,
      name: 'Square'
    });

    this.canvas.add(square);
    this.canvas.setActiveObject(square);
    this.canvas.renderAll();
    this.saveHistory();
  }

  addText(): void {
    const text = new IText('Your Text', {
      left: 190,
      top: 250,
      fontSize: 34,
      fill: this.selectedColor(),
      fontWeight: 'bold',
      stroke: '#333',
      strokeWidth: 0.5,
      name: 'Text'
    });

    this.canvas.add(text);
    this.canvas.setActiveObject(text);
    this.canvas.renderAll();
    this.saveHistory();
  }

  async uploadImage(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    // Скидаємо інструмент
    this.selectedTool.set(null);
    
    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const img = await FabricImage.fromURL(reader.result as string);
        
        // Розраховуємо оптимальний розмір для вставки
        const maxSize = 200;
        let width = img.width ?? maxSize;
        let height = img.height ?? maxSize;
        
        let scale = 1;
        if (width > maxSize || height > maxSize) {
          scale = Math.min(maxSize / width, maxSize / height);
        }
        
        img.scale(scale);
        
        img.set({
          left: (this.canvas.getWidth() - (width * scale)) / 2,
          top: (this.canvas.getHeight() - (height * scale)) / 2,
          name: 'Uploaded Image'
        });

        this.canvas.add(img);
        this.canvas.setActiveObject(img);
        this.canvas.renderAll();
        this.saveHistory();
      } catch (error) {
        console.error('Error uploading image: - designer.ts:326', error);
      }
    };

    reader.readAsDataURL(file);
    input.value = ''; // Очищаємо input
  }

  deleteSelected(): void {
    const active = this.canvas.getActiveObject();

    if (active && active !== this.backgroundImage && active.selectable !== false) {
      this.canvas.remove(active);
      this.canvas.renderAll();
      this.saveHistory();
    }
  }

  undo(): void {
    if (this.historyIndex <= 0) return;

    this.historyIndex--;
    this.restoreHistory();
  }

  redo(): void {
    if (this.historyIndex >= this.history.length - 1) return;

    this.historyIndex++;
    this.restoreHistory();
  }

  private saveHistory(): void {
    if (this.isRestoring) return;

    // Зберігаємо стан canvas без фону для історії
    const objectsToSave = this.canvas.getObjects().filter(obj => obj !== this.backgroundImage);
    const tempCanvas = new Canvas(null, { width: 560, height: 560 });
    
    objectsToSave.forEach(obj => {
      const cloned = obj.toObject();
      tempCanvas.add(cloned);
    });
    
    const json = JSON.stringify(tempCanvas.toJSON());
    tempCanvas.dispose();

    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(json);
    this.historyIndex = this.history.length - 1;

    this.updateLayers();
  }

  private async restoreHistory(): Promise<void> {
    this.isRestoring = true;

    // Видаляємо всі дизайн-об'єкти, але залишаємо фон
    const designObjects = this.canvas.getObjects().filter(obj => obj !== this.backgroundImage);
    designObjects.forEach(obj => this.canvas.remove(obj));
    
    // Відновлюємо збережені об'єкти
    if (this.history[this.historyIndex]) {
      const loadedCanvas = new Canvas(null);
      await loadedCanvas.loadFromJSON(this.history[this.historyIndex]);
      
      loadedCanvas.getObjects().forEach(obj => {
        this.canvas.add(obj);
      });
      
      loadedCanvas.dispose();
    }
    
    this.canvas.renderAll();
    this.isRestoring = false;
    this.updateLayers();
  }

  private onCanvasChanged(): void {
    if (!this.isRestoring) {
      this.updateLayers();
    }
  }

  updateLayers(): void {
    const objects = this.canvas
      .getObjects()
      .filter(obj => obj !== this.backgroundImage && obj.selectable !== false);

    this.layers.set(objects.reverse());
  }

  selectLayer(layer: FabricObject): void {
    if (layer !== this.backgroundImage) {
      this.canvas.setActiveObject(layer);
      this.canvas.renderAll();
    }
  }

  downloadDesign(): void {
    // Тимчасово ховаємо фон для експорту
    const wasSelectable = this.backgroundImage?.selectable;
    if (this.backgroundImage) {
      this.backgroundImage.selectable = false;
      this.backgroundImage.evented = false;
    }
    
    const dataUrl = this.canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2
    });

    // Повертаємо фон
    if (this.backgroundImage) {
      this.backgroundImage.selectable = wasSelectable ?? false;
      this.backgroundImage.evented = false;
    }

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'custom-design.png';
    link.click();
  }

  saveDesign(): void {
    const dataUrl = this.canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2
    });

    console.log('Saved design: - designer.ts:458', dataUrl);
    alert('Design saved successfully!');
  }

  sendForHandPainting(): void {
    alert('Design sent for hand painting!');
  }

  getLayerName(layer: FabricObject): string {
    return (layer as any).name || layer.type || 'Layer';
  }

  rotateLeft(): void {
    this.selectedView.set(this.selectedView() === 'front' ? 'back' : 'front');
    this.loadGarmentMockup();
  }

  rotateRight(): void {
    this.selectedView.set(this.selectedView() === 'front' ? 'back' : 'front');
    this.loadGarmentMockup();
  }
}