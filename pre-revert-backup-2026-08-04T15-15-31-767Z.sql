-- ============================================
-- PRE-REVERT BACKUP of railway database
-- Generated: 2026-08-04T15:15:01.906Z
-- WARNING: This is the CURRENT state before reverting packages
-- ============================================

CREATE DATABASE IF NOT EXISTS `railway`;
USE `railway`;

-- Table: _prisma_migrations
DROP TABLE IF EXISTS `_prisma_migrations`;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES ('0e8b8b1f-7e9e-437b-895c-90afbff004fd', 'e7c5d4e05534606961695aaa61001fcec334589001562e84804969d60aa4f187', '2026-07-29 09:38:01', '0_init', NULL, NULL, '2026-07-29 09:37:59', 1);
INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES ('8438eed7-abfe-48e2-a1d2-0568b9f2e001', '752a2fc0d59f6b39bf6c43781cc69d2d2a5dccbff0cc3760d94b1afe5f519fa4', '2026-07-30 10:05:04', '20260730175104_add_specialty_to_lesson', NULL, NULL, '2026-07-30 10:05:02', 1);
INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES ('ac3166c7-bb59-4519-87ef-92bcd5f17316', 'a1afb79745ad665fe317a87898b76499be7b095c5d1a65fe3ffee22ee2778b02', '2026-08-03 01:16:33', '20260803090537_add_package_description', NULL, NULL, '2026-08-03 01:16:32', 1);

-- Table: band_room_rentals
DROP TABLE IF EXISTS `band_room_rentals`;
CREATE TABLE `band_room_rentals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `client_id` int NOT NULL,
  `band_room_id` int NOT NULL,
  `rental_date` date DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `total_amount` decimal(10,2) DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_band_room_rental_client` (`client_id`),
  KEY `fk_band_room_rental_room` (`band_room_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: band_rooms
DROP TABLE IF EXISTS `band_rooms`;
CREATE TABLE `band_rooms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `room_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hourly_rate` decimal(10,2) DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: classes
DROP TABLE IF EXISTS `classes`;
CREATE TABLE `classes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `package_id` int NOT NULL,
  `instructor_id` int NOT NULL,
  `lesson_room_id` int NOT NULL,
  `class_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `capacity` int DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Open',
  PRIMARY KEY (`id`),
  KEY `fk_classes_instructor` (`instructor_id`),
  KEY `fk_classes_package` (`package_id`),
  KEY `fk_classes_room` (`lesson_room_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: clients
DROP TABLE IF EXISTS `clients`;
CREATE TABLE `clients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `f_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `m_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `l_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `users_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_clients_users` (`users_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: enrollments
DROP TABLE IF EXISTS `enrollments`;
CREATE TABLE `enrollments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `class_id` int NOT NULL,
  `package_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `enrollment_date` date DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Active',
  PRIMARY KEY (`id`),
  KEY `fk_enrollments_class` (`class_id`),
  KEY `fk_enrollments_package` (`package_id`),
  KEY `fk_enrollments_student` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: equipments
DROP TABLE IF EXISTS `equipments`;
CREATE TABLE `equipments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `equipment_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `brand` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rental_rate` decimal(10,2) DEFAULT NULL,
  `rate_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: instructor_schedule
DROP TABLE IF EXISTS `instructor_schedule`;
CREATE TABLE `instructor_schedule` (
  `id` int NOT NULL AUTO_INCREMENT,
  `instructor_id` int NOT NULL,
  `day_of_week` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `time_slot_id` int NOT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Available',
  PRIMARY KEY (`id`),
  UNIQUE KEY `instructor_schedule_instructor_id_day_of_week_time_slot_id_key` (`instructor_id`,`day_of_week`,`time_slot_id`),
  KEY `idx_instructor_id` (`instructor_id`),
  KEY `idx_time_slot_id` (`time_slot_id`),
  CONSTRAINT `instructor_schedule_instructor_id_fkey` FOREIGN KEY (`instructor_id`) REFERENCES `instructors` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `instructor_schedule_time_slot_id_fkey` FOREIGN KEY (`time_slot_id`) REFERENCES `time_slots` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `instructor_schedule` (`id`, `instructor_id`, `day_of_week`, `time_slot_id`, `status`) VALUES (76, 2, 'Mon', 1, 'Available');
INSERT INTO `instructor_schedule` (`id`, `instructor_id`, `day_of_week`, `time_slot_id`, `status`) VALUES (77, 2, 'Mon', 2, 'Available');
INSERT INTO `instructor_schedule` (`id`, `instructor_id`, `day_of_week`, `time_slot_id`, `status`) VALUES (78, 2, 'Mon', 3, 'Available');
INSERT INTO `instructor_schedule` (`id`, `instructor_id`, `day_of_week`, `time_slot_id`, `status`) VALUES (79, 2, 'Tue', 1, 'Available');
INSERT INTO `instructor_schedule` (`id`, `instructor_id`, `day_of_week`, `time_slot_id`, `status`) VALUES (80, 2, 'Tue', 2, 'Available');
INSERT INTO `instructor_schedule` (`id`, `instructor_id`, `day_of_week`, `time_slot_id`, `status`) VALUES (81, 2, 'Tue', 3, 'Available');
INSERT INTO `instructor_schedule` (`id`, `instructor_id`, `day_of_week`, `time_slot_id`, `status`) VALUES (82, 2, 'Wed', 1, 'Available');
INSERT INTO `instructor_schedule` (`id`, `instructor_id`, `day_of_week`, `time_slot_id`, `status`) VALUES (83, 2, 'Wed', 2, 'Available');
INSERT INTO `instructor_schedule` (`id`, `instructor_id`, `day_of_week`, `time_slot_id`, `status`) VALUES (84, 2, 'Wed', 3, 'Available');
INSERT INTO `instructor_schedule` (`id`, `instructor_id`, `day_of_week`, `time_slot_id`, `status`) VALUES (85, 4, 'Mon', 1, 'Available');
INSERT INTO `instructor_schedule` (`id`, `instructor_id`, `day_of_week`, `time_slot_id`, `status`) VALUES (86, 4, 'Mon', 2, 'Available');
INSERT INTO `instructor_schedule` (`id`, `instructor_id`, `day_of_week`, `time_slot_id`, `status`) VALUES (87, 4, 'Tue', 1, 'Available');
INSERT INTO `instructor_schedule` (`id`, `instructor_id`, `day_of_week`, `time_slot_id`, `status`) VALUES (88, 4, 'Tue', 2, 'Available');
INSERT INTO `instructor_schedule` (`id`, `instructor_id`, `day_of_week`, `time_slot_id`, `status`) VALUES (89, 4, 'Wed', 1, 'Available');
INSERT INTO `instructor_schedule` (`id`, `instructor_id`, `day_of_week`, `time_slot_id`, `status`) VALUES (90, 4, 'Wed', 2, 'Available');
INSERT INTO `instructor_schedule` (`id`, `instructor_id`, `day_of_week`, `time_slot_id`, `status`) VALUES (91, 1, 'Sat', 1, 'Available');
INSERT INTO `instructor_schedule` (`id`, `instructor_id`, `day_of_week`, `time_slot_id`, `status`) VALUES (92, 1, 'Wed', 1, 'Available');
INSERT INTO `instructor_schedule` (`id`, `instructor_id`, `day_of_week`, `time_slot_id`, `status`) VALUES (93, 1, 'Mon', 10, 'Available');
INSERT INTO `instructor_schedule` (`id`, `instructor_id`, `day_of_week`, `time_slot_id`, `status`) VALUES (94, 1, 'Mon', 9, 'Available');
INSERT INTO `instructor_schedule` (`id`, `instructor_id`, `day_of_week`, `time_slot_id`, `status`) VALUES (95, 1, 'Tue', 10, 'Available');
INSERT INTO `instructor_schedule` (`id`, `instructor_id`, `day_of_week`, `time_slot_id`, `status`) VALUES (96, 1, 'Tue', 9, 'Available');
INSERT INTO `instructor_schedule` (`id`, `instructor_id`, `day_of_week`, `time_slot_id`, `status`) VALUES (97, 5, 'Mon', 9, 'Available');
INSERT INTO `instructor_schedule` (`id`, `instructor_id`, `day_of_week`, `time_slot_id`, `status`) VALUES (98, 5, 'Mon', 10, 'Available');
INSERT INTO `instructor_schedule` (`id`, `instructor_id`, `day_of_week`, `time_slot_id`, `status`) VALUES (99, 5, 'Tue', 9, 'Available');
INSERT INTO `instructor_schedule` (`id`, `instructor_id`, `day_of_week`, `time_slot_id`, `status`) VALUES (100, 5, 'Tue', 10, 'Available');

-- Table: instructor_specialties
DROP TABLE IF EXISTS `instructor_specialties`;
CREATE TABLE `instructor_specialties` (
  `id` int NOT NULL AUTO_INCREMENT,
  `instructor_id` int NOT NULL,
  `specialty_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_instructor_specialty_instructor` (`instructor_id`),
  KEY `fk_instructor_specialty_specialty` (`specialty_id`),
  CONSTRAINT `fk_instructor_specialty_instructor` FOREIGN KEY (`instructor_id`) REFERENCES `instructors` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_instructor_specialty_specialty` FOREIGN KEY (`specialty_id`) REFERENCES `specialties` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `instructor_specialties` (`id`, `instructor_id`, `specialty_id`) VALUES (4, 2, 3);
INSERT INTO `instructor_specialties` (`id`, `instructor_id`, `specialty_id`) VALUES (5, 2, 2);
INSERT INTO `instructor_specialties` (`id`, `instructor_id`, `specialty_id`) VALUES (6, 3, 3);
INSERT INTO `instructor_specialties` (`id`, `instructor_id`, `specialty_id`) VALUES (8, 4, 4);
INSERT INTO `instructor_specialties` (`id`, `instructor_id`, `specialty_id`) VALUES (9, 4, 2);
INSERT INTO `instructor_specialties` (`id`, `instructor_id`, `specialty_id`) VALUES (10, 1, 3);
INSERT INTO `instructor_specialties` (`id`, `instructor_id`, `specialty_id`) VALUES (11, 1, 2);
INSERT INTO `instructor_specialties` (`id`, `instructor_id`, `specialty_id`) VALUES (12, 1, 1);
INSERT INTO `instructor_specialties` (`id`, `instructor_id`, `specialty_id`) VALUES (13, 1, 4);
INSERT INTO `instructor_specialties` (`id`, `instructor_id`, `specialty_id`) VALUES (16, 6, 2);
INSERT INTO `instructor_specialties` (`id`, `instructor_id`, `specialty_id`) VALUES (17, 5, 2);

-- Table: instructors
DROP TABLE IF EXISTS `instructors`;
CREATE TABLE `instructors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staff_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `staff_id` (`staff_id`),
  CONSTRAINT `fk_instructors_staff` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `instructors` (`id`, `staff_id`) VALUES (1, 1);
INSERT INTO `instructors` (`id`, `staff_id`) VALUES (2, 2);
INSERT INTO `instructors` (`id`, `staff_id`) VALUES (3, 3);
INSERT INTO `instructors` (`id`, `staff_id`) VALUES (4, 4);
INSERT INTO `instructors` (`id`, `staff_id`) VALUES (5, 5);
INSERT INTO `instructors` (`id`, `staff_id`) VALUES (6, 6);

-- Table: instruments
DROP TABLE IF EXISTS `instruments`;
CREATE TABLE `instruments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `instrument_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `brand` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `model` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `serial_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rental_rate` decimal(10,2) DEFAULT NULL,
  `rate_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `purchase_date` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `instruments` (`id`, `instrument_name`, `brand`, `model`, `serial_number`, `quantity`, `status`, `rental_rate`, `rate_type`, `purchase_date`) VALUES (1, 'Guitar', 'Yamaha', '12', '32312', 1, 'Good', '1000.00', 'per session', NULL);

-- Table: learning_materials
DROP TABLE IF EXISTS `learning_materials`;
CREATE TABLE `learning_materials` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_path` text COLLATE utf8mb4_unicode_ci,
  `uploaded_date` datetime DEFAULT NULL,
  `lesson_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_material_lesson` (`lesson_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: lesson
DROP TABLE IF EXISTS `lesson`;
CREATE TABLE `lesson` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lesson_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `specialty_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `lesson_specialty_id_fkey` (`specialty_id`),
  CONSTRAINT `lesson_specialty_id_fkey` FOREIGN KEY (`specialty_id`) REFERENCES `specialties` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `lesson` (`id`, `lesson_name`, `status`, `specialty_id`) VALUES (1, 'Piano', 'Active', 3);
INSERT INTO `lesson` (`id`, `lesson_name`, `status`, `specialty_id`) VALUES (2, 'Drum', 'Active', 1);
INSERT INTO `lesson` (`id`, `lesson_name`, `status`, `specialty_id`) VALUES (3, 'Guitar Lesson 1', 'Inactive', 2);
INSERT INTO `lesson` (`id`, `lesson_name`, `status`, `specialty_id`) VALUES (4, 'Violin', 'Active', 4);
INSERT INTO `lesson` (`id`, `lesson_name`, `status`, `specialty_id`) VALUES (5, 'Guitar', 'Active', NULL);
INSERT INTO `lesson` (`id`, `lesson_name`, `status`, `specialty_id`) VALUES (6, 'Guitar', 'Active', NULL);
INSERT INTO `lesson` (`id`, `lesson_name`, `status`, `specialty_id`) VALUES (7, 'Jeoan Lesson', 'Active', 2);

-- Table: lesson_rooms
DROP TABLE IF EXISTS `lesson_rooms`;
CREATE TABLE `lesson_rooms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `room_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: package_type
DROP TABLE IF EXISTS `package_type`;
CREATE TABLE `package_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `package_name` varchar(100) NOT NULL,
  `sessions` int NOT NULL,
  `duration` int NOT NULL COMMENT 'Duration in days',
  `frequency` varchar(50) NOT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `package_type` (`id`, `package_name`, `sessions`, `duration`, `frequency`, `status`) VALUES (1, 'Basic Package', 8, 30, '2 sessions/week', 'Active');
INSERT INTO `package_type` (`id`, `package_name`, `sessions`, `duration`, `frequency`, `status`) VALUES (2, 'Standard Package', 12, 45, '3 sessions/week', 'Active');
INSERT INTO `package_type` (`id`, `package_name`, `sessions`, `duration`, `frequency`, `status`) VALUES (3, 'Premium Package', 20, 60, '5 sessions/week', 'Active');

-- Table: packages
DROP TABLE IF EXISTS `packages`;
CREATE TABLE `packages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `package_type_id` int DEFAULT NULL,
  `fee` decimal(10,2) NOT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lesson_id` int NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `fk_packages_lesson` (`lesson_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `packages` (`id`, `package_type_id`, `fee`, `status`, `lesson_id`, `description`) VALUES (1, NULL, '1550.00', 'Active', 2, NULL);
INSERT INTO `packages` (`id`, `package_type_id`, `fee`, `status`, `lesson_id`, `description`) VALUES (2, NULL, '1000.00', 'Active', 4, NULL);
INSERT INTO `packages` (`id`, `package_type_id`, `fee`, `status`, `lesson_id`, `description`) VALUES (3, NULL, '11111.00', 'Active', 2, NULL);
INSERT INTO `packages` (`id`, `package_type_id`, `fee`, `status`, `lesson_id`, `description`) VALUES (4, NULL, '5555.00', 'Active', 1, NULL);
INSERT INTO `packages` (`id`, `package_type_id`, `fee`, `status`, `lesson_id`, `description`) VALUES (5, NULL, '1000.00', 'Active', 7, NULL);
INSERT INTO `packages` (`id`, `package_type_id`, `fee`, `status`, `lesson_id`, `description`) VALUES (6, NULL, '1000.00', 'Active', 4, NULL);

-- Table: payments
DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `client_id` int DEFAULT NULL,
  `student_id` int DEFAULT NULL,
  `enrollment_id` int DEFAULT NULL,
  `rental_id` int DEFAULT NULL,
  `band_room_rental_id` int DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Paid',
  PRIMARY KEY (`id`),
  KEY `fk_payment_band_room_rental` (`band_room_rental_id`),
  KEY `fk_payment_client` (`client_id`),
  KEY `fk_payment_enrollment` (`enrollment_id`),
  KEY `fk_payment_rental` (`rental_id`),
  KEY `fk_payment_student` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: rental_items
DROP TABLE IF EXISTS `rental_items`;
CREATE TABLE `rental_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `item_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `rental_fee` decimal(10,2) DEFAULT NULL,
  `rental_id` int DEFAULT NULL,
  `instrument_id` int DEFAULT NULL,
  `equipment_id` int DEFAULT NULL,
  `rental_rate` decimal(10,2) DEFAULT NULL,
  `subtotal` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_rental_items_equipment` (`equipment_id`),
  KEY `fk_rental_items_instrument` (`instrument_id`),
  KEY `fk_rental_items_rental` (`rental_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: rentals
DROP TABLE IF EXISTS `rentals`;
CREATE TABLE `rentals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `rental_date` datetime DEFAULT NULL,
  `due_date` datetime DEFAULT NULL,
  `return_date` datetime DEFAULT NULL,
  `total_amount` decimal(10,2) DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `client_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_rentals_client` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: role
DROP TABLE IF EXISTS `role`;
CREATE TABLE `role` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `role` (`id`, `role_name`) VALUES (1, 'admin');
INSERT INTO `role` (`id`, `role_name`) VALUES (2, 'frontdesk');
INSERT INTO `role` (`id`, `role_name`) VALUES (3, 'instructor');

-- Table: specialties
DROP TABLE IF EXISTS `specialties`;
CREATE TABLE `specialties` (
  `id` int NOT NULL AUTO_INCREMENT,
  `specialty_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Active',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `specialties` (`id`, `specialty_name`, `status`) VALUES (1, 'Drum', 'Active');
INSERT INTO `specialties` (`id`, `specialty_name`, `status`) VALUES (2, 'Guitar', 'Active');
INSERT INTO `specialties` (`id`, `specialty_name`, `status`) VALUES (3, 'Piano', 'Active');
INSERT INTO `specialties` (`id`, `specialty_name`, `status`) VALUES (4, 'Violin', 'Active');

-- Table: staff
DROP TABLE IF EXISTS `staff`;
CREATE TABLE `staff` (
  `id` int NOT NULL AUTO_INCREMENT,
  `f_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `m_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `l_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gender` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_no` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `hire_date` date DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `staff` (`id`, `f_name`, `m_name`, `l_name`, `gender`, `contact_no`, `email`, `address`, `hire_date`, `status`) VALUES (1, 'sho', 'shomid', 'sholast', 'Male', '09123456789', 'sho@gmail.com', 'tufi', '2026-07-28 16:00:00', 'active');
INSERT INTO `staff` (`id`, `f_name`, `m_name`, `l_name`, `gender`, `contact_no`, `email`, `address`, `hire_date`, `status`) VALUES (2, 'lee', 'leemid', 'leelast', 'Male', '09876543210', 'lee@gmail.com', 'tangan', '2026-07-28 16:00:00', 'active');
INSERT INTO `staff` (`id`, `f_name`, `m_name`, `l_name`, `gender`, `contact_no`, `email`, `address`, `hire_date`, `status`) VALUES (3, 'Piano F', 'Piano M', 'Piano L', 'Male', '09123456789', 'Piano@gmail.com', 'Balay Bistro', '2026-07-29 16:00:00', 'active');
INSERT INTO `staff` (`id`, `f_name`, `m_name`, `l_name`, `gender`, `contact_no`, `email`, `address`, `hire_date`, `status`) VALUES (4, 'V', 'M', 'L', 'Male', '09123456789', 'sample@gmail.com', 'Balay Bistro', '2026-07-30 16:00:00', 'active');
INSERT INTO `staff` (`id`, `f_name`, `m_name`, `l_name`, `gender`, `contact_no`, `email`, `address`, `hire_date`, `status`) VALUES (5, 'Jeoan', 'Dajay', 'Gran', 'Other', '09123456789', 'jeoan@gmail.com', 'Balay ni Jeoan', '2026-08-02 16:00:00', 'active');
INSERT INTO `staff` (`id`, `f_name`, `m_name`, `l_name`, `gender`, `contact_no`, `email`, `address`, `hire_date`, `status`) VALUES (6, 'Jeoan Gwyneth', 'Dajay', 'Gran', 'Other', '09123456789', 'jeoannn@gmail.com', 'Balay ni Jeoan', '2026-08-02 16:00:00', 'active');

-- Table: students
DROP TABLE IF EXISTS `students`;
CREATE TABLE `students` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `enrollment_date` date DEFAULT NULL,
  `guardian_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `guardian_no` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `client_id` int DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `users_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_students_client` (`client_id`),
  KEY `fk_students_users` (`users_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: time_slots
DROP TABLE IF EXISTS `time_slots`;
CREATE TABLE `time_slots` (
  `id` int NOT NULL AUTO_INCREMENT,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `time_slots` (`id`, `start_time`, `end_time`) VALUES (1, '07:00:00', '08:00:00');
INSERT INTO `time_slots` (`id`, `start_time`, `end_time`) VALUES (2, '08:00:00', '09:00:00');
INSERT INTO `time_slots` (`id`, `start_time`, `end_time`) VALUES (3, '09:00:00', '10:00:00');
INSERT INTO `time_slots` (`id`, `start_time`, `end_time`) VALUES (4, '10:00:00', '11:00:00');
INSERT INTO `time_slots` (`id`, `start_time`, `end_time`) VALUES (5, '11:00:00', '12:00:00');
INSERT INTO `time_slots` (`id`, `start_time`, `end_time`) VALUES (6, '13:00:00', '14:00:00');
INSERT INTO `time_slots` (`id`, `start_time`, `end_time`) VALUES (7, '14:00:00', '15:00:00');
INSERT INTO `time_slots` (`id`, `start_time`, `end_time`) VALUES (8, '15:00:00', '16:00:00');
INSERT INTO `time_slots` (`id`, `start_time`, `end_time`) VALUES (9, '16:00:00', '17:00:00');
INSERT INTO `time_slots` (`id`, `start_time`, `end_time`) VALUES (10, '17:00:00', '18:00:00');

-- Table: users
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_id` int NOT NULL,
  `staff_id` int DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_users_role` (`role_id`),
  KEY `fk_users_staff` (`staff_id`),
  CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_users_staff` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`id`, `email`, `password`, `role_id`, `staff_id`, `status`, `created_at`) VALUES (1, 'admin@gmail.com', '$2b$10$8PFGP9/FtnAbGlZeLVvq0.Xp4h1v.PkOFEnsOxlUmXaB6Dnap/gRW', 1, NULL, 'active', '2026-07-29 10:02:45');
INSERT INTO `users` (`id`, `email`, `password`, `role_id`, `staff_id`, `status`, `created_at`) VALUES (2, 'frontdesk@cadenzamusic.com', '$2b$10$c90kZjougYBi5DVbR43FZue.rpGe/nq2PcUPQ9S4xcfqkHCD9PLfu', 2, NULL, 'active', '2026-07-29 10:02:46');
INSERT INTO `users` (`id`, `email`, `password`, `role_id`, `staff_id`, `status`, `created_at`) VALUES (3, 'sho@gmail.com', '$2b$10$tos3QK1JNTKrWMHgloUd/OVkYV2B9GN7r2j45luBdbQT.KNskjHzG', 3, 1, 'active', '2026-07-29 10:17:36');
INSERT INTO `users` (`id`, `email`, `password`, `role_id`, `staff_id`, `status`, `created_at`) VALUES (4, 'lee@gmail.com', '$2b$10$As0GkezpJt2i0uqcqiJiGOb00G8O0QAV7EWZLuAyIYM6TvancsgrW', 3, 2, 'active', '2026-07-29 10:18:33');
INSERT INTO `users` (`id`, `email`, `password`, `role_id`, `staff_id`, `status`, `created_at`) VALUES (5, 'Piano@gmail.com', '$2b$10$SNek1oOU.6qtyXxPdlHTk.pVuciT9S21iuM5POMJP9m8jibcQqZp2', 3, 3, 'active', '2026-07-30 10:25:13');
INSERT INTO `users` (`id`, `email`, `password`, `role_id`, `staff_id`, `status`, `created_at`) VALUES (6, 'sample@gmail.com', '$2b$10$lU1TRej5zw4nZfbon4ftSONZ.qG9DXYXHnjn80lRlcB1xD3MmbrLi', 3, 4, 'active', '2026-07-30 20:45:51');
INSERT INTO `users` (`id`, `email`, `password`, `role_id`, `staff_id`, `status`, `created_at`) VALUES (7, 'jeoan@gmail.com', '$2b$10$QhrVtqzoncKPTKrH7wpFn.qGE1Vu5NW4/F3vKE271c6GU4sXqzz4C', 3, 5, 'active', '2026-08-03 11:48:04');
INSERT INTO `users` (`id`, `email`, `password`, `role_id`, `staff_id`, `status`, `created_at`) VALUES (8, 'jeoannn@gmail.com', '$2b$10$Ui86KJ1nOqp3l4T7.71MTufMhLyscPPrEP9lCK5kjA2Pd5zDvuV5K', 3, 6, 'active', '2026-08-03 12:05:48');
INSERT INTO `users` (`id`, `email`, `password`, `role_id`, `staff_id`, `status`, `created_at`) VALUES (9, 'front@gmail.com', '$2b$10$GRFXdpDb7Kn/0vi7SZvejOW4hr7vt0sHWMKAkWa1hxDYcv5HZ4Hsi', 2, NULL, 'active', '2026-08-03 14:12:16');

