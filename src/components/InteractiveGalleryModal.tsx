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

  // Mouse tracking with accumulative movement
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  // Track last mouse position for delta calculation
  const lastMousePos = useRef({ x: 0, y: 0 })
  const isFirstMove = useRef(true)

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
    const sensitivity = 0.8

    // ACCUMULATE movement (inverse parallax: mouse right → grid left)
    const currentX = mouseX.get()
    const currentY = mouseY.get()
    
    mouseX.set(currentX + (-deltaX * sensitivity))
    mouseY.set(currentY + (-deltaY * sensitivity))

    // Update last position for next delta calculation
    lastMousePos.current = { x: clientX, y: clientY }
  }

  const handleMouseLeave = () => {
    // Reset tracking flag, but DON'T move grid back to center
    // Grid stays where it is - user can continue exploring
    isFirstMove.current = true
  }

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
        className="absolute inset-0 w-[400%] h-[400%] flex items-center justify-center"
      >
        {loading ? (
          <div className="text-center">
            <p className="text-sm tracking-[0.2em] uppercase text-black/40">Loading Gallery...</p>
          </div>
        ) : (
          <div className="relative w-full h-full">
            {products.map((product, index) => {
              // Chaotic positioning - dispersed across canvas
              const chaosPositions = [
                { top: 10, left: 8 },    // Top-left corner
                { top: 15, left: 65 },   // Top-right area
                { top: 35, left: 25 },   // Upper-mid left
                { top: 30, left: 85 },   // Upper-mid right edge
                { top: 50, left: 45 },   // Dead center
                { top: 55, left: 15 },   // Mid-left
                { top: 65, left: 72 },   // Lower-mid right
                { top: 75, left: 35 },   // Lower-mid center
                { top: 80, left: 90 },   // Bottom-right corner
                { top: 85, left: 55 },   // Bottom-center
                { top: 40, left: 5 },    // Mid-left edge
                { top: 70, left: 8 },    // Lower-left
              ]
              
              // Variable heights for asymmetric effect
              const heights = [460, 580, 500, 620, 480, 590, 440, 550, 510, 600, 470, 560]
              
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
                    width: '280px',
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