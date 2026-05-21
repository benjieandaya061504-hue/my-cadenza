-- ============================================================
-- Cadenza Music School Management System
-- Database: cadenza_db
-- MySQL 8.4.7
-- ============================================================

CREATE DATABASE IF NOT EXISTS cadenza_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE cadenza_db;

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  contact_number VARCHAR(20) NOT NULL,
  address TEXT,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','frontdesk','instructor','student') DEFAULT 'student',
  status ENUM('pending','approved','rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role ON users(role);

-- 2. STUDENTS
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  contact_number VARCHAR(20) NOT NULL,
  address TEXT,
  date_of_birth DATE,
  gender ENUM('male','female','other') DEFAULT 'other',
  emergency_contact_name VARCHAR(100),
  emergency_contact_number VARCHAR(20),
  medical_notes TEXT,
  status ENUM('active','inactive','suspended') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_status ON students(status);

-- 3. INSTRUCTORS
CREATE TABLE IF NOT EXISTS instructors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  contact_number VARCHAR(20) NOT NULL,
  address TEXT,
  specialization VARCHAR(255),
  bio TEXT,
  hourly_rate DECIMAL(10,2) DEFAULT 0.00,
  commission_percentage DECIMAL(5,2) DEFAULT 0.00,
  status ENUM('active','inactive','on_leave') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX idx_instructors_email ON instructors(email);
CREATE INDEX idx_instructors_status ON instructors(status);

-- 4. INSTRUMENTS
CREATE TABLE IF NOT EXISTS instruments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(100) NOT NULL,
  brand VARCHAR(100),
  model VARCHAR(100),
  serial_number VARCHAR(100) UNIQUE,
  purchase_date DATE,
  purchase_price DECIMAL(10,2) DEFAULT 0.00,
  rental_rate_per_day DECIMAL(10,2) DEFAULT 0.00,
  rental_rate_per_week DECIMAL(10,2) DEFAULT 0.00,
  rental_rate_per_month DECIMAL(10,2) DEFAULT 0.00,
  deposit_amount DECIMAL(10,2) DEFAULT 0.00,
  status ENUM('available','rented','maintenance','retired') DEFAULT 'available',
  condition_notes TEXT,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE INDEX idx_instruments_status ON instruments(status);
CREATE INDEX idx_instruments_category ON instruments(category);

-- 5. STUDIOS
CREATE TABLE IF NOT EXISTS studios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  room_number VARCHAR(20) UNIQUE,
  capacity INT DEFAULT 1,
  equipment_notes TEXT,
  hourly_rate DECIMAL(10,2) DEFAULT 0.00,
  status ENUM('available','occupied','maintenance') DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 6. COURSES
CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  duration_weeks INT DEFAULT 0,
  sessions_per_week INT DEFAULT 1,
  session_duration_minutes INT DEFAULT 60,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  instructor_id INT DEFAULT NULL,
  max_students INT DEFAULT 10,
  status ENUM('active','inactive','archived') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (instructor_id) REFERENCES instructors(id) ON DELETE SET NULL
);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_category ON courses(category);

-- 7. PACKAGES
CREATE TABLE IF NOT EXISTS packages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  course_id INT DEFAULT NULL,
  total_sessions INT DEFAULT 0,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  discount_percentage DECIMAL(5,2) DEFAULT 0.00,
  validity_days INT DEFAULT 30,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
);

-- 8. ENROLLMENTS
CREATE TABLE IF NOT EXISTS enrollments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  course_id INT DEFAULT NULL,
  package_id INT DEFAULT NULL,
  instructor_id INT DEFAULT NULL,
  enrollment_date DATE NOT NULL,
  start_date DATE,
  end_date DATE,
  total_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  discount_applied DECIMAL(10,2) DEFAULT 0.00,
  net_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  sessions_attended INT DEFAULT 0,
  total_sessions INT DEFAULT 0,
  status ENUM('active','completed','cancelled','on_hold') DEFAULT 'active',
  is_reenrollment BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
  FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE SET NULL,
  FOREIGN KEY (instructor_id) REFERENCES instructors(id) ON DELETE SET NULL
);
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_status ON enrollments(status);
CREATE INDEX idx_enrollments_date ON enrollments(enrollment_date);

-- 9. LESSON SCHEDULES
CREATE TABLE IF NOT EXISTS lesson_schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  enrollment_id INT NOT NULL,
  instructor_id INT NOT NULL,
  student_id INT NOT NULL,
  studio_id INT DEFAULT NULL,
  scheduled_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  topic VARCHAR(255),
  notes TEXT,
  status ENUM('scheduled','completed','cancelled','rescheduled') DEFAULT 'scheduled',
  rescheduled_from_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
  FOREIGN KEY (instructor_id) REFERENCES instructors(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (studio_id) REFERENCES studios(id) ON DELETE SET NULL,
  FOREIGN KEY (rescheduled_from_id) REFERENCES lesson_schedules(id) ON DELETE SET NULL
);
CREATE INDEX idx_schedule_date ON lesson_schedules(scheduled_date);
CREATE INDEX idx_schedule_instructor ON lesson_schedules(instructor_id);
CREATE INDEX idx_schedule_student ON lesson_schedules(student_id);
CREATE INDEX idx_schedule_status ON lesson_schedules(status);

-- 10. ATTENDANCE
CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lesson_schedule_id INT NOT NULL,
  student_id INT NOT NULL,
  instructor_id INT NOT NULL,
  attended_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('present','absent','late','excused') NOT NULL DEFAULT 'present',
  minutes_late INT DEFAULT 0,
  notes TEXT,
  marked_by INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lesson_schedule_id) REFERENCES lesson_schedules(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (instructor_id) REFERENCES instructors(id) ON DELETE CASCADE,
  FOREIGN KEY (marked_by) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX idx_attendance_schedule ON attendance(lesson_schedule_id);
CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_attendance_status ON attendance(status);

-- 11. CHARGES
CREATE TABLE IF NOT EXISTS charges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ref_type ENUM('enrollment','studio_booking','instrument_rental') NOT NULL,
  ref_id INT NOT NULL,
  student_id INT DEFAULT NULL,
  customer_name VARCHAR(200) NOT NULL,
  service_type VARCHAR(100) NOT NULL,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status ENUM('generated','invoiced','cancelled') DEFAULT 'generated',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE INDEX idx_charges_ref ON charges(ref_type, ref_id);
CREATE INDEX idx_charges_status ON charges(status);

-- 12. INVOICES
CREATE TABLE IF NOT EXISTS invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_no VARCHAR(50) NOT NULL UNIQUE,
  charge_id INT DEFAULT NULL,
  student_id INT DEFAULT NULL,
  customer_name VARCHAR(200) NOT NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status ENUM('unpaid','partially_paid','paid','cancelled') DEFAULT 'unpaid',
  due_date DATE,
  issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paid_at TIMESTAMP NULL DEFAULT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (charge_id) REFERENCES charges(id) ON DELETE SET NULL
);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_student ON invoices(student_id);
CREATE INDEX idx_invoices_date ON invoices(issued_at);

-- 13. PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id INT NOT NULL,
  student_id INT DEFAULT NULL,
  payer_name VARCHAR(200) NOT NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  method ENUM('cash','gcash','bank_transfer','credit_card','cheque') NOT NULL DEFAULT 'cash',
  reference_number VARCHAR(100),
  payment_type ENUM('full','installment') DEFAULT 'full',
  service_type VARCHAR(100),
  paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  received_by INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (received_by) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_payments_method ON payments(method);
CREATE INDEX idx_payments_date ON payments(paid_at);

-- 14. STUDIO BOOKINGS
CREATE TABLE IF NOT EXISTS studio_bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  studio_id INT NOT NULL,
  student_id INT DEFAULT NULL,
  instructor_id INT DEFAULT NULL,
  client_name VARCHAR(200) NOT NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INT DEFAULT 60,
  purpose VARCHAR(255),
  total_fee DECIMAL(10,2) DEFAULT 0.00,
  status ENUM('confirmed','cancelled','completed','no_show') DEFAULT 'confirmed',
  charge_id INT DEFAULT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (studio_id) REFERENCES studios(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL,
  FOREIGN KEY (instructor_id) REFERENCES instructors(id) ON DELETE SET NULL,
  FOREIGN KEY (charge_id) REFERENCES charges(id) ON DELETE SET NULL
);
CREATE INDEX idx_bookings_date ON studio_bookings(booking_date);
CREATE INDEX idx_bookings_studio ON studio_bookings(studio_id);
CREATE INDEX idx_bookings_status ON studio_bookings(status);

-- 15. INSTRUMENT RENTALS
CREATE TABLE IF NOT EXISTS instrument_rentals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  instrument_id INT NOT NULL,
  student_id INT DEFAULT NULL,
  renter_name VARCHAR(200) NOT NULL,
  rental_start_date DATE NOT NULL,
  rental_end_date DATE,
  rental_type ENUM('daily','weekly','monthly') DEFAULT 'monthly',
  rate_at_time_of_rental DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  deposit_amount DECIMAL(10,2) DEFAULT 0.00,
  deposit_paid BOOLEAN DEFAULT FALSE,
  total_fee DECIMAL(10,2) DEFAULT 0.00,
  status ENUM('active','returned','overdue','cancelled') DEFAULT 'active',
  returned_at TIMESTAMP NULL DEFAULT NULL,
  condition_on_return TEXT,
  charge_id INT DEFAULT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (instrument_id) REFERENCES instruments(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL,
  FOREIGN KEY (charge_id) REFERENCES charges(id) ON DELETE SET NULL
);
CREATE INDEX idx_rentals_instrument ON instrument_rentals(instrument_id);
CREATE INDEX idx_rentals_status ON instrument_rentals(status);
CREATE INDEX idx_rentals_date ON instrument_rentals(rental_start_date);