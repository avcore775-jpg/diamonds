'use client'

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { migrateGuestCartToUser, clearGuestCart } from '@/lib/cart-storage'

/**
 * Automatically migrates guest cart to user cart when user logs in
 */
export function CartMigration() {
  const { data: session, status } = useSession()
  const hasMigrated = useRef(false)

  useEffect(() => {
    // Only run once when user becomes authenticated
    if (status === 'authenticated' && session?.user?.id && !hasMigrated.current) {
      hasMigrated.current = true

      // Migrate guest cart to user cart
      migrateGuestCartToUser(session.user.id)
        .then(() => {
          console.log('Guest cart migrated successfully')
          // Clear guest cart after successful migration
          clearGuestCart()
        })
        .catch((error) => {
          console.error('Failed to migrate guest cart:', error)
        })
    }

    // Reset migration flag when user logs out
    if (status === 'unauthenticated') {
      hasMigrated.current = false
    }
  }, [status, session?.user?.id])

  // This component doesn't render anything
  return null
}
