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
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Textarea,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Switch,
  IconButton,
  Image,
  InputGroup,
  InputLeftElement,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Flex,
  Spacer,
} from '@chakra-ui/react'
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaEye,
  FaToggleOn,
  FaToggleOff,
  FaStar,
  FaBox,
} from 'react-icons/fa'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'

interface Product {
  id: string
  name: string
  slug: string
  description: string
  carat: number | null
  weight: number | null
  price: number
  image: string
  images: string[]
  stock: number
  isActive: boolean
  isFeatured: boolean
  sku: string | null
  tags: string[]
  category: {
    id: string
    name: string
  } | null
  collection: {
    id: string
    name: string
  } | null
  createdAt: string
}

interface Category {
  id: string
  name: string
}

interface Collection {
  id: string
  name: string
}

export default function AdminProductsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure()
  
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null)
  const cancelRef = React.useRef<HTMLButtonElement>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    carat: '',
    weight: '',
    price: '',
    image: '',
    stock: '0',
    isActive: true,
    isFeatured: false,
    sku: '',
    tags: '',
    categoryId: '',
    collectionId: '',
  })
  
  const [errors, setErrors] = useState<any>({})

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

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user || session.user.role !== 'ADMIN') return
      
      try {
        // Fetch products
        const productsResponse = await fetch('/api/products?admin=true')
        if (productsResponse.ok) {
          const productsData = await productsResponse.json()
          setProducts(productsData)
        }

        // Fetch categories
        const categoriesResponse = await fetch('/api/admin/categories')
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          setCategories(categoriesData)
        }

        // Fetch collections
        const collectionsResponse = await fetch('/api/collections')
        if (collectionsResponse.ok) {
          const collectionsData = await collectionsResponse.json()
          setCollections(collectionsData)
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load data',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.role === 'ADMIN') {
      fetchData()
    }
  }, [session, toast])

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      carat: '',
      weight: '',
      price: '',
      image: '',
      stock: '0',
      isActive: true,
      isFeatured: false,
      sku: '',
      tags: '',
      categoryId: '',
      collectionId: '',
    })
    setErrors({})
    setEditingProduct(null)
  }

  const handleAdd = () => {
    resetForm()
    onOpen()
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      carat: product.carat?.toString() || '',
      weight: product.weight?.toString() || '',
      price: (product.price / 100).toString(),
      image: product.image,
      stock: product.stock.toString(),
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      sku: product.sku || '',
      tags: product.tags.join(', '),
      categoryId: product.category?.id || '',
      collectionId: product.collection?.id || '',
    })
    setErrors({})
    onOpen()
  }

  const handleDelete = (product: Product) => {
    setDeleteProduct(product)
    onDeleteOpen()
  }

  const confirmDelete = async () => {
    if (!deleteProduct) return
    
    setDeleting(true)
    try {
      const response = await fetch(`/api/admin/products/${deleteProduct.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setProducts(products.filter(product => product.id !== deleteProduct.id))
        toast({
          title: 'Success',
          description: 'Product deleted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        onDeleteClose()
      } else {
        throw new Error('Failed to delete product')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete product',
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
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required'
    }
    if (!formData.image.trim()) newErrors.image = 'Image URL is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setSaving(false)
      return
    }

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        carat: formData.carat ? parseFloat(formData.carat) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        price: Math.round(parseFloat(formData.price) * 100), // Convert to cents
        image: formData.image,
        stock: parseInt(formData.stock),
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        sku: formData.sku || null,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        categoryId: formData.categoryId || null,
        collectionId: formData.collectionId || null,
      }

      const url = editingProduct 
        ? `/api/admin/products/${editingProduct.id}`
        : '/api/admin/products'
      
      const method = editingProduct ? 'PATCH' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })

      if (response.ok) {
        const savedProduct = await response.json()
        
        if (editingProduct) {
          setProducts(products.map(product => 
            product.id === editingProduct.id ? savedProduct : product
          ))
        } else {
          setProducts([savedProduct, ...products])
        }
        
        onClose()
        resetForm()
        toast({
          title: 'Success',
          description: `Product ${editingProduct ? 'updated' : 'created'} successfully`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save product')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save product',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (productId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (response.ok) {
        const updatedProduct = await response.json()
        setProducts(products.map(product => 
          product.id === productId ? updatedProduct : product
        ))
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update product status',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleToggleFeatured = async (productId: string, isFeatured: boolean) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isFeatured: !isFeatured }),
      })

      if (response.ok) {
        const updatedProduct = await response.json()
        setProducts(products.map(product => 
          product.id === productId ? updatedProduct : product
        ))
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update featured status',
        status: 'error',
        duration: 3000,
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

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (status === 'loading' || loading) {
    return (
      <Box minH="100vh" bg="transparent">
        <Header />
        <Container maxW="7xl" py={8}>
          <VStack spacing={4}>
            <Spinner size="xl" />
            <Text>Loading products...</Text>
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
        <VStack spacing={6} align="stretch">
          {/* Page Header */}
          <Flex align="center">
            <Box>
              <Heading size="lg" mb={2}>Product Management</Heading>
              <Text color="gray.600">Manage your store's product catalog</Text>
            </Box>
            <Spacer />
            <Button
              leftIcon={<FaPlus />}
              colorScheme="brand"
              onClick={handleAdd}
            >
              Add Product
            </Button>
          </Flex>

          {/* Search and Filters */}
          <Card>
            <CardBody>
              <HStack spacing={4}>
                <InputGroup maxW="400px">
                  <InputLeftElement pointerEvents="none">
                    <FaSearch color="gray.300" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </InputGroup>
                <Badge colorScheme="blue">{filteredProducts.length} products</Badge>
              </HStack>
            </CardBody>
          </Card>

          {/* Products Table */}
          <Card>
            <CardHeader>
              <Heading size="md">Products</Heading>
            </CardHeader>
            <CardBody>
              {filteredProducts.length === 0 ? (
                <Box textAlign="center" py={8}>
                  <FaBox size="48" color="gray.300" />
                  <Heading size="md" mt={4} color="gray.500">
                    No products found
                  </Heading>
                  <Text color="gray.400" mb={4}>
                    {searchQuery ? 'Try adjusting your search' : 'Start by adding your first product'}
                  </Text>
                  {!searchQuery && (
                    <Button colorScheme="brand" onClick={handleAdd}>
                      Add Product
                    </Button>
                  )}
                </Box>
              ) : (
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Product</Th>
                        <Th>SKU</Th>
                        <Th>Category</Th>
                        <Th>Price</Th>
                        <Th>Stock</Th>
                        <Th>Status</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredProducts.map((product) => (
                        <Tr key={product.id}>
                          <Td>
                            <HStack spacing={3}>
                              <Image
                                src={product.image}
                                alt={product.name}
                                boxSize="50px"
                                objectFit="cover"
                                rounded="md"
                              />
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="300">{product.name}</Text>
                                <HStack spacing={1}>
                                  {product.isFeatured && (
                                    <Badge colorScheme="yellow" variant="subtle">
                                      <HStack spacing={1}>
                                        <FaStar size="10" />
                                        <Text>Featured</Text>
                                      </HStack>
                                    </Badge>
                                  )}
                                </HStack>
                              </VStack>
                            </HStack>
                          </Td>
                          <Td>
                            <Text>{product.sku || 'N/A'}</Text>
                          </Td>
                          <Td>
                            <Text>{product.category?.name || 'Uncategorized'}</Text>
                          </Td>
                          <Td>
                            <Text fontWeight="300">
                              {formatCurrency(product.price)}
                            </Text>
                          </Td>
                          <Td>
                            <Badge colorScheme={product.stock > 0 ? 'green' : 'red'}>
                              {product.stock} in stock
                            </Badge>
                          </Td>
                          <Td>
                            <HStack spacing={2}>
                              <IconButton
                                aria-label="Toggle active"
                                icon={product.isActive ? <FaToggleOn /> : <FaToggleOff />}
                                size="sm"
                                colorScheme={product.isActive ? 'green' : 'gray'}
                                variant="ghost"
                                onClick={() => handleToggleActive(product.id, product.isActive)}
                              />
                              <IconButton
                                aria-label="Toggle featured"
                                icon={<FaStar />}
                                size="sm"
                                colorScheme={product.isFeatured ? 'yellow' : 'gray'}
                                variant="ghost"
                                onClick={() => handleToggleFeatured(product.id, product.isFeatured)}
                              />
                            </HStack>
                          </Td>
                          <Td>
                            <HStack spacing={2}>
                              <IconButton
                                aria-label="Edit product"
                                icon={<FaEdit />}
                                size="sm"
                                onClick={() => handleEdit(product)}
                              />
                              <IconButton
                                aria-label="Delete product"
                                icon={<FaTrash />}
                                size="sm"
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => handleDelete(product)}
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

      {/* Add/Edit Product Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired isInvalid={errors.name}>
                <FormLabel>Product Name</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Diamond Ring"
                />
                <FormErrorMessage>{errors.name}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired isInvalid={errors.description}>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Product description..."
                  rows={4}
                />
                <FormErrorMessage>{errors.description}</FormErrorMessage>
              </FormControl>

              <HStack spacing={4}>
                <FormControl>
                  <FormLabel>Carat</FormLabel>
                  <NumberInput
                    value={formData.carat}
                    onChange={(value) => setFormData({ ...formData, carat: value })}
                    precision={2}
                    step={0.1}
                  >
                    <NumberInputField placeholder="1.5" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel>Weight (g)</FormLabel>
                  <NumberInput
                    value={formData.weight}
                    onChange={(value) => setFormData({ ...formData, weight: value })}
                    precision={2}
                    step={0.1}
                  >
                    <NumberInputField placeholder="2.5" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </HStack>

              <HStack spacing={4}>
                <FormControl isRequired isInvalid={errors.price}>
                  <FormLabel>Price ($)</FormLabel>
                  <NumberInput
                    value={formData.price}
                    onChange={(value) => setFormData({ ...formData, price: value })}
                    precision={2}
                    step={0.01}
                  >
                    <NumberInputField placeholder="1299.99" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <FormErrorMessage>{errors.price}</FormErrorMessage>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Stock</FormLabel>
                  <NumberInput
                    value={formData.stock}
                    onChange={(value) => setFormData({ ...formData, stock: value })}
                    min={0}
                  >
                    <NumberInputField placeholder="10" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </HStack>

              <FormControl isRequired isInvalid={errors.image}>
                <FormLabel>Image URL</FormLabel>
                <Input
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
                <FormErrorMessage>{errors.image}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel>SKU</FormLabel>
                <Input
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="DR-001"
                />
              </FormControl>

              <HStack spacing={4}>
                <FormControl>
                  <FormLabel>Category</FormLabel>
                  <Select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    placeholder="Select category"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Collection</FormLabel>
                  <Select
                    value={formData.collectionId}
                    onChange={(e) => setFormData({ ...formData, collectionId: e.target.value })}
                    placeholder="Select collection"
                  >
                    {collections.map((collection) => (
                      <option key={collection.id} value={collection.id}>
                        {collection.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Tags (comma separated)</FormLabel>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="diamond, ring, luxury"
                />
              </FormControl>

              <HStack spacing={8}>
                <FormControl>
                  <FormLabel>Active</FormLabel>
                  <Switch
                    isChecked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Featured</FormLabel>
                  <Switch
                    isChecked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  />
                </FormControl>
              </HStack>
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
              {editingProduct ? 'Update' : 'Create'} Product
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
              Delete Product
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete "{deleteProduct?.name}"? This action cannot be undone.
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