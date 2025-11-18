export { StockMovementType } from './types/stockMovement';
export type {
  StockMovement,
  CreateStockMovementDto,
  StockBalance,
  StockMovementListParams,
  StockMovementListResponse,
  StockMovementHistoryParams,
  StockMovementHistory,
} from './types/stockMovement';

export * from './services';
export * from './hooks';
export * from './components';

export const moduleMetadata = {
  name: 'stockMovement',
  domain: 'functional',
  version: '1.0.0',
  publicComponents: [
    'StockMovementForm',
    'StockMovementList',
    'StockBalanceCard',
    'StockMovementHistory',
  ],
  publicHooks: [
    'useStockMovementCreate',
    'useStockMovementList',
    'useStockBalance',
    'useStockMovementHistory',
  ],
  publicServices: ['stockMovementService'],
  dependencies: {
    internal: ['@/core/components', '@/core/lib', '@/core/utils'],
    external: ['react', 'react-hook-form', 'zod', '@tanstack/react-query', 'axios'],
    domains: [],
  },
  exports: {
    components: [
      'StockMovementForm',
      'StockMovementList',
      'StockBalanceCard',
      'StockMovementHistory',
    ],
    hooks: [
      'useStockMovementCreate',
      'useStockMovementList',
      'useStockBalance',
      'useStockMovementHistory',
    ],
    services: ['stockMovementService'],
    types: [
      'StockMovement',
      'CreateStockMovementDto',
      'StockBalance',
      'StockMovementListParams',
      'StockMovementListResponse',
      'StockMovementHistoryParams',
    ],
  },
} as const;
