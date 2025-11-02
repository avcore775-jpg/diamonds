import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// Schema for updating collection
const updateCollectionSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only').optional(),
  description: z.string().optional().nullable(),
  image: z.string().url().optional().nullable(),
  featured: z.boolean().optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
})

// GET /api/admin/collections/[id] - Get collection details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { id } = await params

    const collection = await prisma.collection.findUnique({
      where: { id },
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

// PUT /api/admin/collections/[id] - Update collection
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { id } = await params

    const body = await request.json()
    const validatedData = updateCollectionSchema.parse(body)

    // If updating slug, check if it's unique
    if (validatedData.slug) {
      const existingCollection = await prisma.collection.findFirst({
        where: {
          slug: validatedData.slug,
          id: { not: id }
        }
      })

      if (existingCollection) {
        return NextResponse.json(
          { error: 'Collection with this slug already exists' },
          { status: 400 }
        )
      }
    }

    const collection = await prisma.collection.update({
      where: { id },
      data: validatedData,
    })
    
    return NextResponse.json(collection)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Update collection error:', error)
    return NextResponse.json(
      { error: 'Failed to update collection' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/collections/[id] - Delete collection
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { id } = await params

    // Check if collection has products
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
    
    if (collection._count.products > 0) {
      return NextResponse.json(
        { error: 'Cannot delete collection with products. Remove all products first.' },
        { status: 400 }
      )
    }
    
    await prisma.collection.delete({
      where: { id }
    })
    
    return NextResponse.json({ message: 'Collection deleted successfully' })
  } catch (error) {
    console.error('Delete collection error:', error)
    return NextResponse.json(
      { error: 'Failed to delete collection' },
      { status: 500 }
    )
  }
}