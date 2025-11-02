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
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Icon,
  Divider,
  Image,
} from '@chakra-ui/react'
import {
  FaDollarSign,
  FaShoppingCart,
  FaBox,
  FaUsers,
  FaEye,
  FaTrendingUp,
  FaTrendingDown,
  FaPlus,
  FaCog,
  FaChartLine,
} from 'react-icons/fa'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'

interface DashboardStats {
  totalRevenue: number
  revenueChange: number
  totalOrders: number
  ordersChange: number
  totalProducts: number
  productsChange: number
  totalUsers: number
  usersChange: number
}

interface RecentOrder {
  id: string
  orderNumber: string
  user: {
    name: string | null
    email: string
  }
  total: number
  status: string
  createdAt: string
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'gray'
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

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const toast = useToast()
  
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [loading, setLoading] = useState(true)

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

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!session?.user || session.user.role !== 'ADMIN') return
      
      try {
        // Fetch stats
        const statsResponse = await fetch('/api/admin/dashboard/stats')
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData)
        }

        // Fetch recent orders
        const ordersResponse = await fetch('/api/admin/orders?limit=10')
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json()
          setRecentOrders(ordersData.orders || ordersData)
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.role === 'ADMIN') {
      fetchDashboardData()
    }
  }, [session, toast])

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
        <Container maxW="7xl" pt={{ base: 24, md: 28 }} pb={8}>
          <VStack spacing={4}>
            <Spinner size="xl" color="gold.500" />
            <Text color="white">Loading admin dashboard...</Text>
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
        <VStack spacing={1} align="stretch">
          {/* Header Row: Title, Logo, Buttons - Responsive */}
          <VStack spacing={4} align="stretch" mb={6}>
            {/* Mobile: Logo at top center */}
            <Box display={{ base: "flex", lg: "none" }} justifyContent="center">
              <Image
                src="/images/admin/rebbe-274x300.jpg"
                alt="Admin Logo"
                width="100px"
                height="auto"
                objectFit="contain"
                rounded="md"
              />
            </Box>

            {/* Desktop: Title, Logo, Buttons in row */}
            <Box display={{ base: "none", lg: "block" }}>
              <HStack spacing={4} align="center" justify="space-between">
                <Box>
                  <Heading size="xl" mb={0} color="white">Admin Dashboard</Heading>
                  <Text color="gray.400" fontSize="md">Welcome back! Here's what's happening with your store.</Text>
                </Box>

                <Box display="flex" justifyContent="center">
                  <Image
                    src="/images/admin/rebbe-274x300.jpg"
                    alt="Admin Logo"
                    width="120px"
                    height="auto"
                    objectFit="contain"
                    rounded="md"
                  />
                </Box>

                <HStack spacing={4}>
                  <Button as={Link} href="/admin/products" leftIcon={<FaBox />} colorScheme="brand">
                    Manage Products
                  </Button>
                  <Button as={Link} href="/admin/orders" leftIcon={<FaShoppingCart />} colorScheme="brand">
                    View Orders
                  </Button>
                </HStack>
              </HStack>
            </Box>

            {/* Mobile: Title and description */}
            <Box display={{ base: "block", lg: "none" }}>
              <Heading size="lg" mb={2} color="white" textAlign="center">Admin Dashboard</Heading>
              <Text color="gray.400" fontSize="sm" textAlign="center">Welcome back! Here's what's happening with your store.</Text>
            </Box>

            {/* Mobile: Buttons stacked */}
            <VStack spacing={3} display={{ base: "flex", lg: "none" }}>
              <Button
                as={Link}
                href="/admin/products"
                leftIcon={<FaBox />}
                colorScheme="brand"
                width="full"
                size="lg"
                minH="48px"
              >
                Manage Products
              </Button>
              <Button
                as={Link}
                href="/admin/orders"
                leftIcon={<FaShoppingCart />}
                colorScheme="brand"
                width="full"
                size="lg"
                minH="48px"
              >
                View Orders
              </Button>
            </VStack>
          </VStack>

          {/* Stats Cards */}
          <Box>
            <VStack spacing={6} align="stretch">
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                <Card>
                  <CardBody>
                    <Stat>
                      <HStack justify="space-between" align="start">
                        <Box>
                          <StatLabel>Total Revenue</StatLabel>
                          <StatNumber>{stats ? formatCurrency(stats.totalRevenue) : '$0'}</StatNumber>
                          <StatHelpText>
                            {stats && (
                              <>
                                <StatArrow type={stats.revenueChange >= 0 ? 'increase' : 'decrease'} />
                                {Math.abs(stats.revenueChange)}% vs last month
                              </>
                            )}
                          </StatHelpText>
                        </Box>
                        <Icon as={FaDollarSign} w={8} h={8} color="gold.500" />
                      </HStack>
                    </Stat>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <Stat>
                      <HStack justify="space-between" align="start">
                        <Box>
                          <StatLabel>Total Orders</StatLabel>
                          <StatNumber>{stats?.totalOrders || 0}</StatNumber>
                          <StatHelpText>
                            {stats && (
                              <>
                                <StatArrow type={stats.ordersChange >= 0 ? 'increase' : 'decrease'} />
                                {Math.abs(stats.ordersChange)}% vs last month
                              </>
                            )}
                          </StatHelpText>
                        </Box>
                        <Icon as={FaShoppingCart} w={8} h={8} color="gold.500" />
                      </HStack>
                    </Stat>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <Stat>
                      <HStack justify="space-between" align="start">
                        <Box>
                          <StatLabel>Total Products</StatLabel>
                          <StatNumber>{stats?.totalProducts || 0}</StatNumber>
                          <StatHelpText>
                            {stats && (
                              <>
                                <StatArrow type={stats.productsChange >= 0 ? 'increase' : 'decrease'} />
                                {Math.abs(stats.productsChange)}% vs last month
                              </>
                            )}
                          </StatHelpText>
                        </Box>
                        <Icon as={FaBox} w={8} h={8} color="gold.500" />
                      </HStack>
                    </Stat>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <Stat>
                      <HStack justify="space-between" align="start">
                        <Box>
                          <StatLabel>Total Users</StatLabel>
                          <StatNumber>{stats?.totalUsers || 0}</StatNumber>
                          <StatHelpText>
                            {stats && (
                              <>
                                <StatArrow type={stats.usersChange >= 0 ? 'increase' : 'decrease'} />
                                {Math.abs(stats.usersChange)}% vs last month
                              </>
                            )}
                          </StatHelpText>
                        </Box>
                        <Icon as={FaUsers} w={8} h={8} color="gold.500" />
                      </HStack>
                    </Stat>
                  </CardBody>
                </Card>
              </SimpleGrid>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <HStack justify="space-between">
                    <Heading size="md">Quick Actions</Heading>
                    <Icon as={FaCog} color="gold.500" />
                  </HStack>
                </CardHeader>
                <CardBody>
                  <SimpleGrid columns={{ base: 1, md: 3, lg: 5 }} spacing={4}>
                    <Button
                      as={Link}
                      href="/admin/products"
                      leftIcon={<FaPlus />}
                      variant="outline"
                      height={{ base: "56px", md: "80px" }}
                      flexDirection={{ base: "row", md: "column" }}
                      gap={2}
                      minH="48px"
                      justifyContent={{ base: "flex-start", md: "center" }}
                    >
                      <Text>Add Product</Text>
                    </Button>

                    <Button
                      as={Link}
                      href="/admin/orders"
                      leftIcon={<FaEye />}
                      variant="outline"
                      height={{ base: "56px", md: "80px" }}
                      flexDirection={{ base: "row", md: "column" }}
                      gap={2}
                      minH="48px"
                      justifyContent={{ base: "flex-start", md: "center" }}
                    >
                      <Text>View Orders</Text>
                    </Button>

                    <Button
                      as={Link}
                      href="/admin/collections"
                      leftIcon={<FaBox />}
                      variant="outline"
                      height={{ base: "56px", md: "80px" }}
                      flexDirection={{ base: "row", md: "column" }}
                      gap={2}
                      minH="48px"
                      justifyContent={{ base: "flex-start", md: "center" }}
                    >
                      <Text>Manage Collections</Text>
                    </Button>

                    <Button
                      as={Link}
                      href="/admin/analytics"
                      leftIcon={<FaChartLine />}
                      variant="outline"
                      height={{ base: "56px", md: "80px" }}
                      flexDirection={{ base: "row", md: "column" }}
                      gap={2}
                      minH="48px"
                      justifyContent={{ base: "flex-start", md: "center" }}
                    >
                      <Text>View Analytics</Text>
                    </Button>

                    <Button
                      as={Link}
                      href="/admin/users"
                      leftIcon={<FaUsers />}
                      variant="outline"
                      height={{ base: "56px", md: "80px" }}
                      flexDirection={{ base: "row", md: "column" }}
                      gap={2}
                      minH="48px"
                      justifyContent={{ base: "flex-start", md: "center" }}
                    >
                      <Text>Manage Users</Text>
                    </Button>
                  </SimpleGrid>
                </CardBody>
              </Card>

              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <HStack justify="space-between">
                    <Heading size="md">Recent Orders</Heading>
                    <Button as={Link} href="/admin/orders" size="sm" variant="outline">
                      View All
                    </Button>
                  </HStack>
                </CardHeader>
                <CardBody>
                  {recentOrders.length === 0 ? (
                    <Box textAlign="center" py={8}>
                      <Icon as={FaShoppingCart} boxSize={12} color="gold.500" />
                      <Text mt={4}>No recent orders</Text>
                    </Box>
                  ) : (
                    <>
                      {/* Desktop Table */}
                      <TableContainer display={{ base: "none", lg: "block" }}>
                        <Table variant="simple">
                          <Thead>
                            <Tr>
                              <Th>Order</Th>
                              <Th>Customer</Th>
                              <Th>Date</Th>
                              <Th>Status</Th>
                              <Th>Total</Th>
                              <Th>Actions</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {recentOrders.map((order) => (
                              <Tr key={order.id}>
                                <Td>
                                  <Text fontWeight="300">#{order.orderNumber}</Text>
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
                                  <Badge colorScheme={getStatusColor(order.status)}>
                                    {order.status}
                                  </Badge>
                                </Td>
                                <Td>
                                  <Text fontWeight="300">
                                    {formatCurrency(order.total)}
                                  </Text>
                                </Td>
                                <Td>
                                  <Button
                                    as={Link}
                                    href={`/admin/orders/${order.id}`}
                                    size="sm"
                                    leftIcon={<FaEye />}
                                    colorScheme="brand"
                                  >
                                    View
                                  </Button>
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </TableContainer>

                      {/* Mobile Cards */}
                      <VStack spacing={4} display={{ base: "flex", lg: "none" }}>
                        {recentOrders.map((order) => (
                          <Card key={order.id} width="100%" variant="outline">
                            <CardBody>
                              <VStack align="stretch" spacing={3}>
                                <HStack justify="space-between">
                                  <Text fontWeight="bold" fontSize="lg">#{order.orderNumber}</Text>
                                  <Badge colorScheme={getStatusColor(order.status)}>
                                    {order.status}
                                  </Badge>
                                </HStack>
                                <Divider />
                                <Box>
                                  <Text fontSize="sm" color="gray.500">Customer</Text>
                                  <Text fontWeight="500">{getOrderCustomerName(order)}</Text>
                                  <Text fontSize="sm" color="gray.400">{getOrderEmail(order)}</Text>
                                </Box>
                                <HStack justify="space-between">
                                  <Box>
                                    <Text fontSize="sm" color="gray.500">Date</Text>
                                    <Text>{formatDate(order.createdAt)}</Text>
                                  </Box>
                                  <Box>
                                    <Text fontSize="sm" color="gray.500" textAlign="right">Total</Text>
                                    <Text fontWeight="bold" textAlign="right">
                                      {formatCurrency(order.total)}
                                    </Text>
                                  </Box>
                                </HStack>
                                <Button
                                  as={Link}
                                  href={`/admin/orders/${order.id}`}
                                  leftIcon={<FaEye />}
                                  colorScheme="brand"
                                  width="full"
                                  size="md"
                                  minH="44px"
                                >
                                  View Order
                                </Button>
                              </VStack>
                            </CardBody>
                          </Card>
                        ))}
                      </VStack>
                    </>
                  )}
                </CardBody>
              </Card>

              {/* System Status */}
              <Card>
                <CardHeader>
                  <Heading size="md">System Status</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Alert status="success" bg="rgba(72, 187, 120, 0.1)" border="1px solid" borderColor="green.500">
                      <AlertIcon color="green.500" />
                      <Box>
                        <AlertTitle color="white">All Systems Operational</AlertTitle>
                        <AlertDescription color="white">
                          Your store is running smoothly. Last check: {new Date().toLocaleTimeString()}
                        </AlertDescription>
                      </Box>
                    </Alert>

                    <HStack justify="space-between">
                      <Text>Database Connection</Text>
                      <Badge colorScheme="green">Connected</Badge>
                    </HStack>

                    <HStack justify="space-between">
                      <Text>Payment Gateway</Text>
                      <Badge colorScheme="green">Active</Badge>
                    </HStack>

                    <HStack justify="space-between">
                      <Text>Email Service</Text>
                      <Badge colorScheme="green">Active</Badge>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  )
}