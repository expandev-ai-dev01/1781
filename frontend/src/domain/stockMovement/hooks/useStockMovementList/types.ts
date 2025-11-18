import type { StockMovementListParams, StockMovementListResponse } from '../../types';

export interface UseStockMovementListOptions extends StockMovementListParams {
  enabled?: boolean;
}

export interface UseStockMovementListReturn {
  data: StockMovementListResponse | undefined;
  isLoading: boolean;
  error: unknown;
  refetch: () => void;
}
