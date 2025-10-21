import axios, { AxiosInstance } from 'axios'
import Cookies from 'js-cookie'

// API Client Configuration
class ApiClient {
  private client: AxiosInstance

  constructor() {
    // Use relative baseURL for production (Vercel) or configured URL for development
    const baseURL = process.env.NEXT_PUBLIC_API_URL ||
                    (typeof window !== 'undefined' ? window.location.origin : '')

    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    })

    // Request interceptor for auth
    this.client.interceptors.request.use(
      (config) => {
        const token = Cookies.get('next-auth.session-token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor for errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized
          Cookies.remove('next-auth.session-token')
          window.location.href = '/signin'
        }
        return Promise.reject(error)
      }
    )
  }

  // Products API
  async getProducts(params?: {
    page?: number
    limit?: number
    category?: string
    minPrice?: number
    maxPrice?: number
    sortBy?: string
  }) {
    const response = await this.client.get('/api/products', { params })
    return response.data
  }

  async getProduct(id: string) {
    const products = await this.getProducts()
    return products.find((p: any) => p.id === id || p.slug === id)
  }

  async searchProducts(query: string, filters?: any) {
    const response = await this.client.get('/api/search', {
      params: { q: query, ...filters }
    })
    return response.data
  }

  // Cart API
  async getCart() {
    try {
      const response = await this.client.get('/api/cart')
      // Cart API returns array directly, wrap it for consistent interface
      return { items: response.data }
    } catch (error) {
      return { items: [] }
    }
  }

  async addToCart(productId: string, quantity: number = 1) {
    const response = await this.client.post('/api/cart', {
      productId,
      quantity
    })
    return response.data
  }

  async updateCartItem(itemId: string, quantity: number) {
    const response = await this.client.patch(`/api/cart?itemId=${itemId}`, {
      quantity
    })
    return response.data
  }

  async removeFromCart(itemId: string) {
    const response = await this.client.delete(`/api/cart?itemId=${itemId}`)
    return response.data
  }

  // Orders API
  async getOrders(params?: {
    page?: number
    limit?: number
    status?: string
  }) {
    const response = await this.client.get('/api/orders', { params })
    return response.data
  }

  async getOrder(orderId: string) {
    const response = await this.client.get(`/api/orders/${orderId}`)
    return response.data
  }

  async createOrder(data: {
    items: Array<{ productId: string; quantity: number }>
    shippingAddress: any
    billingAddress?: any
    couponCode?: string
    notes?: string
  }) {
    const response = await this.client.post('/api/orders', data)
    return response.data
  }

  async cancelOrder(orderId: string) {
    const response = await this.client.delete(`/api/orders/${orderId}`)
    return response.data
  }

  // Checkout API
  async createCheckoutSession(data: {
    items?: Array<{ productId: string; quantity: number }>
    shippingAddress?: any
    successUrl?: string
    cancelUrl?: string
  }) {
    const response = await this.client.post('/api/checkout', data)
    return response.data
  }

  // Auth API
  async signIn(email: string) {
    const response = await this.client.post('/api/auth/signin/email', {
      email,
      callbackUrl: '/'
    })
    return response.data
  }

  async signOut() {
    const response = await this.client.post('/api/auth/signout')
    return response.data
  }

  async getSession() {
    try {
      const response = await this.client.get('/api/auth/session')
      return response.data
    } catch {
      return null
    }
  }

  // Categories API
  async getCategories() {
    try {
      const response = await this.client.get('/api/categories')
      return response.data
    } catch {
      // Return mock categories if endpoint not ready
      return [
        { id: '1', name: 'Rings', slug: 'rings' },
        { id: '2', name: 'Necklaces', slug: 'necklaces' },
        { id: '3', name: 'Earrings', slug: 'earrings' },
        { id: '4', name: 'Bracelets', slug: 'bracelets' }
      ]
    }
  }

  // Wishlist API
  async getWishlist() {
    try {
      const response = await this.client.get('/api/wishlist')
      return response.data
    } catch {
      return { items: [] }
    }
  }

  async addToWishlist(productId: string) {
    const response = await this.client.post('/api/wishlist', { productId })
    return response.data
  }

  async removeFromWishlist(productId: string) {
    const response = await this.client.delete(`/api/wishlist/${productId}`)
    return response.data
  }

  // Reviews API
  async getProductReviews(productId: string) {
    try {
      const response = await this.client.get(`/api/products/${productId}/reviews`)
      return response.data
    } catch {
      return []
    }
  }

  async createReview(productId: string, data: {
    rating: number
    comment: string
  }) {
    const response = await this.client.post(`/api/reviews`, {
      productId,
      ...data
    })
    return response.data
  }

  // User API
  async updateProfile(data: any) {
    const response = await this.client.patch('/api/user/profile', data)
    return response.data
  }

  async getAddresses() {
    try {
      const response = await this.client.get('/api/user/addresses')
      return response.data
    } catch {
      return []
    }
  }

  async addAddress(data: any) {
    const response = await this.client.post('/api/user/addresses', data)
    return response.data
  }

  async updateAddress(addressId: string, data: any) {
    const response = await this.client.patch(`/api/user/addresses/${addressId}`, data)
    return response.data
  }

  async deleteAddress(addressId: string) {
    const response = await this.client.delete(`/api/user/addresses/${addressId}`)
    return response.data
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

// Export types based on backend schema
export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number // in cents
  comparePrice?: number | null
  image: string
  images: string[]
  stock: number
  reserved: number
  sku?: string | null
  categoryId?: string | null
  tags: string[]
  isActive: boolean
  isFeatured: boolean
  carat?: number | null
  weight?: number | null
  createdAt: string
  updatedAt: string
  category?: {
    id: string
    name: string
    slug: string
  }
  _count?: {
    reviews: number
    wishlistItems: number
  }
}

export interface CartItem {
  id: string
  userId: string
  productId: string
  quantity: number
  product: Product
  createdAt: string
  updatedAt: string
}

export interface Cart {
  items: CartItem[]
}

export interface Order {
  id: string
  orderNumber: string
  userId: string
  status: 'PENDING' | 'PAID' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED'
  subtotal: number
  tax: number
  shipping: number
  total: number
  discount: number
  shippingAddress: any
  billingAddress?: any
  notes?: string
  trackingNumber?: string
  shippedAt?: string
  deliveredAt?: string
  cancelledAt?: string
  cancelReason?: string
  createdAt: string
  updatedAt: string
  orderItems: OrderItem[]
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  quantity: number
  price: number
  discount: number
  product: Product
}

export interface User {
  id: string
  email: string
  name?: string
  role: 'CUSTOMER' | 'ADMIN' | 'MANAGER' | 'SUPPORT'
  phone?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Address {
  id: string
  userId: string
  type: 'SHIPPING' | 'BILLING'
  isDefault: boolean
  name: string
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
}