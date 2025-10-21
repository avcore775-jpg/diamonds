import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function directVerify(email: string) {
  try {
    // Get the user
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      console.log(`❌ User ${email} not found`)
      return
    }
    
    // Directly verify the user
    await prisma.user.update({
      where: { email },
      data: { 
        emailVerified: new Date()
      }
    })
    
    // Mark any tokens as used
    await prisma.emailVerification.updateMany({
      where: { 
        userId: user.id,
        used: false
      },
      data: { 
        used: true 
      }
    })
    
    console.log(`✅ Successfully verified: ${email}`)
    console.log(`   You can now log in with this account!`)
    
    // Generate a proper verification URL for next time
    const newToken = await prisma.emailVerification.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })
    
    if (newToken) {
      console.log(`\n📧 For reference, the verification URL was:`)
      console.log(`   http://localhost:3001/api/auth/verify-email?token=${newToken.token}`)
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

const email = process.argv[2]

if (!email) {
  console.log('Usage: npx tsx scripts/direct-verify.ts <email>')
  console.log('Example: npx tsx scripts/direct-verify.ts user@gmail.com')
} else {
  directVerify(email)
}