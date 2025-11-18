/**
 * @api {get} /internal/stock-balance/:idProduct Get Stock Balance
 * @apiName GetStockBalance
 * @apiGroup StockBalance
 * @apiVersion 1.0.0
 *
 * @apiDescription Calculates current stock balance for a product
 *
 * @apiParam {Number} idProduct Product identifier
 * @apiParam {String} [referenceDate] Reference date (YYYY-MM-DD)
 *
 * @apiSuccess {Number} idProduct Product identifier
 * @apiSuccess {Number} currentBalance Current stock balance
 * @apiSuccess {Number} averageValue Average unit value
 * @apiSuccess {String} lastMovementDate Last movement date
 * @apiSuccess {Number} isOutOfStock Out of stock indicator
 *
 * @apiError {String} ValidationError Invalid parameters
 * @apiError {String} UnauthorizedError User lacks permission
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  CrudController,
  errorResponse,
  StatusGeneralError,
  successResponse,
} from '@/middleware/crud';
import { stockBalanceGet } from '@/services/stockMovement';

const securable = 'STOCK_MOVEMENT';

const paramsSchema = z.object({
  idProduct: z.coerce.number().int().positive(),
  referenceDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export async function getHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  const operation = new CrudController([{ securable, permission: 'READ' }]);

  const [validated, error] = await operation.read(req, paramsSchema);

  if (!validated) {
    return next(error);
  }

  try {
    const data = await stockBalanceGet({
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
