'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Flex,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Divider,
  useToast,
  Card,
  CardBody,
  CardHeader,
  Icon,
  Link,
  InputGroup,
  InputRightElement,
  IconButton,
  Avatar,
  Badge,
  Spinner,
  Center,
} from '@chakra-ui/react'
import { FaGem, FaEye, FaEyeSlash, FaShoppingBag, FaHeart, FaSignOutAlt, FaUser } from 'react-icons/fa'
import { signIn, signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import NextLink from 'next/link'
import Header from '@/components/layout/Header'

export default function AccountPage() {
  const router = useRouter()
  const toast = useToast()
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Sign In form state
  const [signInData, setSignInData] = useState({
    email: '',
    password: '',
  })
  
  // Sign Up form state
  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  })
  
  const [errors, setErrors] = useState<any>({})

  // Handle Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    try {
      const result = await signIn('credentials', {
        email: signInData.email,
        password: signInData.password,
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: 'Sign in failed',
          description: 'Invalid email or password',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      } else {
        toast({
          title: 'Welcome back!',
          description: 'You have successfully signed in',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        router.push('/collections')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Sign Up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    // Validation
    const newErrors: any = {}
    if (!signUpData.name) newErrors.name = 'Name is required'
    if (!signUpData.email) newErrors.email = 'Email is required'
    if (signUpData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    if (signUpData.password !== signUpData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signUpData.name,
          email: signUpData.email,
          password: signUpData.password,
          phone: signUpData.phone,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Account created!',
          description: 'Please check your email to verify your account.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
        // Switch to sign in tab
        setActiveTab('signin')
        setSignInData({ email: signUpData.email, password: '' })
      } else {
        toast({
          title: 'Sign up failed',
          description: data.error || 'Something went wrong',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create account. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    toast({
      title: 'Signed out',
      description: 'You have been signed out successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
    router.push('/')
  }

  // Show loading spinner while checking session
  if (status === 'loading') {
    return (
      <Box minH="100vh" bg="transparent">
        <Header />
        <Center h="calc(100vh - 100px)">
          <Spinner size="xl" color="gold.500" thickness="4px" />
        </Center>
      </Box>
    )
  }

  // If user is logged in, show account dashboard
  if (session) {
    return (
      <Box minH="100vh" bg="transparent">
        <Header />

        <Container maxW="7xl" pt={{ base: 32, md: 28 }} pb={20}>
          <VStack spacing={8}>
            {/* User Profile Header */}
            <HStack spacing={4} w="full" justify="center">
              <Avatar
                size="xl"
                name={session.user?.name || session.user?.email || ''}
                src={session.user?.image || ''}
              />
              <VStack align="start" spacing={1}>
                <Heading size="lg" color="white" fontWeight="300">
                  {session.user?.name || 'User'}
                </Heading>
                <Text color="gray.300">{session.user?.email}</Text>
                {session.user?.role === 'ADMIN' && (
                  <Badge colorScheme="red" fontSize="sm">ADMIN</Badge>
                )}
              </VStack>
            </HStack>

            {/* Account Actions Grid */}
            <Flex
              direction={{ base: 'column', md: 'row' }}
              gap={4}
              w="full"
              maxW="4xl"
            >
              <Card
                flex="1"
                bg="rgba(0, 0, 0, 0.6)"
                border="1px solid"
                borderColor="gold.500"
                cursor="pointer"
                onClick={() => router.push('/account/orders')}
                _hover={{
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 16px rgba(212, 175, 55, 0.3)',
                  transition: 'all 0.3s'
                }}
              >
                <CardBody>
                  <VStack spacing={4}>
                    <Icon as={FaShoppingBag} boxSize={10} color="gold.500" />
                    <Heading size="md" color="white" fontWeight="300">
                      My Orders
                    </Heading>
                    <Text color="gray.300" textAlign="center" fontSize="sm">
                      View and track your orders
                    </Text>
                  </VStack>
                </CardBody>
              </Card>

              <Card
                flex="1"
                bg="rgba(0, 0, 0, 0.6)"
                border="1px solid"
                borderColor="gold.500"
                cursor="pointer"
                onClick={() => router.push('/wishlist')}
                _hover={{
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 16px rgba(212, 175, 55, 0.3)',
                  transition: 'all 0.3s'
                }}
              >
                <CardBody>
                  <VStack spacing={4}>
                    <Icon as={FaHeart} boxSize={10} color="gold.500" />
                    <Heading size="md" color="white" fontWeight="300">
                      Wishlist
                    </Heading>
                    <Text color="gray.300" textAlign="center" fontSize="sm">
                      Manage your favorite items
                    </Text>
                  </VStack>
                </CardBody>
              </Card>

              <Card
                flex="1"
                bg="rgba(0, 0, 0, 0.6)"
                border="1px solid"
                borderColor="gold.500"
                cursor="pointer"
                onClick={() => router.push('/account/profile')}
                _hover={{
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 16px rgba(212, 175, 55, 0.3)',
                  transition: 'all 0.3s'
                }}
              >
                <CardBody>
                  <VStack spacing={4}>
                    <Icon as={FaUser} boxSize={10} color="gold.500" />
                    <Heading size="md" color="white" fontWeight="300">
                      Profile
                    </Heading>
                    <Text color="gray.300" textAlign="center" fontSize="sm">
                      Update your information
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </Flex>

            {/* Sign Out Button */}
            <Button
              leftIcon={<FaSignOutAlt />}
              variant="outline"
              colorScheme="red"
              size="lg"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </VStack>
        </Container>
      </Box>
    )
  }

  // If not logged in, show sign in / sign up forms
  return (
    <Box minH="100vh" bg="transparent">
      <Header />

      <Container maxW="7xl" pt={{ base: 24, md: 28 }} pb={20}>
        <VStack spacing={8}>
          {/* Logo and Title */}
          <VStack spacing={4}>
            <Icon as={FaGem} boxSize={12} color="gold.500" />
            <Heading size="xl" color="white" fontWeight="300">Welcome to RemySales</Heading>
            <Text color="white">Sign in to your account or create a new one</Text>
          </VStack>

          {/* Tab Buttons */}
          <HStack spacing={4}>
            <Button
              size="lg"
              onClick={() => setActiveTab('signin')}
              w="200px"
              bg="black"
              color="gold.500"
              border="2px solid"
              borderColor="gold.500"
              fontWeight="bold"
              _hover={{
                bg: 'gold.500',
                color: 'black'
              }}
            >
              Sign In
            </Button>
            <Button
              size="lg"
              onClick={() => setActiveTab('signup')}
              w="200px"
              bg="black"
              color="gold.500"
              border="2px solid"
              borderColor="gold.500"
              fontWeight="bold"
              _hover={{
                bg: 'gold.500',
                color: 'black'
              }}
            >
              Create Account
            </Button>
          </HStack>

          {/* Forms Container */}
          <Card maxW="md" w="full" bg="rgba(0, 0, 0, 0.6)" border="1px solid" borderColor="gold.500">
            <CardBody>
              {activeTab === 'signin' ? (
                // Sign In Form
                <form onSubmit={handleSignIn}>
                  <VStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel color="white">Email</FormLabel>
                      <Input bg="rgba(255, 255, 255, 0.1)" color="white" borderColor="gold.500" _placeholder={{ color: "gray.400" }} _hover={{ borderColor: "gold.400" }} _focus={{ borderColor: "gold.500", boxShadow: "0 0 0 1px gold.500" }}
                        type="email"
                        value={signInData.email}
                        onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                        placeholder="your@email.com"
                        size="lg"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel color="white">Password</FormLabel>
                      <InputGroup size="lg">
                        <Input bg="rgba(255, 255, 255, 0.1)" color="white" borderColor="gold.500" _placeholder={{ color: "gray.400" }} _hover={{ borderColor: "gold.400" }} _focus={{ borderColor: "gold.500", boxShadow: "0 0 0 1px gold.500" }}
                          type={showPassword ? 'text' : 'password'}
                          value={signInData.password}
                          onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                          placeholder="Enter your password"
                        />
                        <InputRightElement>
                          <IconButton
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                            onClick={() => setShowPassword(!showPassword)}
                            variant="ghost"
                            size="sm"
                          />
                        </InputRightElement>
                      </InputGroup>
                    </FormControl>

                    <HStack justify="space-between" w="full">
                      <Link color="gold.500" fontSize="sm" href="/auth/reset-password">
                        Forgot password?
                      </Link>
                    </HStack>

                    <Button
                      type="submit"
                      colorScheme="gold"
                      size="lg"
                      width="full"
                      isLoading={isLoading}
                      loadingText="Signing in..."
                    >
                      Sign In
                    </Button>
                  </VStack>
                </form>
              ) : (
                // Sign Up Form
                <form onSubmit={handleSignUp}>
                  <VStack spacing={4}>
                    <FormControl isRequired isInvalid={errors.name}>
                      <FormLabel color="white">Full Name</FormLabel>
                      <Input bg="rgba(255, 255, 255, 0.1)" color="white" borderColor="gold.500" _placeholder={{ color: "gray.400" }} _hover={{ borderColor: "gold.400" }} _focus={{ borderColor: "gold.500", boxShadow: "0 0 0 1px gold.500" }}
                        value={signUpData.name}
                        onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                        placeholder="John Doe"
                        size="lg"
                      />
                      <FormErrorMessage>{errors.name}</FormErrorMessage>
                    </FormControl>

                    <FormControl isRequired isInvalid={errors.email}>
                      <FormLabel color="white">Email</FormLabel>
                      <Input bg="rgba(255, 255, 255, 0.1)" color="white" borderColor="gold.500" _placeholder={{ color: "gray.400" }} _hover={{ borderColor: "gold.400" }} _focus={{ borderColor: "gold.500", boxShadow: "0 0 0 1px gold.500" }}
                        type="email"
                        value={signUpData.email}
                        onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                        placeholder="your@email.com"
                        size="lg"
                      />
                      <FormErrorMessage>{errors.email}</FormErrorMessage>
                    </FormControl>

                    <FormControl>
                      <FormLabel color="white">Phone (optional)</FormLabel>
                      <Input bg="rgba(255, 255, 255, 0.1)" color="white" borderColor="gold.500" _placeholder={{ color: "gray.400" }} _hover={{ borderColor: "gold.400" }} _focus={{ borderColor: "gold.500", boxShadow: "0 0 0 1px gold.500" }}
                        type="tel"
                        value={signUpData.phone}
                        onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                        placeholder="+1 (555) 123-4567"
                        size="lg"
                      />
                    </FormControl>

                    <FormControl isRequired isInvalid={errors.password}>
                      <FormLabel color="white">Password</FormLabel>
                      <InputGroup size="lg">
                        <Input bg="rgba(255, 255, 255, 0.1)" color="white" borderColor="gold.500" _placeholder={{ color: "gray.400" }} _hover={{ borderColor: "gold.400" }} _focus={{ borderColor: "gold.500", boxShadow: "0 0 0 1px gold.500" }}
                          type={showPassword ? 'text' : 'password'}
                          value={signUpData.password}
                          onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                          placeholder="Minimum 8 characters"
                        />
                        <InputRightElement>
                          <IconButton
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                            onClick={() => setShowPassword(!showPassword)}
                            variant="ghost"
                            size="sm"
                          />
                        </InputRightElement>
                      </InputGroup>
                      <FormErrorMessage>{errors.password}</FormErrorMessage>
                    </FormControl>

                    <FormControl isRequired isInvalid={errors.confirmPassword}>
                      <FormLabel color="white">Confirm Password</FormLabel>
                      <InputGroup size="lg">
                        <Input bg="rgba(255, 255, 255, 0.1)" color="white" borderColor="gold.500" _placeholder={{ color: "gray.400" }} _hover={{ borderColor: "gold.400" }} _focus={{ borderColor: "gold.500", boxShadow: "0 0 0 1px gold.500" }}
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={signUpData.confirmPassword}
                          onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                          placeholder="Re-enter your password"
                        />
                        <InputRightElement>
                          <IconButton
                            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                            icon={showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            variant="ghost"
                            size="sm"
                          />
                        </InputRightElement>
                      </InputGroup>
                      <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
                    </FormControl>

                    <Button
                      type="submit"
                      colorScheme="gold"
                      size="lg"
                      width="full"
                      isLoading={isLoading}
                      loadingText="Creating account..."
                    >
                      Create Account
                    </Button>

                    <Text fontSize="xs" color="gray.300" textAlign="center">
                      By creating an account, you agree to our Terms of Service and Privacy Policy
                    </Text>
                  </VStack>
                </form>
              )}
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  )
}