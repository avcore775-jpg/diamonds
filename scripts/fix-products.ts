import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixProducts() {
  try {
    // Update products with appropriate names and real images
    const updates = [
      {
        oldSlug: 'diamond-ring-blue-nigger',
        newData: {
          name: 'Blue Sapphire Diamond Ring',
          slug: 'blue-sapphire-diamond-ring',
          description: 'Stunning platinum ring featuring a rare blue sapphire surrounded by brilliant-cut diamonds',
          image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&h=800&fit=crop'
        }
      },
      {
        oldSlug: 'diamond-neck-pendant-for-nigger-wife',
        newData: {
          name: 'Platinum Diamond Necklace',
          slug: 'platinum-diamond-necklace',
          description: 'Elegant platinum necklace with a pear-shaped diamond pendant',
          image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop'
        }
      },
      {
        oldSlug: 'diamond-ring-rose-gold',
        newData: {
          name: 'Rose Gold Diamond Ring',
          slug: 'rose-gold-diamond-ring',
          description: 'Romantic rose gold engagement ring with a cushion-cut diamond',
          image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop'
        }
      }
    ]

    for (const update of updates) {
      const existingProduct = await prisma.product.findUnique({
        where: { slug: update.oldSlug }
      })

      if (existingProduct) {
        await prisma.product.update({
          where: { slug: update.oldSlug },
          data: update.newData
        })
        console.log(`Updated product: ${update.oldSlug} -> ${update.newData.slug}`)
      } else {
        // Create new products if they don't exist
        await prisma.product.create({
          data: {
            ...update.newData,
            price: Math.floor(Math.random() * 50000) + 100000, // Random price between $1000-$1500
            stock: Math.floor(Math.random() * 5) + 1,
            carat: parseFloat((Math.random() * 2 + 0.5).toFixed(2)),
            weight: parseFloat((Math.random() * 5 + 2).toFixed(2)),
            isActive: true
          }
        })
        console.log(`Created new product: ${update.newData.name}`)
      }
    }

    // Add more luxury products if needed
    const additionalProducts = [
      {
        name: 'Emerald Cut Diamond Ring',
        slug: 'emerald-cut-diamond-ring',
        description: 'Classic emerald cut diamond set in white gold with side stones',
        price: 450000,
        image: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&h=800&fit=crop',
        stock: 2,
        carat: 2.5,
        weight: 4.2,
        isActive: true
      },
      {
        name: 'Diamond Tennis Bracelet',
        slug: 'diamond-tennis-bracelet',
        description: 'Timeless tennis bracelet with round brilliant diamonds',
        price: 280000,
        image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&h=800&fit=crop',
        stock: 3,
        carat: 3.0,
        weight: 12.5,
        isActive: true
      },
      {
        name: 'Diamond Stud Earrings',
        slug: 'diamond-stud-earrings',
        description: 'Classic diamond stud earrings in 18k white gold',
        price: 150000,
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&h=800&fit=crop',
        stock: 5,
        carat: 1.0,
        weight: 2.8,
        isActive: true
      }
    ]

    // Check if we need to add more products
    const productCount = await prisma.product.count()
    if (productCount < 6) {
      for (const product of additionalProducts) {
        const exists = await prisma.product.findUnique({
          where: { slug: product.slug }
        })
        
        if (!exists) {
          await prisma.product.create({
            data: product
          })
          console.log(`Added new product: ${product.name}`)
        }
      }
    }

    console.log('Products fixed successfully!')
  } catch (error) {
    console.error('Error fixing products:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixProducts()