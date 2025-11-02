'use client'

import React, { Suspense } from 'react'
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Button,
  Icon,
  HStack,
  useToast,
  Spinner,
  Center
} from '@chakra-ui/react'
import { FaCheckCircle, FaHome, FaShoppingBag } from 'react-icons/fa'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/layout/Header'
import { useSession } from 'next-auth/react'
import NextLink from 'next/link'
import { clearGuestCart } from '@/lib/cart-storage'

function CheckoutSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const toast = useToast()
  const [isLoading, setIsLoading] = React.useState(true)

  const isGuest = !session?.user?.id

  React.useEffect(() => {
    const sessionId = searchParams.get('session_id')

    // Clear guest cart after successful payment
    if (isGuest && sessionId) {
      clearGuestCart()
    }

    // Show success toast
    setTimeout(() => {
      setIsLoading(false)
      if (sessionId) {
        toast({
          title: 'Order Confirmed!',
          description: 'You will receive a confirmation email shortly.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
      }
    }, 1500)
  }, [isGuest, searchParams, toast])

  if (isLoading) {
    return (
      <Box minH="100vh" bg="transparent">
        <Header />
        <Container maxW="4xl" py={20}>
          <Center>
            <VStack spacing={4}>
              <Spinner size="xl" color="brand.500" thickness="4px" />
              <Text fontSize="lg" color="white">Processing your order...</Text>
            </VStack>
          </Center>
        </Container>
      </Box>
    )
  }

  return (
    <Box minH="100vh" bg="transparent">
      <Header />

      <Container maxW="4xl" pt={{ base: 24, md: 28 }} pb={8}>
        <VStack spacing={8}>
          {/* Success Icon */}
          <Icon as={FaCheckCircle} boxSize={20} color="green.500" />

          {/* Success Message */}
          <VStack spacing={4} textAlign="center">
            <Heading size="2xl" color="white">Thank You for Your Order!</Heading>
            <Text fontSize="lg" color="gray.300">
              Your payment has been successfully processed.
            </Text>
            <Text fontSize="md" color="gray.400">
              We've sent a confirmation email with your order details.
            </Text>
          </VStack>

          {/* Order Summary Box */}
          <Box
            w="full"
            p={8}
            bg="rgba(0, 0, 0, 0.6)"
            border="1px solid"
            borderColor="gold.500"
            borderRadius="lg"
            boxShadow="md"
            borderTop="4px solid"
            borderTopColor="brand.500"
          >
            <VStack spacing={4} align="stretch">
              <Text fontSize="lg" fontWeight="300" color="white">What's Next?</Text>

              <VStack align="start" spacing={3}>
                <HStack>
                  <Text fontWeight="300" color="gold.500">1.</Text>
                  <Text color="white">You'll receive an order confirmation email shortly</Text>
                </HStack>
                <HStack>
                  <Text fontWeight="300" color="gold.500">2.</Text>
                  <Text color="white">We'll prepare your items for shipping</Text>
                </HStack>
                <HStack>
                  <Text fontWeight="300" color="gold.500">3.</Text>
                  <Text color="white">You'll get a shipping notification with tracking info</Text>
                </HStack>
                <HStack>
                  <Text fontWeight="300" color="gold.500">4.</Text>
                  <Text color="white">Your beautiful jewelry will arrive in 3-5 business days</Text>
                </HStack>
              </VStack>
            </VStack>
          </Box>

          {/* Action Buttons */}
          <HStack spacing={4} flexWrap="wrap" justify="center">
            {!isGuest && (
              <Button
                as={NextLink}
                href="/account/orders"
                leftIcon={<FaShoppingBag />}
                colorScheme="brand"
                size="lg"
              >
                View Orders
              </Button>
            )}
            <Button
              as={NextLink}
              href="/catalog"
              leftIcon={<FaHome />}
              colorScheme="brand"
              variant="outline"
              size="lg"
            >
              Continue Shopping
            </Button>
          </HStack>

          {isGuest && (
            <Box
              p={4}
              bg="rgba(212, 175, 55, 0.2)"
              borderRadius="md"
              border="1px solid"
              borderColor="gold.500"
              textAlign="center"
            >
              <Text color="white" fontSize="sm">
                Want to track your order?
                <Button
                  as={NextLink}
                  href="/signin?redirect=/account/orders"
                  variant="link"
                  color="gold.500"
                  ml={2}
                >
                  Sign in to your account
                </Button>
              </Text>
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <Box minH="100vh" bg="transparent">
        <Header />
        <Container maxW="4xl" py={20}>
          <Center>
            <VStack spacing={4}>
              <Spinner size="xl" color="brand.500" thickness="4px" />
              <Text fontSize="lg" color="white">Loading...</Text>
            </VStack>
          </Center>
        </Container>
      </Box>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  )
}
