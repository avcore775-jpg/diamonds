'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useToast,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Divider,
  Avatar,
  IconButton,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react'
import { FaEdit, FaCheck, FaTimes, FaUser, FaEnvelope, FaPhone, FaCalendar, FaShield } from 'react-icons/fa'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'

interface UserProfile {
  id: string
  name: string | null
  email: string
  phone: string | null
  createdAt: string
  emailVerified: string | null
  role: string
  isActive: boolean
  lastLogin: string | null
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const toast = useToast()
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  })
  
  const [errors, setErrors] = useState<any>({})

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/account')
    }
  }, [status, router])

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user?.id) return
      
      try {
        const response = await fetch('/api/users/me')
        if (response.ok) {
          const data = await response.json()
          setProfile(data)
          setFormData({
            name: data.name || '',
            phone: data.phone || '',
          })
        } else {
          throw new Error('Failed to fetch profile')
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load profile data',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchProfile()
    }
  }, [session, toast])

  const handleEdit = () => {
    setEditing(true)
    setErrors({})
  }

  const handleCancel = () => {
    setEditing(false)
    setFormData({
      name: profile?.name || '',
      phone: profile?.phone || '',
    })
    setErrors({})
  }

  const handleSave = async () => {
    setSaving(true)
    setErrors({})

    // Validation
    const newErrors: any = {}
    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setSaving(false)
      return
    }

    try {
      const response = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(updatedProfile)
        setEditing(false)
        toast({
          title: 'Success',
          description: 'Profile updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Header />
        <Container maxW="4xl" py={8}>
          <VStack spacing={4}>
            <Spinner size="xl" />
            <Text>Loading profile...</Text>
          </VStack>
        </Container>
      </Box>
    )
  }

  if (status === 'unauthenticated') {
    return null // Will redirect
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <Header />
      
      <Container maxW="4xl" py={8}>
        <VStack spacing={6} align="stretch">
          {/* Page Header */}
          <Box>
            <Heading size="lg" mb={2}>My Profile</Heading>
            <Text color="gray.600">Manage your account information and preferences</Text>
          </Box>

          {/* Profile Card */}
          <Card>
            <CardHeader>
              <HStack justify="space-between" align="center">
                <HStack spacing={4}>
                  <Avatar size="lg" name={profile?.name || profile?.email} />
                  <VStack align="start" spacing={1}>
                    <Heading size="md">{profile?.name || 'No name set'}</Heading>
                    <Text color="gray.600">{profile?.email}</Text>
                    <HStack>
                      <Badge colorScheme={profile?.role === 'ADMIN' ? 'red' : 'blue'}>
                        {profile?.role}
                      </Badge>
                      {profile?.emailVerified && (
                        <Badge colorScheme="green" variant="subtle">
                          <HStack spacing={1}>
                            <FaShield size="10" />
                            <Text>Verified</Text>
                          </HStack>
                        </Badge>
                      )}
                    </HStack>
                  </VStack>
                </HStack>
                
                {!editing ? (
                  <Button
                    leftIcon={<FaEdit />}
                    colorScheme="brand"
                    variant="outline"
                    onClick={handleEdit}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <HStack>
                    <IconButton
                      aria-label="Save"
                      icon={<FaCheck />}
                      colorScheme="green"
                      isLoading={saving}
                      onClick={handleSave}
                    />
                    <IconButton
                      aria-label="Cancel"
                      icon={<FaTimes />}
                      variant="outline"
                      onClick={handleCancel}
                      disabled={saving}
                    />
                  </HStack>
                )}
              </HStack>
            </CardHeader>

            <CardBody>
              <VStack spacing={6} align="stretch">
                {/* Personal Information */}
                <Box>
                  <Heading size="sm" mb={4}>Personal Information</Heading>
                  <VStack spacing={4} align="stretch">
                    <FormControl isInvalid={errors.name}>
                      <FormLabel>
                        <HStack>
                          <FaUser />
                          <Text>Full Name</Text>
                        </HStack>
                      </FormLabel>
                      {editing ? (
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Enter your full name"
                        />
                      ) : (
                        <Text py={2} px={3} bg="gray.50" rounded="md">
                          {profile?.name || 'Not set'}
                        </Text>
                      )}
                      <FormErrorMessage>{errors.name}</FormErrorMessage>
                    </FormControl>

                    <FormControl>
                      <FormLabel>
                        <HStack>
                          <FaEnvelope />
                          <Text>Email Address</Text>
                        </HStack>
                      </FormLabel>
                      <Text py={2} px={3} bg="gray.50" rounded="md">
                        {profile?.email}
                      </Text>
                      <Text fontSize="sm" color="gray.500" mt={1}>
                        Email cannot be changed. Contact support if needed.
                      </Text>
                    </FormControl>

                    <FormControl>
                      <FormLabel>
                        <HStack>
                          <FaPhone />
                          <Text>Phone Number</Text>
                        </HStack>
                      </FormLabel>
                      {editing ? (
                        <Input
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="Enter your phone number"
                          type="tel"
                        />
                      ) : (
                        <Text py={2} px={3} bg="gray.50" rounded="md">
                          {profile?.phone || 'Not set'}
                        </Text>
                      )}
                    </FormControl>
                  </VStack>
                </Box>

                <Divider />

                {/* Account Information */}
                <Box>
                  <Heading size="sm" mb={4}>Account Information</Heading>
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between">
                      <HStack>
                        <FaCalendar />
                        <Text fontWeight="medium">Member Since</Text>
                      </HStack>
                      <Text>
                        {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                      </Text>
                    </HStack>

                    <HStack justify="space-between">
                      <Text fontWeight="medium">Email Verified</Text>
                      <Badge colorScheme={profile?.emailVerified ? 'green' : 'yellow'}>
                        {profile?.emailVerified ? 'Verified' : 'Pending'}
                      </Badge>
                    </HStack>

                    <HStack justify="space-between">
                      <Text fontWeight="medium">Account Status</Text>
                      <Badge colorScheme={profile?.isActive ? 'green' : 'red'}>
                        {profile?.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </HStack>

                    <HStack justify="space-between">
                      <Text fontWeight="medium">Last Login</Text>
                      <Text>
                        {profile?.lastLogin 
                          ? new Date(profile.lastLogin).toLocaleDateString() 
                          : 'Never'
                        }
                      </Text>
                    </HStack>
                  </VStack>
                </Box>

                {/* Email Verification Alert */}
                {!profile?.emailVerified && (
                  <Alert status="warning">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Email Not Verified!</AlertTitle>
                      <AlertDescription>
                        Please check your email and click the verification link to verify your account.
                      </AlertDescription>
                    </Box>
                  </Alert>
                )}
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  )
}