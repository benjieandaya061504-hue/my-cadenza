-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jul 30, 2026 at 09:08 AM
-- Server version: 8.4.7
-- PHP Version: 8.3.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cadenza_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `band_rooms`
--

DROP TABLE IF EXISTS `band_rooms`;
CREATE TABLE IF NOT EXISTS `band_rooms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `room_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hourly_rate` decimal(10,2) DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `band_room_rentals`
--

DROP TABLE IF EXISTS `band_room_rentals`;
CREATE TABLE IF NOT EXISTS `band_room_rentals` (
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
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `classes`
--

DROP TABLE IF EXISTS `classes`;
CREATE TABLE IF NOT EXISTS `classes` (
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
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `clients`
--

DROP TABLE IF EXISTS `clients`;
CREATE TABLE IF NOT EXISTS `clients` (
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
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `enrollments`
--

DROP TABLE IF EXISTS `enrollments`;
CREATE TABLE IF NOT EXISTS `enrollments` (
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
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `equipments`
--

DROP TABLE IF EXISTS `equipments`;
CREATE TABLE IF NOT EXISTS `equipments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `equipment_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `brand` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rental_rate` decimal(10,2) DEFAULT NULL,
  `rate_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `instructors`
--

DROP TABLE IF EXISTS `instructors`;
CREATE TABLE IF NOT EXISTS `instructors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staff_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `staff_id` (`staff_id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `instructors`
--

INSERT INTO `instructors` (`id`, `staff_id`) VALUES
(1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `instructor_schedule`
--

DROP TABLE IF EXISTS `instructor_schedule`;
CREATE TABLE IF NOT EXISTS `instructor_schedule` (
  `id` int NOT NULL AUTO_INCREMENT,
  `instructor_id` int NOT NULL,
  `day_of_week` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `time_slot_id` int NOT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Available',
  PRIMARY KEY (`id`),
  KEY `idx_instructor_id` (`instructor_id`),
  KEY `idx_time_slot_id` (`time_slot_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `instructor_specialties`
--

DROP TABLE IF EXISTS `instructor_specialties`;
CREATE TABLE IF NOT EXISTS `instructor_specialties` (
  `id` int NOT NULL AUTO_INCREMENT,
  `instructor_id` int NOT NULL,
  `specialty_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_instructor_specialty_instructor` (`instructor_id`),
  KEY `fk_instructor_specialty_specialty` (`specialty_id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `instructor_specialties`
--

INSERT INTO `instructor_specialties` (`id`, `instructor_id`, `specialty_id`) VALUES
(1, 1, 3);

-- --------------------------------------------------------

--
-- Table structure for table `instruments`
--

DROP TABLE IF EXISTS `instruments`;
CREATE TABLE IF NOT EXISTS `instruments` (
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
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `learning_materials`
--

DROP TABLE IF EXISTS `learning_materials`;
CREATE TABLE IF NOT EXISTS `learning_materials` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_path` text COLLATE utf8mb4_unicode_ci,
  `uploaded_date` datetime DEFAULT NULL,
  `lesson_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_material_lesson` (`lesson_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lesson`
--

DROP TABLE IF EXISTS `lesson`;
CREATE TABLE IF NOT EXISTS `lesson` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lesson_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lesson_rooms`
--

DROP TABLE IF EXISTS `lesson_rooms`;
CREATE TABLE IF NOT EXISTS `lesson_rooms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `room_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `packages`
--

DROP TABLE IF EXISTS `packages`;
CREATE TABLE IF NOT EXISTS `packages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `package_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duration` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `session` int DEFAULT NULL,
  `fee` decimal(10,2) NOT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total_session` int DEFAULT NULL,
  `lesson_id` int NOT NULL,
  `level_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_packages_lesson` (`lesson_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
CREATE TABLE IF NOT EXISTS `payments` (
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
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rentals`
--

DROP TABLE IF EXISTS `rentals`;
CREATE TABLE IF NOT EXISTS `rentals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `rental_date` datetime DEFAULT NULL,
  `due_date` datetime DEFAULT NULL,
  `return_date` datetime DEFAULT NULL,
  `total_amount` decimal(10,2) DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `client_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_rentals_client` (`client_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rental_items`
--

DROP TABLE IF EXISTS `rental_items`;
CREATE TABLE IF NOT EXISTS `rental_items` (
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
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
CREATE TABLE IF NOT EXISTS `role` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role`
--

INSERT INTO `role` (`id`, `role_name`) VALUES
(1, 'admin'),
(2, 'frontdesk'),
(3, 'instructor');

-- --------------------------------------------------------

--
-- Table structure for table `specialties`
--

DROP TABLE IF EXISTS `specialties`;
CREATE TABLE IF NOT EXISTS `specialties` (
  `id` int NOT NULL AUTO_INCREMENT,
  `specialty_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Active',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `specialties`
--

INSERT INTO `specialties` (`id`, `specialty_name`, `status`) VALUES
(1, 'Drum', 'Active'),
(2, 'Guitar', 'Active'),
(3, 'Piano', 'Active');

-- --------------------------------------------------------

--
-- Table structure for table `staff`
--

DROP TABLE IF EXISTS `staff`;
CREATE TABLE IF NOT EXISTS `staff` (
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
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `staff`
--

INSERT INTO `staff` (`id`, `f_name`, `m_name`, `l_name`, `gender`, `contact_no`, `email`, `address`, `hire_date`, `status`) VALUES
(1, 'Jan', 'Jan m', 'Jan L', 'Other', '09123456789', 'TestIns@gmail.com', 'balay, tantangan, test ins', '2026-07-29', 'active');

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
CREATE TABLE IF NOT EXISTS `students` (
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
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `time_slots`
--

DROP TABLE IF EXISTS `time_slots`;
CREATE TABLE IF NOT EXISTS `time_slots` (
  `id` int NOT NULL AUTO_INCREMENT,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `time_slots`
--

INSERT INTO `time_slots` (`id`, `start_time`, `end_time`) VALUES
(1, '07:00:00', '08:00:00'),
(2, '08:00:00', '09:00:00'),
(3, '09:00:00', '10:00:00'),
(4, '10:00:00', '11:00:00'),
(5, '11:00:00', '12:00:00'),
(6, '13:00:00', '14:00:00'),
(7, '14:00:00', '15:00:00'),
(8, '15:00:00', '16:00:00'),
(9, '16:00:00', '17:00:00'),
(10, '17:00:00', '18:00:00'),
(11, '18:00:00', '19:00:00'),
(12, '19:00:00', '20:00:00'),
(13, '20:00:00', '21:00:00'),
(14, '21:00:00', '22:00:00'),
(15, '22:00:00', '23:00:00'),
(16, '23:00:00', '00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
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
  KEY `fk_users_staff` (`staff_id`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `role_id`, `staff_id`, `status`, `created_at`) VALUES
(1, 'admin@cadenzamusic.com', '$2b$10$uONWqEx.XBJZGPCawYpwreTaAAt8WC9igPs7s/.yW3UoEJ1SFmfBi', 1, NULL, 'active', '2026-07-27 16:40:03'),
(2, 'frontdesk@cadenzamusic.com', '$2b$10$rd1QRViuZPfUUBg8jR34weSnfXtuHcBOA6Vx74zasdsX/LoYbD8uy', 2, NULL, 'active', '2026-07-27 16:40:03'),
(3, 'testlocals@gmail.com', '$2b$10$P.y2kyMyp1yyiuthYuxPS.xrUUm7Wn72SE/BuQxWAr2eLbiU263vS', 2, NULL, 'active', '2026-07-29 09:32:01'),
(4, 'TestIns@gmail.com', '$2b$10$CKBMwHikl1HSuN2AlZvrC.no9wdui2rvNUgNey5UzRJpNaiMh7glu', 3, 1, 'active', '2026-07-29 09:48:21');

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
CREATE TABLE IF NOT EXISTS `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int UNSIGNED NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('851d7500-c797-4347-b12b-28c0fdd2b854', '604240561552e88c0b54a023b5e17e0f2c5d3562d3d6b3c3321069c1ec38267a', '2026-07-27 16:38:52.625', '20260727163817_ini', NULL, NULL, '2026-07-27 16:38:17.523', 1),
('39616ed4-5e22-45be-95a9-79069830f231', 'a8ae59e67b9a2a8ac7799adc9c00a8a236374c854089ed0f223b7ff2e73b8bc9', '2026-07-29 16:57:11.410', '0_init', '', NULL, '2026-07-29 16:57:11.410', 0);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
