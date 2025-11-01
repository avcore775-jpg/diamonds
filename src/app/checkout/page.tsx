'use client'

import React from 'react'
import {
  Box,
  Container,
  Grid,
  GridItem,
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
} from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import { apiClient } from '@/lib/api/client'
import { useSession } from 'next-auth/react'
import useSWR from 'swr'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function CheckoutPage() {
  const router = useRouter()
  const toast = useToast()
  const { data: session } = useSession()
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [paymentMethod, setPaymentMethod] = React.useState('stripe')
  
  const [shippingInfo, setShippingInfo] = React.useState({
    name: '',
    email: '',
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

  // Fetch cart data
  const { data: cart, isLoading: cartLoading } = useSWR(
    session ? '/api/cart' : null,
    () => apiClient.getCart()
  )

  // Fetch saved addresses
  const { data: savedAddresses } = useSWR(
    session ? '/api/user/addresses' : null,
    () => apiClient.getAddresses()
  )

  React.useEffect(() => {
    if (!session) {
      router.push('/signin?redirect=/checkout')
    }
  }, [session, router])

  React.useEffect(() => {
    if (session?.user) {
      setShippingInfo(prev => ({
        ...prev,
        name: session.user?.name || '',
        email: session.user?.email || '',
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
    if (!cart?.items) return 0
    return cart.items.reduce((acc: number, item: any) => 
      acc + (item.product.price * item.quantity), 0
    )
  }

  const subtotal = calculateSubtotal()
  const shipping = subtotal > 100000 ? 0 : 1500
  const tax = Math.round(subtotal * 0.08)
  const total = subtotal + shipping + tax

  const validateForm = () => {
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

      const checkoutData = {
        items: cart.items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shippingAddress,
        successUrl: `${window.location.origin}/account/orders?success=true`,
        cancelUrl: `${window.location.origin}/checkout`,
      }

      const response = await apiClient.createCheckoutSession(checkoutData)
      
      // Check if we got a Stripe URL or sessionId
      if (response.url) {
        // Redirect directly to Stripe checkout
        window.location.href = response.url
        return
      }
      
      const session = response
      
      const { error } = await stripe.redirectToCheckout({
        sessionId: session.sessionId || session.id,
      })
      
      if (error) {
        throw error
      }
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
      // Handle other payment methods
      toast({
        title: 'Payment method not available',
        description: 'Please select Stripe as payment method',
        status: 'info',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  if (!session || cartLoading) {
    return (
      <Box minH="100vh" bg="transparent">
        <Header />
        <Container maxW="7xl" pt={{ base: 24, md: 28 }} pb={8}>
          <Skeleton height="600px" />
        </Container>
      </Box>
    )
  }

  if (!cart?.items || cart.items.length === 0) {
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
                      bg="rgba(255, 255, 255, 0.1)"
                      color="white"
                      borderColor="gold.500"
                      _placeholder={{ color: 'gray.400' }}
                      _hover={{ borderColor: 'gold.400' }}
                      _focus={{ borderColor: 'gold.500', boxShadow: '0 0 0 1px gold.500' }}
                    />
                  </FormControl>

                  <HStack spacing={4}>
                    <FormControl isRequired flex={1}>
                      <FormLabel color="white">Email</FormLabel>
                      <Input
                        type="email"
                        value={shippingInfo.email}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                        bg="rgba(255, 255, 255, 0.1)"
                        color="white"
                        borderColor="gold.500"
                        _placeholder={{ color: 'gray.400' }}
                        _hover={{ borderColor: 'gold.400' }}
                        _focus={{ borderColor: 'gold.500', boxShadow: '0 0 0 1px gold.500' }}
                      />
                    </FormControl>

                    <FormControl isRequired flex={1}>
                      <FormLabel color="white">Phone</FormLabel>
                      <Input
                        type="tel"
                        value={shippingInfo.phone}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
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
                    <FormLabel color="white">Street Address</FormLabel>
                    <Input
                      value={shippingInfo.street}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, street: e.target.value })}
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
                  {cart.items.map((item: any) => (
                    <HStack key={item.id} justify="space-between" fontSize="sm">
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
                  Place Order
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