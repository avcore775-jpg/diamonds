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
import { motion } from 'framer-motion'
import { FaGem, FaTruck, FaShieldAlt, FaCertificate } from 'react-icons/fa'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ProductCarousel from '@/components/ProductCarousel'
import { ScrollAnimation } from '@/components/ScrollAnimation'
import { apiClient } from '@/lib/api/client'
import useSWR from 'swr'
import { heroTitle, heroSubtitle, buttonPress, getAnimationVariants } from '@/lib/animations'

// Wrap Chakra components with motion
const MotionButton = motion(Button)
const MotionHeading = motion(Heading)
const MotionText = motion(Text)
const MotionHStack = motion(HStack)

export default function HomePage() {
  // Fetch all products and split them into sections
  const { data: allProducts, isLoading } = useSWR(
    '/api/products',
    async () => {
      const products = await apiClient.getProducts({ limit: 20 })
      return products
    }
  )

  // Split products into three sections (random distribution for now)
  const featuredProducts = allProducts?.slice(0, 6) || []
  const bestsellers = allProducts?.slice(6, 12) || []
  const newArrivals = allProducts?.slice(12, 18) || []

  return (
    <Box minH="100vh" bg="transparent">
      <Header />

      {/* Hero Section */}
      <Box
        bgImage="url('/images/pexels-lalesh-168927.jpg')"
        bgPosition="center"
        bgRepeat="no-repeat"
        bgSize="cover"
        color="white"
        minH="100vh"
        display="flex"
        alignItems="center"
        position="relative"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgImage: "url('/images/pexels-lalesh-168927.jpg')",
          bgPosition: "center",
          bgRepeat: "no-repeat",
          bgSize: "cover",
          filter: "blur(3px)",
          zIndex: 0,
        }}
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
            <MotionHeading
              as="h1"
              size="3xl"
              fontWeight="400"
              textShadow="2px 2px 4px rgba(0,0,0,0.5)"
              color="white"
              variants={getAnimationVariants(heroTitle)}
              initial="hidden"
              animate="visible"
            >
              Jewellery That Speaks
            </MotionHeading>
            <MotionText
              as="h2"
              fontSize={{ base: 'xl', md: '2xl' }}
              fontWeight="300"
              maxW="600px"
              textShadow="1px 1px 2px rgba(0,0,0,0.5)"
              color="white"
              variants={getAnimationVariants(heroSubtitle)}
              initial="hidden"
              animate="visible"
            >
              Discover our great collection of handcrafted jewelry and certified diamonds
            </MotionText>
            <MotionHStack
              spacing={4}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6, ease: [0.4, 0, 0.2, 1] }}
            >
              <MotionButton
                as={NextLink}
                href="/collections"
                size="lg"
                bg="transparent"
                color="white"
                border="2px solid"
                borderColor="gold.500"
                variants={getAnimationVariants(buttonPress)}
                whileHover="hover"
                whileTap="tap"
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: '0 0 20px rgba(212, 175, 55, 0.5)',
                  bg: 'rgba(212, 175, 55, 0.1)',
                }}
                _active={{
                  bg: 'gold.500',
                  color: 'black',
                  transform: 'translateY(0)',
                }}
              >
                Shop Collection
              </MotionButton>
              <MotionButton
                as={NextLink}
                href="/catalog"
                size="lg"
                bg="transparent"
                color="white"
                border="2px solid"
                borderColor="gold.500"
                variants={getAnimationVariants(buttonPress)}
                whileHover="hover"
                whileTap="tap"
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: '0 0 20px rgba(212, 175, 55, 0.5)',
                  bg: 'rgba(212, 175, 55, 0.1)',
                }}
                _active={{
                  bg: 'gold.500',
                  color: 'black',
                  transform: 'translateY(0)',
                }}
              >
                Catalog
              </MotionButton>
            </MotionHStack>
          </VStack>
        </Container>
      </Box>

      {/* Featured Collection */}
      <Box pt={7} pb={16} bg="transparent">
        <Container maxW="7xl">
          <VStack spacing={8} align="stretch">
            <ScrollAnimation animation="slide-up" delay={0.1}>
              <VStack spacing={2} align="start">
                <Heading size="xl" color="gold.500">Featured Collection</Heading>
                <Text fontSize="lg" color="gold.500">
                  Handpicked pieces from our master craftsmen
                </Text>
              </VStack>
            </ScrollAnimation>

            <ScrollAnimation animation="fade-in" delay={0.2}>
              <ProductCarousel
                products={featuredProducts}
                isLoading={isLoading}
              />
            </ScrollAnimation>
          </VStack>
        </Container>
      </Box>

      {/* Bestsellers */}
      <Box py={16} bg="transparent">
        <Container maxW="7xl">
          <VStack spacing={8} align="stretch">
            <ScrollAnimation animation="slide-up" delay={0.1}>
              <VStack spacing={2} align="start">
                <Heading size="xl" color="gold.500">Bestsellers</Heading>
                <Text fontSize="lg" color="gold.500">
                  Most loved by our customers
                </Text>
              </VStack>
            </ScrollAnimation>

            <ScrollAnimation animation="fade-in" delay={0.2}>
              <ProductCarousel
                products={bestsellers}
                isLoading={isLoading}
              />
            </ScrollAnimation>
          </VStack>
        </Container>
      </Box>

      {/* New Arrival */}
      <Box py={16} bg="transparent">
        <Container maxW="7xl">
          <VStack spacing={8} align="stretch">
            <ScrollAnimation animation="slide-up" delay={0.1}>
              <VStack spacing={2} align="start">
                <Heading size="xl" color="gold.500">New Arrival</Heading>
                <Text fontSize="lg" color="gold.500">
                  Latest additions to our collection
                </Text>
              </VStack>
            </ScrollAnimation>

            <ScrollAnimation animation="fade-in" delay={0.2}>
              <ProductCarousel
                products={newArrivals}
                isLoading={isLoading}
              />
            </ScrollAnimation>
          </VStack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box py={16} bg="transparent">
        <Container maxW="7xl">
          <ScrollAnimation animation="scale-in">
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
              <MotionButton
                size="lg"
                colorScheme="gold"
                variant="solid"
                variants={getAnimationVariants(buttonPress)}
                whileHover="hover"
                whileTap="tap"
              >
                Subscribe Now
              </MotionButton>
            </Flex>
          </ScrollAnimation>
        </Container>
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  )
}
