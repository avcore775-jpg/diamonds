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
    <Box minH="100vh" bg="transparent">
      <Header />

      {/* Black dividing bar between header and video */}
      <Box
        w="100vw"
        position="relative"
        left="50%"
        right="50%"
        ml="-50vw"
        mr="-50vw"
        h="80px"
        bg="black"
        mt="60px"
      />

      {/* Hero Section with Video Background */}
      <Box
        position="relative"
        overflow="hidden"
        minH="100vh"
        display="flex"
        alignItems="flex-end"
      >
        {/* Video Background - positioned below header */}
        <Box
          position="absolute"
          top="0"
          left="0"
          width="100%"
          height="100%"
          zIndex={0}
          bg="black"
          overflow="hidden"
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: '100%',
              height: 'calc(100% + 2cm)',
              objectFit: 'contain',
              position: 'relative',
              top: '0',
            }}
          >
            <source src="/images/videos/about.mp4" type="video/mp4" />
          </video>
        </Box>

        {/* Dark overlay for better text readability */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="blackAlpha.400"
          zIndex={1}
        />

        {/* Text Content - Bottom Left - Positioned with 1cm gap from video */}
        <Box
          position="absolute"
          bottom={{ base: '35%', md: '40%', lg: '45%' }}
          left={{ base: 6, md: 8, lg: 12 }}
          zIndex={2}
          pr="1cm"
          maxW={{ base: '90%', md: '80%', lg: '70%' }}
        >
          <VStack spacing={4} align="flex-start">
            <Heading
              fontSize={{ base: '4xl', md: '6xl', lg: '7xl' }}
              fontWeight="300"
              letterSpacing="wide"
              color="white"
              textShadow="3px 3px 12px rgba(0,0,0,0.9)"
            >
              Our Story
            </Heading>
            <Text
              fontSize={{ base: 'lg', md: 'xl', lg: '2xl' }}
              maxW="2xl"
              color="white"
              fontWeight="300"
              textShadow="2px 2px 8px rgba(0,0,0,0.9)"
            >
              Crafting Timeless Elegance
            </Text>
          </VStack>
        </Box>
      </Box>

      {/* Main Content */}
      <Container maxW="7xl" py={16}>
        <VStack spacing={16} align="stretch">
          {/* Story Section */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={12} alignItems="center">
            <VStack align="start" spacing={6}>
              <Heading size="xl" fontWeight="light" color="white">
                A Legacy of Excellence
              </Heading>
              <Text fontSize="lg" color="white" lineHeight="tall">
               Remy Sales opened our doors in Toronto in 1960 with the ambition of offering our customers the best quality wholesale jewelry at the lowest possible prices. During the half century that has gone by since then, we have become one of Toronto's largest and most trusted wholesale jewelry suppliers.
              </Text>

              <Text fontSize="lg" color="white" lineHeight="tall">
                Our selection of gold and diamond wedding bands is unmatched in the industry and sure to please the eye of even the most discerning jewelry connoisseur. However, if a custom piece is what you're shopping for we can certainly accommodate that as well. Our expert jewelers can make you anything you can imagine.
              </Text>

              <Text fontSize="lg" color="white" lineHeight="tall">

                We specialize in 10K, 14K and 18K white and yellow gold as well as platinum engagement rings but are also capable of making any jewelry piece you need. To go with your custom designed setting, Remy Sales also offers one of the largest selections of diamonds and other precious gems. This includes a huge variety of fancy coloured stones such as yellow, pink and blue diamonds of varying sizes and cuts.


                 </Text>

              <Text fontSize="lg" color="white" lineHeight="tall">

                We maintain this large selection so that when combined with our position as a jewelry wholesaler, we can fulfill the dreams of all of our customers no matter what their budget looks like. This ability has helped us through the hard times of the past and has become especially important in today's tough economy.
                 </Text>

              <Text fontSize="lg" color="white" lineHeight="tall">
We believe that just because the economy is bad, that shouldn't stop anyone from getting the ring or other jewelry piece of their dreams to celebrate their special day whether it's a wedding, anniversary or even a birthday. Come in or give us a call today to see what we can do for you to make your dream jewelry become a reality or to take advantage of our cash for gold service which always pays the highest possible amount for you old gold.

                 </Text>




              
            </VStack>
            <Box
              borderRadius="lg"
              overflow="hidden"
              boxShadow="2xl"
              height="400px"
              position="relative"
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
                  borderRadius: '8px',
                }}
              >
                <source src="/images/videos/about2.mp4" type="video/mp4" />
              </video>
            </Box>
          </SimpleGrid>

          <Divider />

          {/* Values Section */}
          <VStack spacing={8}>
            <VStack spacing={4} textAlign="center">
              <Heading size="xl" fontWeight="light" color="white">
                Our Values
              </Heading>
              <Text fontSize="lg" color="white" maxW="3xl">
                These principles guide everything we do, from sourcing our diamonds to
                serving our customers.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} width="100%">
              {values.map((value, index) => (
                <Box
                  key={index}
                  bg="transparent"
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
                      color="gold.500"
                    />
                    <Heading size="md" fontWeight="300" color="white">
                      {value.title}
                    </Heading>
                    <Text color="white" lineHeight="tall">
                      {value.description}
                    </Text>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          </VStack>

          <Divider />

          {/* Commitment Section */}
          <Box bg="rgba(0, 0, 0, 0.3)" p={12} borderRadius="lg" border="1px solid" borderColor="gold.500">
            <VStack spacing={6} textAlign="center">
              <Icon as={FaGem} boxSize={16} color="gold.500" />
              <Heading size="xl" fontWeight="light" color="white">
                Our Commitment to You
              </Heading>
              <Text fontSize="lg" color="white" maxW="3xl" lineHeight="tall">
                When you choose us, you're not just purchasing jewelry – you're investing
                in quality, authenticity, and exceptional service. We stand behind every
                piece we sell with comprehensive warranties, free lifetime cleaning and
                inspection, and a customer service team dedicated to your satisfaction.
              </Text>
              <HStack spacing={8} pt={4}>
                <VStack>
                  <Text fontSize="4xl" fontWeight="300" color="gold.500">
                    100%
                  </Text>
                  <Text color="white">Certified Diamonds</Text>
                </VStack>
                <VStack>
                  <Text fontSize="4xl" fontWeight="300" color="gold.500">
                    50K+
                  </Text>
                  <Text color="white">Happy Customers</Text>
                </VStack>
                <VStack>
                  <Text fontSize="4xl" fontWeight="300" color="gold.500">
                    25+
                  </Text>
                  <Text color="white">Years Experience</Text>
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
