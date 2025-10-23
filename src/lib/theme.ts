import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  colors: {
    brand: {
      50: '#FFF9E6',
      100: '#FFEDB3',
      200: '#FFE180',
      300: '#FFD54D',
      400: '#E8C547',
      500: '#D4AF37', // Luxurious Gold
      600: '#B8941F',
      700: '#9C7A15',
      800: '#80600C',
      900: '#644604',
    },
    gold: {
      50: '#FFF9E6',
      100: '#FFEDB3',
      200: '#FFE180',
      300: '#FFD54D',
      400: '#E8C547',
      500: '#D4AF37',
      600: '#B8941F',
      700: '#9C7A15',
      800: '#80600C',
      900: '#644604',
    },
  },
  fonts: {
    heading: 'Urbanist, system-ui, sans-serif',
    body: 'Urbanist, system-ui, sans-serif',
  },
  styles: {
    global: {
      body: {
        bg: '#000000',
        color: '#FFFFFF',
        fontWeight: '300',
      },
      '*': {
        fontWeight: '300',
      },
      '*::placeholder': {
        color: 'rgba(255, 255, 255, 0.4)',
      },
      '*, *::before, &::after': {
        borderColor: 'rgba(212, 175, 55, 0.2)',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: '300',
        borderRadius: 'md',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      },
      variants: {
        solid: {
          bg: 'transparent',
          color: 'gold.500',
          border: '2px solid',
          borderColor: 'gold.500',
          _hover: {
            bg: 'gold.500',
            color: 'black',
            boxShadow: '0 0 25px rgba(212, 175, 55, 0.7), 0 0 50px rgba(212, 175, 55, 0.4), 0 10px 30px rgba(0, 0, 0, 0.3)',
            transform: 'translateY(-4px) scale(1.02)',
          },
          _active: {
            transform: 'translateY(-1px) scale(1)',
          },
        },
        outline: {
          color: 'white',
          borderColor: 'gold.500',
          border: '2px solid',
          _hover: {
            bg: 'rgba(212, 175, 55, 0.15)',
            boxShadow: '0 0 20px rgba(212, 175, 55, 0.5)',
            transform: 'translateY(-3px)',
          },
          _active: {
            transform: 'translateY(-1px)',
          },
        },
        ghost: {
          color: 'gold.500',
          _hover: {
            bg: 'rgba(212, 175, 55, 0.1)',
            transform: 'translateY(-2px)',
          },
          _active: {
            transform: 'translateY(0)',
          },
        },
      },
      defaultProps: {
        variant: 'solid',
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: '#FFFFFF', // White background for product cards
          backdropFilter: 'blur(10px)',
          border: '2px solid',
          borderColor: 'gold.500', // Gold border
          borderRadius: 'lg',
          overflow: 'hidden',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          _hover: {
            borderColor: 'gold.600',
            boxShadow: '0 0 35px rgba(212, 175, 55, 0.4), 0 10px 40px rgba(0, 0, 0, 0.3)',
            transform: 'translateY(-8px) scale(1.02)',
          },
        },
      },
      variants: {
        productCard: {
          container: {
            bg: '#FFFFFF',
            border: '2px solid',
            borderColor: 'gold.500',
            color: '#000000',
            _hover: {
              borderColor: 'gold.600',
              boxShadow: '0 0 35px rgba(212, 175, 55, 0.4), 0 10px 40px rgba(0, 0, 0, 0.3)',
              transform: 'translateY(-8px) scale(1.02)',
            },
          },
        },
      },
    },
    Input: {
      baseStyle: {
        field: {
          bg: 'rgba(255, 255, 255, 0.05)',
          borderColor: 'rgba(212, 175, 55, 0.3)',
          color: 'white',
          _hover: {
            borderColor: 'rgba(212, 175, 55, 0.5)',
          },
          _focus: {
            borderColor: 'gold.500',
            boxShadow: '0 0 0 1px rgba(212, 175, 55, 0.6)',
          },
        },
      },
    },
    Select: {
      baseStyle: {
        field: {
          bg: 'rgba(255, 255, 255, 0.05)',
          borderColor: 'rgba(212, 175, 55, 0.3)',
          color: 'white',
          _hover: {
            borderColor: 'rgba(212, 175, 55, 0.5)',
          },
        },
      },
    },
    Heading: {
      baseStyle: {
         fontWeight: "300",
      },
    },
    Text: {
      baseStyle: {
        // No default color, inherit from parent
      },
    },
    IconButton: {
      baseStyle: {
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      },
      variants: {
        ghost: {
          _hover: {
            transform: 'translateY(-2px) scale(1.05)',
            boxShadow: '0 0 15px rgba(212, 175, 55, 0.3)',
          },
        },
      },
    },
    Link: {
      baseStyle: {
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        _hover: {
          transform: 'translateY(-1px)',
        },
      },
    },
  },
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
})

export default theme
