'use client'

import React from 'react'
import NextLink from 'next/link'
import NextImage from 'next/image'
import { Box, Button } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { buttonPress, getAnimationVariants } from '@/lib/animations'

const MotionBox = motion(Box)
const MotionButton = motion(Button)

interface CategoryTile {
  name: string
  image: string
  link: string
}

const categories: CategoryTile[] = [
  {
    name: 'Rings',
    image: '/images/mixHomepage/pexels-say-straight-1400349-2735981.jpg',
    link: '/catalog?category=rings',
  },
  {
    name: 'Necklaces',
    image: '/images/mixHomepage/Web_Flip-WinterLaunch_x1100 (1).jpg',
    link: '/catalog?category=necklaces',
  },
  {
    name: 'Earrings',
    image: '/images/mixHomepage/pexels-say-straight-1400349-2735970.jpg',
    link: '/catalog?category=earrings',
  },
  {
    name: 'Bracelets',
    image: '/images/mixHomepage/pexels-pixabay-265906.jpg',
    link: '/catalog?category=bracelets',
  },
]

export default function CategoryTiles() {
  return (
    <Box
      bg="black"
      w="100vw"
      position="relative"
      left="50%"
      right="50%"
      ml="-50vw"
      mr="-50vw"
      h={{ base: 'auto', md: '100vh' }}
      minH={{ base: '100vh', md: 'auto' }}
      display={{ base: 'grid', md: 'flex' }}
      gridTemplateColumns={{ base: '1fr 1fr', md: 'none' }}
      gridTemplateRows={{ base: '1fr 1fr', md: 'none' }}
      flexDirection={{ base: 'column', md: 'row' }}
    >
        {categories.map((category, index) => (
          <MotionBox
            key={category.name}
            position="relative"
            flex={{ base: 'none', md: '1' }}
            h={{ base: '50vh', md: '100%' }}
            overflow="hidden"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            borderRight={{ base: 'none', md: index < categories.length - 1 ? "2px solid" : undefined }}
            borderBottom={{ base: index < 2 ? "2px solid" : undefined, md: 'none' }}
            borderColor="rgba(255, 255, 255, 0.5)"
          >
            {/* Background Image */}
            <NextImage
              src={category.image}
              alt={category.name}
              fill
              style={{ objectFit: 'cover' }}
              sizes="100vw"
              priority={index < 2}
            />

            {/* Dark Overlay */}
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bg="rgba(0, 0, 0, 0.1)"
              zIndex={1}
            />

            {/* Bottom-Centered Button */}
            <Box
              position="absolute"
              bottom={{ base: 4, md: 6, lg: 8 }}
              left="50%"
              transform="translateX(-50%)"
              zIndex={2}
            >
              <MotionButton
                as={NextLink}
                href={category.link}
                size="lg"
                bg="white"
                color="black"
                px={{ base: 8, md: 12 }}
                py={{ base: 4, md: 5 }}
                fontSize={{ base: 'md', md: 'lg' }}
                fontWeight="bold"
                borderRadius="md"
                textTransform="uppercase"
                letterSpacing="wide"
                variants={getAnimationVariants(buttonPress)}
                whileHover="hover"
                whileTap="tap"
                transition="all 0.3s ease-in-out"
                _hover={{
                  bg: 'gold.500',
                  color: 'white',
                  transform: 'scale(1.05)',
                }}
              >
                {category.name}
              </MotionButton>
            </Box>
          </MotionBox>
        ))}
    </Box>
  )
}
