import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testCart() {
  try {
    // Get admin user
    const user = await prisma.user.findFirst({
      where: { email: 'avcore775@gmail.com' }
    })
    
    if (!user) {
      console.error('User not found')
      return
    }
    
    console.log('🧪 Testing cart for user:', user.email)
    
    // Clear existing cart
    await prisma.cartItem.deleteMany({
      where: { userId: user.id }
    })
    console.log('✅ Cart cleared')
    
    // Get a product to add
    const product = await prisma.product.findFirst({
      where: { isActive: true, stock: { gt: 0 } }
    })
    
    if (!product) {
      console.error('No products available')
      return
    }
    
    console.log(`📦 Adding product: ${product.name}`)
    
    // Add item to cart
    const cartItem = await prisma.cartItem.create({
      data: {
        userId: user.id,
        productId: product.id,
        quantity: 1
      },
      include: { product: true }
    })
    
    console.log('✅ Item added to cart:', cartItem.id)
    
    // Fetch cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: { product: true }
    })
    
    console.log(`\n🛒 Cart contents (${cartItems.length} items):`)
    cartItems.forEach(item => {
      console.log(`  - ${item.product.name} x${item.quantity} = $${(item.product.price * item.quantity / 100).toFixed(2)}`)
    })
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testCart()