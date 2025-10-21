'use client'

import React from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  Flex,
  Select,
  HStack,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  IconButton,
  Button,
  Badge,
} from '@chakra-ui/react'
import { ChevronRightIcon } from '@chakra-ui/icons'
import { FaFilter } from 'react-icons/fa'
import NextLink from 'next/link'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/layout/Header'
import ProductGrid from '@/components/ProductGrid'
import FiltersPanel, { FilterState } from '@/components/FiltersPanel'
import { apiClient, Product } from '@/lib/api/client'
import useSWR from 'swr'

export default function CatalogPage() {
  const searchParams = useSearchParams()
  const { isOpen, onOpen, onClose } = useDisclosure()
  
  const [sortBy, setSortBy] = React.useState('featured')
  const [filters, setFilters] = React.useState<FilterState>({
    categories: [],
    priceRange: [0, 10000000], // $100,000 max - high enough for luxury diamonds
    caratRange: [0, 10],
    inStock: false,
  })

  // Get search and category from URL params
  const searchQuery = searchParams.get('search') || ''
  const categoryParam = searchParams.get('category') || ''

  // Fetch products with filters
  const { data: products, isLoading } = useSWR(
    ['/api/products', sortBy, filters, searchQuery, categoryParam],
    async () => {
      let allProducts = await apiClient.getProducts()
      
      // Apply search filter
      if (searchQuery) {
        allProducts = allProducts.filter((p: Product) => 
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }
      
      // Apply category filter from URL or filter panel
      const activeCategories = categoryParam ? [categoryParam] : filters.categories
      if (activeCategories.length > 0) {
        allProducts = allProducts.filter((p: Product) => 
          activeCategories.includes(p.category?.slug || '')
        )
      }
      
      // Apply price filter
      allProducts = allProducts.filter((p: Product) =>
        p.price >= filters.priceRange[0] &&
        p.price <= filters.priceRange[1]
      )
      
      // Apply carat filter
      if (filters.caratRange[0] > 0 || filters.caratRange[1] < 10) {
        allProducts = allProducts.filter((p: Product) => 
          p.carat && p.carat >= filters.caratRange[0] && p.carat <= filters.caratRange[1]
        )
      }
      
      // Apply stock filter
      if (filters.inStock) {
        allProducts = allProducts.filter((p: Product) => p.stock > 0)
      }
      
      // Apply sorting
      switch (sortBy) {
        case 'price-asc':
          allProducts.sort((a: Product, b: Product) => a.price - b.price)
          break
        case 'price-desc':
          allProducts.sort((a: Product, b: Product) => b.price - a.price)
          break
        case 'name':
          allProducts.sort((a: Product, b: Product) => a.name.localeCompare(b.name))
          break
        case 'newest':
          allProducts.sort((a: Product, b: Product) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          break
        case 'featured':
        default:
          allProducts.sort((a: Product, b: Product) => {
            if (a.isFeatured && !b.isFeatured) return -1
            if (!a.isFeatured && b.isFeatured) return 1
            return 0
          })
      }
      
      return allProducts
    }
  )

  // Fetch categories
  const { data: categories } = useSWR('/api/categories', () => apiClient.getCategories())

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters)
  }

  const clearAllFilters = () => {
    setFilters({
      categories: [],
      priceRange: [0, 10000000],
      caratRange: [0, 10],
      inStock: false,
    })
  }

  const activeFiltersCount =
    filters.categories.length +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000000 ? 1 : 0) +
    (filters.caratRange[0] > 0 || filters.caratRange[1] < 10 ? 1 : 0) +
    (filters.inStock ? 1 : 0)

  return (
    <Box minH="100vh" bg="gray.50">
      <Header />

      {/* Breadcrumb */}
      <Box bg="white" py={4} borderBottom="1px" borderColor="gray.200">
        <Container maxW="7xl">
          <Breadcrumb spacing='8px' separator={<ChevronRightIcon color='gray.500' />}>
            <BreadcrumbItem>
              <BreadcrumbLink as={NextLink} href='/'>
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>Catalog</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </Container>
      </Box>

      <Container maxW="7xl" py={8}>
        {/* Page Header */}
        <Flex justify="space-between" align="center" mb={8}>
          <Box>
            <Heading size="xl">
              {searchQuery ? `Search Results for "${searchQuery}"` : 'All Products'}
            </Heading>
            <Text color="gray.600" mt={2}>
              {products?.length || 0} products found
            </Text>
          </Box>
          <HStack spacing={4}>
            {/* Mobile Filter Toggle */}
            <Box display={{ base: 'block', lg: 'none' }}>
              <Button
                leftIcon={<FaFilter />}
                onClick={onOpen}
                variant="outline"
                rightIcon={activeFiltersCount > 0 && (
                  <Badge colorScheme="brand" ml={2}>
                    {activeFiltersCount}
                  </Badge>
                )}
              >
                Filters
              </Button>
            </Box>
            
            {/* Sort Dropdown */}
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              maxW="200px"
              bg="white"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="name">Name</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </Select>
          </HStack>
        </Flex>

        <Flex gap={8}>
          {/* Desktop Filters Sidebar */}
          <Box
            display={{ base: 'none', lg: 'block' }}
            w="280px"
            flexShrink={0}
          >
            <FiltersPanel
              categories={categories}
              onFiltersChange={handleFiltersChange}
              maxPrice={10000000}
              minPrice={0}
            />
          </Box>

          {/* Products Grid */}
          <Box flex={1}>
            <ProductGrid
              products={products || []}
              isLoading={isLoading}
              emptyMessage={searchQuery ? "No products found matching your search" : "No products available"}
            />
          </Box>
        </Flex>
      </Container>

      {/* Mobile Filters Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="sm">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Filters</DrawerHeader>
          <DrawerBody>
            <FiltersPanel
              categories={categories}
              onFiltersChange={handleFiltersChange}
              maxPrice={10000000}
              minPrice={0}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  )
}