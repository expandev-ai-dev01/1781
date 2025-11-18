import { useState } from 'react';
import { StockMovementForm, StockMovementList } from '@/domain/stockMovement/components';

export const StockMovementsPage = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Movimentações de Estoque</h1>
          <p className="mt-2 text-gray-600">
            Registre e consulte todas as movimentações do estoque
          </p>
        </div>

        <div className="mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {showForm ? 'Ocultar Formulário' : 'Nova Movimentação'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Registrar Nova Movimentação
            </h2>
            <StockMovementForm
              onSuccess={() => setShowForm(false)}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Histórico de Movimentações</h2>
          <StockMovementList />
        </div>
      </div>
    </div>
  );
};

export default StockMovementsPage;
