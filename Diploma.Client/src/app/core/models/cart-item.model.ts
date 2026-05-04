export interface CartItem {
  id: string | number;      // Унікальний ID для кошика
  originalId: number;       // ID з бази даних (товару або дизайну)
  name: string;
  price: number;
 imageUrl: string;
  additionalPhotos?: string[];
  quantity: number;
  type: 'product' | 'ai-design' | 'manual-design'; 
  size?: string;
  notes?: string;

}