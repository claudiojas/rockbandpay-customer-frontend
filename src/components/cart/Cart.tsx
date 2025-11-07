import { Button } from '../ui/button';
import { api } from '../../lib/axios';
import type { CartItem, IOrder } from '../../types';

interface CartProps {
  items: CartItem[];
  sessionId: string;
  onOrderPlaced: (newOrder: IOrder) => void; // Modificado para aceitar o novo pedido
}

export function Cart({ items, sessionId, onOrderPlaced }: CartProps) {
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handlePlaceOrder = async () => {
    try {
      const orderItems = items.map(item => ({ productId: item.id, quantity: item.quantity }));
      const response = await api.post('/orders', {
        sessionId,
        items: orderItems,
      });
      alert('Pedido enviado para a cozinha!');
      onOrderPlaced(response.data);
    } catch (error) {
      console.error('Erro ao fazer pedido:', error);
      alert('Não foi possível fazer o pedido. Tente novamente.');
    }
  };

  if (items.length === 0) {
    return null; // Não mostra nada se o carrinho estiver vazio
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-sm p-4 border-t border-gray-700 shadow-lg md:left-auto md:bottom-4 md:right-4 md:rounded-lg md:w-80 md:border">
      <h3 className="font-bold text-lg mb-2 text-amber-400">Meu Pedido</h3>
      <div className="max-h-40 overflow-y-auto pr-2">
        <ul className="space-y-2">
          {items.map(item => (
            <li key={item.id} className="flex justify-between items-center text-sm">
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-xs text-gray-400">x {item.quantity}</p>
              </div>
              <span className="font-medium">R$ {(item.price * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex justify-between items-center font-bold mt-4 pt-2 border-t border-gray-700">
        <p>Total:</p>
        <p>R$ {total.toFixed(2)}</p>
      </div>
      <Button 
        onClick={handlePlaceOrder} 
        className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-black font-bold"
      >
        Fazer Pedido
      </Button>
    </div>
  );
}
