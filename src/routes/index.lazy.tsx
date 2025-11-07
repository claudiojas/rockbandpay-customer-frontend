/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { api } from '../lib/axios'
import { MenuTable } from '../components/menu/MenuTable'
import { ProductModal } from '../components/menu/ProductModal'
import { Cart } from '../components/cart/Cart';

import type { Product, CartItem, IOrder } from '../types';
import { MyOrders } from '../components/orders/MyOrders';

export function Index() {
  const [sessionId, setSessionId] = useState<string | null>(
    localStorage.getItem('sessionId'),
  )
  const [tableId, setTableId] = useState<string | null>(null)
  const [tableNumber, setTableNumber] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null)

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [newlyPlacedOrder, setNewlyPlacedOrder] = useState<IOrder | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const currentTableId = searchParams.get('table');

    if (!currentTableId) {
      setError('ID da mesa não encontrado na URL.');
      return;
    }
    setTableId(currentTableId);

    const getSession = async () => {
      const storedSessionId = localStorage.getItem('sessionId');
      
      if (storedSessionId) {
        try {
          const { data: session } = await api.get(`/sessions/id/${storedSessionId}`);
          if (session.tableId === currentTableId && session.status === 'ACTIVE') {
            if (sessionId !== storedSessionId) setSessionId(storedSessionId);
            if (session.table?.tableNumber) setTableNumber(session.table.tableNumber);
            return; 
          }
        } catch (e) {
          // Se a validação falhou, o ID é inválido. Limpe tudo.
          localStorage.removeItem('sessionId');
          setSessionId(null);
        }
      }

      try {
        const { data: session } = await api.get(`/sessions/table/${currentTableId}/active`);
        localStorage.setItem('sessionId', session.id);
        setSessionId(session.id);
        if (session.table?.tableNumber) setTableNumber(session.table.tableNumber);
        return;
      } catch (e) {
        // Nenhuma sessão ativa no servidor.
      }

      try {
        const { data: session } = await api.post('/sessions', { tableId: currentTableId });
        localStorage.setItem('sessionId', session.id);
        setSessionId(session.id);
        if (session.table?.tableNumber) setTableNumber(session.table.tableNumber);
      } catch (e) {
        setError('Falha crítica ao iniciar uma sessão para esta mesa.');
      }
    };

    getSession();
  }, []);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product)
  }

  const handleCloseModal = () => {
    setSelectedProduct(null)
  }

  const handleAddToCart = (product: Product, quantity: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id)
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        )
      } else {
        return [...prevCart, { ...product, quantity }]
      }
    })
  }

  const handleOrderPlaced = (newOrder: IOrder) => {
    setCart([]); // Limpa o carrinho
    setNewlyPlacedOrder(newOrder); // Atualiza o estado com o novo pedido
  }

  if (error) {
    return (
      <div className="p-4 font-sans bg-gray-900 text-white min-h-screen flex items-center justify-center">
        <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-lg max-w-md text-center">
          <h2 className="font-bold">Erro</h2>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!sessionId) {
    return (
        <div className="p-4 font-sans bg-gray-900 text-white min-h-screen flex items-center justify-center">
            <p>Iniciando sessão...</p>
        </div>
    )
  }

  return (
    <div className="p-4 md:p-8 font-sans bg-gray-900 text-white min-h-screen">
      <div className="max-w-4xl mx-auto pb-32 md:pb-16">
        <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-amber-400">Cardápio RockBandPay</h1>
            <p className="text-gray-400">Mesa: {tableNumber ?? tableId}</p>
        </header>
        
        <main>
            <MenuTable onProductSelect={handleProductSelect} />
        </main>

        {sessionId && <MyOrders sessionId={sessionId} newlyPlacedOrder={newlyPlacedOrder} />}

        <ProductModal 
            isOpen={!!selectedProduct}
            product={selectedProduct}
            onClose={handleCloseModal}
            onAddToCart={handleAddToCart}
        />

        <Cart 
          items={cart}
          sessionId={sessionId}
          onOrderPlaced={handleOrderPlaced}
        />
      </div>
    </div>
  )
}

