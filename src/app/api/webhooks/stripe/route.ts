import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

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
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session

        // Get order from metadata
        const orderId = session.metadata?.orderId
        const userId = session.metadata?.userId

        if (!orderId || !userId) {
          console.error("Missing metadata in Stripe session")
          return NextResponse.json(
            { error: "Missing metadata" },
            { status: 400 }
          )
        }

        // Update order status to CONFIRMED and payment status to PAID
        const order = await prisma.order.update({
          where: { id: orderId },
          data: {
            status: "CONFIRMED",
            paymentStatus: "PAID",
            stripePaymentIntentId: session.payment_intent as string,
          },
          include: {
            orderItems: true,
            user: true,
          },
        })

        // Update product stock
        for (const item: any of order.orderItems) {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          })
        }

        // Clear user's cart
        await prisma.cartItem.deleteMany({
          where: { userId },
        })

        // Send order confirmation email
        if (order.user.email) {
          const { Resend } = await import("resend")
          const resend = new Resend(process.env.RESEND_API_KEY!)
          
          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL!,
            to: order.user.email,
            subject: `Order Confirmation #${order.id.slice(-8).toUpperCase()}`,
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
        }

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