export interface CartItem {
  id: string | number;      
  originalId: number;       
  name: string;
  price: number;
 imageUrl: string;
  additionalPhotos?: string[];
  quantity: number;
  type: 'product' | 'ai-design' | 'manual-design'; 
  size?: string;
  notes?: string;
prompt?: string;
}