/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { api } from '../lib/axios'
import { MenuTable } from '../components/menu/MenuTable'
import { ProductModal } from '../components/menu/ProductModal'
import { Cart } from '../components/cart/Cart';

import type { Product, CartItem } from '../types';

export function Index() {
  const [sessionId, setSessionId] = useState<string | null>(
    localStorage.getItem('sessionId'),
  )
  const [tableId, setTableId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])

  useEffect(() => {
    let ignore = true;

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
            if (!ignore) setSessionId(existingSession.id);
            return; // Sessão válida, encerra o fluxo.
          }
        } catch (err: unknown) {
          console.error(err);
        }
      }

      // 2. Se não há sessão válida, busca uma ativa ou cria uma nova.
      try {
        const { data: activeSession } = await api.get(`/sessions/table/${currentTableId}/active`);
        if (!ignore) {
          console.log("estrou no ignore porque esta falso")
          localStorage.setItem('sessionId', activeSession.id);
          setSessionId(activeSession.id);
        }
      } catch (err: any) {
        if (err.response && err.response.status === 404) {
          // Nenhuma sessão ativa encontrada, cria uma nova.
          try {
            const { data: newSession } = await api.post('/sessions', { tableId: currentTableId });
            if (!ignore) {
              localStorage.setItem('sessionId', newSession.id);
              setSessionId(newSession.id);
            }
          } catch (creationError) {
            if (!ignore) {
              console.error('Erro ao criar a nova sessão:', creationError);
              setError('Falha crítica ao tentar criar uma nova sessão.');
            }
          }
        } else if (!ignore) {
          console.error('Erro ao buscar ou criar sessão:', err);
          setError('Não foi possível iniciar uma sessão. Verifique a conexão e se a mesa está disponível.');
        }
      }
    }

    initializeSession();

    // 3. Função de limpeza para ignorar o resultado da primeira execução em StrictMode
    return () => {
      ignore = false;
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
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-amber-400">Cardápio RockBandPay</h1>
            <p className="text-gray-400">Mesa: {tableId}</p>
        </header>
        
        <main>
            <MenuTable onProductSelect={handleProductSelect} />
        </main>

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








// Certo, obrigado por refazer o teste e me mandar os logs detalhados do backend e do frontend.

//   Sua análise está correta. Vamos juntar as peças:

//    1. Log do Backend: Mostra o erro P2002 - Unique constraint failed. Isso nos diz com 100% de
//       certeza:
//        * A restrição que colocamos no banco de dados está funcionando perfeitamente.
//        * Uma segunda requisição POST /sessions para a mesma mesa está, de fato, chegando ao
//          backend.

//    2. Log do Frontend: Mostra o AxiosError: Request failed with status code 400. Isso é o frontend
//       recebendo a resposta de erro que o backend envia quando a segunda requisição falha no banco.
//       A mensagem de "falha crítica" aparece na tela porque é o que o código faz dentro do bloco
//       catch.

//   Isso nos traz de volta à estaca zero: Por que a segunda requisição ainda está sendo feita, mesmo 
//   depois da nossa correção no `useEffect`?

//   A correção com a função de limpeza e a flag ignore foi projetada especificamente para impedir
//   essa segunda chamada. O fato de o erro ainda estar acontecendo me leva a uma forte suspeita:

//   É muito provável que, ao refazer o processo de teste, o arquivo index.lazy.tsx tenha sido
//   revertido para a versão anterior, sem a correção da função de limpeza. O comportamento que
//   você está vendo é exatamente o que aconteceria se a correção não estivesse lá.

//   Para que possamos ter certeza absoluta e resolver isso de vez, você me permite ler o conteúdo
//   do arquivo customer-frontend/src/routes/index.lazy.tsx mais uma vez?

//   Isso vai nos confirmar se a correção está no lugar ou se precisamos reaplicá-la.
