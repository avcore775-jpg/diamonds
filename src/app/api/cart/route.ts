import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/cart - Get user's cart
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json([], { status: 200 })
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: true
      }
    })

    return NextResponse.json(cartItems, { status: 200 })
  } catch (error) {
    console.error('Cart GET error:', error)
    return NextResponse.json([], { status: 200 })
  }
}

// POST /api/cart - Add item to cart
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    
    // Input validation
    const productId = String(body.productId || '').trim()
    const quantity = Math.max(1, Math.min(10, parseInt(body.quantity) || 1)) // Limit 1-10 items
    
    if (!productId || productId.length > 50) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      )
    }

    // Check product availability
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product || !product.isActive) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    
    if (product.stock < quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      )
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId
        }
      }
    })

    if (existingItem) {
      // Update quantity
      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { 
          quantity: existingItem.quantity + quantity 
        },
        include: { product: true }
      })
      return NextResponse.json(updatedItem, { status: 200 })
    }

    // Add new item
    const newItem = await prisma.cartItem.create({
      data: {
        userId: session.user.id,
        productId,
        quantity
      },
      include: { product: true }
    })

    return NextResponse.json(newItem, { status: 201 })
  } catch (error) {
    console.error('Cart POST error:', error)
    return NextResponse.json(
      { error: 'Failed to add to cart' },
      { status: 500 }
    )
  }
}

// PATCH /api/cart - Update cart item quantity
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const itemId = searchParams.get('itemId')
    const body = await req.json()
    const quantity = Math.max(1, Math.min(10, parseInt(body.quantity) || 1))

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID required' },
        { status: 400 }
      )
    }

    // Verify ownership and update
    const item = await prisma.cartItem.findFirst({
      where: { 
        id: itemId,
        userId: session.user.id
      },
      include: { product: true }
    })
    
    if (!item) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      )
    }

    // Check stock availability
    if (item.product.stock < quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      )
    }

    // Update quantity
    const updatedItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: { product: true }
    })

    return NextResponse.json(updatedItem, { status: 200 })
  } catch (error) {
    console.error('Cart PATCH error:', error)
    return NextResponse.json(
      { error: 'Failed to update cart' },
      { status: 500 }
    )
  }
}

// DELETE /api/cart - Clear cart or remove item
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const itemId = searchParams.get('itemId')

    if (itemId) {
      // Verify ownership before deletion
      const item = await prisma.cartItem.findFirst({
        where: { 
          id: itemId,
          userId: session.user.id // Ensure user owns this cart item
        }
      })
      
      if (!item) {
        return NextResponse.json(
          { error: 'Cart item not found' },
          { status: 404 }
        )
      }
      
      // Simply delete the cart item (no stock changes)
      await prisma.cartItem.delete({
        where: { id: itemId }
      })
    } else {
      // Clear entire cart
      await prisma.cartItem.deleteMany({
        where: { userId: session.user.id }
      })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Cart DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to update cart' },
      { status: 500 }
    )
  }
}