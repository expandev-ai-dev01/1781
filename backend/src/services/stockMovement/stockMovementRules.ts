/**
 * @summary
 * Stock movement business logic
 * Implements CRUD operations and calculations for stock movements
 *
 * @module services/stockMovement/stockMovementRules
 */

import { dbRequest, ExpectedReturn } from '@/utils/database';
import {
  StockMovementCreateParams,
  StockMovementListParams,
  StockBalanceParams,
  StockMovementHistoryParams,
  StockMovementCreateResult,
  StockMovementListResult,
  StockBalanceResult,
  StockMovementHistoryResult,
  StockMovementEntity,
  StockMovementHistoryEntity,
} from './stockMovementTypes';

/**
 * @function stockMovementCreate
 * @description Creates a new stock movement record
 *
 * @param {StockMovementCreateParams} params - Movement creation parameters
 * @returns {Promise<StockMovementCreateResult>} Created movement identifier
 *
 * @throws {ValidationError} When parameters fail validation
 * @throws {BusinessRuleError} When business rules are violated
 * @throws {DatabaseError} When database operation fails
 */
export async function stockMovementCreate(
  params: StockMovementCreateParams
): Promise<StockMovementCreateResult> {
  const result = await dbRequest(
    '[dbo].[spStockMovementCreate]',
    {
      idAccount: params.idAccount,
      idUser: params.idUser,
      idProduct: params.idProduct,
      movementType: params.movementType,
      quantity: params.quantity,
      reason: params.reason,
      referenceDocument: params.referenceDocument || null,
      unitValue: params.unitValue || null,
      location: params.location || null,
    },
    ExpectedReturn.Single
  );

  return result;
}

/**
 * @function stockMovementList
 * @description Lists stock movements with filtering options
 *
 * @param {StockMovementListParams} params - List parameters
 * @returns {Promise<StockMovementListResult>} List of movements and total count
 *
 * @throws {ValidationError} When parameters fail validation
 * @throws {DatabaseError} When database operation fails
 */
export async function stockMovementList(
  params: StockMovementListParams
): Promise<StockMovementListResult> {
  const results = await dbRequest(
    '[dbo].[spStockMovementList]',
    {
      idAccount: params.idAccount,
      idProduct: params.idProduct || null,
      startDate: params.startDate || null,
      endDate: params.endDate || null,
      movementType: params.movementType !== undefined ? params.movementType : null,
      idUser: params.idUser || null,
      page: params.page || 1,
      pageSize: params.pageSize || 100,
    },
    ExpectedReturn.Multi
  );

  const recordsets = results as Array<StockMovementEntity[] | Array<{ total: number }>>;
  const movements: StockMovementEntity[] = recordsets[0] as StockMovementEntity[];
  const totalRecord = recordsets[1] as Array<{ total: number }>;
  const total: number = totalRecord[0].total;

  return {
    movements,
    total,
  };
}

/**
 * @function stockBalanceGet
 * @description Calculates current stock balance for a product
 *
 * @param {StockBalanceParams} params - Balance calculation parameters
 * @returns {Promise<StockBalanceResult>} Stock balance information
 *
 * @throws {ValidationError} When parameters fail validation
 * @throws {DatabaseError} When database operation fails
 */
export async function stockBalanceGet(params: StockBalanceParams): Promise<StockBalanceResult> {
  const result = await dbRequest(
    '[dbo].[spStockBalanceGet]',
    {
      idAccount: params.idAccount,
      idProduct: params.idProduct,
      referenceDate: params.referenceDate || null,
    },
    ExpectedReturn.Single
  );

  return result;
}

/**
 * @function stockMovementHistoryGet
 * @description Retrieves movement history for a product with running balance
 *
 * @param {StockMovementHistoryParams} params - History parameters
 * @returns {Promise<StockMovementHistoryResult>} Movement history with balances
 *
 * @throws {ValidationError} When parameters fail validation
 * @throws {DatabaseError} When database operation fails
 */
export async function stockMovementHistoryGet(
  params: StockMovementHistoryParams
): Promise<StockMovementHistoryResult> {
  const results = await dbRequest(
    '[dbo].[spStockMovementHistoryGet]',
    {
      idAccount: params.idAccount,
      idProduct: params.idProduct,
      startDate: params.startDate || null,
      endDate: params.endDate || null,
      movementType: params.movementType !== undefined ? params.movementType : null,
    },
    ExpectedReturn.Multi
  );

  const recordsets = results as Array<
    | Array<{ initialBalance: number }>
    | StockMovementHistoryEntity[]
    | Array<{ finalBalance: number }>
  >;
  const initialBalanceRecord = recordsets[0] as Array<{ initialBalance: number }>;
  const initialBalance: number = initialBalanceRecord[0].initialBalance;
  const movements: StockMovementHistoryEntity[] = recordsets[1] as StockMovementHistoryEntity[];
  const finalBalanceRecord = recordsets[2] as Array<{ finalBalance: number }>;
  const finalBalance: number = finalBalanceRecord[0].finalBalance;

  return {
    initialBalance,
    movements,
    finalBalance,
  };
}
