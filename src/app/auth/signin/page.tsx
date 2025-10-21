'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const result = await signIn('email', {
        email,
        redirect: false,
      })

      if (result?.ok) {
        setMessage('Check your email for the sign-in link!')
        setEmail('')
      } else {
        setMessage('Error sending sign-in link. Please try again.')
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-bold">
              Diamond Store
            </Link>
            <div className="flex space-x-8">
              <Link href="/" className="hover:text-gray-600">Home</Link>
              <Link href="/products" className="hover:text-gray-600">Products</Link>
              <Link href="/cart" className="hover:text-gray-600">Cart</Link>
              <Link href="/auth/signin" className="hover:text-gray-600">Sign In</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Sign In Form */}
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white border rounded-lg p-8">
          <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
          
          {message && (
            <div className={`mb-4 p-3 rounded ${
              message.includes('Check') 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="your@email.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 disabled:bg-gray-400"
            >
              {loading ? 'Sending...' : 'Send Sign-In Link'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              We'll send you a magic link to sign in without a password.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}