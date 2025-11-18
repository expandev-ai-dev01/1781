/**
 * @api {post} /internal/stock-movement Create Stock Movement
 * @apiName CreateStockMovement
 * @apiGroup StockMovement
 * @apiVersion 1.0.0
 *
 * @apiDescription Creates a new stock movement record
 *
 * @apiParam {Number} idProduct Product identifier
 * @apiParam {Number} movementType Movement type (0-4)
 * @apiParam {Number} quantity Quantity moved
 * @apiParam {String} reason Movement reason (min 5 chars)
 * @apiParam {String} [referenceDocument] Reference document number
 * @apiParam {Number} [unitValue] Unit value
 * @apiParam {String} [location] Storage location
 *
 * @apiSuccess {Number} idStockMovement Created movement identifier
 *
 * @apiError {String} ValidationError Invalid parameters provided
 * @apiError {String} UnauthorizedError User lacks permission
 * @apiError {String} ServerError Internal server error
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  CrudController,
  errorResponse,
  StatusGeneralError,
  successResponse,
} from '@/middleware/crud';
import { stockMovementCreate } from '@/services/stockMovement';

const securable = 'STOCK_MOVEMENT';

const bodySchema = z.object({
  idProduct: z.number().int().positive(),
  movementType: z.number().int().min(0).max(4),
  quantity: z.number().refine((val) => val !== 0, { message: 'Quantity cannot be zero' }),
  reason: z.string().min(5).max(200),
  referenceDocument: z.string().max(50).nullable().optional(),
  unitValue: z.number().positive().nullable().optional(),
  location: z.string().max(100).nullable().optional(),
});

export async function postHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  const operation = new CrudController([{ securable, permission: 'CREATE' }]);

  const [validated, error] = await operation.create(req, bodySchema);

  if (!validated) {
    return next(error);
  }

  try {
    const data = await stockMovementCreate({
      ...validated.credential,
      ...validated.params,
    });

    res.json(successResponse(data));
  } catch (error: any) {
    if (error.number === 51000) {
      res.status(400).json(errorResponse(error.message));
    } else {
      next(StatusGeneralError);
    }
  }
}

/**
 * @api {get} /internal/stock-movement List Stock Movements
 * @apiName ListStockMovements
 * @apiGroup StockMovement
 * @apiVersion 1.0.0
 *
 * @apiDescription Lists stock movements with filtering options
 *
 * @apiParam {Number} [idProduct] Product filter
 * @apiParam {String} [startDate] Start date (YYYY-MM-DD)
 * @apiParam {String} [endDate] End date (YYYY-MM-DD)
 * @apiParam {Number} [movementType] Movement type filter
 * @apiParam {Number} [idUser] User filter
 * @apiParam {Number} [page=1] Page number
 * @apiParam {Number} [pageSize=100] Page size
 *
 * @apiSuccess {Array} movements List of movements
 * @apiSuccess {Number} total Total count
 *
 * @apiError {String} ValidationError Invalid parameters
 * @apiError {String} UnauthorizedError User lacks permission
 */

const querySchema = z.object({
  idProduct: z.coerce.number().int().positive().optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  movementType: z.coerce.number().int().min(0).max(4).optional(),
  idUser: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(10).max(1000).optional(),
});

export async function getHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  const operation = new CrudController([{ securable, permission: 'READ' }]);

  const [validated, error] = await operation.read(req, querySchema);

  if (!validated) {
    return next(error);
  }

  try {
    const { stockMovementList } = await import('@/services/stockMovement');
    const data = await stockMovementList({
      ...validated.credential,
      ...validated.params,
    });

    res.json(successResponse(data));
  } catch (error: any) {
    if (error.number === 51000) {
      res.status(400).json(errorResponse(error.message));
    } else {
      next(StatusGeneralError);
    }
  }
}
