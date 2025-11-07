import { useEffect, useState, useCallback } from 'react';
import { api } from '../../lib/axios';
import type { IOrder } from '../../types';
import { Button } from '../ui/button';
import {
  CheckCircle, XCircle, Loader, ChefHat, Bell, Ban
}
from 'lucide-react';
import { useWebSocket } from '../../hooks/useWebSocket';

interface MyOrdersProps {
  sessionId: string;
  newlyPlacedOrder: IOrder | null;
}

const statusConfig = {
  PENDING: { text: 'Pendente', icon: Loader, color: 'text-yellow-400' },
  PREPARING: { text: 'Em Preparo', icon: ChefHat, color: 'text-blue-400' },
  READY: { text: 'Pronto', icon: Bell, color: 'text-green-400' },
  DELIVERED: { text: 'Entregue', icon: CheckCircle, color: 'text-green-500' },
  CANCELLED: { text: 'Cancelado', icon: XCircle, color: 'text-red-500' },
};

export function MyOrders({ sessionId, newlyPlacedOrder }: MyOrdersProps) {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Função para buscar os pedidos
  const fetchOrders = useCallback(() => {
    if (!sessionId) return;
    api.get(`/orders/session/${sessionId}`)
      .then(response => {
        setOrders(response.data.orders.sort((a: IOrder, b: IOrder) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      })
      .catch(error => {
        // Não mostrar erro se for 404 (nenhum pedido ainda)
        if (error.response && error.response.status !== 404) {
          console.error("Failed to fetch orders", error);
        }
      })
      .finally(() => setLoading(false));
  }, [sessionId]);

  // Callback para lidar com as mensagens do WebSocket
  const handleSocketMessage = useCallback((message: any) => {
    // Para um novo pedido, usamos o payload para uma atualização instantânea
    if (message.type === 'NEW_ORDER') {
      const orderPayload = message.payload;
      setOrders(prevOrders => {
        const otherOrders = prevOrders.filter(o => o.id !== orderPayload.id);
        return [orderPayload, ...otherOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      });
    } 
    // Para atualizações de status, usamos a mensagem como um gatilho para re-buscar os dados
    else if (message.type === 'ORDER_STATUS_UPDATED') {
      fetchOrders();
    }
  }, [fetchOrders]);

  const socketUrl = sessionId ? `ws://${window.location.host}/ws/session/${sessionId}` : null;

  // Conecta ao WebSocket
  useWebSocket(socketUrl, handleSocketMessage);

  // Efeito para adicionar um pedido recém-criado (vindo do componente Cart)
  useEffect(() => {
    if (newlyPlacedOrder) {
      setOrders(prevOrders => 
        [newlyPlacedOrder, ...prevOrders.filter(o => o.id !== newlyPlacedOrder.id)]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      );
    }
  }, [newlyPlacedOrder]);

  // Busca inicial dos pedidos
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCancelOrder = async (orderId: string) => {
    if (window.confirm('Tem certeza que deseja cancelar este pedido?')) {
      try {
        await api.patch(`/orders/${orderId}/status`, { status: 'CANCELLED' });
        // A atualização virá pelo WebSocket, que vai chamar o fetchOrders
      } catch (error: any) { 
        const errorMessage = error.response?.data?.error || 'Não foi possível cancelar o pedido.';
        alert(`Erro: ${errorMessage}`);
        console.error("Failed to cancel order", error);
      }
    }
  };

  if (loading && orders.length === 0) {
    return <p className="text-center text-gray-400 mt-8">Carregando seus pedidos...</p>;
  }

  if (orders.length === 0) {
    return <p className="text-center text-gray-400 mt-8">Você ainda não fez nenhum pedido.</p>;
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-4 text-amber-400">Meus Pedidos</h2>
      <div className="space-y-6">
        {orders.map(order => {
          const config = statusConfig[order.status] || { text: 'Desconhecido', icon: Ban, color: 'text-gray-500' };
          const Icon = config.icon;
          const isPulsing = order.status === 'PENDING' || order.status === 'PREPARING';

          return (
            <div key={order.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-bold text-gray-300">Pedido feito em {new Date(order.createdAt).toLocaleTimeString('pt-BR')}</p>
                  <div className={`flex items-center gap-2 font-semibold ${config.color}`}>
                    <Icon className={`w-5 h-5 ${isPulsing ? 'animate-pulse' : ''}`} />
                    <span>{config.text}</span>
                  </div>
                </div>
                {order.status === 'PENDING' && (
                  <Button variant="destructive" size="sm" onClick={() => handleCancelOrder(order.id)}>
                    Cancelar
                  </Button>
                )}
              </div>
              <ul className="space-y-2 border-t border-gray-600 pt-3">
                {order.orderItems.map(item => (
                  <li key={item.id} className="flex justify-between items-center text-sm text-gray-300">
                    <p>{item.quantity}x {item.product.name}</p>
                    <p className="font-mono">R$ {Number(item.totalPrice).toFixed(2)}</p>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
