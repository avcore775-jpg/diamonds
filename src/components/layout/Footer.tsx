'use client'

import {
  Box,
  Container,
  SimpleGrid,
  Stack,
  Text,
  Link,
  Heading,
  Divider,
  HStack,
  Icon,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { FaInstagram, FaFacebook, FaLinkedin } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'

export default function Footer() {
  return (
    <Box
      bg="transparent"
      color="white"
      py={12}
      borderTop="2px solid"
      borderColor="rgba(212, 175, 55, 0.3)"
      position="relative"
      boxShadow="0 -8px 32px rgba(0, 0, 0, 0.4), 0 -4px 16px rgba(212, 175, 55, 0.1)"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.8) 50%, transparent 100%)',
        opacity: 0.7,
      }}
    >
      <Container maxW="7xl">
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={8}>
          {/* About */}
          <Stack spacing={4}>
            <Heading size="sm" color="gold.500" fontWeight="300">
              About
            </Heading>
            <Stack spacing={2}>
              <Link
                as={NextLink}
                href="/about"
                fontSize="sm"
                color="gray.300"
                position="relative"
                _hover={{
                  color: 'gold.500',
                  _after: {
                    content: '""',
                    position: 'absolute',
                    bottom: '-2px',
                    left: 0,
                    right: 0,
                    height: '1px',
                    bg: 'gold.500',
                  },
                }}
                _after={{
                  content: '""',
                  position: 'absolute',
                  bottom: '-2px',
                  left: 0,
                  right: 0,
                  height: '1px',
                  bg: 'transparent',
                  transition: 'background-color 0.3s ease',
                }}
              >
                Our Story
              </Link>
              <Link
                as={NextLink}
                href="/contact"
                fontSize="sm"
                color="gray.300"
                position="relative"
                _hover={{
                  color: 'gold.500',
                  _after: {
                    content: '""',
                    position: 'absolute',
                    bottom: '-2px',
                    left: 0,
                    right: 0,
                    height: '1px',
                    bg: 'gold.500',
                  },
                }}
                _after={{
                  content: '""',
                  position: 'absolute',
                  bottom: '-2px',
                  left: 0,
                  right: 0,
                  height: '1px',
                  bg: 'transparent',
                  transition: 'background-color 0.3s ease',
                }}
              >
                Contact Us
              </Link>
              <Link
                as={NextLink}
                href="/collections"
                fontSize="sm"
                color="gray.300"
                position="relative"
                _hover={{
                  color: 'gold.500',
                  _after: {
                    content: '""',
                    position: 'absolute',
                    bottom: '-2px',
                    left: 0,
                    right: 0,
                    height: '1px',
                    bg: 'gold.500',
                  },
                }}
                _after={{
                  content: '""',
                  position: 'absolute',
                  bottom: '-2px',
                  left: 0,
                  right: 0,
                  height: '1px',
                  bg: 'transparent',
                  transition: 'background-color 0.3s ease',
                }}
              >
                Collections
              </Link>
            </Stack>
          </Stack>

          {/* Customer Care */}
          <Stack spacing={4}>
            <Heading size="sm" color="gold.500" fontWeight="300">
              Customer Care
            </Heading>
            <Stack spacing={2}>
              <Link
                as={NextLink}
                href="/account/orders"
                fontSize="sm"
                color="gray.300"
                position="relative"
                _hover={{
                  color: 'gold.500',
                  _after: {
                    content: '""',
                    position: 'absolute',
                    bottom: '-2px',
                    left: 0,
                    right: 0,
                    height: '1px',
                    bg: 'gold.500',
                  },
                }}
                _after={{
                  content: '""',
                  position: 'absolute',
                  bottom: '-2px',
                  left: 0,
                  right: 0,
                  height: '1px',
                  bg: 'transparent',
                  transition: 'background-color 0.3s ease',
                }}
              >
                Track Order
              </Link>
              <Link
                href="#"
                fontSize="sm"
                color="gray.300"
                position="relative"
                _hover={{
                  color: 'gold.500',
                  _after: {
                    content: '""',
                    position: 'absolute',
                    bottom: '-2px',
                    left: 0,
                    right: 0,
                    height: '1px',
                    bg: 'gold.500',
                  },
                }}
                _after={{
                  content: '""',
                  position: 'absolute',
                  bottom: '-2px',
                  left: 0,
                  right: 0,
                  height: '1px',
                  bg: 'transparent',
                  transition: 'background-color 0.3s ease',
                }}
              >
                Shipping &amp; Returns
              </Link>
              <Link
                href="#"
                fontSize="sm"
                color="gray.300"
                position="relative"
                _hover={{
                  color: 'gold.500',
                  _after: {
                    content: '""',
                    position: 'absolute',
                    bottom: '-2px',
                    left: 0,
                    right: 0,
                    height: '1px',
                    bg: 'gold.500',
                  },
                }}
                _after={{
                  content: '""',
                  position: 'absolute',
                  bottom: '-2px',
                  left: 0,
                  right: 0,
                  height: '1px',
                  bg: 'transparent',
                  transition: 'background-color 0.3s ease',
                }}
              >
                Size Guide
              </Link>
              <Link
                href="#"
                fontSize="sm"
                color="gray.300"
                position="relative"
                _hover={{
                  color: 'gold.500',
                  _after: {
                    content: '""',
                    position: 'absolute',
                    bottom: '-2px',
                    left: 0,
                    right: 0,
                    height: '1px',
                    bg: 'gold.500',
                  },
                }}
                _after={{
                  content: '""',
                  position: 'absolute',
                  bottom: '-2px',
                  left: 0,
                  right: 0,
                  height: '1px',
                  bg: 'transparent',
                  transition: 'background-color 0.3s ease',
                }}
              >
                FAQ
              </Link>
            </Stack>
          </Stack>

          {/* Legal */}
          <Stack spacing={4}>
            <Heading size="sm" color="gold.500" fontWeight="300">
              Legal
            </Heading>
            <Stack spacing={2}>
              <Link
                href="#"
                fontSize="sm"
                color="gray.300"
                position="relative"
                _hover={{
                  color: 'gold.500',
                  _after: {
                    content: '""',
                    position: 'absolute',
                    bottom: '-2px',
                    left: 0,
                    right: 0,
                    height: '1px',
                    bg: 'gold.500',
                  },
                }}
                _after={{
                  content: '""',
                  position: 'absolute',
                  bottom: '-2px',
                  left: 0,
                  right: 0,
                  height: '1px',
                  bg: 'transparent',
                  transition: 'background-color 0.3s ease',
                }}
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                fontSize="sm"
                color="gray.300"
                position="relative"
                _hover={{
                  color: 'gold.500',
                  _after: {
                    content: '""',
                    position: 'absolute',
                    bottom: '-2px',
                    left: 0,
                    right: 0,
                    height: '1px',
                    bg: 'gold.500',
                  },
                }}
                _after={{
                  content: '""',
                  position: 'absolute',
                  bottom: '-2px',
                  left: 0,
                  right: 0,
                  height: '1px',
                  bg: 'transparent',
                  transition: 'background-color 0.3s ease',
                }}
              >
                Terms of Service
              </Link>
              <Link
                href="#"
                fontSize="sm"
                color="gray.300"
                position="relative"
                _hover={{
                  color: 'gold.500',
                  _after: {
                    content: '""',
                    position: 'absolute',
                    bottom: '-2px',
                    left: 0,
                    right: 0,
                    height: '1px',
                    bg: 'gold.500',
                  },
                }}
                _after={{
                  content: '""',
                  position: 'absolute',
                  bottom: '-2px',
                  left: 0,
                  right: 0,
                  height: '1px',
                  bg: 'transparent',
                  transition: 'background-color 0.3s ease',
                }}
              >
                Cookie Policy
              </Link>
            </Stack>
          </Stack>

          {/* Connect */}
          <Stack spacing={4}>
            <Heading size="sm" color="gold.500" fontWeight="300">
              Connect
            </Heading>
            <Stack spacing={2}>
              <Text fontSize="sm" color="gray.300">
                Email: info@diamondstore.com
              </Text>
              <Text fontSize="sm" color="gray.300">
                Phone: +1 (555) 123-4567
              </Text>
            </Stack>
            <HStack spacing={4} pt={2}>
              <Link
                href="#"
                isExternal
                _hover={{ transform: 'scale(1.2)' }}
                transition="all 0.3s ease"
              >
                <Icon
                  as={FaInstagram}
                  w={5}
                  h={5}
                  color="white"
                  _hover={{ color: 'gold.500' }}
                  transition="color 0.3s ease"
                />
              </Link>
              <Link
                href="#"
                isExternal
                _hover={{ transform: 'scale(1.2)' }}
                transition="all 0.3s ease"
              >
                <Icon
                  as={FaFacebook}
                  w={5}
                  h={5}
                  color="white"
                  _hover={{ color: 'gold.500' }}
                  transition="color 0.3s ease"
                />
              </Link>
              <Link
                href="#"
                isExternal
                _hover={{ transform: 'scale(1.2)' }}
                transition="all 0.3s ease"
              >
                <Icon
                  as={FaXTwitter}
                  w={5}
                  h={5}
                  color="white"
                  _hover={{ color: 'gold.500' }}
                  transition="color 0.3s ease"
                />
              </Link>
              <Link
                href="#"
                isExternal
                _hover={{ transform: 'scale(1.2)' }}
                transition="all 0.3s ease"
              >
                <Icon
                  as={FaLinkedin}
                  w={5}
                  h={5}
                  color="white"
                  _hover={{ color: 'gold.500' }}
                  transition="color 0.3s ease"
                />
              </Link>
            </HStack>
          </Stack>
        </SimpleGrid>

        <Divider my={8} borderColor="rgba(212, 175, 55, 0.2)" />

        <Stack
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align="center"
          spacing={4}
        >
          <Text fontSize="sm" color="gray.400">
            © {new Date().getFullYear()} RemySales. All rights reserved.
          </Text>
        </Stack>
      </Container>
    </Box>
  )
}