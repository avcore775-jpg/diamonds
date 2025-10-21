import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkTokens() {
  try {
    const tokens = await prisma.emailVerification.findMany({
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('=== EMAIL VERIFICATION TOKENS ===\n')
    
    if (tokens.length === 0) {
      console.log('No verification tokens found')
    } else {
      tokens.forEach(token => {
        console.log(`User: ${token.user.email}`)
        console.log(`Token: ${token.token}`)
        console.log(`Used: ${token.used ? 'Yes' : 'No'}`)
        console.log(`Expires: ${token.expiresAt}`)
        console.log(`Valid: ${!token.used && token.expiresAt > new Date() ? '✅ Valid' : '❌ Invalid'}`)
        console.log('---')
      })
    }

    // Show users without verification
    const unverifiedUsers = await prisma.user.findMany({
      where: {
        emailVerified: null
      },
      select: {
        email: true,
        name: true,
        createdAt: true
      }
    })

    if (unverifiedUsers.length > 0) {
      console.log('\n=== UNVERIFIED USERS ===')
      unverifiedUsers.forEach(user => {
        console.log(`- ${user.email} (created: ${user.createdAt})`)
      })
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkTokens()