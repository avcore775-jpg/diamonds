import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        createdAt: true
      }
    })

    console.log('=== EXISTING USERS ===\n')
    
    if (users.length === 0) {
      console.log('No users found in database')
    } else {
      users.forEach(user => {
        console.log(`Email: ${user.email}`)
        console.log(`Name: ${user.name || 'Not set'}`)
        console.log(`Role: ${user.role}`)
        console.log(`Email Verified: ${user.emailVerified ? 'Yes' : 'No'}`)
        console.log(`Created: ${user.createdAt}`)
        console.log('---')
      })
    }

    // Show admin users specifically
    const admins = users.filter(u => u.role === 'ADMIN')
    console.log(`\nTotal users: ${users.length}`)
    console.log(`Admin users: ${admins.length}`)
    
    if (admins.length > 0) {
      console.log('\n=== ADMIN ACCOUNTS ===')
      admins.forEach(admin => {
        console.log(`- ${admin.email}`)
      })
    }

  } catch (error) {
    console.error('Error listing users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

listUsers()