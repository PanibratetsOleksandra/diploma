
export interface Article {
  id?: number;
  title: string;
  category: string;
  author: string;
  readTime: string;
  imageUrl: string;
  intro: string;
  paragraphsText: string;
  bulletsText?: string;
  quote?: string;
  createdAt?: string;
}
