import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import { z } from "zod"
import { rateLimit } from "@/lib/middleware/rateLimiter"

// Validation schemas
const guestCartItemSchema = z.object({
  productId: z.string().uuid("Invalid product ID format"),
  quantity: z.number().int().min(1, "Quantity must be at least 1").max(10, "Quantity cannot exceed 10")
})

const guestCartSchema = z.array(guestCartItemSchema).min(1, "Cart cannot be empty").max(20, "Too many items in cart")

const emailSchema = z.string().email("Invalid email format").min(5, "Email too short").max(255, "Email too long")

export async function POST(req: NextRequest) {
  try {
    // Rate limiting - 10 requests per 15 minutes
    const rateLimitResult = await rateLimit(req)
    if (rateLimitResult) {
      console.log("Rate limit exceeded for checkout")
      return rateLimitResult
    }

    const session = await getServerSession(authOptions)
    const body = await req.json()
    const { shippingAddress, cartItems: clientCartItems, guestEmail } = body

    console.log("Checkout request body:", JSON.stringify(body, null, 2))

    // Validate shipping address
    if (!shippingAddress) {
      console.log("Missing shipping address")
      return NextResponse.json(
        { error: "Shipping address is required" },
        { status: 400 }
      )
    }

    // Determine if this is a guest or registered user checkout
    const isGuest = !session?.user?.id
    let customerEmail: string
    let userId: string | undefined
    let cartItems: any[]

    if (isGuest) {
      // Guest checkout
      if (!guestEmail) {
        return NextResponse.json(
          { error: "Email is required for guest checkout" },
          { status: 400 }
        )
      }

      // Validate email format with Zod
      try {
        emailSchema.parse(guestEmail)
      } catch (error) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 }
        )
      }

      if (!clientCartItems || !Array.isArray(clientCartItems) || clientCartItems.length === 0) {
        return NextResponse.json(
          { error: "Cart items are required for guest checkout" },
          { status: 400 }
        )
      }

      // Validate guest cart items with Zod
      try {
        const validatedCart = guestCartSchema.parse(clientCartItems)
        customerEmail = guestEmail
        userId = undefined

        // For guests, get cart items from request body (localStorage)
        // Fetch fresh product data to validate
        cartItems = await Promise.all(
          validatedCart.map(async (item) => {
            const product = await prisma.product.findUnique({
              where: { id: item.productId }
            })

            if (!product) {
              throw new Error(`Product not found: ${item.productId}`)
            }

            return {
              productId: item.productId,
              quantity: item.quantity,
              product
            }
          })
        )
      } catch (error) {
        if (error instanceof z.ZodError) {
          return NextResponse.json(
            { error: "Invalid cart data", details: error.errors },
            { status: 400 }
          )
        }
        throw error
      }
    } else {
      // Registered user checkout
      customerEmail = session.user.email!
      userId = session.user.id

      // Get user's cart items from database
      cartItems = await prisma.cartItem.findMany({
        where: { userId: session.user.id },
        include: { product: true },
      })
    }

    console.log("Cart items found:", cartItems.length)

    if (cartItems.length === 0) {
      console.log("Cart is empty")
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

    // Create order AND reserve stock in atomic transaction
    // This prevents race conditions where multiple users buy the last item
    const order = await prisma.$transaction(async (tx) => {
      // First, reserve stock for all products
      for (const item of validatedItems) {
        const product = await tx.product.findUnique({
          where: { id: item.productId }
        })

        if (!product) {
          throw new Error(`Product ${item.product.name} not found`)
        }

        const availableStock = product.stock - product.reserved

        if (availableStock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}. Only ${availableStock} available`)
        }

        // Reserve the stock atomically
        await tx.product.update({
          where: { id: item.productId },
          data: {
            reserved: {
              increment: item.quantity
            }
          }
        })
      }

      // Then create the order
      const newOrder = await tx.order.create({
        data: {
          ...(userId ? { userId } : { guestEmail: customerEmail }),
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

      return newOrder
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
      customer_email: customerEmail,
      metadata: {
        orderId: order.id,
        ...(userId ? { userId } : { guestEmail: customerEmail }),
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