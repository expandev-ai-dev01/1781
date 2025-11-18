import { authenticatedClient } from '@/core/lib/api';
import type {
  StockMovement,
  CreateStockMovementDto,
  StockMovementListParams,
  StockMovementListResponse,
  StockBalance,
  StockMovementHistory,
  StockMovementHistoryParams,
} from '../types';

export const stockMovementService = {
  async create(data: CreateStockMovementDto): Promise<{ idStockMovement: number }> {
    const response = await authenticatedClient.post('/stock-movement', data);
    return response.data.data;
  },

  async list(params: StockMovementListParams): Promise<StockMovementListResponse> {
    const response = await authenticatedClient.get('/stock-movement', { params });
    return response.data.data;
  },

  async getBalance(idProduct: number, referenceDate?: string): Promise<StockBalance> {
    const params = referenceDate ? { referenceDate } : undefined;
    const response = await authenticatedClient.get(`/stock-balance/${idProduct}`, { params });
    return response.data.data;
  },

  async getHistory(params: StockMovementHistoryParams): Promise<StockMovementHistory> {
    const { idProduct, ...queryParams } = params;
    const response = await authenticatedClient.get(`/stock-movement-history/${idProduct}`, {
      params: queryParams,
    });
    return response.data.data;
  },
};
