import { useQuery } from '@tanstack/react-query';
import { stockMovementService } from '../../services';
import type { UseStockMovementHistoryOptions, UseStockMovementHistoryReturn } from './types';

export const useStockMovementHistory = (
  options: UseStockMovementHistoryOptions
): UseStockMovementHistoryReturn => {
  const { enabled = true, ...params } = options;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['stock-history', params],
    queryFn: () => stockMovementService.getHistory(params),
    enabled: enabled && !!params.idProduct,
    staleTime: 2 * 60 * 1000,
  });

  return {
    history: data,
    isLoading,
    error,
    refetch,
  };
};
