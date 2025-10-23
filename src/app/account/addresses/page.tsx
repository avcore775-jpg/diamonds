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
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Select,
  useToast,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  IconButton,
  Divider,
  SimpleGrid,
  Alert,
  AlertIcon,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react'
import { FaPlus, FaEdit, FaTrash, FaHome, FaBuilding, FaStar } from 'react-icons/fa'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'

interface Address {
  id: string
  type: 'SHIPPING' | 'BILLING'
  isDefault: boolean
  name: string
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  phone: string | null
}

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming'
]

export default function AddressesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure()
  
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [deleteAddress, setDeleteAddress] = useState<Address | null>(null)
  const cancelRef = React.useRef<HTMLButtonElement>(null)
  
  const [formData, setFormData] = useState({
    type: 'SHIPPING' as 'SHIPPING' | 'BILLING',
    name: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    phone: '',
  })
  
  const [errors, setErrors] = useState<any>({})

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/account')
    }
  }, [status, router])

  // Fetch addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!session?.user?.id) return
      
      try {
        const response = await fetch('/api/users/me/addresses')
        if (response.ok) {
          const data = await response.json()
          setAddresses(data)
        } else {
          throw new Error('Failed to fetch addresses')
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load addresses',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchAddresses()
    }
  }, [session, toast])

  const resetForm = () => {
    setFormData({
      type: 'SHIPPING',
      name: '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'United States',
      phone: '',
    })
    setErrors({})
    setEditingAddress(null)
  }

  const handleAdd = () => {
    resetForm()
    onOpen()
  }

  const handleEdit = (address: Address) => {
    setEditingAddress(address)
    setFormData({
      type: address.type,
      name: address.name,
      street: address.street,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone || '',
    })
    setErrors({})
    onOpen()
  }

  const handleDelete = (address: Address) => {
    setDeleteAddress(address)
    onDeleteOpen()
  }

  const confirmDelete = async () => {
    if (!deleteAddress) return
    
    setDeleting(true)
    try {
      const response = await fetch(`/api/users/me/addresses/${deleteAddress.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setAddresses(addresses.filter(addr => addr.id !== deleteAddress.id))
        toast({
          title: 'Success',
          description: 'Address deleted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        onDeleteClose()
      } else {
        throw new Error('Failed to delete address')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete address',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setErrors({})

    // Validation
    const newErrors: any = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.street.trim()) newErrors.street = 'Street address is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.state.trim()) newErrors.state = 'State is required'
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setSaving(false)
      return
    }

    try {
      const url = editingAddress 
        ? `/api/users/me/addresses/${editingAddress.id}`
        : '/api/users/me/addresses'
      
      const method = editingAddress ? 'PATCH' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const savedAddress = await response.json()
        
        if (editingAddress) {
          setAddresses(addresses.map(addr => 
            addr.id === editingAddress.id ? savedAddress : addr
          ))
        } else {
          setAddresses([...addresses, savedAddress])
        }
        
        onClose()
        resetForm()
        toast({
          title: 'Success',
          description: `Address ${editingAddress ? 'updated' : 'added'} successfully`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save address')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save address',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSetDefault = async (addressId: string) => {
    try {
      const response = await fetch(`/api/users/me/addresses/${addressId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isDefault: true }),
      })

      if (response.ok) {
        const updatedAddress = await response.json()
        setAddresses(addresses.map(addr => ({
          ...addr,
          isDefault: addr.id === addressId
        })))
        toast({
          title: 'Success',
          description: 'Default address updated',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      } else {
        throw new Error('Failed to update default address')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update default address',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  if (status === 'loading' || loading) {
    return (
      <Box minH="100vh" bg="transparent">
        <Header />
        <Container maxW="6xl" py={8}>
          <VStack spacing={4}>
            <Spinner size="xl" />
            <Text>Loading addresses...</Text>
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
      
      <Container maxW="6xl" py={8}>
        <VStack spacing={6} align="stretch">
          {/* Page Header */}
          <HStack justify="space-between">
            <Box>
              <Heading size="lg" mb={2}>My Addresses</Heading>
              <Text color="gray.600">Manage your shipping and billing addresses</Text>
            </Box>
            <Button
              leftIcon={<FaPlus />}
              colorScheme="brand"
              onClick={handleAdd}
            >
              Add Address
            </Button>
          </HStack>

          {/* Addresses Grid */}
          {addresses.length === 0 ? (
            <Card>
              <CardBody>
                <Box textAlign="center" py={8}>
                  <FaHome size="48" color="gray.300" />
                  <Heading size="md" mt={4} color="gray.500">
                    No addresses yet
                  </Heading>
                  <Text color="gray.400" mb={4}>
                    Add an address to make checkout easier
                  </Text>
                  <Button colorScheme="brand" onClick={handleAdd}>
                    Add Your First Address
                  </Button>
                </Box>
              </CardBody>
            </Card>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {addresses.map((address) => (
                <Card key={address.id} position="relative">
                  <CardHeader>
                    <HStack justify="space-between" align="start">
                      <VStack align="start" spacing={1}>
                        <HStack>
                          {address.type === 'SHIPPING' ? <FaHome /> : <FaBuilding />}
                          <Text fontWeight="300">
                            {address.type === 'SHIPPING' ? 'Shipping' : 'Billing'}
                          </Text>
                          {address.isDefault && (
                            <Badge colorScheme="yellow" variant="subtle">
                              <HStack spacing={1}>
                                <FaStar size="10" />
                                <Text>Default</Text>
                              </HStack>
                            </Badge>
                          )}
                        </HStack>
                        <Text fontSize="sm" color="gray.500" fontWeight="300">
                          {address.name}
                        </Text>
                      </VStack>
                      <HStack>
                        <IconButton
                          aria-label="Edit address"
                          icon={<FaEdit />}
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(address)}
                        />
                        <IconButton
                          aria-label="Delete address"
                          icon={<FaTrash />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => handleDelete(address)}
                        />
                      </HStack>
                    </HStack>
                  </CardHeader>
                  <CardBody pt={0}>
                    <VStack align="start" spacing={1}>
                      <Text>{address.street}</Text>
                      <Text>
                        {address.city}, {address.state} {address.postalCode}
                      </Text>
                      <Text>{address.country}</Text>
                      {address.phone && (
                        <Text color="gray.600">{address.phone}</Text>
                      )}
                    </VStack>
                    
                    {!address.isDefault && (
                      <Button
                        size="sm"
                        variant="outline"
                        colorScheme="brand"
                        mt={4}
                        width="full"
                        onClick={() => handleSetDefault(address.id)}
                      >
                        Set as Default
                      </Button>
                    )}
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </VStack>
      </Container>

      {/* Add/Edit Address Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingAddress ? 'Edit Address' : 'Add New Address'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Address Type</FormLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'SHIPPING' | 'BILLING' })}
                >
                  <option value="SHIPPING">Shipping Address</option>
                  <option value="BILLING">Billing Address</option>
                </Select>
              </FormControl>

              <FormControl isRequired isInvalid={errors.name}>
                <FormLabel>Full Name</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                />
                <FormErrorMessage>{errors.name}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired isInvalid={errors.street}>
                <FormLabel>Street Address</FormLabel>
                <Input
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  placeholder="123 Main Street"
                />
                <FormErrorMessage>{errors.street}</FormErrorMessage>
              </FormControl>

              <HStack spacing={4}>
                <FormControl isRequired isInvalid={errors.city}>
                  <FormLabel>City</FormLabel>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="New York"
                  />
                  <FormErrorMessage>{errors.city}</FormErrorMessage>
                </FormControl>

                <FormControl isRequired isInvalid={errors.state}>
                  <FormLabel>State</FormLabel>
                  <Select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="Select state"
                  >
                    {US_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </Select>
                  <FormErrorMessage>{errors.state}</FormErrorMessage>
                </FormControl>
              </HStack>

              <HStack spacing={4}>
                <FormControl isRequired isInvalid={errors.postalCode}>
                  <FormLabel>Postal Code</FormLabel>
                  <Input
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    placeholder="10001"
                  />
                  <FormErrorMessage>{errors.postalCode}</FormErrorMessage>
                </FormControl>

                <FormControl>
                  <FormLabel>Country</FormLabel>
                  <Select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  >
                    <option value="United States">United States</option>
                  </Select>
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Phone Number</FormLabel>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                  type="tel"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="brand"
              isLoading={saving}
              onClick={handleSave}
            >
              {editingAddress ? 'Update' : 'Add'} Address
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="300">
              Delete Address
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this address? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={confirmDelete}
                ml={3}
                isLoading={deleting}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  )
}