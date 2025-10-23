'use client'

import React from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Divider,
  useToast,
  Grid,
  GridItem,
  Card,
  CardBody,
  CardHeader,
  Input,
  InputGroup,
  InputRightElement,
  Skeleton,
  Center,
  Icon,
} from '@chakra-ui/react'
import { FaShoppingCart, FaArrowLeft } from 'react-icons/fa'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import CartItem from '@/components/CartItem'
import { apiClient } from '@/lib/api/client'
import { useSession } from 'next-auth/react'
import useSWR from 'swr'

export default function CartPage() {
  const router = useRouter()
  const toast = useToast()
  const { data: session } = useSession()
  const [couponCode, setCouponCode] = React.useState('')
  const [isApplyingCoupon, setIsApplyingCoupon] = React.useState(false)

  // Fetch cart data
  const { data: cart, isLoading, mutate: mutateCart } = useSWR(
    session ? '/api/cart' : null,
    () => apiClient.getCart()
  )

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
  }

  const calculateSubtotal = () => {
    if (!cart?.items) return 0
    return cart.items.reduce((acc: number, item: any) => 
      acc + (item.product.price * item.quantity), 0
    )
  }

  const handleCheckout = () => {
    if (!session) {
      router.push('/signin?redirect=/checkout')
      return
    }
    router.push('/checkout')
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return

    setIsApplyingCoupon(true)
    try {
      // This would normally apply the coupon through an API endpoint
      toast({
        title: 'Coupon applied',
        description: 'Your discount has been applied',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Invalid coupon',
        description: 'The coupon code is not valid',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsApplyingCoupon(false)
    }
  }

  if (!session) {
    return (
      <Box minH="100vh" bg="transparent">
        <Header />
        <Container maxW="7xl" py={20}>
          <Center>
            <VStack spacing={4}>
              <Heading>Please sign in to view your cart</Heading>
              <Button
                as={NextLink}
                href="/signin?redirect=/cart"
                colorScheme="brand"
                size="lg"
              >
                Sign In
              </Button>
            </VStack>
          </Center>
        </Container>
      </Box>
    )
  }

  if (isLoading) {
    return (
      <Box minH="100vh" bg="transparent">
        <Header />
        <Container maxW="7xl" py={8}>
          <Heading mb={8}>Shopping Cart</Heading>
          <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
            <VStack spacing={4} align="stretch">
              <Skeleton height="120px" />
              <Skeleton height="120px" />
              <Skeleton height="120px" />
            </VStack>
            <Skeleton height="400px" />
          </Grid>
        </Container>
      </Box>
    )
  }

  const subtotal = calculateSubtotal()
  const shipping = subtotal > 100000 ? 0 : 1500 // Free shipping over $1000
  const tax = Math.round(subtotal * 0.08) // 8% tax
  const total = subtotal + shipping + tax

  return (
    <Box minH="100vh" bg="transparent">
      <Header />
      
      <Container maxW="7xl" py={8}>
        <Heading mb={8}>Shopping Cart</Heading>

        {!cart?.items || cart.items.length === 0 ? (
          <VStack spacing={6} py={20}>
            <Icon as={FaShoppingCart} boxSize={20} color="gray.300" />
            <Heading size="lg" color="gray.500">Your cart is empty</Heading>
            <Text color="gray.500">Add some items to get started</Text>
            <Button
              as={NextLink}
              href="/catalog"
              colorScheme="brand"
              size="lg"
              leftIcon={<FaArrowLeft />}
            >
              Continue Shopping
            </Button>
          </VStack>
        ) : (
          <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
            {/* Cart Items */}
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between" mb={4}>
                <Text fontSize="lg" fontWeight="300">
                  {cart.items.length} item{cart.items.length > 1 ? 's' : ''} in cart
                </Text>
                <Button
                  as={NextLink}
                  href="/catalog"
                  variant="link"
                  leftIcon={<FaArrowLeft />}
                >
                  Continue Shopping
                </Button>
              </HStack>

              {cart.items.map((item: any) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdate={mutateCart}
                  onRemove={mutateCart}
                />
              ))}
            </VStack>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <Heading size="md">Order Summary</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  {/* Coupon Code */}
                  <Box>
                    <Text fontSize="sm" fontWeight="300" mb={2}>
                      Coupon Code
                    </Text>
                    <InputGroup>
                      <Input
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                      />
                      <InputRightElement width="4.5rem">
                        <Button
                          h="1.75rem"
                          size="sm"
                          onClick={handleApplyCoupon}
                          isLoading={isApplyingCoupon}
                        >
                          Apply
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                  </Box>

                  <Divider />

                  {/* Price Breakdown */}
                  <VStack spacing={2} align="stretch">
                    <HStack justify="space-between">
                      <Text>Subtotal</Text>
                      <Text fontWeight="300">{formatPrice(subtotal)}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text>Shipping</Text>
                      <Text fontWeight="300">
                        {shipping === 0 ? 'Free' : formatPrice(shipping)}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text>Tax</Text>
                      <Text fontWeight="300">{formatPrice(tax)}</Text>
                    </HStack>
                  </VStack>

                  <Divider />

                  <HStack justify="space-between">
                    <Text fontSize="lg" fontWeight="300">Total</Text>
                    <Text fontSize="xl" fontWeight="300" color="brand.600">
                      {formatPrice(total)}
                    </Text>
                  </HStack>

                  {shipping > 0 && (
                    <Box p={3} bg="blue.50" borderRadius="md">
                      <Text fontSize="sm" color="blue.700">
                        Add {formatPrice(100000 - subtotal)} more for free shipping!
                      </Text>
                    </Box>
                  )}

                  <Button
                    colorScheme="brand"
                    size="lg"
                    width="full"
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                  </Button>

                  <VStack spacing={1} align="center">
                    <Text fontSize="xs" color="gray.500">
                      Secure checkout powered by Stripe
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      SSL encrypted payment
                    </Text>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          </Grid>
        )}
      </Container>
    </Box>
  )
}