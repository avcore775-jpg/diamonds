import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/collections/[id] - Get collection by slug with products
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Try to find by slug first (more user-friendly)
    const collection = await prisma.collection.findFirst({
      where: { 
        OR: [
          { slug: id },
          { id: id }
        ],
        isActive: true,
      },
      include: {
        products: {
          where: {
            isActive: true,
            stock: { gt: 0 }
          },
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            comparePrice: true,
            image: true,
            stock: true,
            category: {
              select: {
                name: true,
                slug: true,
              }
            }
          }
        },
      },
    })
    
    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(collection)
  } catch (error) {
    console.error('Get collection error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch collection' },
      { status: 500 }
    )
  }
}

// PATCH /api/collections/[id] - Update collection (Admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { name, slug, description, image, featured, sortOrder, isActive } = body
    
    // Check if collection exists
    const existingCollection = await prisma.collection.findUnique({
      where: { id }
    })
    
    if (!existingCollection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }
    
    // If slug is being updated, check for conflicts
    if (slug && slug !== existingCollection.slug) {
      const slugConflict = await prisma.collection.findUnique({
        where: { slug }
      })
      
      if (slugConflict) {
        return NextResponse.json(
          { error: 'Collection with this slug already exists' },
          { status: 400 }
        )
      }
    }
    
    // Update collection
    const updatedCollection = await prisma.collection.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description }),
        ...(image !== undefined && { image }),
        ...(featured !== undefined && { featured }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            image: true,
          },
          take: 4,
        },
        _count: {
          select: { products: true }
        }
      }
    })
    
    return NextResponse.json(updatedCollection)
  } catch (error) {
    console.error('Update collection error:', error)
    return NextResponse.json(
      { error: 'Failed to update collection' },
      { status: 500 }
    )
  }
}

// DELETE /api/collections/[id] - Delete collection (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    
    // Check if collection exists
    const collection = await prisma.collection.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    })
    
    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }
    
    // Check if collection has products
    if (collection._count.products > 0) {
      return NextResponse.json(
        { error: 'Cannot delete collection with products. Remove all products first.' },
        { status: 400 }
      )
    }
    
    // Delete collection
    await prisma.collection.delete({
      where: { id }
    })
    
    return NextResponse.json({ 
      message: 'Collection deleted successfully' 
    })
  } catch (error) {
    console.error('Delete collection error:', error)
    return NextResponse.json(
      { error: 'Failed to delete collection' },
      { status: 500 }
    )
  }
}