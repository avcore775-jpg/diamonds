import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AppError, handleError } from '@/lib/middleware/errorHandler'
import { rateLimit } from '@/lib/middleware/rateLimiter'
import { validateRequest } from '@/lib/validations'
import { z } from 'zod'

// GET /api/orders/[orderId] - Get order details
export async function GET(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(req)
    if (rateLimitResult) return rateLimitResult

    const session = await getServerSession(authOptions)
    if (!session?.user) {
      throw new AppError('Unauthorized', 401)
    }

    const order = await prisma.order.findUnique({
      where: { id: params.orderId },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                image: true,
                description: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        coupon: true
      }
    })

    if (!order) {
      throw new AppError('Order not found', 404)
    }

    // Check if user has permission to view this order
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    const isAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER' || user?.role === 'SUPPORT'
    
    if (order.userId !== session.user.id && !isAdmin) {
      throw new AppError('Forbidden', 403)
    }

    return NextResponse.json({
      success: true,
      data: order
    })
  } catch (error) {
    return handleError(error)
  }
}

// PATCH /api/orders/[orderId] - Update order (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(req)
    if (rateLimitResult) return rateLimitResult

    const session = await getServerSession(authOptions)
    if (!session?.user) {
      throw new AppError('Unauthorized', 401)
    }

    // Check admin permission
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== 'ADMIN' && user?.role !== 'MANAGER') {
      throw new AppError('Forbidden - Admin access required', 403)
    }

    const body = await req.json()

    // Validate input
    const updateOrderSchema = z.object({
      status: z.enum(['PENDING', 'PAID', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']).optional(),
      paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED']).optional(),
      trackingNumber: z.string().optional(),
      notes: z.string().optional(),
      shippingAddress: z.object({
        name: z.string(),
        street: z.string(),
        city: z.string(),
        state: z.string(),
        postalCode: z.string(),
        country: z.string()
      }).optional(),
      cancelReason: z.string().optional()
    })

    const validation = await validateRequest(updateOrderSchema, body)
    if (!validation.success) {
      throw new AppError(validation.errors.join(', '), 400)
    }

    const updateData: any = { ...validation.data }

    // Handle status-specific updates
    if (updateData.status === 'SHIPPED' && !updateData.trackingNumber) {
      throw new AppError('Tracking number is required when marking order as shipped', 400)
    }

    if (updateData.status === 'SHIPPED') {
      updateData.shippedAt = new Date()
    }

    if (updateData.status === 'DELIVERED') {
      updateData.deliveredAt = new Date()
    }

    if (updateData.status === 'CANCELLED') {
      if (!updateData.cancelReason) {
        throw new AppError('Cancel reason is required', 400)
      }
      updateData.cancelledAt = new Date()
    }

    // Update the order
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Get current order
      const currentOrder = await tx.order.findUnique({
        where: { id: params.orderId },
        include: {
          orderItems: true
        }
      })

      if (!currentOrder) {
        throw new AppError('Order not found', 404)
      }

      // If cancelling order, restore product stock
      if (updateData.status === 'CANCELLED' && currentOrder.status !== 'CANCELLED') {
        for (const item of currentOrder.orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { increment: item.quantity },
              reserved: { decrement: item.quantity }
            }
          })
        }
      }

      // If order is delivered, remove reserved quantities
      if (updateData.status === 'DELIVERED' && currentOrder.status !== 'DELIVERED') {
        for (const item of currentOrder.orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              reserved: { decrement: item.quantity }
            }
          })
        }
      }

      // Update order
      const updated = await tx.order.update({
        where: { id: params.orderId },
        data: updateData,
        include: {
          orderItems: {
            include: {
              product: true
            }
          },
          user: true,
          coupon: true
        }
      })

      return updated
    })

    return NextResponse.json({
      success: true,
      data: updatedOrder
    })
  } catch (error) {
    return handleError(error)
  }
}

// DELETE /api/orders/[orderId] - Cancel order
export async function DELETE(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(req)
    if (rateLimitResult) return rateLimitResult

    const session = await getServerSession(authOptions)
    if (!session?.user) {
      throw new AppError('Unauthorized', 401)
    }

    const order = await prisma.order.findUnique({
      where: { id: params.orderId },
      include: {
        orderItems: true
      }
    })

    if (!order) {
      throw new AppError('Order not found', 404)
    }

    // Check permission
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    const isAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER'
    
    if (order.userId !== session.user.id && !isAdmin) {
      throw new AppError('Forbidden', 403)
    }

    // Check if order can be cancelled
    if (['SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'].includes(order.status)) {
      throw new AppError(`Cannot cancel order with status: ${order.status}`, 400)
    }

    // Cancel the order
    const cancelledOrder = await prisma.$transaction(async (tx) => {
      // Restore product stock
      for (const item of order.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantity },
            reserved: { decrement: item.quantity }
          }
        })
      }

      // Update order status
      const updated = await tx.order.update({
        where: { id: params.orderId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancelReason: 'Cancelled by user'
        }
      })

      return updated
    })

    return NextResponse.json({
      success: true,
      data: cancelledOrder,
      message: 'Order cancelled successfully'
    })
  } catch (error) {
    return handleError(error)
  }
}