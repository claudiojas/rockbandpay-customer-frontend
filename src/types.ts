export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  description?: string;
  imageUrl?: string;
  category: Category;
}

export interface CartItem extends Product {
  quantity: number;
}

// Tipos para Pedidos

export interface IOrderItem {
  id: string;
  quantity: number;
  totalPrice: number;
  product: Product;
}

export interface IOrder {
  id: string;
  status: 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  createdAt: string;
  orderItems: IOrderItem[];
}
