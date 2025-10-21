import { NextRequest, NextResponse } from 'next/server'

// Store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Different rate limits for different endpoints
const RATE_LIMITS = {
  auth: { requests: 5, windowMs: 15 * 60 * 1000 }, // 5 requests per 15 minutes
  api: { requests: 100, windowMs: 15 * 60 * 1000 }, // 100 requests per 15 minutes
  cart: { requests: 30, windowMs: 1 * 60 * 1000 }, // 30 requests per minute
  checkout: { requests: 10, windowMs: 15 * 60 * 1000 }, // 10 requests per 15 minutes
  default: { requests: 60, windowMs: 1 * 60 * 1000 } // 60 requests per minute
}

export function getRateLimit(path: string) {
  if (path.includes('/auth')) return RATE_LIMITS.auth
  if (path.includes('/cart')) return RATE_LIMITS.cart
  if (path.includes('/checkout')) return RATE_LIMITS.checkout
  if (path.includes('/api')) return RATE_LIMITS.api
  return RATE_LIMITS.default
}

export async function rateLimit(request: NextRequest) {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const path = request.nextUrl.pathname
  const key = `${ip}:${path}`
  
  const limit = getRateLimit(path)
  const now = Date.now()
  
  // Clean up expired entries
  for (const [k, v] of rateLimitStore.entries()) {
    if (v.resetTime < now) {
      rateLimitStore.delete(k)
    }
  }
  
  const current = rateLimitStore.get(key)
  
  if (!current) {
    rateLimitStore.set(key, { count: 1, resetTime: now + limit.windowMs })
    return null
  }
  
  if (current.resetTime < now) {
    rateLimitStore.set(key, { count: 1, resetTime: now + limit.windowMs })
    return null
  }
  
  current.count++
  
  if (current.count > limit.requests) {
    const retryAfter = Math.ceil((current.resetTime - now) / 1000)
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { 
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': limit.requests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(current.resetTime).toISOString()
        }
      }
    )
  }
  
  return null
}

// IP-based blocking for security threats
const blockedIPs = new Set<string>()
const suspiciousActivity = new Map<string, number>()

export function blockIP(ip: string) {
  blockedIPs.add(ip)
}

export function isBlocked(ip: string): boolean {
  return blockedIPs.has(ip)
}

export function recordSuspiciousActivity(ip: string) {
  const count = (suspiciousActivity.get(ip) || 0) + 1
  suspiciousActivity.set(ip, count)
  
  // Auto-block after 10 suspicious activities
  if (count >= 10) {
    blockIP(ip)
  }
}