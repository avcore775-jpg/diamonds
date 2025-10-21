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

function CheckoutSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const toast = useToast()
  const [isLoading, setIsLoading] = React.useState(true)
  const [orderDetails, setOrderDetails] = React.useState<any>(null)
  
  React.useEffect(() => {
    const sessionId = searchParams.get('session_id')
    
    if (!session) {
      router.push('/signin')
      return
    }
    
    // Simulate fetching order details
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
  }, [session, searchParams, router, toast])
  
  if (isLoading) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Header />
        <Container maxW="4xl" py={20}>
          <Center>
            <VStack spacing={4}>
              <Spinner size="xl" color="brand.500" thickness="4px" />
              <Text fontSize="lg" color="gray.600">Processing your order...</Text>
            </VStack>
          </Center>
        </Container>
      </Box>
    )
  }
  
  return (
    <Box minH="100vh" bg="gray.50">
      <Header />
      
      <Container maxW="4xl" py={20}>
        <VStack spacing={8}>
          {/* Success Icon */}
          <Icon as={FaCheckCircle} boxSize={20} color="green.500" />
          
          {/* Success Message */}
          <VStack spacing={4} textAlign="center">
            <Heading size="2xl">Thank You for Your Order!</Heading>
            <Text fontSize="lg" color="gray.600">
              Your payment has been successfully processed.
            </Text>
            <Text fontSize="md" color="gray.500">
              We've sent a confirmation email with your order details.
            </Text>
          </VStack>
          
          {/* Order Summary Box */}
          <Box 
            w="full" 
            p={8} 
            bg="white" 
            borderRadius="lg" 
            boxShadow="md"
            borderTop="4px solid"
            borderTopColor="brand.500"
          >
            <VStack spacing={4} align="stretch">
              <Text fontSize="lg" fontWeight="semibold">What's Next?</Text>
              
              <VStack align="start" spacing={3}>
                <HStack>
                  <Text fontWeight="medium">1.</Text>
                  <Text>You'll receive an order confirmation email shortly</Text>
                </HStack>
                <HStack>
                  <Text fontWeight="medium">2.</Text>
                  <Text>We'll prepare your items for shipping</Text>
                </HStack>
                <HStack>
                  <Text fontWeight="medium">3.</Text>
                  <Text>You'll get a shipping notification with tracking info</Text>
                </HStack>
                <HStack>
                  <Text fontWeight="medium">4.</Text>
                  <Text>Your beautiful jewelry will arrive in 3-5 business days</Text>
                </HStack>
              </VStack>
            </VStack>
          </Box>
          
          {/* Action Buttons */}
          <HStack spacing={4}>
            <Button
              as={NextLink}
              href="/account/orders"
              leftIcon={<FaShoppingBag />}
              colorScheme="brand"
              size="lg"
            >
              View Orders
            </Button>
            <Button
              as={NextLink}
              href="/"
              leftIcon={<FaHome />}
              variant="outline"
              size="lg"
            >
              Continue Shopping
            </Button>
          </HStack>
        </VStack>
      </Container>
    </Box>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <Box minH="100vh" bg="gray.50">
        <Header />
        <Container maxW="4xl" py={20}>
          <Center>
            <VStack spacing={4}>
              <Spinner size="xl" color="brand.500" thickness="4px" />
              <Text fontSize="lg" color="gray.600">Loading...</Text>
            </VStack>
          </Center>
        </Container>
      </Box>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  )
}