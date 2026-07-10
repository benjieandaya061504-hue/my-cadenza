-- ============================================================
-- Migration: Refactor enrollment flow
-- 
-- Changes:
-- 1. Add student info columns to enrollments table so it can
--    hold all student details while waiting for approval
-- 2. Remove the auto-insert into students table on signup
-- 3. Students table will only contain approved students
-- 4. Drop FK constraint fk_enrollments_student that referenced
--    students.id (enrollments now reference users.id directly)
-- ============================================================

USE cadenza_music_db;

-- Drop the old FK constraint that required students to exist first
SET @fk_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = 'cadenza_music_db'
    AND TABLE_NAME = 'enrollments'
    AND CONSTRAINT_NAME = 'fk_enrollments_student'
);

SET @sql = IF(@fk_exists > 0,
  'ALTER TABLE enrollments DROP FOREIGN KEY fk_enrollments_student',
  'SELECT ''FK fk_enrollments_student does not exist''');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add student info columns to enrollments table
SET @col_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'cadenza_music_db'
    AND TABLE_NAME = 'enrollments'
    AND COLUMN_NAME = 'first_name'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE enrollments 
   ADD COLUMN first_name VARCHAR(50) DEFAULT NULL AFTER notes,
   ADD COLUMN middle_name VARCHAR(50) DEFAULT NULL AFTER first_name,
   ADD COLUMN last_name VARCHAR(50) DEFAULT NULL AFTER middle_name,
   ADD COLUMN suffix VARCHAR(10) DEFAULT NULL AFTER last_name,
   ADD COLUMN email VARCHAR(100) DEFAULT NULL AFTER suffix,
   ADD COLUMN contact_number VARCHAR(15) DEFAULT NULL AFTER email,
   ADD COLUMN student_address VARCHAR(255) DEFAULT NULL AFTER contact_number,
   ADD COLUMN course_requested VARCHAR(100) DEFAULT NULL AFTER student_address,
   ADD COLUMN schedule_requested TEXT DEFAULT NULL AFTER course_requested,
   ADD COLUMN program_requested VARCHAR(100) DEFAULT NULL AFTER schedule_requested,
   ADD COLUMN payment_reference VARCHAR(100) DEFAULT NULL AFTER program_requested,
   ADD COLUMN payment_method VARCHAR(50) DEFAULT NULL AFTER payment_reference,
   ADD COLUMN total_amount DECIMAL(10,2) DEFAULT NULL AFTER payment_method',
  'SELECT ''Columns already exist in enrollments table''');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================
-- Migration complete
-- ============================================================