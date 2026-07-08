-- ============================================================
-- Migration: Add notes column to enrollments table and
-- extend status ENUM to support pending/approved/rejected
-- for the enrollment request workflow
-- ============================================================

USE cadenza_music_db;

-- Add notes column if it doesn't exist
SET @col_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'cadenza_music_db'
    AND TABLE_NAME = 'enrollments'
    AND COLUMN_NAME = 'notes'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE enrollments ADD COLUMN notes TEXT DEFAULT NULL AFTER status',
  'SELECT ''Column notes already exists in enrollments table''');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Alter status ENUM to include 'pending', 'approved', 'rejected'
-- First change it to VARCHAR temporarily
SET @current_enum = (
  SELECT COLUMN_TYPE
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'cadenza_music_db'
    AND TABLE_NAME = 'enrollments'
    AND COLUMN_NAME = 'status'
);

-- Only modify if 'pending' is not already in the enum
SET @has_pending = IF(
  (SELECT LOCATE('pending', @current_enum) > 0),
  1,
  0
);

SET @sql = IF(@has_pending = 0,
  'ALTER TABLE enrollments MODIFY COLUMN status VARCHAR(20) NOT NULL DEFAULT "active"; UPDATE enrollments SET status = "pending" WHERE status = "active" AND id > 0; ALTER TABLE enrollments MODIFY COLUMN status ENUM("pending", "approved", "rejected", "active", "completed", "cancelled") NOT NULL DEFAULT "pending"',
  'SELECT ''Status already includes pending in enrollments table''');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================
-- Migration complete
-- ============================================================