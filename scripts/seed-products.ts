import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedProducts() {
  try {
    // Get collections
    const winterCarol = await prisma.collection.findUnique({ where: { slug: 'winter-carol' } })
    const customRings = await prisma.collection.findUnique({ where: { slug: 'custom-rings' } })
    const amazonian = await prisma.collection.findUnique({ where: { slug: 'amazonian' } })

    if (!winterCarol || !customRings || !amazonian) {
      console.log('Collections not found!')
      return
    }

    // Winter Carol Collection Products
    const winterProducts = [
      {
        name: 'Snowflake Eternity Necklace',
        slug: 'snowflake-eternity-necklace',
        description: 'An exquisite masterpiece inspired by nature\'s most delicate creation. This stunning necklace features a cascade of brilliant-cut diamonds arranged in intricate snowflake patterns, each one unique yet harmonious. The 18k white gold setting enhances the icy brilliance of 3.5 carats of VVS1 diamonds, creating a mesmerizing dance of light that captures the ethereal beauty of winter\'s first snowfall.',
        price: 12500, // $125.00
        comparePrice: 15000,
        carat: 3.5,
        weight: 28.5,
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=2000',
        images: [
          'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=2000',
          'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2000'
        ],
        stock: 5,
        tags: ['necklace', 'winter', 'luxury', 'diamonds', 'white-gold'],
        collectionId: winterCarol.id,
        isFeatured: true
      },
      {
        name: 'Frost Queen Tiara Ring',
        slug: 'frost-queen-tiara-ring',
        description: 'Reign over winter\'s kingdom with this architectural marvel. The ring features a crown-like design with graduated diamonds that rise like frozen peaks, centered with a spectacular 2.1 carat princess-cut diamond. Smaller brilliant diamonds cascade down the band like morning frost, creating an effect that\'s both regal and enchanting. This piece embodies the majesty of winter royalty.',
        price: 8900,
        comparePrice: 10500,
        carat: 2.1,
        weight: 8.2,
        image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=2000',
        images: [
          'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=2000',
          'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?q=80&w=2000'
        ],
        stock: 8,
        tags: ['ring', 'winter', 'luxury', 'tiara', 'princess-cut'],
        collectionId: winterCarol.id
      },
      {
        name: 'Arctic Aurora Bracelet',
        slug: 'arctic-aurora-bracelet',
        description: 'Inspired by the Northern Lights dancing across polar skies, this bracelet weaves together white and blue diamonds in a fluid pattern that mimics the aurora\'s ethereal movement. Set in platinum with articulated links, each segment catches and reflects light differently, creating a living spectrum of brilliance. The 4.2 carats of carefully selected diamonds ensure maximum fire and scintillation.',
        price: 15750,
        comparePrice: 18900,
        carat: 4.2,
        weight: 35.8,
        image: 'https://images.unsplash.com/photo-1611955167811-4711904bb9f8?q=80&w=2000',
        images: [
          'https://images.unsplash.com/photo-1611955167811-4711904bb9f8?q=80&w=2000',
          'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2000'
        ],
        stock: 3,
        tags: ['bracelet', 'winter', 'luxury', 'aurora', 'platinum'],
        collectionId: winterCarol.id
      }
    ]

    // Custom Rings Collection Products
    const ringProducts = [
      {
        name: 'Eternal Promise Solitaire',
        slug: 'eternal-promise-solitaire',
        description: 'The ultimate expression of commitment, featuring a magnificent 3.0 carat round brilliant diamond in our signature six-prong setting. The band tapers elegantly to showcase the center stone, while hidden diamonds on the gallery add a secret sparkle. Each ring is custom-crafted to your specifications, ensuring your love story is told in every detail. GIA certified center stone with excellent cut grade.',
        price: 25000,
        comparePrice: 29900,
        carat: 3.0,
        weight: 6.5,
        image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=2000',
        images: [
          'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=2000',
          'https://images.unsplash.com/photo-1608042314453-ae338d80c427?q=80&w=2000'
        ],
        stock: 4,
        tags: ['ring', 'engagement', 'solitaire', 'custom', 'luxury'],
        collectionId: customRings.id,
        isFeatured: true
      },
      {
        name: 'Vintage Rose Halo Ring',
        slug: 'vintage-rose-halo-ring',
        description: 'Romance meets artistry in this breathtaking vintage-inspired design. A cushion-cut pink diamond takes center stage, surrounded by a double halo of white diamonds that creates depth and dimension. The band features intricate milgrain detailing and hand-engraved flourishes, while the rose gold setting warms the entire piece with a romantic glow. A true heirloom piece for the modern romantic.',
        price: 18500,
        comparePrice: 22000,
        carat: 2.5,
        weight: 7.8,
        image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=2000',
        images: [
          'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=2000',
          'https://images.unsplash.com/photo-1598560917807-1bae44bd2be8?q=80&w=2000'
        ],
        stock: 6,
        tags: ['ring', 'vintage', 'rose-gold', 'halo', 'pink-diamond'],
        collectionId: customRings.id
      },
      {
        name: 'Modern Trinity Band',
        slug: 'modern-trinity-band',
        description: 'Three bands intertwined in perfect harmony, representing past, present, and future. Each band is fully set with diamonds - white, yellow, and cognac - creating a rich tapestry of color and light. The contemporary design allows for comfortable daily wear while making a sophisticated statement. Customizable with different diamond colors to match your personal style.',
        price: 7500,
        comparePrice: 8900,
        carat: 1.8,
        weight: 9.2,
        image: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?q=80&w=2000',
        images: [
          'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?q=80&w=2000',
          'https://images.unsplash.com/photo-1603561596112-0a132b757442?q=80&w=2000'
        ],
        stock: 10,
        tags: ['ring', 'trinity', 'modern', 'stackable', 'multi-color'],
        collectionId: customRings.id
      }
    ]

    // Amazonian Spirit Collection Products
    const amazonianProducts = [
      {
        name: 'Warrior Princess Choker',
        slug: 'warrior-princess-choker',
        description: 'Bold and unapologetic, this statement choker commands attention with its fierce design. Geometric patterns inspired by tribal shields are rendered in black rhodium-plated gold, set with cognac and black diamonds that create dramatic contrast. The articulated design ensures comfort while maintaining its powerful silhouette. For the woman who leads with strength and walks with purpose.',
        price: 22000,
        comparePrice: 26500,
        carat: 5.2,
        weight: 42.5,
        image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?q=80&w=2000',
        images: [
          'https://images.unsplash.com/photo-1611652022419-a9419f74343d?q=80&w=2000',
          'https://images.unsplash.com/photo-1535556116002-6281ff3e9f36?q=80&w=2000'
        ],
        stock: 2,
        tags: ['necklace', 'choker', 'statement', 'black-diamonds', 'bold'],
        collectionId: amazonian.id,
        isFeatured: true
      },
      {
        name: 'Wild Spirit Ear Climbers',
        slug: 'wild-spirit-ear-climbers',
        description: 'Defy convention with these striking ear climbers that trace the natural curve of your ear like exotic vines. Featuring an asymmetric design with diamonds of varying sizes, they create movement and dimension that\'s both organic and sophisticated. The oxidized silver finish adds an edgy contrast to the brilliant stones, perfect for the free spirit who refuses to be tamed.',
        price: 4800,
        comparePrice: 5900,
        carat: 1.2,
        weight: 8.5,
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=2000',
        images: [
          'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=2000',
          'https://images.unsplash.com/photo-1588444650733-d0767b753fc8?q=80&w=2000'
        ],
        stock: 12,
        tags: ['earrings', 'climbers', 'edgy', 'asymmetric', 'statement'],
        collectionId: amazonian.id
      },
      {
        name: 'Forest Guardian Cuff',
        slug: 'forest-guardian-cuff',
        description: 'A powerful talisman for the modern warrior, this substantial cuff bracelet features carved patterns reminiscent of ancient tree bark. Champagne and green diamonds are scattered like dewdrops across the textured surface, while the interior bears an empowering inscription. The open design allows for adjustment while maintaining its bold presence. Wear it as armor for your daily battles.',
        price: 13200,
        comparePrice: 15900,
        carat: 3.8,
        weight: 48.0,
        image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2000',
        images: [
          'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2000',
          'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?q=80&w=2000'
        ],
        stock: 5,
        tags: ['bracelet', 'cuff', 'statement', 'textured', 'green-diamonds'],
        collectionId: amazonian.id
      }
    ]

    // Create all products
    console.log('Creating Winter Carol products...')
    for (const product of winterProducts) {
      await prisma.product.create({
        data: {
          ...product,
          price: product.price * 100, // Convert to cents
          comparePrice: product.comparePrice ? product.comparePrice * 100 : null,
          isActive: true,
          sku: `WC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }
      })
    }

    console.log('Creating Custom Rings products...')
    for (const product of ringProducts) {
      await prisma.product.create({
        data: {
          ...product,
          price: product.price * 100, // Convert to cents
          comparePrice: product.comparePrice ? product.comparePrice * 100 : null,
          isActive: true,
          sku: `CR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }
      })
    }

    console.log('Creating Amazonian Spirit products...')
    for (const product of amazonianProducts) {
      await prisma.product.create({
        data: {
          ...product,
          price: product.price * 100, // Convert to cents
          comparePrice: product.comparePrice ? product.comparePrice * 100 : null,
          isActive: true,
          sku: `AS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }
      })
    }

    console.log('✅ Successfully created 9 products across 3 collections!')

    // Show summary
    const summary = await prisma.collection.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      }
    })

    console.log('\n=== COLLECTION SUMMARY ===')
    summary.forEach(col => {
      console.log(`${col.name}: ${col._count.products} products`)
    })

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedProducts()