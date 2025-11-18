/**
 * @api {get} /internal/stock-movement-history/:idProduct Get Movement History
 * @apiName GetMovementHistory
 * @apiGroup StockMovement
 * @apiVersion 1.0.0
 *
 * @apiDescription Retrieves movement history for a product with running balance
 *
 * @apiParam {Number} idProduct Product identifier
 * @apiParam {String} [startDate] Start date (YYYY-MM-DD)
 * @apiParam {String} [endDate] End date (YYYY-MM-DD)
 * @apiParam {Number} [movementType] Movement type filter
 *
 * @apiSuccess {Number} initialBalance Balance at start of period
 * @apiSuccess {Array} movements Movement history
 * @apiSuccess {Number} finalBalance Balance at end of period
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
import { stockMovementHistoryGet } from '@/services/stockMovement';

const securable = 'STOCK_MOVEMENT';

const paramsSchema = z.object({
  idProduct: z.coerce.number().int().positive(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  movementType: z.coerce.number().int().min(0).max(4).optional(),
});

export async function getHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  const operation = new CrudController([{ securable, permission: 'READ' }]);

  const [validated, error] = await operation.read(req, paramsSchema);

  if (!validated) {
    return next(error);
  }

  try {
    const data = await stockMovementHistoryGet({
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
