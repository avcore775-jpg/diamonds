import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'

// Custom error class
export class AppError extends Error {
  statusCode: number
  isOperational: boolean
  
  constructor(message: string, statusCode: number = 500) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

// Error types
export const ErrorTypes = {
  ValidationError: 400,
  UnauthorizedError: 401,
  ForbiddenError: 403,
  NotFoundError: 404,
  ConflictError: 409,
  RateLimitError: 429,
  ServerError: 500,
  ServiceUnavailableError: 503
}

// Global error handler
export function handleError(error: unknown): NextResponse {
  // Log error for monitoring
  console.error('[ERROR]:', error)
  
  // Handle known errors
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message,
          code: error.name,
          statusCode: error.statusCode
        }
      },
      { status: error.statusCode }
    )
  }
  
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Validation failed',
          details: error.errors,
          statusCode: 400
        }
      },
      { status: 400 }
    )
  }
  
  // Handle Prisma errors
  if (error instanceof Error) {
    if (error.message.includes('P2002')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Duplicate entry found',
            statusCode: 409
          }
        },
        { status: 409 }
      )
    }
    
    if (error.message.includes('P2025')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Record not found',
            statusCode: 404
          }
        },
        { status: 404 }
      )
    }
  }
  
  // Default error response
  return NextResponse.json(
    {
      success: false,
      error: {
        message: 'An unexpected error occurred',
        statusCode: 500
      }
    },
    { status: 500 }
  )
}

// Async error wrapper for API routes
export function asyncHandler(fn: Function) {
  return async (req: NextRequest, ...args: any[]) => {
    try {
      return await fn(req, ...args)
    } catch (error) {
      return handleError(error)
    }
  }
}