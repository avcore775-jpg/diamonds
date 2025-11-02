import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAdminAuth } from '@/lib/auth/admin'

async function getDashboardStats() {
  const now = new Date()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 2, 1)

  // Get current month data
  const [
    currentRevenue,
    currentOrders,
    currentProducts,
    currentUsers,
  ] = await Promise.all([
    // Revenue this month
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        createdAt: { gte: thisMonth },
        status: { in: ['PAID', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] }
      }
    }),
    
    // Orders this month
    prisma.order.count({
      where: {
        createdAt: { gte: thisMonth }
      }
    }),
    
    // Products (all time)
    prisma.product.count({
      where: { isActive: true }
    }),
    
    // Active and verified users (all time)
    prisma.user.count({
      where: {
        isActive: true,
        emailVerified: { not: null }
      }
    })
  ])

  // Get previous month data for comparison
  const [
    previousRevenue,
    previousOrders,
    newUsersThisMonth,
    newUsersLastMonth,
  ] = await Promise.all([
    // Revenue last month
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        createdAt: { gte: previousMonth, lt: lastMonth },
        status: { in: ['PAID', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] }
      }
    }),

    // Orders last month
    prisma.order.count({
      where: {
        createdAt: { gte: previousMonth, lt: lastMonth }
      }
    }),

    // New users this month
    prisma.user.count({
      where: {
        createdAt: { gte: thisMonth },
        isActive: true,
        emailVerified: { not: null }
      }
    }),

    // New users last month
    prisma.user.count({
      where: {
        createdAt: { gte: previousMonth, lt: lastMonth },
        isActive: true,
        emailVerified: { not: null }
      }
    })
  ])

  // Calculate percentage changes
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100)
  }

  const totalRevenue = currentRevenue._sum.total || 0
  const prevRevenue = previousRevenue._sum.total || 0
  
  return {
    totalRevenue,
    revenueChange: calculateChange(totalRevenue, prevRevenue),
    totalOrders: currentOrders,
    ordersChange: calculateChange(currentOrders, previousOrders),
    totalProducts: currentProducts,
    productsChange: 0, // Products don't change month-to-month in this context
    totalUsers: currentUsers,
    usersChange: calculateChange(newUsersThisMonth, newUsersLastMonth),
  }
}

async function handler(req: NextRequest) {
  try {
    if (req.method !== 'GET') {
      return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
      )
    }

    const stats = await getDashboardStats()
    
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}

export const GET = withAdminAuth(handler)