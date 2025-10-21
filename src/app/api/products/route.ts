import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/products - Get all products (public)
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const includeInactive = searchParams.get("includeInactive") === "true"
    const collectionId = searchParams.get("collectionId")
    const collectionSlug = searchParams.get("collectionSlug")
    const categoryId = searchParams.get("categoryId")

    // Build where clause
    const where: any = includeInactive ? {} : { isActive: true }
    
    if (collectionId) {
      where.collectionId = collectionId
    } else if (collectionSlug) {
      where.collection = { slug: collectionSlug }
    }
    
    if (categoryId) {
      where.categoryId = categoryId
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        },
        collection: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    )
  }
}

// POST /api/products - Create product (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { name, slug, description, carat, weight, price, image, stock, categoryId, collectionId } = body

    // Validate required fields
    if (!name || !slug || !description || price === undefined || !image) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    })

    if (existingProduct) {
      return NextResponse.json(
        { error: "Product with this slug already exists" },
        { status: 400 }
      )
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        carat,
        weight, 
        price: Math.round(price * 100), // Convert to cents
        image,
        stock: stock || 0,
        isActive: true,
        categoryId: categoryId || null,
        collectionId: collectionId || null,
      },
      include: {
        category: true,
        collection: true,
      }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    )
  }
}