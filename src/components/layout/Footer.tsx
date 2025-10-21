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
import { FaInstagram, FaFacebook, FaPinterest, FaTwitter } from 'react-icons/fa'

export default function Footer() {
  return (
    <Box bg="gray.900" color="gray.200">
      <Container maxW="7xl" py={12}>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={8}>
          {/* About */}
          <Stack spacing={4}>
            <Heading size="sm" color="white" fontWeight="semibold">
              About
            </Heading>
            <Stack spacing={2}>
              <Link as={NextLink} href="/about" fontSize="sm" _hover={{ color: 'white' }}>
                Our Story
              </Link>
              <Link as={NextLink} href="/contact" fontSize="sm" _hover={{ color: 'white' }}>
                Contact Us
              </Link>
              <Link as={NextLink} href="/collections" fontSize="sm" _hover={{ color: 'white' }}>
                Collections
              </Link>
            </Stack>
          </Stack>

          {/* Customer Care */}
          <Stack spacing={4}>
            <Heading size="sm" color="white" fontWeight="semibold">
              Customer Care
            </Heading>
            <Stack spacing={2}>
              <Link as={NextLink} href="/account/orders" fontSize="sm" _hover={{ color: 'white' }}>
                Track Order
              </Link>
              <Link href="#" fontSize="sm" _hover={{ color: 'white' }}>
                Shipping & Returns
              </Link>
              <Link href="#" fontSize="sm" _hover={{ color: 'white' }}>
                Size Guide
              </Link>
              <Link href="#" fontSize="sm" _hover={{ color: 'white' }}>
                FAQ
              </Link>
            </Stack>
          </Stack>

          {/* Legal */}
          <Stack spacing={4}>
            <Heading size="sm" color="white" fontWeight="semibold">
              Legal
            </Heading>
            <Stack spacing={2}>
              <Link href="#" fontSize="sm" _hover={{ color: 'white' }}>
                Privacy Policy
              </Link>
              <Link href="#" fontSize="sm" _hover={{ color: 'white' }}>
                Terms of Service
              </Link>
              <Link href="#" fontSize="sm" _hover={{ color: 'white' }}>
                Cookie Policy
              </Link>
            </Stack>
          </Stack>

          {/* Connect */}
          <Stack spacing={4}>
            <Heading size="sm" color="white" fontWeight="semibold">
              Connect
            </Heading>
            <Stack spacing={2}>
              <HStack spacing={4}>
                <Link href="#" _hover={{ color: 'white' }}>
                  <Icon as={FaInstagram} boxSize={5} />
                </Link>
                <Link href="#" _hover={{ color: 'white' }}>
                  <Icon as={FaFacebook} boxSize={5} />
                </Link>
                <Link href="#" _hover={{ color: 'white' }}>
                  <Icon as={FaPinterest} boxSize={5} />
                </Link>
                <Link href="#" _hover={{ color: 'white' }}>
                  <Icon as={FaTwitter} boxSize={5} />
                </Link>
              </HStack>
              <Text fontSize="sm" mt={4}>
                Email: info@diamondstore.com
              </Text>
              <Text fontSize="sm">
                Phone: +1 (555) 123-4567
              </Text>
            </Stack>
          </Stack>
        </SimpleGrid>

        <Divider my={8} borderColor="gray.700" />

        <Stack
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align="center"
          spacing={4}
        >
          <Text fontSize="xs" color="gray.400">
            © {new Date().getFullYear()} Diamond Store. All rights reserved.
          </Text>
          <HStack spacing={6}>
            <Link
              as={NextLink}
              href="/admin"
              fontSize="xs"
              color="gray.400"
              _hover={{ color: 'white' }}
            >
              Admin Panel
            </Link>
            <Text fontSize="xs" color="gray.400">
              USD
            </Text>
            <Text fontSize="xs" color="gray.400">
              English
            </Text>
          </HStack>
        </Stack>
      </Container>
    </Box>
  )
}