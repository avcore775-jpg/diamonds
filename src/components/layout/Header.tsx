'use client'

import React from 'react'
import NextLink from 'next/link'
import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Collapse,
  Icon,
  Link,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useColorModeValue,
  useBreakpointValue,
  useDisclosure,
  InputGroup,
  Input,
  InputLeftElement,
  Badge,
  HStack,
  VStack,
  Avatar,
  Divider,
} from '@chakra-ui/react'
import {
  HamburgerIcon,
  CloseIcon,
  ChevronDownIcon,
  SearchIcon,
} from '@chakra-ui/icons'
import { FaShoppingCart, FaHeart, FaUser, FaGem, FaShieldAlt } from 'react-icons/fa'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { apiClient } from '@/lib/api/client'

export default function Header() {
  const { isOpen, onToggle } = useDisclosure()
  const { data: session } = useSession()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = React.useState('')

  // Fetch cart data
  const { data: cart } = useSWR(
    session ? '/api/cart' : null,
    () => apiClient.getCart(),
    { refreshInterval: 5000 }
  )

  const cartItemsCount = cart?.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/')
  }

  return (
    <Box>
      <Flex
        bg={useColorModeValue('white', 'gray.800')}
        color={useColorModeValue('gray.600', 'white')}
        minH={'60px'}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor={useColorModeValue('gray.200', 'gray.900')}
        align={'center'}
      >
        <Flex
          flex={{ base: 1, md: 'auto' }}
          ml={{ base: -2 }}
          display={{ base: 'flex', md: 'none' }}
        >
          <IconButton
            onClick={onToggle}
            icon={
              isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />
            }
            variant={'ghost'}
            aria-label={'Toggle Navigation'}
          />
        </Flex>
        
        <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }} align="center">
          <Link as={NextLink} href="/">
            <HStack spacing={2}>
              <Icon as={FaGem} color="brand.500" boxSize={6} />
              <Text
                textAlign={useBreakpointValue({ base: 'center', md: 'left' })}
                fontFamily={'heading'}
                fontWeight="bold"
                fontSize="xl"
                color={useColorModeValue('gray.800', 'white')}
              >
                Luxe Diamonds
              </Text>
            </HStack>
          </Link>

          <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
            <DesktopNav />
          </Flex>
        </Flex>

        {/* Search Bar */}
        <Box flex="1" maxW="400px" display={{ base: 'none', md: 'block' }} mx={4}>
          <form onSubmit={handleSearch}>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input
                type="text"
                placeholder="Search for jewelry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>
          </form>
        </Box>

        <Stack
          flex={{ base: 1, md: 0 }}
          justify={'flex-end'}
          direction={'row'}
          spacing={6}
          align="center"
        >
          {/* Wishlist */}
          <IconButton
            as={NextLink}
            href="/wishlist"
            aria-label="Wishlist"
            icon={<FaHeart />}
            variant="ghost"
            display={{ base: 'none', md: 'flex' }}
          />

          {/* Cart */}
          <Box position="relative">
            <IconButton
              as={NextLink}
              href="/cart"
              aria-label="Shopping Cart"
              icon={<FaShoppingCart />}
              variant="ghost"
            />
            {cartItemsCount > 0 && (
              <Badge
                position="absolute"
                top="-1"
                right="-1"
                colorScheme="brand"
                borderRadius="full"
                px={2}
                fontSize="xs"
              >
                {cartItemsCount}
              </Badge>
            )}
          </Box>

          {/* Admin Panel Link - Only for ADMIN users */}
          {session?.user?.role === 'ADMIN' && (
            <Button
              as={NextLink}
              href="/admin"
              leftIcon={<FaShieldAlt />}
              variant="outline"
              colorScheme="red"
              size="sm"
              display={{ base: 'none', md: 'flex' }}
            >
              Admin Panel
            </Button>
          )}

          {/* Account Menu - Always visible */}
          <Popover trigger="hover" placement="bottom-end">
            <PopoverTrigger>
              <IconButton
                aria-label="Account"
                icon={session ? <Avatar size={'sm'} name={session.user?.name || session.user?.email || ''} /> : <FaUser />}
                variant="ghost"
                rounded="full"
              />
            </PopoverTrigger>
            <PopoverContent>
              <Box p={2}>
                {session ? (
                  <VStack align="stretch" spacing={2}>
                    <Text px={3} py={2} fontWeight="medium">
                      {session.user?.name || session.user?.email}
                    </Text>
                    {session.user.role === 'ADMIN' && (
                      <Badge colorScheme="red" alignSelf="start" mx={3}>
                        Administrator
                      </Badge>
                    )}
                    <Divider />
                    
                    {/* Admin Panel Link for Mobile */}
                    {session.user.role === 'ADMIN' && (
                      <>
                        <Button 
                          as={NextLink} 
                          href="/admin" 
                          variant="ghost" 
                          justifyContent="flex-start"
                          leftIcon={<FaShieldAlt />}
                          color="red.500"
                        >
                          Admin Panel
                        </Button>
                        <Divider />
                      </>
                    )}
                    
                    <Button as={NextLink} href="/account/profile" variant="ghost" justifyContent="flex-start">
                      My Profile
                    </Button>
                    <Button as={NextLink} href="/account/orders" variant="ghost" justifyContent="flex-start">
                      My Orders
                    </Button>
                    <Button as={NextLink} href="/account/addresses" variant="ghost" justifyContent="flex-start">
                      My Addresses
                    </Button>
                    <Divider />
                    <Button onClick={handleSignOut} variant="ghost" justifyContent="flex-start" width="full">
                      Sign Out
                    </Button>
                  </VStack>
                ) : (
                  <VStack align="stretch" spacing={2}>
                    <Button as={NextLink} href="/account" variant="solid" colorScheme="brand" width="full">
                      Sign In
                    </Button>
                    <Button as={NextLink} href="/account" variant="outline" colorScheme="brand" width="full">
                      Create Account
                    </Button>
                  </VStack>
                )}
              </Box>
            </PopoverContent>
          </Popover>
        </Stack>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav />
      </Collapse>
    </Box>
  )
}

const DesktopNav = () => {
  const linkColor = useColorModeValue('gray.600', 'gray.200')
  const linkHoverColor = useColorModeValue('gray.800', 'white')
  const popoverContentBgColor = useColorModeValue('white', 'gray.800')

  return (
    <Stack direction={'row'} spacing={4}>
      {NAV_ITEMS.map((navItem) => (
        <Box key={navItem.label}>
          <Popover trigger={'hover'} placement={'bottom-start'}>
            <PopoverTrigger>
              <Link
                as={NextLink}
                p={2}
                href={navItem.href ?? '#'}
                fontSize={'sm'}
                fontWeight={500}
                color={linkColor}
                _hover={{
                  textDecoration: 'none',
                  color: linkHoverColor,
                }}
              >
                {navItem.label}
              </Link>
            </PopoverTrigger>

            {navItem.children && (
              <PopoverContent
                border={0}
                boxShadow={'xl'}
                bg={popoverContentBgColor}
                p={4}
                rounded={'xl'}
                minW={'sm'}
              >
                <Stack>
                  {navItem.children.map((child) => (
                    <DesktopSubNav key={child.label} {...child} />
                  ))}
                </Stack>
              </PopoverContent>
            )}
          </Popover>
        </Box>
      ))}
    </Stack>
  )
}

const DesktopSubNav = ({ label, href, subLabel }: NavItem) => {
  return (
    <Link
      as={NextLink}
      href={href}
      role={'group'}
      display={'block'}
      p={2}
      rounded={'md'}
      _hover={{ bg: useColorModeValue('brand.50', 'gray.900') }}
    >
      <Stack direction={'row'} align={'center'}>
        <Box>
          <Text
            transition={'all .3s ease'}
            _groupHover={{ color: 'brand.500' }}
            fontWeight={500}
          >
            {label}
          </Text>
          <Text fontSize={'sm'}>{subLabel}</Text>
        </Box>
        <Flex
          transition={'all .3s ease'}
          transform={'translateX(-10px)'}
          opacity={0}
          _groupHover={{ opacity: '100%', transform: 'translateX(0)' }}
          justify={'flex-end'}
          align={'center'}
          flex={1}
        >
          <Icon color={'brand.500'} w={5} h={5} as={ChevronDownIcon} />
        </Flex>
      </Stack>
    </Link>
  )
}

const MobileNav = () => {
  return (
    <Stack
      bg={useColorModeValue('white', 'gray.800')}
      p={4}
      display={{ md: 'none' }}
    >
      {NAV_ITEMS.map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} />
      ))}
    </Stack>
  )
}

const MobileNavItem = ({ label, children, href }: NavItem) => {
  const { isOpen, onToggle } = useDisclosure()

  return (
    <Stack spacing={4} onClick={children && onToggle}>
      <Flex
        py={2}
        as={Link}
        href={href ?? '#'}
        justify={'space-between'}
        align={'center'}
        _hover={{
          textDecoration: 'none',
        }}
      >
        <Text
          fontWeight={600}
          color={useColorModeValue('gray.600', 'gray.200')}
        >
          {label}
        </Text>
        {children && (
          <Icon
            as={ChevronDownIcon}
            transition={'all .25s ease-in-out'}
            transform={isOpen ? 'rotate(180deg)' : ''}
            w={6}
            h={6}
          />
        )}
      </Flex>

      <Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle={'solid'}
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          align={'start'}
        >
          {children &&
            children.map((child) => (
              <Link key={child.label} as={NextLink} py={2} href={child.href}>
                {child.label}
              </Link>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  )
}

interface NavItem {
  label: string
  subLabel?: string
  children?: Array<NavItem>
  href?: string
}

const NAV_ITEMS: Array<NavItem> = [
  {
    label: 'Collections',
    href: '/collections',
  },
  {
    label: 'Catalog',
    href: '/catalog',
    children: [
      {
        label: 'All Products',
        subLabel: 'Browse our entire collection',
        href: '/catalog',
      },
      {
        label: 'Rings',
        subLabel: 'Engagement & Wedding Rings',
        href: '/catalog?category=rings',
      },
      {
        label: 'Necklaces',
        subLabel: 'Pendants & Chains',
        href: '/catalog?category=necklaces',
      },
      {
        label: 'Earrings',
        subLabel: 'Studs & Drop Earrings',
        href: '/catalog?category=earrings',
      },
      {
        label: 'Bracelets',
        subLabel: 'Tennis & Chain Bracelets',
        href: '/catalog?category=bracelets',
      },
    ],
  },
  {
    label: 'About',
    href: '/about',
  },
  {
    label: 'Contact',
    href: '/contact',
  },
]