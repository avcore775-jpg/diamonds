import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAdminAuth } from '@/lib/auth/admin'

async function handler(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id} = await params

    if (req.method === 'GET') {
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          category: {
            select: { id: true, name: true }
          },
          collection: {
            select: { id: true, name: true }
          }
        }
      })

      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(product)
    }

    if (req.method === 'PATCH') {
      const body = await req.json()
      
      // Check if product exists
      const existingProduct = await prisma.product.findUnique({
        where: { id }
      })

      if (!existingProduct) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }

      // Prepare update data
      const updateData: any = {}
      
      if (body.name !== undefined) {
        updateData.name = body.name
        // Update slug if name changed
        if (body.name !== existingProduct.name) {
          const slug = body.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
          updateData.slug = slug
        }
      }
      
      if (body.description !== undefined) updateData.description = body.description
      if (body.carat !== undefined) updateData.carat = body.carat
      if (body.weight !== undefined) updateData.weight = body.weight
      if (body.price !== undefined) updateData.price = body.price
      if (body.image !== undefined) {
        updateData.image = body.image
        // Update images array if main image changed
        updateData.images = [body.image]
      }
      if (body.stock !== undefined) updateData.stock = body.stock
      if (body.isActive !== undefined) updateData.isActive = body.isActive
      if (body.isFeatured !== undefined) updateData.isFeatured = body.isFeatured
      if (body.sku !== undefined) updateData.sku = body.sku
      if (body.tags !== undefined) updateData.tags = body.tags
      if (body.categoryId !== undefined) updateData.categoryId = body.categoryId
      if (body.collectionId !== undefined) updateData.collectionId = body.collectionId

      const product = await prisma.product.update({
        where: { id },
        data: updateData,
        include: {
          category: {
            select: { id: true, name: true }
          },
          collection: {
            select: { id: true, name: true }
          }
        }
      })

      return NextResponse.json(product)
    }

    if (req.method === 'DELETE') {
      // Check if product exists
      const existingProduct = await prisma.product.findUnique({
        where: { id }
      })

      if (!existingProduct) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }

      // Delete the product
      await prisma.product.delete({
        where: { id }
      })

      return NextResponse.json({ message: 'Product deleted successfully' })
    }

    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 }
    )
  } catch (error) {
    console.error('Admin product error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

export const GET = withAdminAuth(handler)
export const PATCH = withAdminAuth(handler)
export const DELETE = withAdminAuth(handler)