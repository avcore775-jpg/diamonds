'use client'

import React from 'react'
import NextLink from 'next/link'
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  SimpleGrid,
  VStack,
  HStack,
  Icon,
  Flex,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { FaGem, FaTruck, FaShieldAlt, FaCertificate } from 'react-icons/fa'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ProductCarousel from '@/components/ProductCarousel'
import CategoryTiles from '@/components/CategoryTiles'
import { ScrollAnimation } from '@/components/ScrollAnimation'
import TypewriterText from '@/components/TypewriterText'
import { apiClient } from '@/lib/api/client'
import useSWR from 'swr'
import { heroTitle, heroSubtitle, buttonPress, getAnimationVariants } from '@/lib/animations'

// Wrap Chakra components with motion
const MotionButton = motion.create(Button)
const MotionHeading = motion.create(Heading)
const MotionText = motion.create(Text)
const MotionHStack = motion.create(HStack)

export default function HomePage() {
  // Fetch all products and split them into sections
  const { data: allProducts, isLoading } = useSWR(
    '/api/products',
    async () => {
      const products = await apiClient.getProducts({ limit: 20 })
      return products
    }
  )

  // Split products into three sections (random distribution for now)
  const featuredProducts = allProducts?.slice(0, 6) || []
  const bestsellers = allProducts?.slice(6, 12) || []
  const newArrivals = allProducts?.slice(12, 18) || []

  return (
    <Box minH="100vh" bg="transparent">
      <Header />

      {/* Hero Section */}
      <Box
        bgImage="url('/images/pexels-lalesh-168927.jpg')"
        bgPosition="center"
        bgRepeat="no-repeat"
        bgSize="cover"
        color="white"
        minH="100vh"
        display="flex"
        alignItems="center"
        position="relative"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgImage: "url('/images/pexels-lalesh-168927.jpg')",
          bgPosition: "center",
          bgRepeat: "no-repeat",
          bgSize: "cover",
          filter: "blur(3px)",
          zIndex: 0,
        }}
      >
        {/* Dark overlay for better text readability */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="blackAlpha.600"
          zIndex={0}
        />

        {/* Bottom gradient transition - creates smooth fade from dark to transparent */}
        <Box
          position="absolute"
          left="0"
          right="0"
          bottom="0"
          h="100px"
          bgGradient="linear(to-b, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.6))"
          zIndex={1}
          pointerEvents="none"
        />

        <Container maxW="7xl" position="relative" zIndex={2}>
          <VStack spacing={8} textAlign="center">
            <MotionHeading
              as="h1"
              fontSize={{ base: '2xl', sm: '3xl', md: '4xl', lg: '5xl' }}
              fontWeight="400"
              textShadow="2px 2px 4px rgba(0,0,0,0.5)"
              color="white"
              variants={getAnimationVariants(heroTitle)}
              initial="hidden"
              animate="visible"
            >
              Jewellery That Speaks
            </MotionHeading>
            <MotionText
              as="h2"
              fontSize={{ base: 'xl', md: '2xl' }}
              fontWeight="300"
              maxW="600px"
              textShadow="1px 1px 2px rgba(0,0,0,0.5)"
              color="white"
              variants={getAnimationVariants(heroSubtitle)}
              initial="hidden"
              animate="visible"
            >
              Discover our great collection of handcrafted jewelry and certified diamonds
            </MotionText>
            <MotionHStack
              spacing={{ base: 3, md: 4 }}
              flexDirection={{ base: 'column', sm: 'row' }}
              width={{ base: 'full', sm: 'auto' }}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6, ease: [0.4, 0, 0.2, 1] }}
            >
              <MotionButton
                as={NextLink}
                href="/collections"
                size="lg"
                width={{ base: 'full', sm: 'auto' }}
                minH="48px"
                bg="transparent"
                color="white"
                border="2px solid"
                borderColor="gold.500"
                variants={getAnimationVariants(buttonPress)}
                whileHover="hover"
                whileTap="tap"
                sx={{
                  transition: 'all 0.3s ease-in-out',
                }}
                _hover={{
                  bg: 'gold.500',
                  color: 'black',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 0 20px rgba(212, 175, 55, 0.5)',
                }}
                _active={{
                  bg: 'gold.500',
                  color: 'black',
                  transform: 'translateY(0)',
                }}
              >
                Shop Collection
              </MotionButton>
              <MotionButton
                as={NextLink}
                href="/catalog"
                size="lg"
                width={{ base: 'full', sm: 'auto' }}
                minH="48px"
                bg="transparent"
                color="white"
                border="2px solid"
                borderColor="gold.500"
                variants={getAnimationVariants(buttonPress)}
                whileHover="hover"
                whileTap="tap"
                sx={{
                  transition: 'all 0.3s ease-in-out',
                }}
                _hover={{
                  bg: 'gold.500',
                  color: 'black',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 0 20px rgba(212, 175, 55, 0.5)',
                }}
                _active={{
                  bg: 'gold.500',
                  color: 'black',
                  transform: 'translateY(0)',
                }}
              >
                Catalog
              </MotionButton>
            </MotionHStack>
          </VStack>
        </Container>
      </Box>

      {/* Black dividing bar with gradient transitions - 2cm spacing between hero and diagonal section */}
      <Box
        w="100vw"
        position="relative"
        left="50%"
        right="50%"
        ml="-50vw"
        mr="-50vw"
        h="0cm"
        bg="black"
        bgGradient="linear(to-b, rgba(0, 0, 0, 0.8), black, black, rgba(0, 0, 0, 0.8))"
      />

      

      {/* Diagonal Brand Story Section */}
      <Box
        w="100vw"
        position="relative"
        left="50%"
        right="50%"
        ml="-50vw"
        mr="-50vw"
        minH="100vh"
        bg="black"
        py={16}
        display="flex"
        flexDirection="column"
      >
        {/* Top Text Area - Black space above diagonal grid */}
        <Box
          w="100%"
          position="relative"
          pt={{ base: 4, md: 6, lg: 8 }}
          pb={{ base: 6, md: 8, lg: 12 }}
          px={{ base: 8, md: 16, lg: 20 }}
          display="flex"
          alignItems={{ base: 'flex-start', md: 'center' }}
          justifyContent={{ base: 'flex-start', md: 'center' }}
          flexDirection={{ base: 'column', md: 'row' }}
          gap={{ base: 4, md: '10rem', lg: '10rem' }}
          minH={{ base: '120px', md: '100px' }}
        >
          {/* Main Slogan - Left side */}
          <Box>
            <TypewriterText text="Crafted by Time" speed={50} delay={100}>
              {(displayText) => (
                <Heading
                  fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}
                  fontWeight="300"
                  color="white"
                  textAlign="left"
                  lineHeight="1.2"
                  whiteSpace={{ base: "normal", md: "nowrap" }}
                >
                  {displayText}
                </Heading>
              )}
            </TypewriterText>
          </Box>

          {/* Tagline - Right side */}
          <Box>
            <TypewriterText text="From a single spark to a timeless creation" speed={50} delay={100}>
              {(displayText) => (
                <Text
                  fontSize={{ base: 'md', md: 'lg', lg: 'xl' }}
                  fontWeight="300"
                  color="white"
                  textAlign="left"
                  lineHeight="1.6"
                >
                  {displayText}
                </Text>
              )}
            </TypewriterText>
          </Box>
        </Box>

        {/* Diagonal Grid Container */}
        <Container maxW="7xl" flex="1">
          <Box
            display="grid"
            gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
            gridTemplateRows={{ base: "auto", md: "repeat(2, 1fr)" }}
            gap={{ base: 4, md: 8 }}
            h={{ base: "auto", md: "80vh" }}
            position="relative"
          >
            {/* BrandStory Button - Commented out */}
            {/* <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              zIndex={20}
              padding={{ base: 6, md: 8 }}
            >
              <Button
                as={NextLink}
                href="/about"
                size="xs"
                bg="white"
                color="black"
                px={3}
                py={1.5}
                fontSize="xs"
                fontWeight="bold"
                textTransform="uppercase"
                letterSpacing="wide"
                minH="36px"
                h="36px"
                _hover={{
                  bg: 'gold.500',
                  color: 'white',
                  transform: 'scale(1.05)',
                }}
                transition="all 0.3s ease-in-out"
              >
                Brand Story
              </Button>
            </Box> */}

            {/* Top Left - Left1 Video */}
            <Box
              gridColumn={{ base: "1", md: "1" }}
              gridRow={{ base: "1", md: "1" }}
              position="relative"
              overflow="hidden"
              borderRadius="lg"
              boxShadow="2xl"
              minH={{ base: "300px", md: "auto" }}
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
                <source src="/images/brandstoryhome/left1.mp4" type="video/mp4" />
              </video>
            </Box>

            {/* Bottom Left - PhotoLev2 Image (left2.jpg) */}
            <Box
              gridColumn={{ base: "1", md: "1" }}
              gridRow={{ base: "2", md: "2" }}
              position="relative"
              overflow="hidden"
              borderRadius="lg"
              boxShadow="2xl"
              minH={{ base: "300px", md: "auto" }}
            >
              <Box
                as="img"
                src="/images/brandstoryhome/left2.jpg"
                alt="Brand Story"
                width="100%"
                height="100%"
                objectFit="cover"
                objectPosition="center"
              />
            </Box>

            {/* Top Right - Right1 Image */}
            <Box
              gridColumn={{ base: "1", md: "2" }}
              gridRow={{ base: "3", md: "1" }}
              position="relative"
              overflow="hidden"
              borderRadius="lg"
              boxShadow="2xl"
              minH={{ base: "300px", md: "auto" }}
            >
              <Box
                as="img"
                src="/images/brandstoryhome/right1.jpg"
                alt="Craftsmanship"
                width="100%"
                height="100%"
                objectFit="cover"
                objectPosition="center"
              />
            </Box>

            {/* Bottom Right - Right2 Video */}
            <Box
              gridColumn={{ base: "1", md: "2" }}
              gridRow={{ base: "4", md: "2" }}
              position="relative"
              overflow="hidden"
              borderRadius="lg"
              boxShadow="2xl"
              minH={{ base: "300px", md: "auto" }}
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
                <source src="/images/brandstoryhome/right2.mp4" type="video/mp4" />
              </video>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Category Tiles Section */}
      <CategoryTiles />

      {/* Featured Collection */}
      <Box pt={7} pb={16} bg="transparent">
        <Container maxW="7xl">
          <VStack spacing={8} align="stretch">
            <VStack spacing={2} align="start">
              <TypewriterText text="Featured Collection" speed={50} delay={100}>
                {(displayText) => (
                  <Heading size="xl" color="white">{displayText}</Heading>
                )}
              </TypewriterText>
              <TypewriterText text="Handpicked pieces from our master craftsmen" speed={50} delay={100}>
                {(displayText) => (
                  <Text fontSize="lg" color="white">
                    {displayText}
                  </Text>
                )}
              </TypewriterText>
            </VStack>

            <ScrollAnimation animation="fade-in" delay={0.2}>
              <ProductCarousel
                products={featuredProducts}
                isLoading={isLoading}
              />
            </ScrollAnimation>
          </VStack>
        </Container>
      </Box>

      {/* Bestsellers */}
      <Box py={16} bg="transparent">
        <Container maxW="7xl">
          <VStack spacing={8} align="stretch">
            <VStack spacing={2} align="start">
              <TypewriterText text="Bestsellers" speed={50} delay={100}>
                {(displayText) => (
                  <Heading size="xl" color="white">{displayText}</Heading>
                )}
              </TypewriterText>
              <TypewriterText text="Most loved by our customers" speed={50} delay={100}>
                {(displayText) => (
                  <Text fontSize="lg" color="white">
                    {displayText}
                  </Text>
                )}
              </TypewriterText>
            </VStack>

            <ScrollAnimation animation="fade-in" delay={0.2}>
              <ProductCarousel
                products={bestsellers}
                isLoading={isLoading}
              />
            </ScrollAnimation>
          </VStack>
        </Container>
      </Box>

      {/* New Arrival */}
      <Box py={16} bg="transparent">
        <Container maxW="7xl">
          <VStack spacing={8} align="stretch">
            <VStack spacing={2} align="start">
              <TypewriterText text="New Arrival" speed={50} delay={100}>
                {(displayText) => (
                  <Heading size="xl" color="white">{displayText}</Heading>
                )}
              </TypewriterText>
              <TypewriterText text="Latest additions to our collection" speed={50} delay={100}>
                {(displayText) => (
                  <Text fontSize="lg" color="white">
                    {displayText}
                  </Text>
                )}
              </TypewriterText>
            </VStack>

            <ScrollAnimation animation="fade-in" delay={0.2}>
              <ProductCarousel
                products={newArrivals}
                isLoading={isLoading}
              />
            </ScrollAnimation>
          </VStack>
        </Container>
      </Box>

      {/* Come Say Hi Section */}
      <Box minH="50vh" bg="transparent" display="flex" alignItems="center" py={{ base: 8, md: 12 }}>
        <Container maxW="7xl" px={{ base: 4, md: 8 }}>
          <Flex
            direction={{ base: 'column', md: 'row' }}
            align="center"
            justify="center"
            gap={{ base: 6, md: 8 }}
          >
            {/* Left Rectangle - Text with Video Background */}
            <Box
              flex="1"
              width={{ base: 'full', md: 'auto' }}
              position="relative"
              border="2px solid white"
              borderRadius="md"
              overflow="hidden"
              h={{ base: '280px', sm: '350px', md: '400px', lg: '450px' }}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {/* Background Video */}
              <Box
                position="absolute"
                top="0"
                left="0"
                width="100%"
                height="100%"
                zIndex={0}
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
                  <source src="/images/directionsHome/20251029_1719_New Video_storyboard_01k8rxd3nbfwn97y0w3yka3jnf.mp4" type="video/mp4" />
                </video>
              </Box>

              {/* Dark overlay for text readability */}
              <Box
                position="absolute"
                top="0"
                left="0"
                width="100%"
                height="100%"
                bg="blackAlpha.500"
                zIndex={1}
              />

              {/* Centered Text */}
              <VStack
                spacing={{ base: 4, md: 6 }}
                zIndex={2}
                position="relative"
                textAlign="center"
                px={{ base: 4, md: 8 }}
              >
                <Heading
                  fontSize={{ base: '2xl', sm: '3xl', md: '4xl', lg: '5xl' }}
                  fontWeight="bold"
                  color="white"
                  lineHeight="1.2"
                >
                  COME SAY HI
                </Heading>
                <Text
                  fontSize={{ base: 'md', sm: 'lg', md: 'md', lg: 'lg' }}
                  color="white"
                  fontWeight="300"
                  maxW={{ base: '90%', md: '80%' }}
                >
                  Shop your faves in store, get styled, and join the journey.
                </Text>
                <Button
                  as="a"
                  href="https://google.com/maps/dir//Suite+%23203,+221+Victoria+St,+Toronto,+ON+M5B+1V4/@43.8026371,-79.4373134,12z/data=!4m9!4m8!1m1!4e2!1m5!1m1!1s0x89d4cb61ded8ee95:0xe7dd8f4c3d3ef179!2m2!1d-79.3789273!2d43.6551031?entry=ttu&g_ep=EgoyMDI1MTAyNy4wIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  size={{ base: 'md', md: 'lg' }}
                  bg="white"
                  color="black"
                  px={{ base: 6, md: 8 }}
                  py={{ base: 5, md: 6 }}
                  fontSize={{ base: 'sm', md: 'md' }}
                  fontWeight="bold"
                  border="2px solid white"
                  minH="48px"
                  _hover={{
                    bg: 'gold.500',
                    color: 'white',
                    borderColor: 'gold.500',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 0 20px rgba(212, 175, 55, 0.5)',
                  }}
                  transition="all 0.3s ease-in-out"
                >
                  Get Directions
                </Button>
              </VStack>
            </Box>

            {/* Right Rectangle - Image with Address */}
            <Box
              flex="1"
              width={{ base: 'full', md: 'auto' }}
              position="relative"
              border="2px solid white"
              borderRadius="md"
              overflow="hidden"
              h={{ base: '280px', sm: '350px', md: '400px', lg: '450px' }}
              display="flex"
              alignItems="center"
              justifyContent="center"
              bg="gray.300"
            >
              {/* Background Image */}
              <Box
                position="absolute"
                top="0"
                left="0"
                width="100%"
                height="100%"
                zIndex={0}
                overflow="hidden"
              >
                <Box
                  as="img"
                  src="/images/directionsHome/misfit_boat_1920x794_crop_center.webp"
                  alt="Store Location"
                  width="100%"
                  height="100%"
                  objectFit="cover"
                  objectPosition="center"
                  loading="eager"
                  onError={(e: any) => {
                    console.error('Image failed to load:', e.target.src);
                    e.target.style.backgroundColor = '#4A5568';
                  }}
                  style={{
                    display: 'block',
                    minHeight: '100%',
                    minWidth: '100%'
                  }}
                />
              </Box>

              {/* Light overlay for better text contrast - reduced opacity on mobile */}
              <Box
                position="absolute"
                top="0"
                left="0"
                width="100%"
                height="100%"
                bg={{ base: "whiteAlpha.100", md: "whiteAlpha.200" }}
                zIndex={1}
              />

              {/* Top Center - Remy Sales */}
              <Text
                position="absolute"
                top={{ base: 4, md: 6 }}
                left="50%"
                transform="translateX(-50%)"
                fontSize={{ base: 'xl', sm: '2xl', md: '2xl', lg: '3xl' }}
                fontWeight="bold"
                color="black"
                textDecoration="underline"
                textDecorationColor="black"
                textDecorationThickness={{ base: '3px', md: '2px' }}
                textShadow="0 0 12px rgba(255,255,255,1), 0 0 8px rgba(255,255,255,0.9), 0 0 4px rgba(255,255,255,0.8)"
                zIndex={3}
              >
                Remy Sales
              </Text>

              {/* Top Right - Address */}
              <Text
                position="absolute"
                top={{ base: 4, md: 6 }}
                right={{ base: 4, md: 6 }}
                fontSize={{ base: 'md', sm: 'lg', md: 'lg', lg: 'xl' }}
                fontWeight="bold"
                color="black"
                textAlign="right"
                textShadow="0 0 12px rgba(255,255,255,1), 0 0 8px rgba(255,255,255,0.9), 0 0 4px rgba(255,255,255,0.8)"
                zIndex={3}
                maxW={{ base: '50%', md: 'none' }}
              >
                #203, 221 Victoria St
              </Text>

              {/* Bottom Left - City */}
              <Text
                position="absolute"
                bottom={{ base: 4, md: 6 }}
                left={{ base: 4, md: 6 }}
                fontSize={{ base: 'md', sm: 'lg', md: 'lg', lg: 'xl' }}
                fontWeight="bold"
                color="black"
                textShadow="0 0 12px rgba(255,255,255,1), 0 0 8px rgba(255,255,255,0.9), 0 0 4px rgba(255,255,255,0.8)"
                zIndex={3}
                maxW={{ base: '60%', md: 'none' }}
              >
                Toronto, ON M5B 1V4
              </Text>

              {/* Bottom Right - Hours */}
              <Text
                position="absolute"
                bottom={{ base: 4, md: 6 }}
                right={{ base: 4, md: 6 }}
                fontSize={{ base: 'md', sm: 'lg', md: 'lg', lg: 'xl' }}
                fontWeight="bold"
                color="black"
                textAlign="right"
                textShadow="0 0 12px rgba(255,255,255,1), 0 0 8px rgba(255,255,255,0.9), 0 0 4px rgba(255,255,255,0.8)"
                zIndex={3}
              >
                10 am to 5 pm
              </Text>
            </Box>
          </Flex>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box minH="50vh" bg="transparent" display="flex" alignItems="center" py={{ base: 8, md: 12 }}>
        <Container maxW="7xl" px={{ base: 4, md: 8 }}>
          <ScrollAnimation animation="scale-in">
            <Flex
              direction={{ base: 'column', md: 'row' }}
              align="center"
              justify="space-between"
              gap={{ base: 6, md: 8 }}
            >
              <VStack align={{ base: 'center', md: 'start' }} spacing={4} flex="1">
                <TypewriterText text="Subscribe to Our Newsletter" speed={50} delay={100}>
                  {(displayText) => (
                    <Heading
                      fontSize={{ base: 'xl', sm: '2xl', md: '3xl' }}
                      color="white"
                      textAlign={{ base: 'center', md: 'left' }}
                    >
                      {displayText}
                    </Heading>
                  )}
                </TypewriterText>
                <TypewriterText text="Get exclusive offers and be the first to know about new collections" speed={50} delay={100}>
                  {(displayText) => (
                    <Text
                      color="gray.300"
                      fontSize={{ base: 'sm', md: 'md' }}
                      textAlign={{ base: 'center', md: 'left' }}
                    >
                      {displayText}
                    </Text>
                  )}
                </TypewriterText>
              </VStack>
              <MotionButton
                size={{ base: 'md', md: 'lg' }}
                colorScheme="gold"
                variant="solid"
                variants={getAnimationVariants(buttonPress)}
                whileHover="hover"
                whileTap="tap"
                minH="48px"
                width={{ base: 'full', md: 'auto' }}
                px={{ base: 6, md: 8 }}
              >
                Subscribe Now
              </MotionButton>
            </Flex>
          </ScrollAnimation>
        </Container>
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  )
}
