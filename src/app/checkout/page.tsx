'use client'

import React from 'react'
import {
  Box,
  Container,
  Grid,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Checkbox,
  Card,
  CardBody,
  CardHeader,
  Divider,
  useToast,
  Radio,
  RadioGroup,
  Stack,
  Badge,
  Skeleton,
  FormErrorMessage,
} from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import { apiClient } from '@/lib/api/client'
import { useSession } from 'next-auth/react'
import useSWR from 'swr'
import { loadStripe } from '@stripe/stripe-js'
import { getGuestCart } from '@/lib/cart-storage'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function CheckoutPage() {
  const router = useRouter()
  const toast = useToast()
  const { data: session } = useSession()
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [paymentMethod, setPaymentMethod] = React.useState('stripe')
  const [guestCart, setGuestCart] = React.useState<any[]>([])
  const [guestCartProducts, setGuestCartProducts] = React.useState<any[]>([])
  const [emailError, setEmailError] = React.useState('')

  const [shippingInfo, setShippingInfo] = React.useState({
    name: '',
    email: '',
    emailConfirm: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
  })

  const [billingInfo, setBillingInfo] = React.useState({
    sameAsShipping: true,
    name: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
  })

  const isGuest = !session?.user?.id

  // Fetch cart data for logged-in users
  const { data: userCart, isLoading: cartLoading } = useSWR(
    session ? '/api/cart' : null,
    () => apiClient.getCart()
  )

  // Load guest cart from localStorage
  React.useEffect(() => {
    if (isGuest) {
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

            toast({
              title: 'Cart Updated',
              description: 'Some products in your cart are no longer available',
              status: 'warning',
              duration: 5000,
              isClosable: true,
            })
          }
        }).catch(error => {
          console.error('Error fetching guest cart products:', error)
          setGuestCartProducts([])
        })
      }
    }
  }, [isGuest, toast])

  React.useEffect(() => {
    if (session?.user) {
      setShippingInfo(prev => ({
        ...prev,
        name: session.user?.name || '',
        email: session.user?.email || '',
        emailConfirm: session.user?.email || '',
      }))
    }
  }, [session])

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

  const cart = isGuest ? { items: guestCartProducts } : userCart
  const subtotal = calculateSubtotal()
  const shipping = subtotal > 100000 ? 0 : 1500
  const tax = Math.round(subtotal * 0.08)
  const total = subtotal + shipping + tax

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateEmailMatch = () => {
    if (isGuest) {
      // Check email format
      if (!validateEmail(shippingInfo.email)) {
        setEmailError('Please enter a valid email address')
        return false
      }

      // Check emails match
      if (shippingInfo.email !== shippingInfo.emailConfirm) {
        setEmailError('Emails do not match')
        return false
      }
      setEmailError('')
    }
    return true
  }

  const validateForm = () => {
    // Validate email match for guests
    if (!validateEmailMatch()) {
      toast({
        title: 'Invalid Email',
        description: emailError || 'Please make sure both email addresses match',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return false
    }

    // Validate email format for all users
    if (!validateEmail(shippingInfo.email)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return false
    }

    const required = ['name', 'email', 'phone', 'street', 'city', 'state', 'postalCode']

    for (const field of required) {
      if (!shippingInfo[field as keyof typeof shippingInfo]) {
        toast({
          title: 'Missing Information',
          description: `Please fill in all required fields`,
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        return false
      }
    }

    return true
  }

  const handleStripeCheckout = async () => {
    if (!validateForm()) return

    setIsProcessing(true)

    try {
      const stripe = await stripePromise
      if (!stripe) throw new Error('Stripe failed to load')

      // For guests: validate stock availability before checkout
      if (isGuest && guestCartProducts.length > 0) {
        for (const item of guestCartProducts) {
          if (!item.product.isActive) {
            throw new Error(`${item.product.name} is no longer available`)
          }
          if (item.product.stock < item.quantity) {
            throw new Error(`Insufficient stock for ${item.product.name}. Only ${item.product.stock} available`)
          }
        }
      }

      // Prepare shipping address
      const shippingAddress = {
        name: shippingInfo.name,
        street: shippingInfo.street,
        city: shippingInfo.city,
        state: shippingInfo.state,
        postalCode: shippingInfo.postalCode,
        country: shippingInfo.country,
        phone: shippingInfo.phone,
      }

      const checkoutData: any = {
        shippingAddress,
      }

      // For guests: include cart items and email
      if (isGuest) {
        checkoutData.cartItems = guestCart
        checkoutData.guestEmail = shippingInfo.email
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkoutData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Checkout failed')
      }

      const data = await response.json()

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url
        return
      }

      throw new Error('No checkout URL received')
    } catch (error: any) {
      toast({
        title: 'Checkout Failed',
        description: error.message || 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePlaceOrder = async () => {
    if (paymentMethod === 'stripe') {
      await handleStripeCheckout()
    } else {
      toast({
        title: 'Payment method not available',
        description: 'Please select Stripe as payment method',
        status: 'info',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  if (!isGuest && cartLoading) {
    return (
      <Box minH="100vh" bg="transparent">
        <Header />
        <Container maxW="7xl" pt={{ base: 24, md: 28 }} pb={8}>
          <Skeleton height="600px" />
        </Container>
      </Box>
    )
  }

  const cartItems = isGuest ? guestCartProducts : (userCart?.items || [])

  if (!cartItems || cartItems.length === 0) {
    return (
      <Box minH="100vh" bg="transparent">
        <Header />
        <Container maxW="7xl" py={20}>
          <VStack spacing={4}>
            <Heading color="white">Your cart is empty</Heading>
            <Button
              onClick={() => router.push('/catalog')}
              colorScheme="brand"
              size="lg"
            >
              Continue Shopping
            </Button>
          </VStack>
        </Container>
      </Box>
    )
  }

  return (
    <Box minH="100vh" bg="transparent">
      <Header />

      <Container maxW="7xl" pt={{ base: 24, md: 28 }} pb={8}>
        <Heading mb={8} color="white">Checkout</Heading>

        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
          {/* Checkout Form */}
          <VStack spacing={6} align="stretch">
            {/* Guest Email Section - ONLY for guests */}
            {isGuest && (
              <Card bg="rgba(0, 0, 0, 0.6)" border="1px solid" borderColor="gold.500">
                <CardHeader>
                  <Heading size="md" color="white">Contact Information</Heading>
                  <Text fontSize="sm" color="gray.400" mt={2}>
                    Please provide your email address to receive order confirmation
                  </Text>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4}>
                    <FormControl isRequired isInvalid={!!emailError}>
                      <FormLabel color="white">Email Address</FormLabel>
                      <Input
                        type="email"
                        value={shippingInfo.email}
                        onChange={(e) => {
                          setShippingInfo({ ...shippingInfo, email: e.target.value })
                          setEmailError('')
                        }}
                        onBlur={validateEmailMatch}
                        placeholder="your@email.com"
                        autoComplete="email"
                        bg="rgba(255, 255, 255, 0.1)"
                        color="white"
                        borderColor="gold.500"
                        _placeholder={{ color: 'gray.400' }}
                        _hover={{ borderColor: 'gold.400' }}
                        _focus={{ borderColor: 'gold.500', boxShadow: '0 0 0 1px gold.500' }}
                      />
                    </FormControl>

                    <FormControl isRequired isInvalid={!!emailError}>
                      <FormLabel color="white">Confirm Email Address</FormLabel>
                      <Input
                        type="email"
                        value={shippingInfo.emailConfirm}
                        onChange={(e) => {
                          setShippingInfo({ ...shippingInfo, emailConfirm: e.target.value })
                          setEmailError('')
                        }}
                        onBlur={validateEmailMatch}
                        placeholder="your@email.com"
                        autoComplete="email"
                        bg="rgba(255, 255, 255, 0.1)"
                        color="white"
                        borderColor="gold.500"
                        _placeholder={{ color: 'gray.400' }}
                        _hover={{ borderColor: 'gold.400' }}
                        _focus={{ borderColor: 'gold.500', boxShadow: '0 0 0 1px gold.500' }}
                      />
                      {emailError && (
                        <FormErrorMessage color="red.400">{emailError}</FormErrorMessage>
                      )}
                    </FormControl>
                  </VStack>
                </CardBody>
              </Card>
            )}

            {/* Shipping Information */}
            <Card bg="rgba(0, 0, 0, 0.6)" border="1px solid" borderColor="gold.500">
              <CardHeader>
                <Heading size="md" color="white">Shipping Information</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel color="white">Full Name</FormLabel>
                    <Input
                      value={shippingInfo.name}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
                      autoComplete="name"
                      bg="rgba(255, 255, 255, 0.1)"
                      color="white"
                      borderColor="gold.500"
                      _placeholder={{ color: 'gray.400' }}
                      _hover={{ borderColor: 'gold.400' }}
                      _focus={{ borderColor: 'gold.500', boxShadow: '0 0 0 1px gold.500' }}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel color="white">Phone</FormLabel>
                    <Input
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                      autoComplete="tel"
                      bg="rgba(255, 255, 255, 0.1)"
                      color="white"
                      borderColor="gold.500"
                      _placeholder={{ color: 'gray.400' }}
                      _hover={{ borderColor: 'gold.400' }}
                      _focus={{ borderColor: 'gold.500', boxShadow: '0 0 0 1px gold.500' }}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel color="white">Street Address</FormLabel>
                    <Input
                      value={shippingInfo.street}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, street: e.target.value })}
                      autoComplete="street-address"
                      bg="rgba(255, 255, 255, 0.1)"
                      color="white"
                      borderColor="gold.500"
                      _placeholder={{ color: 'gray.400' }}
                      _hover={{ borderColor: 'gold.400' }}
                      _focus={{ borderColor: 'gold.500', boxShadow: '0 0 0 1px gold.500' }}
                    />
                  </FormControl>

                  <HStack spacing={4}>
                    <FormControl isRequired flex={2}>
                      <FormLabel color="white">City</FormLabel>
                      <Input
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                        autoComplete="address-level2"
                        bg="rgba(255, 255, 255, 0.1)"
                        color="white"
                        borderColor="gold.500"
                        _placeholder={{ color: 'gray.400' }}
                        _hover={{ borderColor: 'gold.400' }}
                        _focus={{ borderColor: 'gold.500', boxShadow: '0 0 0 1px gold.500' }}
                      />
                    </FormControl>

                    <FormControl isRequired flex={1}>
                      <FormLabel color="white">State</FormLabel>
                      <Input
                        value={shippingInfo.state}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                        autoComplete="address-level1"
                        bg="rgba(255, 255, 255, 0.1)"
                        color="white"
                        borderColor="gold.500"
                        _placeholder={{ color: 'gray.400' }}
                        _hover={{ borderColor: 'gold.400' }}
                        _focus={{ borderColor: 'gold.500', boxShadow: '0 0 0 1px gold.500' }}
                      />
                    </FormControl>

                    <FormControl isRequired flex={1}>
                      <FormLabel color="white">ZIP Code</FormLabel>
                      <Input
                        value={shippingInfo.postalCode}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, postalCode: e.target.value })}
                        autoComplete="postal-code"
                        bg="rgba(255, 255, 255, 0.1)"
                        color="white"
                        borderColor="gold.500"
                        _placeholder={{ color: 'gray.400' }}
                        _hover={{ borderColor: 'gold.400' }}
                        _focus={{ borderColor: 'gold.500', boxShadow: '0 0 0 1px gold.500' }}
                      />
                    </FormControl>
                  </HStack>

                  <FormControl isRequired>
                    <FormLabel color="white">Country</FormLabel>
                    <Select
                      value={shippingInfo.country}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, country: e.target.value })}
                      autoComplete="country"
                      bg="rgba(255, 255, 255, 0.1)"
                      color="white"
                      borderColor="gold.500"
                      _hover={{ borderColor: 'gold.400' }}
                      _focus={{ borderColor: 'gold.500', boxShadow: '0 0 0 1px gold.500' }}
                    >
                      <option value="US" style={{ background: 'black' }}>United States</option>
                      <option value="CA" style={{ background: 'black' }}>Canada</option>
                      <option value="UK" style={{ background: 'black' }}>United Kingdom</option>
                      <option value="AU" style={{ background: 'black' }}>Australia</option>
                    </Select>
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>

            {/* Billing Information */}
            <Card bg="rgba(0, 0, 0, 0.6)" border="1px solid" borderColor="gold.500">
              <CardHeader>
                <Heading size="md" color="white">Billing Information</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4}>
                  <Checkbox
                    isChecked={billingInfo.sameAsShipping}
                    onChange={(e) => setBillingInfo({ ...billingInfo, sameAsShipping: e.target.checked })}
                    colorScheme="brand"
                    color="white"
                  >
                    Same as shipping address
                  </Checkbox>

                  {!billingInfo.sameAsShipping && (
                    <>
                      <FormControl isRequired>
                        <FormLabel color="white">Full Name</FormLabel>
                        <Input
                          value={billingInfo.name}
                          onChange={(e) => setBillingInfo({ ...billingInfo, name: e.target.value })}
                          bg="rgba(255, 255, 255, 0.1)"
                          color="white"
                          borderColor="gold.500"
                          _placeholder={{ color: 'gray.400' }}
                          _hover={{ borderColor: 'gold.400' }}
                          _focus={{ borderColor: 'gold.500', boxShadow: '0 0 0 1px gold.500' }}
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel color="white">Street Address</FormLabel>
                        <Input
                          value={billingInfo.street}
                          onChange={(e) => setBillingInfo({ ...billingInfo, street: e.target.value })}
                          bg="rgba(255, 255, 255, 0.1)"
                          color="white"
                          borderColor="gold.500"
                          _placeholder={{ color: 'gray.400' }}
                          _hover={{ borderColor: 'gold.400' }}
                          _focus={{ borderColor: 'gold.500', boxShadow: '0 0 0 1px gold.500' }}
                        />
                      </FormControl>

                      <HStack spacing={4}>
                        <FormControl isRequired flex={2}>
                          <FormLabel color="white">City</FormLabel>
                          <Input
                            value={billingInfo.city}
                            onChange={(e) => setBillingInfo({ ...billingInfo, city: e.target.value })}
                            bg="rgba(255, 255, 255, 0.1)"
                            color="white"
                            borderColor="gold.500"
                            _placeholder={{ color: 'gray.400' }}
                            _hover={{ borderColor: 'gold.400' }}
                            _focus={{ borderColor: 'gold.500', boxShadow: '0 0 0 1px gold.500' }}
                          />
                        </FormControl>

                        <FormControl isRequired flex={1}>
                          <FormLabel color="white">State</FormLabel>
                          <Input
                            value={billingInfo.state}
                            onChange={(e) => setBillingInfo({ ...billingInfo, state: e.target.value })}
                            bg="rgba(255, 255, 255, 0.1)"
                            color="white"
                            borderColor="gold.500"
                            _placeholder={{ color: 'gray.400' }}
                            _hover={{ borderColor: 'gold.400' }}
                            _focus={{ borderColor: 'gold.500', boxShadow: '0 0 0 1px gold.500' }}
                          />
                        </FormControl>

                        <FormControl isRequired flex={1}>
                          <FormLabel color="white">ZIP Code</FormLabel>
                          <Input
                            value={billingInfo.postalCode}
                            onChange={(e) => setBillingInfo({ ...billingInfo, postalCode: e.target.value })}
                            bg="rgba(255, 255, 255, 0.1)"
                            color="white"
                            borderColor="gold.500"
                            _placeholder={{ color: 'gray.400' }}
                            _hover={{ borderColor: 'gold.400' }}
                            _focus={{ borderColor: 'gold.500', boxShadow: '0 0 0 1px gold.500' }}
                          />
                        </FormControl>
                      </HStack>
                    </>
                  )}
                </VStack>
              </CardBody>
            </Card>

            {/* Payment Method */}
            <Card bg="rgba(0, 0, 0, 0.6)" border="1px solid" borderColor="gold.500">
              <CardHeader>
                <Heading size="md" color="white">Payment Method</Heading>
              </CardHeader>
              <CardBody>
                <RadioGroup value={paymentMethod} onChange={setPaymentMethod}>
                  <Stack spacing={3}>
                    <Radio value="stripe" colorScheme="brand" color="white">
                      <HStack>
                        <Text color="white">Credit/Debit Card (Stripe)</Text>
                        <Badge colorScheme="yellow">Secure</Badge>
                      </HStack>
                    </Radio>
                    <Radio value="paypal" isDisabled color="gray.400">
                      <Text color="gray.400">PayPal (Coming Soon)</Text>
                    </Radio>
                  </Stack>
                </RadioGroup>
              </CardBody>
            </Card>
          </VStack>

          {/* Order Summary */}
          <Card h="fit-content" position="sticky" top={4} bg="rgba(0, 0, 0, 0.6)" border="1px solid" borderColor="gold.500">
            <CardHeader>
              <Heading size="md" color="white">Order Summary</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {/* Cart Items Summary */}
                <VStack spacing={2} align="stretch">
                  {cartItems.map((item: any, idx: number) => (
                    <HStack key={item.id || idx} justify="space-between" fontSize="sm">
                      <Text noOfLines={1} color="white">
                        {item.product.name} x {item.quantity}
                      </Text>
                      <Text fontWeight="300" color="white">
                        {formatPrice(item.product.price * item.quantity)}
                      </Text>
                    </HStack>
                  ))}
                </VStack>

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

                <Button
                  colorScheme="brand"
                  size="lg"
                  width="full"
                  onClick={handlePlaceOrder}
                  isLoading={isProcessing}
                  loadingText="Processing..."
                >
                  Proceed to Payment
                </Button>

                <Text fontSize="xs" color="gray.400" textAlign="center">
                  By placing your order, you agree to our terms and conditions
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </Grid>
      </Container>
    </Box>
  )
}
