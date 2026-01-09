import { Router } from 'express';
import { getDocuments } from '../controllers/document.controller.js';

const router = Router();

/**
 * @route   GET /api/document
 * @desc    Get document
 * @access  Public
 */
router.get('/', getDocuments);

export default router;
