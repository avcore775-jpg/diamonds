import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET /api/users/me/orders/:orderId - Get specific order details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    // Get session
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { orderId } = await params;
    
    // Get order details (only if it belongs to the user)
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id, // Ensure user can only see their own orders
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                image: true,
                images: true,
              },
            },
          },
        },
        coupon: true,
      },
    });
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(order);
  } catch (error) {
    console.error('Get order details error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order details' },
      { status: 500 }
    );
  }
}