import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET /api/users/me/cart - Get user's cart
export async function GET(request: NextRequest) {
  try {
    // Get session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get or create cart
    let cart = await prisma.cart.findUnique({
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
        coupon: true,
      },
    });
    
    if (!cart) {
      // Create new cart if doesn't exist
      cart = await prisma.cart.create({
        data: { userId: session.user.id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          coupon: true,
        },
      });
    }
    
    // Filter out inactive products
    const activeItems = cart.items.filter(item => item.product.isActive);
    
    // Calculate totals
    const subtotal = activeItems.reduce(
      (sum, item) => sum + (item.product.price * item.quantity),
      0
    );
    
    let discount = 0;
    if (cart.coupon) {
      if (cart.coupon.type === 'PERCENTAGE') {
        discount = Math.round(subtotal * (cart.coupon.value / 100));
      } else {
        discount = cart.coupon.value;
      }
    }
    
    const shipping = subtotal > 100000 ? 0 : 1500; // Free shipping over $1000
    const tax = Math.round((subtotal - discount) * 0.08); // 8% tax
    const total = subtotal - discount + shipping + tax;
    
    return NextResponse.json({
      id: cart.id,
      items: activeItems,
      coupon: cart.coupon,
      subtotal,
      discount,
      shipping,
      tax,
      total,
    });
  } catch (error) {
    console.error('Get cart error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

// POST /api/users/me/cart - Add item to cart
const addToCartSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(1),
});

export async function POST(request: NextRequest) {
  try {
    // Get session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // Validate input
    const { productId, quantity } = addToCartSchema.parse(body);
    
    // Check product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    
    if (!product || !product.isActive) {
      return NextResponse.json(
        { error: 'Product not found or unavailable' },
        { status: 404 }
      );
    }
    
    // Check stock
    if (product.stock < quantity) {
      return NextResponse.json(
        { error: `Only ${product.stock} items available in stock` },
        { status: 400 }
      );
    }
    
    // Get or create cart
    let cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    });
    
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: session.user.id },
      });
    }
    
    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: productId,
        },
      },
    });
    
    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      
      // Check stock for new quantity
      if (product.stock < newQuantity) {
        return NextResponse.json(
          { error: `Only ${product.stock} items available in stock` },
          { status: 400 }
        );
      }
      
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      // Add new item
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          userId: session.user.id,
          productId,
          quantity,
        },
      });
    }
    
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
        message: 'Item added to cart',
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
    
    console.error('Add to cart error:', error);
    return NextResponse.json(
      { error: 'Failed to add item to cart' },
      { status: 500 }
    );
  }
}