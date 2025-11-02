'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useInView } from 'react-intersection-observer'

interface TypewriterTextProps {
  text: string
  speed?: number
  delay?: number
  children: (displayText: string, isComplete: boolean) => React.ReactNode
}

const TypewriterText = React.memo(function TypewriterText({
  text,
  speed = 50,
  delay = 0,
  children,
}: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const indexRef = useRef(0)
  const animationFrameRef = useRef<number>()
  const lastUpdateRef = useRef<number>(0)
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  })

  useEffect(() => {
    if (!inView) return

    // Initial delay before starting
    const initialDelay = setTimeout(() => {
      const startTime = performance.now() + delay

      const animate = (currentTime: number) => {
        if (currentTime < startTime) {
          animationFrameRef.current = requestAnimationFrame(animate)
          return
        }

        const elapsed = currentTime - lastUpdateRef.current

        if (elapsed >= speed && indexRef.current < text.length) {
          setDisplayText(text.substring(0, indexRef.current + 1))
          indexRef.current += 1
          lastUpdateRef.current = currentTime
        }

        if (indexRef.current < text.length) {
          animationFrameRef.current = requestAnimationFrame(animate)
        } else {
          setIsComplete(true)
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }, delay)

    return () => {
      clearTimeout(initialDelay)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [inView, text, speed, delay])

  return <div ref={ref}>{children(displayText, isComplete)}</div>
})

export default TypewriterText
