import { useStockBalance } from '../../hooks';
import { LoadingSpinner } from '@/core/components/LoadingSpinner';
import { ErrorMessage } from '@/core/components/ErrorMessage';
import { formatDateTime } from '@/core/utils';
import type { StockBalanceCardProps } from './types';

export const StockBalanceCard = ({ idProduct, referenceDate }: StockBalanceCardProps) => {
  const { balance, isLoading, error, refetch } = useStockBalance({ idProduct, referenceDate });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <ErrorMessage
          title="Erro ao carregar saldo"
          message="Não foi possível carregar o saldo do estoque."
          onRetry={refetch}
        />
      </div>
    );
  }

  if (!balance) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Saldo em Estoque</h3>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">Saldo Atual</p>
          <p className="text-3xl font-bold text-gray-900">{balance.currentBalance}</p>
        </div>
        {balance.averageValue !== null && (
          <div>
            <p className="text-sm text-gray-500">Valor Médio</p>
            <p className="text-xl font-semibold text-gray-900">
              R$ {balance.averageValue.toFixed(2)}
            </p>
          </div>
        )}
        {balance.lastMovementDate && (
          <div>
            <p className="text-sm text-gray-500">Última Movimentação</p>
            <p className="text-sm text-gray-900">{formatDateTime(balance.lastMovementDate)}</p>
          </div>
        )}
        {balance.isOutOfStock && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800 font-medium">⚠️ Produto em falta</p>
          </div>
        )}
      </div>
    </div>
  );
};
