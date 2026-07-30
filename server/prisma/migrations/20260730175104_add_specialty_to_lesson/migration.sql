-- DropForeignKey
ALTER TABLE `instructor_specialties` DROP FOREIGN KEY `instructor_specialties_instructor_id_fkey`;

-- DropForeignKey
ALTER TABLE `instructor_specialties` DROP FOREIGN KEY `instructor_specialties_specialty_id_fkey`;

-- DropForeignKey
ALTER TABLE `instructors` DROP FOREIGN KEY `instructors_staff_id_fkey`;

-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `users_role_id_fkey`;

-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `users_staff_id_fkey`;

-- AlterTable
ALTER TABLE `lesson` ADD COLUMN `specialty_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `instructors` ADD CONSTRAINT `fk_instructors_staff` FOREIGN KEY (`staff_id`) REFERENCES `staff`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lesson` ADD CONSTRAINT `lesson_specialty_id_fkey` FOREIGN KEY (`specialty_id`) REFERENCES `specialties`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `fk_users_staff` FOREIGN KEY (`staff_id`) REFERENCES `staff`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `instructor_specialties` ADD CONSTRAINT `fk_instructor_specialty_instructor` FOREIGN KEY (`instructor_id`) REFERENCES `instructors`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `instructor_specialties` ADD CONSTRAINT `fk_instructor_specialty_specialty` FOREIGN KEY (`specialty_id`) REFERENCES `specialties`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `instructor_schedule` ADD CONSTRAINT `instructor_schedule_instructor_id_fkey` FOREIGN KEY (`instructor_id`) REFERENCES `instructors`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `instructor_schedule` ADD CONSTRAINT `instructor_schedule_time_slot_id_fkey` FOREIGN KEY (`time_slot_id`) REFERENCES `time_slots`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
