import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testCheckout() {
  try {
    // Get admin user
    const user = await prisma.user.findFirst({
      where: { email: 'avcore775@gmail.com' }
    })
    
    if (!user) {
      console.error('User not found')
      return
    }
    
    console.log('🧪 Testing checkout for user:', user.email)
    
    // Check if user is verified
    if (!user.emailVerified) {
      console.log('⚠️  User email not verified, updating...')
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() }
      })
    }
    
    // Check cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: { product: true }
    })
    
    if (cartItems.length === 0) {
      console.log('📦 Cart is empty, adding a test item...')
      
      const product = await prisma.product.findFirst({
        where: { isActive: true, stock: { gt: 0 } }
      })
      
      if (!product) {
        console.error('No products available')
        return
      }
      
      await prisma.cartItem.create({
        data: {
          userId: user.id,
          productId: product.id,
          quantity: 1
        }
      })
      
      console.log('✅ Added product to cart:', product.name)
    }
    
    // Refresh cart items
    const updatedCart = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: { product: true }
    })
    
    console.log(`\n🛒 Cart contents (${updatedCart.length} items):`)
    let subtotal = 0
    updatedCart.forEach(item => {
      const itemTotal = item.product.price * item.quantity
      subtotal += itemTotal
      console.log(`  - ${item.product.name} x${item.quantity} = $${(itemTotal / 100).toFixed(2)}`)
    })
    
    const shipping = subtotal > 100000 ? 0 : 1500
    const tax = Math.round(subtotal * 0.08)
    const total = subtotal + shipping + tax
    
    console.log(`\n💰 Order Summary:`)
    console.log(`  Subtotal: $${(subtotal / 100).toFixed(2)}`)
    console.log(`  Shipping: $${(shipping / 100).toFixed(2)}`)
    console.log(`  Tax: $${(tax / 100).toFixed(2)}`)
    console.log(`  Total: $${(total / 100).toFixed(2)}`)
    
    console.log('\n✅ Checkout data is ready!')
    console.log('📝 User should now be able to checkout with:')
    console.log('  - Email verified: Yes')
    console.log('  - Cart has items: Yes')
    console.log('  - Meets minimum order: ' + (subtotal >= 10000 ? 'Yes' : 'No'))
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testCheckout()