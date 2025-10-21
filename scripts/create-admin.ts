import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    // Admin credentials
    const adminEmail = 'admin@example.com'
    const adminPassword = 'admin123456' // Change this after first login!
    const adminName = 'Admin User'

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    if (existingAdmin) {
      console.log('Admin user already exists!')
      
      // Update to admin role if not already
      if (existingAdmin.role !== 'ADMIN') {
        await prisma.user.update({
          where: { email: adminEmail },
          data: { role: 'ADMIN' }
        })
        console.log('Updated user to ADMIN role')
      }
      
      return
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 10)

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: adminName,
        role: 'ADMIN',
        emailVerified: new Date(), // Mark as verified
        isActive: true
      }
    })

    console.log('Admin user created successfully!')
    console.log('Email:', adminEmail)
    console.log('Password:', adminPassword)
    console.log('ID:', admin.id)
    console.log('\n⚠️  IMPORTANT: Change the password after first login!')

  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()