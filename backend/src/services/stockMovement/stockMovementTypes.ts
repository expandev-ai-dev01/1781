/**
 * @summary
 * Stock movement type definitions
 * Defines interfaces for stock movement operations
 *
 * @module services/stockMovement/stockMovementTypes
 */

/**
 * @interface StockMovementCreateParams
 * @description Parameters for creating a stock movement
 *
 * @property {number} idAccount - Account identifier
 * @property {number} idUser - User identifier
 * @property {number} idProduct - Product identifier
 * @property {number} movementType - Movement type (0-4)
 * @property {number} quantity - Quantity moved
 * @property {string} reason - Movement reason
 * @property {string} [referenceDocument] - Reference document number
 * @property {number} [unitValue] - Unit value
 * @property {string} [location] - Storage location
 */
export interface StockMovementCreateParams {
  idAccount: number;
  idUser: number;
  idProduct: number;
  movementType: number;
  quantity: number;
  reason: string;
  referenceDocument?: string | null;
  unitValue?: number | null;
  location?: string | null;
}

/**
 * @interface StockMovementCreateResult
 * @description Result of stock movement creation
 *
 * @property {number} idStockMovement - Created movement identifier
 */
export interface StockMovementCreateResult {
  idStockMovement: number;
}

/**
 * @interface StockMovementListParams
 * @description Parameters for listing stock movements
 *
 * @property {number} idAccount - Account identifier
 * @property {number} [idProduct] - Product filter
 * @property {string} [startDate] - Start date filter
 * @property {string} [endDate] - End date filter
 * @property {number} [movementType] - Movement type filter
 * @property {number} [idUser] - User filter
 * @property {number} [page] - Page number
 * @property {number} [pageSize] - Page size
 */
export interface StockMovementListParams {
  idAccount: number;
  idProduct?: number;
  startDate?: string;
  endDate?: string;
  movementType?: number;
  idUser?: number;
  page?: number;
  pageSize?: number;
}

/**
 * @interface StockMovementEntity
 * @description Stock movement entity
 *
 * @property {number} idStockMovement - Movement identifier
 * @property {number} idProduct - Product identifier
 * @property {number} idUser - User identifier
 * @property {number} movementType - Movement type
 * @property {number} quantity - Quantity moved
 * @property {string} reason - Movement reason
 * @property {string | null} referenceDocument - Reference document
 * @property {number | null} unitValue - Unit value
 * @property {string | null} location - Storage location
 * @property {Date} movementDate - Movement date
 */
export interface StockMovementEntity {
  idStockMovement: number;
  idProduct: number;
  idUser: number;
  movementType: number;
  quantity: number;
  reason: string;
  referenceDocument: string | null;
  unitValue: number | null;
  location: string | null;
  movementDate: Date;
}

/**
 * @interface StockMovementListResult
 * @description Result of stock movement list operation
 *
 * @property {StockMovementEntity[]} movements - List of movements
 * @property {number} total - Total count
 */
export interface StockMovementListResult {
  movements: StockMovementEntity[];
  total: number;
}

/**
 * @interface StockBalanceParams
 * @description Parameters for stock balance calculation
 *
 * @property {number} idAccount - Account identifier
 * @property {number} idProduct - Product identifier
 * @property {string} [referenceDate] - Reference date
 */
export interface StockBalanceParams {
  idAccount: number;
  idProduct: number;
  referenceDate?: string;
}

/**
 * @interface StockBalanceResult
 * @description Result of stock balance calculation
 *
 * @property {number} idProduct - Product identifier
 * @property {number} currentBalance - Current stock balance
 * @property {number | null} averageValue - Average unit value
 * @property {Date | null} lastMovementDate - Last movement date
 * @property {number} isOutOfStock - Out of stock indicator
 */
export interface StockBalanceResult {
  idProduct: number;
  currentBalance: number;
  averageValue: number | null;
  lastMovementDate: Date | null;
  isOutOfStock: number;
}

/**
 * @interface StockMovementHistoryParams
 * @description Parameters for movement history retrieval
 *
 * @property {number} idAccount - Account identifier
 * @property {number} idProduct - Product identifier
 * @property {string} [startDate] - Start date
 * @property {string} [endDate] - End date
 * @property {number} [movementType] - Movement type filter
 */
export interface StockMovementHistoryParams {
  idAccount: number;
  idProduct: number;
  startDate?: string;
  endDate?: string;
  movementType?: number;
}

/**
 * @interface StockMovementHistoryEntity
 * @description Movement history entity with running balance
 *
 * @property {number} idStockMovement - Movement identifier
 * @property {number} movementType - Movement type
 * @property {number} quantity - Quantity moved
 * @property {string} reason - Movement reason
 * @property {string | null} referenceDocument - Reference document
 * @property {number | null} unitValue - Unit value
 * @property {string | null} location - Storage location
 * @property {Date} movementDate - Movement date
 * @property {number} runningBalance - Running balance after movement
 */
export interface StockMovementHistoryEntity {
  idStockMovement: number;
  movementType: number;
  quantity: number;
  reason: string;
  referenceDocument: string | null;
  unitValue: number | null;
  location: string | null;
  movementDate: Date;
  runningBalance: number;
}

/**
 * @interface StockMovementHistoryResult
 * @description Result of movement history retrieval
 *
 * @property {number} initialBalance - Balance at start of period
 * @property {StockMovementHistoryEntity[]} movements - Movement history
 * @property {number} finalBalance - Balance at end of period
 */
export interface StockMovementHistoryResult {
  initialBalance: number;
  movements: StockMovementHistoryEntity[];
  finalBalance: number;
}

/**
 * @enum MovementType
 * @description Stock movement types
 */
export enum MovementType {
  NewProduct = 0,
  Entry = 1,
  Exit = 2,
  Adjustment = 3,
  Deletion = 4,
}
