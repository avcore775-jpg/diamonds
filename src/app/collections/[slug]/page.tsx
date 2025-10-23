'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Button,
  Skeleton,
  SkeletonText,
  Icon,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@chakra-ui/react'
import { FaGem, FaChevronRight } from 'react-icons/fa'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import ProductGrid from '@/components/ProductGrid'
import { Product } from '@/lib/api/client'

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
  const [collection, setCollection] = useState<Collection | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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


  if (isLoading) {
    return (
      <Box minH="100vh" bg="transparent">
        <Header />
        <Container maxW="7xl" py={12}>
          <Skeleton height="40px" width="300px" mb={4} />
          <SkeletonText noOfLines={2} mb={8} />
          <ProductGrid products={[]} isLoading={true} />
        </Container>
      </Box>
    )
  }

  if (!collection) {
    return null
  }

  return (
    <Box minH="100vh" bg="transparent">
      <Header />
      
      <Container maxW="7xl" py={12}>
        {/* Breadcrumb */}
        <Breadcrumb spacing="8px" separator={<Icon as={FaChevronRight} color="gold.500" boxSize={3} />} mb={8}>
          <BreadcrumbItem>
            <BreadcrumbLink as={NextLink} href="/collections" color="white" _hover={{ color: "gold.500" }}>
              Collections
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink color="gold.500">{collection.name}</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        {/* Collection Header */}
        <VStack spacing={4} mb={12} align="start">
          <HStack spacing={4}>
            <Heading size="2xl" fontWeight="300" color="gold.500">
              {collection.name}
            </Heading>
            {collection.featured && (
              <Badge colorScheme="yellow" variant="solid" px={3} py={1}>
                Featured Collection
              </Badge>
            )}
          </HStack>
          {collection.description && (
            <Text fontSize="lg" color="white" maxW="4xl">
              {collection.description}
            </Text>
          )}
          <Text color="white">
            {collection.products.length} {collection.products.length === 1 ? 'product' : 'products'} in this collection
          </Text>
        </VStack>

        {/* Products Grid */}
        <ProductGrid
          products={collection.products}
          isLoading={false}
          emptyMessage={`No products in the ${collection.name} collection yet`}
        />
      </Container>
    </Box>
  )
}