'use client'

import React from 'react'
import {
  Box,
  Container,
  Grid,
  GridItem,
  Image,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Badge,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  SimpleGrid,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Skeleton,
  Icon,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { ChevronRightIcon } from '@chakra-ui/icons'
import { FaShoppingCart, FaHeart, FaTruck, FaShieldAlt, FaGem } from 'react-icons/fa'
import NextLink from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import ProductGrid from '@/components/ProductGrid'
import { apiClient, Product } from '@/lib/api/client'
import { useSession } from 'next-auth/react'
import useSWR, { mutate } from 'swr'
import { ScrollAnimation } from '@/components/ScrollAnimation'
import { buttonPress, cartBounce, getAnimationVariants } from '@/lib/animations'

// Wrap Chakra components with motion
const MotionButton = motion(Button)
const MotionBox = motion(Box)
const MotionGrid = motion(Grid)

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const toast = useToast()
  const { data: session } = useSession()
  
  const [quantity, setQuantity] = React.useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0)
  const [isAddingToCart, setIsAddingToCart] = React.useState(false)
  const [isAddingToWishlist, setIsAddingToWishlist] = React.useState(false)
  const [cartIconKey, setCartIconKey] = React.useState(0)

  // Fetch product details
  const { data: product, isLoading } = useSWR(
    params.id ? `/api/products/${params.id}` : null,
    () => apiClient.getProduct(params.id as string)
  )

  // Fetch related products
  const { data: relatedProducts } = useSWR(
    product ? `/api/products/related/${product.id}` : null,
    async () => {
      const allProducts = await apiClient.getProducts()
      return allProducts
        .filter((p: Product) => 
          p.category?.id === product.category?.id && p.id !== product.id
        )
        .slice(0, 4)
    }
  )

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
  }

  const handleAddToCart = async () => {
    if (!session) {
      router.push('/signin')
      return
    }

    setIsAddingToCart(true)
    try {
      await apiClient.addToCart(product.id, quantity)
      mutate('/api/cart')
      // Trigger cart icon bounce animation
      setCartIconKey(prev => prev + 1)
      toast({
        title: 'Added to cart',
        description: `${quantity} item${quantity > 1 ? 's' : ''} added to your cart`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Failed to add to cart',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleAddToWishlist = async () => {
    if (!session) {
      router.push('/signin')
      return
    }

    setIsAddingToWishlist(true)
    try {
      await apiClient.addToWishlist(product.id)
      toast({
        title: 'Added to wishlist',
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Failed to add to wishlist',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsAddingToWishlist(false)
    }
  }

  if (isLoading) {
    return (
      <Box minH="100vh" bg="transparent">
        <Header />
        <Container maxW="7xl" pt={{ base: 24, md: 28 }} pb={8}>
          <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={8}>
            <Skeleton height="500px" />
            <VStack spacing={4} align="stretch">
              <Skeleton height="40px" />
              <Skeleton height="20px" />
              <Skeleton height="60px" />
              <Skeleton height="200px" />
            </VStack>
          </Grid>
        </Container>
      </Box>
    )
  }

  if (!product) {
    return (
      <Box minH="100vh" bg="transparent">
        <Header />
        <Container maxW="7xl" pt={{ base: 24, md: 28 }} pb={8}>
          <VStack spacing={4} py={20}>
            <Heading>Product not found</Heading>
            <Button as={NextLink} href="/catalog" colorScheme="brand">
              Return to Catalog
            </Button>
          </VStack>
        </Container>
      </Box>
    )
  }

  const discountPercentage = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0

  const images = product.images?.length > 0 ? product.images : [product.image || '/placeholder.jpg']

  return (
    <Box minH="100vh" bg="transparent">
      <Header />

      {/* Breadcrumb */}
      <Box bg="transparent" py={4} borderBottom="1px" borderColor="gray.200">
        <Container maxW="7xl">
          <Breadcrumb spacing='8px' separator={<ChevronRightIcon color='gray.500' />}>
            <BreadcrumbItem>
              <BreadcrumbLink as={NextLink} href='/'>
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink as={NextLink} href='/catalog'>
                Catalog
              </BreadcrumbLink>
            </BreadcrumbItem>
            {product.category && (
              <BreadcrumbItem>
                <BreadcrumbLink as={NextLink} href={`/catalog?category=${product.category.slug}`}>
                  {product.category.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
            )}
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>{product.name}</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </Container>
      </Box>

      <Container maxW="7xl" pt={{ base: 24, md: 28 }} pb={8}>
        <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={12}>
          {/* Product Images */}
          <GridItem>
            <VStack spacing={4}>
              <Box position="relative">
                <Image
                  src={images[selectedImageIndex]}
                  alt={product.name}
                  w="100%"
                  h="500px"
                  objectFit="cover"
                  borderRadius="lg"
                />
                {discountPercentage > 0 && (
                  <Badge
                    position="absolute"
                    top={4}
                    left={4}
                    colorScheme="red"
                    fontSize="md"
                    px={3}
                    py={1}
                  >
                    {discountPercentage}% OFF
                  </Badge>
                )}
              </Box>
              {images.length > 1 && (
                <HStack spacing={2} overflowX="auto" w="100%">
                  {images.map((image, index) => (
                    <Image
                      key={index}
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      boxSize="80px"
                      objectFit="cover"
                      borderRadius="md"
                      cursor="pointer"
                      border={selectedImageIndex === index ? '2px solid' : '1px solid'}
                      borderColor={selectedImageIndex === index ? 'brand.500' : 'gray.200'}
                      onClick={() => setSelectedImageIndex(index)}
                    />
                  ))}
                </HStack>
              )}
            </VStack>
          </GridItem>

          {/* Product Info */}
          <GridItem>
            <VStack spacing={6} align="stretch">
              <Box>
                {product.category && (
                  <Badge colorScheme="brand" mb={2}>
                    {product.category.name}
                  </Badge>
                )}
                <Heading size="xl">{product.name}</Heading>
                {product.sku && (
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    SKU: {product.sku}
                  </Text>
                )}
              </Box>

              <HStack spacing={4}>
                <Text fontSize="3xl" fontWeight="300" color="brand.600">
                  {formatPrice(product.price)}
                </Text>
                {product.comparePrice && (
                  <Text fontSize="lg" color="gray.400" textDecoration="line-through">
                    {formatPrice(product.comparePrice)}
                  </Text>
                )}
              </HStack>

              <Text color="#FFFFFF" fontSize="md" lineHeight="1.8" sx={{ color: '#FFFFFF !important' }}>{product.description}</Text>

              {/* Product Details */}
              <VStack spacing={2} align="stretch">
                {product.carat && (
                  <HStack>
                    <Icon as={FaGem} color="gold.500" />
                    <Text fontWeight="300" color="#FFFFFF" sx={{ color: '#FFFFFF !important' }}>Carat Weight:</Text>
                    <Text color="#FFFFFF" sx={{ color: '#FFFFFF !important' }}>{product.carat} ct</Text>
                  </HStack>
                )}
                {product.weight && (
                  <HStack>
                    <Text fontWeight="300" color="#FFFFFF" sx={{ color: '#FFFFFF !important' }}>Total Weight:</Text>
                    <Text color="#FFFFFF" sx={{ color: '#FFFFFF !important' }}>{product.weight}g</Text>
                  </HStack>
                )}
                <HStack>
                  <Text fontWeight="300" color="#FFFFFF" sx={{ color: '#FFFFFF !important' }}>Availability:</Text>
                  {product.stock > 0 ? (
                    <Badge colorScheme="yellow">In Stock ({product.stock} available)</Badge>
                  ) : (
                    <Badge colorScheme="red">Out of Stock</Badge>
                  )}
                </HStack>
              </VStack>

              <Divider />

              {/* Add to Cart Section */}
              <VStack spacing={4} align="stretch">
                <HStack>
                  <Text fontWeight="300">Quantity:</Text>
                  <NumberInput
                    value={quantity}
                    min={1}
                    max={product.stock}
                    onChange={(_, value) => setQuantity(value)}
                    maxW={24}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </HStack>

                <HStack spacing={4}>
                  <MotionButton
                    leftIcon={
                      <MotionBox
                        key={cartIconKey}
                        variants={getAnimationVariants(cartBounce)}
                        initial="idle"
                        animate={cartIconKey > 0 ? "bounce" : "idle"}
                      >
                        <FaShoppingCart />
                      </MotionBox>
                    }
                    colorScheme="brand"
                    size="lg"
                    flex={1}
                    onClick={handleAddToCart}
                    isLoading={isAddingToCart}
                    isDisabled={product.stock === 0}
                    variants={getAnimationVariants(buttonPress)}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </MotionButton>
                  <MotionButton
                    leftIcon={<FaHeart />}
                    colorScheme="brand"
                    size="lg"
                    flex={1}
                    onClick={handleAddToWishlist}
                    isLoading={isAddingToWishlist}
                    variants={getAnimationVariants(buttonPress)}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    Add to Wishlist
                  </MotionButton>
                </HStack>
              </VStack>

              {/* Shipping Info */}
              <VStack spacing={3} align="stretch" p={4} bg="transparent" borderRadius="md">
                <HStack>
                  <Icon as={FaTruck} color="gold.500" />
                  <Text fontSize="sm" color="#FFFFFF" sx={{ color: '#FFFFFF !important' }}>Free shipping on orders over $1,000</Text>
                </HStack>
                <HStack>
                  <Icon as={FaShieldAlt} color="gold.500" />
                  <Text fontSize="sm" color="#FFFFFF" sx={{ color: '#FFFFFF !important' }}>Secure payment with SSL encryption</Text>
                </HStack>
              </VStack>
            </VStack>
          </GridItem>
        </Grid>

        {/* Product Tabs */}
        <Box mt={12}>
          <Tabs colorScheme="yellow">
            <TabList borderColor="gold.500">
              <Tab color="white" _selected={{ color: "gold.500", borderColor: "gold.500" }}>Description</Tab>
              <Tab color="white" _selected={{ color: "gold.500", borderColor: "gold.500" }}>Details</Tab>
              <Tab color="white" _selected={{ color: "gold.500", borderColor: "gold.500" }}>Shipping & Returns</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Text color="#FFFFFF !important" fontSize="md" lineHeight="1.8" opacity={1} sx={{ color: '#FFFFFF !important' }}>{product.description}</Text>
              </TabPanel>
              <TabPanel>
                <VStack spacing={3} align="stretch">
                  {product.sku && (
                    <HStack>
                      <Text fontWeight="300" color="#FFFFFF" sx={{ color: '#FFFFFF !important' }}>SKU:</Text>
                      <Text color="#FFFFFF" sx={{ color: '#FFFFFF !important' }}>{product.sku}</Text>
                    </HStack>
                  )}
                  {product.carat && (
                    <HStack>
                      <Text fontWeight="300" color="#FFFFFF" sx={{ color: '#FFFFFF !important' }}>Carat Weight:</Text>
                      <Text color="#FFFFFF" sx={{ color: '#FFFFFF !important' }}>{product.carat} ct</Text>
                    </HStack>
                  )}
                  {product.weight && (
                    <HStack>
                      <Text fontWeight="300" color="#FFFFFF" sx={{ color: '#FFFFFF !important' }}>Total Weight:</Text>
                      <Text color="#FFFFFF" sx={{ color: '#FFFFFF !important' }}>{product.weight}g</Text>
                    </HStack>
                  )}
                  {product.category && (
                    <HStack>
                      <Text fontWeight="300" color="#FFFFFF" sx={{ color: '#FFFFFF !important' }}>Category:</Text>
                      <Text color="#FFFFFF" sx={{ color: '#FFFFFF !important' }}>{product.category.name}</Text>
                    </HStack>
                  )}
                </VStack>
              </TabPanel>
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <Text fontWeight="300" color="gold.500" fontSize="lg">Shipping</Text>
                  <Text color="#FFFFFF" lineHeight="1.8" sx={{ color: '#FFFFFF !important' }}>
                    We offer free standard shipping on all orders over $1,000.
                    Standard shipping typically takes 3-5 business days.
                    Express shipping is available for an additional fee.
                  </Text>
                  <Text fontWeight="300" color="gold.500" fontSize="lg">Returns</Text>
                  <Text color="#FFFFFF" lineHeight="1.8" sx={{ color: '#FFFFFF !important' }}>
                    We accept returns within 30 days of purchase.
                    Items must be in original condition with all tags attached.
                    Custom or personalized items are final sale.
                  </Text>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <ScrollAnimation animation="slide-up">
            <Box mt={16}>
              <Heading size="lg" mb={8}>You May Also Like</Heading>
              <ProductGrid
                products={relatedProducts}
                columns={{ base: 1, sm: 2, md: 4 }}
              />
            </Box>
          </ScrollAnimation>
        )}
      </Container>
    </Box>
  )
}