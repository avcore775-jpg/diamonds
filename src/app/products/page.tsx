'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  price: number
  description: string
  image: string
  stock: number
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
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

      {/* Page Header */}
      <div className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold">All Products</h1>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p>Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No products available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                {/* Product Image */}
                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                  <span className="text-6xl">💎</span>
                </div>
                
                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                  <p className="text-2xl font-bold mb-3">${(product.price / 100).toFixed(2)}</p>
                  
                  {/* Stock Status */}
                  <p className="text-sm mb-3">
                    {product.stock > 0 ? (
                      <span className="text-green-600">In Stock ({product.stock})</span>
                    ) : (
                      <span className="text-red-600">Out of Stock</span>
                    )}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link 
                      href={`/products/${product.id}`}
                      className="flex-1 bg-white border border-gray-300 text-center py-2 rounded hover:bg-gray-50"
                    >
                      View
                    </Link>
                    <button 
                      className="flex-1 bg-black text-white py-2 rounded hover:bg-gray-800"
                      disabled={product.stock === 0}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}