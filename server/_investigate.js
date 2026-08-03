const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  // Step 1: Check if instructor_schedule model exists in Prisma client
  const models = Object.keys(prisma).filter(k => k.startsWith('instructor_'));
  console.log('=== Step 1: Models starting with instructor_:', models);

  // Step 2: Try query via Prisma model
  try {
    const count = await prisma.instructor_schedule.count();
    console.log('instructor_schedule count (via model):', count);
  } catch(e) {
    console.log('instructor_schedule via model ERROR:', e.message);
  }

  // Step 3: Raw SQL - find all data
  try {
    const rows = await prisma.$queryRawUnsafe('SELECT isch.*, ts.start_time, ts.end_time, s.f_name, s.l_name FROM instructor_schedule isch LEFT JOIN time_slots ts ON isch.time_slot_id = ts.id LEFT JOIN instructors i ON isch.instructor_id = i.id LEFT JOIN staff s ON i.staff_id = s.id LIMIT 50');
    console.log('\n=== instructor_schedule data (raw SQL):');
    console.log(JSON.stringify(rows, null, 2));
  } catch(e) {
    console.log('Raw SQL ERROR:', e.message);
  }

  // Step 4: Check distinct status values
  try {
    const statuses = await prisma.$queryRawUnsafe('SELECT DISTINCT status FROM instructor_schedule');
    console.log('\n=== Distinct status values:');
    statuses.forEach(s => console.log(`  "${s.status}" (length: ${s.status.length}, chars: ${s.status.split('').map(c => c.charCodeAt(0))})`));
  } catch(e) {
    console.log('Status query ERROR:', e.message);
  }

  // Step 5: Check distinct instructors
  try {
    const instructors = await prisma.$queryRawUnsafe('SELECT DISTINCT instructor_id FROM instructor_schedule');
    console.log('\n=== Instructors with schedule entries:');
    console.log(JSON.stringify(instructors, null, 2));
  } catch(e) {
    console.log('Instructor query ERROR:', e.message);
  }

  // Step 6: Check time_slots table
  try {
    const slots = await prisma.$queryRawUnsafe('SELECT * FROM time_slots ORDER BY start_time');
    console.log('\n=== time_slots:');
    console.log(JSON.stringify(slots, null, 2));
  } catch(e) {
    console.log('time_slots ERROR:', e.message);
  }

  await prisma.$disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });