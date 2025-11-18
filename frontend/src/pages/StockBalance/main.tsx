import { useState } from 'react';
import { StockBalanceCard, StockMovementHistory } from '@/domain/stockMovement/components';

export const StockBalancePage = () => {
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [productId, setProductId] = useState('');

  const handleSearch = () => {
    const id = parseInt(productId);
    if (!isNaN(id) && id > 0) {
      setSelectedProduct(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Saldo de Estoque</h1>
          <p className="mt-2 text-gray-600">
            Consulte o saldo atual e histórico de movimentações por produto
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Buscar Produto</h2>
          <div className="flex gap-4">
            <input
              type="number"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              placeholder="ID do Produto"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Buscar
            </button>
          </div>
        </div>

        {selectedProduct && (
          <>
            <div className="mb-8">
              <StockBalanceCard idProduct={selectedProduct} />
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Histórico de Movimentações
              </h2>
              <StockMovementHistory idProduct={selectedProduct} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StockBalancePage;
