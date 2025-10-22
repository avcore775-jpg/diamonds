import { PrismaClient } from "@prisma/client"
import { writeFileSync } from "fs"
import { join } from "path"

const prisma = new PrismaClient()

async function exportProducts() {
  console.log("📦 Exporting products from database...")

  const products = await prisma.product.findMany({
    select: {
      name: true,
      slug: true,
      description: true,
      carat: true,
      weight: true,
      price: true,
      image: true,
      images: true,
      stock: true,
      isActive: true,
      isFeatured: true,
      tags: true,
      comparePrice: true,
      sku: true,
    },
  })

  console.log(`✅ Found ${products.length} products`)

  // Write to file
  const outputPath = join(process.cwd(), "scripts", "products-export.json")
  writeFileSync(outputPath, JSON.stringify(products, null, 2))

  console.log(`✅ Exported to ${outputPath}`)
  console.log("\n📋 Products:")
  products.forEach((p, i) => {
    console.log(`${i + 1}. ${p.name} - $${(p.price / 100).toFixed(2)}`)
  })
}

exportProducts()
  .catch((e) => {
    console.error("❌ Export failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
