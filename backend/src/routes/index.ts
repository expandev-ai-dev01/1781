/**
 * @summary
 * Main API router with version management
 * Routes requests to appropriate API version handlers
 *
 * @module routes
 */

import { Router } from 'express';
import v1Routes from './v1';

const router = Router();

router.use('/v1', v1Routes);

export default router;
