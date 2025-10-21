import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyUser(email: string) {
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { 
        emailVerified: new Date()
      }
    })
    
    console.log(`✅ User email verified:`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Name: ${user.name}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Verified: ${user.emailVerified}`)
    
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

const email = process.argv[2]

if (!email) {
  console.log('Usage: npx tsx scripts/verify-user.ts <email>')
  console.log('Example: npx tsx scripts/verify-user.ts user@gmail.com')
} else {
  verifyUser(email)
}