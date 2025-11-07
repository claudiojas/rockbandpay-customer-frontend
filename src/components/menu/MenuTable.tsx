import { useEffect, useState } from 'react';
import { api } from '../../lib/axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

import type { Product, Category } from '../../types';

interface MenuTableProps {
  onProductSelect: (product: Product) => void;
}

export function MenuTable({ onProductSelect }: MenuTableProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          api.get('/products'),
          api.get('/categories'),
        ]);
        setProducts(productsResponse.data);
        setCategories(categoriesResponse.data);
      } catch (err) {
        setError('Falha ao carregar o cardápio.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <p className="text-center">Carregando cardápio...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="space-y-8">
      {categories.map((category) => (
        <div key={category.id}>
          <h2 className="text-2xl font-bold mb-4 text-amber-400">{category.name}</h2>
          <div className="border border-gray-700 rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-gray-800/50 border-gray-700">
                  <TableHead className="text-white">Produto</TableHead>
                  <TableHead className="text-right text-white">Preço</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products
                  .filter((p) => p.category.id === category.id)
                  .map((product) => {
                    const isSoldOut = product.stock <= 0;
                    return (
                      <TableRow
                        key={product.id}
                        onClick={() => !isSoldOut && onProductSelect(product)}
                        className={`border-gray-700 ${
                          isSoldOut
                            ? 'opacity-50 cursor-not-allowed'
                            : 'cursor-pointer hover:bg-gray-800/50'
                        }`}
                      >
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="text-right">
                          {isSoldOut ? (
                            <span className="text-red-500 font-semibold">Esgotado</span>
                          ) : (
                            product.price.toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            })
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}
    </div>
  );
}
