import { NextRequest, NextResponse } from 'next/server'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

export function rateLimit(options: {
  uniqueTokenPerInterval?: number
  interval?: number
}) {
  const { 
    uniqueTokenPerInterval = 500,
    interval = 60000 // 1 minute
  } = options

  return async function rateLimitMiddleware(
    request: NextRequest
  ): Promise<NextResponse | null> {
    const ip = request.headers.get('x-forwarded-for') || 
                request.headers.get('x-real-ip') || 
                'unknown'
    
    const now = Date.now()
    const key = `${ip}:${request.nextUrl.pathname}`
    
    // Clean up expired entries
    Object.keys(store).forEach(k => {
      if (store[k].resetTime < now) {
        delete store[k]
      }
    })
    
    if (!store[key]) {
      store[key] = {
        count: 0,
        resetTime: now + interval
      }
    }
    
    if (store[key].resetTime < now) {
      store[key] = {
        count: 0,
        resetTime: now + interval
      }
    }
    
    store[key].count++
    
    if (store[key].count > uniqueTokenPerInterval) {
      return NextResponse.json(
        { error: 'Too many requests, please try again later.' },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((store[key].resetTime - now) / 1000)),
            'X-RateLimit-Limit': String(uniqueTokenPerInterval),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(store[key].resetTime).toISOString()
          }
        }
      )
    }
    
    return null
  }
}

// Pre-configured rate limiters for different endpoints
export const apiRateLimit = rateLimit({
  uniqueTokenPerInterval: 100, // 100 requests
  interval: 60000 // per minute
})

export const authRateLimit = rateLimit({
  uniqueTokenPerInterval: 5, // 5 requests
  interval: 60000 // per minute
})

export const checkoutRateLimit = rateLimit({
  uniqueTokenPerInterval: 3, // 3 requests
  interval: 60000 // per minute
})