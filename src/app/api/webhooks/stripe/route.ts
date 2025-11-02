import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { getOrderEmail } from "@/lib/order-utils"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = headers().get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    )
  }

  try {
    // ✅ VULN-005 FIX: Idempotency check to prevent duplicate processing
    const webhookEvent = await prisma.webhookEvent.findUnique({
      where: { eventId: event.id }
    })

    if (webhookEvent?.processed) {
      console.log(`Event ${event.id} already processed, skipping`)
      return NextResponse.json({ received: true, message: "Already processed" })
    }

    // Create webhook event record
    await prisma.webhookEvent.create({
      data: {
        eventId: event.id,
        eventType: event.type,
        processed: false
      }
    })

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session

        // Get order from metadata
        const orderId = session.metadata?.orderId
        const userId = session.metadata?.userId // Optional for guest orders
        const guestEmail = session.metadata?.guestEmail // For guest orders

        if (!orderId) {
          console.error("Missing orderId in Stripe session metadata")
          return NextResponse.json(
            { error: "Missing orderId in metadata" },
            { status: 400 }
          )
        }

        // Validate that we have either userId OR guestEmail
        if (!userId && !guestEmail) {
          console.error("Missing both userId and guestEmail in Stripe session metadata")
          return NextResponse.json(
            { error: "Missing user identification" },
            { status: 400 }
          )
        }

        // First, fetch the order to verify ownership and amount
        const existingOrder = await prisma.order.findUnique({
          where: { id: orderId },
          include: {
            orderItems: true,
            user: true,
          },
        })

        if (!existingOrder) {
          console.error(`Order not found: ${orderId}`)
          return NextResponse.json(
            { error: "Order not found" },
            { status: 404 }
          )
        }

        // Verify order ownership matches metadata
        if (userId && existingOrder.userId !== userId) {
          console.error(`Order ownership mismatch: order userId=${existingOrder.userId}, metadata userId=${userId}`)
          return NextResponse.json(
            { error: "Order ownership mismatch" },
            { status: 403 }
          )
        }

        if (guestEmail && existingOrder.guestEmail !== guestEmail) {
          console.error(`Guest order email mismatch: order email=${existingOrder.guestEmail}, metadata email=${guestEmail}`)
          return NextResponse.json(
            { error: "Order email mismatch" },
            { status: 403 }
          )
        }

        // Verify order amount matches payment amount
        if (existingOrder.total !== session.amount_total) {
          console.error(`Amount mismatch: order total=${existingOrder.total}, payment amount=${session.amount_total}`)
          return NextResponse.json(
            { error: "Amount mismatch" },
            { status: 400 }
          )
        }

        // Prevent double processing
        if (existingOrder.paymentStatus === "PAID") {
          console.log(`Order ${orderId} already paid, skipping`)
          return NextResponse.json({ received: true, message: "Already processed" })
        }

        // ✅ VULN-002 & VULN-009 FIX: Atomic transaction with proper stock management and error handling
        const order = await prisma.$transaction(async (tx) => {
          // Update order status
          const updatedOrder = await tx.order.update({
            where: { id: orderId },
            data: {
              status: "CONFIRMED",
              paymentStatus: "PAID",
              stripePaymentIntentId: session.payment_intent as string,
              stripeSessionId: session.id,
            },
            include: {
              orderItems: true,
              user: true,
            },
          })

          // Convert reserved stock to actual sale (reserved → stock decrement)
          for (const item: any of updatedOrder.orderItems) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  decrement: item.quantity,
                },
                reserved: {
                  decrement: item.quantity,
                },
              },
            })
          }

          // Clear user's cart (only for registered users)
          if (userId) {
            await tx.cartItem.deleteMany({
              where: { userId },
            })
          }

          return updatedOrder
        })

        // ✅ VULN-009 FIX: Email error handling - don't fail webhook if email fails
        const customerEmail = getOrderEmail(order)
        if (customerEmail && customerEmail !== 'No email') {
          try {
            const { Resend } = await import("resend")
            const resend = new Resend(process.env.RESEND_API_KEY!)

            await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL!,
            to: customerEmail,
            subject: `Order Confirmation #${order.orderNumber}`,
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="UTF-8">
                  <title>Order Confirmation</title>
                </head>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">Order Confirmed!</h1>
                  </div>
                  
                  <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #333; margin-top: 0;">Thank you for your order!</h2>
                    
                    <p style="font-size: 16px; color: #666;">
                      Your order <strong>#${order.id.slice(-8).toUpperCase()}</strong> has been confirmed and will be processed soon.
                    </p>
                    
                    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                      <h3 style="margin-top: 0; color: #333;">Order Details:</h3>
                      <p><strong>Order ID:</strong> #${order.id.slice(-8).toUpperCase()}</p>
                      <p><strong>Total:</strong> $${(order.total / 100).toFixed(2)}</p>
                      <p><strong>Items:</strong> ${order.orderItems.length} item(s)</p>
                    </div>
                    
                    <p style="font-size: 14px; color: #666;">
                      We'll send you another email when your order ships.
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
                    
                    <p style="font-size: 12px; color: #999; text-align: center;">
                      If you have any questions, please contact our support team.
                    </p>
                  </div>
                </body>
              </html>
            `,
            })
          } catch (emailError) {
            // ✅ VULN-009: Don't fail webhook if email fails - log and continue
            console.error('Email send failed for order:', order.id, emailError)
            // TODO: Implement retry queue for failed emails
          }
        }

        // Mark webhook event as processed
        await prisma.webhookEvent.update({
          where: { eventId: event.id },
          data: { processed: true }
        })

        break
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log("Payment succeeded:", paymentIntent.id)
        break
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.error("Payment failed:", paymentIntent.id)
        
        // Update order status to CANCELLED if payment fails
        if (paymentIntent.metadata?.orderId) {
          await prisma.order.update({
            where: { id: paymentIntent.metadata.orderId },
            data: { status: "CANCELLED" },
          })
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    )
  }
}