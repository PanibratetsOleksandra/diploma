import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ImageService {
  private apiUrl = 'https://localhost:7001';

  getFullImageUrl(path: string | null | undefined): string {
    if (!path || !path.trim()) {
      return 'https://placehold.net/400x400.png';
    }

    const normalizedPath = path.trim().replace(/\\/g, '/');

    if (normalizedPath.startsWith('data:image/')) {
      return normalizedPath;
    }

    if (normalizedPath.startsWith('http://') || normalizedPath.startsWith('https://')) {
      return normalizedPath;
    }

    if (normalizedPath.startsWith('/images/')) {
      return `${this.apiUrl}${normalizedPath}`;
    }

    if (normalizedPath.startsWith('images/')) {
      return `${this.apiUrl}/${normalizedPath}`;
    }

    if (!normalizedPath.startsWith('/')) {
      return `${this.apiUrl}/${normalizedPath}`;
    }

    return `${this.apiUrl}${normalizedPath}`;
  }
}