"use client"

import { SessionProvider } from "next-auth/react"
import { CartMigration } from "./CartMigration"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartMigration />
      {children}
    </SessionProvider>
  )
}