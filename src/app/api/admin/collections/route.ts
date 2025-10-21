import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// Schema for creating/updating collection
const collectionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
  description: z.string().optional().nullable(),
  image: z.string().url().optional().nullable(),
  featured: z.boolean().optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
})

// GET /api/admin/collections - Get all collections (including inactive)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }
    
    const collections = await prisma.collection.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ],
    })
    
    return NextResponse.json(collections)
  } catch (error) {
    console.error('Get collections error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch collections' },
      { status: 500 }
    )
  }
}

// POST /api/admin/collections - Create new collection
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    const validatedData = collectionSchema.parse(body)
    
    // Check if slug already exists
    const existingCollection = await prisma.collection.findUnique({
      where: { slug: validatedData.slug }
    })
    
    if (existingCollection) {
      return NextResponse.json(
        { error: 'Collection with this slug already exists' },
        { status: 400 }
      )
    }
    
    const collection = await prisma.collection.create({
      data: {
        ...validatedData,
        sortOrder: validatedData.sortOrder || 0,
        featured: validatedData.featured || false,
        isActive: validatedData.isActive ?? true,
      },
    })
    
    return NextResponse.json(collection, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Create collection error:', error)
    return NextResponse.json(
      { error: 'Failed to create collection' },
      { status: 500 }
    )
  }
}