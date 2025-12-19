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

  // LUSANO-STYLE COORDINATE MAPPING
  // Canvas es 250% (2.5x viewport)
  // Mouse position directly maps to canvas position with smooth spring animation
  // Center (50%, 50%) → Canvas at (-75%, -75%)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Smooth spring animation for grid movement
  // Damping: 30 (more resistance = smoother)
  // Stiffness: 120 (lower = slower, more fluid)
  const gridX = useSpring(mouseX, { damping: 30, stiffness: 120 })
  const gridY = useSpring(mouseY, { damping: 30, stiffness: 120 })

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

  // LUSANO-STYLE COORDINATE MAPPING
  // Maps mouse position to fixed canvas coordinates
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    
    // Get mouse position relative to viewport (0-1)
    const mousePercentX = (e.clientX - rect.left) / rect.width
    const mousePercentY = (e.clientY - rect.top) / rect.height

    // Map to canvas position
    // Canvas is 250% (2.5x viewport), so overflow is 150%
    // Formula: targetPosition = -(mousePercent * 1.5 * viewportSize)
    // When mouse is at 50% → canvas at -75% (centered)
    const targetX = -(mousePercentX * 1.5 * rect.width)
    const targetY = -(mousePercentY * 1.5 * rect.height)

    // Update motion values (spring will animate smoothly)
    mouseX.set(targetX)
    mouseY.set(targetY)
  }

  // No handleMouseLeave needed - spring continues smoothly to target position

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-white overflow-hidden"
      onMouseMove={handleMouseMove}
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
              // STRATEGIC MANUAL DISTRIBUTION - 24 positions covering entire 250% canvas
              // Cobertura completa: 4 esquinas + 4 bordes + cuadrantes intermedios
              const chaosPositions = [
                // 🔴 4 ESQUINAS (extremos del canvas)
                { top: 8, left: 6 },     // Superior-izquierda
                { top: 12, left: 88 },   // Superior-derecha
                { top: 85, left: 8 },    // Inferior-izquierda
                { top: 88, left: 86 },   // Inferior-derecha

                // 🟠 4 BORDES CENTRALES
                { top: 6, left: 48 },    // Arriba-centro
                { top: 90, left: 50 },   // Abajo-centro
                { top: 48, left: 5 },    // Izquierda-centro
                { top: 45, left: 92 },   // Derecha-centro

                // 🟡 CUADRANTE SUPERIOR-IZQUIERDO (4 productos)
                { top: 18, left: 15 },
                { top: 25, left: 28 },
                { top: 32, left: 12 },
                { top: 35, left: 32 },

                // 🟢 CUADRANTE SUPERIOR-DERECHO (4 productos)
                { top: 15, left: 62 },
                { top: 22, left: 75 },
                { top: 28, left: 58 },
                { top: 38, left: 72 },

                // 🔵 CUADRANTE INFERIOR-IZQUIERDO (4 productos)
                { top: 58, left: 18 },
                { top: 65, left: 8 },
                { top: 72, left: 25 },
                { top: 78, left: 15 },

                // 🟣 CUADRANTE INFERIOR-DERECHO (4 productos)
                { top: 62, left: 68 },
                { top: 68, left: 82 },
                { top: 75, left: 58 },
                { top: 82, left: 72 },
              ]
              
              // Variable heights con más rango (250-500px) para más caos visual
              const heights = [320, 400, 280, 450, 350, 380, 300, 480, 360, 420, 290, 460, 340, 500, 310, 440, 330, 470, 370, 490, 260, 430, 390, 410]
              
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