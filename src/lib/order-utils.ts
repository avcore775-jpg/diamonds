/**
 * Utility functions for working with orders (both user and guest orders)
 */

interface OrderWithOptionalUser {
  user?: {
    email?: string | null
    name?: string | null
  } | null
  guestEmail?: string | null
}

/**
 * Get email from order (works for both registered users and guests)
 */
export function getOrderEmail(order: OrderWithOptionalUser): string {
  return order.user?.email || order.guestEmail || 'No email'
}

/**
 * Get customer name from order (works for both registered users and guests)
 */
export function getOrderCustomerName(order: OrderWithOptionalUser): string {
  return order.user?.name || 'Guest Customer'
}

/**
 * Check if order is from a guest
 */
export function isGuestOrder(order: OrderWithOptionalUser): boolean {
  return !order.user && !!order.guestEmail
}

/**
 * Get display name for customer (name or email)
 */
export function getOrderDisplayName(order: OrderWithOptionalUser): string {
  const name = getOrderCustomerName(order)
  if (name !== 'Guest Customer') return name

  const email = getOrderEmail(order)
  return email !== 'No email' ? email : 'Guest'
}
