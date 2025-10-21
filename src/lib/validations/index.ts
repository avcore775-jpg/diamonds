import { z } from 'zod'

// User validation schemas
export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional()
})

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

// Product validation schemas
export const createProductSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().positive('Price must be positive').int('Price must be in cents'),
  image: z.string().url('Invalid image URL').optional(),
  stock: z.number().int('Stock must be an integer').min(0, 'Stock cannot be negative'),
  carat: z.number().positive('Carat must be positive').optional().nullable(),
  weight: z.number().positive('Weight must be positive').optional().nullable(),
  isActive: z.boolean().default(true)
})

export const updateProductSchema = createProductSchema.partial()

// Cart validation schemas
export const addToCartSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int('Quantity must be an integer').min(1, 'Quantity must be at least 1').max(10, 'Maximum quantity is 10')
})

export const updateCartItemSchema = z.object({
  quantity: z.number().int('Quantity must be an integer').min(0, 'Quantity cannot be negative').max(10, 'Maximum quantity is 10')
})

// Order validation schemas
export const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid('Invalid product ID'),
    quantity: z.number().int().min(1).max(10)
  })).min(1, 'Order must contain at least one item'),
  shippingAddress: z.object({
    street: z.string().min(5, 'Street address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    postalCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid postal code'),
    country: z.string().length(2, 'Country code must be 2 letters')
  }),
  billingAddress: z.object({
    street: z.string().min(5, 'Street address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    postalCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid postal code'),
    country: z.string().length(2, 'Country code must be 2 letters')
  }).optional(),
  paymentMethod: z.enum(['card', 'paypal', 'crypto'])
})

// Review validation schemas
export const createReviewSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  rating: z.number().int().min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5'),
  comment: z.string().min(10, 'Review must be at least 10 characters').max(1000, 'Review must not exceed 1000 characters')
})

// Search validation schemas
export const searchSchema = z.object({
  query: z.string().min(2, 'Search query must be at least 2 characters').max(100, 'Search query too long'),
  category: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  sortBy: z.enum(['price_asc', 'price_desc', 'name', 'newest', 'rating']).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20)
})

// Sanitize input to prevent XSS
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    // Remove script tags and dangerous HTML
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim()
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput)
  }
  
  if (input && typeof input === 'object') {
    const sanitized: any = {}
    for (const key in input) {
      sanitized[key] = sanitizeInput(input[key])
    }
    return sanitized
  }
  
  return input
}

// Validate and sanitize request
export async function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<{ success: true; data: T } | { success: false; errors: string[] }> {
  try {
    const sanitized = sanitizeInput(data)
    const validated = await schema.parseAsync(sanitized)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      return { success: false, errors }
    }
    return { success: false, errors: ['Invalid input'] }
  }
}