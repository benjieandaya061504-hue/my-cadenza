-- ============================================================
-- Migration: Add middle_name and suffix columns to students table
-- These fields are needed for the student signup/approval flow
-- but were missing from the initial migration
-- ============================================================

USE cadenza_music_db;

-- Add middle_name column if it doesn't exist
SET @col_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'cadenza_music_db'
    AND TABLE_NAME = 'students'
    AND COLUMN_NAME = 'middle_name'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE students ADD COLUMN middle_name VARCHAR(50) DEFAULT NULL AFTER first_name',
  'SELECT ''Column middle_name already exists in students table''');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add suffix column if it doesn't exist
SET @col_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'cadenza_music_db'
    AND TABLE_NAME = 'students'
    AND COLUMN_NAME = 'suffix'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE students ADD COLUMN suffix VARCHAR(10) DEFAULT NULL AFTER last_name',
  'SELECT ''Column suffix already exists in students table''');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================
-- Migration complete
-- ============================================================