'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Grid,
  GridItem,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  Image,
  Badge,
  Button,
  Skeleton,
  SkeletonText,
  Icon,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@chakra-ui/react'
import { FaGem, FaShoppingCart, FaChevronRight } from 'react-icons/fa'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import { useSession } from 'next-auth/react'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  comparePrice: number | null
  image: string
  stock: number
  category: {
    name: string
    slug: string
  } | null
}

interface Collection {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  featured: boolean
  products: Product[]
}

export default function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter()
  const { data: session } = useSession()
  const [collection, setCollection] = useState<Collection | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState<string | null>(null)

  // Unwrap params Promise for Next.js 15
  const unwrappedParams = React.use(params)
  const slug = unwrappedParams.slug

  useEffect(() => {
    fetchCollection()
  }, [slug])

  const fetchCollection = async () => {
    try {
      const response = await fetch(`/api/collections/${slug}`)
      if (response.ok) {
        const data = await response.json()
        setCollection(data)
      } else {
        router.push('/collections')
      }
    } catch (error) {
      console.error('Failed to fetch collection:', error)
      router.push('/collections')
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
  }

  const calculateDiscount = (price: number, comparePrice: number | null) => {
    if (!comparePrice || comparePrice <= price) return 0
    return Math.round(((comparePrice - price) / comparePrice) * 100)
  }

  const handleAddToCart = async (productId: string) => {
    if (!session) {
      router.push('/account')
      return
    }

    setAddingToCart(productId)
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 }),
      })

      if (response.ok) {
        // Cart updated successfully
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to add to cart:', error)
    } finally {
      setAddingToCart(null)
    }
  }

  if (isLoading) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Header />
        <Container maxW="7xl" py={12}>
          <Skeleton height="40px" width="300px" mb={4} />
          <SkeletonText noOfLines={2} mb={8} />
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
            {Array.from({ length: 6 }).map((_, index) => (
              <GridItem key={index}>
                <Card overflow="hidden">
                  <Skeleton height="250px" />
                  <CardBody>
                    <SkeletonText noOfLines={3} spacing="4" />
                  </CardBody>
                </Card>
              </GridItem>
            ))}
          </Grid>
        </Container>
      </Box>
    )
  }

  if (!collection) {
    return null
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <Header />
      
      <Container maxW="7xl" py={12}>
        {/* Breadcrumb */}
        <Breadcrumb spacing="8px" separator={<Icon as={FaChevronRight} color="gray.500" boxSize={3} />} mb={8}>
          <BreadcrumbItem>
            <BreadcrumbLink as={NextLink} href="/collections">
              Collections
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>{collection.name}</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        {/* Collection Header */}
        <VStack spacing={4} mb={12} align="start">
          <HStack spacing={4}>
            <Heading size="2xl" fontWeight="light">
              {collection.name}
            </Heading>
            {collection.featured && (
              <Badge colorScheme="yellow" variant="solid" px={3} py={1}>
                Featured Collection
              </Badge>
            )}
          </HStack>
          {collection.description && (
            <Text fontSize="lg" color="gray.600" maxW="4xl">
              {collection.description}
            </Text>
          )}
          <Text color="gray.500">
            {collection.products.length} {collection.products.length === 1 ? 'product' : 'products'} in this collection
          </Text>
        </VStack>

        {/* Products Grid */}
        {collection.products.length > 0 ? (
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)', xl: 'repeat(4, 1fr)' }} gap={6}>
            {collection.products.map((product) => {
              const discount = calculateDiscount(product.price, product.comparePrice)
              
              return (
                <GridItem key={product.id}>
                  <Card overflow="hidden" h="full">
                    <Box
                      as={NextLink}
                      href={`/product/${product.slug}`}
                      position="relative"
                      h="250px"
                      overflow="hidden"
                      cursor="pointer"
                    >
                      <Image
                        src={product.image}
                        alt={product.name}
                        w="full"
                        h="full"
                        objectFit="cover"
                        transition="transform 0.3s"
                        _hover={{ transform: 'scale(1.05)' }}
                      />
                      {discount > 0 && (
                        <Badge
                          position="absolute"
                          top={2}
                          right={2}
                          colorScheme="red"
                          variant="solid"
                        >
                          -{discount}%
                        </Badge>
                      )}
                      {product.stock <= 5 && product.stock > 0 && (
                        <Badge
                          position="absolute"
                          top={2}
                          left={2}
                          colorScheme="orange"
                          variant="solid"
                        >
                          Only {product.stock} left
                        </Badge>
                      )}
                    </Box>

                    <CardBody>
                      <VStack align="stretch" spacing={3}>
                        <Box as={NextLink} href={`/product/${product.slug}`}>
                          <Heading size="md" noOfLines={1}>
                            {product.name}
                          </Heading>
                        </Box>

                        {product.category && (
                          <Text fontSize="sm" color="gray.500">
                            {product.category.name}
                          </Text>
                        )}

                        <HStack justify="space-between">
                          <Box>
                            <HStack spacing={2}>
                              <Text fontSize="xl" fontWeight="bold" color="brand.600">
                                {formatPrice(product.price)}
                              </Text>
                              {product.comparePrice && product.comparePrice > product.price && (
                                <Text fontSize="sm" textDecoration="line-through" color="gray.400">
                                  {formatPrice(product.comparePrice)}
                                </Text>
                              )}
                            </HStack>
                          </Box>
                        </HStack>

                        <Button
                          colorScheme="brand"
                          size="sm"
                          leftIcon={<FaShoppingCart />}
                          onClick={() => handleAddToCart(product.id)}
                          isLoading={addingToCart === product.id}
                          loadingText="Adding..."
                          isDisabled={product.stock === 0}
                          width="full"
                        >
                          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>
                </GridItem>
              )
            })}
          </Grid>
        ) : (
          <VStack spacing={6} py={20}>
            <Icon as={FaGem} boxSize={20} color="gray.300" />
            <Heading size="lg" color="gray.500">
              No products in this collection yet
            </Heading>
            <Text color="gray.500">
              Check back soon for new additions to the {collection.name} collection.
            </Text>
            <Button as={NextLink} href="/collections" colorScheme="brand">
              Browse Other Collections
            </Button>
          </VStack>
        )}
      </Container>
    </Box>
  )
}