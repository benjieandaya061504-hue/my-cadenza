/**
 * Environment Setup Script
 * Creates a .env file from .env.example if it doesn't exist
 * Usage: node setup-env.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.join(__dirname, '.env')
const envExamplePath = path.join(__dirname, '.env.example')

function setupEnv() {
  console.log('')
  console.log('╔════════════════════════════════════════════╗')
  console.log('║     Environment Setup Script              ║')
  console.log('╚════════════════════════════════════════════╝')
  console.log('')

  if (fs.existsSync(envPath)) {
    console.log('✅ .env file already exists')
    console.log(`   Location: ${envPath}`)
    console.log('')
    console.log('Current .env contents:')
    console.log('─'.repeat(50))
    const envContent = fs.readFileSync(envPath, 'utf8')
    // Mask passwords in output
    const maskedContent = envContent.replace(/(DB_PASSWORD=).*/g, '$1****')
    console.log(maskedContent)
    console.log('─'.repeat(50))
    return
  }

  if (!fs.existsSync(envExamplePath)) {
    console.error('❌ .env.example not found')
    console.log('   Creating a basic .env file...')
    
    const basicEnv = `# Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=cadenza_music_db

# Server Configuration
PORT=5000
CORS_ORIGIN=http://localhost:5173
`
    fs.writeFileSync(envPath, basicEnv)
    console.log('✅ Created basic .env file')
    console.log('')
    console.log('⚠️  Please update the database credentials in .env:')
    console.log('   - DB_HOST: Your MySQL server host (default: 127.0.0.1)')
    console.log('   - DB_PORT: Your MySQL server port (default: 3306)')
    console.log('   - DB_USER: Your MySQL username (default: root)')
    console.log('   - DB_PASSWORD: Your MySQL password')
    console.log('   - DB_NAME: Database name (default: cadenza_music_db)')
    return
  }

  // Copy from .env.example
  const exampleContent = fs.readFileSync(envExamplePath, 'utf8')
  fs.writeFileSync(envPath, exampleContent)
  
  console.log('✅ Created .env file from .env.example')
  console.log(`   Location: ${envPath}`)
  console.log('')
  console.log('⚠️  Please update the database credentials in .env:')
  console.log('   - DB_HOST: Your MySQL server host (default: 127.0.0.1)')
  console.log('   - DB_PORT: Your MySQL server port (default: 3306)')
  console.log('   - DB_USER: Your MySQL username (default: root)')
  console.log('   - DB_PASSWORD: Your MySQL password')
  console.log('   - DB_NAME: Database name (default: cadenza_music_db)')
}

setupEnv()
