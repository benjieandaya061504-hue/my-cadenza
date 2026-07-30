const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setSpecialties() {
  console.log('Setting lesson specialties...\n');

  // Lesson 1: Piano → specialty_id 3 (Piano)
  const l1 = await prisma.lesson.update({
    where: { id: 1 },
    data: { specialty_id: 3 },
  });
  console.log(`Lesson 1: "${l1.lesson_name}" → specialty_id = ${l1.specialty_id}`);

  // Lesson 2: Drum → specialty_id 1 (Drum)
  const l2 = await prisma.lesson.update({
    where: { id: 2 },
    data: { specialty_id: 1 },
  });
  console.log(`Lesson 2: "${l2.lesson_name}" → specialty_id = ${l2.specialty_id}`);

  // Lesson 3: Guitar Lesson 1 → specialty_id 2 (Guitar)
  const l3 = await prisma.lesson.update({
    where: { id: 3 },
    data: { specialty_id: 2 },
  });
  console.log(`Lesson 3: "${l3.lesson_name}" → specialty_id = ${l3.specialty_id}`);

  // Verify
  const all = await prisma.lesson.findMany({ orderBy: { id: 'asc' } });
  console.log('\nAll lessons after update:');
  console.log(JSON.stringify(all, null, 2));

  await prisma.$disconnect();
}

setSpecialties().catch(err => {
  console.error('Failed:', err);
  process.exit(1);
});