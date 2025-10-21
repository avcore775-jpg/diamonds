import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to checkout" },
        { status: 401 }
      )
    }

    // Check if email is verified
    if (!session.user.emailVerified) {
      console.log("Email not verified for user:", session.user.email)
      return NextResponse.json(
        { error: "Please verify your email before making a purchase" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { shippingAddress } = body

    console.log("Checkout request body:", JSON.stringify(body, null, 2))

    if (!shippingAddress) {
      console.log("Missing shipping address")
      return NextResponse.json(
        { error: "Shipping address is required" },
        { status: 400 }
      )
    }

    // Get user's cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: { product: true },
    })

    console.log("Cart items found:", cartItems.length)

    if (cartItems.length === 0) {
      console.log("Cart is empty for user:", session.user.id)
      return NextResponse.json(
        { error: "Your cart is empty" },
        { status: 400 }
      )
    }

    // Validate and calculate total with fresh price data
    // This prevents price manipulation attacks
    const validatedItems = await Promise.all(
      cartItems.map(async (item) => {
        // Get fresh product data to ensure current pricing
        const product = await prisma.product.findUnique({
          where: { id: item.productId }
        })

        console.log(`Validating product ${item.product.name}: active=${product?.isActive}, stock=${product?.stock}, quantity=${item.quantity}`)

        if (!product || !product.isActive) {
          const errorMsg = `Product ${item.product.name} is no longer available`
          console.log("Product validation failed:", errorMsg)
          throw new Error(errorMsg)
        }

        if (product.stock < item.quantity) {
          const errorMsg = `Insufficient stock for ${product.name}`
          console.log("Stock validation failed:", errorMsg)
          throw new Error(errorMsg)
        }

        return {
          ...item,
          product, // Use fresh product data
          verifiedPrice: product.price // Server-verified price
        }
      })
    ).catch((error) => {
      console.log("Validation error caught:", error.message)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    })
    
    if (!Array.isArray(validatedItems)) return validatedItems
    
    // Calculate totals using server-verified prices
    const subtotal = validatedItems.reduce((sum, item) => {
      return sum + item.verifiedPrice * item.quantity
    }, 0)
    
    const shipping = subtotal > 100000 ? 0 : 1500 // Free shipping over $1000
    const tax = Math.round(subtotal * 0.08) // 8% tax
    const total = subtotal + shipping + tax
    
    console.log("Subtotal:", subtotal, "Shipping:", shipping, "Tax:", tax, "Total:", total)

    // Minimum order validation for jewelry
    if (subtotal < 10000) { // $100 minimum
      console.log("Order below minimum amount. Subtotal:", subtotal / 100)
      return NextResponse.json(
        { error: "Minimum order amount is $100" },
        { status: 400 }
      )
    }
    
    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Create order in database
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        orderNumber,
        subtotal,
        shipping,
        tax,
        total,
        shippingAddress,
        status: "PENDING",
        paymentStatus: "PENDING",
        orderItems: {
          create: validatedItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.verifiedPrice, // Use server-verified price
            discount: 0,
          })),
        },
      },
      include: {
        orderItems: {
          include: { product: true },
        },
      },
    })

    // Create Stripe checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: validatedItems.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.product.name,
            description: item.product.description || item.product.name,
            // Only include valid HTTPS URLs for Stripe
            ...(item.product.image && item.product.image.startsWith('https://') 
              ? { images: [item.product.image] }
              : {}),
          },
          unit_amount: item.verifiedPrice, // Use server-verified price
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/cart`,
      customer_email: session.user.email,
      metadata: {
        orderId: order.id,
        userId: session.user.id,
      },
    })

    // Update order with Stripe session ID
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: stripeSession.id },
    })

    return NextResponse.json({ url: stripeSession.url })
  } catch (error: any) {
    console.error("Checkout error:", error)
    
    // Return more specific error messages
    if (error.message) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Something went wrong during checkout" },
      { status: 500 }
    )
  }
}