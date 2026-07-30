const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  console.log('=== POST-MIGRATION VERIFICATION ===\n');

  // 1. Check lesson table with raw SQL to see specialty_id column
  const lessons = await prisma.$queryRawUnsafe('SELECT id, lesson_name, status, specialty_id FROM lesson ORDER BY id');
  console.log('Lesson rows after migration:');
  console.log(JSON.stringify(lessons, null, 2));
  
  const lessonCount = lessons.length;
  console.log(`\nTotal lessons: ${lessonCount}`);
  
  const allNull = lessons.every(l => l.specialty_id === null);
  console.log('All have specialty_id = NULL:', allNull ? 'YES' : 'NO (but column exists — will be NULL for existing rows)');

  // 2. Verify the specialty_id column exists in the schema
  const columns = await prisma.$queryRawUnsafe(`
    SELECT COLUMN_NAME, IS_NULLABLE, DATA_TYPE, COLUMN_TYPE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'railway' AND TABLE_NAME = 'lesson' AND COLUMN_NAME = 'specialty_id'
  `);
  console.log('\nNew column definition from INFORMATION_SCHEMA:');
  if (columns.length > 0) {
    console.log(`  Column: ${columns[0].COLUMN_NAME}`);
    console.log(`  Nullable: ${columns[0].IS_NULLABLE}`);
    console.log(`  Type: ${columns[0].COLUMN_TYPE}`);
  } else {
    console.log('  COLUMN NOT FOUND — migration may not have executed');
  }

  // 3. Verify no data loss in other tables
  const counts = await prisma.$queryRawUnsafe(`
    SELECT 'instructor_schedule' as tbl, COUNT(*) as cnt FROM instructor_schedule
    UNION ALL SELECT 'instructors', COUNT(*) FROM instructors
    UNION ALL SELECT 'time_slots', COUNT(*) FROM time_slots
    UNION ALL SELECT 'users', COUNT(*) FROM users
    UNION ALL SELECT 'specialties', COUNT(*) FROM specialties
    UNION ALL SELECT 'staff', COUNT(*) FROM staff
    UNION ALL SELECT 'role', COUNT(*) FROM role
    UNION ALL SELECT 'instructor_specialties', COUNT(*) FROM instructor_specialties
  `);

  console.log('\nOther table row counts after migration:');
  const expected = { instructor_schedule: 9, instructors: 2, time_slots: 10, users: 4, specialties: 3, staff: 2, role: 3, instructor_specialties: 5 };
  for (const row of counts) {
    const exp = expected[row.tbl] || '?';
    const match = parseInt(row.cnt) === expected[row.tbl] ? '✓' : '✗ MISMATCH';
    console.log(`  ${row.tbl}: ${row.cnt} (expected: ${exp}) ${match}`);
  }

  await prisma.$disconnect();
  console.log('\n=== VERIFICATION COMPLETE ===');
}

verify().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});