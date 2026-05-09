// preview3d.component.ts
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  ViewChild,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

type Garment = 'tshirt' | 'sweatshirt' | 'hoodie' | 'tote' | 'denimJacket';

@Component({
  selector: 'app-preview3d',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preview3d.html'
})
export class Preview3DComponent implements AfterViewInit, OnDestroy {
  @ViewChild('threeCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input() frontDesignUrl: string | null = null;
  @Input() backDesignUrl: string | null = null;
  @Input() garmentType: Garment = 'tshirt';

  @Output() close = new EventEmitter<void>();

  isLoading = signal(true);
  hasError = signal(false);
  currentSide = signal<'front' | 'back'>('front');

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private animationId!: number;
  private model: THREE.Object3D | null = null;
  private frontMaterial: THREE.MeshStandardMaterial | null = null;
  private backMaterial: THREE.MeshStandardMaterial | null = null;

  // Шляхи до 3D моделей в assets
  private modelPaths: Record<Garment, string> = {
    tshirt:      'assets/models/tshirt.glb',
    sweatshirt:  'assets/models/sweatshirt.glb',
    hoodie:      'assets/models/hoodie.glb',
    tote:        'assets/models/tote.glb',
    denimJacket: 'assets/models/denim-jacket.glb'
  };

  ngAfterViewInit(): void {
    this.initThree();
    this.loadModel();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
    this.controls?.dispose();
    this.renderer?.dispose();
  }

  private initThree(): void {
    const canvas = this.canvasRef.nativeElement;
    const width = canvas.parentElement?.clientWidth || 700;
    const height = canvas.parentElement?.clientHeight || 600;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf7f8fa);

    // Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 0.5, 3);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(3, 5, 3);
    dirLight.castShadow = true;
    this.scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0xfff0e0, 0.4);
    fillLight.position.set(-3, 0, -3);
    this.scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xe06a00, 0.3);
    rimLight.position.set(0, -2, -3);
    this.scene.add(rimLight);

    // Controls
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 1.5;
    this.controls.maxDistance = 6;
    this.controls.maxPolarAngle = Math.PI * 0.85;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 1.5;

    // Animate loop
    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    };
    animate();

    // Resize
    window.addEventListener('resize', this.onResize.bind(this));
  }

  private async loadModel(): Promise<void> {
  this.isLoading.set(true);
  this.hasError.set(false);

  const modelPath = this.modelPaths[this.garmentType];
  const loader = new GLTFLoader();

  try {
    const gltf = await new Promise<any>((resolve, reject) => {
      loader.load(modelPath, resolve, undefined, reject);
    });

    const model = gltf.scene as THREE.Object3D; // ← локальна змінна, не null

    // Центруємо модель
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 2.5 / maxDim;

    model.scale.setScalar(scale);
    model.position.sub(center.multiplyScalar(scale));

    this.model = model; // ← тепер присвоюємо після всіх операцій

    await this.applyDesignTextures();

    this.scene.add(model); // ← використовуємо локальну змінну
    this.isLoading.set(false);

  } catch (error) {
    console.error('3D model load error: - preview3d.component.ts:167', error);
    this.loadFallbackModel();
  }
}

  // Fallback: проста геометрія якщо GLB не знайдено
  private async loadFallbackModel(): Promise<void> {
    const geometry = new THREE.CylinderGeometry(0.6, 0.5, 1.4, 32, 1, true);

    const frontTexture = this.frontDesignUrl
      ? await this.loadTextureFromDataUrl(this.frontDesignUrl)
      : null;

    const material = new THREE.MeshStandardMaterial({
      map: frontTexture,
      color: frontTexture ? 0xffffff : 0xeeeeee,
      roughness: 0.8,
      metalness: 0.0,
      side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geometry, material);
    this.model = mesh;
    this.scene.add(mesh);
    this.isLoading.set(false);
  }

 private async applyDesignTextures(): Promise<void> {
  if (!this.model) return;
  this.model.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      console.log('Mesh name: - preview3d.component.ts:198', child.name, '| Material:', child.material);
    }
  });
  

  const frontTexture = this.frontDesignUrl
    ? await this.loadTextureFromDataUrl(this.frontDesignUrl)
    : null;

  const backTexture = this.backDesignUrl
    ? await this.loadTextureFromDataUrl(this.backDesignUrl)
    : null;

  this.model.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;

    const meshName = child.name.toLowerCase();

    const isFrontMesh =
      meshName.includes('front') ||
      meshName.includes('body') ||
      meshName.includes('chest') ||
      meshName === 'mesh_0';

    const isBackMesh = meshName.includes('back');

    // БАЗОВИЙ МАТЕРІАЛ ТКАНИНИ
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
      metalness: 0.02
    });

    // FRONT PRINT
    if (
      frontTexture &&
      (isFrontMesh || (!isBackMesh && !meshName.includes('sleeve')))
    ) {
      material.map = frontTexture;
    }

    // BACK PRINT
    else if (backTexture && isBackMesh) {
      material.map = backTexture;
    }

    child.material = material;



    
  });
}

private loadTextureFromDataUrl(dataUrl: string): Promise<THREE.Texture> {
  return new Promise((resolve) => {
    const loader = new THREE.TextureLoader();

    loader.load(dataUrl, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;

      texture.flipY = false;

      texture.premultiplyAlpha = true;

      texture.needsUpdate = true;

      resolve(texture);
    });
  });
}

  private onResize(): void {
    const canvas = this.canvasRef.nativeElement;
    const width = canvas.parentElement?.clientWidth || 700;
    const height = canvas.parentElement?.clientHeight || 600;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  // Зупинити/запустити авторотацію при взаємодії
  stopAutoRotate(): void {
    this.controls.autoRotate = false;
  }

  startAutoRotate(): void {
    this.controls.autoRotate = true;
  }

  onClose(): void {
    this.close.emit();
  }
}