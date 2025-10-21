'use client'

import React from 'react'
import {
  SimpleGrid,
  Box,
  Text,
  Center,
  Spinner,
  VStack,
} from '@chakra-ui/react'
import { Product } from '@/lib/api/client'
import ProductCard from './ProductCard'

interface ProductGridProps {
  products: Product[]
  isLoading?: boolean
  emptyMessage?: string
  columns?: { base: number; sm?: number; md?: number; lg?: number; xl?: number }
}

export default function ProductGrid({
  products,
  isLoading = false,
  emptyMessage = 'No products found',
  columns = { base: 1, sm: 2, md: 3, lg: 4 },
}: ProductGridProps) {
  if (isLoading) {
    return (
      <Center minH="400px">
        <Spinner size="xl" color="brand.500" thickness="4px" />
      </Center>
    )
  }

  if (!products || products.length === 0) {
    return (
      <Center minH="400px">
        <VStack spacing={4}>
          <Text fontSize="lg" color="gray.500">
            {emptyMessage}
          </Text>
        </VStack>
      </Center>
    )
  }

  return (
    <Box>
      <SimpleGrid columns={columns} spacing={6}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </SimpleGrid>
    </Box>
  )
}