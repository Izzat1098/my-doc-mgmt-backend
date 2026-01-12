/**
 * Represents an item in the document management system database
 * Can be either a folder or a file
 */
export interface Item {
  id: number;
  title: string;
  item_type: 'folder' | 'file';
  parent_id: number | null;
  file_size_kb: number | null;
  s3_url: string | null;
  created_by: string | null;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Type for creating a new item (without auto-generated fields)
 */
export interface CreateItem {
  title: string;
  item_type: 'folder' | 'file';
  parent_id: number | null;
  file_size_kb?: number | null;
  created_by?: string | null;
}

/**
 * Type for updating an item
 */
export interface UpdateItem {
  title?: string;
  parent_id?: number | null;
}
