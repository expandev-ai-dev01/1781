import { useStockMovementList } from '../../hooks';
import { LoadingSpinner } from '@/core/components/LoadingSpinner';
import { ErrorMessage } from '@/core/components/ErrorMessage';
import { formatDateTime } from '@/core/utils';
import { StockMovementType } from '../../types';
import type { StockMovementListProps } from './types';

const movementTypeLabels: Record<number, string> = {
  [StockMovementType.NewProduct]: 'Novo Produto',
  [StockMovementType.Entry]: 'Entrada',
  [StockMovementType.Exit]: 'Saída',
  [StockMovementType.Adjustment]: 'Ajuste',
  [StockMovementType.Deletion]: 'Exclusão',
};

export const StockMovementList = ({ filters, onMovementClick }: StockMovementListProps) => {
  const { data, isLoading, error, refetch } = useStockMovementList(filters);

  if (isLoading) {
    return <LoadingSpinner size="lg" />;
  }

  if (error) {
    return (
      <ErrorMessage
        title="Erro ao carregar movimentações"
        message="Não foi possível carregar a lista de movimentações."
        onRetry={refetch}
      />
    );
  }

  if (!data || data.movements.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Nenhuma movimentação encontrada.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data/Hora
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantidade
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Motivo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuário
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.movements.map((movement) => (
              <tr
                key={movement.idStockMovement}
                onClick={() => onMovementClick?.(movement.idStockMovement)}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDateTime(movement.movementDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {movement.productName || `Produto #${movement.idProduct}`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {movementTypeLabels[movement.movementType]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {movement.quantity > 0 ? '+' : ''}
                  {movement.quantity}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{movement.reason}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {movement.userName || `Usuário #${movement.idUser}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-sm text-gray-500 text-center">Total: {data.total} movimentações</div>
    </div>
  );
};
