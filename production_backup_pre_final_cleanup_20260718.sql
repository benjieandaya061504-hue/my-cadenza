-- Cadenza Music School - Database Backup (PRE-FINAL CLEANUP)
-- Host: tokaido.proxy.rlwy.net:27711
-- Database: cadenza_music_db
-- Date: 2026-07-18T14:53:03.272Z

CREATE DATABASE IF NOT EXISTS `cadenza_music_db`;
USE `cadenza_music_db`;


-- Table: Role
DROP TABLE IF EXISTS `Role`;
CREATE TABLE `Role` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) NOT NULL,
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `uq_role_name` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `Role` (`role_id`, `role_name`) VALUES (1, 'Admin');
INSERT INTO `Role` (`role_id`, `role_name`) VALUES (2, 'Front Desk');
INSERT INTO `Role` (`role_id`, `role_name`) VALUES (3, 'Instructor');


-- Table: Staff
DROP TABLE IF EXISTS `Staff`;
CREATE TABLE `Staff` (
  `staff_id` int NOT NULL AUTO_INCREMENT,
  `f_name` varchar(50) NOT NULL,
  `m_name` varchar(50) DEFAULT NULL,
  `l_name` varchar(50) NOT NULL,
  `suffix` varchar(10) DEFAULT NULL,
  `address` varchar(255) NOT NULL,
  `age` int NOT NULL,
  `gender` enum('Male','Female','Other') NOT NULL,
  `contact_no` varchar(15) NOT NULL,
  `email` varchar(100) NOT NULL,
  `profile` text,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `role` enum('admin','frontdesk','instructor') NOT NULL,
  PRIMARY KEY (`staff_id`),
  UNIQUE KEY `uq_staff_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `Staff` (`staff_id`, `f_name`, `m_name`, `l_name`, `suffix`, `address`, `age`, `gender`, `contact_no`, `email`, `profile`, `status`, `role`) VALUES (1, 'Juan', 'Dela', 'Cruz', NULL, '123 Rizal St., Manila', 35, 'Male', '09171234567', 'juan.cruz@cadenza.com', NULL, 'active', 'admin');
INSERT INTO `Staff` (`staff_id`, `f_name`, `m_name`, `l_name`, `suffix`, `address`, `age`, `gender`, `contact_no`, `email`, `profile`, `status`, `role`) VALUES (2, 'Maria', 'Luna', 'Santos', NULL, '456 Mabini Ave., Quezon City', 28, 'Female', '09182345678', 'maria.santos@cadenza.com', NULL, 'active', 'frontdesk');
INSERT INTO `Staff` (`staff_id`, `f_name`, `m_name`, `l_name`, `suffix`, `address`, `age`, `gender`, `contact_no`, `email`, `profile`, `status`, `role`) VALUES (3, 'Pedro', NULL, 'Gonzales', NULL, '789 Bonifacio St., Makati', 42, 'Male', '09193456789', 'pedro.gonzales@cadenza.com', 'Senior instructor for piano', 'active', 'instructor');
INSERT INTO `Staff` (`staff_id`, `f_name`, `m_name`, `l_name`, `suffix`, `address`, `age`, `gender`, `contact_no`, `email`, `profile`, `status`, `role`) VALUES (4, 'Ana', 'Reyes', 'Villanueva', NULL, '321 Katipunan Rd., Pasig', 26, 'Female', '09204567890', 'ana.villanueva@cadenza.com', NULL, 'active', 'frontdesk');
INSERT INTO `Staff` (`staff_id`, `f_name`, `m_name`, `l_name`, `suffix`, `address`, `age`, `gender`, `contact_no`, `email`, `profile`, `status`, `role`) VALUES (5, 'Carlos', 'M.', 'Fernandez', NULL, '654 Taft Ave., Manila', 38, 'Male', '09215678901', 'carlos.fernandez@cadenza.com', 'Guitar and voice instructor', 'inactive', 'instructor');
INSERT INTO `Staff` (`staff_id`, `f_name`, `m_name`, `l_name`, `suffix`, `address`, `age`, `gender`, `contact_no`, `email`, `profile`, `status`, `role`) VALUES (6, 'qwe', 'qwe', 'qwe', NULL, 'qeqw', 25, 'Other', '12312312', '12323@gmail.com', NULL, 'active', 'admin');
INSERT INTO `Staff` (`staff_id`, `f_name`, `m_name`, `l_name`, `suffix`, `address`, `age`, `gender`, `contact_no`, `email`, `profile`, `status`, `role`) VALUES (7, 'Jeoan', 'Haha', 'Baha', NULL, 'TBD', 25, 'Other', '141425252', 'jeo@gmail.com', NULL, 'active', 'admin');
INSERT INTO `Staff` (`staff_id`, `f_name`, `m_name`, `l_name`, `suffix`, `address`, `age`, `gender`, `contact_no`, `email`, `profile`, `status`, `role`) VALUES (8, 'Aeron', 'Limo', 'Tiuhuan', NULL, 'tupi', 25, 'Other', '09090909123', 'tiuhuan@gmail.com', NULL, 'active', 'frontdesk');
INSERT INTO `Staff` (`staff_id`, `f_name`, `m_name`, `l_name`, `suffix`, `address`, `age`, `gender`, `contact_no`, `email`, `profile`, `status`, `role`) VALUES (9, 'Lee', NULL, 'Lee', NULL, 'tupi', 25, 'Other', '12321312', 'atanoso@gmail.com', NULL, 'inactive', 'frontdesk');
INSERT INTO `Staff` (`staff_id`, `f_name`, `m_name`, `l_name`, `suffix`, `address`, `age`, `gender`, `contact_no`, `email`, `profile`, `status`, `role`) VALUES (10, 'test user ben login', 'login user', 'qwe', NULL, 'qwe', 25, 'Other', '1234343', 'benjieandeaya061504@gmail.com', NULL, 'active', 'admin');
INSERT INTO `Staff` (`staff_id`, `f_name`, `m_name`, `l_name`, `suffix`, `address`, `age`, `gender`, `contact_no`, `email`, `profile`, `status`, `role`) VALUES (11, 'test user ben login', 'login user', 'qwe', NULL, 'qwe', 25, 'Other', '1234343', 'testuserlogin@gmail.com', NULL, 'active', 'admin');


-- Table: Staff_Auth
DROP TABLE IF EXISTS `Staff_Auth`;
CREATE TABLE `Staff_Auth` (
  `auth_id` int NOT NULL AUTO_INCREMENT,
  `staff_id` int NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `last_login` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`auth_id`),
  UNIQUE KEY `uq_staff_auth_staff_id` (`staff_id`),
  UNIQUE KEY `uq_staff_auth_email` (`email`),
  CONSTRAINT `Staff_Auth_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `Staff` (`staff_id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `Staff_Auth` (`auth_id`, `staff_id`, `email`, `password`, `last_login`, `created_at`, `updated_at`) VALUES (1, 1, 'juan.cruz@cadenza.com', '$2b$10$/o3hoK3AS0qy4y2rhZ5hwO04Ru13T3PeL0TrrJFFF9vXsaTj4koKa', '2026-07-18 06:18:10', '2026-07-10 23:42:21', '2026-07-18 06:18:10');
INSERT INTO `Staff_Auth` (`auth_id`, `staff_id`, `email`, `password`, `last_login`, `created_at`, `updated_at`) VALUES (2, 2, 'maria.santos@cadenza.com', '$2b$10$2efVqJRikxd75Lyx.iBwPuvc2JvQOqVybhewV.jDl.A8Yno18huzG', '2026-07-17 06:10:04', '2026-07-10 23:42:21', '2026-07-17 06:10:04');
INSERT INTO `Staff_Auth` (`auth_id`, `staff_id`, `email`, `password`, `last_login`, `created_at`, `updated_at`) VALUES (3, 3, 'pedro.gonzales@cadenza.com', '$2b$10$SHY18FkFgOqZ28K6ydIrwexRnQWFbGGuuovoC.iHHxHMWErMjiSv.', NULL, '2026-07-10 23:42:21', '2026-07-10 23:42:21');
INSERT INTO `Staff_Auth` (`auth_id`, `staff_id`, `email`, `password`, `last_login`, `created_at`, `updated_at`) VALUES (4, 4, 'ana.villanueva@cadenza.com', '$2b$10$hhahFjWEbIwqLkLLqryCd.pXz03iFTlNWGjvYP/iZankvjqvWKsFG', NULL, '2026-07-10 23:42:21', '2026-07-10 23:42:21');
INSERT INTO `Staff_Auth` (`auth_id`, `staff_id`, `email`, `password`, `last_login`, `created_at`, `updated_at`) VALUES (5, 5, 'carlos.fernandez@cadenza.com', '$2b$10$c42CHuIet2zaeHz0YSUG7OjfI6IhcZkQx9N4dsBWMYbVlnfQjoS3m', NULL, '2026-07-10 23:42:21', '2026-07-10 23:42:21');
INSERT INTO `Staff_Auth` (`auth_id`, `staff_id`, `email`, `password`, `last_login`, `created_at`, `updated_at`) VALUES (6, 6, '12323@gmail.com', '$2b$10$HPCvXgKrY.jwcaOWyuQ/Au5KDbZsY/eqrZQZ41buUnUkbdhJ8QY2W', NULL, '2026-07-11 07:59:10', '2026-07-11 07:59:10');
INSERT INTO `Staff_Auth` (`auth_id`, `staff_id`, `email`, `password`, `last_login`, `created_at`, `updated_at`) VALUES (7, 7, 'jeo@gmail.com', '$2b$10$bm3e2M8B.94BPYhXkUYdpeNKMpAzILFkXb/odfrmNfm5kln9Ls0AK', NULL, '2026-07-11 13:36:51', '2026-07-11 13:36:51');
INSERT INTO `Staff_Auth` (`auth_id`, `staff_id`, `email`, `password`, `last_login`, `created_at`, `updated_at`) VALUES (8, 8, 'tiuhuan@gmail.com', '$2b$10$b61mdmPCNogh0AG4k0wp8.8r/oBI3H5rNT0i9FGHr/mIhgCRF4OBq', '2026-07-12 06:34:05', '2026-07-12 06:32:19', '2026-07-12 06:34:05');
INSERT INTO `Staff_Auth` (`auth_id`, `staff_id`, `email`, `password`, `last_login`, `created_at`, `updated_at`) VALUES (9, 9, 'atanoso@gmail.com', '$2b$10$zRDVRJ6H.40p96mHZkWV0.BEmp1PukECeES7ChEVilct8S6pC960e', '2026-07-16 08:13:33', '2026-07-12 06:40:28', '2026-07-16 08:13:33');
INSERT INTO `Staff_Auth` (`auth_id`, `staff_id`, `email`, `password`, `last_login`, `created_at`, `updated_at`) VALUES (10, 10, 'benjieandeaya061504@gmail.com', '$2b$10$U54cAx/BmhuCRwa79l7auOG6sd62XxebLz0EfEfZHPxH3RGXhQQEq', NULL, '2026-07-17 06:32:26', '2026-07-17 06:32:26');
INSERT INTO `Staff_Auth` (`auth_id`, `staff_id`, `email`, `password`, `last_login`, `created_at`, `updated_at`) VALUES (11, 11, 'testuserlogin@gmail.com', '$2b$10$lT1bvT1YW8QVycF2dkS8vOQkSAKpYv9kesvpyM3.yj8LpKKaeeLS2', NULL, '2026-07-17 06:33:27', '2026-07-17 06:33:27');


-- Table: announcement
DROP TABLE IF EXISTS `announcement`;
CREATE TABLE `announcement` (
  `announcement_id` int NOT NULL AUTO_INCREMENT,
  `description` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `recipient_id` int NOT NULL,
  `sender_id` int NOT NULL,
  PRIMARY KEY (`announcement_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `announcement` (`announcement_id`, `description`, `created_at`, `recipient_id`, `sender_id`) VALUES (1, 'Reminder: Faculty meeting this Friday at 3:00 PM in the main hall.', '2026-06-10 01:00:00', 3, 1);
INSERT INTO `announcement` (`announcement_id`, `description`, `created_at`, `recipient_id`, `sender_id`) VALUES (2, 'New music sheets are now available at the front desk.', '2026-06-11 02:30:00', 2, 1);
INSERT INTO `announcement` (`announcement_id`, `description`, `created_at`, `recipient_id`, `sender_id`) VALUES (3, 'Studio 101 will be under maintenance this weekend.', '2026-06-12 06:00:00', 4, 2);
INSERT INTO `announcement` (`announcement_id`, `description`, `created_at`, `recipient_id`, `sender_id`) VALUES (4, 'Please submit your lesson plans for next month by June 25.', '2026-06-13 00:00:00', 5, 1);
INSERT INTO `announcement` (`announcement_id`, `description`, `created_at`, `recipient_id`, `sender_id`) VALUES (5, 'Summer workshop registration is now open for all students.', '2026-06-14 03:00:00', 1, 2);


-- Table: billing
DROP TABLE IF EXISTS `billing`;
CREATE TABLE `billing` (
  `billing_id` int NOT NULL AUTO_INCREMENT,
  `billing_datetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `total_amount` decimal(10,2) NOT NULL,
  `billing_type` enum('Enrollment Billing','Instrument Billing','Studio Room Billing') NOT NULL,
  `status` enum('Pending','Paid','Partial') NOT NULL DEFAULT 'Pending',
  `client_id` int DEFAULT NULL,
  `enrollment_rate_id` int DEFAULT NULL,
  `booking_id` int DEFAULT NULL,
  `equipment_rental_id` int DEFAULT NULL,
  `staff_id` int NOT NULL,
  PRIMARY KEY (`billing_id`),
  KEY `fk_billing_client` (`client_id`),
  KEY `fk_billing_booking` (`booking_id`),
  KEY `fk_billing_staff` (`staff_id`),
  CONSTRAINT `fk_billing_booking` FOREIGN KEY (`booking_id`) REFERENCES `booking` (`booking_id`),
  CONSTRAINT `fk_billing_client` FOREIGN KEY (`client_id`) REFERENCES `client` (`client_id`),
  CONSTRAINT `fk_billing_staff` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`staff_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `billing` (`billing_id`, `billing_datetime`, `total_amount`, `billing_type`, `status`, `client_id`, `enrollment_rate_id`, `booking_id`, `equipment_rental_id`, `staff_id`) VALUES (1, '2026-06-15 00:30:00', '600.00', 'Studio Room Billing', 'Paid', 1, NULL, 1, NULL, 2);
INSERT INTO `billing` (`billing_id`, `billing_datetime`, `total_amount`, `billing_type`, `status`, `client_id`, `enrollment_rate_id`, `booking_id`, `equipment_rental_id`, `staff_id`) VALUES (2, '2026-06-15 05:45:00', '450.00', 'Studio Room Billing', 'Pending', 2, NULL, 2, NULL, 4);
INSERT INTO `billing` (`billing_id`, `billing_datetime`, `total_amount`, `billing_type`, `status`, `client_id`, `enrollment_rate_id`, `booking_id`, `equipment_rental_id`, `staff_id`) VALUES (3, '2026-06-16 01:15:00', '1500.00', 'Enrollment Billing', 'Paid', 3, 1, NULL, NULL, 1);
INSERT INTO `billing` (`billing_id`, `billing_datetime`, `total_amount`, `billing_type`, `status`, `client_id`, `enrollment_rate_id`, `booking_id`, `equipment_rental_id`, `staff_id`) VALUES (4, '2026-06-16 06:30:00', '200.00', 'Instrument Billing', 'Partial', 4, NULL, NULL, 1, 2);
INSERT INTO `billing` (`billing_id`, `billing_datetime`, `total_amount`, `billing_type`, `status`, `client_id`, `enrollment_rate_id`, `booking_id`, `equipment_rental_id`, `staff_id`) VALUES (5, '2026-06-16 23:45:00', '850.00', 'Studio Room Billing', 'Pending', 5, NULL, 5, NULL, 4);


-- Table: booking
DROP TABLE IF EXISTS `booking`;
CREATE TABLE `booking` (
  `booking_id` int NOT NULL AUTO_INCREMENT,
  `booked_time_start` datetime NOT NULL,
  `booked_time_end` datetime NOT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `room_id` int NOT NULL,
  `client_id` int NOT NULL,
  PRIMARY KEY (`booking_id`),
  KEY `fk_booking_room` (`room_id`),
  KEY `fk_booking_client` (`client_id`),
  CONSTRAINT `fk_booking_client` FOREIGN KEY (`client_id`) REFERENCES `client` (`client_id`),
  CONSTRAINT `fk_booking_room` FOREIGN KEY (`room_id`) REFERENCES `room` (`room_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `booking` (`booking_id`, `booked_time_start`, `booked_time_end`, `status`, `room_id`, `client_id`) VALUES (1, '2026-06-15 01:00:00', '2026-06-15 04:00:00', 'approved', 1, 1);
INSERT INTO `booking` (`booking_id`, `booked_time_start`, `booked_time_end`, `status`, `room_id`, `client_id`) VALUES (2, '2026-06-15 06:00:00', '2026-06-15 09:00:00', 'pending', 2, 2);
INSERT INTO `booking` (`booking_id`, `booked_time_start`, `booked_time_end`, `status`, `room_id`, `client_id`) VALUES (3, '2026-06-16 02:00:00', '2026-06-16 05:00:00', 'approved', 3, 3);
INSERT INTO `booking` (`booking_id`, `booked_time_start`, `booked_time_end`, `status`, `room_id`, `client_id`) VALUES (4, '2026-06-16 07:00:00', '2026-06-16 10:00:00', 'rejected', 4, 4);
INSERT INTO `booking` (`booking_id`, `booked_time_start`, `booked_time_end`, `status`, `room_id`, `client_id`) VALUES (5, '2026-06-17 00:00:00', '2026-06-17 03:00:00', 'pending', 5, 5);


-- Table: categories
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) NOT NULL,
  `brand_name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `categories` (`category_id`, `category_name`, `brand_name`) VALUES (1, 'String Instruments', 'Yamaha');
INSERT INTO `categories` (`category_id`, `category_name`, `brand_name`) VALUES (2, 'Percussion Instruments', 'Roland');
INSERT INTO `categories` (`category_id`, `category_name`, `brand_name`) VALUES (3, 'Wind Instruments', 'Selmer');
INSERT INTO `categories` (`category_id`, `category_name`, `brand_name`) VALUES (4, 'Keyboard Instruments', 'Casio');
INSERT INTO `categories` (`category_id`, `category_name`, `brand_name`) VALUES (5, 'Audio Equipment', 'Shure');


-- Table: client
DROP TABLE IF EXISTS `client`;
CREATE TABLE `client` (
  `client_id` int NOT NULL AUTO_INCREMENT,
  `f_name` varchar(50) NOT NULL,
  `m_name` varchar(50) DEFAULT NULL,
  `l_name` varchar(50) NOT NULL,
  `address` varchar(255) NOT NULL,
  `age` int NOT NULL,
  `gender` enum('Male','Female','Other') NOT NULL,
  `guardian_name` varchar(100) DEFAULT NULL,
  `contact_no` varchar(15) NOT NULL,
  `email` varchar(100) NOT NULL,
  `profile` text,
  PRIMARY KEY (`client_id`),
  UNIQUE KEY `uq_client_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `client` (`client_id`, `f_name`, `m_name`, `l_name`, `address`, `age`, `gender`, `guardian_name`, `contact_no`, `email`, `profile`) VALUES (1, 'John', 'Michael', 'Smith', '100 Main St., BGC', 25, 'Male', NULL, '09123456789', 'john.smith@email.com', 'Professional pianist');
INSERT INTO `client` (`client_id`, `f_name`, `m_name`, `l_name`, `address`, `age`, `gender`, `guardian_name`, `contact_no`, `email`, `profile`) VALUES (2, 'Emily', 'Rose', 'Johnson', '200 Oak Ave., Mandaluyong', 16, 'Female', 'Robert Johnson', '09234567890', 'emily.johnson@email.com', NULL);
INSERT INTO `client` (`client_id`, `f_name`, `m_name`, `l_name`, `address`, `age`, `gender`, `guardian_name`, `contact_no`, `email`, `profile`) VALUES (3, 'David', NULL, 'Brown', '300 Pine Rd., Pasay', 30, 'Male', NULL, '09345678901', 'david.brown@email.com', NULL);
INSERT INTO `client` (`client_id`, `f_name`, `m_name`, `l_name`, `address`, `age`, `gender`, `guardian_name`, `contact_no`, `email`, `profile`) VALUES (4, 'Sophia', 'Marie', 'Davis', '400 Elm St., Makati', 10, 'Female', 'Sarah Davis', '09456789012', 'sophia.davis@email.com', 'Child prodigy - violin');
INSERT INTO `client` (`client_id`, `f_name`, `m_name`, `l_name`, `address`, `age`, `gender`, `guardian_name`, `contact_no`, `email`, `profile`) VALUES (5, 'Michael', 'James', 'Wilson', '500 Cedar Ln., Taguig', 22, 'Male', NULL, '09567890123', 'michael.wilson@email.com', NULL);


-- Table: courses
DROP TABLE IF EXISTS `courses`;
CREATE TABLE `courses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `duration_weeks` int DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `category` varchar(50) DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table: duration_unit
DROP TABLE IF EXISTS `duration_unit`;
CREATE TABLE `duration_unit` (
  `duration_unit_id` int NOT NULL AUTO_INCREMENT,
  `unit_type` enum('Minutes','Hour') NOT NULL,
  PRIMARY KEY (`duration_unit_id`),
  UNIQUE KEY `uq_unit_type` (`unit_type`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `duration_unit` (`duration_unit_id`, `unit_type`) VALUES (1, 'Minutes');
INSERT INTO `duration_unit` (`duration_unit_id`, `unit_type`) VALUES (2, 'Hour');


-- Table: enrollment_rates
DROP TABLE IF EXISTS `enrollment_rates`;
CREATE TABLE `enrollment_rates` (
  `enrollment_rate_id` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `duration_value` int NOT NULL,
  `duration_unit_id` int NOT NULL,
  PRIMARY KEY (`enrollment_rate_id`),
  KEY `fk_enrollment_rates_course` (`course_id`),
  KEY `fk_enrollment_rates_duration_unit` (`duration_unit_id`),
  CONSTRAINT `fk_enrollment_rates_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`),
  CONSTRAINT `fk_enrollment_rates_duration_unit` FOREIGN KEY (`duration_unit_id`) REFERENCES `duration_unit` (`duration_unit_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table: enrollments
DROP TABLE IF EXISTS `enrollments`;
CREATE TABLE `enrollments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `course_id` int DEFAULT NULL,
  `enrollment_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('pending','approved','rejected','active','completed','cancelled') NOT NULL DEFAULT 'pending',
  `notes` text,
  `first_name` varchar(50) DEFAULT NULL,
  `middle_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `suffix` varchar(10) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `contact_number` varchar(15) DEFAULT NULL,
  `student_address` varchar(255) DEFAULT NULL,
  `course_requested` varchar(100) DEFAULT NULL,
  `schedule_requested` text,
  `program_requested` varchar(100) DEFAULT NULL,
  `payment_reference` varchar(100) DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `total_amount` decimal(10,2) DEFAULT NULL,
  `progress_percentage` int DEFAULT '0',
  `instructor_requested` varchar(100) DEFAULT NULL,
  `package_id` int DEFAULT NULL,
  `package_name` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_enrollments_student` (`student_id`),
  KEY `fk_enrollments_course` (`course_id`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `enrollments` (`id`, `student_id`, `course_id`, `enrollment_date`, `status`, `notes`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `student_address`, `course_requested`, `schedule_requested`, `program_requested`, `payment_reference`, `payment_method`, `total_amount`, `progress_percentage`, `instructor_requested`, `package_id`, `package_name`) VALUES (2, 1, NULL, '2026-07-07 16:28:01', 'approved', '{"course":"Piano Lessons","schedule":"Mon/Wed 2-3PM","program":"Beginner"}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `enrollments` (`id`, `student_id`, `course_id`, `enrollment_date`, `status`, `notes`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `student_address`, `course_requested`, `schedule_requested`, `program_requested`, `payment_reference`, `payment_method`, `total_amount`, `progress_percentage`, `instructor_requested`, `package_id`, `package_name`) VALUES (3, 1, NULL, '2026-07-07 16:38:40', 'rejected', '{"course":"Guitar","schedule":"Tue/Thu 4-5PM","program":null}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `enrollments` (`id`, `student_id`, `course_id`, `enrollment_date`, `status`, `notes`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `student_address`, `course_requested`, `schedule_requested`, `program_requested`, `payment_reference`, `payment_method`, `total_amount`, `progress_percentage`, `instructor_requested`, `package_id`, `package_name`) VALUES (7, 13, NULL, '2026-07-08 10:28:11', 'approved', '{"course":null,"schedule":null,"program":null,"signup_first_name":"re","signup_last_name":"rwe"}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `enrollments` (`id`, `student_id`, `course_id`, `enrollment_date`, `status`, `notes`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `student_address`, `course_requested`, `schedule_requested`, `program_requested`, `payment_reference`, `payment_method`, `total_amount`, `progress_percentage`, `instructor_requested`, `package_id`, `package_name`) VALUES (8, 14, NULL, '2026-07-08 10:43:08', 'approved', '{"course":null,"schedule":null,"program":null,"signup_first_name":"tester","signup_last_name":"test"}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `enrollments` (`id`, `student_id`, `course_id`, `enrollment_date`, `status`, `notes`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `student_address`, `course_requested`, `schedule_requested`, `program_requested`, `payment_reference`, `payment_method`, `total_amount`, `progress_percentage`, `instructor_requested`, `package_id`, `package_name`) VALUES (9, 15, NULL, '2026-07-08 10:51:13', 'approved', '{"course":null,"schedule":null,"program":null,"signup_first_name":"jeoan","signup_last_name":"qweqwe"}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `enrollments` (`id`, `student_id`, `course_id`, `enrollment_date`, `status`, `notes`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `student_address`, `course_requested`, `schedule_requested`, `program_requested`, `payment_reference`, `payment_method`, `total_amount`, `progress_percentage`, `instructor_requested`, `package_id`, `package_name`) VALUES (10, 16, NULL, '2026-07-08 14:39:47', 'pending', '{"course":null,"schedule":null,"program":null,"signup_first_name":"qwe","signup_last_name":"qeqwe"}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `enrollments` (`id`, `student_id`, `course_id`, `enrollment_date`, `status`, `notes`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `student_address`, `course_requested`, `schedule_requested`, `program_requested`, `payment_reference`, `payment_method`, `total_amount`, `progress_percentage`, `instructor_requested`, `package_id`, `package_name`) VALUES (11, 17, NULL, '2026-07-08 14:48:11', 'approved', '{"course":null,"schedule":null,"program":null,"signup_first_name":"testing","signup_last_name":"qweqwe"}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `enrollments` (`id`, `student_id`, `course_id`, `enrollment_date`, `status`, `notes`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `student_address`, `course_requested`, `schedule_requested`, `program_requested`, `payment_reference`, `payment_method`, `total_amount`, `progress_percentage`, `instructor_requested`, `package_id`, `package_name`) VALUES (14, 66, NULL, '2026-07-08 16:09:56', 'approved', NULL, 'testing laters', NULL, 'we', NULL, 'weq@gmail.com', '51516', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `enrollments` (`id`, `student_id`, `course_id`, `enrollment_date`, `status`, `notes`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `student_address`, `course_requested`, `schedule_requested`, `program_requested`, `payment_reference`, `payment_method`, `total_amount`, `progress_percentage`, `instructor_requested`, `package_id`, `package_name`) VALUES (15, 67, NULL, '2026-07-08 18:31:10', 'approved', NULL, 'Jeoan', 'Gwyneth Jejemon', 'Gran', 'JR.', 'benjieandaya123061504@gmail.com', '123123', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `enrollments` (`id`, `student_id`, `course_id`, `enrollment_date`, `status`, `notes`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `student_address`, `course_requested`, `schedule_requested`, `program_requested`, `payment_reference`, `payment_method`, `total_amount`, `progress_percentage`, `instructor_requested`, `package_id`, `package_name`) VALUES (16, 1, NULL, '2026-07-08 19:48:57', 'rejected', NULL, NULL, NULL, NULL, NULL, NULL, '09123456789', 'Test Address', 'Piano', '2026-07-15 10:00 - 11:00', 'Beginner', 'REF123', 'GCash', '500.00', 0, NULL, NULL, NULL);
INSERT INTO `enrollments` (`id`, `student_id`, `course_id`, `enrollment_date`, `status`, `notes`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `student_address`, `course_requested`, `schedule_requested`, `program_requested`, `payment_reference`, `payment_method`, `total_amount`, `progress_percentage`, `instructor_requested`, `package_id`, `package_name`) VALUES (17, 5, NULL, '2026-07-08 20:00:53', 'pending', 'Test enrollment', NULL, NULL, NULL, NULL, NULL, '09123456789', 'Test Address', 'Piano', '2026-07-15 10:00 - 11:00', 'Beginner', 'GCashRef12345', 'GCash', '500.00', 0, NULL, NULL, NULL);
INSERT INTO `enrollments` (`id`, `student_id`, `course_id`, `enrollment_date`, `status`, `notes`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `student_address`, `course_requested`, `schedule_requested`, `program_requested`, `payment_reference`, `payment_method`, `total_amount`, `progress_percentage`, `instructor_requested`, `package_id`, `package_name`) VALUES (18, 68, NULL, '2026-07-08 20:05:07', 'pending', NULL, 'qwe', 'qwe', 'qwe', 'er', 'qeqwesq@gmail.com', '3131', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `enrollments` (`id`, `student_id`, `course_id`, `enrollment_date`, `status`, `notes`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `student_address`, `course_requested`, `schedule_requested`, `program_requested`, `payment_reference`, `payment_method`, `total_amount`, `progress_percentage`, `instructor_requested`, `package_id`, `package_name`) VALUES (19, 69, NULL, '2026-07-08 20:10:31', 'approved', NULL, 'Jeoan', 'Gwyneth Jejemon', 'Gran', '123', 'benjieand13123aya123061504@gmail.com', '123123123', '123testing', 'Drums', '2026-07-01 10:00 – 11:00
2026-07-02 10:00 – 11:00
2026-07-03 09:00 – 10:00
2026-07-04 08:00 – 09:00', 'Complete Beginner', '12323', 'GCash', '2000.00', 0, NULL, NULL, NULL);
INSERT INTO `enrollments` (`id`, `student_id`, `course_id`, `enrollment_date`, `status`, `notes`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `student_address`, `course_requested`, `schedule_requested`, `program_requested`, `payment_reference`, `payment_method`, `total_amount`, `progress_percentage`, `instructor_requested`, `package_id`, `package_name`) VALUES (20, 71, NULL, '2026-07-08 21:18:32', 'approved', NULL, 'test', 'with', 'login', 'JR.', 'me123@gmail.com', '12312332', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `enrollments` (`id`, `student_id`, `course_id`, `enrollment_date`, `status`, `notes`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `student_address`, `course_requested`, `schedule_requested`, `program_requested`, `payment_reference`, `payment_method`, `total_amount`, `progress_percentage`, `instructor_requested`, `package_id`, `package_name`) VALUES (21, 72, NULL, '2026-07-08 21:45:38', 'approved', 'yay', 'testpass', 'qwe', 'qwe', 'qwe', 'email123@gmail.com', '123232', 'balay', 'Guitar', '2026-07-01 09:00 – 10:00
2026-07-02 10:00 – 11:00
2026-07-03 13:00 – 14:00
2026-07-04 15:00 – 16:00', 'Some Experience', '12312', 'GCash', '1800.00', 0, NULL, NULL, NULL);
INSERT INTO `enrollments` (`id`, `student_id`, `course_id`, `enrollment_date`, `status`, `notes`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `student_address`, `course_requested`, `schedule_requested`, `program_requested`, `payment_reference`, `payment_method`, `total_amount`, `progress_percentage`, `instructor_requested`, `package_id`, `package_name`) VALUES (22, 73, NULL, '2026-07-08 22:43:22', 'approved', NULL, 'testjeo', 'qw', 'qw', 'Jr.', 'testing@gmail.com', '123123', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `enrollments` (`id`, `student_id`, `course_id`, `enrollment_date`, `status`, `notes`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `student_address`, `course_requested`, `schedule_requested`, `program_requested`, `payment_reference`, `payment_method`, `total_amount`, `progress_percentage`, `instructor_requested`, `package_id`, `package_name`) VALUES (23, 73, NULL, '2026-07-09 06:55:50', 'approved', '21312', 'testjeo', NULL, 'qw', NULL, 'testing@gmail.com', '12312323', '12321323', 'Guitar', '2026-07-01 09:00 – 10:00
2026-07-02 09:00 – 10:00
2026-07-03 09:00 – 10:00
2026-07-04 10:00 – 11:00', 'Advanced', '123123', 'GCash', '1800.00', 0, NULL, NULL, NULL);
INSERT INTO `enrollments` (`id`, `student_id`, `course_id`, `enrollment_date`, `status`, `notes`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `student_address`, `course_requested`, `schedule_requested`, `program_requested`, `payment_reference`, `payment_method`, `total_amount`, `progress_percentage`, `instructor_requested`, `package_id`, `package_name`) VALUES (24, 24, NULL, '2026-07-11 08:40:09', 'approved', 'weqwe', 'testting', 'me', 'benjamin', 'III', 'me@gmail.com', '231231232', 'qwewe', 'Guitar', '2026-07-01 09:00 – 10:00
2026-07-02 10:00 – 11:00
2026-07-03 13:00 – 14:00
2026-07-04 15:00 – 16:00', 'Intermediate', '231', 'GCash', '1800.00', 0, NULL, NULL, NULL);
INSERT INTO `enrollments` (`id`, `student_id`, `course_id`, `enrollment_date`, `status`, `notes`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `student_address`, `course_requested`, `schedule_requested`, `program_requested`, `payment_reference`, `payment_method`, `total_amount`, `progress_percentage`, `instructor_requested`, `package_id`, `package_name`) VALUES (25, 25, NULL, '2026-07-11 08:42:59', 'approved', '$2b$10$tcCuNRHk51lkbF/J1/SD/OqiIcvCyu84eGqv6Zu4qiEMopDEBRfq6', 'wqwe', 'qwe', 'Gran', NULL, 'mee@gmail.com', '12312312', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `enrollments` (`id`, `student_id`, `course_id`, `enrollment_date`, `status`, `notes`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `student_address`, `course_requested`, `schedule_requested`, `program_requested`, `payment_reference`, `payment_method`, `total_amount`, `progress_percentage`, `instructor_requested`, `package_id`, `package_name`) VALUES (26, 26, NULL, '2026-07-12 19:26:07', 'approved', '$2b$10$RkAdK08if.cW4NRWw.Gpc.1no.IM4HHCHurKOuLNHGB8yNE94ltCy', 'login', 'qweqweqwe', 'we', 'we', 'login@gmail.com', '213123', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `enrollments` (`id`, `student_id`, `course_id`, `enrollment_date`, `status`, `notes`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `student_address`, `course_requested`, `schedule_requested`, `program_requested`, `payment_reference`, `payment_method`, `total_amount`, `progress_percentage`, `instructor_requested`, `package_id`, `package_name`) VALUES (27, 27, NULL, '2026-07-12 19:28:45', 'approved', '$2b$10$VV8Qdk3plsObAQuoEOgnxuelvKEB9/ln8oAE5RcgiL27lk8mLUX/q', 'qwe', 'wew', 'eew', 'wqe', 'qwe@gmail.com', '1232', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `enrollments` (`id`, `student_id`, `course_id`, `enrollment_date`, `status`, `notes`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `student_address`, `course_requested`, `schedule_requested`, `program_requested`, `payment_reference`, `payment_method`, `total_amount`, `progress_percentage`, `instructor_requested`, `package_id`, `package_name`) VALUES (28, 28, NULL, '2026-07-12 19:34:46', 'approved', 'no need', 'Alfrancis', 'Alarcon', 'Suico', NULL, 'suico@gmail.com', '09123456543', 'tupi', 'Drums', '2026-07-01 09:00 – 10:00
2026-07-02 09:00 – 10:00
2026-07-03 09:00 – 10:00
2026-07-04 08:00 – 09:00', 'Complete Beginner', '12345678910', 'GCash', '2000.00', 0, NULL, NULL, NULL);
INSERT INTO `enrollments` (`id`, `student_id`, `course_id`, `enrollment_date`, `status`, `notes`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `student_address`, `course_requested`, `schedule_requested`, `program_requested`, `payment_reference`, `payment_method`, `total_amount`, `progress_percentage`, `instructor_requested`, `package_id`, `package_name`) VALUES (29, 29, NULL, '2026-07-12 19:42:19', 'approved', '$2b$10$QEIBcteWdjXWrNHHFmNDX.YRw1wwr8Y7EKqQoyd3ydNlnwKR9W6jC', 'Lee', 'Limo', 'Atanoso', NULL, 'lee@gmail.com', '09090909090', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `enrollments` (`id`, `student_id`, `course_id`, `enrollment_date`, `status`, `notes`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `student_address`, `course_requested`, `schedule_requested`, `program_requested`, `payment_reference`, `payment_method`, `total_amount`, `progress_percentage`, `instructor_requested`, `package_id`, `package_name`) VALUES (30, 29, NULL, '2026-07-12 22:29:13', 'approved', 'dvdfvc', 'Lee', NULL, 'Atanoso', NULL, 'lee@gmail.com', '09090909090', 'tupi', 'Drums', '2026-07-01 10:00 – 11:00
2026-07-02 11:00 – 12:00
2026-07-03 09:00 – 10:00
2026-07-09 08:00 – 09:00', 'Intermediate', '123456789', 'GCash', '2000.00', 0, NULL, NULL, NULL);
INSERT INTO `enrollments` (`id`, `student_id`, `course_id`, `enrollment_date`, `status`, `notes`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `student_address`, `course_requested`, `schedule_requested`, `program_requested`, `payment_reference`, `payment_method`, `total_amount`, `progress_percentage`, `instructor_requested`, `package_id`, `package_name`) VALUES (31, 31, NULL, '2026-07-14 11:11:30', 'rejected', '$2b$10$VGwGXMlLWKynaS119GtO7eUejLdaO3LnCyAiZtEF/Ln.W6J5tKwIO', 'login', 'qweqweqwe', 'we', NULL, 'loginn@gmail.com', '213123', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `enrollments` (`id`, `student_id`, `course_id`, `enrollment_date`, `status`, `notes`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `student_address`, `course_requested`, `schedule_requested`, `program_requested`, `payment_reference`, `payment_method`, `total_amount`, `progress_percentage`, `instructor_requested`, `package_id`, `package_name`) VALUES (32, 26, NULL, '2026-07-15 02:37:12', 'approved', 'asd', 'login', NULL, 'we', NULL, 'login@gmail.com', '09100201019', 'asda', 'Guitar', 'Wednesday, July 1 — 09:00 – 10:00
Thursday, July 2 — 10:00 – 11:00
Friday, July 3 — 13:00 – 14:00
Monday, July 6 — 14:00 – 15:00', 'Advanced', '32543', 'GCash', '1800.00', 0, 'Mark Reyes', NULL, NULL);
INSERT INTO `enrollments` (`id`, `student_id`, `course_id`, `enrollment_date`, `status`, `notes`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `student_address`, `course_requested`, `schedule_requested`, `program_requested`, `payment_reference`, `payment_method`, `total_amount`, `progress_percentage`, `instructor_requested`, `package_id`, `package_name`) VALUES (33, 26, NULL, '2026-07-15 06:16:09', 'approved', NULL, 'login', NULL, 'we', NULL, 'login@gmail.com', NULL, NULL, 'Guitar', 'Wednesday, July 1 — 09:00 – 10:00
Wednesday, July 8 — 11:00 – 12:00
Thursday, July 9 — 14:00 – 15:00
Tuesday, July 7 — 09:00 – 10:00', NULL, '1212312', 'GCash', '1800.00', 0, 'Anna Santos', NULL, NULL);
INSERT INTO `enrollments` (`id`, `student_id`, `course_id`, `enrollment_date`, `status`, `notes`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `student_address`, `course_requested`, `schedule_requested`, `program_requested`, `payment_reference`, `payment_method`, `total_amount`, `progress_percentage`, `instructor_requested`, `package_id`, `package_name`) VALUES (34, 34, NULL, '2026-07-15 11:28:51', 'pending', '132', 'testben2123', 'qwe', 'qwew', 'III', '1234@gmail.com', '21312323', NULL, 'Guitar', 'Thursday, July 2 — 08:00 – 09:00
Wednesday, July 8 — 09:00 – 10:00
Monday, July 6 — 10:00 – 11:00
Thursday, July 9 — 14:00 – 15:00', 'Advanced', '123123', 'GCash', '1800.00', 0, 'Sofia Gomez', NULL, NULL);
INSERT INTO `enrollments` (`id`, `student_id`, `course_id`, `enrollment_date`, `status`, `notes`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `student_address`, `course_requested`, `schedule_requested`, `program_requested`, `payment_reference`, `payment_method`, `total_amount`, `progress_percentage`, `instructor_requested`, `package_id`, `package_name`) VALUES (35, 35, NULL, '2026-07-15 22:27:07', 'pending', '$2b$10$BtYlWQP/JBPgPGGptNbvpeWk06lukiCWN/cCIr4BLVhW4ePZBOqAq', 'login', 'qweqweqwe', 'we', 'III', 'loginnn@gmail.com', '213123', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `enrollments` (`id`, `student_id`, `course_id`, `enrollment_date`, `status`, `notes`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `student_address`, `course_requested`, `schedule_requested`, `program_requested`, `payment_reference`, `payment_method`, `total_amount`, `progress_percentage`, `instructor_requested`, `package_id`, `package_name`) VALUES (36, 36, NULL, '2026-07-15 23:57:33', 'pending', '$2b$10$6rnI2DhYVTV22mZGjaHJWOMiTBXB9Ufkq3/mPLn6nxzDky7sdpY0S', 'rental test', 'testing m', 'test l', 'III', 'rental@gmail.com', '1231231', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `enrollments` (`id`, `student_id`, `course_id`, `enrollment_date`, `status`, `notes`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `student_address`, `course_requested`, `schedule_requested`, `program_requested`, `payment_reference`, `payment_method`, `total_amount`, `progress_percentage`, `instructor_requested`, `package_id`, `package_name`) VALUES (37, 29, NULL, '2026-07-16 08:23:24', 'approved', 'hehe', 'Lee', NULL, 'Atanoso', NULL, 'lee@gmail.com', '09509396360', 'marbel', 'testing i input the  price 1000', 'Wednesday, July 1 — 09:00 – 10:00
Thursday, July 2 — 09:00 – 10:00
Friday, July 3 — 09:00 – 10:00
Saturday, July 4 — 10:00 – 11:00
Sunday, July 5 — 08:00 – 09:00
Monday, July 6 — 09:00 – 10:00
Tuesday, July 7 — 10:00 – 11:00
Wednesday, July 8 — 11:00 – 12:00', 'Some Experience', '12345', 'GCash', '1000.00', 0, 'Mark Reyes', 7, 'testing i input the  price 1000');
INSERT INTO `enrollments` (`id`, `student_id`, `course_id`, `enrollment_date`, `status`, `notes`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `student_address`, `course_requested`, `schedule_requested`, `program_requested`, `payment_reference`, `payment_method`, `total_amount`, `progress_percentage`, `instructor_requested`, `package_id`, `package_name`) VALUES (38, 29, NULL, '2026-07-16 08:27:05', 'pending', 'asdadasd', 'Lee', NULL, 'Atanoso', NULL, 'lee@gmail.com', '09123456543', 'tampakan', 'test 1000 2', 'Wednesday, July 1 — 09:00 – 10:00
Thursday, July 2 — 10:00 – 11:00
Friday, July 3 — 13:00 – 14:00
Saturday, July 4 — 10:00 – 11:00
Sunday, July 5 — 10:00 – 11:00
Monday, July 6 — 10:00 – 11:00
Tuesday, July 7 — 10:00 – 11:00
Wednesday, July 8 — 11:00 – 12:00', 'Advanced', '09876', NULL, '2.00', 0, 'Anna Santos', 6, 'test 1000 2');
INSERT INTO `enrollments` (`id`, `student_id`, `course_id`, `enrollment_date`, `status`, `notes`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `student_address`, `course_requested`, `schedule_requested`, `program_requested`, `payment_reference`, `payment_method`, `total_amount`, `progress_percentage`, `instructor_requested`, `package_id`, `package_name`) VALUES (39, 26, NULL, '2026-07-16 09:14:25', 'pending', 'qweq', 'login', NULL, 'we', NULL, 'login@gmail.com', '213123', NULL, 'testing i input the  price 1000', 'Wednesday, July 1 — 09:00 – 10:00
Thursday, July 2 — 09:00 – 10:00
Thursday, July 9 — 09:00 – 10:00
Wednesday, July 8 — 11:00 – 12:00', 'Intermediate', '131231', 'GCash', '1000.00', 0, 'Anna Santos', 7, 'testing i input the  price 1000');
INSERT INTO `enrollments` (`id`, `student_id`, `course_id`, `enrollment_date`, `status`, `notes`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `student_address`, `course_requested`, `schedule_requested`, `program_requested`, `payment_reference`, `payment_method`, `total_amount`, `progress_percentage`, `instructor_requested`, `package_id`, `package_name`) VALUES (40, 40, NULL, '2026-07-17 05:42:46', 'approved', '$2b$10$aE9InoMRhvXgqlmqHh5JuOP3OSxxNI41y2xWrMxxZCrMLp1bAKIS2', 'Hanz benjie', 'Reyes', 'Andaya', 'N/A', 'hanzbenjieandaya@gmail.com', '09510886280', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);


-- Table: equipment
DROP TABLE IF EXISTS `equipment`;
CREATE TABLE `equipment` (
  `equipment_id` varchar(10) NOT NULL,
  `eqp_name` varchar(100) NOT NULL,
  `brand_name` varchar(100) NOT NULL,
  `quantity` int NOT NULL DEFAULT '0',
  `category_id` int NOT NULL,
  PRIMARY KEY (`equipment_id`),
  KEY `fk_equipment_category` (`category_id`),
  CONSTRAINT `fk_equipment_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `equipment` (`equipment_id`, `eqp_name`, `brand_name`, `quantity`, `category_id`) VALUES ('EQP-001', 'Acoustic Guitar', 'Yamaha', 10, 1);
INSERT INTO `equipment` (`equipment_id`, `eqp_name`, `brand_name`, `quantity`, `category_id`) VALUES ('EQP-002', 'Electric Drum Kit', 'Roland', 5, 2);
INSERT INTO `equipment` (`equipment_id`, `eqp_name`, `brand_name`, `quantity`, `category_id`) VALUES ('EQP-003', 'Saxophone', 'Selmer', 3, 3);
INSERT INTO `equipment` (`equipment_id`, `eqp_name`, `brand_name`, `quantity`, `category_id`) VALUES ('EQP-004', 'Digital Piano', 'Casio', 8, 4);
INSERT INTO `equipment` (`equipment_id`, `eqp_name`, `brand_name`, `quantity`, `category_id`) VALUES ('EQP-005', 'Microphone', 'Shure', 15, 5);


-- Table: equipment_rate
DROP TABLE IF EXISTS `equipment_rate`;
CREATE TABLE `equipment_rate` (
  `equipment_rate_id` int NOT NULL AUTO_INCREMENT,
  `amount` decimal(10,2) NOT NULL,
  `duration_value` int NOT NULL,
  `duration_unit_id` int NOT NULL,
  `equipment_id` varchar(10) NOT NULL,
  PRIMARY KEY (`equipment_rate_id`),
  KEY `fk_equipment_rate_duration_unit` (`duration_unit_id`),
  KEY `fk_equipment_rate_equipment` (`equipment_id`),
  CONSTRAINT `fk_equipment_rate_duration_unit` FOREIGN KEY (`duration_unit_id`) REFERENCES `duration_unit` (`duration_unit_id`),
  CONSTRAINT `fk_equipment_rate_equipment` FOREIGN KEY (`equipment_id`) REFERENCES `equipment` (`equipment_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `equipment_rate` (`equipment_rate_id`, `amount`, `duration_value`, `duration_unit_id`, `equipment_id`) VALUES (1, '150.00', 30, 1, 'EQP-001');
INSERT INTO `equipment_rate` (`equipment_rate_id`, `amount`, `duration_value`, `duration_unit_id`, `equipment_id`) VALUES (2, '200.00', 60, 1, 'EQP-002');
INSERT INTO `equipment_rate` (`equipment_rate_id`, `amount`, `duration_value`, `duration_unit_id`, `equipment_id`) VALUES (3, '250.00', 60, 1, 'EQP-003');
INSERT INTO `equipment_rate` (`equipment_rate_id`, `amount`, `duration_value`, `duration_unit_id`, `equipment_id`) VALUES (4, '180.00', 30, 1, 'EQP-004');
INSERT INTO `equipment_rate` (`equipment_rate_id`, `amount`, `duration_value`, `duration_unit_id`, `equipment_id`) VALUES (5, '100.00', 60, 1, 'EQP-005');


-- Table: instructors
DROP TABLE IF EXISTS `instructors`;
CREATE TABLE `instructors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `contact_number` varchar(15) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `specialization` varchar(100) DEFAULT NULL,
  `bio` text,
  `hourly_rate` decimal(10,2) DEFAULT '0.00',
  `commission_percentage` decimal(5,2) DEFAULT '0.00',
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_instructors_email` (`email`),
  KEY `fk_instructors_user` (`user_id`),
  CONSTRAINT `fk_instructors_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table: instrument_rentals
DROP TABLE IF EXISTS `instrument_rentals`;
CREATE TABLE `instrument_rentals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `equipment_id` varchar(10) NOT NULL,
  `client_id` int DEFAULT NULL,
  `rental_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `return_date` datetime DEFAULT NULL,
  `status` enum('pending','approved','rejected','active','returned','overdue') NOT NULL DEFAULT 'pending',
  `student_id` int NOT NULL DEFAULT '0',
  `instrument_id` varchar(10) DEFAULT NULL,
  `renter_name` varchar(100) NOT NULL DEFAULT '',
  `contact_number` varchar(15) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `rental_start_date` date NOT NULL,
  `rental_end_date` date DEFAULT NULL,
  `duration_months` int DEFAULT '1',
  `monthly_rate` decimal(10,2) NOT NULL DEFAULT '0.00',
  `deposit_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_reference` varchar(100) DEFAULT NULL,
  `notes` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_equipment_rentals_equipment` (`equipment_id`),
  KEY `fk_equipment_rentals_client` (`client_id`),
  CONSTRAINT `fk_equipment_rentals_client` FOREIGN KEY (`client_id`) REFERENCES `client` (`client_id`),
  CONSTRAINT `fk_equipment_rentals_equipment` FOREIGN KEY (`equipment_id`) REFERENCES `equipment` (`equipment_id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `instrument_rentals` (`id`, `equipment_id`, `client_id`, `rental_date`, `return_date`, `status`, `student_id`, `instrument_id`, `renter_name`, `contact_number`, `email`, `address`, `rental_start_date`, `rental_end_date`, `duration_months`, `monthly_rate`, `deposit_amount`, `total_amount`, `payment_method`, `payment_reference`, `notes`, `created_at`, `updated_at`) VALUES (3, 'EQP-001', 3, '2026-07-14 11:41:36', NULL, 'pending', 0, '1', 'Test User', '123', 'test@example.com', 'Test', '2026-07-14 16:00:00', NULL, 1, '500.00', '1000.00', '500.00', 'cash', NULL, NULL, '2026-07-14 11:41:36', '2026-07-14 11:41:36');
INSERT INTO `instrument_rentals` (`id`, `equipment_id`, `client_id`, `rental_date`, `return_date`, `status`, `student_id`, `instrument_id`, `renter_name`, `contact_number`, `email`, `address`, `rental_start_date`, `rental_end_date`, `duration_months`, `monthly_rate`, `deposit_amount`, `total_amount`, `payment_method`, `payment_reference`, `notes`, `created_at`, `updated_at`) VALUES (20, 'EQP-002', NULL, '2026-07-15 23:26:47', NULL, 'approved', 26, 'EQP-002', 'qwe', '1234343', 'login@gmail.com', '123123', '2026-03-14 16:00:00', NULL, 1, '800.00', '1500.00', '800.00', NULL, NULL, NULL, '2026-07-15 23:26:47', '2026-07-15 23:54:22');
INSERT INTO `instrument_rentals` (`id`, `equipment_id`, `client_id`, `rental_date`, `return_date`, `status`, `student_id`, `instrument_id`, `renter_name`, `contact_number`, `email`, `address`, `rental_start_date`, `rental_end_date`, `duration_months`, `monthly_rate`, `deposit_amount`, `total_amount`, `payment_method`, `payment_reference`, `notes`, `created_at`, `updated_at`) VALUES (21, 'EQP-005', NULL, '2026-07-15 23:58:03', NULL, 'rejected', 36, 'EQP-005', 'rental test', '12312312', 'rental@gmail.com', 'housee', '2026-03-14 16:00:00', NULL, 1, '650.00', '1200.00', '650.00', NULL, NULL, NULL, '2026-07-15 23:58:03', '2026-07-16 09:16:53');
INSERT INTO `instrument_rentals` (`id`, `equipment_id`, `client_id`, `rental_date`, `return_date`, `status`, `student_id`, `instrument_id`, `renter_name`, `contact_number`, `email`, `address`, `rental_start_date`, `rental_end_date`, `duration_months`, `monthly_rate`, `deposit_amount`, `total_amount`, `payment_method`, `payment_reference`, `notes`, `created_at`, `updated_at`) VALUES (22, 'EQP-001', NULL, '2026-07-16 08:12:38', NULL, 'approved', 29, 'EQP-001', 'Christian Lee Atanoso', '09123456765', 'lee@gmail.com', 'Tupi', '2026-03-14 16:00:00', NULL, 1, '500.00', '1000.00', '500.00', NULL, NULL, NULL, '2026-07-16 08:12:38', '2026-07-16 08:13:47');
INSERT INTO `instrument_rentals` (`id`, `equipment_id`, `client_id`, `rental_date`, `return_date`, `status`, `student_id`, `instrument_id`, `renter_name`, `contact_number`, `email`, `address`, `rental_start_date`, `rental_end_date`, `duration_months`, `monthly_rate`, `deposit_amount`, `total_amount`, `payment_method`, `payment_reference`, `notes`, `created_at`, `updated_at`) VALUES (23, 'EQP-001', NULL, '2026-07-16 08:35:37', NULL, 'pending', 29, 'EQP-001', 'Leo Atanoso', '09509396345', 'lee@gmail.com', 'marbs', '2026-03-14 16:00:00', NULL, 1, '500.00', '1000.00', '500.00', NULL, NULL, NULL, '2026-07-16 08:35:37', '2026-07-16 08:35:37');
INSERT INTO `instrument_rentals` (`id`, `equipment_id`, `client_id`, `rental_date`, `return_date`, `status`, `student_id`, `instrument_id`, `renter_name`, `contact_number`, `email`, `address`, `rental_start_date`, `rental_end_date`, `duration_months`, `monthly_rate`, `deposit_amount`, `total_amount`, `payment_method`, `payment_reference`, `notes`, `created_at`, `updated_at`) VALUES (24, 'EQP-001', NULL, '2026-07-16 20:44:53', NULL, 'pending', 29, 'EQP-001', 'Christian Atanoso', '09509396389', 'lee@gmail.com', 'marbel', '2026-07-17 16:00:00', NULL, 1, '500.00', '1000.00', '500.00', NULL, NULL, NULL, '2026-07-16 20:44:53', '2026-07-16 20:44:53');


-- Table: lesson_packages
DROP TABLE IF EXISTS `lesson_packages`;
CREATE TABLE `lesson_packages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `duration_minutes` int NOT NULL DEFAULT '45',
  `session_limit` int NOT NULL DEFAULT '8',
  `category_kind` enum('instrument','course') NOT NULL DEFAULT 'instrument',
  `category` varchar(100) NOT NULL,
  `description` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `rate` decimal(10,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `lesson_packages` (`id`, `name`, `duration_minutes`, `session_limit`, `category_kind`, `category`, `description`, `created_at`, `updated_at`, `rate`) VALUES (5, 'test 3', 45, 8, 'instrument', 'Voice', NULL, '2026-07-16 07:49:24', '2026-07-16 07:49:24', '21212.00');
INSERT INTO `lesson_packages` (`id`, `name`, `duration_minutes`, `session_limit`, `category_kind`, `category`, `description`, `created_at`, `updated_at`, `rate`) VALUES (6, 'test 1000 2', 45, 8, 'instrument', 'Guitar', NULL, '2026-07-16 07:50:57', '2026-07-16 07:50:57', '2.00');
INSERT INTO `lesson_packages` (`id`, `name`, `duration_minutes`, `session_limit`, `category_kind`, `category`, `description`, `created_at`, `updated_at`, `rate`) VALUES (7, 'testing i input the  price 1000', 55, 4, 'instrument', 'Guitar', NULL, '2026-07-16 07:51:47', '2026-07-16 09:13:03', '1000.00');


-- Table: lessons
DROP TABLE IF EXISTS `lessons`;
CREATE TABLE `lessons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `enrollment_id` int NOT NULL,
  `instructor_id` int NOT NULL,
  `scheduled_date` datetime NOT NULL,
  `duration_minutes` int NOT NULL,
  `status` enum('scheduled','completed','cancelled','no_show') NOT NULL DEFAULT 'scheduled',
  `notes` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_lessons_enrollment` (`enrollment_id`),
  KEY `fk_lessons_instructor` (`instructor_id`),
  CONSTRAINT `fk_lessons_enrollment` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments` (`id`),
  CONSTRAINT `fk_lessons_instructor` FOREIGN KEY (`instructor_id`) REFERENCES `instructors` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table: payment
DROP TABLE IF EXISTS `payment`;
CREATE TABLE `payment` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `total_amount` decimal(10,2) NOT NULL,
  `reference` varchar(50) NOT NULL,
  `cash` decimal(10,2) NOT NULL,
  `change_amount` decimal(10,2) NOT NULL,
  `date_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `payment_type` enum('cash','gcash','maya') NOT NULL,
  `billing_id` int NOT NULL,
  PRIMARY KEY (`payment_id`),
  UNIQUE KEY `uq_payment_reference` (`reference`),
  KEY `fk_payment_billing` (`billing_id`),
  CONSTRAINT `fk_payment_billing` FOREIGN KEY (`billing_id`) REFERENCES `billing` (`billing_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `payment` (`payment_id`, `total_amount`, `reference`, `cash`, `change_amount`, `date_time`, `payment_type`, `billing_id`) VALUES (1, '600.00', '1000188336470', '600.00', '0.00', '2026-06-15 00:35:00', 'cash', 1);
INSERT INTO `payment` (`payment_id`, `total_amount`, `reference`, `cash`, `change_amount`, `date_time`, `payment_type`, `billing_id`) VALUES (2, '1500.00', '1000188336471', '1500.00', '0.00', '2026-06-16 01:20:00', 'cash', 3);
INSERT INTO `payment` (`payment_id`, `total_amount`, `reference`, `cash`, `change_amount`, `date_time`, `payment_type`, `billing_id`) VALUES (3, '100.00', '1000188336472', '200.00', '100.00', '2026-06-16 06:45:00', 'cash', 4);
INSERT INTO `payment` (`payment_id`, `total_amount`, `reference`, `cash`, `change_amount`, `date_time`, `payment_type`, `billing_id`) VALUES (4, '450.00', '1000188336473', '450.00', '0.00', '2026-06-17 02:00:00', 'gcash', 2);
INSERT INTO `payment` (`payment_id`, `total_amount`, `reference`, `cash`, `change_amount`, `date_time`, `payment_type`, `billing_id`) VALUES (5, '850.00', '1000188336474', '1000.00', '150.00', '2026-06-17 00:00:00', 'maya', 5);


-- Table: role
DROP TABLE IF EXISTS `role`;
CREATE TABLE `role` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) NOT NULL,
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `uq_role_name` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `role` (`role_id`, `role_name`) VALUES (1, 'Admin');
INSERT INTO `role` (`role_id`, `role_name`) VALUES (2, 'Front Desk');
INSERT INTO `role` (`role_id`, `role_name`) VALUES (3, 'Instructor');


-- Table: room
DROP TABLE IF EXISTS `room`;
CREATE TABLE `room` (
  `room_id` int NOT NULL AUTO_INCREMENT,
  `room_no` varchar(20) NOT NULL,
  `room_type` enum('VIP','Regular') NOT NULL,
  `room_capacity` int NOT NULL,
  PRIMARY KEY (`room_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `room` (`room_id`, `room_no`, `room_type`, `room_capacity`) VALUES (1, '101', 'VIP', 7);
INSERT INTO `room` (`room_id`, `room_no`, `room_type`, `room_capacity`) VALUES (2, '102', 'Regular', 5);
INSERT INTO `room` (`room_id`, `room_no`, `room_type`, `room_capacity`) VALUES (3, '103', 'VIP', 7);
INSERT INTO `room` (`room_id`, `room_no`, `room_type`, `room_capacity`) VALUES (4, '104', 'Regular', 5);
INSERT INTO `room` (`room_id`, `room_no`, `room_type`, `room_capacity`) VALUES (5, '105', 'VIP', 7);


-- Table: room_rate
DROP TABLE IF EXISTS `room_rate`;
CREATE TABLE `room_rate` (
  `room_rate_id` int NOT NULL AUTO_INCREMENT,
  `room_type` enum('VIP','Regular') NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `duration_value` int NOT NULL,
  `duration_unit_id` int NOT NULL,
  `room_id` int NOT NULL,
  PRIMARY KEY (`room_rate_id`),
  KEY `fk_room_rate_duration_unit` (`duration_unit_id`),
  KEY `fk_room_rate_room` (`room_id`),
  CONSTRAINT `fk_room_rate_duration_unit` FOREIGN KEY (`duration_unit_id`) REFERENCES `duration_unit` (`duration_unit_id`),
  CONSTRAINT `fk_room_rate_room` FOREIGN KEY (`room_id`) REFERENCES `room` (`room_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `room_rate` (`room_rate_id`, `room_type`, `amount`, `duration_value`, `duration_unit_id`, `room_id`) VALUES (1, 'Regular', '450.00', 3, 2, 2);
INSERT INTO `room_rate` (`room_rate_id`, `room_type`, `amount`, `duration_value`, `duration_unit_id`, `room_id`) VALUES (2, 'VIP', '600.00', 6, 2, 1);
INSERT INTO `room_rate` (`room_rate_id`, `room_type`, `amount`, `duration_value`, `duration_unit_id`, `room_id`) VALUES (3, 'Regular', '850.00', 12, 2, 4);


-- Table: room_schedule
DROP TABLE IF EXISTS `room_schedule`;
CREATE TABLE `room_schedule` (
  `room_sched_id` int NOT NULL AUTO_INCREMENT,
  `sched_datetime` datetime NOT NULL,
  `sched_type` enum('lesson','booking') NOT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `room_id` int NOT NULL,
  `booking_id` int DEFAULT NULL,
  `session_sched_id` int DEFAULT NULL,
  PRIMARY KEY (`room_sched_id`),
  KEY `fk_room_schedule_room` (`room_id`),
  KEY `fk_room_schedule_booking` (`booking_id`),
  CONSTRAINT `fk_room_schedule_booking` FOREIGN KEY (`booking_id`) REFERENCES `booking` (`booking_id`),
  CONSTRAINT `fk_room_schedule_room` FOREIGN KEY (`room_id`) REFERENCES `room` (`room_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `room_schedule` (`room_sched_id`, `sched_datetime`, `sched_type`, `status`, `room_id`, `booking_id`, `session_sched_id`) VALUES (1, '2026-06-15 01:00:00', 'booking', 'active', 1, 1, NULL);
INSERT INTO `room_schedule` (`room_sched_id`, `sched_datetime`, `sched_type`, `status`, `room_id`, `booking_id`, `session_sched_id`) VALUES (2, '2026-06-15 06:00:00', 'booking', 'active', 2, 2, NULL);
INSERT INTO `room_schedule` (`room_sched_id`, `sched_datetime`, `sched_type`, `status`, `room_id`, `booking_id`, `session_sched_id`) VALUES (3, '2026-06-16 02:00:00', 'lesson', 'active', 3, NULL, 1);
INSERT INTO `room_schedule` (`room_sched_id`, `sched_datetime`, `sched_type`, `status`, `room_id`, `booking_id`, `session_sched_id`) VALUES (4, '2026-06-16 07:00:00', 'booking', 'inactive', 4, 4, NULL);
INSERT INTO `room_schedule` (`room_sched_id`, `sched_datetime`, `sched_type`, `status`, `room_id`, `booking_id`, `session_sched_id`) VALUES (5, '2026-06-17 00:00:00', 'lesson', 'active', 5, NULL, 2);


-- Table: session_schedule
DROP TABLE IF EXISTS `session_schedule`;
CREATE TABLE `session_schedule` (
  `session_sched_id` int NOT NULL AUTO_INCREMENT,
  `enrollment_id` int DEFAULT NULL,
  `instructor_id` int NOT NULL,
  `scheduled_date` datetime NOT NULL,
  `duration_minutes` int NOT NULL,
  `status` enum('scheduled','completed','cancelled') NOT NULL DEFAULT 'scheduled',
  `notes` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`session_sched_id`),
  KEY `fk_session_schedule_enrollment` (`enrollment_id`),
  KEY `fk_session_schedule_instructor` (`instructor_id`),
  CONSTRAINT `fk_session_schedule_enrollment` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_session_schedule_instructor` FOREIGN KEY (`instructor_id`) REFERENCES `instructors` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table: staff
DROP TABLE IF EXISTS `staff`;
CREATE TABLE `staff` (
  `staff_id` int NOT NULL AUTO_INCREMENT,
  `f_name` varchar(50) NOT NULL,
  `m_name` varchar(50) DEFAULT NULL,
  `l_name` varchar(50) NOT NULL,
  `suffix` varchar(10) DEFAULT NULL,
  `address` varchar(255) NOT NULL,
  `age` int NOT NULL,
  `gender` enum('Male','Female','Other') NOT NULL,
  `contact_no` varchar(15) NOT NULL,
  `email` varchar(100) NOT NULL,
  `profile` text,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `role_id` int NOT NULL,
  PRIMARY KEY (`staff_id`),
  KEY `fk_staff_role` (`role_id`),
  CONSTRAINT `fk_staff_role` FOREIGN KEY (`role_id`) REFERENCES `role` (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `staff` (`staff_id`, `f_name`, `m_name`, `l_name`, `suffix`, `address`, `age`, `gender`, `contact_no`, `email`, `profile`, `status`, `role_id`) VALUES (1, 'Juan', 'Dela', 'Cruz', NULL, '123 Rizal St., Manila', 35, 'Male', '09171234567', '', NULL, 'active', 1);
INSERT INTO `staff` (`staff_id`, `f_name`, `m_name`, `l_name`, `suffix`, `address`, `age`, `gender`, `contact_no`, `email`, `profile`, `status`, `role_id`) VALUES (2, 'Maria', 'Luna', 'Santos', NULL, '456 Mabini Ave., Quezon City', 28, 'Female', '09182345678', '', NULL, 'active', 2);
INSERT INTO `staff` (`staff_id`, `f_name`, `m_name`, `l_name`, `suffix`, `address`, `age`, `gender`, `contact_no`, `email`, `profile`, `status`, `role_id`) VALUES (3, 'Pedro', NULL, 'Gonzales', NULL, '789 Bonifacio St., Makati', 42, 'Male', '09193456789', '', 'Senior instructor for piano', 'active', 3);
INSERT INTO `staff` (`staff_id`, `f_name`, `m_name`, `l_name`, `suffix`, `address`, `age`, `gender`, `contact_no`, `email`, `profile`, `status`, `role_id`) VALUES (4, 'Ana', 'Reyes', 'Villanueva', NULL, '321 Katipunan Rd., Pasig', 26, 'Female', '09204567890', '', NULL, 'active', 2);
INSERT INTO `staff` (`staff_id`, `f_name`, `m_name`, `l_name`, `suffix`, `address`, `age`, `gender`, `contact_no`, `email`, `profile`, `status`, `role_id`) VALUES (5, 'Carlos', 'M.', 'Fernandez', NULL, '654 Taft Ave., Manila', 38, 'Male', '09215678901', '', 'Guitar and voice instructor', 'active', 3);
INSERT INTO `staff` (`staff_id`, `f_name`, `m_name`, `l_name`, `suffix`, `address`, `age`, `gender`, `contact_no`, `email`, `profile`, `status`, `role_id`) VALUES (6, 'Jeoan', 'Gwyneth Jejemon', 'Gran', NULL, 'qwe', 25, 'Other', '09123456789', 'grannnn@gmail.com', NULL, 'active', 1);
INSERT INTO `staff` (`staff_id`, `f_name`, `m_name`, `l_name`, `suffix`, `address`, `age`, `gender`, `contact_no`, `email`, `profile`, `status`, `role_id`) VALUES (7, '1', '2', '3', 'III', '123', 25, 'Other', '09123456789', '123qweqeq@gmail.com', NULL, 'active', 1);
INSERT INTO `staff` (`staff_id`, `f_name`, `m_name`, `l_name`, `suffix`, `address`, `age`, `gender`, `contact_no`, `email`, `profile`, `status`, `role_id`) VALUES (8, '2312312', '312312312', '23122da', 'III', '12312321312', 25, 'Other', 'weweweqw123213', 'qwee2@gmail.com', NULL, 'active', 2);
INSERT INTO `staff` (`staff_id`, `f_name`, `m_name`, `l_name`, `suffix`, `address`, `age`, `gender`, `contact_no`, `email`, `profile`, `status`, `role_id`) VALUES (9, 'asdasdas', 'dasd', 'asdasdasd', 'Sr.', 'sadasdasdasd', 25, 'Other', '123123123', 'sadadsd@gmail.com', NULL, 'active', 2);
INSERT INTO `staff` (`staff_id`, `f_name`, `m_name`, `l_name`, `suffix`, `address`, `age`, `gender`, `contact_no`, `email`, `profile`, `status`, `role_id`) VALUES (10, 'firstname', 'mid', 'last', 'III', 'qweqweqwe', 25, 'Other', '09123456789', '123@gmail.com', NULL, 'active', 1);
INSERT INTO `staff` (`staff_id`, `f_name`, `m_name`, `l_name`, `suffix`, `address`, `age`, `gender`, `contact_no`, `email`, `profile`, `status`, `role_id`) VALUES (11, 'qweqwe', 'qwewe', 'qwewe', NULL, 'weqweqeqwe', 25, 'Other', '12323123', 'wqwe@gmail.com', NULL, 'active', 1);
INSERT INTO `staff` (`staff_id`, `f_name`, `m_name`, `l_name`, `suffix`, `address`, `age`, `gender`, `contact_no`, `email`, `profile`, `status`, `role_id`) VALUES (12, 'Jeoan Gwyneth', 'Dajay', 'Gran', NULL, 'Lapu-Lapu St., Purok Makisama, Brgy. Zone III, City of Koronadal, South Cotabato', 25, 'Other', '091279772545', 'gwynwerpa17@gmail.com', NULL, 'active', 2);
INSERT INTO `staff` (`staff_id`, `f_name`, `m_name`, `l_name`, `suffix`, `address`, `age`, `gender`, `contact_no`, `email`, `profile`, `status`, `role_id`) VALUES (13, 'sd', 'Dajay', 'Gran', NULL, 'Lapu-Lapu St., Purok Makisama, Brgy. Zone III, City of Koronadal, South Cotabato', 25, 'Other', '091279772545', 'gwynwerpsdaa17@gmail.com', NULL, 'active', 1);
INSERT INTO `staff` (`staff_id`, `f_name`, `m_name`, `l_name`, `suffix`, `address`, `age`, `gender`, `contact_no`, `email`, `profile`, `status`, `role_id`) VALUES (14, 'qwqe', 'qw', 'qw', 'Sr.', 'daw', 25, 'Other', '234234', '123123wqw21@gmail.com', NULL, 'active', 1);
INSERT INTO `staff` (`staff_id`, `f_name`, `m_name`, `l_name`, `suffix`, `address`, `age`, `gender`, `contact_no`, `email`, `profile`, `status`, `role_id`) VALUES (15, 'testetst', 'asass', 'assasa', 'Jr.', '12121', 25, 'Other', '13221', 'saassasa@gmail.com', NULL, 'active', 1);


-- Table: students
DROP TABLE IF EXISTS `students`;
CREATE TABLE `students` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `first_name` varchar(50) NOT NULL,
  `middle_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) NOT NULL,
  `suffix` varchar(10) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `contact_number` varchar(15) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT 'other',
  `emergency_contact_name` varchar(100) DEFAULT NULL,
  `emergency_contact_number` varchar(15) DEFAULT NULL,
  `medical_notes` text,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_students_email` (`email`),
  KEY `fk_students_user` (`user_id`),
  CONSTRAINT `fk_students_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `students` (`id`, `user_id`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `address`, `date_of_birth`, `gender`, `emergency_contact_name`, `emergency_contact_number`, `medical_notes`, `status`, `created_at`, `updated_at`) VALUES (1, 44, 'John', 'Michael', 'Doe', 'Jr', 'john.doe.test@example.com', '09123456789', '123 Test St, Manila', NULL, 'other', NULL, NULL, NULL, 'active', '2026-07-07 16:09:37', '2026-07-07 16:09:37');
INSERT INTO `students` (`id`, `user_id`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `address`, `date_of_birth`, `gender`, `emergency_contact_name`, `emergency_contact_number`, `medical_notes`, `status`, `created_at`, `updated_at`) VALUES (2, 45, 'Jeoan', NULL, 'Gran', NULL, 'benjieandayaaaa061504@gmail.com', '3148158', NULL, NULL, 'other', NULL, NULL, NULL, 'active', '2026-07-07 17:22:00', '2026-07-07 17:22:00');
INSERT INTO `students` (`id`, `user_id`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `address`, `date_of_birth`, `gender`, `emergency_contact_name`, `emergency_contact_number`, `medical_notes`, `status`, `created_at`, `updated_at`) VALUES (3, NULL, 'qweqwe', NULL, 'qweqwe', NULL, 'qweqwe@gmail.com', '343435', NULL, NULL, 'other', NULL, NULL, NULL, 'active', '2026-07-07 17:50:01', '2026-07-07 17:50:01');
INSERT INTO `students` (`id`, `user_id`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `address`, `date_of_birth`, `gender`, `emergency_contact_name`, `emergency_contact_number`, `medical_notes`, `status`, `created_at`, `updated_at`) VALUES (4, NULL, 'qweqwe', NULL, 'qweqwe', NULL, 'qwqweeqwe@gmail.com', '343435', NULL, NULL, 'other', NULL, NULL, NULL, 'active', '2026-07-07 17:52:24', '2026-07-07 17:52:24');
INSERT INTO `students` (`id`, `user_id`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `address`, `date_of_birth`, `gender`, `emergency_contact_name`, `emergency_contact_number`, `medical_notes`, `status`, `created_at`, `updated_at`) VALUES (5, NULL, 'qwe', NULL, 'qweqwe', NULL, 'qweqwewq@gmail.com', '12323123', NULL, NULL, 'other', NULL, NULL, NULL, 'active', '2026-07-07 18:15:43', '2026-07-07 18:15:43');
INSERT INTO `students` (`id`, `user_id`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `address`, `date_of_birth`, `gender`, `emergency_contact_name`, `emergency_contact_number`, `medical_notes`, `status`, `created_at`, `updated_at`) VALUES (6, NULL, 'qwe', NULL, 'qwe', NULL, 'qwe@gmail.com', '12323123', NULL, NULL, 'other', NULL, NULL, NULL, 'active', '2026-07-07 18:47:17', '2026-07-07 18:47:17');
INSERT INTO `students` (`id`, `user_id`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `address`, `date_of_birth`, `gender`, `emergency_contact_name`, `emergency_contact_number`, `medical_notes`, `status`, `created_at`, `updated_at`) VALUES (7, NULL, 'qweqw', NULL, 'qweqwe', NULL, 'qweqw@gmail.com', '123123123', NULL, NULL, 'other', NULL, NULL, NULL, 'active', '2026-07-07 19:07:21', '2026-07-07 19:07:21');
INSERT INTO `students` (`id`, `user_id`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `address`, `date_of_birth`, `gender`, `emergency_contact_name`, `emergency_contact_number`, `medical_notes`, `status`, `created_at`, `updated_at`) VALUES (8, NULL, 'qweqwe', NULL, 'qweqwe', NULL, 'qweweq@gmail.com', '13123123123', NULL, NULL, 'other', NULL, NULL, NULL, 'active', '2026-07-07 19:09:39', '2026-07-07 19:09:39');
INSERT INTO `students` (`id`, `user_id`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `address`, `date_of_birth`, `gender`, `emergency_contact_name`, `emergency_contact_number`, `medical_notes`, `status`, `created_at`, `updated_at`) VALUES (9, NULL, 'qweqwe', NULL, 'qweqwe', NULL, 'qweqwweq@gmail.com', '123123123', NULL, NULL, 'other', NULL, NULL, NULL, 'active', '2026-07-07 19:11:56', '2026-07-07 19:11:56');
INSERT INTO `students` (`id`, `user_id`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `address`, `date_of_birth`, `gender`, `emergency_contact_name`, `emergency_contact_number`, `medical_notes`, `status`, `created_at`, `updated_at`) VALUES (10, NULL, 'qewe', NULL, 'qweqw', NULL, 'qweq123we@gmail.com', '12312312', NULL, NULL, 'other', NULL, NULL, NULL, 'active', '2026-07-08 10:20:27', '2026-07-08 10:20:27');
INSERT INTO `students` (`id`, `user_id`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `address`, `date_of_birth`, `gender`, `emergency_contact_name`, `emergency_contact_number`, `medical_notes`, `status`, `created_at`, `updated_at`) VALUES (11, NULL, 'qewe', NULL, 'qweqw', NULL, 'qweq12323we@gmail.com', '12312312', NULL, NULL, 'other', NULL, NULL, NULL, 'active', '2026-07-08 10:20:44', '2026-07-08 10:20:44');
INSERT INTO `students` (`id`, `user_id`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `address`, `date_of_birth`, `gender`, `emergency_contact_name`, `emergency_contact_number`, `medical_notes`, `status`, `created_at`, `updated_at`) VALUES (12, NULL, 'ewq', NULL, 'eqw', NULL, 'eqwewq@gmail.com', '423423423', NULL, NULL, 'other', NULL, NULL, NULL, 'active', '2026-07-08 10:26:16', '2026-07-08 10:26:16');
INSERT INTO `students` (`id`, `user_id`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `address`, `date_of_birth`, `gender`, `emergency_contact_name`, `emergency_contact_number`, `medical_notes`, `status`, `created_at`, `updated_at`) VALUES (13, NULL, 're', NULL, 'rwe', NULL, 'tert@gmail.com', '123123', NULL, NULL, 'other', NULL, NULL, NULL, 'active', '2026-07-08 10:28:11', '2026-07-08 10:28:11');
INSERT INTO `students` (`id`, `user_id`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `address`, `date_of_birth`, `gender`, `emergency_contact_name`, `emergency_contact_number`, `medical_notes`, `status`, `created_at`, `updated_at`) VALUES (14, 59, 'tester', NULL, 'test', NULL, '12312@gmail.com', '12313123', NULL, NULL, 'other', NULL, NULL, NULL, 'active', '2026-07-08 10:43:08', '2026-07-08 10:43:08');
INSERT INTO `students` (`id`, `user_id`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `address`, `date_of_birth`, `gender`, `emergency_contact_name`, `emergency_contact_number`, `medical_notes`, `status`, `created_at`, `updated_at`) VALUES (15, 60, 'jeoan', NULL, 'qweqwe', NULL, 'qweq2123we@gmail.com', '12ff31233123', NULL, NULL, 'other', NULL, NULL, NULL, 'active', '2026-07-08 10:51:13', '2026-07-08 10:51:13');
INSERT INTO `students` (`id`, `user_id`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `address`, `date_of_birth`, `gender`, `emergency_contact_name`, `emergency_contact_number`, `medical_notes`, `status`, `created_at`, `updated_at`) VALUES (16, 61, 'qwe', NULL, 'qeqwe', NULL, 'qwe312qw@gmail.com', '1231231', NULL, NULL, 'other', NULL, NULL, NULL, 'active', '2026-07-08 14:39:47', '2026-07-08 14:39:47');
INSERT INTO `students` (`id`, `user_id`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `address`, `date_of_birth`, `gender`, `emergency_contact_name`, `emergency_contact_number`, `medical_notes`, `status`, `created_at`, `updated_at`) VALUES (17, 62, 'testing', NULL, 'qweqwe', NULL, 'qweadsqwe@gmail.com', '12312312', NULL, NULL, 'other', NULL, NULL, NULL, 'active', '2026-07-08 14:48:11', '2026-07-08 14:48:11');
INSERT INTO `students` (`id`, `user_id`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `address`, `date_of_birth`, `gender`, `emergency_contact_name`, `emergency_contact_number`, `medical_notes`, `status`, `created_at`, `updated_at`) VALUES (19, 66, 'testing laters', NULL, 'we', NULL, 'weq@gmail.com', '51516', NULL, NULL, 'other', NULL, NULL, NULL, 'active', '2026-07-08 16:31:26', '2026-07-08 16:31:26');
INSERT INTO `students` (`id`, `user_id`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `address`, `date_of_birth`, `gender`, `emergency_contact_name`, `emergency_contact_number`, `medical_notes`, `status`, `created_at`, `updated_at`) VALUES (20, 71, 'test', 'with', 'login', 'JR.', 'me123@gmail.com', '12312332', NULL, NULL, 'other', NULL, NULL, NULL, 'active', '2026-07-08 21:18:55', '2026-07-08 21:18:55');
INSERT INTO `students` (`id`, `user_id`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `address`, `date_of_birth`, `gender`, `emergency_contact_name`, `emergency_contact_number`, `medical_notes`, `status`, `created_at`, `updated_at`) VALUES (21, 72, 'testpass', 'qwe', 'qwe', 'qwe', 'email123@gmail.com', '123232', 'balay', NULL, 'other', NULL, NULL, NULL, 'active', '2026-07-08 21:49:05', '2026-07-08 21:49:05');
INSERT INTO `students` (`id`, `user_id`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `contact_number`, `address`, `date_of_birth`, `gender`, `emergency_contact_name`, `emergency_contact_number`, `medical_notes`, `status`, `created_at`, `updated_at`) VALUES (22, 73, 'testjeo', 'qw', 'qw', 'Jr.', 'testing@gmail.com', '123123', NULL, NULL, 'other', NULL, NULL, NULL, 'active', '2026-07-08 22:44:07', '2026-07-08 22:44:07');


-- Table: users
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staff_id` int DEFAULT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `contact_number` varchar(15) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `role` enum('admin','frontdesk','student') DEFAULT 'frontdesk',
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`),
  UNIQUE KEY `uq_users_username` (`username`),
  KEY `idx_users_staff_id` (`staff_id`),
  CONSTRAINT `fk_users_staff` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`staff_id`)
) ENGINE=InnoDB AUTO_INCREMENT=78 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `users` (`id`, `staff_id`, `username`, `email`, `password`, `contact_number`, `address`, `role`, `status`, `created_at`, `updated_at`) VALUES (1, NULL, 'admin', 'admin@example.com', '$2b$10$405.Rl26ACZ/d4oO3ySxWesAXpDeoXaqcrjtnA8x9/LTlIgBpDaeS', NULL, NULL, 'admin', '', '2026-06-25 16:39:39', '2026-07-06 16:21:10');
INSERT INTO `users` (`id`, `staff_id`, `username`, `email`, `password`, `contact_number`, `address`, `role`, `status`, `created_at`, `updated_at`) VALUES (5, NULL, 'user', 'benjieandaya061504@gmail.com', '$2b$10$I72qmZXvNuC63dojgXC9C.EEK2sHsaLueVWwcp0vhYGDE04R/KN6y', '09123456789', 'qweqweqwe', 'admin', 'approved', '2026-06-25 16:51:22', '2026-07-06 16:54:11');
INSERT INTO `users` (`id`, `staff_id`, `username`, `email`, `password`, `contact_number`, `address`, `role`, `status`, `created_at`, `updated_at`) VALUES (13, NULL, 'superadmin', 'superadmin@cadenza.com', '$2b$10$YYqXcAyoj8hdSzM5nNkrIOYt0nOVs5EgKNG3DUgQoznC21eQgOTeK', NULL, NULL, 'admin', '', '2026-06-25 20:24:12', '2026-07-06 16:21:10');
INSERT INTO `users` (`id`, `staff_id`, `username`, `email`, `password`, `contact_number`, `address`, `role`, `status`, `created_at`, `updated_at`) VALUES (14, 1, 'juan.cruz@cadenza.com', 'juan.cruz@cadenza.com', '$2b$10$lJt0rwTMDXZ6LeO9eqqUROhWIiH5jYi2uZeSsVjIyzT6wWagKJlNO', NULL, NULL, 'admin', 'approved', '2026-06-28 19:47:59', '2026-07-06 16:54:08');
INSERT INTO `users` (`id`, `staff_id`, `username`, `email`, `password`, `contact_number`, `address`, `role`, `status`, `created_at`, `updated_at`) VALUES (15, 2, 'maria.santos@cadenza.com', 'maria.santos@cadenza.com', '$2b$10$j24Xltx8qxjoQu8GhufW6.3bds4xLqYrKHOAFVsWntRVDsGk5gouO', NULL, NULL, 'frontdesk', 'approved', '2026-06-28 19:47:59', '2026-07-07 15:14:31');
INSERT INTO `users` (`id`, `staff_id`, `username`, `email`, `password`, `contact_number`, `address`, `role`, `status`, `created_at`, `updated_at`) VALUES (16, 3, 'pedro.gonzales@cadenza.com', 'pedro.gonzales@cadenza.com', '$2b$10$7s36dr.1UI1epiHoOQyAYOTNrUdJsGxF.u30RuQmLbIDVmVNH5oY2', NULL, NULL, 'frontdesk', '', '2026-06-28 19:47:59', '2026-07-06 16:21:10');
INSERT INTO `users` (`id`, `staff_id`, `username`, `email`, `password`, `contact_number`, `address`, `role`, `status`, `created_at`, `updated_at`) VALUES (17, 4, 'ana.villanueva@cadenza.com', 'ana.villanueva@cadenza.com', '$2b$10$WFbnTtvgT8B/Gn/PYKQPw.ryf6hdMvfPuyg6Ay2XxuyG/228nBhV2', NULL, NULL, 'frontdesk', '', '2026-06-28 19:47:59', '2026-07-06 16:21:10');
INSERT INTO `users` (`id`, `staff_id`, `username`, `email`, `password`, `contact_number`, `address`, `role`, `status`, `created_at`, `updated_at`) VALUES (26, NULL, 'test.admin.1782844513117', 'test.admin.1782844513117@cadenza.com', '$2b$10$NJrPfYZsxr2Ruu7zRnhfcOmxO0/WFhtLVmD.WiwC8fUIMcEfI2DT6', '09123456789', 'Test Address', 'admin', '', '2026-06-30 18:35:13', '2026-07-06 16:21:10');
INSERT INTO `users` (`id`, `staff_id`, `username`, `email`, `password`, `contact_number`, `address`, `role`, `status`, `created_at`, `updated_at`) VALUES (41, NULL, 'user123123', '123@gmail.com', '$2b$10$PupgEdzWlG3Hgkj3K5wr.O4Ko.KnOPDIAVLsk1A.AwpusiSij4twm', '09123456789', 'qweqweqwe', 'admin', '', '2026-07-05 10:01:22', '2026-07-06 15:28:34');
INSERT INTO `users` (`id`, `staff_id`, `username`, `email`, `password`, `contact_number`, `address`, `role`, `status`, `created_at`, `updated_at`) VALUES (42, NULL, 'qweqeqwew', 'wqeqwe@gmail.com', '$2b$10$9hq7UmHu12g0NhCk5KC6t.0JDO6xuJyXT50Np6HRTbh51wF8m0mP.', '12323123', 'weqweqeqwe', 'admin', '', '2026-07-06 16:30:24', '2026-07-06 16:30:24');
INSERT INTO `users` (`id`, `staff_id`, `username`, `email`, `password`, `contact_number`, `address`, `role`, `status`, `created_at`, `updated_at`) VALUES (43, NULL, 'qweqeq', 'wqwe@gmail.com', '$2b$10$1hxtjJnoFf3Kz6eyZ/.rBuIdLT9tAijUmxPZyhDixkqX0fZbivQyO', '12323123', 'weqweqeqwe', 'admin', 'rejected', '2026-07-06 16:39:27', '2026-07-06 16:54:03');
INSERT INTO `users` (`id`, `staff_id`, `username`, `email`, `password`, `contact_number`, `address`, `role`, `status`, `created_at`, `updated_at`) VALUES (44, NULL, 'john.doe.test', 'john.doe.test@example.com', '$2b$10$YvzUl1gkc3fFqJOH3vhZqelkjQlp17bBCk2HlgsXFalBUwWhLZ87W', '09123456789', '123 Test St, Manila', 'student', 'pending', '2026-07-07 16:09:37', '2026-07-07 16:09:37');
INSERT INTO `users` (`id`, `staff_id`, `username`, `email`, `password`, `contact_number`, `address`, `role`, `status`, `created_at`, `updated_at`) VALUES (45, NULL, 'benjieandayaaaa061504', 'benjieandayaaaa061504@gmail.com', '$2b$10$tTL4jMR9gA2sgkgNKEwBqehXVzBGm76caFDlPnumXrwuFoN0vzlQ2', '3148158', NULL, 'student', 'pending', '2026-07-07 17:21:59', '2026-07-07 17:21:59');
INSERT INTO `users` (`id`, `staff_id`, `username`, `email`, `password`, `contact_number`, `address`, `role`, `status`, `created_at`, `updated_at`) VALUES (59, NULL, '12312', '12312@gmail.com', '$2b$10$FFILAruAGcsqaQmn0WQRJujqanzVZHqEDIwOJA925YTdkxdPEfeuO', '12313123', NULL, 'student', 'approved', '2026-07-08 10:43:08', '2026-07-08 10:44:02');
INSERT INTO `users` (`id`, `staff_id`, `username`, `email`, `password`, `contact_number`, `address`, `role`, `status`, `created_at`, `updated_at`) VALUES (60, NULL, 'qweq2123we', 'qweq2123we@gmail.com', '$2b$10$K/VhpnY.XoWoWRQ3PR2o4u2lGcBJV0KLVB4c8bC15QvayQ7FztN.2', '12ff31233123', NULL, 'student', 'approved', '2026-07-08 10:51:13', '2026-07-08 10:51:38');
INSERT INTO `users` (`id`, `staff_id`, `username`, `email`, `password`, `contact_number`, `address`, `role`, `status`, `created_at`, `updated_at`) VALUES (61, NULL, 'qwe312qw', 'qwe312qw@gmail.com', '$2b$10$/GdhUwZFFLV./QRBy//4P.SQ3ju41SyN/RyuKmN2f/m1XKPOq3oTu', '1231231', NULL, 'student', 'pending', '2026-07-08 14:39:46', '2026-07-08 14:39:46');
INSERT INTO `users` (`id`, `staff_id`, `username`, `email`, `password`, `contact_number`, `address`, `role`, `status`, `created_at`, `updated_at`) VALUES (62, NULL, 'qweadsqwe', 'qweadsqwe@gmail.com', '$2b$10$Vee2PBBMElm6Mhxc5.Kp3euxHc9xKJWqOMgHzK6D65/nXGTwmprl2', '12312312', NULL, 'student', 'approved', '2026-07-08 14:48:11', '2026-07-08 14:49:53');
INSERT INTO `users` (`id`, `staff_id`, `username`, `email`, `password`, `contact_number`, `address`, `role`, `status`, `created_at`, `updated_at`) VALUES (66, NULL, 'weq', 'weq@gmail.com', '$2b$10$EJpQu9/s1qtWhvjmsbpazOOD5wWvZIHDvL/0zjTMOKuzHNdD.ihdS', '51516', NULL, 'student', 'approved', '2026-07-08 16:09:55', '2026-07-08 16:31:26');
INSERT INTO `users` (`id`, `staff_id`, `username`, `email`, `password`, `contact_number`, `address`, `role`, `status`, `created_at`, `updated_at`) VALUES (67, NULL, 'benjieandaya123061504', 'benjieandaya123061504@gmail.com', '$2b$10$vyVYDlnU0gs.jtSdbOtiVOvPhWU5z0B/88OmmcsAvzUCoLAuynkZa', '123123', NULL, 'student', 'pending', '2026-07-08 18:31:10', '2026-07-08 18:31:10');
INSERT INTO `users` (`id`, `staff_id`, `username`, `email`, `password`, `contact_number`, `address`, `role`, `status`, `created_at`, `updated_at`) VALUES (68, NULL, 'qeqwesq', 'qeqwesq@gmail.com', '$2b$10$8GKk23ID0hz2rprzoRPbee5tTHWen/hFao7Ml0rgxlN.QNDHVZmUq', '3131', NULL, 'student', 'pending', '2026-07-08 20:05:07', '2026-07-08 20:05:07');
INSERT INTO `users` (`id`, `staff_id`, `username`, `email`, `password`, `contact_number`, `address`, `role`, `status`, `created_at`, `updated_at`) VALUES (69, NULL, 'benjieand13123aya123061504', 'benjieand13123aya123061504@gmail.com', '$2b$10$D7lLKF/f3AVimS/jmeDTjuUlVf7zCgFSi0DhIRhdVTv68kKVF6d6a', '123123', NULL, 'student', 'pending', '2026-07-08 20:10:30', '2026-07-08 20:10:30');
INSERT INTO `users` (`id`, `staff_id`, `username`, `email`, `password`, `contact_number`, `address`, `role`, `status`, `created_at`, `updated_at`) VALUES (70, NULL, '123', 'benji312313eandaya061504@gmail.com', '$2b$10$66K2Pi3NWW5Vmj8eqMdb.O3aa6udNfH66Rm7iuHpoi81/QUeLNTlK', '123123', 'qwe', 'student', 'pending', '2026-07-08 21:05:45', '2026-07-08 21:05:45');
INSERT INTO `users` (`id`, `staff_id`, `username`, `email`, `password`, `contact_number`, `address`, `role`, `status`, `created_at`, `updated_at`) VALUES (71, NULL, 'me123', 'me123@gmail.com', '$2b$10$iCFbTMIcflCBa3cawsR7POkACovSPz5N/gP8ywEUo5zDMUjosYYM6', '12312332', NULL, 'student', 'approved', '2026-07-08 21:18:32', '2026-07-08 21:18:56');
INSERT INTO `users` (`id`, `staff_id`, `username`, `email`, `password`, `contact_number`, `address`, `role`, `status`, `created_at`, `updated_at`) VALUES (72, NULL, 'email123', 'email123@gmail.com', '$2b$10$LwNvvpvUYMe7wheyYbRJjOQQ/0qr.xen9R4gdL0sHrxzaPf0bUxkO', '242312', NULL, 'student', 'approved', '2026-07-08 21:45:38', '2026-07-08 21:49:05');
INSERT INTO `users` (`id`, `staff_id`, `username`, `email`, `password`, `contact_number`, `address`, `role`, `status`, `created_at`, `updated_at`) VALUES (73, NULL, 'testing', 'testing@gmail.com', '$2b$10$4MgyB.HfDcGD9eNIFXA3k..pXu/dj4I4jMJq3FRpk6dVF4p0UMCU2', '123123', NULL, 'student', 'approved', '2026-07-08 22:43:22', '2026-07-08 22:44:07');
INSERT INTO `users` (`id`, `staff_id`, `username`, `email`, `password`, `contact_number`, `address`, `role`, `status`, `created_at`, `updated_at`) VALUES (74, NULL, 'Jeoanqt', 'gwynwerpa17@gmail.com', '$2b$10$C49Ssw046TKw3ZiQr13dquk6nNrSgqdjOKJgPrdbUqg0RWvwVhcT6', '091279772545', 'Lapu-Lapu St., Purok Makisama, Brgy. Zone III, City of Koronadal, South Cotabato', 'frontdesk', 'rejected', '2026-07-08 22:58:40', '2026-07-08 23:02:50');
INSERT INTO `users` (`id`, `staff_id`, `username`, `email`, `password`, `contact_number`, `address`, `role`, `status`, `created_at`, `updated_at`) VALUES (75, NULL, 'Jeoanqtasdasd', 'gwynwerpsdaa17@gmail.com', '$2b$10$qLTDcbWwKvm3exOFDkw6XuEAxeXuts5ODryUOuG95FuyBKTzphIhu', '091279772545', 'Lapu-Lapu St., Purok Makisama, Brgy. Zone III, City of Koronadal, South Cotabato', 'admin', 'pending', '2026-07-10 09:46:26', '2026-07-10 09:46:26');
INSERT INTO `users` (`id`, `staff_id`, `username`, `email`, `password`, `contact_number`, `address`, `role`, `status`, `created_at`, `updated_at`) VALUES (76, NULL, 'qwqw', '123123wqw21@gmail.com', '$2b$10$JfUQyRmvhOoQ7e9XK1YQpuOJarNJqd/hnnCgnsvdbIr0r6Imezk9K', '234234', 'daw', 'admin', 'pending', '2026-07-10 10:20:08', '2026-07-10 10:20:08');
INSERT INTO `users` (`id`, `staff_id`, `username`, `email`, `password`, `contact_number`, `address`, `role`, `status`, `created_at`, `updated_at`) VALUES (77, NULL, 'assa', 'saassasa@gmail.com', '$2b$10$sSzfDSisDfu6rGXFuzff2OLDiVpIig3tQxcgSNRMgKTFo7v9/JCeW', '13221', '12121', 'admin', 'pending', '2026-07-10 10:20:36', '2026-07-10 10:20:36');

