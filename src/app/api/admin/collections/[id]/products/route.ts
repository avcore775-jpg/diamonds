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
  { params }: { params: { id: string } }
) {
  try {
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
      where: { id: params.id }
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
        collectionId: params.id
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

// DELETE /api/admin/collections/[id]/products - Remove products from collection
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
        collectionId: params.id
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