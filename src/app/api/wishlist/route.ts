import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/wishlist - Get user's wishlist
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get or create wishlist
    let wishlist = await prisma.wishlist.findUnique({
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
                description: true,
                isActive: true,
                stock: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: {
          userId: session.user.id
        },
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
                  description: true,
                  isActive: true,
                  stock: true,
                }
              }
            }
          }
        }
      })
    }

    return NextResponse.json(wishlist)
  } catch (error) {
    console.error('Get wishlist error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch wishlist' },
      { status: 500 }
    )
  }
}

// POST /api/wishlist - Add item to wishlist
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { productId } = body

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Get or create wishlist
    let wishlist = await prisma.wishlist.findUnique({
      where: { userId: session.user.id }
    })

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: {
          userId: session.user.id
        }
      })
    }

    // Check if item already in wishlist
    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId: productId
        }
      }
    })

    if (existingItem) {
      return NextResponse.json(
        { error: 'Product already in wishlist' },
        { status: 400 }
      )
    }

    // Add item to wishlist
    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId: productId
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            image: true,
            description: true,
            isActive: true,
            stock: true,
          }
        }
      }
    })

    return NextResponse.json(wishlistItem, { status: 201 })
  } catch (error) {
    console.error('Add to wishlist error:', error)
    return NextResponse.json(
      { error: 'Failed to add to wishlist' },
      { status: 500 }
    )
  }
}

// DELETE /api/wishlist - Remove item from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Get wishlist
    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: session.user.id }
    })

    if (!wishlist) {
      return NextResponse.json(
        { error: 'Wishlist not found' },
        { status: 404 }
      )
    }

    // Remove item from wishlist
    await prisma.wishlistItem.delete({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId: productId
        }
      }
    })

    return NextResponse.json({ message: 'Item removed from wishlist' })
  } catch (error) {
    console.error('Remove from wishlist error:', error)
    return NextResponse.json(
      { error: 'Failed to remove from wishlist' },
      { status: 500 }
    )
  }
}
