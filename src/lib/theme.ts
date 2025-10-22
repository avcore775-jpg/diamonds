import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  colors: {
    brand: {
      50: '#E6FFFE',
      100: '#B3FFFC',
      200: '#80FFF9',
      300: '#4DFFF7',
      400: '#1AFFF4',
      500: '#0ABAB5', // Primary Tiffany color
      600: '#089693',
      700: '#067270',
      800: '#044E4D',
      900: '#022A2A',
    },
  },
  fonts: {
    heading: 'Urbanist, system-ui, sans-serif',
    body: 'Urbanist, system-ui, sans-serif',
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800',
      },
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
      baseStyle: {
        fontWeight: 'medium',
        borderRadius: 'md',
      },
    },
    Card: {
      baseStyle: {
        container: {
          boxShadow: 'sm',
          borderRadius: 'lg',
          overflow: 'hidden',
        },
      },
    },
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
})

export default theme