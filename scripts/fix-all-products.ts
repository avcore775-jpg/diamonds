import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixAllProducts() {
  try {
    console.log('🚀 Starting product fix...\n')

    // Step 1: Create categories
    console.log('📁 Creating categories...')
    const categories = [
      {
        name: 'Rings',
        slug: 'rings',
        description: 'Exquisite diamond rings for every occasion - from engagement rings to fashion bands',
        image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=2000'
      },
      {
        name: 'Necklaces',
        slug: 'necklaces',
        description: 'Stunning diamond necklaces and pendants that add elegance to any outfit',
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=2000'
      },
      {
        name: 'Bracelets',
        slug: 'bracelets',
        description: 'Luxurious diamond bracelets and bangles that wrap your wrist in brilliance',
        image: 'https://images.unsplash.com/photo-1611955167811-4711904bb9f8?q=80&w=2000'
      },
      {
        name: 'Earrings',
        slug: 'earrings',
        description: 'Beautiful diamond earrings from classic studs to dramatic chandeliers',
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=2000'
      }
    ]

    for (const cat of categories) {
      await prisma.category.upsert({
        where: { slug: cat.slug },
        update: cat,
        create: cat
      })
    }

    const createdCategories = await prisma.category.findMany()
    const catMap = Object.fromEntries(createdCategories.map(c => [c.slug, c.id]))

    console.log('✅ Categories created\n')

    // Step 2: Get all products
    const products = await prisma.product.findMany()
    
    console.log(`📦 Found ${products.length} products to fix\n`)

    // Product updates with categories and images
    const productUpdates = [
      {
        slug: 'diamond-ring-blue-nigga',
        name: 'Blue Diamond Signature Ring',
        categoryId: catMap['rings'],
        image: 'https://images.unsplash.com/photo-1603561596112-0a132b757442?q=80&w=2000',
        images: [
          'https://images.unsplash.com/photo-1603561596112-0a132b757442?q=80&w=2000',
          'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=2000'
        ],
        description: 'A stunning blue diamond ring featuring a rare 2.5 carat natural blue diamond surrounded by brilliant white diamonds. Set in platinum for eternal elegance.',
        price: 15000 * 100, // Fix price to reasonable amount
        tags: ['ring', 'blue-diamond', 'luxury', 'platinum']
      },
      {
        slug: 'neck-nigger-diamond',
        name: 'Exclusive Diamond Pendant',
        categoryId: catMap['necklaces'],
        image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2000',
        images: [
          'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2000',
          'https://images.unsplash.com/photo-1611652022419-a9419f74343d?q=80&w=2000'
        ],
        description: 'An exclusive diamond pendant featuring a pear-shaped center stone of exceptional clarity. The perfect statement piece for special occasions.',
        price: 8500 * 100, // Fix price
        tags: ['necklace', 'pendant', 'luxury', 'pear-shaped']
      },
      {
        slug: 'rose-gold-diamond-ring',
        categoryId: catMap['rings'],
        image: 'https://images.unsplash.com/photo-1598560917807-1bae44bd2be8?q=80&w=2000',
        images: [
          'https://images.unsplash.com/photo-1598560917807-1bae44bd2be8?q=80&w=2000',
          'https://images.unsplash.com/photo-1608042314453-ae338d80c427?q=80&w=2000'
        ],
        tags: ['ring', 'rose-gold', 'engagement', 'romantic']
      },
      {
        slug: 'blue-sapphire-diamond-ring',
        categoryId: catMap['rings'],
        image: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?q=80&w=2000',
        images: [
          'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?q=80&w=2000',
          'https://images.unsplash.com/photo-1609042551507-76950e5e8fb0?q=80&w=2000'
        ],
        tags: ['ring', 'sapphire', 'blue', 'luxury', 'gemstone']
      },
      {
        slug: 'platinum-diamond-necklace',
        categoryId: catMap['necklaces'],
        image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?q=80&w=2000',
        images: [
          'https://images.unsplash.com/photo-1611652022419-a9419f74343d?q=80&w=2000',
          'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=2000'
        ],
        tags: ['necklace', 'platinum', 'luxury', 'statement']
      },
      {
        slug: 'emerald-cut-diamond-ring',
        categoryId: catMap['rings'],
        image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=2000',
        images: [
          'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=2000',
          'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=2000'
        ],
        tags: ['ring', 'emerald-cut', 'engagement', 'classic', 'luxury']
      },
      {
        slug: 'diamond-tennis-bracelet',
        categoryId: catMap['bracelets'],
        image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2000',
        images: [
          'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2000',
          'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?q=80&w=2000'
        ],
        tags: ['bracelet', 'tennis', 'classic', 'timeless']
      },
      {
        slug: 'diamond-stud-earrings',
        categoryId: catMap['earrings'], // Fix category - this is earrings not rings!
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=2000',
        images: [
          'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=2000',
          'https://images.unsplash.com/photo-1588444650733-d0767b753fc8?q=80&w=2000'
        ],
        tags: ['earrings', 'studs', 'classic', 'everyday', 'timeless']
      },
      // Now the collection products
      {
        slug: 'snowflake-eternity-necklace',
        categoryId: catMap['necklaces'],
        tags: ['necklace', 'winter', 'luxury', 'diamonds', 'white-gold', 'statement']
      },
      {
        slug: 'frost-queen-tiara-ring',
        categoryId: catMap['rings'],
        tags: ['ring', 'winter', 'luxury', 'tiara', 'princess-cut', 'statement']
      },
      {
        slug: 'arctic-aurora-bracelet',
        categoryId: catMap['bracelets'],
        tags: ['bracelet', 'winter', 'luxury', 'aurora', 'platinum', 'statement']
      },
      {
        slug: 'eternal-promise-solitaire',
        categoryId: catMap['rings'],
        tags: ['ring', 'engagement', 'solitaire', 'custom', 'luxury', 'classic']
      },
      {
        slug: 'vintage-rose-halo-ring',
        categoryId: catMap['rings'],
        tags: ['ring', 'vintage', 'rose-gold', 'halo', 'pink-diamond', 'romantic']
      },
      {
        slug: 'modern-trinity-band',
        categoryId: catMap['rings'],
        tags: ['ring', 'trinity', 'modern', 'stackable', 'multi-color', 'contemporary']
      },
      {
        slug: 'warrior-princess-choker',
        categoryId: catMap['necklaces'],
        tags: ['necklace', 'choker', 'statement', 'black-diamonds', 'bold', 'edgy']
      },
      {
        slug: 'wild-spirit-ear-climbers',
        categoryId: catMap['earrings'], // Fix - these are earrings!
        tags: ['earrings', 'climbers', 'edgy', 'asymmetric', 'statement', 'modern']
      },
      {
        slug: 'forest-guardian-cuff',
        categoryId: catMap['bracelets'],
        tags: ['bracelet', 'cuff', 'statement', 'textured', 'green-diamonds', 'bold']
      }
    ]

    // Update all products
    console.log('🔧 Updating products...')
    for (const update of productUpdates) {
      const { slug, ...data } = update
      await prisma.product.update({
        where: { slug },
        data
      })
      console.log(`  ✅ Updated: ${slug}`)
    }

    console.log('\n📊 Final Summary:')
    
    // Show final counts
    for (const [name, id] of Object.entries(catMap)) {
      const count = await prisma.product.count({
        where: { categoryId: id }
      })
      console.log(`  ${name}: ${count} products`)
    }

    console.log('\n✨ All products fixed successfully!')

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixAllProducts()