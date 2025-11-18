/**
 * @summary
 * Internal (authenticated) API routes configuration
 * Handles protected endpoints requiring authentication
 *
 * @module routes/v1/internalRoutes
 */

import { Router } from 'express';
import * as stockMovementController from '@/api/v1/internal/stock-movement/controller';
import * as stockBalanceController from '@/api/v1/internal/stock-balance/controller';
import * as stockMovementHistoryController from '@/api/v1/internal/stock-movement-history/controller';

const router = Router();

router.post('/stock-movement', stockMovementController.postHandler);
router.get('/stock-movement', stockMovementController.getHandler);
router.get('/stock-balance/:idProduct', stockBalanceController.getHandler);
router.get('/stock-movement-history/:idProduct', stockMovementHistoryController.getHandler);

export default router;
