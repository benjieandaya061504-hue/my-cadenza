USE cadenza_music_db;

-- Add email column if it doesn't exist
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'cadenza_music_db' AND TABLE_NAME = 'Staff' AND COLUMN_NAME = 'email');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE Staff ADD COLUMN email VARCHAR(100) DEFAULT NULL AFTER contact_no', 'SELECT ''Column email already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add password column if it doesn't exist
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'cadenza_music_db' AND TABLE_NAME = 'Staff' AND COLUMN_NAME = 'password');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE Staff ADD COLUMN password VARCHAR(255) DEFAULT NULL AFTER email', 'SELECT ''Column password already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add last_login column if it doesn't exist
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'cadenza_music_db' AND TABLE_NAME = 'Staff' AND COLUMN_NAME = 'last_login');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE Staff ADD COLUMN last_login DATETIME DEFAULT NULL AFTER password', 'SELECT ''Column last_login already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Migrate data from Staff_Auth to Staff
UPDATE Staff s INNER JOIN Staff_Auth sa ON s.staff_id = sa.staff_id SET s.email = sa.email, s.password = sa.password, s.last_login = sa.last_login;

-- Drop old unique constraint on email if exists
SET @constraint_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = 'cadenza_music_db' AND TABLE_NAME = 'Staff' AND CONSTRAINT_NAME = 'uq_staff_email');
SET @sql = IF(@constraint_exists > 0, 'ALTER TABLE Staff DROP INDEX uq_staff_email', 'SELECT ''Constraint does not exist''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add unique constraint to new email column
ALTER TABLE Staff ADD CONSTRAINT uq_staff_email UNIQUE (email);

-- Drop Staff_Auth table
DROP TABLE IF EXISTS Staff_Auth;
