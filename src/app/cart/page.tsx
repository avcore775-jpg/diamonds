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
  Card,
  CardBody,
  CardHeader,
  Input,
  InputGroup,
  InputRightElement,
  Skeleton,
  Center,
  Icon,
  Image,
  IconButton,
} from '@chakra-ui/react'
import { FaShoppingCart, FaArrowLeft, FaTrash, FaMinus, FaPlus } from 'react-icons/fa'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import { apiClient } from '@/lib/api/client'
import { useSession } from 'next-auth/react'
import useSWR from 'swr'
import {
  getGuestCart,
  updateGuestCartQuantity,
  removeFromGuestCart,
} from '@/lib/cart-storage'

export default function CartPage() {
  const router = useRouter()
  const toast = useToast()
  const { data: session } = useSession()
  const [couponCode, setCouponCode] = React.useState('')
  const [isApplyingCoupon, setIsApplyingCoupon] = React.useState(false)
  const [guestCart, setGuestCart] = React.useState<any[]>([])
  const [guestCartProducts, setGuestCartProducts] = React.useState<any[]>([])
  const [refreshTrigger, setRefreshTrigger] = React.useState(0)
  const [isLoadingGuestCart, setIsLoadingGuestCart] = React.useState(true)

  const isGuest = !session?.user?.id

  // Fetch cart data for logged-in users
  const { data: userCart, isLoading: userCartLoading, mutate: mutateCart } = useSWR(
    session ? '/api/cart' : null,
    () => apiClient.getCart()
  )

  // Load guest cart from localStorage
  React.useEffect(() => {
    if (isGuest) {
      setIsLoadingGuestCart(true)
      const cart = getGuestCart()
      setGuestCart(cart)

      // Fetch product details for guest cart items
      if (cart.length > 0) {
        Promise.all(
          cart.map(item =>
            fetch(`/api/products/${item.productId}`)
              .then(res => {
                if (!res.ok) return null
                return res.json()
              })
              .catch(() => null)
          )
        ).then(products => {
          // Filter out null products (deleted or not found)
          const cartWithProducts = cart
            .map((item, idx) => ({
              productId: item.productId,
              quantity: item.quantity,
              product: products[idx]
            }))
            .filter(item => item.product !== null)

          setGuestCartProducts(cartWithProducts)

          // If some products were removed, update localStorage
          if (cartWithProducts.length < cart.length) {
            const validProductIds = cartWithProducts.map(item => item.productId)
            const updatedCart = cart.filter(item => validProductIds.includes(item.productId))
            localStorage.setItem('guest_cart', JSON.stringify(updatedCart))
          }
          setIsLoadingGuestCart(false)
        }).catch(error => {
          console.error('Error fetching guest cart products:', error)
          setGuestCartProducts([])
          setIsLoadingGuestCart(false)
        })
      } else {
        setGuestCartProducts([])
        setIsLoadingGuestCart(false)
      }
    }
  }, [isGuest, refreshTrigger])

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
  }

  const calculateSubtotal = () => {
    if (isGuest) {
      return guestCartProducts.reduce((acc, item) =>
        acc + (item.product.price * item.quantity), 0
      )
    }
    if (!userCart?.items) return 0
    return userCart.items.reduce((acc: number, item: any) =>
      acc + (item.product.price * item.quantity), 0
    )
  }

  const handleCheckout = () => {
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

  const handleGuestUpdateQuantity = (productId: string, newQuantity: number) => {
    updateGuestCartQuantity(productId, newQuantity)
    setRefreshTrigger(prev => prev + 1)
    toast({
      title: 'Cart updated',
      status: 'success',
      duration: 2000,
      isClosable: true,
    })
  }

  const handleGuestRemove = (productId: string) => {
    removeFromGuestCart(productId)
    setRefreshTrigger(prev => prev + 1)
    toast({
      title: 'Item removed from cart',
      status: 'info',
      duration: 2000,
      isClosable: true,
    })
  }

  const handleUserUpdateQuantity = async (itemId: string, newQuantity: number) => {
    try {
      await fetch(`/api/cart?itemId=${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity }),
      })
      mutateCart()
      toast({
        title: 'Cart updated',
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Error updating cart',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleUserRemove = async (itemId: string) => {
    try {
      await fetch(`/api/cart?itemId=${itemId}`, {
        method: 'DELETE',
      })
      mutateCart()
      toast({
        title: 'Item removed from cart',
        status: 'info',
        duration: 2000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Error removing item',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const isLoading = isGuest ? isLoadingGuestCart : userCartLoading

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

  const cartItems = isGuest ? guestCartProducts : (userCart?.items || [])
  const subtotal = calculateSubtotal()
  const shipping = subtotal > 100000 ? 0 : 1500 // Free shipping over $1000
  const tax = Math.round(subtotal * 0.08) // 8% tax
  const total = subtotal + shipping + tax

  return (
    <Box minH="100vh" bg="transparent">
      <Header />

      <Container maxW="7xl" pt={{ base: 24, md: 28 }} pb={8}>
        <Heading mb={8} color="white">Shopping Cart</Heading>

        {!cartItems || cartItems.length === 0 ? (
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
                  {cartItems.length} item{cartItems.length > 1 ? 's' : ''} in cart
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

              {cartItems.map((item: any, idx: number) => (
                <Card
                  key={item.id || item.productId || idx}
                  bg="rgba(0, 0, 0, 0.6)"
                  border="1px solid"
                  borderColor="gold.500"
                >
                  <CardBody>
                    <HStack spacing={4} align="start">
                      <Image
                        src={item.product.image || '/placeholder.jpg'}
                        alt={item.product.name}
                        boxSize="100px"
                        objectFit="cover"
                        borderRadius="md"
                      />

                      <VStack flex={1} align="start" spacing={2}>
                        <Heading size="sm" color="white">{item.product.name}</Heading>
                        <Text fontSize="sm" color="gray.400" noOfLines={2}>
                          {item.product.description}
                        </Text>
                        <Text fontSize="lg" fontWeight="300" color="gold.500">
                          {formatPrice(item.product.price)}
                        </Text>

                        <HStack spacing={4} mt={2}>
                          <HStack>
                            <IconButton
                              aria-label="Decrease quantity"
                              icon={<FaMinus />}
                              size="sm"
                              onClick={() => {
                                const newQuantity = item.quantity - 1
                                if (isGuest) {
                                  handleGuestUpdateQuantity(item.productId, newQuantity)
                                } else {
                                  handleUserUpdateQuantity(item.id, newQuantity)
                                }
                              }}
                              isDisabled={item.quantity <= 1}
                              colorScheme="brand"
                              variant="outline"
                            />
                            <Text color="white" minW="40px" textAlign="center">
                              {item.quantity}
                            </Text>
                            <IconButton
                              aria-label="Increase quantity"
                              icon={<FaPlus />}
                              size="sm"
                              onClick={() => {
                                const newQuantity = item.quantity + 1
                                if (isGuest) {
                                  handleGuestUpdateQuantity(item.productId, newQuantity)
                                } else {
                                  handleUserUpdateQuantity(item.id, newQuantity)
                                }
                              }}
                              colorScheme="brand"
                              variant="outline"
                            />
                          </HStack>

                          <IconButton
                            aria-label="Remove item"
                            icon={<FaTrash />}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => {
                              if (isGuest) {
                                handleGuestRemove(item.productId)
                              } else {
                                handleUserRemove(item.id)
                              }
                            }}
                          />
                        </HStack>
                      </VStack>

                      <Text fontSize="lg" fontWeight="300" color="white">
                        {formatPrice(item.product.price * item.quantity)}
                      </Text>
                    </HStack>
                  </CardBody>
                </Card>
              ))}
            </VStack>

            {/* Order Summary */}
            <Card bg="rgba(0, 0, 0, 0.6)" border="1px solid" borderColor="gold.500" h="fit-content" position="sticky" top={4}>
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

                  {shipping > 0 && subtotal < 100000 && (
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
