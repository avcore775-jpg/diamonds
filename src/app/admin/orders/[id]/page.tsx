'use client'

import React, { useState, useEffect } from 'react'
import { getOrderEmail, getOrderCustomerName } from '@/lib/order-utils'
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  Badge,
  useToast,
  Spinner,
  Select,
  Input,
  InputGroup,
  Divider,
  Image,
  SimpleGrid,
} from '@chakra-ui/react'
import { FaArrowLeft, FaTruck } from 'react-icons/fa'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'

interface OrderItem {
  id: string
  quantity: number
  price: number
  product: {
    id: string
    name: string
    image: string
    slug: string
  }
}

interface Order {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  total: number
  subtotal: number
  shipping: number
  tax: number
  createdAt: string
  shippedAt: string | null
  deliveredAt: string | null
  trackingNumber: string | null
  cancelReason: string | null
  notes: string | null
  shippingAddress: any
  billingAddress: any
  user: {
    id: string
    name: string | null
    email: string
    phone: string | null
  }
  orderItems: OrderItem[]
}

const ORDER_STATUSES = [
  'PENDING',
  'PAID',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'yellow'
    case 'PAID':
    case 'CONFIRMED':
      return 'blue'
    case 'PROCESSING':
      return 'purple'
    case 'SHIPPED':
      return 'orange'
    case 'DELIVERED':
      return 'green'
    case 'CANCELLED':
      return 'red'
    case 'REFUNDED':
      return 'gray'
    default:
      return 'gray'
  }
}

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'PAID':
      return 'green'
    case 'PENDING':
      return 'yellow'
    case 'FAILED':
      return 'red'
    case 'REFUNDED':
    case 'PARTIALLY_REFUNDED':
      return 'orange'
    default:
      return 'gray'
  }
}

export default function OrderDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const toast = useToast()

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  // Check admin access
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/account')
      return
    }

    if (session?.user && session.user.role !== 'ADMIN') {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to access the admin panel',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      router.push('/')
      return
    }
  }, [session, status, router, toast])

  // Fetch order details
  useEffect(() => {
    const fetchOrder = async () => {
      if (!session?.user || session.user.role !== 'ADMIN') return

      try {
        const response = await fetch(`/api/admin/orders/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setOrder(data)
        } else {
          throw new Error('Failed to fetch order')
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load order details',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.role === 'ADMIN' && params.id) {
      fetchOrder()
    }
  }, [session, toast, params.id])

  const handleUpdateStatus = async (newStatus: string) => {
    if (!order) return

    setUpdating(true)
    try {
      const updateData: any = { status: newStatus }

      // Set shipped/delivered dates automatically
      if (newStatus === 'SHIPPED' && !order.shippedAt) {
        updateData.shippedAt = new Date().toISOString()
      }
      if (newStatus === 'DELIVERED' && !order.deliveredAt) {
        updateData.deliveredAt = new Date().toISOString()
      }

      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        const updatedOrder = await response.json()
        setOrder(updatedOrder)

        toast({
          title: 'Success',
          description: 'Order status updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      } else {
        throw new Error('Failed to update order status')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setUpdating(false)
    }
  }

  const handleAddTracking = async (trackingNumber: string) => {
    if (!order) return

    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trackingNumber }),
      })

      if (response.ok) {
        const updatedOrder = await response.json()
        setOrder(updatedOrder)

        toast({
          title: 'Success',
          description: 'Tracking number added successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      } else {
        throw new Error('Failed to add tracking number')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add tracking number',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (status === 'loading' || loading) {
    return (
      <Box minH="100vh" bg="transparent">
        <Header />
        <Container maxW="7xl" pt={{ base: 24, md: 28 }} pb={8}>
          <VStack spacing={4}>
            <Spinner size="xl" color="gold.500" />
            <Text color="white">Loading order details...</Text>
          </VStack>
        </Container>
      </Box>
    )
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'ADMIN') {
    return null // Will redirect
  }

  if (!order) {
    return (
      <Box minH="100vh" bg="transparent">
        <Header />
        <Container maxW="7xl" pt={{ base: 24, md: 28 }} pb={8}>
          <VStack spacing={4}>
            <Text color="white">Order not found</Text>
            <Button as={Link} href="/admin/orders" leftIcon={<FaArrowLeft />} colorScheme="brand">
              Back to Orders
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
        <VStack spacing={6} align="stretch">
          {/* Back Button */}
          <Button
            as={Link}
            href="/admin/orders"
            leftIcon={<FaArrowLeft />}
            variant="ghost"
            alignSelf="flex-start"
            color="white"
            _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
          >
            Back to Orders
          </Button>

          {/* Page Header */}
          <Box>
            <Heading size="lg" mb={2} color="white">
              Order #{order.orderNumber}
            </Heading>
            <Text color="gray.400">
              Placed on {formatDate(order.createdAt)}
            </Text>
          </Box>

          {/* Order Status Card */}
          <Card>
            <CardHeader>
              <Heading size="md">Order Status</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <VStack align="start" spacing={2}>
                    <Text>Current Status</Text>
                    <Badge size="lg" colorScheme={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </VStack>
                  <VStack align="end" spacing={2}>
                    <Text>Payment Status</Text>
                    <Badge size="lg" colorScheme={getPaymentStatusColor(order.paymentStatus)}>
                      {order.paymentStatus}
                    </Badge>
                  </VStack>
                </HStack>

                <Divider />

                <HStack spacing={4}>
                  <Box flex={1}>
                    <Text mb={2}>Update Order Status</Text>
                    <Select
                      value={order.status}
                      onChange={(e) => handleUpdateStatus(e.target.value)}
                      isDisabled={updating}
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </Select>
                  </Box>

                  {(order.status === 'SHIPPED' || order.status === 'DELIVERED') && (
                    <Box flex={1}>
                      <Text mb={2}>Tracking Number</Text>
                      <InputGroup>
                        <Input
                          placeholder="Enter tracking number"
                          defaultValue={order.trackingNumber || ''}
                          onBlur={(e) => {
                            if (e.target.value !== order.trackingNumber) {
                              handleAddTracking(e.target.value)
                            }
                          }}
                        />
                      </InputGroup>
                    </Box>
                  )}
                </HStack>

                {order.trackingNumber && (
                  <HStack>
                    <FaTruck />
                    <Text>
                      <strong>Tracking:</strong> {order.trackingNumber}
                    </Text>
                  </HStack>
                )}
              </VStack>
            </CardBody>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <Heading size="md">Customer Information</Heading>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <VStack align="start" spacing={2}>
                  <Text fontWeight="bold">Contact Details</Text>
                  <Text><strong>Name:</strong> {getOrderCustomerName(order)}</Text>
                  <Text><strong>Email:</strong> {getOrderEmail(order)}</Text>
                  <Text><strong>Phone:</strong> {order.user?.phone || 'N/A'}</Text>
                </VStack>

                <VStack align="start" spacing={2}>
                  <Text fontWeight="bold">Shipping Address</Text>
                  <Text>{order.shippingAddress.name}</Text>
                  <Text>{order.shippingAddress.street}</Text>
                  <Text>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                  </Text>
                  <Text>{order.shippingAddress.country}</Text>
                  {order.shippingAddress.phone && (
                    <Text color="gray.400">{order.shippingAddress.phone}</Text>
                  )}
                </VStack>
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <Heading size="md">Order Items</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {order.orderItems.map((item) => (
                  <HStack key={item.id} spacing={4} p={4} border="1px" borderColor="gold.500" rounded="md">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      boxSize="80px"
                      objectFit="cover"
                      rounded="md"
                    />
                    <VStack align="start" flex="1" spacing={1}>
                      <Text fontWeight="300">{item.product.name}</Text>
                      <Text fontSize="sm" color="gray.400">
                        Quantity: {item.quantity}
                      </Text>
                      <Text fontSize="sm" color="gray.400">
                        Price: {formatCurrency(item.price)}
                      </Text>
                    </VStack>
                    <Text fontWeight="300" fontSize="lg">
                      {formatCurrency(item.price * item.quantity)}
                    </Text>
                  </HStack>
                ))}

                <Divider />

                {/* Order Summary */}
                <VStack spacing={2} align="stretch">
                  <HStack justify="space-between">
                    <Text>Subtotal</Text>
                    <Text>{formatCurrency(order.subtotal)}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Shipping</Text>
                    <Text>{formatCurrency(order.shipping)}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Tax</Text>
                    <Text>{formatCurrency(order.tax)}</Text>
                  </HStack>
                  <Divider />
                  <HStack justify="space-between">
                    <Text fontWeight="bold" fontSize="lg">Total</Text>
                    <Text fontWeight="bold" fontSize="lg">
                      {formatCurrency(order.total)}
                    </Text>
                  </HStack>
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  )
}
