import { PrismaClient } from "@prisma/client"
import { readFileSync } from "fs"
import { join } from "path"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Create admin user
  const adminEmail = "admin@example.com"
  await prisma.user.upsert({
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

  // Load products from JSON file
  const productsData = JSON.parse(
    readFileSync(join(__dirname, "products-data.json"), "utf-8")
  )

  for (const product of productsData) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    })
    console.log(`✅ Product created: ${product.name}`)
  }

  console.log(`🎉 Seeding completed successfully! Created ${productsData.length} products.`)
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
