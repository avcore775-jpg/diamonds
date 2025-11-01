'use client'

import React, { useRef, useEffect, useState } from 'react'
import NextLink from 'next/link'
import NextImage from 'next/image'
import {
  Box,
  HStack,
  Text,
  VStack,
  Card,
  CardBody,
  Spinner,
  Center,
} from '@chakra-ui/react'
import { Product } from '@/lib/api/client'

interface ProductCarouselProps {
  products: Product[]
  isLoading?: boolean
}

export default function ProductCarousel({ products, isLoading }: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
  }

  // Duplicate products for seamless infinite loop
  const duplicatedProducts = products ? [...products, ...products, ...products] : []

  // Infinite loop auto-scroll functionality
  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer || isHovered || !products || products.length === 0) return

    const scrollSpeed = 0.5 // pixels per frame (slow, smooth speed)
    let animationFrameId: number

    // Calculate the width of one set of products
    const singleSetWidth = scrollContainer.scrollWidth / 3

    const autoScroll = () => {
      if (!scrollContainer) return

      // Scroll to the right
      scrollContainer.scrollLeft += scrollSpeed

      // When we've scrolled past the first set, seamlessly loop back
      if (scrollContainer.scrollLeft >= singleSetWidth * 2) {
        scrollContainer.scrollLeft = singleSetWidth
      }

      animationFrameId = requestAnimationFrame(autoScroll)
    }

    // Start scrolling from the middle set
    scrollContainer.scrollLeft = singleSetWidth

    animationFrameId = requestAnimationFrame(autoScroll)

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [isHovered, products])

  if (isLoading) {
    return (
      <Center minH="300px">
        <Spinner size="xl" color="gold.500" thickness="4px" />
      </Center>
    )
  }

  if (!products || products.length === 0) {
    return (
      <Center minH="300px">
        <Text fontSize="lg" color="gray.400">
          No products available
        </Text>
      </Center>
    )
  }

  return (
    <Box
      ref={scrollRef}
      overflowX="auto"
      overflowY="hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        scrollBehavior: 'auto',
        scrollSnapType: 'none',
        WebkitOverflowScrolling: 'touch',
        '&::-webkit-scrollbar': {
          height: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(212, 175, 55, 0.5)',
          borderRadius: '4px',
          '&:hover': {
            background: 'rgba(212, 175, 55, 0.7)',
          },
        },
      }}
    >
      <HStack spacing={{ base: 3, sm: 4, md: 6 }} align="stretch" pb={4}>
        {duplicatedProducts.map((product, index) => (
          <Card
            key={`${product.id}-${index}`}
            as={NextLink}
            href={`/product/${product.slug || product.id}`}
            minW={{ base: "180px", sm: "220px", md: "260px", lg: "280px" }}
            maxW={{ base: "180px", sm: "220px", md: "260px", lg: "280px" }}
            h={{ base: "280px", sm: "320px", md: "360px", lg: "380px" }}
            bg="#FFFFFF"
            border="2px solid"
            borderColor="gold.500"
            color="#000000"
            cursor="pointer"
            transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
            scrollSnapAlign="center"
            _hover={{
              transform: 'translateY(-8px) scale(1.02)',
              boxShadow: '0 0 30px rgba(212, 175, 55, 0.5), 0 10px 40px rgba(0, 0, 0, 0.3)',
              borderColor: 'gold.400',
            }}
          >
            <Box position="relative" height={{ base: "120px", sm: "140px", md: "180px", lg: "220px" }} width="100%" overflow="hidden">
              <NextImage
                src={product.image || '/placeholder.jpg'}
                alt={product.name}
                fill
                style={{ objectFit: 'cover' }}
                sizes="280px"
              />
            </Box>

            <CardBody>
              <VStack spacing={2} align="stretch">
                <Text
                  fontSize={{ base: "sm", md: "md" }}
                  fontWeight="300"
                  color="#000000"
                  noOfLines={2}
                  minH={{ base: "36px", md: "48px" }}
                >
                  {product.name}
                </Text>

                {product.category && (
                  <Text fontSize="xs" color="gray.600">
                    {product.category.name}
                  </Text>
                )}

                <Text fontSize={{ base: "md", md: "lg" }} fontWeight="300" color="black">
                  {formatPrice(product.price)}
                </Text>

                {product.comparePrice && (
                  <Text fontSize="sm" color="gray.500" textDecoration="line-through">
                    {formatPrice(product.comparePrice)}
                  </Text>
                )}
              </VStack>
            </CardBody>
          </Card>
        ))}
      </HStack>
    </Box>
  )
}
