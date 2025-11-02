import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Cleanup Job - Освобождает reserved stock для заказов старше 40 минут
 *
 * Запускается:
 * - Автоматически через cron каждые 5 минут
 * - Или вручную: GET /api/admin/cleanup-reservations
 *
 * Что делает:
 * 1. Находит заказы со статусом PENDING старше 40 минут
 * 2. Освобождает reserved stock для этих заказов
 * 3. Опционально: отменяет заказы (можно включить)
 */
export async function GET(req: NextRequest) {
  try {
    // Простая защита: разрешить в development или с секретным ключом
    const isDevelopment = process.env.NODE_ENV === 'development'
    const authHeader = req.headers.get('authorization')
    const cleanupSecret = process.env.CLEANUP_JOB_SECRET

    // В production требуем секретный ключ, в development - открытый доступ
    if (!isDevelopment && cleanupSecret) {
      if (authHeader !== `Bearer ${cleanupSecret}`) {
        return NextResponse.json(
          { error: 'Unauthorized - invalid or missing authorization header' },
          { status: 401 }
        )
      }
    }

    const startTime = Date.now()

    // 40 минут в миллисекундах
    const RESERVATION_TIMEOUT_MS = 40 * 60 * 1000
    const expirationTime = new Date(Date.now() - RESERVATION_TIMEOUT_MS)

    console.log(`[Cleanup] Starting reservation cleanup at ${new Date().toISOString()}`)
    console.log(`[Cleanup] Looking for orders created before ${expirationTime.toISOString()}`)

    // Найти просроченные заказы
    const expiredOrders = await prisma.order.findMany({
      where: {
        status: 'PENDING',
        paymentStatus: 'PENDING',
        createdAt: {
          lte: expirationTime
        }
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    })

    console.log(`[Cleanup] Found ${expiredOrders.length} expired orders`)

    if (expiredOrders.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No expired reservations found',
        processed: 0,
        duration: Date.now() - startTime
      })
    }

    // Обработать каждый заказ в транзакции
    let processedCount = 0
    let totalReservedFreed = 0
    const errors: string[] = []

    for (const order of expiredOrders) {
      try {
        await prisma.$transaction(async (tx) => {
          // Освободить reserved stock для каждого товара в заказе
          for (const item of order.orderItems) {
            const productBefore = await tx.product.findUnique({
              where: { id: item.productId },
              select: { name: true, stock: true, reserved: true }
            })

            if (productBefore && productBefore.reserved >= item.quantity) {
              await tx.product.update({
                where: { id: item.productId },
                data: {
                  reserved: {
                    decrement: item.quantity
                  }
                }
              })

              totalReservedFreed += item.quantity

              console.log(`[Cleanup] Freed ${item.quantity} reserved stock for product "${productBefore.name}"`)
              console.log(`[Cleanup]   Before: stock=${productBefore.stock}, reserved=${productBefore.reserved}`)
              console.log(`[Cleanup]   After:  stock=${productBefore.stock}, reserved=${productBefore.reserved - item.quantity}`)
            } else {
              console.warn(`[Cleanup] Product ${item.productId} has insufficient reserved stock (${productBefore?.reserved || 0} < ${item.quantity})`)
            }
          }

          // Опционально: Отменить заказ
          // Раскомментируйте если хотите автоматически отменять просроченные заказы
          /*
          await tx.order.update({
            where: { id: order.id },
            data: {
              status: 'CANCELLED',
              cancelReason: 'Payment timeout - reservation expired after 40 minutes',
              cancelledAt: new Date()
            }
          })
          */
        })

        processedCount++
        console.log(`[Cleanup] Successfully processed order ${order.orderNumber} (${order.id})`)

      } catch (error) {
        const errorMsg = `Failed to process order ${order.orderNumber}: ${error}`
        console.error(`[Cleanup] ${errorMsg}`)
        errors.push(errorMsg)
      }
    }

    const duration = Date.now() - startTime

    console.log(`[Cleanup] Completed in ${duration}ms`)
    console.log(`[Cleanup] Processed: ${processedCount}/${expiredOrders.length} orders`)
    console.log(`[Cleanup] Total reserved stock freed: ${totalReservedFreed}`)

    return NextResponse.json({
      success: true,
      message: `Cleanup completed successfully`,
      stats: {
        found: expiredOrders.length,
        processed: processedCount,
        failed: errors.length,
        totalReservedFreed,
        duration
      },
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('[Cleanup] Fatal error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Cleanup job failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * POST endpoint для ручного запуска с опцией отмены заказов
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { cancelOrders = false } = body

    // Просто вызываем GET endpoint с теми же параметрами
    // В реальном приложении можно передать параметр cancelOrders
    return await GET(req)
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}
