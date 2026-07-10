-- ============================================================
-- Migration: Add users, students, and instructors tables
-- This adds the tables expected by the API routes while keeping
-- the existing Staff/Staff_Auth structure for staff authentication
-- ============================================================

USE cadenza_music_db;

-- ============================================================
-- 1. Users Table (for student/client authentication)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    contact_number VARCHAR(15) DEFAULT NULL,
    address VARCHAR(255) DEFAULT NULL,
    role ENUM('student', 'admin', 'staff') NOT NULL DEFAULT 'student',
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT uq_users_username UNIQUE (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 2. Students Table (linked to users)
-- ============================================================
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT,
    user_id INT DEFAULT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    contact_number VARCHAR(15) NOT NULL,
    address VARCHAR(255) DEFAULT NULL,
    date_of_birth DATE DEFAULT NULL,
    gender ENUM('male', 'female', 'other') DEFAULT 'other',
    emergency_contact_name VARCHAR(100) DEFAULT NULL,
    emergency_contact_number VARCHAR(15) DEFAULT NULL,
    medical_notes TEXT DEFAULT NULL,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_students PRIMARY KEY (id),
    CONSTRAINT uq_students_email UNIQUE (email),
    CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 3. Instructors Table (linked to users)
-- ============================================================
CREATE TABLE IF NOT EXISTS instructors (
    id INT AUTO_INCREMENT,
    user_id INT DEFAULT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    contact_number VARCHAR(15) NOT NULL,
    address VARCHAR(255) DEFAULT NULL,
    specialization VARCHAR(100) DEFAULT NULL,
    bio TEXT DEFAULT NULL,
    hourly_rate DECIMAL(10,2) DEFAULT 0.00,
    commission_percentage DECIMAL(5,2) DEFAULT 0.00,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_instructors PRIMARY KEY (id),
    CONSTRAINT uq_instructors_email UNIQUE (email),
    CONSTRAINT fk_instructors_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 4. Courses Table
-- ============================================================
CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT DEFAULT NULL,
    duration_weeks INT DEFAULT NULL,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(50) DEFAULT NULL,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_courses PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 5. Enrollments Table
-- ============================================================
CREATE TABLE IF NOT EXISTS enrollments (
    id INT AUTO_INCREMENT,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    enrollment_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'completed', 'cancelled') NOT NULL DEFAULT 'active',
    progress_percentage INT DEFAULT 0,
    CONSTRAINT pk_enrollments PRIMARY KEY (id),
    CONSTRAINT fk_enrollments_student FOREIGN KEY (student_id) REFERENCES students(id),
    CONSTRAINT fk_enrollments_course FOREIGN KEY (course_id) REFERENCES courses(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 6. Lessons Table
-- ============================================================
CREATE TABLE IF NOT EXISTS lessons (
    id INT AUTO_INCREMENT,
    enrollment_id INT NOT NULL,
    instructor_id INT NOT NULL,
    scheduled_date DATETIME NOT NULL,
    duration_minutes INT NOT NULL,
    status ENUM('scheduled', 'completed', 'cancelled', 'no_show') NOT NULL DEFAULT 'scheduled',
    notes TEXT DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_lessons PRIMARY KEY (id),
    CONSTRAINT fk_lessons_enrollment FOREIGN KEY (enrollment_id) REFERENCES enrollments(id),
    CONSTRAINT fk_lessons_instructor FOREIGN KEY (instructor_id) REFERENCES instructors(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 7. Equipment Rentals Table
-- ============================================================
CREATE TABLE IF NOT EXISTS equipment_rentals (
    id INT AUTO_INCREMENT,
    equipment_id VARCHAR(10) NOT NULL,
    client_id INT NOT NULL,
    rental_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    return_date DATETIME DEFAULT NULL,
    status ENUM('active', 'returned', 'overdue') NOT NULL DEFAULT 'active',
    CONSTRAINT pk_equipment_rentals PRIMARY KEY (id),
    CONSTRAINT fk_equipment_rentals_equipment FOREIGN KEY (equipment_id) REFERENCES Equipment(equipment_id),
    CONSTRAINT fk_equipment_rentals_client FOREIGN KEY (client_id) REFERENCES Client(client_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 8. Session Schedule Table (for lessons)
-- ============================================================
CREATE TABLE IF NOT EXISTS session_schedule (
    session_sched_id INT AUTO_INCREMENT,
    enrollment_id INT DEFAULT NULL,
    instructor_id INT NOT NULL,
    scheduled_date DATETIME NOT NULL,
    duration_minutes INT NOT NULL,
    status ENUM('scheduled', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled',
    notes TEXT DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_session_schedule PRIMARY KEY (session_sched_id),
    CONSTRAINT fk_session_schedule_enrollment FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE SET NULL,
    CONSTRAINT fk_session_schedule_instructor FOREIGN KEY (instructor_id) REFERENCES instructors(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 9. Enrollment Rates Table
-- ============================================================
CREATE TABLE IF NOT EXISTS enrollment_rates (
    enrollment_rate_id INT AUTO_INCREMENT,
    course_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    duration_value INT NOT NULL,
    duration_unit_id INT NOT NULL,
    CONSTRAINT pk_enrollment_rates PRIMARY KEY (enrollment_rate_id),
    CONSTRAINT fk_enrollment_rates_course FOREIGN KEY (course_id) REFERENCES courses(id),
    CONSTRAINT fk_enrollment_rates_duration_unit FOREIGN KEY (duration_unit_id) REFERENCES Duration_Unit(duration_unit_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Update Billing table to reference new tables
-- ============================================================
-- Check if column exists before adding (MySQL doesn't support IF NOT EXISTS in ALTER TABLE)
SET @col_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'cadenza_music_db'
  AND TABLE_NAME = 'Billing'
  AND COLUMN_NAME = 'enrollment_rate_id'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE Billing ADD COLUMN enrollment_rate_id INT DEFAULT NULL AFTER client_id',
  'SELECT ''Column enrollment_rate_id already exists in Billing table''');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================
-- Migration complete
-- ============================================================
