import type { StockBalance } from '../../types';

export interface UseStockBalanceOptions {
  idProduct: number;
  referenceDate?: string;
  enabled?: boolean;
}

export interface UseStockBalanceReturn {
  balance: StockBalance | undefined;
  isLoading: boolean;
  error: unknown;
  refetch: () => void;
}
