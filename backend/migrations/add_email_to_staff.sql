-- ============================================================
-- Migration: Add email column to Staff table
-- Adds email column (NOT NULL) - this was missing from the actual database
-- ============================================================

USE cadenza_music_db;

-- Check if column exists before adding (MySQL doesn't support IF NOT EXISTS in ALTER TABLE)
SET @col_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'cadenza_music_db'
  AND TABLE_NAME = 'Staff'
  AND COLUMN_NAME = 'email'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE Staff ADD COLUMN email VARCHAR(100) NOT NULL AFTER contact_no',
  'SELECT ''Column email already exists in Staff table''');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================
-- Migration complete
-- ============================================================
