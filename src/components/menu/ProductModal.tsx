import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button'; // Assumindo que o botão será adicionado via shadcn
import { useState } from 'react';

import type { Product } from '../../types';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export function ProductModal({ product, isOpen, onClose, onAddToCart }: ProductModalProps) {
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return null;
  }

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    onClose(); // Fecha o modal após adicionar
    setQuantity(1); // Reseta a quantidade
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-amber-400 text-2xl">{product.name}</DialogTitle>
          {product.description && (
            <DialogDescription className="text-gray-400">
              {product.description}
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="my-4">
          <img 
            src={product.imageUrl || 'https://via.placeholder.com/400x300'} // Imagem de placeholder
            alt={product.name} 
            className="w-full h-48 object-cover rounded-md"
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xl font-bold">
            {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</Button>
            <span className="w-10 text-center font-bold">{quantity}</span>
            <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>+</Button>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleAddToCart} className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold">
            Adicionar ao Pedido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
