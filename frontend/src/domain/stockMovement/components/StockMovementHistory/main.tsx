import { useStockMovementHistory } from '../../hooks';
import { LoadingSpinner } from '@/core/components/LoadingSpinner';
import { ErrorMessage } from '@/core/components/ErrorMessage';
import { formatDateTime } from '@/core/utils';
import { StockMovementType } from '../../types';
import type { StockMovementHistoryProps } from './types';

const movementTypeLabels: Record<number, string> = {
  [StockMovementType.NewProduct]: 'Novo Produto',
  [StockMovementType.Entry]: 'Entrada',
  [StockMovementType.Exit]: 'Saída',
  [StockMovementType.Adjustment]: 'Ajuste',
  [StockMovementType.Deletion]: 'Exclusão',
};

export const StockMovementHistory = (props: StockMovementHistoryProps) => {
  const { history, isLoading, error, refetch } = useStockMovementHistory(props);

  if (isLoading) {
    return <LoadingSpinner size="lg" />;
  }

  if (error) {
    return (
      <ErrorMessage
        title="Erro ao carregar histórico"
        message="Não foi possível carregar o histórico de movimentações."
        onRetry={refetch}
      />
    );
  }

  if (!history) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Saldo Inicial</p>
            <p className="text-2xl font-bold text-gray-900">{history.initialBalance}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Movimentações</p>
            <p className="text-2xl font-bold text-gray-900">{history.movements.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Saldo Final</p>
            <p className="text-2xl font-bold text-gray-900">{history.finalBalance}</p>
          </div>
        </div>
      </div>

      {history.movements.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data/Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Saldo
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
              {history.movements.map((movement) => (
                <tr key={movement.idStockMovement} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDateTime(movement.movementDate)}
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {movement.runningBalance}
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
      )}
    </div>
  );
};
