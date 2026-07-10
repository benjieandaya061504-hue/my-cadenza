-- ============================================================
-- Migration: Complete Staff_Auth to Users migration
-- Description: Staff data already migrated to Users table.
--              This migration ensures FK constraint, removes email from Staff,
--              and drops Staff_Auth table.
-- ============================================================

USE cadenza_music_db;

-- Disable foreign key checks for migration
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1. Add foreign key constraint to Users.staff_id (if not exists)
-- ============================================================
SET @fk_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = 'cadenza_music_db'
  AND TABLE_NAME = 'users'
  AND CONSTRAINT_NAME = 'fk_users_staff'
  AND REFERENCED_TABLE_NAME = 'Staff'
);

SET @sql = IF(@fk_exists = 0,
  'ALTER TABLE Users ADD CONSTRAINT fk_users_staff FOREIGN KEY (staff_id) REFERENCES Staff(staff_id)',
  'SELECT "Foreign key already exists"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add index if not exists
SET @index_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = 'cadenza_music_db'
  AND TABLE_NAME = 'users'
  AND INDEX_NAME = 'idx_users_staff_id'
);

SET @sql = IF(@index_exists = 0,
  'ALTER TABLE Users ADD INDEX idx_users_staff_id (staff_id)',
  'SELECT "Index already exists"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================
-- 2. Remove email column from Staff table
-- ============================================================
SET @column_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'cadenza_music_db'
  AND TABLE_NAME = 'Staff'
  AND COLUMN_NAME = 'email'
);

SET @sql = IF(@column_exists > 0, 'ALTER TABLE Staff DROP COLUMN email', 'SELECT "Column does not exist"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================
-- 3. Drop Staff_Auth table
-- ============================================================
DROP TABLE IF EXISTS Staff_Auth;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- Verification queries
-- ============================================================
SELECT 'Users table structure:' AS info;
DESCRIBE Users;

SELECT 'Staff Users data:' AS info;
SELECT id, username, email, staff_id, role FROM Users WHERE role = 'staff';

SELECT 'Staff table structure (email removed):' AS info;
DESCRIBE Staff;
