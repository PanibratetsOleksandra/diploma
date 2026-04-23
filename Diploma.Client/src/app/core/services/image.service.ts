import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ImageService {
  private apiUrl = 'http://localhost:5000';

  getFullImageUrl(path: string | null | undefined): string {
    if (!path || !path.trim()) {
      return 'assets/images/placeholder.jpg';
    }

    const normalizedPath = path.trim().replace(/\\/g, '/');

    // base64 preview
    if (normalizedPath.startsWith('data:image/')) {
      return normalizedPath;
    }

    // already full url
    if (normalizedPath.startsWith('http://') || normalizedPath.startsWith('https://')) {
      return normalizedPath;
    }

    // if backend returns /images/...
    if (normalizedPath.startsWith('/images/')) {
      return `${this.apiUrl}${normalizedPath}`;
    }

    // if backend returns images/...
    if (normalizedPath.startsWith('images/')) {
      return `${this.apiUrl}/${normalizedPath}`;
    }

    // if backend returns only filename
    if (!normalizedPath.startsWith('/')) {
      return `${this.apiUrl}/${normalizedPath}`;
    }

    return `${this.apiUrl}${normalizedPath}`;
  }
}