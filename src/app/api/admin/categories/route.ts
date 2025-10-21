import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAdminAuth } from '@/lib/auth/admin'

async function handler(req: NextRequest) {
  try {
    if (req.method === 'GET') {
      const categories = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          image: true,
          parentId: true,
          isActive: true,
          _count: {
            select: {
              products: true
            }
          }
        }
      })

      return NextResponse.json(categories)
    }

    if (req.method === 'POST') {
      const body = await req.json()
      
      const {
        name,
        description,
        image,
        parentId
      } = body

      // Validation
      if (!name) {
        return NextResponse.json(
          { error: 'Category name is required' },
          { status: 400 }
        )
      }

      // Generate slug from name
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      // Check if slug already exists
      const existingCategory = await prisma.category.findUnique({
        where: { slug }
      })

      let finalSlug = slug
      if (existingCategory) {
        finalSlug = `${slug}-${Date.now()}`
      }

      const category = await prisma.category.create({
        data: {
          name,
          slug: finalSlug,
          description: description || null,
          image: image || null,
          parentId: parentId || null,
          isActive: true
        }
      })

      return NextResponse.json(category, { status: 201 })
    }

    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 }
    )
  } catch (error) {
    console.error('Admin categories error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

export const GET = withAdminAuth(handler)
export const POST = withAdminAuth(handler)