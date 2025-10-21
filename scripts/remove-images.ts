import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function removeAllImages() {
  try {
    // Remove all product images - set to empty string
    const result = await prisma.product.updateMany({
      data: {
        image: ''
      }
    })
    
    console.log(`✅ Removed images from ${result.count} products`)
    console.log('All product images have been cleared')
  } catch (error) {
    console.error('Error removing images:', error)
  } finally {
    await prisma.$disconnect()
  }
}

removeAllImages()