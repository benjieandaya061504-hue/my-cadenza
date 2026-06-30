/**
 * Generate bcrypt hashes for staff passwords
 * Run this to generate password hashes for the users table
 * Usage: node generate-passwords.js
 */

import bcrypt from 'bcrypt'

const passwords = {
  admin: 'admin123',
  frontdesk1: 'front123',
  frontdesk2: 'front456',
  instructor1: 'inst123',
  instructor2: 'inst456'
}

async function generateHashes() {
  console.log('Generating bcrypt hashes for staff passwords...')
  console.log('')

  const hashes = {}

  for (const [key, password] of Object.entries(passwords)) {
    const hash = await bcrypt.hash(password, 10)
    hashes[key] = hash
    console.log(`${key}: ${password} -> ${hash}`)
  }

  console.log('')
  console.log('SQL INSERT statements for users table:')
  console.log("INSERT INTO users (username, email, password, staff_id, role, status) VALUES")
  console.log(`('juan.cruz@cadenza.com', 'juan.cruz@cadenza.com', '${hashes.admin}', 1, 'staff', 'approved'),`)
  console.log(`('maria.santos@cadenza.com', 'maria.santos@cadenza.com', '${hashes.frontdesk1}', 2, 'staff', 'approved'),`)
  console.log(`('pedro.gonzales@cadenza.com', 'pedro.gonzales@cadenza.com', '${hashes.instructor1}', 3, 'staff', 'approved'),`)
  console.log(`('ana.villanueva@cadenza.com', 'ana.villanueva@cadenza.com', '${hashes.frontdesk2}', 4, 'staff', 'approved'),`)
  console.log(`('carlos.fernandez@cadenza.com', 'carlos.fernandez@cadenza.com', '${hashes.instructor2}', 5, 'staff', 'approved');`)
}

generateHashes()
