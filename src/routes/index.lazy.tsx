/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react'
import { api } from '../lib/axios'
import { MenuTable } from '../components/menu/MenuTable'
import { ProductModal } from '../components/menu/ProductModal'
import { Cart } from '../components/cart/Cart';

import type { Product, CartItem } from '../types';

import { MyOrders } from '../components/orders/MyOrders';

export function Index() {
  const [sessionId, setSessionId] = useState<string | null>(
    localStorage.getItem('sessionId'),
  )
  const [tableId, setTableId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const effectRan = useRef(false);

  useEffect(() => {
    if (effectRan.current === true && process.env.NODE_ENV === 'development') {
      return;
    }

    const searchParams = new URLSearchParams(window.location.search)
    const currentTableId = searchParams.get('table')

    if (!currentTableId) {
      setError('ID da mesa não encontrado na URL. Por favor, escaneie o QR Code novamente.')
      return
    }
    setTableId(currentTableId)

    const initializeSession = async () => {
      const storedSessionId = localStorage.getItem('sessionId');

      // 1. Valida a sessão do localStorage antes de usar
      if (storedSessionId) {
        try {
          const { data: existingSession } = await api.get(`/sessions/${storedSessionId}`);
          if (existingSession.tableId === currentTableId && existingSession.status === 'ACTIVE') {
            setSessionId(existingSession.id);
            return; // Sessão válida, encerra o fluxo.
          }
        } catch (err: unknown) {
          console.warn("Falha ao validar sessão existente, uma nova será criada/buscada.", err);
        }
      }

      // 2. Se não há sessão válida, busca uma ativa ou cria uma nova.
      try {
        const { data: activeSession } = await api.get(`/sessions/table/${currentTableId}/active`);
        localStorage.setItem('sessionId', activeSession.id);
        setSessionId(activeSession.id);
      } catch (err: any) {
        if (err.response && err.response.status === 404) {
          // Nenhuma sessão ativa encontrada, cria uma nova.
          try {
            const { data: newSession } = await api.post('/sessions', { tableId: currentTableId });
            localStorage.setItem('sessionId', newSession.id);
            setSessionId(newSession.id);
          } catch (creationError) {
            console.error('Erro ao criar a nova sessão:', creationError);
            setError('Falha crítica ao tentar criar uma nova sessão.');
          }
        } else {
          console.error('Erro ao buscar ou criar sessão:', err);
          setError('Não foi possível iniciar uma sessão. Verifique a conexão e se a mesa está disponível.');
        }
      }
    }

    initializeSession();

    return () => {
      effectRan.current = true;
    };
  }, [])

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

  const handleOrderPlaced = () => {
    setCart([]); // Limpa o carrinho
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
            <p className="text-gray-400">Mesa: {tableId}</p>
        </header>
        
        <main>
            <MenuTable onProductSelect={handleProductSelect} />
        </main>

        {sessionId && <MyOrders sessionId={sessionId} />}

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

