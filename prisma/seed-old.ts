import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Create admin user
  const adminEmail = "admin@example.com"
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Admin User",
      role: "ADMIN",
      emailVerified: new Date(),
    },
  })
  console.log("✅ Admin user created:", adminEmail)

  // Create demo products
  const products = [
    {
      name: "Classic Solitaire Diamond Ring",
      slug: "classic-solitaire-diamond-ring",
      description: "Timeless elegance with a brilliant-cut 1.5 carat diamond set in 18k white gold. The perfect symbol of eternal love.",
      price: 899900, // $8,999.00 in cents
      image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80",
      images: ["https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80", "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80"],
      stock: 5,
      carat: 1.5,
      isFeatured: true,
      tags: ["engagement", "solitaire", "white-gold"],
    },
    {
      name: "Emerald Cut Diamond Earrings",
      slug: "emerald-cut-diamond-earrings",
      description: "Sophisticated emerald-cut diamond studs featuring 2.0 carats total weight in platinum settings. Exceptional clarity and brilliance.",
      price: 1249900, // $12,499.00
      image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80",
      images: ["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80", "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80"],
      stock: 8,
      carat: 2.0,
      isFeatured: true,
      tags: ["earrings", "emerald-cut", "platinum"],
    },
    {
      name: "Halo Diamond Engagement Ring",
      slug: "halo-diamond-engagement-ring",
      description: "Stunning halo design with a 1.2 carat center stone surrounded by micro-pave diamonds in rose gold. Modern romance at its finest.",
      price: 749900, // $7,499.00
      image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80",
      images: ["https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80", "https://images.unsplash.com/photo-1600459176532-d3c0e95e0bdb?w=800&q=80"],
      stock: 12,
      carat: 1.2,
      isFeatured: true,
      tags: ["engagement", "halo", "rose-gold"],
    },
    {
      name: "Princess Cut Diamond Pendant",
      slug: "princess-cut-diamond-pendant",
      description: "Elegant princess-cut diamond pendant on an 18-inch white gold chain. Perfect for everyday luxury or special occasions.",
      price: 329900, // $3,299.00
      image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800&q=80",
      images: ["https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800&q=80", "https://images.unsplash.com/photo-1612803897481-fe4ac5a0f5cb?w=800&q=80"],
      stock: 15,
      carat: 0.75,
      tags: ["pendant", "princess-cut", "white-gold"],
    },
    {
      name: "Diamond Tennis Bracelet",
      slug: "diamond-tennis-bracelet",
      description: "Classic tennis bracelet featuring 5 carats of round brilliant diamonds in platinum. A timeless addition to any jewelry collection.",
      price: 1899900, // $18,999.00
      image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80",
      images: ["https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80", "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80"],
      stock: 6,
      carat: 5.0,
      isFeatured: true,
      tags: ["bracelet", "tennis", "platinum"],
    },
    {
      name: "Three Stone Diamond Ring",
      slug: "three-stone-diamond-ring",
      description: "Symbolic three-stone design representing past, present, and future. Features 2.5 carats total weight in yellow gold.",
      price: 949900, // $9,499.00
      image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80",
      images: ["https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80", "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&q=80"],
      stock: 10,
      carat: 2.5,
      tags: ["engagement", "three-stone", "yellow-gold"],
    },
    {
      name: "Cushion Cut Diamond Ring",
      slug: "cushion-cut-diamond-ring",
      description: "Vintage-inspired cushion-cut diamond ring with intricate band detailing. 1.8 carats in white gold setting.",
      price: 849900, // $8,499.00
      image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80",
      images: ["https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80", "https://images.unsplash.com/photo-1611955167811-4711904bb9f8?w=800&q=80"],
      stock: 7,
      carat: 1.8,
      tags: ["engagement", "cushion-cut", "white-gold", "vintage"],
    },
    {
      name: "Diamond Eternity Band",
      slug: "diamond-eternity-band",
      description: "Stunning eternity band with continuous diamonds around the entire band. 3.0 carats total in platinum.",
      price: 1149900, // $11,499.00
      image: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&q=80",
      images: ["https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&q=80", "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80"],
      stock: 9,
      carat: 3.0,
      isFeatured: true,
      tags: ["band", "eternity", "platinum"],
    },
    {
      name: "Pear Shaped Diamond Necklace",
      slug: "pear-shaped-diamond-necklace",
      description: "Graceful pear-shaped diamond necklace on a delicate rose gold chain. 1.0 carat stone with exceptional fire and brilliance.",
      price: 449900, // $4,499.00
      image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80",
      images: ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80", "https://images.unsplash.com/photo-1612803897481-fe4ac5a0f5cb?w=800&q=80"],
      stock: 20,
      carat: 1.0,
      tags: ["necklace", "pear-shaped", "rose-gold"],
    },
    {
      name: "Oval Diamond Hoop Earrings",
      slug: "oval-diamond-hoop-earrings",
      description: "Modern oval diamond hoop earrings in white gold. 1.5 carats total weight with secure clasp closure.",
      price: 549900, // $5,499.00
      image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80",
      images: ["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80", "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800&q=80"],
      stock: 14,
      carat: 1.5,
      tags: ["earrings", "hoop", "oval", "white-gold"],
    },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    })
    console.log(`✅ Product created: ${product.name}`)
  }

  console.log("🎉 Seeding completed successfully!")
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })