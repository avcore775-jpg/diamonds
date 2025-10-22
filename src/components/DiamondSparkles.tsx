'use client'

import { useEffect, useRef } from 'react'

interface Sparkle {
  x: number
  y: number
  delay: number
  duration: number
}

export function DiamondSparkles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Generate sparkles - elegant diamond reflections
    const sparkles: Sparkle[] = []
    const sparkleCount = 55 // Subtle amount of sparkles

    for (let i = 0; i < sparkleCount; i++) {
      sparkles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        delay: Math.random() * 14000, // Random start time (0-14 seconds)
        duration: 7000, // 7 seconds fade in/out cycle
      })
    }

    let startTime = Date.now()

    const animate = () => {
      const currentTime = Date.now()
      const elapsed = currentTime - startTime

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw sparkles
      sparkles.forEach((sparkle) => {
        const cycleTime = (elapsed + sparkle.delay) % (sparkle.duration * 2)
        let opacity = 0

        if (cycleTime < sparkle.duration) {
          // Fade in
          opacity = cycleTime / sparkle.duration
        } else {
          // Fade out
          opacity = 1 - (cycleTime - sparkle.duration) / sparkle.duration
        }

        // Make it more subtle - max opacity 0.6
        opacity = opacity * 0.6

        // Draw golden sparkle
        const gradient = ctx.createRadialGradient(
          sparkle.x,
          sparkle.y,
          0,
          sparkle.x,
          sparkle.y,
          3
        )
        gradient.addColorStop(0, `rgba(212, 175, 55, ${opacity})`) // Gold center
        gradient.addColorStop(0.5, `rgba(212, 175, 55, ${opacity * 0.5})`)
        gradient.addColorStop(1, `rgba(212, 175, 55, 0)`)

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(sparkle.x, sparkle.y, 3, 0, Math.PI * 2)
        ctx.fill()
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: '#000000' }}
    />
  )
}
