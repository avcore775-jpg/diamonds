'use client'

import React from 'react'
import NextLink from 'next/link'
import NextImage from 'next/image'
import {
  Box,
  Card,
  CardBody,
  Text,
  VStack,
  HStack,
  Button,
  Badge,
  IconButton,
  useToast,
} from '@chakra-ui/react'
import { FaHeart, FaShoppingCart } from 'react-icons/fa'
import { Product } from '@/lib/api/client'
import { apiClient } from '@/lib/api/client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { mutate } from 'swr'

interface ProductCardProps {
  product: Product
  onAddToCart?: (product: Product) => void
  onAddToWishlist?: (product: Product) => void
}

export default function ProductCard({ 
  product, 
  onAddToCart, 
  onAddToWishlist 
}: ProductCardProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const toast = useToast()
  const [isAddingToCart, setIsAddingToCart] = React.useState(false)
  const [isAddingToWishlist, setIsAddingToWishlist] = React.useState(false)

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
  }

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!session) {
      router.push('/signin')
      return
    }

    setIsAddingToCart(true)
    try {
      await apiClient.addToCart(product.id, 1)
      mutate('/api/cart')
      toast({
        title: 'Added to cart',
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
      onAddToCart?.(product)
    } catch (error) {
      toast({
        title: 'Failed to add to cart',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleAddToWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!session) {
      router.push('/signin')
      return
    }

    setIsAddingToWishlist(true)
    try {
      await apiClient.addToWishlist(product.id)
      toast({
        title: 'Added to wishlist',
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
      onAddToWishlist?.(product)
    } catch (error) {
      toast({
        title: 'Failed to add to wishlist',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsAddingToWishlist(false)
    }
  }

  const discountPercentage = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0

  return (
      <Card
        as={NextLink}
        href={`/product/${product.slug || product.id}`}
        maxW="sm"
        cursor="pointer"
        bg="#FFFFFF"
        border="2px solid"
        borderColor="gold.500"
        color="#000000"
      >
      <Box position="relative" height="300px" width="100%" overflow="hidden">
        <NextImage
          src={product.image || '/placeholder.jpg'}
          alt={product.name}
          fill
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {discountPercentage > 0 && (
          <Badge
            position="absolute"
            top={2}
            left={2}
            colorScheme="red"
            fontSize="sm"
          >
            {discountPercentage}% OFF
          </Badge>
        )}
        {product.stock <= 5 && product.stock > 0 && (
          <Badge
            position="absolute"
            top={2}
            right={2}
            colorScheme="orange"
            fontSize="sm"
          >
            Only {product.stock} left
          </Badge>
        )}
        {product.stock === 0 && (
          <Badge
            position="absolute"
            top={2}
            right={2}
            colorScheme="gray"
            fontSize="sm"
          >
            Out of Stock
          </Badge>
        )}
        <IconButton
          aria-label="Add to wishlist"
          icon={<FaHeart />}
          position="absolute"
          bottom={2}
          right={2}
          size="sm"
          variant="solid"
          bg="white"
          color="gold.500"
          opacity={0.9}
          _hover={{
            opacity: 1,
            transform: "scale(1.15)",
            color: "gold.600",
            boxShadow: "0 0 15px rgba(212, 175, 55, 0.4)",
          }}
          onClick={handleAddToWishlist}
          isLoading={isAddingToWishlist}
        />
      </Box>

      <CardBody>
        <VStack spacing={3} align="stretch">
          <Text fontSize="lg" fontWeight="300" noOfLines={2} color="#000000">
            {product.name}
          </Text>

          {product.category && (
            <Badge colorScheme="yellow" width="fit-content">
              {product.category.name}
            </Badge>
          )}

          <Text fontSize="sm" color="gray.700" noOfLines={2}>
            {product.description}
          </Text>

          {product.carat && (
            <Text fontSize="xs" color="gray.600">
              {product.carat} carats
            </Text>
          )}

          <HStack spacing={2}>
            <Text fontSize="xl" fontWeight="300" color="#000000">
              {formatPrice(product.price)}
            </Text>
            {product.comparePrice && (
              <Text fontSize="sm" color="gray.500" textDecoration="line-through">
                {formatPrice(product.comparePrice)}
              </Text>
            )}
          </HStack>

          <Button
            leftIcon={<FaShoppingCart />}
            size="md"
            width="full"
            onClick={handleAddToCart}
            isLoading={isAddingToCart}
            isDisabled={product.stock === 0}
            bg="gold.500"
            color="black"
            _hover={{
              bg: "gold.600",
              transform: "translateY(-3px) scale(1.02)",
              boxShadow: "0 0 20px rgba(212, 175, 55, 0.5)",
            }}
          >
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </VStack>
      </CardBody>
    </Card>
  )
}