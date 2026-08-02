const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { id: 1 },
    update: { role_name: 'admin' },
    create: { id: 1, role_name: 'admin' },
  })
  console.log(`Created role: ${adminRole.role_name}`)

  const frontdeskRole = await prisma.role.upsert({
    where: { id: 2 },
    update: { role_name: 'frontdesk' },
    create: { id: 2, role_name: 'frontdesk' },
  })
  console.log(`Created role: ${frontdeskRole.role_name}`)

  const instructorRole = await prisma.role.upsert({
    where: { id: 3 },
    update: { role_name: 'instructor' },
    create: { id: 3, role_name: 'instructor' },
  })
  console.log(`Created role: ${instructorRole.role_name}`)

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 10)
  const frontdeskPassword = await bcrypt.hash('frontdesk123', 10)

  // Create admin user
  const adminUser = await prisma.users.upsert({
    where: { email: 'admin@cadenzamusic.com' },
    update: { password: adminPassword, role_id: 1, status: 'active' },
    create: {
      email: 'admin@cadenzamusic.com',
      password: adminPassword,
      role_id: 1,
      status: 'active',
    },
  })
  console.log(`Created admin user: ${adminUser.email}`)

  // Create frontdesk user
  const frontdeskUser = await prisma.users.upsert({
    where: { email: 'frontdesk@cadenzamusic.com' },
    update: { password: frontdeskPassword, role_id: 2, status: 'active' },
    create: {
      email: 'frontdesk@cadenzamusic.com',
      password: frontdeskPassword,
      role_id: 2,
      status: 'active',
    },
  })
  console.log(`Created frontdesk user: ${frontdeskUser.email}`)

  console.log('Seeding complete!')
  console.log('\nCredentials:')
  console.log('  Admin:     admin@cadenzamusic.com / admin123')
  console.log('  Frontdesk: frontdesk@cadenzamusic.com / frontdesk123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })