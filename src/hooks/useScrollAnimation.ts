'use client'

import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { useAnimation, AnimationControls } from 'framer-motion'

interface UseScrollAnimationOptions {
  threshold?: number
  triggerOnce?: boolean
  delay?: number
}

export const useScrollAnimation = (
  options: UseScrollAnimationOptions = {}
): [React.RefObject<any>, AnimationControls, boolean] => {
  const {
    threshold = 0.1,
    triggerOnce = true,
    delay = 0,
  } = options

  const controls = useAnimation()
  const [ref, inView] = useInView({
    threshold,
    triggerOnce,
  })

  useEffect(() => {
    if (inView) {
      const timer = setTimeout(() => {
        controls.start('visible')
      }, delay)
      return () => clearTimeout(timer)
    } else if (!triggerOnce) {
      controls.start('hidden')
    }
  }, [controls, inView, delay, triggerOnce])

  return [ref, controls, inView]
}
