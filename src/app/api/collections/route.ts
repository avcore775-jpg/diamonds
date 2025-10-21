import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/collections - Get all active collections with minimal product data
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const featured = searchParams.get('featured')
    
    const where: any = {
      isActive: true,
    }
    
    if (featured === 'true') {
      where.featured = true
    }
    
    const collections = await prisma.collection.findMany({
      where,
      include: {
        products: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            image: true,
          },
          take: 4, // Show first 4 products as preview
        },
        _count: {
          select: { products: true }
        }
      },
      orderBy: [
        { featured: 'desc' },
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

// POST /api/collections - Create new collection (Admin only)
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { name, slug, description, image } = body
    
    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }
    
    // Check if slug already exists
    const existingCollection = await prisma.collection.findUnique({
      where: { slug }
    })
    
    if (existingCollection) {
      return NextResponse.json(
        { error: 'Collection with this slug already exists' },
        { status: 400 }
      )
    }
    
    // Create collection
    const collection = await prisma.collection.create({
      data: {
        name,
        slug,
        description: description || null,
        image: image || null,
      },
      include: {
        _count: {
          select: { products: true }
        }
      }
    })
    
    return NextResponse.json(collection, { status: 201 })
  } catch (error) {
    console.error('Create collection error:', error)
    return NextResponse.json(
      { error: 'Failed to create collection' },
      { status: 500 }
    )
  }
}