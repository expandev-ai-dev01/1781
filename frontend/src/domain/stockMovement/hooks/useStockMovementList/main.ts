import { useQuery } from '@tanstack/react-query';
import { stockMovementService } from '../../services';
import type { UseStockMovementListOptions, UseStockMovementListReturn } from './types';

export const useStockMovementList = (
  options: UseStockMovementListOptions = {}
): UseStockMovementListReturn => {
  const { enabled = true, ...params } = options;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['stock-movements', params],
    queryFn: () => stockMovementService.list(params),
    enabled,
    staleTime: 2 * 60 * 1000,
  });

  return {
    data,
    isLoading,
    error,
    refetch,
  };
};
