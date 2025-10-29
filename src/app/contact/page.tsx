'use client'

import { useState } from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Icon,
  Input,
  Textarea,
  Button,
  FormControl,
  FormLabel,
  useToast,
  Divider,
} from '@chakra-ui/react'
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaPaperPlane } from 'react-icons/fa'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function ContactPage() {
  const toast = useToast()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: 'Message Sent!',
        description: 'Thank you for contacting us. We will get back to you within 24 hours.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      })
      setIsSubmitting(false)
    }, 1000)
  }

  const contactInfo = [
    {
      icon: FaPhone,
      title: 'Phone',
      details: '+1 (555) 123-4567',
      subDetails: 'Mon-Sat 10AM-5PM EST',
    },
    {
      icon: FaEnvelope,
      title: 'Email',
      details: 'info@diamondstore.com',
      subDetails: 'We reply within 24 hours',
    },
    {
      icon: FaMapMarkerAlt,
      title: 'Address',
      details: '#203, 221 Victoria St',
      subDetails: 'Toronto, ON M5B 1V4',
    },
    {
      icon: FaClock,
      title: 'Business Hours',
      details: 'Monday - Saturday',
      subDetails: '10:00 AM - 5:00 PM EST',
    },
  ]

  return (
    <Box minH="100vh" bg="black">
      <Header />

      {/* Hero Section */}
      <Box
        bg="black"
        color="white"
        py={{ base: 16, md: 24 }}
      >
        <Container maxW="7xl">
          <VStack spacing={6} textAlign="center">
            <Heading
              fontSize={{ base: '4xl', md: '6xl' }}
              fontWeight="light"
              letterSpacing="wide"
              color="white"
            >
              Contact Us
            </Heading>
            <Text fontSize={{ base: 'lg', md: 'xl' }} maxW="3xl" color="white">
              We're here to help you find the perfect piece or answer any questions
            </Text>
          </VStack>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxW="7xl" py={16}>
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={12}>
          {/* Contact Form */}
          <Box bg="transparent" p={8} borderRadius="lg" boxShadow="lg">
            <VStack spacing={6} align="stretch">
              <VStack spacing={2} align="start">
                <Heading size="lg" fontWeight="300" color="white">
                  Send Us a Message
                </Heading>
                <Text color="white">
                  Fill out the form below and we'll get back to you as soon as possible
                </Text>
              </VStack>

              <form onSubmit={handleSubmit}>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel color="white">Full Name</FormLabel>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      size="lg"
                      color="white"
                      borderColor="gold.500"
                      _hover={{ borderColor: 'gold.600' }}
                      _focus={{ borderColor: 'gold.500', boxShadow: '0 0 0 1px gold.500' }}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel color="white">Email Address</FormLabel>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      size="lg"
                      color="white"
                      borderColor="gold.500"
                      _hover={{ borderColor: 'gold.600' }}
                      _focus={{ borderColor: 'gold.500', boxShadow: '0 0 0 1px gold.500' }}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel color="white">Phone Number</FormLabel>
                    <Input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 123-4567"
                      size="lg"
                      color="white"
                      borderColor="gold.500"
                      _hover={{ borderColor: 'gold.600' }}
                      _focus={{ borderColor: 'gold.500', boxShadow: '0 0 0 1px gold.500' }}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel color="white">Subject</FormLabel>
                    <Input
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="How can we help you?"
                      size="lg"
                      color="white"
                      borderColor="gold.500"
                      _hover={{ borderColor: 'gold.600' }}
                      _focus={{ borderColor: 'gold.500', boxShadow: '0 0 0 1px gold.500' }}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel color="white">Message</FormLabel>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us more about your inquiry..."
                      rows={6}
                      size="lg"
                      color="white"
                      borderColor="gold.500"
                      _hover={{ borderColor: 'gold.600' }}
                      _focus={{ borderColor: 'gold.500', boxShadow: '0 0 0 1px gold.500' }}
                    />
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="blue"
                    size="lg"
                    width="full"
                    leftIcon={<FaPaperPlane />}
                    isLoading={isSubmitting}
                    loadingText="Sending..."
                  >
                    Send Message
                  </Button>
                </VStack>
              </form>
            </VStack>
          </Box>

          {/* Contact Information */}
          <VStack spacing={8} align="stretch">
            <VStack spacing={2} align="start">
              <Heading size="lg" fontWeight="300" color="white">
                Get in Touch
              </Heading>
              <Text color="white">
                Have questions? We'd love to hear from you. Here's how you can reach us.
              </Text>
            </VStack>

            <SimpleGrid columns={1} spacing={6}>
              {contactInfo.map((info, index) => (
                <Box
                  key={index}
                  bg="transparent"
                  p={6}
                  borderRadius="lg"
                  boxShadow="md"
                  transition="all 0.3s"
                  _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                >
                  <HStack spacing={4} align="start">
                    <Icon
                      as={info.icon}
                      boxSize={8}
                      color="gold.500"
                      mt={1}
                    />
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="300" fontSize="lg" color="white">
                        {info.title}
                      </Text>
                      <Text color="white">{info.details}</Text>
                      <Text color="white" fontSize="sm">
                        {info.subDetails}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              ))}
            </SimpleGrid>

            <Divider />

            {/* FAQ Section */}
            <Box bg="rgba(255, 255, 255, 0.05)" p={6} borderRadius="lg" border="1px solid" borderColor="gold.500">
              <VStack spacing={4} align="start">
                <Heading size="md" fontWeight="bold" color="black" bg="white" px={4} py={2} borderRadius="md">
                  Frequently Asked Questions
                </Heading>
                <VStack spacing={3} align="start" width="100%">
                  <Box>
                    <Text fontWeight="bold" color="white">
                      Do you offer custom jewelry design?
                    </Text>
                    <Text color="white" fontSize="sm">
                      Yes! Our expert jewelers can work with you to create a custom piece that perfectly matches your vision.
                    </Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="white">
                      What is your return policy?
                    </Text>
                    <Text color="white" fontSize="sm">
                      We offer a 30-day return policy for all unworn items in original condition.
                    </Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="white">
                      Do you provide diamond certificates?
                    </Text>
                    <Text color="white" fontSize="sm">
                      All our diamonds come with official certifications from leading gemological institutes.
                    </Text>
                  </Box>
                </VStack>
              </VStack>
            </Box>
          </VStack>
        </SimpleGrid>

        {/* Map Section */}
        <Box mt={16}>
          <VStack spacing={4} mb={8}>
            <Heading size="lg" fontWeight="300" color="white">
              Visit Our Showroom
            </Heading>
            <Text color="white" textAlign="center" maxW="2xl">
              Experience our collection in person. Our showroom is open by appointment to provide you with personalized attention.
            </Text>
          </VStack>
          <Box
            bg="gray.200"
            height="400px"
            borderRadius="lg"
            overflow="hidden"
            position="relative"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2886.3557776896173!2d-79.38092682346069!3d43.65510307903573!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89d4cb61ded8ee95%3A0xe7dd8f4c3d3ef179!2sRemy%20Sales!5e0!3m2!1sen!2sus!4v1730219000000!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Box>
        </Box>
      </Container>

      <Footer />
    </Box>
  )
}