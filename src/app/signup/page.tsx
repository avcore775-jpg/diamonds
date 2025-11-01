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
import Header from '@/components/layout/Header'

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
    <Box minH="100vh" bg="transparent">
      <Header />
      <Container maxW="md" pt={{ base: 24, md: 28 }} pb={20}>
        <VStack spacing={8}>
          <VStack spacing={2} textAlign="center">
            <Heading size="xl" color="white" fontWeight="300">Create an Account</Heading>
            <Text color="white">
              Join RemySales to start shopping for exquisite jewelry
            </Text>
          </VStack>

          <Card w="full" bg="rgba(0, 0, 0, 0.6)" border="1px solid" borderColor="gold.500">
            <CardBody>
              <VStack spacing={6}>
                <form onSubmit={handleSignUp} style={{ width: '100%' }}>
                  <VStack spacing={4}>
                    <FormControl isInvalid={!!errors.name}>
                      <FormLabel color="white">Full Name</FormLabel>
                      <Input
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        size="lg"
                        bg="rgba(255, 255, 255, 0.1)"
                        color="white"
                        borderColor="gold.500"
                        _placeholder={{ color: 'gray.400' }}
                        _hover={{ borderColor: 'gold.400' }}
                        _focus={{ borderColor: 'gold.500', boxShadow: '0 0 0 1px gold.500' }}
                      />
                      {errors.name && <FormErrorMessage color="red.300">{errors.name}</FormErrorMessage>}
                    </FormControl>

                    <FormControl isInvalid={!!errors.email}>
                      <FormLabel color="white">Email Address</FormLabel>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        size="lg"
                        bg="rgba(255, 255, 255, 0.1)"
                        color="white"
                        borderColor="gold.500"
                        _placeholder={{ color: 'gray.400' }}
                        _hover={{ borderColor: 'gold.400' }}
                        _focus={{ borderColor: 'gold.500', boxShadow: '0 0 0 1px gold.500' }}
                      />
                      {errors.email && <FormErrorMessage color="red.300">{errors.email}</FormErrorMessage>}
                    </FormControl>

                    <FormControl isInvalid={!!errors.acceptTerms}>
                      <Checkbox
                        isChecked={formData.acceptTerms}
                        onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                        colorScheme="gold"
                      >
                        <Text fontSize="sm" color="white">
                          I agree to the{' '}
                          <Link color="gold.500" href="/terms" _hover={{ color: 'gold.400' }}>
                            Terms of Service
                          </Link>{' '}
                          and{' '}
                          <Link color="gold.500" href="/privacy" _hover={{ color: 'gold.400' }}>
                            Privacy Policy
                          </Link>
                        </Text>
                      </Checkbox>
                      {errors.acceptTerms && (
                        <Text fontSize="sm" color="red.300" mt={1}>
                          {errors.acceptTerms}
                        </Text>
                      )}
                    </FormControl>

                    <Button
                      type="submit"
                      colorScheme="gold"
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
                  <Divider borderColor="gold.500" />
                  <Text fontSize="sm" color="white" px={3}>
                    OR
                  </Text>
                  <Divider borderColor="gold.500" />
                </HStack>

                <Button
                  onClick={handleGoogleSignUp}
                  variant="outline"
                  size="lg"
                  width="full"
                  isLoading={isLoading}
                  leftIcon={<FaGoogle />}
                  borderColor="gold.500"
                  color="white"
                  _hover={{ bg: 'gold.500', color: 'black' }}
                >
                  Sign up with Google
                </Button>

                <Text fontSize="sm" color="white" textAlign="center">
                  Already have an account?{' '}
                  <Link
                    as={NextLink}
                    href={`/signin?redirect=${redirect}`}
                    color="gold.500"
                    fontWeight="300"
                    _hover={{ color: 'gold.400' }}
                  >
                    Sign in
                  </Link>
                </Text>
              </VStack>
            </CardBody>
          </Card>

          <Text fontSize="xs" color="gray.300" textAlign="center" maxW="md">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
            We'll occasionally send you account-related emails.
          </Text>
        </VStack>
      </Container>
    </Box>
  )
}

export default function SignUpPage() {
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
      <SignUpContent />
    </Suspense>
  )
}