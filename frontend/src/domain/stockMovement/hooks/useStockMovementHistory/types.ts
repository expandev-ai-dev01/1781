import type { StockMovementHistory, StockMovementHistoryParams } from '../../types';

export interface UseStockMovementHistoryOptions extends StockMovementHistoryParams {
  enabled?: boolean;
}

export interface UseStockMovementHistoryReturn {
  history: StockMovementHistory | undefined;
  isLoading: boolean;
  error: unknown;
  refetch: () => void;
}
