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
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Divider,
  Image,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Flex,
  Spacer,
  Textarea,
} from '@chakra-ui/react'
import {
  FaEye,
  FaSearch,
  FaShoppingCart,
  FaEdit,
  FaCheck,
  FaTimes,
  FaTruck,
  FaSync,
} from 'react-icons/fa'
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

export default function AdminOrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isRefundOpen,
    onOpen: onRefundOpen,
    onClose: onRefundClose,
  } = useDisclosure()
  
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [refundOrder, setRefundOrder] = useState<Order | null>(null)
  const [refundReason, setRefundReason] = useState('')
  const cancelRef = React.useRef<HTMLButtonElement>(null)

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

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!session?.user || session.user.role !== 'ADMIN') return
      
      try {
        const response = await fetch('/api/admin/orders')
        if (response.ok) {
          const data = await response.json()
          setOrders(data.orders || data)
        } else {
          throw new Error('Failed to fetch orders')
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load orders',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.role === 'ADMIN') {
      fetchOrders()
    }
  }, [session, toast])

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    onOpen()
  }

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdating(true)
    try {
      const updateData: any = { status: newStatus }
      
      // Set shipped/delivered dates automatically
      if (newStatus === 'SHIPPED' && !orders.find(o => o.id === orderId)?.shippedAt) {
        updateData.shippedAt = new Date().toISOString()
      }
      if (newStatus === 'DELIVERED' && !orders.find(o => o.id === orderId)?.deliveredAt) {
        updateData.deliveredAt = new Date().toISOString()
      }

      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        const updatedOrder = await response.json()
        setOrders(orders.map(order => 
          order.id === orderId ? updatedOrder : order
        ))
        
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(updatedOrder)
        }
        
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

  const handleAddTracking = async (orderId: string, trackingNumber: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trackingNumber }),
      })

      if (response.ok) {
        const updatedOrder = await response.json()
        setOrders(orders.map(order => 
          order.id === orderId ? updatedOrder : order
        ))
        
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(updatedOrder)
        }
        
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

  const handleRefundOrder = (order: Order) => {
    setRefundOrder(order)
    setRefundReason('')
    onRefundOpen()
  }

  const confirmRefund = async () => {
    if (!refundOrder) return
    
    try {
      const response = await fetch(`/api/admin/orders/${refundOrder.id}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: refundReason }),
      })

      if (response.ok) {
        const updatedOrder = await response.json()
        setOrders(orders.map(order => 
          order.id === refundOrder.id ? updatedOrder : order
        ))
        
        toast({
          title: 'Success',
          description: 'Order refunded successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        onRefundClose()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process refund')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to process refund',
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

  const filteredOrders = orders.filter(order => {
    const orderEmail = getOrderEmail(order)
    const orderName = getOrderCustomerName(order)

    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      orderEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      orderName.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = !statusFilter || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  if (status === 'loading' || loading) {
    return (
      <Box minH="100vh" bg="transparent">
        <Header />
        <Container maxW="7xl" py={8}>
          <VStack spacing={4}>
            <Spinner size="xl" />
            <Text>Loading orders...</Text>
          </VStack>
        </Container>
      </Box>
    )
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'ADMIN') {
    return null // Will redirect
  }

  return (
    <Box minH="100vh" bg="transparent">
      <Header />

      <Container maxW="7xl" pt={{ base: 24, md: 28 }} pb={8}>
        <VStack spacing={6} align="stretch">
          {/* Page Header */}
          <Box>
            <Heading size="lg" mb={2} color="white">Order Management</Heading>
            <Text color="gray.400">View and manage customer orders</Text>
          </Box>

          {/* Search and Filters */}
          <Card>
            <CardBody>
              <HStack spacing={4}>
                <InputGroup maxW="400px">
                  <InputLeftElement pointerEvents="none">
                    <FaSearch color="gray.300" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </InputGroup>
                
                <Select
                  placeholder="All Statuses"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  maxW="200px"
                >
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Select>
                
                <Spacer />
                
                <Badge colorScheme="blue">{filteredOrders.length} orders</Badge>
              </HStack>
            </CardBody>
          </Card>

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <Heading size="md">Orders</Heading>
            </CardHeader>
            <CardBody>
              {filteredOrders.length === 0 ? (
                <Box textAlign="center" py={8}>
                  <FaShoppingCart size="48" color="gray.300" />
                  <Heading size="md" mt={4} color="gray.500">
                    No orders found
                  </Heading>
                  <Text color="gray.400">
                    {searchQuery || statusFilter ? 'Try adjusting your filters' : 'No orders have been placed yet'}
                  </Text>
                </Box>
              ) : (
                <TableContainer overflowX={{ base: "auto", md: "visible" }}>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Order</Th>
                        <Th>Customer</Th>
                        <Th>Date</Th>
                        <Th>Status</Th>
                        <Th>Payment</Th>
                        <Th>Total</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredOrders.map((order) => (
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
                            <VStack align="start" spacing={0}>
                              <Text>{getOrderCustomerName(order)}</Text>
                              <Text fontSize="sm" color="gray.500">
                                {getOrderEmail(order)}
                              </Text>
                            </VStack>
                          </Td>
                          <Td>{formatDate(order.createdAt)}</Td>
                          <Td>
                            <Select
                              value={order.status}
                              onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                              size="sm"
                              maxW="130px"
                              isDisabled={updating}
                            >
                              {ORDER_STATUSES.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </Select>
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
                            <HStack spacing={2}>
                              <Button
                                size="sm"
                                leftIcon={<FaEye />}
                                onClick={() => handleViewOrder(order)}
                              >
                                View
                              </Button>
                              {order.paymentStatus === 'PAID' && order.status !== 'REFUNDED' && (
                                <Button
                                  size="sm"
                                  colorScheme="red"
                                  variant="outline"
                                  leftIcon={<FaSync />}
                                  onClick={() => handleRefundOrder(order)}
                                >
                                  Refund
                                </Button>
                              )}
                            </HStack>
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
      <Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", md: "3xl", lg: "4xl" }} scrollBehavior="inside">
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

                  {/* Admin Actions */}
                  <HStack spacing={4} mb={4}>
                    <Select
                      value={selectedOrder.status}
                      onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                      maxW="200px"
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </Select>
                    
                    {selectedOrder.status === 'SHIPPED' && (
                      <InputGroup maxW="250px">
                        <Input
                          placeholder="Add tracking number"
                          defaultValue={selectedOrder.trackingNumber || ''}
                          onBlur={(e) => {
                            if (e.target.value !== selectedOrder.trackingNumber) {
                              handleAddTracking(selectedOrder.id, e.target.value)
                            }
                          }}
                        />
                      </InputGroup>
                    )}
                  </HStack>

                  {selectedOrder.trackingNumber && (
                    <Text>
                      <strong>Tracking Number:</strong> {selectedOrder.trackingNumber}
                    </Text>
                  )}
                </Box>

                <Divider />

                {/* Customer Information */}
                <Box>
                  <Heading size="sm" mb={4}>Customer Information</Heading>
                  <VStack align="start" spacing={2}>
                    <Text><strong>Name:</strong> {selectedOrder.user.name || 'N/A'}</Text>
                    <Text><strong>Email:</strong> {selectedOrder.user.email}</Text>
                    <Text><strong>Phone:</strong> {selectedOrder.user.phone || 'N/A'}</Text>
                  </VStack>
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

                {/* Admin Notes */}
                <Box>
                  <Heading size="sm" mb={4}>Admin Notes</Heading>
                  <Textarea
                    placeholder="Add internal notes about this order..."
                    defaultValue={selectedOrder.notes || ''}
                    onBlur={(e) => {
                      if (e.target.value !== selectedOrder.notes) {
                        // Update notes (you'd implement this API endpoint)
                        console.log('Update notes:', e.target.value)
                      }
                    }}
                  />
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Refund Confirmation Dialog */}
      <AlertDialog
        isOpen={isRefundOpen}
        leastDestructiveRef={cancelRef}
        onClose={onRefundClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="300">
              Refund Order
            </AlertDialogHeader>

            <AlertDialogBody>
              <VStack spacing={4} align="stretch">
                <Text>
                  Are you sure you want to refund order #{refundOrder?.orderNumber}?
                  This will process a full refund of {refundOrder && formatCurrency(refundOrder.total)}.
                </Text>
                
                <Textarea
                  placeholder="Reason for refund (optional)"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                />
              </VStack>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onRefundClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={confirmRefund}
                ml={3}
              >
                Process Refund
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  )
}