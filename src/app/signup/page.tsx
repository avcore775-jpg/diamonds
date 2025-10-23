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
  Checkbox,
  Spinner,
  Center,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { FaGoogle, FaUserPlus } from 'react-icons/fa'

function SignUpContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const toast = useToast()
  
  const [formData, setFormData] = React.useState({
    email: '',
    name: '',
    acceptTerms: false,
  })
  const [isLoading, setIsLoading] = React.useState(false)
  const [errors, setErrors] = React.useState<any>({})

  const redirect = searchParams.get('redirect') || '/'

  const validateForm = () => {
    const newErrors: any = {}
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!formData.name) {
      newErrors.name = 'Name is required'
    }
    
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // First create the user account
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create account')
      }

      // Then sign them in
      const result = await signIn('email', {
        email: formData.email,
        redirect: false,
        callbackUrl: redirect,
      })

      if (result?.ok) {
        toast({
          title: 'Account created successfully!',
          description: 'Check your email to verify your account.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
        router.push(redirect)
      } else {
        throw new Error('Failed to sign in after account creation')
      }
    } catch (error: any) {
      toast({
        title: 'Failed to create account',
        description: error.message || 'Please try again later',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setIsLoading(true)
    try {
      await signIn('google', { callbackUrl: redirect })
    } catch (error) {
      toast({
        title: 'Failed to sign up with Google',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box minH="100vh" bg="transparent" py={20}>
      <Container maxW="md">
        <VStack spacing={8}>
          <VStack spacing={2} textAlign="center">
            <Heading size="xl">Create an Account</Heading>
            <Text color="gray.600">
              Join Luxe Diamonds to start shopping for exquisite jewelry
            </Text>
          </VStack>

          <Card w="full">
            <CardBody>
              <VStack spacing={6}>
                <form onSubmit={handleSignUp} style={{ width: '100%' }}>
                  <VStack spacing={4}>
                    <FormControl isInvalid={!!errors.name}>
                      <FormLabel>Full Name</FormLabel>
                      <Input
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        size="lg"
                      />
                      {errors.name && <FormErrorMessage>{errors.name}</FormErrorMessage>}
                    </FormControl>

                    <FormControl isInvalid={!!errors.email}>
                      <FormLabel>Email Address</FormLabel>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        size="lg"
                      />
                      {errors.email && <FormErrorMessage>{errors.email}</FormErrorMessage>}
                    </FormControl>

                    <FormControl isInvalid={!!errors.acceptTerms}>
                      <Checkbox
                        isChecked={formData.acceptTerms}
                        onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                      >
                        <Text fontSize="sm">
                          I agree to the{' '}
                          <Link color="brand.500" href="/terms">
                            Terms of Service
                          </Link>{' '}
                          and{' '}
                          <Link color="brand.500" href="/privacy">
                            Privacy Policy
                          </Link>
                        </Text>
                      </Checkbox>
                      {errors.acceptTerms && (
                        <Text fontSize="sm" color="red.500" mt={1}>
                          {errors.acceptTerms}
                        </Text>
                      )}
                    </FormControl>

                    <Button
                      type="submit"
                      colorScheme="brand"
                      size="lg"
                      width="full"
                      isLoading={isLoading}
                      leftIcon={<FaUserPlus />}
                    >
                      Create Account
                    </Button>
                  </VStack>
                </form>

                <HStack w="full">
                  <Divider />
                  <Text fontSize="sm" color="gray.500" px={3}>
                    OR
                  </Text>
                  <Divider />
                </HStack>

                <Button
                  onClick={handleGoogleSignUp}
                  variant="outline"
                  size="lg"
                  width="full"
                  isLoading={isLoading}
                  leftIcon={<FaGoogle />}
                >
                  Sign up with Google
                </Button>

                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Already have an account?{' '}
                  <Link
                    as={NextLink}
                    href={`/signin?redirect=${redirect}`}
                    color="brand.500"
                    fontWeight="semibold"
                  >
                    Sign in
                  </Link>
                </Text>
              </VStack>
            </CardBody>
          </Card>

          <VStack spacing={4} textAlign="center">
            <Text fontSize="sm" fontWeight="semibold" color="gray.700">
              Why Create an Account?
            </Text>
            <VStack spacing={2} fontSize="sm" color="gray.600">
              <Text>✓ Track your orders and shipping</Text>
              <Text>✓ Save items to your wishlist</Text>
              <Text>✓ Get exclusive member offers</Text>
              <Text>✓ Faster checkout with saved addresses</Text>
            </VStack>
          </VStack>
        </VStack>
      </Container>
    </Box>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <Box minH="100vh" bg="transparent" py={20}>
        <Container maxW="md">
          <Center h="50vh">
            <VStack spacing={4}>
              <Spinner size="xl" color="brand.500" thickness="4px" />
              <Text fontSize="lg" color="gray.600">Loading...</Text>
            </VStack>
          </Center>
        </Container>
      </Box>
    }>
      <SignUpContent />
    </Suspense>
  )
}