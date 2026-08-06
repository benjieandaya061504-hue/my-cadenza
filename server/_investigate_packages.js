const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Describe the packages table (real columns)
  const [cols] = await prisma.$queryRawUnsafe('DESCRIBE packages');
  console.log('=== REAL PACKAGES TABLE COLUMNS ===');
  cols.forEach(c => console.log(c.Field, '|', c.Type, '|', c.Null === 'YES' ? 'NULL' : 'NOT NULL', '|', 'Default:', c.Default, '|', 'Key:', c.Key));

  // 2. Sample rows across different lesson_ids
  console.log('\n=== SAMPLE ROWS (ordered by lesson_id, id) ===');
  const rows = await prisma.$queryRawUnsafe('SELECT * FROM packages ORDER BY lesson_id, id LIMIT 20');
  console.log(JSON.stringify(rows, null, 2));

  // 3. Count per lesson_id
  console.log('\n=== PACKAGE COUNT PER LESSON_ID ===');
  const counts = await prisma.$queryRawUnsafe('SELECT lesson_id, COUNT(*) as cnt FROM packages GROUP BY lesson_id ORDER BY lesson_id');
  console.log(JSON.stringify(counts, null, 2));

  // 4. Lessons for reference
  console.log('\n=== LESSONS ===');
  const lessons = await prisma.lesson.findMany({ orderBy: { id: 'asc' } });
  console.log(JSON.stringify(lessons, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());