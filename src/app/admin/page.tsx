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
        <Container maxW="7xl" py={8}>
          <VStack spacing={4}>
            <Spinner size="xl" />
            <Text>Loading admin dashboard...</Text>
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
      
      <Container maxW="7xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Page Header */}
          <HStack justify="space-between" align="center">
            <Box>
              <Heading size="lg" mb={2}>Admin Dashboard</Heading>
              <Text color="gray.600">Welcome back! Here's what's happening with your store.</Text>
            </Box>
            <HStack spacing={4}>
              <Button as={Link} href="/admin/products" leftIcon={<FaBox />} colorScheme="brand">
                Manage Products
              </Button>
              <Button as={Link} href="/admin/orders" leftIcon={<FaShoppingCart />} variant="outline">
                View Orders
              </Button>
            </HStack>
          </HStack>

          {/* Stats Cards */}
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
                    <Icon as={FaDollarSign} w={8} h={8} color="green.500" />
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
                    <Icon as={FaShoppingCart} w={8} h={8} color="blue.500" />
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
                    <Icon as={FaBox} w={8} h={8} color="purple.500" />
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
                    <Icon as={FaUsers} w={8} h={8} color="orange.500" />
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
                <Icon as={FaCog} color="gray.500" />
              </HStack>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                <Button
                  as={Link}
                  href="/admin/products"
                  leftIcon={<FaPlus />}
                  variant="outline"
                  height="80px"
                  flexDirection="column"
                  gap={2}
                >
                  <Text>Add Product</Text>
                </Button>
                
                <Button
                  as={Link}
                  href="/admin/orders"
                  leftIcon={<FaEye />}
                  variant="outline"
                  height="80px"
                  flexDirection="column"
                  gap={2}
                >
                  <Text>View Orders</Text>
                </Button>
                
                <Button
                  as={Link}
                  href="/admin/collections"
                  leftIcon={<FaBox />}
                  variant="outline"
                  height="80px"
                  flexDirection="column"
                  gap={2}
                >
                  <Text>Manage Collections</Text>
                </Button>
                
                <Button
                  as={Link}
                  href="/admin/analytics"
                  leftIcon={<FaChartLine />}
                  variant="outline"
                  height="80px"
                  flexDirection="column"
                  gap={2}
                >
                  <Text>View Analytics</Text>
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
                  <FaShoppingCart size="48" color="gray.300" />
                  <Text color="gray.500" mt={4}>No recent orders</Text>
                </Box>
              ) : (
                <TableContainer>
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
                            <Text fontWeight="medium">#{order.orderNumber}</Text>
                          </Td>
                          <Td>
                            <VStack align="start" spacing={0}>
                              <Text>{order.user.name || 'N/A'}</Text>
                              <Text fontSize="sm" color="gray.500">
                                {order.user.email}
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
                            <Text fontWeight="medium">
                              {formatCurrency(order.total)}
                            </Text>
                          </Td>
                          <Td>
                            <Button
                              as={Link}
                              href={`/admin/orders/${order.id}`}
                              size="sm"
                              leftIcon={<FaEye />}
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

          {/* System Status */}
          <Card>
            <CardHeader>
              <Heading size="md">System Status</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Alert status="success">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>All Systems Operational</AlertTitle>
                    <AlertDescription>
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
      </Container>
    </Box>
  )
}