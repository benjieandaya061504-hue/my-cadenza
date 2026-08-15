const http = require('http');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  // Check instructor 4 specifically
  console.log('=== Instructor 4 schedule:');
  const is4 = await prisma.instructor_schedule.findMany({ where: { instructor_id: 4 } });
  console.log(`  ${is4.length} rows, statuses: ${is4.map(i => `"${i.status}"`).join(', ')}`);

  // Check instructor 1
  console.log('=== Instructor 1 schedule:');
  const is1 = await prisma.instructor_schedule.findMany({ where: { instructor_id: 1 } });
  console.log(`  ${is1.length} rows, statuses: ${is1.map(i => `"${i.status}"`).join(', ')}`);

  // Check active enrollments
  const activeEnrollments = await prisma.enrollments.findMany({ where: { status: 'Active' }, select: { class_id: true } });
  const allBookedClassIds = [...new Set(activeEnrollments.map(e => e.class_id))];
  console.log(`\n=== Active enrollments: ${activeEnrollments.length} total, ${allBookedClassIds.length} unique class IDs`);

  if (allBookedClassIds.length > 0) {
    const bookedClasses = await prisma.classes.findMany({
      where: { id: { in: allBookedClassIds } },
      select: { id: true, instructor_id: true, class_date: true, start_time: true }
    });
    console.log(`Booked classes: ${JSON.stringify(bookedClasses, (k,v)=>typeof v==='bigint'?v.toString():v, 2)}`);
    
    // Check if any belong to instructors 1,2,4
    for (const instId of [1,2,4]) {
      const instBooked = bookedClasses.filter(c => c.instructor_id === instId);
      console.log(`  Instructor ${instId}: ${instBooked.length} booked classes`);
    }
  }

  await prisma.$disconnect();

  // Also check what lesson-packages returns
  http.get('http://localhost:5000/api/public/lesson-packages', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const json = JSON.parse(data);
      json.data.forEach(pkg => {
        const ids = pkg.instructors.map(i => i.id);
        console.log(`Package "${pkg.package_name}": instructor IDs = ${JSON.stringify(ids)}`);
      });
    });
  }).on('error', e => console.log('HTTP Error:', e.message));
}

run().catch(e => { console.error(e); process.exit(1); });