-- ============================================================
-- Migration: Add suffix column to Staff table
-- Adds suffix column (nullable)
-- ============================================================

USE cadenza_music_db;

-- Check if column exists before adding (MySQL doesn't support IF NOT EXISTS in ALTER TABLE)
SET @col_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'cadenza_music_db'
  AND TABLE_NAME = 'Staff'
  AND COLUMN_NAME = 'suffix'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE Staff ADD COLUMN suffix VARCHAR(10) DEFAULT NULL AFTER l_name',
  'SELECT ''Column suffix already exists in Staff table''');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================
-- Migration complete
-- ============================================================
