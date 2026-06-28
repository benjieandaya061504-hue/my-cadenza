-- ============================================================
-- Database: cadenza_music_db
-- Description: Complete 3NF-normalized database for Cadenza Music
-- Compatible with MySQL 5.7/8.0 (WAMP)
-- ============================================================

CREATE DATABASE IF NOT EXISTS cadenza_music_db;
USE cadenza_music_db;

-- ============================================================
-- Disable foreign key checks for dropping tables
-- ============================================================
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- Drop tables in correct order (child before parent)
-- ============================================================
DROP TABLE IF EXISTS Room_Schedule;
DROP TABLE IF EXISTS Announcement;
DROP TABLE IF EXISTS Payment;
DROP TABLE IF EXISTS Billing;
DROP TABLE IF EXISTS Booking;
DROP TABLE IF EXISTS Room_Rate;
DROP TABLE IF EXISTS Equipment_Rate;
DROP TABLE IF EXISTS Equipment;
DROP TABLE IF EXISTS Categories;
DROP TABLE IF EXISTS Duration_Unit;
DROP TABLE IF EXISTS Room;
DROP TABLE IF EXISTS Client;
DROP TABLE IF EXISTS Staff_Auth;
DROP TABLE IF EXISTS Staff;
DROP TABLE IF EXISTS Role;

-- ============================================================
-- Re-enable foreign key checks
-- ============================================================
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 1. Role
-- ============================================================
CREATE TABLE Role (
    role_id INT AUTO_INCREMENT,
    role_name VARCHAR(50) NOT NULL,
    CONSTRAINT pk_role PRIMARY KEY (role_id),
    CONSTRAINT uq_role_name UNIQUE (role_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO Role (role_id, role_name) VALUES
(1, 'Admin'),
(2, 'Front Desk'),
(3, 'Instructor');

-- ============================================================
-- 2. Staff
-- ============================================================
CREATE TABLE Staff (
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
    CONSTRAINT pk_staff PRIMARY KEY (staff_id),
    CONSTRAINT uq_staff_email UNIQUE (email),
    CONSTRAINT chk_staff_age CHECK (age > 0),
    CONSTRAINT fk_staff_role FOREIGN KEY (role_id) REFERENCES Role(role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO Staff (staff_id, f_name, m_name, l_name, address, age, gender, contact_no, email, profile, status, role_id) VALUES
(1, 'Juan', 'Dela', 'Cruz', '123 Rizal St., Manila', 35, 'Male', '09171234567', 'juan.cruz@cadenza.com', NULL, 'active', 1),
(2, 'Maria', 'Luna', 'Santos', '456 Mabini Ave., Quezon City', 28, 'Female', '09182345678', 'maria.santos@cadenza.com', NULL, 'active', 2),
(3, 'Pedro', NULL, 'Gonzales', '789 Bonifacio St., Makati', 42, 'Male', '09193456789', 'pedro.gonzales@cadenza.com', 'Senior instructor for piano', 'active', 3),
(4, 'Ana', 'Reyes', 'Villanueva', '321 Katipunan Rd., Pasig', 26, 'Female', '09204567890', 'ana.villanueva@cadenza.com', NULL, 'active', 2),
(5, 'Carlos', 'M.', 'Fernandez', '654 Taft Ave., Manila', 38, 'Male', '09215678901', 'carlos.fernandez@cadenza.com', 'Guitar and voice instructor', 'active', 3);

-- ============================================================
-- 3. Staff_Auth
-- ============================================================
CREATE TABLE Staff_Auth (
    auth_id INT AUTO_INCREMENT,
    staff_id INT NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    last_login DATETIME DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_staff_auth PRIMARY KEY (auth_id),
    CONSTRAINT uq_staff_auth_staff_id UNIQUE (staff_id),
    CONSTRAINT uq_staff_auth_email UNIQUE (email),
    CONSTRAINT fk_staff_auth_staff FOREIGN KEY (staff_id) REFERENCES Staff(staff_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO Staff_Auth (auth_id, staff_id, email, password, last_login) VALUES
(1, 1, 'juan.cruz@cadenza.com', '$2b$10$BaTPsnizhrs/be8j3/H1qezN0zxT.mvL.l8E5uhQ1r5px5XChje9C', NULL),
(2, 2, 'maria.santos@cadenza.com', '$2b$10$y6f2HmulNdadg46tbpy8derTcdS30Lb3hP/atfWyVLV3BWX5R6WpC', NULL),
(3, 3, 'pedro.gonzales@cadenza.com', '$2b$10$vQuXFupXX.Hg2m/4hFPrY.X9UmDCV51pPUuuUCrbQYLBT5JjTH95e', NULL),
(4, 4, 'ana.villanueva@cadenza.com', '$2b$10$0rXWHvVAT1P.Gl66yIt12OsQVrjXMYdI9Upo.lSy0QpuDwcksagiW', NULL),
(5, 5, 'carlos.fernandez@cadenza.com', '$2b$10$W9xPEtL5ukIXmjySTCQ7ouH.cXMSSb7TXDlh4bPf5gpDL3Ec4pK3i', NULL);

-- ============================================================
-- 4. Client
-- ============================================================
CREATE TABLE Client (
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
    CONSTRAINT uq_client_email UNIQUE (email),
    CONSTRAINT chk_client_age CHECK (age > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO Client (client_id, f_name, m_name, l_name, address, age, gender, guardian_name, contact_no, email, profile) VALUES
(1, 'John', 'Michael', 'Smith', '100 Main St., BGC', 25, 'Male', NULL, '09123456789', 'john.smith@email.com', 'Professional pianist'),
(2, 'Emily', 'Rose', 'Johnson', '200 Oak Ave., Mandaluyong', 16, 'Female', 'Robert Johnson', '09234567890', 'emily.johnson@email.com', NULL),
(3, 'David', NULL, 'Brown', '300 Pine Rd., Pasay', 30, 'Male', NULL, '09345678901', 'david.brown@email.com', NULL),
(4, 'Sophia', 'Marie', 'Davis', '400 Elm St., Makati', 10, 'Female', 'Sarah Davis', '09456789012', 'sophia.davis@email.com', 'Child prodigy - violin'),
(5, 'Michael', 'James', 'Wilson', '500 Cedar Ln., Taguig', 22, 'Male', NULL, '09567890123', 'michael.wilson@email.com', NULL);

-- ============================================================
-- 5. Room
-- ============================================================
CREATE TABLE Room (
    room_id INT AUTO_INCREMENT,
    room_no VARCHAR(20) NOT NULL,
    room_type ENUM('VIP', 'Regular') NOT NULL,
    room_capacity INT NOT NULL,
    CONSTRAINT pk_room PRIMARY KEY (room_id),
    CONSTRAINT chk_room_capacity CHECK (room_capacity > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO Room (room_id, room_no, room_type, room_capacity) VALUES
(1, '101', 'VIP', 7),
(2, '102', 'Regular', 5),
(3, '103', 'VIP', 7),
(4, '104', 'Regular', 5),
(5, '105', 'VIP', 7);

-- ============================================================
-- 6. Duration_Unit
-- ============================================================
CREATE TABLE Duration_Unit (
    duration_unit_id INT AUTO_INCREMENT,
    unit_type ENUM('Minutes', 'Hour') NOT NULL,
    CONSTRAINT pk_duration_unit PRIMARY KEY (duration_unit_id),
    CONSTRAINT uq_unit_type UNIQUE (unit_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO Duration_Unit (duration_unit_id, unit_type) VALUES
(1, 'Minutes'),
(2, 'Hour');

-- ============================================================
-- 7. Categories
-- ============================================================
CREATE TABLE Categories (
    category_id INT AUTO_INCREMENT,
    category_name VARCHAR(100) NOT NULL,
    brand_name VARCHAR(100) DEFAULT NULL,
    CONSTRAINT pk_categories PRIMARY KEY (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO Categories (category_id, category_name, brand_name) VALUES
(1, 'String Instruments', 'Yamaha'),
(2, 'Percussion Instruments', 'Roland'),
(3, 'Wind Instruments', 'Selmer'),
(4, 'Keyboard Instruments', 'Casio'),
(5, 'Audio Equipment', 'Shure');

-- ============================================================
-- 8. Equipment
-- ============================================================
CREATE TABLE Equipment (
    equipment_id VARCHAR(10),
    eqp_name VARCHAR(100) NOT NULL,
    brand_name VARCHAR(100) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    category_id INT NOT NULL,
    CONSTRAINT pk_equipment PRIMARY KEY (equipment_id),
    CONSTRAINT chk_equipment_quantity CHECK (quantity >= 0),
    CONSTRAINT fk_equipment_category FOREIGN KEY (category_id) REFERENCES Categories(category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO Equipment (equipment_id, eqp_name, brand_name, quantity, category_id) VALUES
('EQP-001', 'Acoustic Guitar', 'Yamaha', 10, 1),
('EQP-002', 'Electric Drum Kit', 'Roland', 5, 2),
('EQP-003', 'Saxophone', 'Selmer', 3, 3),
('EQP-004', 'Digital Piano', 'Casio', 8, 4),
('EQP-005', 'Microphone', 'Shure', 15, 5);

-- ============================================================
-- 9. Equipment_Rate
-- ============================================================
CREATE TABLE Equipment_Rate (
    equipment_rate_id INT AUTO_INCREMENT,
    amount DECIMAL(10,2) NOT NULL,
    duration_value INT NOT NULL,
    duration_unit_id INT NOT NULL,
    equipment_id VARCHAR(10) NOT NULL,
    CONSTRAINT pk_equipment_rate PRIMARY KEY (equipment_rate_id),
    CONSTRAINT chk_equipment_rate_amount CHECK (amount >= 0),
    CONSTRAINT chk_equipment_rate_duration CHECK (duration_value > 0),
    CONSTRAINT fk_equipment_rate_duration_unit FOREIGN KEY (duration_unit_id) REFERENCES Duration_Unit(duration_unit_id),
    CONSTRAINT fk_equipment_rate_equipment FOREIGN KEY (equipment_id) REFERENCES Equipment(equipment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO Equipment_Rate (equipment_rate_id, amount, duration_value, duration_unit_id, equipment_id) VALUES
(1, 150.00, 30, 1, 'EQP-001'),
(2, 200.00, 60, 1, 'EQP-002'),
(3, 250.00, 60, 1, 'EQP-003'),
(4, 180.00, 30, 1, 'EQP-004'),
(5, 100.00, 60, 1, 'EQP-005');

-- ============================================================
-- 10. Room_Rate
-- ============================================================
CREATE TABLE Room_Rate (
    room_rate_id INT AUTO_INCREMENT,
    room_type ENUM('VIP', 'Regular') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    duration_value INT NOT NULL,
    duration_unit_id INT NOT NULL,
    room_id INT NOT NULL,
    CONSTRAINT pk_room_rate PRIMARY KEY (room_rate_id),
    CONSTRAINT chk_room_rate_amount CHECK (amount > 0),
    CONSTRAINT fk_room_rate_duration_unit FOREIGN KEY (duration_unit_id) REFERENCES Duration_Unit(duration_unit_id),
    CONSTRAINT fk_room_rate_room FOREIGN KEY (room_id) REFERENCES Room(room_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO Room_Rate (room_rate_id, room_type, amount, duration_value, duration_unit_id, room_id) VALUES
(1, 'Regular', 450.00, 3, 2, 2),
(2, 'VIP', 600.00, 6, 2, 1),
(3, 'Regular', 850.00, 12, 2, 4);

-- ============================================================
-- 11. Booking
-- ============================================================
CREATE TABLE Booking (
    booking_id INT AUTO_INCREMENT,
    booked_time_start DATETIME NOT NULL,
    booked_time_end DATETIME NOT NULL,
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    room_id INT NOT NULL,
    client_id INT NOT NULL,
    CONSTRAINT pk_booking PRIMARY KEY (booking_id),
    CONSTRAINT fk_booking_room FOREIGN KEY (room_id) REFERENCES Room(room_id),
    CONSTRAINT fk_booking_client FOREIGN KEY (client_id) REFERENCES Client(client_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO Booking (booking_id, booked_time_start, booked_time_end, status, room_id, client_id) VALUES
(1, '2026-06-15 09:00:00', '2026-06-15 12:00:00', 'approved', 1, 1),
(2, '2026-06-15 14:00:00', '2026-06-15 17:00:00', 'pending', 2, 2),
(3, '2026-06-16 10:00:00', '2026-06-16 13:00:00', 'approved', 3, 3),
(4, '2026-06-16 15:00:00', '2026-06-16 18:00:00', 'rejected', 4, 4),
(5, '2026-06-17 08:00:00', '2026-06-17 11:00:00', 'pending', 5, 5);

-- ============================================================
-- 12. Billing
-- ============================================================
CREATE TABLE Billing (
    billing_id INT AUTO_INCREMENT,
    billing_datetime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10,2) NOT NULL,
    billing_type ENUM('Enrollment Billing', 'Instrument Billing', 'Studio Room Billing') NOT NULL,
    status ENUM('Pending', 'Paid', 'Partial') NOT NULL DEFAULT 'Pending',
    client_id INT DEFAULT NULL,
    enrollment_rate_id INT DEFAULT NULL,
    booking_id INT DEFAULT NULL,
    equipment_rental_id INT DEFAULT NULL,
    staff_id INT NOT NULL,
    CONSTRAINT pk_billing PRIMARY KEY (billing_id),
    CONSTRAINT fk_billing_client FOREIGN KEY (client_id) REFERENCES Client(client_id),
    CONSTRAINT fk_billing_booking FOREIGN KEY (booking_id) REFERENCES Booking(booking_id),
    CONSTRAINT fk_billing_staff FOREIGN KEY (staff_id) REFERENCES Staff(staff_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO Billing (billing_id, billing_datetime, total_amount, billing_type, status, client_id, enrollment_rate_id, booking_id, equipment_rental_id, staff_id) VALUES
(1, '2026-06-15 08:30:00', 600.00, 'Studio Room Billing', 'Paid', 1, NULL, 1, NULL, 2),
(2, '2026-06-15 13:45:00', 450.00, 'Studio Room Billing', 'Pending', 2, NULL, 2, NULL, 4),
(3, '2026-06-16 09:15:00', 1500.00, 'Enrollment Billing', 'Paid', 3, 1, NULL, NULL, 1),
(4, '2026-06-16 14:30:00', 200.00, 'Instrument Billing', 'Partial', 4, NULL, NULL, 1, 2),
(5, '2026-06-17 07:45:00', 850.00, 'Studio Room Billing', 'Pending', 5, NULL, 5, NULL, 4);

-- ============================================================
-- 13. Payment
-- ============================================================
CREATE TABLE Payment (
    payment_id INT AUTO_INCREMENT,
    total_amount DECIMAL(10,2) NOT NULL,
    reference VARCHAR(50) NOT NULL,
    cash DECIMAL(10,2) NOT NULL,
    change_amount DECIMAL(10,2) NOT NULL,
    date_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    payment_type ENUM('cash', 'gcash', 'maya') NOT NULL,
    billing_id INT NOT NULL,
    CONSTRAINT pk_payment PRIMARY KEY (payment_id),
    CONSTRAINT uq_payment_reference UNIQUE (reference),
    CONSTRAINT chk_payment_amount CHECK (total_amount > 0),
    CONSTRAINT fk_payment_billing FOREIGN KEY (billing_id) REFERENCES Billing(billing_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO Payment (payment_id, total_amount, reference, cash, change_amount, date_time, payment_type, billing_id) VALUES
(1, 600.00, '1000188336470', 600.00, 0.00, '2026-06-15 08:35:00', 'cash', 1),
(2, 1500.00, '1000188336471', 1500.00, 0.00, '2026-06-16 09:20:00', 'cash', 3),
(3, 100.00, '1000188336472', 200.00, 100.00, '2026-06-16 14:45:00', 'cash', 4),
(4, 450.00, '1000188336473', 450.00, 0.00, '2026-06-17 10:00:00', 'gcash', 2),
(5, 850.00, '1000188336474', 1000.00, 150.00, '2026-06-17 08:00:00', 'maya', 5);

-- ============================================================
-- 14. Announcement
-- ============================================================
CREATE TABLE Announcement (
    announcement_id INT AUTO_INCREMENT,
    description TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    recipient_id INT NOT NULL,
    sender_id INT NOT NULL,
    CONSTRAINT pk_announcement PRIMARY KEY (announcement_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO Announcement (announcement_id, description, created_at, recipient_id, sender_id) VALUES
(1, 'Reminder: Faculty meeting this Friday at 3:00 PM in the main hall.', '2026-06-10 09:00:00', 3, 1),
(2, 'New music sheets are now available at the front desk.', '2026-06-11 10:30:00', 2, 1),
(3, 'Studio 101 will be under maintenance this weekend.', '2026-06-12 14:00:00', 4, 2),
(4, 'Please submit your lesson plans for next month by June 25.', '2026-06-13 08:00:00', 5, 1),
(5, 'Summer workshop registration is now open for all students.', '2026-06-14 11:00:00', 1, 2);

-- ============================================================
-- 15. Room_Schedule
-- ============================================================
CREATE TABLE Room_Schedule (
    room_sched_id INT AUTO_INCREMENT,
    sched_datetime DATETIME NOT NULL,
    sched_type ENUM('lesson', 'booking') NOT NULL,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    room_id INT NOT NULL,
    booking_id INT DEFAULT NULL,
    session_sched_id INT DEFAULT NULL,
    CONSTRAINT pk_room_schedule PRIMARY KEY (room_sched_id),
    CONSTRAINT fk_room_schedule_room FOREIGN KEY (room_id) REFERENCES Room(room_id),
    CONSTRAINT fk_room_schedule_booking FOREIGN KEY (booking_id) REFERENCES Booking(booking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO Room_Schedule (room_sched_id, sched_datetime, sched_type, status, room_id, booking_id, session_sched_id) VALUES
(1, '2026-06-15 09:00:00', 'booking', 'active', 1, 1, NULL),
(2, '2026-06-15 14:00:00', 'booking', 'active', 2, 2, NULL),
(3, '2026-06-16 10:00:00', 'lesson', 'active', 3, NULL, 1),
(4, '2026-06-16 15:00:00', 'booking', 'inactive', 4, 4, NULL),
(5, '2026-06-17 08:00:00', 'lesson', 'active', 5, NULL, 2);

-- ============================================================
-- FOREIGN KEY RELATIONSHIPS SUMMARY
-- ============================================================
-- 1. Staff.role_id → Role.role_id
-- 2. Staff_Auth.staff_id → Staff.staff_id
-- 3. Equipment.category_id → Categories.category_id
-- 4. Equipment_Rate.duration_unit_id → Duration_Unit.duration_unit_id
-- 5. Equipment_Rate.equipment_id → Equipment.equipment_id
-- 6. Room_Rate.duration_unit_id → Duration_Unit.duration_unit_id
-- 7. Room_Rate.room_id → Room.room_id
-- 8. Booking.room_id → Room.room_id
-- 9. Booking.client_id → Client.client_id
-- 10. Billing.client_id → Client.client_id
-- 11. Billing.booking_id → Booking.booking_id
-- 12. Billing.staff_id → Staff.staff_id
-- 13. Payment.billing_id → Billing.billing_id
-- 14. Room_Schedule.room_id → Room.room_id
-- 15. Room_Schedule.booking_id → Booking.booking_id
-- ============================================================