import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// PATCH /api/users/me/cart/:itemId - Update cart item quantity
const updateQuantitySchema = z.object({
  quantity: z.number().min(1),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
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

    const { itemId } = await params;
    const body = await request.json();
    
    // Validate input
    const { quantity } = updateQuantitySchema.parse(body);
    
    // Get cart item
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        userId: session.user.id, // Ensure user owns this cart item
      },
      include: {
        product: true,
      },
    });
    
    if (!cartItem) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      );
    }
    
    // Check stock
    if (cartItem.product.stock < quantity) {
      return NextResponse.json(
        { error: `Only ${cartItem.product.stock} items available in stock` },
        { status: 400 }
      );
    }
    
    // Update quantity
    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
    
    // Return updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                image: true,
                stock: true,
                isActive: true,
              },
            },
          },
        },
      },
    });
    
    return NextResponse.json(
      {
        message: 'Cart item updated',
        cart: updatedCart,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Update cart item error:', error);
    return NextResponse.json(
      { error: 'Failed to update cart item' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/me/cart/:itemId - Remove item from cart
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
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

    const { itemId } = await params;
    
    // Check if cart item belongs to user
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        userId: session.user.id, // Ensure user owns this cart item
      },
    });
    
    if (!cartItem) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      );
    }
    
    // Delete cart item
    await prisma.cartItem.delete({
      where: { id: itemId },
    });
    
    // Return updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                image: true,
                stock: true,
                isActive: true,
              },
            },
          },
        },
      },
    });
    
    return NextResponse.json(
      {
        message: 'Item removed from cart',
        cart: updatedCart,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete cart item error:', error);
    return NextResponse.json(
      { error: 'Failed to remove item from cart' },
      { status: 500 }
    );
  }
}