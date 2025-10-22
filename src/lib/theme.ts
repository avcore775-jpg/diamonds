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
        fontWeight: '500',
        borderRadius: 'md',
        transition: 'all 0.3s ease',
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
            boxShadow: '0 0 20px rgba(212, 175, 55, 0.6), 0 0 40px rgba(212, 175, 55, 0.3)',
            transform: 'translateY(-2px)',
          },
          _active: {
            transform: 'translateY(0)',
          },
        },
        outline: {
          color: 'white',
          borderColor: 'gold.500',
          border: '2px solid',
          _hover: {
            bg: 'rgba(212, 175, 55, 0.1)',
            boxShadow: '0 0 15px rgba(212, 175, 55, 0.4)',
          },
        },
        ghost: {
          color: 'gold.500',
          _hover: {
            bg: 'rgba(212, 175, 55, 0.1)',
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
          bg: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(10px)',
          border: '1px solid',
          borderColor: 'rgba(212, 175, 55, 0.2)',
          borderRadius: 'lg',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          _hover: {
            borderColor: 'rgba(212, 175, 55, 0.4)',
            boxShadow: '0 0 30px rgba(212, 175, 55, 0.2)',
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
        color: 'white',
        fontWeight: '600',
      },
    },
    Text: {
      baseStyle: {
        color: 'white',
      },
    },
  },
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
})

export default theme
