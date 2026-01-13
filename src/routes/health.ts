import { getHealth } from '../controllers/health.js';
import { Router } from 'express';

const router = Router();

/**
 * @route   GET /api/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/', getHealth);

export default router;
