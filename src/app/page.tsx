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
import Footer from '@/components/layout/Footer'
import ProductGrid from '@/components/ProductGrid'
import { ScrollAnimation } from '@/components/ScrollAnimation'
import { apiClient } from '@/lib/api/client'
import useSWR from 'swr'

export default function HomePage() {
  const { data: featuredProducts, isLoading } = useSWR(
    '/api/products?limit=4',
    async () => {
      const products = await apiClient.getProducts({ limit: 4 })
      return products
    }
  )

  return (
    <Box minH="100vh" bg="transparent">
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
                bg="transparent"
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
          <ScrollAnimation animation="fade-in">
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
            <VStack spacing={4}>
              <Icon as={FaGem} boxSize={10} color="gold.500" />
              <Heading size="md" color="white">Premium Quality</Heading>
              <Text textAlign="center" color="gray.300">
                Ethically sourced diamonds with GIA certification
              </Text>
            </VStack>
            <VStack spacing={4}>
              <Icon as={FaTruck} boxSize={10} color="gold.500" />
              <Heading size="md" color="white">Free Shipping</Heading>
              <Text textAlign="center" color="gray.300">
                Complimentary shipping on all orders over $1000
              </Text>
            </VStack>
            <VStack spacing={4}>
              <Icon as={FaShieldAlt} boxSize={10} color="gold.500" />
              <Heading size="md" color="white">Secure Payment</Heading>
              <Text textAlign="center" color="gray.300">
                256-bit SSL encryption for all transactions
              </Text>
            </VStack>
            <VStack spacing={4}>
              <Icon as={FaCertificate} boxSize={10} color="gold.500" />
              <Heading size="md" color="white">Lifetime Warranty</Heading>
              <Text textAlign="center" color="gray.300">
                Comprehensive warranty on all our jewelry
              </Text>
            </VStack>
          </SimpleGrid>
          </ScrollAnimation>
        </Container>
      </Box>

      {/* Featured Products */}
      <Box py={16} bg="transparent">
        <Container maxW="7xl">
          <ScrollAnimation animation="fade-in">
            <VStack spacing={12}>
              <VStack spacing={4} textAlign="center">
                <Heading size="xl" color="white">Featured Collection</Heading>
                <Text fontSize="lg" color="gray.300">
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
                colorScheme="gold"
                variant="solid"
              >
                View All Products
              </Button>
            </VStack>
          </ScrollAnimation>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box py={16} bg="transparent">
        <Container maxW="7xl">
          <Flex
            direction={{ base: 'column', md: 'row' }}
            align="center"
            justify="space-between"
            gap={8}
          >
            <VStack align={{ base: 'center', md: 'start' }} spacing={4}>
              <Heading size="lg" color="white">Subscribe to Our Newsletter</Heading>
              <Text color="gray.300">
                Get exclusive offers and be the first to know about new collections
              </Text>
            </VStack>
            <Button size="lg" colorScheme="gold" variant="solid">
              Subscribe Now
            </Button>
          </Flex>
        </Container>
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  )
}