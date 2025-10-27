/**
 * Luxury Animation Utilities for RemySales Diamond Store
 * Elegant, refined animations with gold accents and smooth transitions
 */

import { Variants, Transition } from 'framer-motion'

// Check if user prefers reduced motion
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Luxury timing functions - slow, graceful, premium
export const luxuryTransition: Transition = {
  duration: 0.5,
  ease: [0.4, 0, 0.2, 1], // Custom cubic-bezier for smooth luxury feel
}

export const quickTransition: Transition = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1],
}

export const slowTransition: Transition = {
  duration: 0.7,
  ease: [0.4, 0, 0.2, 1],
}

// Fade in + Slide up animation (for scroll-triggered elements)
export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: luxuryTransition,
  },
}

// Fade in only (for modals and overlays)
export const fadeIn: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: quickTransition,
  },
}

// Scale + Fade for luxury modal entrance
export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: luxuryTransition,
  },
}

// Stagger children animations for lists
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

// Product card hover animation variants
export const productCardHover: Variants = {
  initial: {
    y: 0,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 4px 16px rgba(212, 175, 55, 0.15)',
  },
  hover: {
    y: -8,
    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.5), 0 8px 32px rgba(212, 175, 55, 0.35), 0 0 60px rgba(212, 175, 55, 0.3)',
    transition: luxuryTransition,
  },
}

// Button press animation
export const buttonPress: Variants = {
  initial: { scale: 1 },
  tap: {
    scale: 0.97,
    transition: { duration: 0.1 },
  },
  hover: {
    scale: 1.02,
    transition: quickTransition,
  },
}

// Cart icon bounce animation
export const cartBounce: Variants = {
  idle: {
    scale: 1,
  },
  bounce: {
    scale: [1, 1.3, 0.9, 1.1, 1],
    transition: {
      duration: 0.6,
      ease: 'easeInOut',
    },
  },
}

// Golden glow pulse effect
export const goldenGlow: Variants = {
  initial: {
    filter: 'drop-shadow(0 0 0px rgba(212, 175, 55, 0))',
  },
  glow: {
    filter: [
      'drop-shadow(0 0 0px rgba(212, 175, 55, 0))',
      'drop-shadow(0 0 20px rgba(212, 175, 55, 0.6))',
      'drop-shadow(0 0 0px rgba(212, 175, 55, 0))',
    ],
    transition: {
      duration: 0.8,
      ease: 'easeInOut',
    },
  },
}

// Slide in from left (for drawers/sidebars)
export const slideInLeft: Variants = {
  hidden: {
    x: '-100%',
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: luxuryTransition,
  },
}

// Slide in from right (for drawers/sidebars)
export const slideInRight: Variants = {
  hidden: {
    x: '100%',
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: luxuryTransition,
  },
}

// Backdrop blur fade
export const backdropFade: Variants = {
  hidden: {
    opacity: 0,
    backdropFilter: 'blur(0px)',
  },
  visible: {
    opacity: 1,
    backdropFilter: 'blur(8px)',
    transition: quickTransition,
  },
}

// Hero section animations
export const heroTitle: Variants = {
  hidden: {
    opacity: 0,
    y: 60,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      ...slowTransition,
      delay: 0.2,
    },
  },
}

export const heroSubtitle: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      ...slowTransition,
      delay: 0.4,
    },
  },
}

// Get animation variants based on reduced motion preference
export const getAnimationVariants = (variants: Variants): Variants => {
  if (prefersReducedMotion()) {
    // Return simplified variants with no motion, just opacity
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    }
  }
  return variants
}
