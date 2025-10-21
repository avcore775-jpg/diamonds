import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleError, AppError } from '@/lib/middleware/errorHandler'
import { rateLimit } from '@/lib/middleware/rateLimiter'
import { validateRequest, searchSchema } from '@/lib/validations'

// GET /api/search - Search products with filters
export async function GET(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(req)
    if (rateLimitResult) return rateLimitResult

    const searchParams = req.nextUrl.searchParams
    const query = searchParams.get('q') || ''
    const category = searchParams.get('category')
    const collection = searchParams.get('collection')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const sortBy = searchParams.get('sortBy') || 'relevance'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const inStock = searchParams.get('inStock') === 'true'
    const tags = searchParams.get('tags')?.split(',').filter(Boolean)

    // Validate search params
    const validation = await validateRequest(searchSchema, {
      query,
      category,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      sortBy: sortBy as any,
      page,
      limit
    })

    if (!validation.success) {
      throw new AppError(validation.errors.join(', '), 400)
    }

    // Build search query
    const where: any = {
      isActive: true
    }

    // Text search
    if (query.length >= 2) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { tags: { has: query.toLowerCase() } }
      ]
    }

    // Category filter
    if (category) {
      const categoryRecord = await prisma.category.findUnique({
        where: { slug: category }
      })
      if (categoryRecord) {
        where.categoryId = categoryRecord.id
      }
    }

    // Collection filter
    if (collection) {
      const collectionRecord = await prisma.collection.findUnique({
        where: { slug: collection }
      })
      if (collectionRecord) {
        where.collectionId = collectionRecord.id
      }
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {}
      if (minPrice !== undefined) {
        where.price.gte = Math.floor(parseFloat(minPrice) * 100)
      }
      if (maxPrice !== undefined) {
        where.price.lte = Math.floor(parseFloat(maxPrice) * 100)
      }
    }

    // Stock filter
    if (inStock) {
      where.stock = { gt: 0 }
    }

    // Tags filter
    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags }
    }

    // Sorting
    let orderBy: any = {}
    switch (sortBy) {
      case 'price_asc':
        orderBy = { price: 'asc' }
        break
      case 'price_desc':
        orderBy = { price: 'desc' }
        break
      case 'name':
        orderBy = { name: 'asc' }
        break
      case 'newest':
        orderBy = { createdAt: 'desc' }
        break
      case 'rating':
        // For rating, we'll need to aggregate reviews
        // This is simplified - in production you'd want a denormalized rating field
        orderBy = { createdAt: 'desc' }
        break
      default:
        // Relevance - prioritize exact matches
        if (query) {
          orderBy = [
            { name: 'asc' },
            { createdAt: 'desc' }
          ]
        } else {
          orderBy = { createdAt: 'desc' }
        }
    }

    // Get total count
    const total = await prisma.product.count({ where })

    // Get products with pagination
    const products = await prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        collection: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        _count: {
          select: {
            reviews: true,
            wishlistItems: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        }
      }
    })

    // Calculate average ratings
    const productsWithRatings = products.map(product => {
      const avgRating = product.reviews.length > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
        : 0
      
      const { reviews, ...productData } = product
      
      return {
        ...productData,
        rating: {
          average: avgRating,
          count: product._count.reviews
        },
        wishlistCount: product._count.wishlistItems
      }
    })

    // Get aggregations for filters
    const aggregations = await getSearchAggregations(where)

    return NextResponse.json({
      success: true,
      data: {
        products: productsWithRatings,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        aggregations,
        query: {
          searchTerm: query,
          filters: {
            category,
            collection,
            priceRange: { min: minPrice, max: maxPrice },
            inStock,
            tags
          }
        }
      }
    })
  } catch (error) {
    return handleError(error)
  }
}

// Helper function to get search aggregations
async function getSearchAggregations(baseWhere: any) {
  const [categories, priceRange, availableTags] = await Promise.all([
    // Get category counts
    prisma.category.findMany({
      where: {
        isActive: true,
        products: {
          some: baseWhere
        }
      },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            products: {
              where: baseWhere
            }
          }
        }
      }
    }),

    // Get price range
    prisma.product.aggregate({
      where: baseWhere,
      _min: { price: true },
      _max: { price: true }
    }),

    // Get available tags
    prisma.product.findMany({
      where: baseWhere,
      select: { tags: true },
      distinct: ['tags']
    })
  ])

  // Process tags
  const tagCounts = new Map<string, number>()
  availableTags.forEach(product => {
    product.tags.forEach(tag => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
    })
  })

  return {
    categories: categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      count: cat._count.products
    })),
    priceRange: {
      min: priceRange._min.price || 0,
      max: priceRange._max.price || 0
    },
    tags: Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20) // Top 20 tags
  }
}