import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function auditProducts() {
  try {
    // Get all products
    const products = await prisma.product.findMany({
      include: {
        category: true,
        collection: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    console.log(`\n=== TOTAL PRODUCTS: ${products.length} ===\n`)

    // Get all categories
    const categories = await prisma.category.findMany()
    console.log(`=== EXISTING CATEGORIES: ${categories.length} ===`)
    categories.forEach(cat => {
      console.log(`- ${cat.name} (${cat.slug})`)
    })

    console.log('\n=== PRODUCT DETAILS ===\n')
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`)
      console.log(`   Slug: ${product.slug}`)
      console.log(`   Category: ${product.category?.name || '❌ NO CATEGORY'}`)
      console.log(`   Collection: ${product.collection?.name || 'None'}`)
      console.log(`   Image: ${product.image ? '✅ Has image' : '❌ NO IMAGE'}`)
      console.log(`   Price: $${(product.price / 100).toFixed(2)}`)
      console.log(`   Stock: ${product.stock}`)
      console.log(`   Tags: ${product.tags.join(', ') || 'None'}`)
      
      // Determine what category it should be based on name/tags
      let suggestedCategory = 'Unknown'
      const nameAndTags = `${product.name} ${product.tags.join(' ')}`.toLowerCase()
      
      if (nameAndTags.includes('ring') || nameAndTags.includes('band') || nameAndTags.includes('solitaire')) {
        suggestedCategory = 'Rings'
      } else if (nameAndTags.includes('necklace') || nameAndTags.includes('pendant') || nameAndTags.includes('choker')) {
        suggestedCategory = 'Necklaces'
      } else if (nameAndTags.includes('bracelet') || nameAndTags.includes('bangle') || nameAndTags.includes('cuff')) {
        suggestedCategory = 'Bracelets'
      } else if (nameAndTags.includes('earring') || nameAndTags.includes('stud') || nameAndTags.includes('climber')) {
        suggestedCategory = 'Earrings'
      }
      
      if (!product.category || product.category.name !== suggestedCategory) {
        console.log(`   ⚠️  SUGGESTED CATEGORY: ${suggestedCategory}`)
      }
      
      console.log('---')
    })

    // Summary
    console.log('\n=== SUMMARY ===')
    const noCategory = products.filter(p => !p.category).length
    const noImage = products.filter(p => !p.image).length
    
    console.log(`Products without category: ${noCategory}`)
    console.log(`Products without image: ${noImage}`)
    
    if (noCategory > 0) {
      console.log('\n⚠️  Products need category assignment:')
      products.filter(p => !p.category).forEach(p => {
        console.log(`- ${p.name}`)
      })
    }
    
    if (noImage > 0) {
      console.log('\n⚠️  Products need images:')
      products.filter(p => !p.image).forEach(p => {
        console.log(`- ${p.name}`)
      })
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

auditProducts()