'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Grid,
  GridItem,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  Image,
  Badge,
  Skeleton,
  SkeletonText,
  Icon,
} from '@chakra-ui/react'
import { FaGem } from 'react-icons/fa'
import NextLink from 'next/link'
import Header from '@/components/layout/Header'

interface Collection {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  featured: boolean
  _count: {
    products: number
  }
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCollections()
  }, [])

  const fetchCollections = async () => {
    try {
      const response = await fetch('/api/collections')
      const data = await response.json()
      setCollections(data)
    } catch (error) {
      console.error('Failed to fetch collections:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box minH="100vh" bg="transparent" position="relative">
      <Header />

      {/* Full-screen Video Background */}
      <Box
        position="fixed"
        top="0"
        left="0"
        width="100%"
        height="100%"
        zIndex={-1}
        overflow="hidden"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        >
          <source src="/images/collections /20251029_1720_New Video_storyboard_01k8rxerzkfpk9gs6wx96ph5ta.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay for better readability */}
        <Box
          position="absolute"
          top="0"
          left="0"
          width="100%"
          height="100%"
          bg="blackAlpha.600"
        />
      </Box>

      <Container maxW="7xl" pt={{ base: 24, md: 28 }} pb={12} position="relative" zIndex={1}>
        {/* Page Header */}
        <VStack spacing={4} mb={12} textAlign="center">
          <Icon as={FaGem} boxSize={10} color="gold.500" />
          <Heading size="2xl" fontWeight="light" color="gold.500">
            Our Collections
          </Heading>
          <Text fontSize="lg" color="white" maxW="3xl">
            Discover our carefully curated collections of exquisite diamond jewelry,
            each piece crafted to perfection and designed to celebrate life's special moments.
          </Text>
        </VStack>

        {/* Collections Grid */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={8}>
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 6 }).map((_, index) => (
              <GridItem key={index}>
                <Card overflow="hidden" h="full">
                  <Skeleton height="250px" />
                  <CardBody>
                    <SkeletonText noOfLines={3} spacing="4" />
                  </CardBody>
                </Card>
              </GridItem>
            ))
          ) : (
            collections.map((collection) => (
              <GridItem key={collection.id}>
                <Card
                  as={NextLink}
                  href={`/collections/${collection.slug}`}
                  overflow="hidden"
                  h="full"
                  transition="all 0.4s ease-in-out"
                  bg="#FFFFFF"
                  border="2px solid"
                  borderColor="gold.500"
                  sx={{
                    '& .card-heading': {
                      transition: 'color 0.4s ease-in-out',
                    },
                    '& .card-description': {
                      transition: 'color 0.4s ease-in-out',
                    },
                    '& .view-collection-text': {
                      transition: 'color 0.4s ease-in-out',
                    },
                  }}
                  _hover={{
                    transform: 'translateY(-4px)',
                    shadow: '0 0 30px rgba(212, 175, 55, 0.6)',
                    cursor: 'pointer',
                    bg: 'black',
                    '& .card-heading': {
                      color: 'white',
                    },
                    '& .card-description': {
                      color: 'white',
                    },
                    '& .view-collection-text': {
                      color: 'gold.500',
                    },
                  }}
                >
                  {/* Collection Image */}
                  <Box h="250px" overflow="hidden" position="relative">
                    {collection.image ? (
                      <Image
                        src={collection.image}
                        alt={collection.name}
                        w="full"
                        h="full"
                        objectFit="cover"
                      />
                    ) : (
                      <Box
                        h="full"
                        bg="gradient-to-br"
                        bgGradient="linear(to-br, brand.100, brand.200)"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Icon as={FaGem} boxSize={20} color="white" opacity={0.5} />
                      </Box>
                    )}
                    {collection.featured && (
                      <Badge
                        position="absolute"
                        top={4}
                        right={4}
                        colorScheme="yellow"
                        variant="solid"
                        px={3}
                        py={1}
                      >
                        Featured
                      </Badge>
                    )}
                  </Box>

                  {/* Collection Details */}
                  <CardBody>
                    <VStack align="stretch" spacing={3}>
                      <Heading size="lg" fontWeight="300" color="black" className="card-heading">
                        {collection.name}
                      </Heading>

                      {collection.description && (
                        <Text color="black" noOfLines={2} className="card-description">
                          {collection.description}
                        </Text>
                      )}

                      <HStack justify="space-between" pt={2}>
                        <Text color="black" fontWeight="300" className="view-collection-text">
                          View Collection →
                        </Text>
                        <Badge
                          bg="gold.500"
                          color="black"
                          fontWeight="bold"
                          px={3}
                          py={1}
                          borderRadius="md"
                          boxShadow="0 0 10px rgba(212, 175, 55, 0.5)"
                        >
                          {collection._count.products} {collection._count.products === 1 ? 'item' : 'items'}
                        </Badge>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              </GridItem>
            ))
          )}
        </Grid>

        {/* Empty state */}
        {!isLoading && collections.length === 0 && (
          <VStack spacing={6} py={20}>
            <Icon as={FaGem} boxSize={20} color="gray.300" />
            <Heading size="lg" color="gray.500">
              No Collections Available
            </Heading>
            <Text color="gray.500">
              Check back soon for our exclusive jewelry collections.
            </Text>
          </VStack>
        )}
      </Container>
    </Box>
  )
}