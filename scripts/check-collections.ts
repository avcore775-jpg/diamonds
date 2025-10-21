import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkCollections() {
  try {
    const collections = await prisma.collection.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      }
    })

    console.log('=== EXISTING COLLECTIONS ===\n')
    collections.forEach(collection => {
      console.log(`Name: ${collection.name}`)
      console.log(`Slug: ${collection.slug}`)
      console.log(`Description: ${collection.description || 'No description'}`)
      console.log(`Products: ${collection._count.products}`)
      console.log(`Active: ${collection.isActive}`)
      console.log('---')
    })

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCollections()