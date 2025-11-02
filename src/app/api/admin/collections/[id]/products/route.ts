import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// POST /api/admin/collections/[id]/products - Add products to collection
const addProductsSchema = z.object({
  productIds: z.array(z.string()).min(1, 'At least one product ID is required'),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { productIds } = addProductsSchema.parse(body)

    // Check if collection exists
    const collection = await prisma.collection.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }

    // Update products to belong to this collection
    await prisma.product.updateMany({
      where: {
        id: { in: productIds }
      },
      data: {
        collectionId: resolvedParams.id
      }
    })
    
    return NextResponse.json({ 
      message: `${productIds.length} products added to collection` 
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Add products to collection error:', error)
    return NextResponse.json(
      { error: 'Failed to add products to collection' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/collections/[id]/products - Replace all products in collection
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const productIdsSchema = z.object({
      productIds: z.array(z.string()),
    })
    const { productIds } = productIdsSchema.parse(body)

    // Check if collection exists
    const collection = await prisma.collection.findUnique({
      where: { id: resolvedParams.id },
      include: {
        products: {
          select: { id: true }
        }
      }
    })

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }

    // Remove all current products from this collection
    await prisma.product.updateMany({
      where: {
        collectionId: resolvedParams.id
      },
      data: {
        collectionId: null
      }
    })

    // Add selected products to collection
    if (productIds.length > 0) {
      await prisma.product.updateMany({
        where: {
          id: { in: productIds }
        },
        data: {
          collectionId: resolvedParams.id
        }
      })
    }

    // Return updated collection
    const updatedCollection = await prisma.collection.findUnique({
      where: { id: resolvedParams.id },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            image: true,
          }
        }
      }
    })

    return NextResponse.json(updatedCollection)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Update collection products error:', error)
    return NextResponse.json(
      { error: 'Failed to update collection products' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/collections/[id]/products - Remove products from collection
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { productIds } = addProductsSchema.parse(body)

    // Remove products from collection
    await prisma.product.updateMany({
      where: {
        id: { in: productIds },
        collectionId: resolvedParams.id
      },
      data: {
        collectionId: null
      }
    })

    return NextResponse.json({
      message: `${productIds.length} products removed from collection`
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Remove products from collection error:', error)
    return NextResponse.json(
      { error: 'Failed to remove products from collection' },
      { status: 500 }
    )
  }
}