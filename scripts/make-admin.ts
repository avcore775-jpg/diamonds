import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function makeUserAdmin(email: string) {
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { 
        role: 'ADMIN',
        emailVerified: new Date() // Also verify email
      }
    })
    
    console.log(`✅ Successfully updated user to ADMIN:`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Name: ${user.name}`)
    console.log(`   Role: ${user.role}`)
    
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

// Get email from command line argument
const email = process.argv[2]

if (!email) {
  console.log('Usage: npx tsx scripts/make-admin.ts <email>')
  console.log('Example: npx tsx scripts/make-admin.ts avcore775@gmail.com')
} else {
  makeUserAdmin(email)
}