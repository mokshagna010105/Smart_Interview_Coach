import { Router } from 'express';
import healthRoutes from './healthRoutes.js';

const router = Router();

// Mount Health Check Route
router.use('/health', healthRoutes);

export default router;
