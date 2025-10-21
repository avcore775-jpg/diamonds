import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { AppError, handleError } from '@/lib/middleware/errorHandler'
import { rateLimit } from '@/lib/middleware/rateLimiter'
import { validateRequest } from '@/lib/validations'
import { z } from 'zod'

// GET /api/orders - Get user's orders
export async function GET(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(req)
    if (rateLimitResult) return rateLimitResult

    const session = await getServerSession(authOptions)
    if (!session?.user) {
      throw new AppError('Unauthorized', 401)
    }

    const searchParams = req.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)
    const status = searchParams.get('status')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build filters
    const where: any = { userId: session.user.id }
    if (status) {
      where.status = status
    }

    // For admin users, show all orders
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role === 'ADMIN' || user?.role === 'MANAGER') {
      delete where.userId
      const userId = searchParams.get('userId')
      if (userId) where.userId = userId
    }

    // Get total count for pagination
    const total = await prisma.order.count({ where })

    // Get orders with pagination
    const orders = await prisma.order.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                image: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        coupon: true
      }
    })

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    return handleError(error)
  }
}

// POST /api/orders - Create new order (for admin/manual orders)
export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(req)
    if (rateLimitResult) return rateLimitResult

    const session = await getServerSession(authOptions)
    if (!session?.user) {
      throw new AppError('Unauthorized', 401)
    }

    const body = await req.json()

    // Validate input
    const createOrderSchema = z.object({
      items: z.array(z.object({
        productId: z.string(),
        quantity: z.number().int().min(1)
      })).min(1),
      shippingAddress: z.object({
        name: z.string(),
        street: z.string(),
        city: z.string(),
        state: z.string(),
        postalCode: z.string(),
        country: z.string()
      }),
      billingAddress: z.object({
        name: z.string(),
        street: z.string(),
        city: z.string(),
        state: z.string(),
        postalCode: z.string(),
        country: z.string()
      }).optional(),
      couponCode: z.string().optional(),
      notes: z.string().optional()
    })

    const validation = await validateRequest(createOrderSchema, body)
    if (!validation.success) {
      throw new AppError(validation.errors.join(', '), 400)
    }

    const { items, shippingAddress, billingAddress, couponCode, notes } = validation.data

    // Start transaction
    const order = await prisma.$transaction(async (tx) => {
      // Validate products and calculate totals
      let subtotal = 0
      const orderItems = []

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId }
        })

        if (!product) {
          throw new AppError(`Product ${item.productId} not found`, 404)
        }

        if (product.stock < item.quantity) {
          throw new AppError(`Insufficient stock for ${product.name}`, 400)
        }

        // Update product stock and reserved quantity
        await tx.product.update({
          where: { id: product.id },
          data: {
            stock: { decrement: item.quantity },
            reserved: { increment: item.quantity }
          }
        })

        const itemTotal = product.price * item.quantity
        subtotal += itemTotal

        orderItems.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price,
          discount: 0
        })
      }

      // Apply coupon if provided
      let discount = 0
      let coupon = null
      
      if (couponCode) {
        coupon = await tx.coupon.findUnique({
          where: { code: couponCode }
        })

        if (!coupon) {
          throw new AppError('Invalid coupon code', 400)
        }

        const now = new Date()
        if (now < coupon.validFrom || now > coupon.validUntil) {
          throw new AppError('Coupon has expired', 400)
        }

        if (!coupon.isActive) {
          throw new AppError('Coupon is not active', 400)
        }

        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
          throw new AppError('Coupon usage limit exceeded', 400)
        }

        if (coupon.minAmount && subtotal < coupon.minAmount) {
          throw new AppError(`Minimum order amount for this coupon is $${coupon.minAmount / 100}`, 400)
        }

        // Calculate discount
        if (coupon.type === 'PERCENTAGE') {
          discount = Math.floor(subtotal * (coupon.value / 100))
        } else {
          discount = Math.min(coupon.value, subtotal)
        }

        // Update coupon usage
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usageCount: { increment: 1 } }
        })
      }

      // Calculate tax and shipping (simplified - you can make this more complex)
      const tax = Math.floor(subtotal * 0.08) // 8% tax
      const shipping = subtotal > 10000 ? 0 : 1500 // Free shipping over $100

      const total = subtotal - discount + tax + shipping

      // Generate unique order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`

      // Create the order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: session.user.id,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          subtotal,
          tax,
          shipping,
          discount,
          total,
          couponId: coupon?.id,
          shippingAddress,
          billingAddress: billingAddress || shippingAddress,
          notes,
          orderItems: {
            create: orderItems
          }
        },
        include: {
          orderItems: {
            include: {
              product: true
            }
          }
        }
      })

      // Clear user's cart
      await tx.cartItem.deleteMany({
        where: { userId: session.user.id }
      })

      return newOrder
    })

    return NextResponse.json({
      success: true,
      data: order
    }, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}