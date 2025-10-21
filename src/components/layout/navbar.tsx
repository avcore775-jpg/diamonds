'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, User, Menu, X, Search, ChevronDown } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Shop', href: '/products' },
  { name: 'Collections', href: '/collections' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
]

export function Navbar() {
  const { data: session } = useSession()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [cartItemsCount, setCartItemsCount] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (session) {
      fetch('/api/cart')
        .then(res => res.json())
        .then(data => {
          const count = Array.isArray(data) ? data.reduce((sum: number, item: any) => sum + item.quantity, 0) : 0
          setCartItemsCount(count)
        })
        .catch(() => setCartItemsCount(0))
    }
  }, [session])

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-black text-white text-center py-2 text-xs font-light tracking-wider">
        FREE SHIPPING ON ORDERS OVER $500
      </div>

      {/* Main Navbar */}
      <nav
        className={cn(
          "sticky top-0 z-50 bg-white transition-all duration-300",
          isScrolled ? "shadow-sm" : ""
        )}
      >
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 -ml-2"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center">
              <h1 className="text-xl font-light tracking-widest uppercase">
                LUXE DIAMONDS
              </h1>
            </Link>

            {/* Desktop Navigation - Centered */}
            <nav className="hidden lg:flex items-center space-x-8 absolute left-1/2 -translate-x-1/2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-light text-gray-900 hover:text-gray-600 transition-colors tracking-wide"
                >
                  {item.name}
                </Link>
              ))}
              {session?.user?.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="text-sm font-light text-gray-900 hover:text-gray-600 transition-colors tracking-wide border-l pl-8 border-gray-300"
                >
                  Admin
                </Link>
              )}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 hover:text-gray-600 transition-colors hidden sm:block"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>

              {session ? (
                <Link
                  href="/account"
                  className="p-2 hover:text-gray-600 transition-colors hidden sm:block"
                  aria-label="Account"
                >
                  <User className="h-5 w-5" />
                </Link>
              ) : (
                <Link
                  href="/auth/signin"
                  className="p-2 hover:text-gray-600 transition-colors hidden sm:block"
                  aria-label="Sign in"
                >
                  <User className="h-5 w-5" />
                </Link>
              )}

              <Link
                href="/cart"
                className="relative p-2 hover:text-gray-600 transition-colors"
                aria-label="Shopping cart"
              >
                <ShoppingBag className="h-5 w-5" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-black text-white text-xs rounded-full flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Search Bar - Expandable */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-200 overflow-hidden"
            >
              <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="relative">
                  <input
                    type="search"
                    placeholder="Search products..."
                    className="w-full px-4 py-2 pr-10 text-sm border border-gray-300 rounded-none focus:outline-none focus:border-black transition-colors"
                    autoFocus
                  />
                  <button
                    onClick={() => setIsSearchOpen(false)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            
            {/* Slide-out Menu */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed left-0 top-0 h-full w-80 bg-white z-50 lg:hidden"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-light">Menu</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <nav className="p-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-3 text-base font-light text-gray-900 hover:text-gray-600 transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
                
                <div className="border-t mt-4 pt-4">
                  <Link
                    href="/account"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-3 text-base font-light text-gray-900 hover:text-gray-600 transition-colors"
                  >
                    Account
                  </Link>
                  {session?.user?.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block py-3 text-base font-light text-gray-900 hover:text-gray-600 transition-colors"
                    >
                      Admin Panel
                    </Link>
                  )}
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}