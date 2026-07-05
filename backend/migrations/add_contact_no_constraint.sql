-- ============================================================
-- Migration: Add CHECK constraint to contact_no column in Staff table
-- Only allows digits and optional leading + sign
-- ============================================================

USE cadenza_music_db;

-- Drop existing constraint if it exists (for re-running migration)
SET @constraint_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = 'cadenza_music_db'
  AND TABLE_NAME = 'Staff'
  AND CONSTRAINT_NAME = 'chk_contact_no_format'
);

SET @sql = IF(@constraint_exists > 0,
  'ALTER TABLE Staff DROP CONSTRAINT chk_contact_no_format',
  'SELECT ''Constraint chk_contact_no_format does not exist, skipping drop''');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add the CHECK constraint
ALTER TABLE Staff 
ADD CONSTRAINT chk_contact_no_format 
CHECK (contact_no REGEXP '^[+]?[0-9]+$');

-- ============================================================
-- Migration complete
-- ============================================================
