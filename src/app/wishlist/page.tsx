'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Image,
  IconButton,
  useToast,
  Spinner,
} from '@chakra-ui/react'
import { FaTrash, FaShoppingCart, FaHeart } from 'react-icons/fa'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

interface WishlistItem {
  id: string
  productId: string
  product: {
    id: string
    name: string
    slug: string
    price: number
    image: string
    description: string | null
    isActive: boolean
    stock: number
  }
  createdAt: string
}

interface Wishlist {
  id: string
  items: WishlistItem[]
}

export default function WishlistPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const toast = useToast()

  const [wishlist, setWishlist] = useState<Wishlist | null>(null)
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/account?redirect=/wishlist')
      return
    }

    if (status === 'authenticated') {
      fetchWishlist()
    }
  }, [status, router])

  const fetchWishlist = async () => {
    try {
      const response = await fetch('/api/wishlist')
      if (response.ok) {
        const data = await response.json()
        setWishlist(data)
      } else {
        throw new Error('Failed to fetch wishlist')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load wishlist',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (productId: string) => {
    setRemoving(productId)
    try {
      const response = await fetch(`/api/wishlist?productId=${productId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setWishlist(prev => {
          if (!prev) return null
          return {
            ...prev,
            items: prev.items.filter(item => item.productId !== productId)
          }
        })

        toast({
          title: 'Removed',
          description: 'Item removed from wishlist',
          status: 'success',
          duration: 2000,
          isClosable: true,
        })
      } else {
        throw new Error('Failed to remove item')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove item from wishlist',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setRemoving(null)
    }
  }

  const handleAddToCart = async (productId: string) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, quantity: 1 }),
      })

      if (response.ok) {
        toast({
          title: 'Added to Cart',
          description: 'Item added to your cart',
          status: 'success',
          duration: 2000,
          isClosable: true,
        })
      } else {
        throw new Error('Failed to add to cart')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add item to cart',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price / 100)
  }

  if (status === 'loading' || loading) {
    return (
      <Box minH="100vh" bg="transparent">
        <Header />
        <Container maxW="7xl" py={20}>
          <VStack spacing={4}>
            <Spinner size="xl" color="gold.500" />
            <Text color="white">Loading wishlist...</Text>
          </VStack>
        </Container>
        <Footer />
      </Box>
    )
  }

  if (status === 'unauthenticated') {
    return null // Will redirect
  }

  return (
    <Box minH="100vh" bg="transparent">
      <Header />

      <Container maxW="7xl" py={20}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <HStack spacing={4}>
            <FaHeart size={32} color="gold" />
            <Heading size="xl" color="white">My Wishlist</Heading>
          </HStack>

          {/* Wishlist Items */}
          {!wishlist || wishlist.items.length === 0 ? (
            <Box textAlign="center" py={20}>
              <FaHeart size={64} color="gray" />
              <Heading size="md" color="white" mt={4}>
                Your wishlist is empty
              </Heading>
              <Text color="gray.400" mt={2}>
                Save items you love to your wishlist
              </Text>
              <Button
                as={Link}
                href="/products"
                colorScheme="brand"
                mt={6}
              >
                Browse Products
              </Button>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
              {wishlist.items.map((item) => (
                <Box
                  key={item.id}
                  bg="rgba(0, 0, 0, 0.6)"
                  border="1px solid"
                  borderColor="gold.500"
                  borderRadius="lg"
                  overflow="hidden"
                  position="relative"
                  _hover={{
                    transform: 'translateY(-4px)',
                    boxShadow: '0 4px 20px rgba(212, 175, 55, 0.3)',
                  }}
                  transition="all 0.3s"
                >
                  {/* Remove Button */}
                  <IconButton
                    aria-label="Remove from wishlist"
                    icon={<FaTrash />}
                    position="absolute"
                    top={2}
                    right={2}
                    size="sm"
                    colorScheme="red"
                    onClick={() => handleRemove(item.productId)}
                    isLoading={removing === item.productId}
                    zIndex={2}
                  />

                  {/* Product Image */}
                  <Link href={`/products/${item.product.slug}`}>
                    <Box
                      position="relative"
                      height="250px"
                      bg="gray.800"
                      cursor="pointer"
                    >
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </Box>
                  </Link>

                  {/* Product Info */}
                  <VStack spacing={3} p={4} align="stretch">
                    <Link href={`/products/${item.product.slug}`}>
                      <Heading
                        size="sm"
                        color="white"
                        noOfLines={2}
                        _hover={{ color: 'gold.500' }}
                        cursor="pointer"
                      >
                        {item.product.name}
                      </Heading>
                    </Link>

                    <Text
                      fontSize="xl"
                      fontWeight="300"
                      color="gold.500"
                    >
                      {formatPrice(item.product.price)}
                    </Text>

                    {!item.product.isActive && (
                      <Text color="red.400" fontSize="sm">
                        Currently unavailable
                      </Text>
                    )}

                    {item.product.isActive && item.product.stock === 0 && (
                      <Text color="red.400" fontSize="sm">
                        Out of stock
                      </Text>
                    )}

                    <Button
                      leftIcon={<FaShoppingCart />}
                      colorScheme="brand"
                      size="sm"
                      onClick={() => handleAddToCart(item.productId)}
                      isDisabled={!item.product.isActive || item.product.stock === 0}
                    >
                      Add to Cart
                    </Button>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          )}
        </VStack>
      </Container>

      <Footer />
    </Box>
  )
}
