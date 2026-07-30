const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.instructor_schedule.findMany();
  console.log(JSON.stringify(rows, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());