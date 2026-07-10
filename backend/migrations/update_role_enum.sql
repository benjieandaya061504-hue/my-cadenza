-- ============================================================
-- Migration: Update Users role ENUM values
-- Description: Change role ENUM from ('student','admin','staff') 
--              to ('admin','frontdesk','student')
--              Set existing 'staff' rows to 'frontdesk' as default
-- ============================================================

USE cadenza_music_db;

-- Disable foreign key checks for migration
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1. Update existing staff role to frontdesk
-- ============================================================
UPDATE users SET role = 'frontdesk' WHERE role = 'staff';

-- ============================================================
-- 2. Modify role column ENUM
-- ============================================================
ALTER TABLE users 
MODIFY COLUMN role ENUM('admin', 'frontdesk', 'student') 
DEFAULT 'frontdesk';

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- Verification queries
-- ============================================================
SELECT 'Users table structure:' AS info;
DESCRIBE users;

SELECT 'Sample Users data:' AS info;
SELECT id, username, email, role, status FROM users LIMIT 10;
