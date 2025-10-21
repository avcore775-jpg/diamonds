import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAdminAuth } from '@/lib/auth/admin'

async function handler(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (req.method === 'GET') {
      const order = await prisma.order.findUnique({
        where: { id },
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

      if (!order) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(order)
    }

    if (req.method === 'PATCH') {
      const body = await req.json()
      
      // Check if order exists
      const existingOrder = await prisma.order.findUnique({
        where: { id }
      })

      if (!existingOrder) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        )
      }

      // Prepare update data
      const updateData: any = {}
      
      if (body.status !== undefined) updateData.status = body.status
      if (body.trackingNumber !== undefined) updateData.trackingNumber = body.trackingNumber
      if (body.notes !== undefined) updateData.notes = body.notes
      if (body.shippedAt !== undefined) updateData.shippedAt = body.shippedAt
      if (body.deliveredAt !== undefined) updateData.deliveredAt = body.deliveredAt

      const order = await prisma.order.update({
        where: { id },
        data: updateData,
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

      return NextResponse.json(order)
    }

    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 }
    )
  } catch (error) {
    console.error('Admin order error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

export const GET = withAdminAuth(handler)
export const PATCH = withAdminAuth(handler)