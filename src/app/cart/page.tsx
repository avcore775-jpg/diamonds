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
              <Heading color="white">Please sign in to view your cart</Heading>
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
        <Container maxW="7xl" pt={{ base: 24, md: 28 }} pb={8}>
          <Heading mb={8} color="white">Shopping Cart</Heading>
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

      <Container maxW="7xl" pt={{ base: 24, md: 28 }} pb={8}>
        <Heading mb={8} color="white">Shopping Cart</Heading>

        {!cart?.items || cart.items.length === 0 ? (
          <VStack spacing={6} py={20}>
            <Icon as={FaShoppingCart} boxSize={20} color="gold.500" />
            <Heading size="lg" color="white">Your cart is empty</Heading>
            <Text color="white">Add some items to get started</Text>
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
                <Text fontSize="lg" fontWeight="300" color="white">
                  {cart.items.length} item{cart.items.length > 1 ? 's' : ''} in cart
                </Text>
                <Button
                  as={NextLink}
                  href="/catalog"
                  variant="link"
                  color="gold.500"
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
            <Card bg="rgba(0, 0, 0, 0.6)" border="1px solid" borderColor="gold.500">
              <CardHeader>
                <Heading size="md" color="white">Order Summary</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  {/* Coupon Code */}
                  <Box>
                    <Text fontSize="sm" fontWeight="300" mb={2} color="white">
                      Coupon Code
                    </Text>
                    <InputGroup>
                      <Input
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        bg="rgba(255, 255, 255, 0.1)"
                        color="white"
                        borderColor="gold.500"
                        _placeholder={{ color: 'gray.400' }}
                        _hover={{ borderColor: 'gold.400' }}
                        _focus={{ borderColor: 'gold.500', boxShadow: '0 0 0 1px gold.500' }}
                      />
                      <InputRightElement width="4.5rem">
                        <Button
                          h="1.75rem"
                          size="sm"
                          onClick={handleApplyCoupon}
                          isLoading={isApplyingCoupon}
                          colorScheme="brand"
                        >
                          Apply
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                  </Box>

                  <Divider borderColor="gold.500" />

                  {/* Price Breakdown */}
                  <VStack spacing={2} align="stretch">
                    <HStack justify="space-between">
                      <Text color="white">Subtotal</Text>
                      <Text fontWeight="300" color="white">{formatPrice(subtotal)}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color="white">Shipping</Text>
                      <Text fontWeight="300" color="white">
                        {shipping === 0 ? 'Free' : formatPrice(shipping)}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color="white">Tax</Text>
                      <Text fontWeight="300" color="white">{formatPrice(tax)}</Text>
                    </HStack>
                  </VStack>

                  <Divider borderColor="gold.500" />

                  <HStack justify="space-between">
                    <Text fontSize="lg" fontWeight="300" color="white">Total</Text>
                    <Text fontSize="xl" fontWeight="300" color="gold.500">
                      {formatPrice(total)}
                    </Text>
                  </HStack>

                  {shipping > 0 && (
                    <Box p={3} bg="rgba(212, 175, 55, 0.2)" borderRadius="md" border="1px solid" borderColor="gold.500">
                      <Text fontSize="sm" color="white">
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
                    <Text fontSize="xs" color="gray.400">
                      Secure checkout powered by Stripe
                    </Text>
                    <Text fontSize="xs" color="gray.400">
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