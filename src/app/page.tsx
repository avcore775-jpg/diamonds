'use client'

import React from 'react'
import NextLink from 'next/link'
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  SimpleGrid,
  VStack,
  HStack,
  Icon,
  Flex,
} from '@chakra-ui/react'
import { FaGem, FaTruck, FaShieldAlt, FaCertificate } from 'react-icons/fa'
import Header from '@/components/layout/Header'
import ProductGrid from '@/components/ProductGrid'
import { apiClient } from '@/lib/api/client'
import useSWR from 'swr'

export default function HomePage() {
  const { data: featuredProducts, isLoading } = useSWR(
    '/api/products/featured',
    async () => {
      const products = await apiClient.getProducts({ limit: 4 })
      return products.filter((p: any) => p.isFeatured || p.price > 50000).slice(0, 4)
    }
  )

  return (
    <Box minH="100vh" bg="gray.50">
      <Header />

      {/* Hero Section */}
      <Box
        bgImage="url('/images/95d9fc6a0c18d048022fb963094bf931a9b0be9a-2632x1197.avif')"
        bgPosition="center"
        bgRepeat="no-repeat"
        bgSize="cover"
        color="white"
        py={20}
        position="relative"
      >
        {/* Dark overlay for better text readability */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="blackAlpha.600"
          zIndex={0}
        />
        
        <Container maxW="7xl" position="relative" zIndex={1}>
          <VStack spacing={8} textAlign="center">
            <Heading as="h1" size="3xl" fontWeight="bold" textShadow="2px 2px 4px rgba(0,0,0,0.5)">
              Luxe Diamonds
            </Heading>
            <Text fontSize="2xl" maxW="600px" textShadow="1px 1px 2px rgba(0,0,0,0.5)">
              Discover our great collection of handcrafted jewelry and certified diamonds
            </Text>
            <HStack spacing={4}>
              <Button
                as={NextLink}
                href="/catalog"
                size="lg"
                bg="white"
                color="brand.500"
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: 'lg',
                }}
              >
                Shop Collection
              </Button>
              <Button
                as={NextLink}
                href="/about"
                size="lg"
                variant="outline"
                borderColor="white"
                color="white"
                _hover={{
                  bg: 'whiteAlpha.200',
                }}
              >
                Learn More
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Features */}
      <Box py={16}>
        <Container maxW="7xl">
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
            <VStack spacing={4}>
              <Icon as={FaGem} boxSize={10} color="brand.500" />
              <Heading size="md">Premium Quality</Heading>
              <Text textAlign="center" color="gray.600">
                Ethically sourced diamonds with GIA certification
              </Text>
            </VStack>
            <VStack spacing={4}>
              <Icon as={FaTruck} boxSize={10} color="brand.500" />
              <Heading size="md">Free Shipping</Heading>
              <Text textAlign="center" color="gray.600">
                Complimentary shipping on all orders over $1000
              </Text>
            </VStack>
            <VStack spacing={4}>
              <Icon as={FaShieldAlt} boxSize={10} color="brand.500" />
              <Heading size="md">Secure Payment</Heading>
              <Text textAlign="center" color="gray.600">
                256-bit SSL encryption for all transactions
              </Text>
            </VStack>
            <VStack spacing={4}>
              <Icon as={FaCertificate} boxSize={10} color="brand.500" />
              <Heading size="md">Lifetime Warranty</Heading>
              <Text textAlign="center" color="gray.600">
                Comprehensive warranty on all our jewelry
              </Text>
            </VStack>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Featured Products */}
      <Box py={16} bg="white">
        <Container maxW="7xl">
          <VStack spacing={12}>
            <VStack spacing={4} textAlign="center">
              <Heading size="xl">Featured Collection</Heading>
              <Text fontSize="lg" color="gray.600">
                Handpicked pieces from our master craftsmen
              </Text>
            </VStack>
            
            <ProductGrid 
              products={featuredProducts || []}
              isLoading={isLoading}
              columns={{ base: 1, sm: 2, lg: 4 }}
            />
            
            <Button
              as={NextLink}
              href="/catalog"
              size="lg"
              colorScheme="brand"
            >
              View All Products
            </Button>
          </VStack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box py={16} bg="gray.100">
        <Container maxW="7xl">
          <Flex
            direction={{ base: 'column', md: 'row' }}
            align="center"
            justify="space-between"
            gap={8}
          >
            <VStack align={{ base: 'center', md: 'start' }} spacing={4}>
              <Heading size="lg">Subscribe to Our Newsletter</Heading>
              <Text color="gray.600">
                Get exclusive offers and be the first to know about new collections
              </Text>
            </VStack>
            <Button size="lg" colorScheme="brand">
              Subscribe Now
            </Button>
          </Flex>
        </Container>
      </Box>

      {/* Footer */}
      <Box bg="gray.800" color="white" py={12}>
        <Container maxW="7xl">
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
            <VStack align="start" spacing={4}>
              <Heading size="md">About Us</Heading>
              <Text fontSize="sm" color="gray.400">
                Luxe Diamonds has been crafting exceptional jewelry for over 50 years,
                combining traditional craftsmanship with modern design.
              </Text>
            </VStack>
            <VStack align="start" spacing={4}>
              <Heading size="md">Quick Links</Heading>
              <VStack align="start" spacing={2}>
                <Text as={NextLink} href="/catalog" fontSize="sm" color="gray.400" _hover={{ color: 'white' }}>
                  Shop
                </Text>
                <Text as={NextLink} href="/about" fontSize="sm" color="gray.400" _hover={{ color: 'white' }}>
                  About
                </Text>
                <Text as={NextLink} href="/contact" fontSize="sm" color="gray.400" _hover={{ color: 'white' }}>
                  Contact
                </Text>
              </VStack>
            </VStack>
            <VStack align="start" spacing={4}>
              <Heading size="md">Contact</Heading>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" color="gray.400">
                  Email: hello@luxediamonds.com
                </Text>
                <Text fontSize="sm" color="gray.400">
                  Phone: 1-800-DIAMONDS
                </Text>
              </VStack>
            </VStack>
          </SimpleGrid>
          <Box borderTopWidth={1} borderColor="gray.700" mt={8} pt={8} textAlign="center">
            <Text fontSize="sm" color="gray.400">
              © 2024 Luxe Diamonds. All rights reserved.
            </Text>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}