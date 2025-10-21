import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

/**
 * Middleware to check if user has admin role
 */
export async function adminMiddleware(req: NextRequest) {
  try {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    })

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (token.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    return null // No error, proceed
  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication error' },
      { status: 401 }
    )
  }
}

/**
 * Higher-order function to wrap API handlers with admin authentication
 */
export function withAdminAuth(handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>) {
  return async (req: NextRequest, ...args: any[]) => {
    const authError = await adminMiddleware(req)
    if (authError) {
      return authError
    }
    
    return handler(req, ...args)
  }
}

/**
 * Check if user has admin role in server components
 */
export async function isAdmin(req: NextRequest): Promise<boolean> {
  try {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    })
    
    return token?.role === 'ADMIN'
  } catch (error) {
    return false
  }
}

/**
 * Get current user from token
 */
export async function getCurrentUser(req: NextRequest) {
  try {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    })
    
    if (!token) {
      return null
    }

    return {
      id: token.id as string,
      email: token.email as string,
      name: token.name as string,
      role: token.role as string,
    }
  } catch (error) {
    return null
  }
}