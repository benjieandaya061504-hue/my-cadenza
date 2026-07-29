-- CreateTable
CREATE TABLE `band_rooms` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `room_name` VARCHAR(100) NULL,
    `hourly_rate` DECIMAL(10, 2) NULL,
    `status` VARCHAR(50) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clients` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `f_name` VARCHAR(100) NULL,
    `m_name` VARCHAR(100) NULL,
    `l_name` VARCHAR(100) NULL,
    `phone` VARCHAR(20) NULL,
    `email` VARCHAR(191) NULL,
    `address` TEXT NULL,
    `users_id` INTEGER NULL,

    INDEX `fk_clients_users`(`users_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `equipments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `equipment_name` VARCHAR(100) NULL,
    `quantity` INTEGER NULL,
    `brand` VARCHAR(100) NULL,
    `rental_rate` DECIMAL(10, 2) NULL,
    `rate_type` VARCHAR(50) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `instructors` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `staff_id` INTEGER NOT NULL,

    UNIQUE INDEX `staff_id`(`staff_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `instruments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `instrument_name` VARCHAR(100) NULL,
    `brand` VARCHAR(100) NULL,
    `model` VARCHAR(100) NULL,
    `serial_number` VARCHAR(100) NULL,
    `quantity` INTEGER NULL,
    `status` VARCHAR(50) NULL,
    `rental_rate` DECIMAL(10, 2) NULL,
    `rate_type` VARCHAR(50) NULL,
    `purchase_date` DATE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `learning_materials` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NULL,
    `file_name` VARCHAR(255) NULL,
    `file_path` TEXT NULL,
    `uploaded_date` DATETIME(0) NULL,
    `lesson_id` INTEGER NOT NULL,

    INDEX `fk_material_lesson`(`lesson_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lesson` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `lesson_name` VARCHAR(100) NULL,
    `status` VARCHAR(50) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lesson_rooms` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `room_name` VARCHAR(100) NULL,
    `status` VARCHAR(50) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `packages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `package_name` VARCHAR(100) NULL,
    `duration` VARCHAR(100) NULL,
    `session` INTEGER NULL,
    `fee` DECIMAL(10, 2) NOT NULL,
    `status` VARCHAR(50) NULL,
    `total_session` INTEGER NULL,
    `lesson_id` INTEGER NOT NULL,
    `level_name` VARCHAR(100) NULL,

    INDEX `fk_packages_lesson`(`lesson_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rental_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `item_type` VARCHAR(50) NULL,
    `quantity` INTEGER NULL,
    `rental_fee` DECIMAL(10, 2) NULL,
    `rental_id` INTEGER NULL,
    `instrument_id` INTEGER NULL,
    `equipment_id` INTEGER NULL,
    `rental_rate` DECIMAL(10, 2) NULL,
    `subtotal` DECIMAL(10, 2) NULL,

    INDEX `fk_rental_items_equipment`(`equipment_id`),
    INDEX `fk_rental_items_instrument`(`instrument_id`),
    INDEX `fk_rental_items_rental`(`rental_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rentals` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rental_date` DATETIME(0) NULL,
    `due_date` DATETIME(0) NULL,
    `return_date` DATETIME(0) NULL,
    `total_amount` DECIMAL(10, 2) NULL,
    `status` VARCHAR(50) NULL,
    `client_id` INTEGER NULL,

    INDEX `fk_rentals_client`(`client_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `role_name` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `staff` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `f_name` VARCHAR(100) NULL,
    `m_name` VARCHAR(100) NULL,
    `l_name` VARCHAR(100) NULL,
    `gender` VARCHAR(20) NULL,
    `contact_no` VARCHAR(20) NULL,
    `email` VARCHAR(191) NULL,
    `address` TEXT NULL,
    `hire_date` DATE NULL,
    `status` VARCHAR(50) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `students` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `student_number` VARCHAR(50) NULL,
    `enrollment_date` DATE NULL,
    `guardian_name` VARCHAR(100) NULL,
    `guardian_no` VARCHAR(20) NULL,
    `status` VARCHAR(50) NULL,
    `client_id` INTEGER NULL,
    `email` VARCHAR(191) NULL,
    `users_id` INTEGER NULL,

    INDEX `fk_students_client`(`client_id`),
    INDEX `fk_students_users`(`users_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role_id` INTEGER NOT NULL,
    `staff_id` INTEGER NULL,
    `status` VARCHAR(50) NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `email`(`email`),
    INDEX `fk_users_role`(`role_id`),
    INDEX `fk_users_staff`(`staff_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `band_room_rentals` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `client_id` INTEGER NOT NULL,
    `band_room_id` INTEGER NOT NULL,
    `rental_date` DATE NULL,
    `start_time` TIME(0) NULL,
    `end_time` TIME(0) NULL,
    `total_amount` DECIMAL(10, 2) NULL,
    `status` VARCHAR(50) NULL,

    INDEX `fk_band_room_rental_client`(`client_id`),
    INDEX `fk_band_room_rental_room`(`band_room_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `classes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `package_id` INTEGER NOT NULL,
    `instructor_id` INTEGER NOT NULL,
    `lesson_room_id` INTEGER NOT NULL,
    `class_date` DATE NOT NULL,
    `start_time` TIME(0) NOT NULL,
    `end_time` TIME(0) NOT NULL,
    `capacity` INTEGER NULL,
    `status` VARCHAR(50) NULL DEFAULT 'Open',

    INDEX `fk_classes_instructor`(`instructor_id`),
    INDEX `fk_classes_package`(`package_id`),
    INDEX `fk_classes_room`(`lesson_room_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `enrollments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `student_id` INTEGER NOT NULL,
    `class_id` INTEGER NOT NULL,
    `package_id` INTEGER NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `enrollment_date` DATE NULL,
    `start_date` DATE NULL,
    `end_date` DATE NULL,
    `status` VARCHAR(50) NULL DEFAULT 'Active',

    INDEX `fk_enrollments_class`(`class_id`),
    INDEX `fk_enrollments_package`(`package_id`),
    INDEX `fk_enrollments_student`(`student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `instructor_specialties` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `instructor_id` INTEGER NOT NULL,
    `specialty_id` INTEGER NOT NULL,

    INDEX `fk_instructor_specialty_instructor`(`instructor_id`),
    INDEX `fk_instructor_specialty_specialty`(`specialty_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `client_id` INTEGER NULL,
    `student_id` INTEGER NULL,
    `enrollment_id` INTEGER NULL,
    `rental_id` INTEGER NULL,
    `band_room_rental_id` INTEGER NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `payment_date` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `payment_method` VARCHAR(50) NULL,
    `status` VARCHAR(50) NULL DEFAULT 'Paid',

    INDEX `fk_payment_band_room_rental`(`band_room_rental_id`),
    INDEX `fk_payment_client`(`client_id`),
    INDEX `fk_payment_enrollment`(`enrollment_id`),
    INDEX `fk_payment_rental`(`rental_id`),
    INDEX `fk_payment_student`(`student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `specialties` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `specialty_name` VARCHAR(255) NULL,
    `status` VARCHAR(50) NULL DEFAULT 'Active',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `clients` ADD CONSTRAINT `fk_clients_users` FOREIGN KEY (`users_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `instructors` ADD CONSTRAINT `fk_instructors_staff` FOREIGN KEY (`staff_id`) REFERENCES `staff`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `learning_materials` ADD CONSTRAINT `fk_learning_materials_lesson` FOREIGN KEY (`lesson_id`) REFERENCES `lesson`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `packages` ADD CONSTRAINT `fk_packages_lesson` FOREIGN KEY (`lesson_id`) REFERENCES `lesson`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `rental_items` ADD CONSTRAINT `fk_rental_items_equipment` FOREIGN KEY (`equipment_id`) REFERENCES `equipments`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `rental_items` ADD CONSTRAINT `fk_rental_items_instrument` FOREIGN KEY (`instrument_id`) REFERENCES `instruments`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `rental_items` ADD CONSTRAINT `fk_rental_items_rental` FOREIGN KEY (`rental_id`) REFERENCES `rentals`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `rentals` ADD CONSTRAINT `fk_rentals_client` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `fk_students_client` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `fk_students_users` FOREIGN KEY (`users_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `role`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `fk_users_staff` FOREIGN KEY (`staff_id`) REFERENCES `staff`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `band_room_rentals` ADD CONSTRAINT `fk_band_room_rental_client` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `band_room_rentals` ADD CONSTRAINT `fk_band_room_rental_room` FOREIGN KEY (`band_room_id`) REFERENCES `band_rooms`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `classes` ADD CONSTRAINT `fk_classes_instructor` FOREIGN KEY (`instructor_id`) REFERENCES `instructors`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `classes` ADD CONSTRAINT `fk_classes_package` FOREIGN KEY (`package_id`) REFERENCES `packages`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `classes` ADD CONSTRAINT `fk_classes_room` FOREIGN KEY (`lesson_room_id`) REFERENCES `lesson_rooms`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `enrollments` ADD CONSTRAINT `fk_enrollments_class` FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `enrollments` ADD CONSTRAINT `fk_enrollments_package` FOREIGN KEY (`package_id`) REFERENCES `packages`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `enrollments` ADD CONSTRAINT `fk_enrollments_student` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `instructor_specialties` ADD CONSTRAINT `fk_instructor_specialty_instructor` FOREIGN KEY (`instructor_id`) REFERENCES `instructors`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `instructor_specialties` ADD CONSTRAINT `fk_instructor_specialty_specialty` FOREIGN KEY (`specialty_id`) REFERENCES `specialties`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `fk_payment_band_room_rental` FOREIGN KEY (`band_room_rental_id`) REFERENCES `band_room_rentals`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `fk_payment_client` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `fk_payment_enrollment` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `fk_payment_rental` FOREIGN KEY (`rental_id`) REFERENCES `rentals`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `fk_payment_student` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
