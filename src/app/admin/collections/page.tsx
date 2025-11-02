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
  Input,
  Textarea,
  Switch,
  IconButton,
  Image,
  SimpleGrid,
  Checkbox,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react'
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaImage,
} from 'react-icons/fa'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'

interface Product {
  id: string
  name: string
  slug: string
  image: string
  price: number
}

interface Collection {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  featured: boolean
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  products: Product[]
  _count?: {
    products: number
  }
}

export default function AdminCollectionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure()
  const {
    isOpen: isProductsOpen,
    onOpen: onProductsOpen,
    onClose: onProductsClose,
  } = useDisclosure()
  const cancelRef = React.useRef<HTMLButtonElement>(null)

  const [collections, setCollections] = useState<Collection[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)
  const [deleteCollection, setDeleteCollection] = useState<Collection | null>(null)
  const [managingProducts, setManagingProducts] = useState<Collection | null>(null)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    featured: false,
    isActive: true,
    sortOrder: 0,
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

  // Fetch collections
  useEffect(() => {
    const fetchCollections = async () => {
      if (!session?.user || session.user.role !== 'ADMIN') return

      try {
        const response = await fetch('/api/collections')
        if (response.ok) {
          const data = await response.json()
          setCollections(data)
        } else {
          throw new Error('Failed to fetch collections')
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load collections',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.role === 'ADMIN') {
      fetchCollections()
    }
  }, [session, toast])

  // Fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      if (!session?.user || session.user.role !== 'ADMIN') return

      try {
        const response = await fetch('/api/admin/products')
        if (response.ok) {
          const data = await response.json()
          setAllProducts(data.products || data)
        }
      } catch (error) {
        console.error('Failed to fetch products:', error)
      }
    }

    if (session?.user?.role === 'ADMIN') {
      fetchProducts()
    }
  }, [session])

  const handleCreate = () => {
    setSelectedCollection(null)
    setFormData({
      name: '',
      slug: '',
      description: '',
      image: '',
      featured: false,
      isActive: true,
      sortOrder: 0,
    })
    onOpen()
  }

  const handleEdit = (collection: Collection) => {
    setSelectedCollection(collection)
    setFormData({
      name: collection.name,
      slug: collection.slug,
      description: collection.description || '',
      image: collection.image || '',
      featured: collection.featured,
      isActive: collection.isActive,
      sortOrder: collection.sortOrder,
    })
    onOpen()
  }

  const handleDelete = (collection: Collection) => {
    setDeleteCollection(collection)
    onDeleteOpen()
  }

  const confirmDelete = async () => {
    if (!deleteCollection) return

    try {
      const response = await fetch(`/api/admin/collections/${deleteCollection.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setCollections(collections.filter(c => c.id !== deleteCollection.id))
        toast({
          title: 'Success',
          description: 'Collection deleted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        onDeleteClose()
      } else {
        throw new Error('Failed to delete collection')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete collection',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const handleSave = async () => {
    if (!formData.name || !formData.slug) {
      toast({
        title: 'Validation Error',
        description: 'Name and slug are required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setSaving(true)
    try {
      const url = selectedCollection
        ? `/api/admin/collections/${selectedCollection.id}`
        : '/api/admin/collections'

      const method = selectedCollection ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const savedCollection = await response.json()

        if (selectedCollection) {
          setCollections(collections.map(c =>
            c.id === selectedCollection.id ? savedCollection : c
          ))
        } else {
          setCollections([...collections, savedCollection])
        }

        toast({
          title: 'Success',
          description: `Collection ${selectedCollection ? 'updated' : 'created'} successfully`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        onClose()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save collection')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save collection',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleManageProducts = (collection: Collection) => {
    setManagingProducts(collection)
    setSelectedProducts(collection.products.map(p => p.id))
    onProductsOpen()
  }

  const handleSaveProducts = async () => {
    if (!managingProducts) return

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/collections/${managingProducts.id}/products`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productIds: selectedProducts }),
      })

      if (response.ok) {
        const updatedCollection = await response.json()
        setCollections(collections.map(c =>
          c.id === managingProducts.id ? updatedCollection : c
        ))

        toast({
          title: 'Success',
          description: 'Products updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        onProductsClose()
      } else {
        throw new Error('Failed to update products')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update products',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setSaving(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  if (status === 'loading' || loading) {
    return (
      <Box minH="100vh" bg="transparent">
        <Header />
        <Container maxW="7xl" pt={{ base: 24, md: 28 }} pb={8}>
          <VStack spacing={4}>
            <Spinner size="xl" color="gold.500" />
            <Text color="white">Loading collections...</Text>
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
          <HStack justify="space-between" align="center">
            <Box>
              <Heading size="lg" mb={2} color="white">Collection Management</Heading>
              <Text color="gray.400">Manage your product collections</Text>
            </Box>
            <Button
              leftIcon={<FaPlus />}
              colorScheme="brand"
              onClick={handleCreate}
            >
              Create Collection
            </Button>
          </HStack>

          {/* Collections Table */}
          <Card>
            <CardHeader>
              <Heading size="md">Collections</Heading>
            </CardHeader>
            <CardBody>
              {collections.length === 0 ? (
                <Box textAlign="center" py={8}>
                  <Text>No collections found</Text>
                  <Button mt={4} onClick={handleCreate} colorScheme="brand">
                    Create Your First Collection
                  </Button>
                </Box>
              ) : (
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Image</Th>
                        <Th>Name</Th>
                        <Th>Slug</Th>
                        <Th>Products</Th>
                        <Th>Featured</Th>
                        <Th>Status</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {collections.map((collection) => (
                        <Tr key={collection.id}>
                          <Td>
                            {collection.image ? (
                              <Image
                                src={collection.image}
                                alt={collection.name}
                                boxSize="50px"
                                objectFit="cover"
                                rounded="md"
                              />
                            ) : (
                              <Box
                                boxSize="50px"
                                bg="gray.700"
                                rounded="md"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                              >
                                <FaImage color="gray" />
                              </Box>
                            )}
                          </Td>
                          <Td>
                            <Text fontWeight="300">{collection.name}</Text>
                          </Td>
                          <Td>
                            <Text fontSize="sm" color="gray.400">{collection.slug}</Text>
                          </Td>
                          <Td>
                            <Badge colorScheme="blue">
                              {collection.products?.length || collection._count?.products || 0} products
                            </Badge>
                          </Td>
                          <Td>
                            {collection.featured && (
                              <Badge colorScheme="yellow">Featured</Badge>
                            )}
                          </Td>
                          <Td>
                            <Badge colorScheme={collection.isActive ? 'green' : 'red'}>
                              {collection.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </Td>
                          <Td>
                            <HStack spacing={2}>
                              <IconButton
                                aria-label="View collection"
                                icon={<FaEye />}
                                size="sm"
                                as={Link}
                                href={`/collections/${collection.slug}`}
                                variant="ghost"
                              />
                              <IconButton
                                aria-label="Manage products"
                                icon={<FaImage />}
                                size="sm"
                                onClick={() => handleManageProducts(collection)}
                                colorScheme="blue"
                              />
                              <IconButton
                                aria-label="Edit collection"
                                icon={<FaEdit />}
                                size="sm"
                                onClick={() => handleEdit(collection)}
                                colorScheme="brand"
                              />
                              <IconButton
                                aria-label="Delete collection"
                                icon={<FaTrash />}
                                size="sm"
                                onClick={() => handleDelete(collection)}
                                colorScheme="red"
                              />
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

      {/* Create/Edit Collection Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedCollection ? 'Edit Collection' : 'Create Collection'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value
                    setFormData({
                      ...formData,
                      name,
                      slug: !selectedCollection ? generateSlug(name) : formData.slug,
                    })
                  }}
                  placeholder="Winter Collection"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Slug</FormLabel>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="winter-collection"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Collection description..."
                  rows={4}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Image URL</FormLabel>
                <Input
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
                {formData.image && (
                  <Image
                    src={formData.image}
                    alt="Preview"
                    mt={2}
                    maxH="200px"
                    objectFit="cover"
                    rounded="md"
                  />
                )}
              </FormControl>

              <FormControl>
                <FormLabel>Sort Order</FormLabel>
                <Input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Featured</FormLabel>
                <Switch
                  isChecked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  colorScheme="brand"
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Active</FormLabel>
                <Switch
                  isChecked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  colorScheme="brand"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="brand" onClick={handleSave} isLoading={saving}>
              {selectedCollection ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Manage Products Modal */}
      <Modal isOpen={isProductsOpen} onClose={onProductsClose} size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Manage Products - {managingProducts?.name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text color="gray.400">
                Select products to include in this collection
              </Text>
              {allProducts.length === 0 ? (
                <Text>No products available</Text>
              ) : (
                <SimpleGrid columns={1} spacing={2}>
                  {allProducts.map((product) => (
                    <Checkbox
                      key={product.id}
                      isChecked={selectedProducts.includes(product.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProducts([...selectedProducts, product.id])
                        } else {
                          setSelectedProducts(selectedProducts.filter(id => id !== product.id))
                        }
                      }}
                      colorScheme="brand"
                    >
                      <HStack spacing={3}>
                        <Image
                          src={product.image}
                          alt={product.name}
                          boxSize="40px"
                          objectFit="cover"
                          rounded="md"
                        />
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="300">{product.name}</Text>
                          <Text fontSize="sm" color="gray.400">
                            ${(product.price / 100).toFixed(2)}
                          </Text>
                        </VStack>
                      </HStack>
                    </Checkbox>
                  ))}
                </SimpleGrid>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onProductsClose}>
              Cancel
            </Button>
            <Button colorScheme="brand" onClick={handleSaveProducts} isLoading={saving}>
              Save Products
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
              Delete Collection
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete the collection "{deleteCollection?.name}"?
              This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  )
}
