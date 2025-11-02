import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default function middleware(req: NextRequest) {
  // Allow cleanup endpoint without auth (has its own auth logic)
  if (req.nextUrl.pathname === "/api/admin/cleanup-reservations") {
    return NextResponse.next()
  }

  // Apply auth middleware for all other admin routes
  return (withAuth(
    function middleware(req) {
      // If user is not admin, redirect to home
      if (req.nextUrl.pathname.startsWith("/admin") && req.nextauth.token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/", req.url))
      }
    },
    {
      callbacks: {
        authorized: ({ token }) => !!token,
      },
    }
  ) as any)(req)
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
}