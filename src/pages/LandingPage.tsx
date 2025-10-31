import { HeroSection } from '@/components/hero-section-1'
import React, { useEffect, useRef } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'

// Beams animation
function createBeam(width: number, height: number) {
  const angle = -35 + Math.random() * 10
  return {
    x: Math.random() * width * 1.5 - width * 0.25,
    y: Math.random() * height * 1.5 - height * 0.25,
    width: 30 + Math.random() * 60,
    length: height * 2.5,
    angle: angle,
    speed: 0.6 + Math.random() * 1.2,
    opacity: 0.12 + Math.random() * 0.16,
    hue: 190 + Math.random() * 70,
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: 0.02 + Math.random() * 0.03,
  }
}

function BeamsBackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const beamsRef = useRef<any[]>([])
  const animationFrameRef = useRef<number>(0)
  const MINIMUM_BEAMS = 12 // Reduced from 20
  const lastFrameTimeRef = useRef<number>(0)
  const TARGET_FPS = 30 // Reduced from 60fps for background animation
  
  // Performance monitoring
  const fpsHistoryRef = useRef<number[]>([])
  const frameTimesRef = useRef<number[]>([])
  const performanceCheckIntervalRef = useRef<number>(0)
  const isDisabledRef = useRef<boolean>(false)
  const [isVisible, setIsVisible] = React.useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return
    
    // Check if device is low-end based on hardware concurrency
    const isLowEndDevice = navigator.hardwareConcurrency <= 4
    const PERFORMANCE_CHECK_INTERVAL = 2000 // Check every 2 seconds
    const MIN_ACCEPTABLE_FPS = isLowEndDevice ? 20 : 25
    const MAX_FRAME_TIME = isLowEndDevice ? 50 : 35 // milliseconds
    
    // Disable beams immediately on very low-end devices
    if (isLowEndDevice && navigator.hardwareConcurrency <= 2) {
      console.log('🔴 Low-end device detected - Beams disabled for optimal performance')
      isDisabledRef.current = true
      setIsVisible(false)
      return
    }

    const updateCanvasSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2) // Cap DPR at 2
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.scale(dpr, dpr)

      const totalBeams = MINIMUM_BEAMS * 1.2 // Reduced multiplier
      beamsRef.current = Array.from({ length: totalBeams }, () =>
        createBeam(canvas.width, canvas.height)
      )
    }

    updateCanvasSize()
    
    // Debounced resize handler
    let resizeTimeout: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(updateCanvasSize, 150)
    }
    window.addEventListener('resize', handleResize)

    function resetBeam(beam: any, index: number, totalBeams: number) {
      if (!canvas) return beam

      const column = index % 3
      const spacing = canvas.width / 3

      beam.y = canvas.height + 100
      beam.x = column * spacing + spacing / 2 + (Math.random() - 0.5) * spacing * 0.5
      beam.width = 100 + Math.random() * 100
      beam.speed = 0.5 + Math.random() * 0.4
      beam.hue = 190 + (index * 70) / totalBeams
      beam.opacity = 0.2 + Math.random() * 0.1
      return beam
    }

    function drawBeam(ctx: CanvasRenderingContext2D, beam: any) {
      ctx.save()
      ctx.translate(beam.x, beam.y)
      ctx.rotate((beam.angle * Math.PI) / 180)

      const pulsingOpacity = beam.opacity * (0.8 + Math.sin(beam.pulse) * 0.2) * 0.85

      // Cache gradient creation by reusing similar gradients
      const gradient = ctx.createLinearGradient(0, 0, 0, beam.length)
      gradient.addColorStop(0, `hsla(${beam.hue}, 85%, 65%, 0)`)
      gradient.addColorStop(0.1, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity * 0.5})`)
      gradient.addColorStop(0.4, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity})`)
      gradient.addColorStop(0.6, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity})`)
      gradient.addColorStop(0.9, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity * 0.5})`)
      gradient.addColorStop(1, `hsla(${beam.hue}, 85%, 65%, 0)`)

      ctx.fillStyle = gradient
      ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length)
      ctx.restore()
    }

    function animate(currentTime: number) {
      if (!canvas || !ctx) return
      
      // If disabled due to poor performance, stop animation
      if (isDisabledRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        return
      }

      // Throttle to target FPS
      const elapsed = currentTime - lastFrameTimeRef.current
      const targetFrameTime = 1000 / TARGET_FPS
      
      if (elapsed < targetFrameTime) {
        animationFrameRef.current = requestAnimationFrame(animate)
        return
      }
      
      // Track actual frame time for performance monitoring
      const actualFrameTime = elapsed
      frameTimesRef.current.push(actualFrameTime)
      if (frameTimesRef.current.length > 30) {
        frameTimesRef.current.shift() // Keep last 30 frames
      }
      
      lastFrameTimeRef.current = currentTime - (elapsed % targetFrameTime)

      // Use solid background color instead of clearRect for better performance
      ctx.fillStyle = 'transparent'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Apply blur only once here, not in CSS
      ctx.filter = 'blur(20px)' // Reduced from 35px

      const totalBeams = beamsRef.current.length
      beamsRef.current.forEach((beam, index) => {
        beam.y -= beam.speed
        beam.pulse += beam.pulseSpeed

        if (beam.y + beam.length < -100) {
          resetBeam(beam, index, totalBeams)
        }

        drawBeam(ctx, beam)
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }
    
    // Performance monitoring function
    function checkPerformance() {
      if (frameTimesRef.current.length < 20) return // Need enough samples
      
      // Calculate average frame time
      const avgFrameTime = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length
      const currentFPS = 1000 / avgFrameTime
      
      // Track FPS history
      fpsHistoryRef.current.push(currentFPS)
      if (fpsHistoryRef.current.length > 10) {
        fpsHistoryRef.current.shift() // Keep last 10 readings
      }
      
      // Check if performance is consistently poor
      if (fpsHistoryRef.current.length >= 5) {
        const avgFPS = fpsHistoryRef.current.reduce((a, b) => a + b, 0) / fpsHistoryRef.current.length
        const poorPerformanceCount = fpsHistoryRef.current.filter(fps => fps < MIN_ACCEPTABLE_FPS).length
        
        // If 60% or more readings are below threshold, disable beams
        if (poorPerformanceCount >= 3 || avgFrameTime > MAX_FRAME_TIME) {
          console.warn('⚠️ Poor performance detected - Disabling beams animation')
          console.log(`Average FPS: ${avgFPS.toFixed(1)}, Frame Time: ${avgFrameTime.toFixed(1)}ms`)
          isDisabledRef.current = true
          setIsVisible(false)
          
          // Clear canvas
          if (ctx && canvas) {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
          }
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate)
    
    // Start performance monitoring
    performanceCheckIntervalRef.current = window.setInterval(checkPerformance, PERFORMANCE_CHECK_INTERVAL)

    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(resizeTimeout)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (performanceCheckIntervalRef.current) {
        clearInterval(performanceCheckIntervalRef.current)
      }
    }
  }, [])

  // Don't render canvas if performance monitoring disabled it
  if (!isVisible) {
    return null
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ willChange: 'auto' }} // Removed extra CSS blur
    />
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as { code?: string }

  // Handle Discord OAuth callback
  useEffect(() => {
    const code = search.code
    if (code) {
      // Redirect to login page with the code for authentication
      navigate({ to: '/login', search: { code } })
    }
  }, [search.code, navigate])

  useEffect(() => {
    // Hide scrollbar on mount
    document.documentElement.style.scrollbarWidth = 'none'
    // @ts-ignore - msOverflowStyle is not in TS types but exists in IE/Edge
    document.documentElement.style.msOverflowStyle = 'none'
    document.body.style.overflow = 'overlay'
    
    // Add webkit scrollbar hiding
    const style = document.createElement('style')
    style.innerHTML = `
      html::-webkit-scrollbar { display: none !important; width: 0 !important; }
      body::-webkit-scrollbar { display: none !important; width: 0 !important; }
    `
    document.head.appendChild(style)
    
    // Restore scrollbar on unmount
    return () => {
      document.documentElement.style.scrollbarWidth = ''
      // @ts-ignore - msOverflowStyle is not in TS types but exists in IE/Edge
      document.documentElement.style.msOverflowStyle = ''
      document.body.style.overflow = ''
      document.head.removeChild(style)
    }
  }, [])

  return (
    <div data-landing-page className="overflow-x-hidden">
      <BeamsBackgroundCanvas />
      <HeroSection />
    </div>
  )
}

