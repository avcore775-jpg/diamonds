// localStorage cart utilities for guest users
import { z } from 'zod'

export interface CartItem {
  productId: string
  quantity: number
}

const CART_STORAGE_KEY = 'guest_cart'

// Zod validation schemas
const cartItemSchema = z.object({
  productId: z.string().cuid().or(z.string().uuid()).or(z.string().min(1)), // Accept CUID, UUID, or any string ID
  quantity: z.number().int().min(1).max(99)
})

const cartSchema = z.array(cartItemSchema).max(50)

/**
 * Get cart from localStorage with validation
 */
export function getGuestCart(): CartItem[] {
  if (typeof window === 'undefined') return []

  try {
    const cartString = localStorage.getItem(CART_STORAGE_KEY)
    if (!cartString) return []

    const parsed = JSON.parse(cartString)

    // Validate with Zod
    const validatedCart = cartSchema.safeParse(parsed)

    if (!validatedCart.success) {
      console.error('Invalid cart data in localStorage:', validatedCart.error)
      // Clear corrupted cart
      localStorage.removeItem(CART_STORAGE_KEY)
      return []
    }

    return validatedCart.data
  } catch (error) {
    console.error('Error reading cart from localStorage:', error)
    // Clear corrupted cart
    localStorage.removeItem(CART_STORAGE_KEY)
    return []
  }
}

/**
 * Save cart to localStorage
 */
export function saveGuestCart(cart: CartItem[]): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
  } catch (error: any) {
    // Handle quota exceeded error
    if (error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded. Cart is too large.')
      // Try to save a minimal version (remove oldest items if needed)
      try {
        const minimalCart = cart.slice(-10) // Keep only last 10 items
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(minimalCart))
        console.warn('Saved minimal cart with last 10 items')
      } catch (innerError) {
        console.error('Failed to save even minimal cart:', innerError)
      }
    } else {
      console.error('Error saving cart to localStorage:', error)
    }
  }
}

/**
 * Add item to guest cart
 */
export function addToGuestCart(productId: string, quantity: number = 1): CartItem[] {
  const cart = getGuestCart()
  const existingItem = cart.find(item => item.productId === productId)

  if (existingItem) {
    existingItem.quantity += quantity
  } else {
    cart.push({ productId, quantity })
  }

  saveGuestCart(cart)
  return cart
}

/**
 * Remove item from guest cart
 */
export function removeFromGuestCart(productId: string): CartItem[] {
  const cart = getGuestCart().filter(item => item.productId !== productId)
  saveGuestCart(cart)
  return cart
}

/**
 * Update item quantity in guest cart
 */
export function updateGuestCartQuantity(productId: string, quantity: number): CartItem[] {
  const cart = getGuestCart()
  const item = cart.find(item => item.productId === productId)

  if (item) {
    if (quantity <= 0) {
      return removeFromGuestCart(productId)
    }
    item.quantity = quantity
    saveGuestCart(cart)
  }

  return cart
}

/**
 * Clear guest cart
 */
export function clearGuestCart(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(CART_STORAGE_KEY)
}

/**
 * Get cart item count
 */
export function getGuestCartCount(): number {
  const cart = getGuestCart()
  return cart.reduce((sum, item) => sum + item.quantity, 0)
}

/**
 * Migrate guest cart to user cart after login
 */
export async function migrateGuestCartToUser(userId: string): Promise<void> {
  const guestCart = getGuestCart()

  if (guestCart.length === 0) return

  try {
    // Add each item to user's cart via API
    for (const item of guestCart) {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: item.productId,
          quantity: item.quantity
        })
      })
    }

    // Clear guest cart after successful migration
    clearGuestCart()
  } catch (error) {
    console.error('Error migrating guest cart:', error)
  }
}
