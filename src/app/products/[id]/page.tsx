'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

interface Product {
  id: string
  name: string
  price: number
  description: string
  image: string
  stock: number
  carat?: number
  weight?: number
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string)
    }
  }, [params.id])

  const fetchProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/products`)
      const data = await response.json()
      const foundProduct = data.find((p: Product) => p.id === id || p.slug === id)
      setProduct(foundProduct || null)
    } catch (error) {
      console.error('Error fetching product:', error)
      setProduct(null)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!product) return
    
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productId: product.id, 
          quantity 
        })
      })
      
      if (response.ok) {
        alert('Added to cart!')
        router.push('/cart')
      } else {
        alert('Please sign in to add items to cart')
        router.push('/auth/signin')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading product...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Product not found</p>
          <Link href="/products" className="text-blue-600 hover:underline">
            Back to products
          </Link>
        </div>
      </div>
    )
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

      {/* Product Detail */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/products" className="text-blue-600 hover:underline mb-6 inline-block">
          ← Back to products
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-9xl">💎</span>
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            <p className="text-3xl font-bold text-green-600 mb-6">
              ${(product.price / 100).toFixed(2)}
            </p>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-600">{product.description}</p>
            </div>

            {/* Product Details */}
            <div className="space-y-2 mb-6">
              {product.carat && (
                <p><span className="font-semibold">Carat:</span> {product.carat} ct</p>
              )}
              {product.weight && (
                <p><span className="font-semibold">Weight:</span> {product.weight} g</p>
              )}
              <p>
                <span className="font-semibold">Stock:</span>{' '}
                {product.stock > 0 ? (
                  <span className="text-green-600">{product.stock} available</span>
                ) : (
                  <span className="text-red-600">Out of stock</span>
                )}
              </p>
            </div>

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="mb-6">
                <label className="block font-semibold mb-2">Quantity</label>
                <select 
                  value={quantity} 
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="border rounded px-4 py-2"
                >
                  {[...Array(Math.min(10, product.stock))].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`w-full py-3 rounded font-semibold ${
                product.stock > 0 
                  ? 'bg-black text-white hover:bg-gray-800' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}