import mysql from 'mysql2/promise';
import { pool } from '../db/connection.js';
import type { Item, CreateItem } from '../types/item.js';

/**
 * Get an item by ID from the database
 * @param id - The item ID
 * @returns The item or null if not found
 */
export async function getItemById (id: number): Promise<Item | null> {
  const [rows] = await pool.execute<mysql.RowDataPacket[]>(
    'SELECT * FROM items WHERE id = ? AND deleted_at IS NULL',
    [id]
  );

  if (rows.length === 0) {
    return null;
  }

  return rows[0] as Item;
};

/**
 * Get all items at root level or within a specific folder
 * @param parentId - The parent folder ID (null for root level)
 * @returns Array of items
 */
export async function getItemsByParentId (
  parentId: number | null
): Promise<Item[]> {

  const whereClause = parentId === null 
    ? 'parent_id IS NULL' 
    : 'parent_id = ?';
  const query = `SELECT * FROM items WHERE ${whereClause} AND deleted_at IS NULL ORDER BY item_type ASC, title ASC`;

  const param = parentId === null ? [] : [parentId];
  const [rows] = await pool.execute<mysql.RowDataPacket[]>(query, param);
  return rows as Item[];
};

/**
 * Get all items with the title
 * @param title
 * @returns Array of items
 */
export async function getItemsByTitle (
  title: String
): Promise<Item[]> {
  const query = `SELECT * FROM items WHERE title LIKE ? AND deleted_at IS NULL ORDER BY item_type ASC, title ASC`;
  const param = [`%${title}%`];

  const [rows] = await pool.execute<mysql.RowDataPacket[]>(query, param);
  return rows as Item[];
};

/**
 * Get all items with the type
 * @param itemType
 * @returns Array of items
 */
export async function getItemsByType (
  itemType: 'folder' | 'file'
): Promise<Item[]> {
  const query = `SELECT * FROM items WHERE item_type = ? AND deleted_at IS NULL ORDER BY item_type ASC, title ASC`;
  const param = [itemType];

  const [rows] = await pool.execute<mysql.RowDataPacket[]>(query, param);
  return rows as Item[];
};

/**
 * Get all items with the title and parent id
 * @param title 
 * @param parentId
 * @param itemType
 * @returns Array of items
 */
export async function getItemsByTitleParentType (
  title: String,
  parentId: number | null,
  itemType: 'folder' | 'file'
): Promise<Item[]> {
  const parentClause = parentId === null 
    ? 'parent_id IS NULL' 
    : 'parent_id = ?';
  
  const param = parentId === null 
    ? [`%${title}%`]
    : [`%${title}%`, parentId];

  const query = `SELECT * FROM items WHERE title LIKE ? AND ${parentClause} AND item_type = ? AND deleted_at IS NULL ORDER BY item_type ASC, title ASC`;

  const [rows] = await pool.execute<mysql.RowDataPacket[]>(query, [...param, itemType]);
  return rows as Item[];
};


/**
 * Create a new item (folder or file)
 * @param data - The item data to create
 * @returns The newly created item
 */
export async function createItem(data: CreateItem): Promise<Item> {
  const { title, item_type, parent_id, file_size_kb, s3_url, created_by } = data;

  // Insert the item
  const [result] = await pool.execute<mysql.ResultSetHeader>(
    `INSERT INTO items (title, item_type, parent_id, file_size_kb, s3_url, created_by) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [title, item_type, parent_id, file_size_kb, s3_url, created_by]
  );

  const insertId = result.insertId;

  // Try to fetch the created item with exact DB values
  try {
    const createdItem = await getItemById(insertId);
    if (createdItem) {
      return createdItem;
    }
  } catch (error) {
    console.error('Failed to fetch created item, returning constructed object:', error);
  }

  // Fallback: return constructed object if fetch fails
  // Item was created successfully, so we don't want to fail the operation
  return {
    id: insertId,
    title,
    item_type,
    parent_id,
    file_size_kb: file_size_kb || null,
    s3_url: s3_url || null,
    created_by: created_by || null,
    deleted_at: null,
    created_at: new Date(),
    updated_at: new Date(),
  };
}

/**
 * Soft delete an item by ID
 * @param id - The item ID to delete
 * @returns True if deleted, false if item not found
 */
export async function deleteItemById(id: number): Promise<boolean> {
  const [result] = await pool.execute<mysql.ResultSetHeader>(
    'UPDATE items SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL',
    [id]
  );

  return result.affectedRows > 0;
}

/**
 * Get all deleted items
 * @returns True if deleted, false if item not found
 */
export async function getDeletedItems(): Promise<Item[]> {
  const query = `SELECT * FROM items WHERE deleted_at IS NOT NULL ORDER BY item_type ASC, title ASC`;

  const [rows] = await pool.execute<mysql.RowDataPacket[]>(query);
  return rows as Item[];
};

/**
 * Restore deleted item by ID
 * @param id - The item ID to be restored
 * @returns True if restored, false if not
 */
export async function restoreDeletedItemById(id: number): Promise<boolean> {
  const [result] = await pool.execute<mysql.ResultSetHeader>(
    `UPDATE items 
    SET deleted_at = NULL 
    WHERE id = ? 
    AND deleted_at IS NOT NULL`,
    [id]
  );

  return result.affectedRows > 0;
}