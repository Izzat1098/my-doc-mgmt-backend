-- for MySQL v8.0
CREATE DATABASE my_db;
USE my_db;

--test the correct db is selected
SELECT DATABASE(); 

CREATE TABLE items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    item_type ENUM('folder', 'file') NOT NULL,
    parent_id INT NULL DEFAULT NULL,
    -- NULL means root level
    
    -- File-specific fields (NULL for folders)
    file_size_kb INT UNSIGNED NULL DEFAULT NULL,
    s3_url VARCHAR(1024) NULL DEFAULT NULL,
    
    -- Metadata
    created_by VARCHAR(100) NULL DEFAULT NULL,
    -- soft delete
    deleted_at TIMESTAMP NULL DEFAULT NULL,  
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign key for hierarchy
    FOREIGN KEY (parent_id) REFERENCES items(id) ON DELETE CASCADE
);

-- Dev commands
-- Check schema
DESCRIBE items;

-- delete rows
TRUNCATE TABLE items;

-- Drop the table
DROP TABLE items;

-- Drop the database
DROP DATABASE my_db;