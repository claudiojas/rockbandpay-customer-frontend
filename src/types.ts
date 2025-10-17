export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  category: Category;
}

export interface CartItem extends Product {
  quantity: number;
}
