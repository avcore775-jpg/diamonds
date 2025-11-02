'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  useToast,
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Divider,
  Image,
  Alert,
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/react'
import { FaEye, FaShoppingBag, FaCalendar, FaTruck } from 'react-icons/fa'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
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
  shippingAddress: any
  orderItems: OrderItem[]
}

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

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/account')
    }
  }, [status, router])

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!session?.user?.id) return

      try {
        const response = await fetch('/api/users/me/orders')
        if (response.ok) {
          const data = await response.json()
          // API returns { orders: [...], pagination: {...} }
          setOrders(data.orders || [])
        } else {
          throw new Error('Failed to fetch orders')
        }
      } catch (error) {
        console.error('Error fetching orders:', error)
        toast({
          title: 'Error',
          description: 'Failed to load orders',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchOrders()
    }
  }, [session, toast])

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    onOpen()
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
    })
  }

  if (status === 'loading' || loading) {
    return (
      <Box minH="100vh" bg="transparent">
        <Header />
        <Container maxW="6xl" pt={{ base: 24, md: 28 }} pb={8}>
          <VStack spacing={4}>
            <Spinner size="xl" />
            <Text>Loading orders...</Text>
          </VStack>
        </Container>
      </Box>
    )
  }

  if (status === 'unauthenticated') {
    return null // Will redirect
  }

  return (
    <Box minH="100vh" bg="transparent">
      <Header />
      
      <Container maxW="6xl" pt={{ base: 24, md: 28 }} pb={8}>
        <VStack spacing={6} align="stretch">
          {/* Page Header */}
          <Box>
            <Heading size="lg" mb={2}>My Orders</Heading>
            <Text color="gray.600">Track and manage your order history</Text>
          </Box>

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <HStack justify="space-between">
                <Heading size="md">Order History</Heading>
                <Badge colorScheme="blue">{orders.length} orders</Badge>
              </HStack>
            </CardHeader>
            <CardBody>
              {orders.length === 0 ? (
                <Box textAlign="center" py={8}>
                  <FaShoppingBag size="48" color="gray.300" />
                  <Heading size="md" mt={4} color="gray.500">
                    No orders yet
                  </Heading>
                  <Text color="gray.400" mb={4}>
                    Start shopping to see your orders here
                  </Text>
                  <Button
                    colorScheme="brand"
                    onClick={() => router.push('/catalog')}
                  >
                    Shop Now
                  </Button>
                </Box>
              ) : (
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Order</Th>
                        <Th>Date</Th>
                        <Th>Status</Th>
                        <Th>Payment</Th>
                        <Th>Total</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {orders.map((order) => (
                        <Tr key={order.id}>
                          <Td>
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="300">#{order.orderNumber}</Text>
                              <Text fontSize="sm" color="gray.500">
                                {order.orderItems.length} items
                              </Text>
                            </VStack>
                          </Td>
                          <Td>
                            <HStack>
                              <FaCalendar color="gray.400" />
                              <Text>{formatDate(order.createdAt)}</Text>
                            </HStack>
                          </Td>
                          <Td>
                            <Badge colorScheme={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </Td>
                          <Td>
                            <Badge colorScheme={getPaymentStatusColor(order.paymentStatus)}>
                              {order.paymentStatus}
                            </Badge>
                          </Td>
                          <Td>
                            <Text fontWeight="300">
                              {formatCurrency(order.total)}
                            </Text>
                          </Td>
                          <Td>
                            <Button
                              size="sm"
                              leftIcon={<FaEye />}
                              onClick={() => handleViewOrder(order)}
                            >
                              View
                            </Button>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              )}
            </CardBody>
          </Card>
        </VStack>
      </Container>

      {/* Order Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Order Details - #{selectedOrder?.orderNumber}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedOrder && (
              <VStack spacing={6} align="stretch">
                {/* Order Status */}
                <Box>
                  <HStack justify="space-between" mb={4}>
                    <VStack align="start">
                      <Badge size="lg" colorScheme={getStatusColor(selectedOrder.status)}>
                        {selectedOrder.status}
                      </Badge>
                      <Text fontSize="sm" color="gray.500">
                        Order placed on {formatDate(selectedOrder.createdAt)}
                      </Text>
                    </VStack>
                    <VStack align="end">
                      <Text fontWeight="300" fontSize="lg">
                        {formatCurrency(selectedOrder.total)}
                      </Text>
                      <Badge colorScheme={getPaymentStatusColor(selectedOrder.paymentStatus)}>
                        {selectedOrder.paymentStatus}
                      </Badge>
                    </VStack>
                  </HStack>

                  {/* Tracking Information */}
                  {selectedOrder.trackingNumber && (
                    <Alert status="info" mb={4}>
                      <AlertIcon as={FaTruck} />
                      <AlertDescription>
                        <strong>Tracking Number:</strong> {selectedOrder.trackingNumber}
                      </AlertDescription>
                    </Alert>
                  )}
                </Box>

                <Divider />

                {/* Order Items */}
                <Box>
                  <Heading size="sm" mb={4}>Order Items</Heading>
                  <VStack spacing={4} align="stretch">
                    {selectedOrder.orderItems.map((item) => (
                      <HStack key={item.id} spacing={4} p={4} border="1px" borderColor="gray.200" rounded="md">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          boxSize="60px"
                          objectFit="cover"
                          rounded="md"
                        />
                        <VStack align="start" flex="1" spacing={1}>
                          <Text fontWeight="300">{item.product.name}</Text>
                          <Text fontSize="sm" color="gray.500">
                            Quantity: {item.quantity}
                          </Text>
                        </VStack>
                        <Text fontWeight="300">
                          {formatCurrency(item.price * item.quantity)}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                </Box>

                <Divider />

                {/* Order Summary */}
                <Box>
                  <Heading size="sm" mb={4}>Order Summary</Heading>
                  <VStack spacing={2} align="stretch">
                    <HStack justify="space-between">
                      <Text>Subtotal</Text>
                      <Text>{formatCurrency(selectedOrder.subtotal)}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text>Shipping</Text>
                      <Text>{formatCurrency(selectedOrder.shipping)}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text>Tax</Text>
                      <Text>{formatCurrency(selectedOrder.tax)}</Text>
                    </HStack>
                    <Divider />
                    <HStack justify="space-between">
                      <Text fontWeight="300" fontSize="lg">Total</Text>
                      <Text fontWeight="300" fontSize="lg">
                        {formatCurrency(selectedOrder.total)}
                      </Text>
                    </HStack>
                  </VStack>
                </Box>

                <Divider />

                {/* Shipping Address */}
                <Box>
                  <Heading size="sm" mb={4}>Shipping Address</Heading>
                  <Box p={4} bg="transparent" rounded="md">
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="300">{selectedOrder.shippingAddress.name}</Text>
                      <Text>{selectedOrder.shippingAddress.street}</Text>
                      <Text>
                        {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}
                      </Text>
                      <Text>{selectedOrder.shippingAddress.country}</Text>
                      {selectedOrder.shippingAddress.phone && (
                        <Text color="gray.600">{selectedOrder.shippingAddress.phone}</Text>
                      )}
                    </VStack>
                  </Box>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}