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

  const isSoldOut = product.stock <= 0;

  const handleAddToCart = () => {
    if (isSoldOut) return;
    onAddToCart(product, quantity);
    onClose(); // Fecha o modal após adicionar
    setQuantity(1); // Reseta a quantidade
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-amber-400 text-2xl">{product.name}</DialogTitle>
          <DialogDescription className="text-gray-400">
            {product.description || <>&nbsp;</>}
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4">
          <img 
            src={product.imageUrl || 'https://via.placeholder.com/400x300'} // Imagem de placeholder
            alt={product.name} 
            className="w-full h-48 object-cover rounded-md"
          />
        </div>

        <div className="flex items-center justify-between">
          {isSoldOut ? (
            <p className="text-xl font-bold text-red-500">Produto Esgotado</p>
          ) : (
            <p className="text-xl font-bold">
              {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          )}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={isSoldOut}>-</Button>
            <span className="w-10 text-center font-bold">{isSoldOut ? 0 : quantity}</span>
            <Button variant="outline" size="icon" onClick={() => setQuantity(prev => Math.min(prev + 1, product.stock))} disabled={isSoldOut || quantity >= product.stock}>+</Button>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleAddToCart} className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold" disabled={isSoldOut}>
            {isSoldOut ? 'Esgotado' : 'Adicionar ao Pedido'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
