/**
 * Generate bcrypt hashes for staff passwords
 * Run this to generate password hashes for the Staff_Auth table
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
  console.log('SQL INSERT statements:')
  console.log("INSERT INTO Staff_Auth (auth_id, staff_id, email, password, last_login) VALUES")
  console.log(`(1, 1, 'juan.cruz@cadenza.com', '${hashes.admin}', NULL),`)
  console.log(`(2, 2, 'maria.santos@cadenza.com', '${hashes.frontdesk1}', NULL),`)
  console.log(`(3, 3, 'pedro.gonzales@cadenza.com', '${hashes.instructor1}', NULL),`)
  console.log(`(4, 4, 'ana.villanueva@cadenza.com', '${hashes.frontdesk2}', NULL),`)
  console.log(`(5, 5, 'carlos.fernandez@cadenza.com', '${hashes.instructor2}', NULL);`)
}

generateHashes()
