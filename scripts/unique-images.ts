import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function assignUniqueImages() {
  try {
    console.log('🎨 Assigning unique images to all products...\n')

    // Unique images for each product
    const productImages = [
      // Rings
      {
        slug: 'diamond-ring-blue-nigga',
        image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=2000',
        images: [
          'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=2000',
          'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?q=80&w=2000'
        ]
      },
      {
        slug: 'rose-gold-diamond-ring',
        image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=2000',
        images: [
          'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=2000',
          'https://images.unsplash.com/photo-1608042314453-ae338d80c427?q=80&w=2000'
        ]
      },
      {
        slug: 'blue-sapphire-diamond-ring',
        image: 'https://images.unsplash.com/photo-1609042551507-76950e5e8fb0?q=80&w=2000',
        images: [
          'https://images.unsplash.com/photo-1609042551507-76950e5e8fb0?q=80&w=2000',
          'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?q=80&w=2000'
        ]
      },
      {
        slug: 'emerald-cut-diamond-ring',
        image: 'https://images.unsplash.com/photo-1598560917807-1bae44bd2be8?q=80&w=2000',
        images: [
          'https://images.unsplash.com/photo-1598560917807-1bae44bd2be8?q=80&w=2000',
          'https://images.unsplash.com/photo-1603561596112-0a132b757442?q=80&w=2000'
        ]
      },
      {
        slug: 'frost-queen-tiara-ring',
        image: 'https://images.unsplash.com/photo-1602855894875-a33d50a07868?q=80&w=2000',
        images: [
          'https://images.unsplash.com/photo-1602855894875-a33d50a07868?q=80&w=2000',
          'https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?q=80&w=2000'
        ]
      },
      {
        slug: 'eternal-promise-solitaire',
        image: 'https://images.unsplash.com/photo-1610694955371-d4a3e0ce4b52?q=80&w=2000',
        images: [
          'https://images.unsplash.com/photo-1610694955371-d4a3e0ce4b52?q=80&w=2000',
          'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=2000'
        ]
      },
      {
        slug: 'vintage-rose-halo-ring',
        image: 'https://images.unsplash.com/photo-1599534723266-ba3d891f5f59?q=80&w=2000',
        images: [
          'https://images.unsplash.com/photo-1599534723266-ba3d891f5f59?q=80&w=2000',
          'https://images.unsplash.com/photo-1598560916037-f0c0c3fd9db8?q=80&w=2000'
        ]
      },
      {
        slug: 'modern-trinity-band',
        image: 'https://images.unsplash.com/photo-1602752250142-ec8218bacc10?q=80&w=2000',
        images: [
          'https://images.unsplash.com/photo-1602752250142-ec8218bacc10?q=80&w=2000',
          'https://images.unsplash.com/photo-1515651673514-56a5f962c945?q=80&w=2000'
        ]
      },
      
      // Necklaces
      {
        slug: 'neck-nigger-diamond',
        image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2000',
        images: [
          'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2000',
          'https://images.unsplash.com/photo-1611652022633-9cf349d25c28?q=80&w=2000'
        ]
      },
      {
        slug: 'platinum-diamond-necklace',
        image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?q=80&w=2000',
        images: [
          'https://images.unsplash.com/photo-1611652022419-a9419f74343d?q=80&w=2000',
          'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?q=80&w=2000'
        ]
      },
      {
        slug: 'snowflake-eternity-necklace',
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=2000',
        images: [
          'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=2000',
          'https://images.unsplash.com/photo-1589128777073-263566ae5e4d?q=80&w=2000'
        ]
      },
      {
        slug: 'warrior-princess-choker',
        image: 'https://images.unsplash.com/photo-1535556116002-6281ff3e9f36?q=80&w=2000',
        images: [
          'https://images.unsplash.com/photo-1535556116002-6281ff3e9f36?q=80&w=2000',
          'https://images.unsplash.com/photo-1611652022754-0e2731b63201?q=80&w=2000'
        ]
      },
      
      // Bracelets
      {
        slug: 'diamond-tennis-bracelet',
        image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2000',
        images: [
          'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2000',
          'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=2000'
        ]
      },
      {
        slug: 'arctic-aurora-bracelet',
        image: 'https://images.unsplash.com/photo-1611955167811-4711904bb9f8?q=80&w=2000',
        images: [
          'https://images.unsplash.com/photo-1611955167811-4711904bb9f8?q=80&w=2000',
          'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?q=80&w=2000'
        ]
      },
      {
        slug: 'forest-guardian-cuff',
        image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?q=80&w=2000',
        images: [
          'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?q=80&w=2000',
          'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2000'
        ]
      },
      
      // Earrings
      {
        slug: 'diamond-stud-earrings',
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=2000',
        images: [
          'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=2000',
          'https://images.unsplash.com/photo-1629224316810-9d8805b95e76?q=80&w=2000'
        ]
      },
      {
        slug: 'wild-spirit-ear-climbers',
        image: 'https://images.unsplash.com/photo-1588444650733-d0767b753fc8?q=80&w=2000',
        images: [
          'https://images.unsplash.com/photo-1588444650733-d0767b753fc8?q=80&w=2000',
          'https://images.unsplash.com/photo-1603400521630-9f2de124b33b?q=80&w=2000'
        ]
      }
    ]

    // Update each product with unique images
    for (const item of productImages) {
      const { slug, ...imageData } = item
      
      await prisma.product.update({
        where: { slug },
        data: imageData
      })
      
      console.log(`✅ Updated unique images for: ${slug}`)
    }

    console.log('\n✨ All products now have unique images!')
    
    // Verify no duplicates
    const allProducts = await prisma.product.findMany({
      select: { name: true, image: true, slug: true }
    })
    
    const imageMap = new Map()
    let duplicates = 0
    
    allProducts.forEach(p => {
      if (imageMap.has(p.image)) {
        console.log(`⚠️  Duplicate image found: ${p.name} and ${imageMap.get(p.image)}`)
        duplicates++
      } else {
        imageMap.set(p.image, p.name)
      }
    })
    
    if (duplicates === 0) {
      console.log('\n✅ Verified: All products have unique primary images!')
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

assignUniqueImages()