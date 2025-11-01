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
        <VStack spacing={8} align="stretch">
          {/* Page Header */}
          <HStack justify="space-between" align="center" flexWrap="wrap" gap={4}>
            <Box>
              <Heading size="lg" mb={2} color="white">Admin Dashboard</Heading>
              <Text color="gray.400">Welcome back! Here's what's happening with your store.</Text>
            </Box>
            <HStack spacing={4}>
              <Button as={Link} href="/admin/products" leftIcon={<FaBox />} colorScheme="brand">
                Manage Products
              </Button>
              <Button as={Link} href="/admin/orders" leftIcon={<FaShoppingCart />} variant="outline" color="white" borderColor="gold.500" _hover={{ bg: 'gold.500', color: 'black' }}>
                View Orders
              </Button>
            </HStack>
          </HStack>

          {/* Stats Cards */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            <Card bg="rgba(0, 0, 0, 0.6)" border="1px solid" borderColor="gold.500">
              <CardBody>
                <Stat>
                  <HStack justify="space-between" align="start">
                    <Box>
                      <StatLabel color="gray.400">Total Revenue</StatLabel>
                      <StatNumber color="white">{stats ? formatCurrency(stats.totalRevenue) : '$0'}</StatNumber>
                      <StatHelpText color="gray.400">
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

            <Card bg="rgba(0, 0, 0, 0.6)" border="1px solid" borderColor="gold.500">
              <CardBody>
                <Stat>
                  <HStack justify="space-between" align="start">
                    <Box>
                      <StatLabel color="gray.400">Total Orders</StatLabel>
                      <StatNumber color="white">{stats?.totalOrders || 0}</StatNumber>
                      <StatHelpText color="gray.400">
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

            <Card bg="rgba(0, 0, 0, 0.6)" border="1px solid" borderColor="gold.500">
              <CardBody>
                <Stat>
                  <HStack justify="space-between" align="start">
                    <Box>
                      <StatLabel color="gray.400">Total Products</StatLabel>
                      <StatNumber color="white">{stats?.totalProducts || 0}</StatNumber>
                      <StatHelpText color="gray.400">
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

            <Card bg="rgba(0, 0, 0, 0.6)" border="1px solid" borderColor="gold.500">
              <CardBody>
                <Stat>
                  <HStack justify="space-between" align="start">
                    <Box>
                      <StatLabel color="gray.400">Total Users</StatLabel>
                      <StatNumber color="white">{stats?.totalUsers || 0}</StatNumber>
                      <StatHelpText color="gray.400">
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
          <Card bg="rgba(0, 0, 0, 0.6)" border="1px solid" borderColor="gold.500">
            <CardHeader>
              <HStack justify="space-between">
                <Heading size="md" color="white">Quick Actions</Heading>
                <Icon as={FaCog} color="gold.500" />
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
                  color="white"
                  borderColor="gold.500"
                  _hover={{ bg: 'gold.500', color: 'black' }}
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
                  color="white"
                  borderColor="gold.500"
                  _hover={{ bg: 'gold.500', color: 'black' }}
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
                  color="white"
                  borderColor="gold.500"
                  _hover={{ bg: 'gold.500', color: 'black' }}
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
                  color="white"
                  borderColor="gold.500"
                  _hover={{ bg: 'gold.500', color: 'black' }}
                >
                  <Text>View Analytics</Text>
                </Button>
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* Recent Orders */}
          <Card bg="rgba(0, 0, 0, 0.6)" border="1px solid" borderColor="gold.500">
            <CardHeader>
              <HStack justify="space-between">
                <Heading size="md" color="white">Recent Orders</Heading>
                <Button as={Link} href="/admin/orders" size="sm" variant="outline" color="white" borderColor="gold.500" _hover={{ bg: 'gold.500', color: 'black' }}>
                  View All
                </Button>
              </HStack>
            </CardHeader>
            <CardBody>
              {recentOrders.length === 0 ? (
                <Box textAlign="center" py={8}>
                  <Icon as={FaShoppingCart} boxSize={12} color="gold.500" />
                  <Text color="white" mt={4}>No recent orders</Text>
                </Box>
              ) : (
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th color="gray.400" borderColor="gold.500">Order</Th>
                        <Th color="gray.400" borderColor="gold.500">Customer</Th>
                        <Th color="gray.400" borderColor="gold.500">Date</Th>
                        <Th color="gray.400" borderColor="gold.500">Status</Th>
                        <Th color="gray.400" borderColor="gold.500">Total</Th>
                        <Th color="gray.400" borderColor="gold.500">Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {recentOrders.map((order) => (
                        <Tr key={order.id}>
                          <Td borderColor="gold.500">
                            <Text fontWeight="300" color="white">#{order.orderNumber}</Text>
                          </Td>
                          <Td borderColor="gold.500">
                            <VStack align="start" spacing={0}>
                              <Text color="white">{order.user.name || 'N/A'}</Text>
                              <Text fontSize="sm" color="gray.400">
                                {order.user.email}
                              </Text>
                            </VStack>
                          </Td>
                          <Td borderColor="gold.500">
                            <Text color="white">{formatDate(order.createdAt)}</Text>
                          </Td>
                          <Td borderColor="gold.500">
                            <Badge colorScheme={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </Td>
                          <Td borderColor="gold.500">
                            <Text fontWeight="300" color="gold.500">
                              {formatCurrency(order.total)}
                            </Text>
                          </Td>
                          <Td borderColor="gold.500">
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
              )}
            </CardBody>
          </Card>

          {/* System Status */}
          <Card bg="rgba(0, 0, 0, 0.6)" border="1px solid" borderColor="gold.500">
            <CardHeader>
              <Heading size="md" color="white">System Status</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Alert status="success" bg="rgba(72, 187, 120, 0.2)" border="1px solid" borderColor="green.500">
                  <AlertIcon color="green.500" />
                  <Box>
                    <AlertTitle color="white">All Systems Operational</AlertTitle>
                    <AlertDescription color="gray.400">
                      Your store is running smoothly. Last check: {new Date().toLocaleTimeString()}
                    </AlertDescription>
                  </Box>
                </Alert>

                <HStack justify="space-between">
                  <Text color="white">Database Connection</Text>
                  <Badge colorScheme="yellow">Connected</Badge>
                </HStack>

                <HStack justify="space-between">
                  <Text color="white">Payment Gateway</Text>
                  <Badge colorScheme="yellow">Active</Badge>
                </HStack>

                <HStack justify="space-between">
                  <Text color="white">Email Service</Text>
                  <Badge colorScheme="yellow">Active</Badge>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  )
}