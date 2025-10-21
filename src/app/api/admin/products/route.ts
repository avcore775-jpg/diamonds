import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAdminAuth } from '@/lib/auth/admin'

async function handler(req: NextRequest) {
  try {
    if (req.method === 'GET') {
      const products = await prisma.product.findMany({
        include: {
          category: {
            select: { id: true, name: true }
          },
          collection: {
            select: { id: true, name: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json(products)
    }

    if (req.method === 'POST') {
      const body = await req.json()
      
      const {
        name,
        description,
        carat,
        weight,
        price,
        image,
        stock,
        isActive,
        isFeatured,
        sku,
        tags,
        categoryId,
        collectionId
      } = body

      // Validation
      if (!name || !description || !price || !image) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        )
      }

      // Generate slug from name
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      // Check if slug already exists
      const existingProduct = await prisma.product.findUnique({
        where: { slug }
      })

      let finalSlug = slug
      if (existingProduct) {
        finalSlug = `${slug}-${Date.now()}`
      }

      const product = await prisma.product.create({
        data: {
          name,
          slug: finalSlug,
          description,
          carat: carat || null,
          weight: weight || null,
          price,
          image,
          stock: stock || 0,
          isActive: isActive ?? true,
          isFeatured: isFeatured ?? false,
          sku: sku || null,
          tags: tags || [],
          categoryId: categoryId || null,
          collectionId: collectionId || null,
          images: [image], // Add main image to images array
        },
        include: {
          category: {
            select: { id: true, name: true }
          },
          collection: {
            select: { id: true, name: true }
          }
        }
      })

      return NextResponse.json(product, { status: 201 })
    }

    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 }
    )
  } catch (error) {
    console.error('Admin products error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

export const GET = withAdminAuth(handler)
export const POST = withAdminAuth(handler)