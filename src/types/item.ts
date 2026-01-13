/**
 * Represents an item in the document management system database
 * Can be either a folder or a file
 */
export interface Item {
  id: number;
  title: string;
  itemType: 'folder' | 'file';
  parentId: number | null;
  fileSizeKb: number | null;
  s3Url: string | null;
  createdBy: string | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Type for creating a new item (without auto-generated fields)
 */
export interface CreateItem {
  title: string;
  itemType: 'folder' | 'file';
  parentId: number | null;
  fileSizeKb?: number | null;
  s3Url?: string | null;
  createdBy?: string | null;
}

/**
 * Type for updating an item
 */
export interface UpdateItem {
  title?: string;
  parentId?: number | null;
}
