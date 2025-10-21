import { prisma } from '../src/lib/prisma'

async function updateProductImages() {
  try {
    // Update product images with placeholder images
    await prisma.product.updateMany({
      where: { 
        OR: [
          { slug: 'diamond-ring-rose-gold' },
        ]
      },
      data: {
        image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop'
      }
    })

    await prisma.product.updateMany({
      where: { 
        OR: [
          { slug: 'diamond-necklace-platinum' },
        ]
      },
      data: {
        image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop'
      }
    })

    await prisma.product.updateMany({
      where: { 
        OR: [
          { slug: 'diamond-ring-blue-sapphire' },
        ]
      },
      data: {
        image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&h=800&fit=crop'
      }
    })

    console.log('Product images updated successfully!')
  } catch (error) {
    console.error('Error updating product images:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateProductImages()