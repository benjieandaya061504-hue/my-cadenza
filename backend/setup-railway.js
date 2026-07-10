/**
 * Railway MySQL Database Setup Script
 * Run this to set up the database schema on Railway
 */
import mysql from 'mysql2/promise'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const DB_URL = 'mysql://root:aoZnTskLznLSHXXkJQNJpLsfwhtHJusP@hayabusa.proxy.rlwy.net:45401/railway'

async function setup() {
  console.log('🔌 Connecting to Railway MySQL...')
  const connection = await mysql.createConnection(DB_URL)
  console.log('✅ Connected')

  // Disable FK checks and drop all tables
  await connection.query('SET FOREIGN_KEY_CHECKS = 0')
  
  const dropTables = [
    'Room_Schedule', 'Announcement', 'Payment', 'Billing', 'Booking',
    'Room_Rate', 'Equipment_Rate', 'Equipment', 'Categories', 'Duration_Unit',
    'Room', 'Client', 'Staff_Auth', 'Staff', 'Role', 'enrollments', 'students', 'Users'
  ]

  for (const table of dropTables) {
    try {
      await connection.query(`DROP TABLE IF EXISTS \`${table}\``)
      console.log(`  Dropped ${table}`)
    } catch (e) { /* ignore */ }
  }

  // Now create all tables
  await connection.query('SET FOREIGN_KEY_CHECKS = 0')

  // Create Role table first
  await connection.query(`CREATE TABLE Role (
    role_id INT AUTO_INCREMENT,
    role_name VARCHAR(50) NOT NULL,
    CONSTRAINT pk_role PRIMARY KEY (role_id),
    CONSTRAINT uq_role_name UNIQUE (role_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`)

  await connection.query(`INSERT INTO Role (role_id, role_name) VALUES
    (1, 'Admin'), (2, 'Front Desk'), (3, 'Instructor')`)

  // Staff table
  await connection.query(`CREATE TABLE Staff (
    staff_id INT AUTO_INCREMENT,
    f_name VARCHAR(50) NOT NULL,
    m_name VARCHAR(50) DEFAULT NULL,
    l_name VARCHAR(50) NOT NULL,
    address VARCHAR(255) NOT NULL,
    age INT NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    contact_no VARCHAR(15) NOT NULL,
    email VARCHAR(100) NOT NULL,
    profile TEXT DEFAULT NULL,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    role_id INT NOT NULL,
    PRIMARY KEY (staff_id),
    UNIQUE KEY (email),
    FOREIGN KEY (role_id) REFERENCES Role(role_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`)

  await connection.query(`INSERT INTO Staff (staff_id, f_name, m_name, l_name, address, age, gender, contact_no, email, profile, status, role_id) VALUES
    (1, 'Juan', 'Dela', 'Cruz', '123 Rizal St., Manila', 35, 'Male', '09171234567', 'juan.cruz@cadenza.com', NULL, 'active', 1),
    (2, 'Maria', 'Luna', 'Santos', '456 Mabini Ave., Quezon City', 28, 'Female', '09182345678', 'maria.santos@cadenza.com', NULL, 'active', 2),
    (3, 'Pedro', NULL, 'Gonzales', '789 Bonifacio St., Makati', 42, 'Male', '09193456789', 'pedro.gonzales@cadenza.com', 'Senior instructor for piano', 'active', 3),
    (4, 'Ana', 'Reyes', 'Villanueva', '321 Katipunan Rd., Pasig', 26, 'Female', '09204567890', 'ana.villanueva@cadenza.com', NULL, 'active', 2),
    (5, 'Carlos', 'M.', 'Fernandez', '654 Taft Ave., Manila', 38, 'Male', '09215678901', 'carlos.fernandez@cadenza.com', 'Guitar and voice instructor', 'active', 3)`)

  // Staff_Auth with bcrypt passwords
  await connection.query(`CREATE TABLE Staff_Auth (
    auth_id INT AUTO_INCREMENT,
    staff_id INT NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    last_login DATETIME DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (auth_id),
    UNIQUE KEY (staff_id),
    UNIQUE KEY (email),
    FOREIGN KEY (staff_id) REFERENCES Staff(staff_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`)

  // This is the bcrypt hash for "admin123"
  await connection.query(`INSERT INTO Staff_Auth (auth_id, staff_id, email, password, last_login) VALUES
    (1, 1, 'juan.cruz@cadenza.com', '$2b$10$/o3hoK3AS0qy4y2rhZ5hwO04Ru13T3PeL0TrrJFFF9vXsaTj4koKa', NULL),
    (2, 2, 'maria.santos@cadenza.com', '$2b$10$2efVqJRikxd75Lyx.iBwPuvc2JvQOqVybhewV.jDl.A8Yno18huzG', NULL),
    (3, 3, 'pedro.gonzales@cadenza.com', '$2b$10$SHY18FkFgOqZ28K6ydIrwexRnQWFbGGuuovoC.iHHxHMWErMjiSv.', NULL),
    (4, 4, 'ana.villanueva@cadenza.com', '$2b$10$hhahFjWEbIwqLkLLqryCd.pXz03iFTlNWGjvYP/iZankvjqvWKsFG', NULL),
    (5, 5, 'carlos.fernandez@cadenza.com', '$2b$10$c42CHuIet2zaeHz0YSUG7OjfI6IhcZkQx9N4dsBWMYbVlnfQjoS3m', NULL)`)

  console.log('✅ Created tables: Role, Staff, Staff_Auth')
  
  // Create remaining tables (Client, Room, etc.)
  await connection.query(`CREATE TABLE Client (
    client_id INT AUTO_INCREMENT,
    f_name VARCHAR(50) NOT NULL,
    m_name VARCHAR(50) DEFAULT NULL,
    l_name VARCHAR(50) NOT NULL,
    address VARCHAR(255) NOT NULL,
    age INT NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    guardian_name VARCHAR(100) DEFAULT NULL,
    contact_no VARCHAR(15) NOT NULL,
    email VARCHAR(100) NOT NULL,
    profile TEXT DEFAULT NULL,
    CONSTRAINT pk_client PRIMARY KEY (client_id),
    CONSTRAINT uq_client_email UNIQUE (email)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`)

  await connection.query(`INSERT INTO Client (client_id, f_name, m_name, l_name, address, age, gender, guardian_name, contact_no, email, profile) VALUES
    (1, 'John', 'Michael', 'Smith', '100 Main St., BGC', 25, 'Male', NULL, '09123456789', 'john.smith@email.com', 'Professional pianist'),
    (2, 'Emily', 'Rose', 'Johnson', '200 Oak Ave., Mandaluyong', 16, 'Female', 'Robert Johnson', '09234567890', 'emily.johnson@email.com', NULL),
    (3, 'David', NULL, 'Brown', '300 Pine Rd., Pasay', 30, 'Male', NULL, '09345678901', 'david.brown@email.com', NULL),
    (4, 'Sophia', 'Marie', 'Davis', '400 Elm St., Makati', 10, 'Female', 'Sarah Davis', '09456789012', 'sophia.davis@email.com', 'Child prodigy - violin'),
    (5, 'Michael', 'James', 'Wilson', '500 Cedar Ln., Taguig', 22, 'Male', NULL, '09567890123', 'michael.wilson@email.com', NULL)`)

  // Room
  await connection.query(`CREATE TABLE Room (
    room_id INT AUTO_INCREMENT,
    room_no VARCHAR(20) NOT NULL,
    room_type ENUM('VIP', 'Regular') NOT NULL,
    room_capacity INT NOT NULL,
    CONSTRAINT pk_room PRIMARY KEY (room_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`)

  await connection.query(`INSERT INTO Room (room_id, room_no, room_type, room_capacity) VALUES
    (1, '101', 'VIP', 7), (2, '102', 'Regular', 5), (3, '103', 'VIP', 7), (4, '104', 'Regular', 5), (5, '105', 'VIP', 7)`)

  // Create enrollments table (for student signup flow)
  await connection.query(`CREATE TABLE IF NOT EXISTS enrollments (
    enrollment_id INT AUTO_INCREMENT,
    student_id INT NOT NULL,
    course_id INT DEFAULT NULL,
    enrollment_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'approved', 'rejected', 'active', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    notes TEXT DEFAULT NULL,
    first_name VARCHAR(50) DEFAULT NULL,
    middle_name VARCHAR(50) DEFAULT NULL,
    last_name VARCHAR(50) DEFAULT NULL,
    suffix VARCHAR(10) DEFAULT NULL,
    email VARCHAR(100) DEFAULT NULL,
    contact_number VARCHAR(15) DEFAULT NULL,
    student_address VARCHAR(255) DEFAULT NULL,
    course_requested VARCHAR(100) DEFAULT NULL,
    schedule_requested TEXT DEFAULT NULL,
    program_requested VARCHAR(100) DEFAULT NULL,
    payment_reference VARCHAR(100) DEFAULT NULL,
    payment_method VARCHAR(50) DEFAULT NULL,
    total_amount DECIMAL(10,2) DEFAULT NULL,
    progress_percentage INT DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_enrollments PRIMARY KEY (enrollment_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`)

  await connection.query('SET FOREIGN_KEY_CHECKS = 1')

  console.log('✅ Created tables: Client, Room, enrollments')
  console.log('\n🎉 Database setup complete!')
  await connection.end()
}

setup().catch(err => {
  console.error('❌ Setup failed:', err.message)
  process.exit(1)
})