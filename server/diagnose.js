const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function diagnose() {
  console.log('=== DIAGNOSIS ===\n');

  // 1. Lesson table - all rows with specialty_id
  const lessons = await prisma.$queryRawUnsafe('SELECT id, lesson_name, specialty_id, status FROM lesson ORDER BY id');
  console.log('1. Lesson table:');
  console.log(JSON.stringify(lessons, null, 2));

  // 2. Specialties table
  const specialties = await prisma.$queryRawUnsafe('SELECT * FROM specialties ORDER BY id');
  console.log('\n2. Specialties:');
  console.log(JSON.stringify(specialties, null, 2));

  // 3. Instructor specialties
  const instrSpecs = await prisma.$queryRawUnsafe('SELECT * FROM instructor_specialties ORDER BY instructor_id, specialty_id');
  console.log('\n3. Instructor specialties:');
  console.log(JSON.stringify(instrSpecs, null, 2));

  // 4. Instructors
  const instructors = await prisma.$queryRawUnsafe('SELECT id, staff_id FROM instructors ORDER BY id');
  console.log('\n4. Instructors:');
  console.log(JSON.stringify(instructors, null, 2));

  // 5. Test the query that would be used for available-instructors
  // First, check if any lesson has a specialty_id
  const lessonWithSpecialty = await prisma.$queryRawUnsafe('SELECT id, lesson_name, specialty_id FROM lesson WHERE specialty_id IS NOT NULL');
  console.log('\n5. Lessons with specialty_id set:');
  console.log(JSON.stringify(lessonWithSpecialty, null, 2));

  // 6. Show the actual schema of the lesson table
  const columns = await prisma.$queryRawUnsafe(`
    SELECT COLUMN_NAME, IS_NULLABLE, DATA_TYPE, COLUMN_KEY
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'railway' AND TABLE_NAME = 'lesson'
    ORDER BY ORDINAL_POSITION
  `);
  console.log('\n6. Lesson table columns:');
  console.log(JSON.stringify(columns, null, 2));

  // 7. Count packages
  const pkgCount = await prisma.$queryRawUnsafe('SELECT COUNT(*) as cnt FROM packages');
  console.log('\n7. Package count:');
  console.log(String(pkgCount[0].cnt));

  await prisma.$disconnect();
}

diagnose().catch(err => {
  console.error('Diagnosis failed:', err);
  process.exit(1);
});