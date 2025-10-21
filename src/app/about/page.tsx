'use client'

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Icon,
  Image,
  Divider,
} from '@chakra-ui/react'
import { FaGem, FaShieldAlt, FaAward, FaHeart, FaCertificate, FaGlobeAmericas } from 'react-icons/fa'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function AboutPage() {
  const values = [
    {
      icon: FaGem,
      title: 'Quality Excellence',
      description: 'Every diamond is carefully selected and certified to meet the highest standards of quality and brilliance.',
    },
    {
      icon: FaShieldAlt,
      title: 'Trust & Integrity',
      description: 'We build lasting relationships with our customers through transparency, honesty, and exceptional service.',
    },
    {
      icon: FaAward,
      title: 'Expert Craftsmanship',
      description: 'Our master jewelers combine traditional techniques with modern innovation to create timeless pieces.',
    },
    {
      icon: FaHeart,
      title: 'Customer Dedication',
      description: 'Your satisfaction is our priority. We go above and beyond to make your jewelry dreams come true.',
    },
    {
      icon: FaCertificate,
      title: 'Certified Authenticity',
      description: 'All our diamonds come with official certifications from leading gemological institutes.',
    },
    {
      icon: FaGlobeAmericas,
      title: 'Ethical Sourcing',
      description: 'We are committed to responsible sourcing and supporting sustainable practices in the diamond industry.',
    },
  ]

  return (
    <Box minH="100vh" bg="gray.50">
      <Header />

      {/* Hero Section */}
      <Box
        bgGradient="linear(to-r, blue.900, purple.900)"
        color="white"
        py={{ base: 16, md: 24 }}
        position="relative"
        overflow="hidden"
      >
        <Container maxW="7xl" position="relative" zIndex={1}>
          <VStack spacing={6} textAlign="center">
            <Heading
              fontSize={{ base: '4xl', md: '6xl' }}
              fontWeight="light"
              letterSpacing="wide"
            >
              Our Story
            </Heading>
            <Text fontSize={{ base: 'lg', md: 'xl' }} maxW="3xl" opacity={0.9}>
              Crafting Timeless Elegance Since Our Inception
            </Text>
          </VStack>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxW="7xl" py={16}>
        <VStack spacing={16} align="stretch">
          {/* Story Section */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={12} alignItems="center">
            <VStack align="start" spacing={6}>
              <Heading size="xl" fontWeight="light">
                A Legacy of Excellence
              </Heading>
              <Text fontSize="lg" color="gray.700" lineHeight="tall">
                Our journey began with a simple vision: to make the world's finest diamonds
                accessible to those who appreciate true beauty and craftsmanship. What started
                as a small boutique has grown into a trusted name in luxury jewelry.
              </Text>
              <Text fontSize="lg" color="gray.700" lineHeight="tall">
                Every piece in our collection tells a story of dedication, artistry, and passion.
                From engagement rings that mark life's most precious moments to statement pieces
                that celebrate individual style, we are honored to be part of your journey.
              </Text>
            </VStack>
            <Box
              borderRadius="lg"
              overflow="hidden"
              boxShadow="2xl"
              height="400px"
              position="relative"
            >
              <Image
                src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80"
                alt="Jewelry craftsmanship"
                objectFit="cover"
                width="100%"
                height="100%"
              />
            </Box>
          </SimpleGrid>

          <Divider />

          {/* Values Section */}
          <VStack spacing={8}>
            <VStack spacing={4} textAlign="center">
              <Heading size="xl" fontWeight="light">
                Our Values
              </Heading>
              <Text fontSize="lg" color="gray.600" maxW="3xl">
                These principles guide everything we do, from sourcing our diamonds to
                serving our customers.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} width="100%">
              {values.map((value, index) => (
                <Box
                  key={index}
                  bg="white"
                  p={8}
                  borderRadius="lg"
                  boxShadow="md"
                  transition="all 0.3s"
                  _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl' }}
                >
                  <VStack spacing={4} align="start">
                    <Icon
                      as={value.icon}
                      boxSize={12}
                      color="blue.600"
                    />
                    <Heading size="md" fontWeight="semibold">
                      {value.title}
                    </Heading>
                    <Text color="gray.600" lineHeight="tall">
                      {value.description}
                    </Text>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          </VStack>

          <Divider />

          {/* Commitment Section */}
          <Box bg="blue.50" p={12} borderRadius="lg">
            <VStack spacing={6} textAlign="center">
              <Icon as={FaGem} boxSize={16} color="blue.600" />
              <Heading size="xl" fontWeight="light">
                Our Commitment to You
              </Heading>
              <Text fontSize="lg" color="gray.700" maxW="3xl" lineHeight="tall">
                When you choose us, you're not just purchasing jewelry – you're investing
                in quality, authenticity, and exceptional service. We stand behind every
                piece we sell with comprehensive warranties, free lifetime cleaning and
                inspection, and a customer service team dedicated to your satisfaction.
              </Text>
              <HStack spacing={8} pt={4}>
                <VStack>
                  <Text fontSize="4xl" fontWeight="bold" color="blue.600">
                    100%
                  </Text>
                  <Text color="gray.600">Certified Diamonds</Text>
                </VStack>
                <VStack>
                  <Text fontSize="4xl" fontWeight="bold" color="blue.600">
                    50K+
                  </Text>
                  <Text color="gray.600">Happy Customers</Text>
                </VStack>
                <VStack>
                  <Text fontSize="4xl" fontWeight="bold" color="blue.600">
                    25+
                  </Text>
                  <Text color="gray.600">Years Experience</Text>
                </VStack>
              </HStack>
            </VStack>
          </Box>
        </VStack>
      </Container>

      <Footer />
    </Box>
  )
}