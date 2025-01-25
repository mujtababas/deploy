export interface Product {
  _id: string; // _id
  name: string; // name
  price: number; 
  description?: string;
  category?: string;
  image: any;
  slug?: {
    current: string;
  };
  quantity?: number;
}