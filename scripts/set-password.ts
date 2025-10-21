import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function setUserPassword(email: string, password: string) {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Update user password
    const user = await prisma.user.update({
      where: { email },
      data: { 
        password: hashedPassword,
        emailVerified: new Date() // Also verify email
      }
    })
    
    console.log(`✅ Password successfully set for user:`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Name: ${user.name}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Password: ${password}`)
    console.log('\n⚠️  Keep this password safe!')
    
  } catch (error: any) {
    if (error.code === 'P2025') {
      console.log(`❌ User with email "${email}" not found`)
    } else {
      console.error('Error:', error)
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Get email and password from command line arguments
const email = process.argv[2]
const password = process.argv[3]

if (!email || !password) {
  console.log('Usage: npx tsx scripts/set-password.ts <email> <password>')
  console.log('Example: npx tsx scripts/set-password.ts user@example.com mypassword123')
} else {
  setUserPassword(email, password)
}