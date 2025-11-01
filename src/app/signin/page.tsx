'use client'

import React, { Suspense } from 'react'
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Input,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useToast,
  Card,
  CardBody,
  Link,
  Divider,
  HStack,
  Spinner,
  Center,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { FaGoogle, FaEnvelope } from 'react-icons/fa'
import Header from '@/components/layout/Header'

function SignInContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const toast = useToast()
  
  const [email, setEmail] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  const redirect = searchParams.get('redirect') || '/'

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('email', {
        email,
        redirect: false,
        callbackUrl: redirect,
      })

      if (result?.error) {
        setError('Failed to sign in. Please try again.')
      } else if (result?.ok) {
        toast({
          title: 'Check your email',
          description: 'We sent you a sign-in link. Please check your inbox.',
          status: 'info',
          duration: 5000,
          isClosable: true,
        })
      }
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn('google', { callbackUrl: redirect })
    } catch (error) {
      toast({
        title: 'Failed to sign in with Google',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box minH="100vh" bg="transparent">
      <Header />
      <Container maxW="md" pt={{ base: 24, md: 28 }} pb={20}>
        <VStack spacing={8}>
          <VStack spacing={2} textAlign="center">
            <Heading size="xl" color="white" fontWeight="300">Welcome Back</Heading>
            <Text color="white">
              Sign in to your account to continue shopping
            </Text>
          </VStack>

          <Card w="full" bg="rgba(0, 0, 0, 0.6)" border="1px solid" borderColor="gold.500">
            <CardBody>
              <VStack spacing={6}>
                <form onSubmit={handleEmailSignIn} style={{ width: '100%' }}>
                  <VStack spacing={4}>
                    <FormControl isInvalid={!!error}>
                      <FormLabel color="white">Email Address</FormLabel>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        size="lg"
                        bg="rgba(255, 255, 255, 0.1)"
                        color="white"
                        borderColor="gold.500"
                        _placeholder={{ color: 'gray.400' }}
                        _hover={{ borderColor: 'gold.400' }}
                        _focus={{ borderColor: 'gold.500', boxShadow: '0 0 0 1px gold.500' }}
                      />
                      {error && <FormErrorMessage color="red.300">{error}</FormErrorMessage>}
                    </FormControl>

                    <Button
                      type="submit"
                      colorScheme="gold"
                      size="lg"
                      width="full"
                      isLoading={isLoading}
                      leftIcon={<FaEnvelope />}
                    >
                      Sign in with Email
                    </Button>
                  </VStack>
                </form>

                <HStack w="full">
                  <Divider borderColor="gold.500" />
                  <Text fontSize="sm" color="white" px={3}>
                    OR
                  </Text>
                  <Divider borderColor="gold.500" />
                </HStack>

                <Button
                  onClick={handleGoogleSignIn}
                  variant="outline"
                  size="lg"
                  width="full"
                  isLoading={isLoading}
                  leftIcon={<FaGoogle />}
                  borderColor="gold.500"
                  color="white"
                  _hover={{ bg: 'gold.500', color: 'black' }}
                >
                  Sign in with Google
                </Button>

                <Text fontSize="sm" color="white" textAlign="center">
                  Don't have an account?{' '}
                  <Link
                    as={NextLink}
                    href={`/signup?redirect=${redirect}`}
                    color="gold.500"
                    fontWeight="300"
                    _hover={{ color: 'gold.400' }}
                  >
                    Sign up
                  </Link>
                </Text>
              </VStack>
            </CardBody>
          </Card>

          <Text fontSize="xs" color="gray.300" textAlign="center" maxW="md">
            By signing in, you agree to our Terms of Service and Privacy Policy.
            We'll occasionally send you account-related emails.
          </Text>
        </VStack>
      </Container>
    </Box>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <Box minH="100vh" bg="transparent">
        <Header />
        <Container maxW="md" pt={{ base: 24, md: 28 }} pb={20}>
          <Center h="50vh">
            <VStack spacing={4}>
              <Spinner size="xl" color="gold.500" thickness="4px" />
              <Text fontSize="lg" color="white">Loading...</Text>
            </VStack>
          </Center>
        </Container>
      </Box>
    }>
      <SignInContent />
    </Suspense>
  )
}