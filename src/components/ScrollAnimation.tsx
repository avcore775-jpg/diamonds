'use client'

import { ReactNode } from 'react'
import { Box } from '@chakra-ui/react'
import { motion, Variants } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import {
  fadeInUp,
  fadeIn,
  scaleIn,
  slideInLeft,
  slideInRight,
  getAnimationVariants,
} from '@/lib/animations'

const MotionBox = motion(Box)

interface ScrollAnimationProps {
  children: ReactNode
  animation?: 'fade-in' | 'slide-up' | 'scale-in' | 'slide-left' | 'slide-right'
  delay?: number
  duration?: number
  threshold?: number
  triggerOnce?: boolean
}

export function ScrollAnimation({
  children,
  animation = 'slide-up',
  delay = 0,
  duration = 0.5,
  threshold = 0.1,
  triggerOnce = true,
}: ScrollAnimationProps) {
  const [ref, inView] = useInView({
    threshold,
    triggerOnce,
  })

  const getVariants = (): Variants => {
    let baseVariants: Variants

    switch (animation) {
      case 'fade-in':
        baseVariants = fadeIn
        break
      case 'slide-up':
        baseVariants = fadeInUp
        break
      case 'scale-in':
        baseVariants = scaleIn
        break
      case 'slide-left':
        baseVariants = slideInLeft
        break
      case 'slide-right':
        baseVariants = slideInRight
        break
      default:
        baseVariants = fadeInUp
    }

    // Apply custom duration and delay
    return {
      hidden: baseVariants.hidden,
      visible: {
        ...baseVariants.visible,
        transition: {
          duration,
          delay,
          ease: [0.4, 0, 0.2, 1],
        },
      },
    }
  }

  return (
    <MotionBox
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={getAnimationVariants(getVariants())}
    >
      {children}
    </MotionBox>
  )
}
