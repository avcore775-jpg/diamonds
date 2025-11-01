'use client'

import React from 'react'
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Button,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { motion } from 'framer-motion'

const MotionBox = motion.create(Box)
const MotionHeading = motion.create(Heading)
const MotionButton = motion.create(Button)

export default function NotFound() {
  return (
    <Box minH="100vh" position="relative" overflow="hidden" bg="black">
      {/* Video Background */}
      <Box
        position="fixed"
        top="0"
        left="0"
        width="100%"
        height="100%"
        zIndex={0}
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
          <source src="/images/404/assets_task_01jpn5rpptf9vbghheeebt587a_task_01jpn5rpptf9vbghheeebt587a_genid_9a70b290-cd6d-4662-9d04-51167be2094a_25_03_18_17_46_111909_videos_00000_756437498_source.mp4" type="video/mp4" />
        </video>

        {/* Dark overlay for better text readability */}
        <Box
          position="absolute"
          top="0"
          left="0"
          width="100%"
          height="100%"
          bg="blackAlpha.700"
        />
      </Box>

      {/* Content */}
      <Container
        maxW="4xl"
        position="relative"
        zIndex={1}
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack spacing={8} textAlign="center">
          <MotionHeading
            fontSize={{ base: '8xl', md: '9xl', lg: '150px' }}
            fontWeight="300"
            color="gold.500"
            textShadow="0 0 40px rgba(212, 175, 55, 0.8)"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            404
          </MotionHeading>

          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Heading
              size={{ base: 'xl', md: '2xl' }}
              fontWeight="300"
              color="white"
              mb={4}
            >
              Page Not Found
            </Heading>
            <Text
              fontSize={{ base: 'lg', md: 'xl' }}
              color="gray.300"
              maxW="2xl"
            >
              The page you're looking for doesn't exist or has been moved.
              Let's get you back on track.
            </Text>
          </MotionBox>

          <MotionButton
            as={NextLink}
            href="/"
            size="lg"
            bg="gold.500"
            color="black"
            px={8}
            py={6}
            fontSize="lg"
            fontWeight="bold"
            textTransform="uppercase"
            letterSpacing="wide"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            _hover={{
              bg: 'gold.600',
              transform: 'scale(1.05)',
              boxShadow: '0 0 30px rgba(212, 175, 55, 0.6)',
            }}
          >
            Return Home
          </MotionButton>

          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <VStack spacing={4}>
              <Text color="gray.400" fontSize="sm">
                Or explore our collections:
              </Text>
              <Box
                display="flex"
                gap={4}
                flexWrap="wrap"
                justifyContent="center"
              >
                <Button
                  as={NextLink}
                  href="/collections"
                  variant="outline"
                  borderColor="gold.500"
                  color="white"
                  _hover={{
                    bg: 'gold.500',
                    color: 'black',
                  }}
                >
                  Collections
                </Button>
                <Button
                  as={NextLink}
                  href="/catalog"
                  variant="outline"
                  borderColor="gold.500"
                  color="white"
                  _hover={{
                    bg: 'gold.500',
                    color: 'black',
                  }}
                >
                  Catalog
                </Button>
                <Button
                  as={NextLink}
                  href="/contact"
                  variant="outline"
                  borderColor="gold.500"
                  color="white"
                  _hover={{
                    bg: 'gold.500',
                    color: 'black',
                  }}
                >
                  Contact Us
                </Button>
              </Box>
            </VStack>
          </MotionBox>
        </VStack>
      </Container>
    </Box>
  )
}
