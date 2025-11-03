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
  Card,
  CardBody,
  CardHeader,
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Select,
  Avatar,
  Input,
  InputGroup,
  InputLeftElement,
  Switch,
  Flex,
  Spacer,
} from '@chakra-ui/react'
import {
  FaSearch,
  FaEdit,
  FaUser,
  FaShoppingCart,
  FaStar,
  FaMapMarkerAlt,
} from 'react-icons/fa'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'

interface User {
  id: string
  email: string
  name: string | null
  image: string | null
  role: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  lastLogin: string | null
  phone: string | null
  emailVerified: Date | null
  _count: {
    orders: number
    reviews: number
    addresses: number
  }
}

const USER_ROLES = ['CUSTOMER', 'ADMIN', 'MANAGER', 'SUPPORT']

const getRoleColor = (role: string) => {
  switch (role) {
    case 'ADMIN':
      return 'red'
    case 'MANAGER':
      return 'purple'
    case 'SUPPORT':
      return 'blue'
    case 'CUSTOMER':
      return 'green'
    default:
      return 'gray'
  }
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const [formData, setFormData] = useState({
    role: 'CUSTOMER',
    isActive: true,
  })

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

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      if (!session?.user || session.user.role !== 'ADMIN') return

      try {
        const response = await fetch('/api/admin/users')
        if (response.ok) {
          const data = await response.json()
          setUsers(data)
          setFilteredUsers(data)
        } else {
          throw new Error('Failed to fetch users')
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load users',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.role === 'ADMIN') {
      fetchUsers()
    }
  }, [session, toast])

  // Filter users
  useEffect(() => {
    let filtered = users

    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.phone?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (roleFilter) {
      filtered = filtered.filter((user) => user.role === roleFilter)
    }

    if (statusFilter) {
      filtered = filtered.filter((user) =>
        statusFilter === 'active' ? user.isActive : !user.isActive
      )
    }

    setFilteredUsers(filtered)
  }, [searchQuery, roleFilter, statusFilter, users])

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setFormData({
      role: user.role,
      isActive: user.isActive,
    })
    onOpen()
  }

  const handleSave = async () => {
    if (!selectedUser) return

    // Prevent admin from changing their own role
    if (session?.user?.id === selectedUser.id && formData.role !== selectedUser.role) {
      toast({
        title: 'Error',
        description: 'You cannot change your own role',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setUpdating(true)
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...updatedUser } : u))

        toast({
          title: 'Success',
          description: 'User updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        onClose()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update user')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setUpdating(false)
    }
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
            <Text color="white">Loading users...</Text>
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
            <Heading size="lg" mb={2} color="white">User Management</Heading>
            <Text color="gray.400">Manage user accounts and permissions</Text>
          </Box>

          {/* Filters */}
          <Card>
            <CardBody>
              <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
                <InputGroup maxW={{ base: '100%', md: '400px' }}>
                  <InputLeftElement pointerEvents="none">
                    <FaSearch color="gray.300" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </InputGroup>

                <Select
                  placeholder="All Roles"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  maxW={{ base: '100%', md: '200px' }}
                >
                  {USER_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </Select>

                <Select
                  placeholder="All Statuses"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  maxW={{ base: '100%', md: '200px' }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>

                <Spacer display={{ base: 'none', md: 'block' }} />

                <Badge colorScheme="blue" alignSelf="center">
                  {filteredUsers.length} users
                </Badge>
              </Flex>
            </CardBody>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <Heading size="md">Users</Heading>
            </CardHeader>
            <CardBody>
              {filteredUsers.length === 0 ? (
                <Box textAlign="center" py={8}>
                  <Text>No users found</Text>
                </Box>
              ) : (
                <TableContainer overflowX="auto" overflowY="visible">
                  <Table variant="simple" minW="800px">
                    <Thead>
                      <Tr>
                        <Th>User</Th>
                        <Th>Contact</Th>
                        <Th>Role</Th>
                        <Th>Status</Th>
                        <Th>Stats</Th>
                        <Th>Joined</Th>
                        <Th>Last Login</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredUsers.map((user) => (
                        <Tr key={user.id}>
                          <Td>
                            <HStack spacing={3}>
                              <Avatar
                                size="sm"
                                name={user.name || user.email}
                                src={user.image || undefined}
                              />
                              <VStack align="start" spacing={0}>
                                <Text fontWeight="300">{user.name || 'N/A'}</Text>
                                <Text fontSize="xs" color="gray.400">
                                  {user.id.substring(0, 8)}...
                                </Text>
                              </VStack>
                            </HStack>
                          </Td>
                          <Td>
                            <VStack align="start" spacing={0}>
                              <Text fontSize="sm">{user.email}</Text>
                              {user.phone && (
                                <Text fontSize="xs" color="gray.400">
                                  {user.phone}
                                </Text>
                              )}
                              {user.emailVerified && (
                                <Badge colorScheme="green" fontSize="xs">
                                  Verified
                                </Badge>
                              )}
                            </VStack>
                          </Td>
                          <Td>
                            <Badge colorScheme={getRoleColor(user.role)}>
                              {user.role}
                            </Badge>
                          </Td>
                          <Td>
                            <Badge colorScheme={user.isActive ? 'green' : 'red'}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </Td>
                          <Td>
                            <VStack align="start" spacing={1}>
                              <HStack spacing={1}>
                                <FaShoppingCart size={12} />
                                <Text fontSize="xs">{user._count.orders} orders</Text>
                              </HStack>
                              <HStack spacing={1}>
                                <FaStar size={12} />
                                <Text fontSize="xs">{user._count.reviews} reviews</Text>
                              </HStack>
                              <HStack spacing={1}>
                                <FaMapMarkerAlt size={12} />
                                <Text fontSize="xs">{user._count.addresses} addresses</Text>
                              </HStack>
                            </VStack>
                          </Td>
                          <Td>
                            <Text fontSize="sm">{formatDate(user.createdAt)}</Text>
                          </Td>
                          <Td>
                            <Text fontSize="sm">
                              {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                            </Text>
                          </Td>
                          <Td>
                            <Button
                              size="sm"
                              leftIcon={<FaEdit />}
                              onClick={() => handleEdit(user)}
                              colorScheme="brand"
                            >
                              Edit
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

      {/* Edit User Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit User - {selectedUser?.name || selectedUser?.email}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input value={selectedUser?.email} isReadOnly />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Role</FormLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  isDisabled={session?.user?.id === selectedUser?.id}
                >
                  {USER_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </Select>
                {session?.user?.id === selectedUser?.id && (
                  <Text fontSize="sm" color="gray.400" mt={1}>
                    You cannot change your own role
                  </Text>
                )}
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Account Status</FormLabel>
                <Switch
                  isChecked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  colorScheme="brand"
                />
                <Text ml={2}>{formData.isActive ? 'Active' : 'Inactive'}</Text>
              </FormControl>

              {selectedUser && (
                <Box w="100%" p={4} bg="rgba(255, 255, 255, 0.05)" rounded="md">
                  <VStack align="start" spacing={2}>
                    <Text fontSize="sm" fontWeight="bold">User Stats:</Text>
                    <Text fontSize="sm">Orders: {selectedUser._count.orders}</Text>
                    <Text fontSize="sm">Reviews: {selectedUser._count.reviews}</Text>
                    <Text fontSize="sm">Addresses: {selectedUser._count.addresses}</Text>
                    <Text fontSize="sm">Joined: {formatDate(selectedUser.createdAt)}</Text>
                  </VStack>
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="brand" onClick={handleSave} isLoading={updating}>
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}
