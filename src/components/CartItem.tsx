'use client'

import React from 'react'
import NextLink from 'next/link'
import {
  Box,
  Flex,
  Image,
  Text,
  VStack,
  HStack,
  IconButton,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast,
  Link,
} from '@chakra-ui/react'
import { FaTrash } from 'react-icons/fa'
import { CartItem as CartItemType } from '@/lib/api/client'
import { apiClient } from '@/lib/api/client'
import { mutate } from 'swr'

interface CartItemProps {
  item: CartItemType
  onUpdate?: () => void
  onRemove?: () => void
}

export default function CartItem({ item, onUpdate, onRemove }: CartItemProps) {
  const toast = useToast()
  const [quantity, setQuantity] = React.useState(item.quantity)
  const [isUpdating, setIsUpdating] = React.useState(false)
  const [isRemoving, setIsRemoving] = React.useState(false)

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
  }

  const handleQuantityChange = async (valueString: string, valueNumber: number) => {
    if (!valueNumber || valueNumber < 1) return
    
    setQuantity(valueNumber)
    setIsUpdating(true)
    
    try {
      await apiClient.updateCartItem(item.id, valueNumber)
      mutate('/api/cart')
      onUpdate?.()
    } catch (error) {
      setQuantity(item.quantity)
      toast({
        title: 'Failed to update quantity',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemove = async () => {
    setIsRemoving(true)
    
    try {
      await apiClient.removeFromCart(item.id)
      mutate('/api/cart')
      toast({
        title: 'Item removed from cart',
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
      onRemove?.()
    } catch (error) {
      toast({
        title: 'Failed to remove item',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <Flex
      p={4}
      bg="white"
      borderRadius="lg"
      shadow="sm"
      gap={4}
      opacity={isRemoving ? 0.5 : 1}
      transition="opacity 0.2s"
    >
      <Link as={NextLink} href={`/product/${item.product.slug || item.product.id}`}>
        <Image
          src={item.product.image || '/placeholder.jpg'}
          alt={item.product.name}
          boxSize="100px"
          objectFit="cover"
          borderRadius="md"
        />
      </Link>

      <VStack flex={1} align="stretch" spacing={2}>
        <Link
          as={NextLink}
          href={`/product/${item.product.slug || item.product.id}`}
          _hover={{ textDecoration: 'none' }}
        >
          <Text fontSize="lg" fontWeight="300">
            {item.product.name}
          </Text>
        </Link>
        
        {item.product.category && (
          <Text fontSize="sm" color="gray.500">
            {item.product.category.name}
          </Text>
        )}

        <HStack spacing={4}>
          <HStack>
            <Text fontSize="sm" color="gray.600">
              Quantity:
            </Text>
            <NumberInput
              value={quantity}
              min={1}
              max={item.product.stock}
              onChange={handleQuantityChange}
              size="sm"
              maxW={20}
              isDisabled={isUpdating}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </HStack>

          <IconButton
            aria-label="Remove item"
            icon={<FaTrash />}
            size="sm"
            variant="ghost"
            colorScheme="red"
            onClick={handleRemove}
            isLoading={isRemoving}
          />
        </HStack>
      </VStack>

      <VStack align="flex-end" justify="space-between">
        <Box textAlign="right">
          <Text fontSize="sm" color="gray.500">
            Unit Price
          </Text>
          <Text fontSize="md" fontWeight="300">
            {formatPrice(item.product.price)}
          </Text>
        </Box>
        
        <Box textAlign="right">
          <Text fontSize="sm" color="gray.500">
            Subtotal
          </Text>
          <Text fontSize="lg" fontWeight="300" color="brand.600">
            {formatPrice(item.product.price * quantity)}
          </Text>
        </Box>
      </VStack>
    </Flex>
  )
}