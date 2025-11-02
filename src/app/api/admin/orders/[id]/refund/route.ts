import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { withAdminAuth } from '@/lib/auth/admin'

async function handler(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (req.method !== 'POST') {
      return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
      )
    }

    const { id } = await params
    const body = await req.json()
    const { reason } = body

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Check if order can be refunded
    if (order.paymentStatus !== 'PAID') {
      return NextResponse.json(
        { error: 'Order cannot be refunded - payment not confirmed' },
        { status: 400 }
      )
    }

    if (order.status === 'REFUNDED') {
      return NextResponse.json(
        { error: 'Order has already been refunded' },
        { status: 400 }
      )
    }

    try {
      // Process refund with Stripe
      let refund = null
      if (order.stripePaymentIntentId) {
        refund = await stripe.refunds.create({
          payment_intent: order.stripePaymentIntentId,
          amount: order.total,
          reason: 'requested_by_customer',
          metadata: {
            order_id: order.id,
            order_number: order.orderNumber,
            admin_reason: reason || 'Admin refund'
          }
        })
      }

      // Update order status
      const updatedOrder = await prisma.order.update({
        where: { id },
        data: {
          status: 'REFUNDED',
          paymentStatus: 'REFUNDED',
          cancelReason: reason || 'Admin refund',
          cancelledAt: new Date(),
          notes: order.notes 
            ? `${order.notes}\n\nRefunded: ${reason || 'Admin refund'}`
            : `Refunded: ${reason || 'Admin refund'}`
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  slug: true
                }
              }
            }
          }
        }
      })

      // TODO: Send refund confirmation email to customer
      // TODO: Restore product inventory if needed

      return NextResponse.json({
        order: updatedOrder,
        refund: refund ? {
          id: refund.id,
          amount: refund.amount,
          status: refund.status
        } : null
      })
    } catch (stripeError: any) {
      console.error('Stripe refund error:', stripeError)
      
      // If Stripe refund fails, still update order status for manual processing
      const updatedOrder = await prisma.order.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          cancelReason: `Refund failed: ${stripeError.message}. ${reason || 'Admin refund'}`,
          cancelledAt: new Date(),
          notes: order.notes 
            ? `${order.notes}\n\nRefund failed - manual processing required: ${stripeError.message}`
            : `Refund failed - manual processing required: ${stripeError.message}`
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  slug: true
                }
              }
            }
          }
        }
      })

      return NextResponse.json(
        { 
          error: 'Refund processing failed - manual intervention required',
          order: updatedOrder,
          stripeError: stripeError.message
        },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Refund error:', error)
    return NextResponse.json(
      { error: 'Failed to process refund' },
      { status: 500 }
    )
  }
}

export const POST = withAdminAuth(handler)