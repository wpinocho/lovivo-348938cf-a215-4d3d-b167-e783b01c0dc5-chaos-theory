import { motion, useMotionValue, useSpring } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supabase, type Product } from '@/lib/supabase'
import { STORE_ID } from '@/lib/config'
import { useSettings } from '@/contexts/SettingsContext'

interface InteractiveGalleryModalProps {
  isOpen: boolean
  onClose: () => void
}

export const InteractiveGalleryModal = ({ isOpen, onClose }: InteractiveGalleryModalProps) => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { formatMoney } = useSettings()

  // Mouse tracking with accumulative movement + MOMENTUM
  // Inicializar canvas CENTRADO para permitir movimiento en todas direcciones
  // Canvas es 250% (2.5x viewport), así que -75% lo centra perfectamente
  const mouseX = useMotionValue(-750)
  const mouseY = useMotionValue(-750)
  
  // Track last mouse position for delta calculation
  const lastMousePos = useRef({ x: 0, y: 0 })
  const isFirstMove = useRef(true)
  
  // Track velocity for momentum effect
  const velocity = useRef({ x: 0, y: 0 })
  const momentumFrameRef = useRef<number>()
  const isMouseMoving = useRef(false)
  const mouseStopTimer = useRef<NodeJS.Timeout>()

  // Smooth spring animation for grid movement (OPPOSITE direction)
  const gridX = useSpring(mouseX, { damping: 25, stiffness: 150 })
  const gridY = useSpring(mouseY, { damping: 25, stiffness: 150 })

  useEffect(() => {
    if (isOpen) {
      fetchProducts()
    }
  }, [isOpen])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', STORE_ID)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  // ACCUMULATIVE mouse movement tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clientX = e.clientX - rect.left
    const clientY = e.clientY - rect.top

    // Mark that mouse is moving (stop momentum)
    isMouseMoving.current = true
    if (momentumFrameRef.current) {
      cancelAnimationFrame(momentumFrameRef.current)
    }

    // Clear previous stop timer
    if (mouseStopTimer.current) {
      clearTimeout(mouseStopTimer.current)
    }

    // Skip first move to initialize position
    if (isFirstMove.current) {
      lastMousePos.current = { x: clientX, y: clientY }
      isFirstMove.current = false
      return
    }

    // Calculate delta (difference from last position)
    const deltaX = clientX - lastMousePos.current.x
    const deltaY = clientY - lastMousePos.current.y

    // Sensitivity: how much the grid moves per pixel of mouse movement
    const sensitivity = 1.5

    // Update velocity for momentum effect
    velocity.current = {
      x: -deltaX * sensitivity,
      y: -deltaY * sensitivity
    }

    // ACCUMULATE movement (inverse parallax: mouse right → grid left)
    const currentX = mouseX.get()
    const currentY = mouseY.get()
    
    mouseX.set(currentX + velocity.current.x)
    mouseY.set(currentY + velocity.current.y)

    // Update last position for next delta calculation
    lastMousePos.current = { x: clientX, y: clientY }

    // Detect when mouse stops moving (after 100ms of no movement)
    mouseStopTimer.current = setTimeout(() => {
      isMouseMoving.current = false
      // Start momentum decay
      if (momentumFrameRef.current) {
        cancelAnimationFrame(momentumFrameRef.current)
      }
      momentumFrameRef.current = requestAnimationFrame(applyMomentum)
    }, 100)
  }

  // Momentum decay effect (continues moving after mouse stops)
  const applyMomentum = () => {
    const decay = 0.92 // Decay factor (lower = stops faster)
    const threshold = 0.1 // Stop when velocity is very small

    velocity.current.x *= decay
    velocity.current.y *= decay

    // Check if we should stop (velocity too small)
    if (Math.abs(velocity.current.x) < threshold && Math.abs(velocity.current.y) < threshold) {
      velocity.current = { x: 0, y: 0 }
      return
    }

    // Apply velocity to position
    const currentX = mouseX.get()
    const currentY = mouseY.get()
    
    mouseX.set(currentX + velocity.current.x)
    mouseY.set(currentY + velocity.current.y)

    // Continue animation
    momentumFrameRef.current = requestAnimationFrame(applyMomentum)
  }

  const handleMouseLeave = () => {
    // Reset tracking flag
    isFirstMove.current = true
    isMouseMoving.current = false
    
    // Start momentum decay animation
    if (momentumFrameRef.current) {
      cancelAnimationFrame(momentumFrameRef.current)
    }
    momentumFrameRef.current = requestAnimationFrame(applyMomentum)
  }

  // Cleanup momentum animation and timers on unmount
  useEffect(() => {
    return () => {
      if (momentumFrameRef.current) {
        cancelAnimationFrame(momentumFrameRef.current)
      }
      if (mouseStopTimer.current) {
        clearTimeout(mouseStopTimer.current)
      }
    }
  }, [])

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-white overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-8 right-8 z-10 p-2 hover:bg-black/5 transition-colors rounded-sm"
        aria-label="Close gallery"
      >
        <X className="h-6 w-6" strokeWidth={1} />
      </button>

      {/* Asymmetric Masonry Grid - Moves in OPPOSITE direction of mouse */}
      <motion.div
        style={{
          x: gridX,
          y: gridY,
        }}
        className="absolute inset-0 w-[250%] h-[250%] relative"
      >
        {loading ? (
          <div className="text-center">
            <p className="text-sm tracking-[0.2em] uppercase text-black/40">Loading Gallery...</p>
          </div>
        ) : (
          <div className="relative w-full h-full">
            {products.map((product, index) => {
              // Dense chaotic positioning - 24 positions across canvas 250%
              // More products visible at any time, less empty space
              const chaosPositions = [
                { top: 8, left: 12 },    // Top-left
                { top: 10, left: 45 },   // Top-center
                { top: 6, left: 78 },    // Top-right
                { top: 18, left: 25 },   // Upper-left-center
                { top: 20, left: 62 },   // Upper-right-center
                { top: 15, left: 88 },   // Upper-right edge
                { top: 28, left: 8 },    // Mid-left edge
                { top: 32, left: 38 },   // Mid-left-center
                { top: 30, left: 70 },   // Mid-right-center
                { top: 34, left: 92 },   // Mid-right edge
                { top: 42, left: 18 },   // Center-left
                { top: 45, left: 50 },   // True center
                { top: 48, left: 82 },   // Center-right
                { top: 56, left: 5 },    // Lower-mid-left edge
                { top: 58, left: 32 },   // Lower-mid-left
                { top: 60, left: 65 },   // Lower-mid-right
                { top: 62, left: 90 },   // Lower-mid-right edge
                { top: 70, left: 22 },   // Lower-left
                { top: 72, left: 52 },   // Lower-center
                { top: 68, left: 78 },   // Lower-right
                { top: 80, left: 12 },   // Bottom-left
                { top: 82, left: 42 },   // Bottom-center-left
                { top: 85, left: 72 },   // Bottom-center-right
                { top: 88, left: 88 },   // Bottom-right
              ]
              
              // Compact variable heights (smaller range for denser packing)
              const heights = [320, 380, 340, 420, 360, 400, 350, 440, 370, 460, 330, 410, 390, 450, 365, 425, 355, 435, 375, 480, 345, 415, 385, 470]
              
              const position = chaosPositions[index % chaosPositions.length]
              const height = heights[index % heights.length]

              return (
                <Link
                  key={product.id}
                  to={`/products/${product.slug}`}
                  onClick={onClose}
                  className="group relative overflow-hidden bg-white"
                  style={{
                    position: 'absolute',
                    top: `${position.top}%`,
                    left: `${position.left}%`,
                    width: '200px',
                    height: `${height}px`
                  }}
                >
                  {/* Product Image */}
                  <motion.img
                    src={product.images?.[0] || ''}
                    alt={product.title}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                  />

                  {/* Overlay with info on hover */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white transition-opacity duration-300"
                  >
                    <h3 className="font-serif text-2xl font-bold mb-2">
                      {product.title}
                    </h3>
                    <p className="text-sm tracking-[0.2em] uppercase mb-4 text-white/60">
                      2024
                    </p>
                    <p className="text-xl font-sans">
                      {formatMoney(product.price)}
                    </p>
                  </motion.div>
                </Link>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Instructions at bottom */}
      <div className="absolute bottom-8 left-0 right-0 text-center z-10">
        <p className="text-xs tracking-[0.3em] uppercase text-black/30">
          Move your cursor to explore
        </p>
      </div>
    </motion.div>
  )
}