import { Router } from 'express';
import { getDocuments, getDocumentById, addDocument, deleteDocumentById, getDeletedDocuments, restoreDocumentById } from '../controllers/document.js';

const router = Router();

/**
 * @route   GET /api/documents
 * @route   GET /api/documents?title=search
 * @route   GET /api/documents?parentId=5
 * @desc    Get documents with optional filtering
 * @access  Public
 */
router.get('/', getDocuments);

/**
 * @route   GET /api/documents/bin
 * @desc    Get deleted documents
 * @access  Public
 */
router.get('/bin', getDeletedDocuments);

/**
 * @route   GET /api/documents/:id
 * @desc    Get specific item by Id
 * @access  Public
 */
router.get('/:id', getDocumentById);

/**
 * @route   POST /api/documents/
 * @desc    Add item
 * @access  Public
 */
router.post("/", addDocument)

/**
 * @route   DELETE /api/documents/:id
 * @desc    Delete item by Id (soft delete)
 * @access  Public
 */
router.delete('/:id', deleteDocumentById);

/**
 * @route   PATCH /api/documents/:id/restore
 * @desc    Restore a soft-deleted document by Id
 * @access  Public
 */
router.patch('/:id/restore', restoreDocumentById);

export default router;
