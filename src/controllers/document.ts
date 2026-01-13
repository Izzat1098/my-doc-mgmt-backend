import type { Request, Response } from 'express';
import { getItemById, getItemsByParentId, getItemsByTitle, createItem, deleteItemById, getDeletedItems, restoreDeletedItemById, getItemsByTitleParentType } from '../services/document.js';
import type { Item, CreateItem } from '../types/item.js';
import { createPresignedPost } from '../services/s3.js';

/**
 * Get documents with optional filtering
 * @route   GET /api/documents
 * @route   GET /api/documents?title=search
 * @route   GET /api/documents?parent_id=5
 * @access  Public
 */
export async function getDocuments(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { title, parentId } = req.query;
    let items: Item | Item[] | null;

    // Validate: if query params exist but aren't supported, return error
    if (Object.keys(req.query).length > 0 && !title && !parentId) {
      res.status(400).json({
        success: false,
        message: 'Invalid query parameters entered',
      });
      return;
    }

    // Search by title
    if (title) {
      items = await getItemsByTitle(title as string);
    } 
    // Get items by parent folder
    else if (parentId) {
      const parentIdNum = parseInt(parentId as string, 10);
      if (isNaN(parentIdNum) || parentIdNum <= 0) {
        res.status(400).json({
          success: false,
          message: 'Invalid parent_id',
        });
        return;
      }
      items = await getItemsByParentId(parentIdNum);
    } 
    // Default: Get root-level items (no query params)
    else {
      items = await getItemsByParentId(null);
    }

    // Check if results found
    if (!parentId && (!items || (Array.isArray(items) && items.length === 0))) {
      res.status(404).json({
        success: false,
        message: 'No items found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}



/**
 * Get a specific document by ID
 * @route   GET /api/documents/:id
 * @access  Public
 */
export async function getDocumentById(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const id = parseInt(req.params.id ?? '', 10);

    if (isNaN(id) || id <= 0) {
      res.status(400).json({
        success: false,
        message: 'Invalid item ID',
      });
      return;
    }

    const item = await getItemById(id);

    if (!item) {
      res.status(404).json({
        success: false,
        message: 'Item not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: item,
    });

  } catch (error) {
    console.error('Error fetching item by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}


/**
 * Add document or folder
 * @route   POST /api/documents
 * 
 * Flow for Request upload URL for a new file upload:
 * 1. Client sends file metadata (title, fileName, contentType, etc.)
 * 2. Backend creates a file item in the database
 * 3. Backend generates presigned URL and stores the final S3 URL in the database
 * 4. Backend returns the presigned URL to Client
 * 5. Client uploads the file directly to S3 using the presigned URL (PUT request)
 *
 * @access  Public
 */
export async function addDocument(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { title, item_type, parent_id, file_size_kb, created_by }: CreateItem = req.body;

    // Validate required fields
    if (!title || !item_type) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: title and item_type',
      });
      return;
    }

    if (item_type !== 'folder' && item_type !== 'file') {
      res.status(400).json({
        success: false,
        message: 'item_type must be either "folder" or "file"',
      });
      return;
    }

    // Validate parent_id if provided
    if (parent_id !== null && parent_id !== undefined) {
      if (typeof parent_id !== 'number' || parent_id <= 0) {
        res.status(400).json({
          success: false,
          message: 'parent_id must be a positive number or null',
        });
        return;
      }
      const parentItem = await getItemById(parent_id);
      if (!parentItem) {
        res.status(400).json({
          success: false,
          message: 'parent_id does not exists',
        });
        return;

      } else if (parentItem.item_type !== 'folder') {
        res.status(400).json({
          success: false,
          message: 'parent_id is not a folder',
        });
        return;
      }
    }

    // Validate that item is not already in parent folder
    const existingItems = await getItemsByTitleParentType(title, parent_id !== undefined ? parent_id : null, item_type);

    if (existingItems && existingItems.length > 0) {
      res.status(400).json({
        success: false,
        message: 'item with same file name already exists',
      });
      return;
    }

    let s3Url = null
    let uploadUrl = ""

    // If item is a file, generate presigned URL for S3 upload
    // Generate unique S3 key using timestamp and sanitized filename
    if (item_type === "file") {

      const timestamp = Date.now();
      const sanitizedFileName = title.replace(/[^a-zA-Z0-9._-]/g, '_');
      const s3Key = `uploads/${timestamp}-${sanitizedFileName}`;

      // Create presigned URL for upload
      const { fileLink, signedUrl } = await createPresignedPost({
        key: s3Key,
        contentType: item_type,
      });
      
      s3Url = fileLink
      uploadUrl = signedUrl
    }

    // Create the item data
    const itemData: CreateItem = {
      title,
      item_type,
      parent_id: parent_id !== undefined ? parent_id : null,
      file_size_kb: file_size_kb !== undefined ? file_size_kb : null,
      s3_url: s3Url,
      created_by: created_by !== undefined ? created_by : "admin",
    };

    // Insert into database
    const newItem = await createItem(itemData);

    res.status(201).json({
      success: true,
      message: `${item_type === 'folder' ? 'Folder' : 'File'} created successfully`,
      data: newItem,
      uploadUrl: uploadUrl
    });

  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

/**
 * Delete a document or folder by ID (soft delete)
 * @route   DELETE /api/documents/:id
 * @access  Public
 */
export async function deleteDocumentById(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const id = parseInt(req.params.id ?? '', 10);

    // Validate ID
    if (isNaN(id) || id <= 0) {
      res.status(400).json({
        success: false,
        message: 'Invalid item ID',
      });
      return;
    }

    // Soft delete the item
    const deleted = await deleteItemById(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Item not found or already deleted',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Item deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}


/**
 * Get documents with optional filtering
 * @route   GET /api/documents/bin
 * @access  Public
 */
export async function getDeletedDocuments(
  req: Request,
  res: Response
): Promise<void> {

  try {
    const items = await getDeletedItems()
    res.status(200).json({
      success: true,
      data: items,
    });

  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}


/**
 * Restore specific deleted document by ID
 * @route   PATCH /api/documents/:id/restore
 * @access  Public
 */
export async function restoreDocumentById(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const id = parseInt(req.params.id ?? '', 10);

    if (isNaN(id) || id <= 0) {
      res.status(400).json({
        success: false,
        message: 'Invalid item ID',
      });
      return;
    }

    const restored = await restoreDeletedItemById(id);

    if (!restored) {
      res.status(404).json({
        success: false,
        message: 'Item not restored',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Item restored successfully',
    });

  } catch (error) {
    console.error('Error restoring deleted item by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}
