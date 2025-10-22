'use client'

import { useEffect, useRef, ReactNode } from 'react'
import { Box } from '@chakra-ui/react'

interface ScrollAnimationProps {
  children: ReactNode
  animation?: 'fade-in' | 'slide-up' | 'scale-in' | 'slide-left' | 'slide-right'
  delay?: number
  duration?: number
}

export function ScrollAnimation({
  children,
  animation = 'fade-in',
  delay = 0,
  duration = 0.6,
}: ScrollAnimationProps) {
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in')
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current)
      }
    }
  }, [])

  const getAnimationStyles = () => {
    const baseStyle = {
      opacity: 0,
      transition: `all ${duration}s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s`,
    }

    switch (animation) {
      case 'fade-in':
        return baseStyle

      case 'slide-up':
        return {
          ...baseStyle,
          transform: 'translateY(40px)',
        }

      case 'scale-in':
        return {
          ...baseStyle,
          transform: 'scale(0.9)',
        }

      case 'slide-left':
        return {
          ...baseStyle,
          transform: 'translateX(40px)',
        }

      case 'slide-right':
        return {
          ...baseStyle,
          transform: 'translateX(-40px)',
        }

      default:
        return baseStyle
    }
  }

  return (
    <Box
      ref={elementRef}
      className="scroll-animate"
      style={getAnimationStyles()}
      sx={{
        '&.animate-in': {
          opacity: 1,
          transform: 'translateY(0) translateX(0) scale(1)',
        },
      }}
    >
      {children}
    </Box>
  )
}
