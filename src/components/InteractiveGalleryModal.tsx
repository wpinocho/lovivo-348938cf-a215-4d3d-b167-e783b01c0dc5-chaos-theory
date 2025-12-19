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
  // Canvas: Width 180% (1.8x), Height 220% (2.2x) - Optimizado para 8 productos + padding inferior
  // Mouse position directly maps to canvas position with smooth spring animation
  // Center (50%, 50%) → Canvas at (-40% X, -60% Y)
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
    // Canvas X: 180% (overflow 80%) → targetX = -(mousePercent * 0.8 * viewportSize)
    // Canvas Y: 220% (overflow 120%) → targetY = -(mousePercent * 1.2 * viewportSize)
    // When mouse at (50%, 50%) → canvas at (-40%, -60%) [CENTERED]
    const targetX = -(mousePercentX * 0.8 * rect.width)
    const targetY = -(mousePercentY * 1.2 * rect.height)

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
        className="absolute inset-0 w-[180%] h-[220%] relative"
      >
        {loading ? (
          <div className="text-center">
            <p className="text-sm tracking-[0.2em] uppercase text-black/40">Loading Gallery...</p>
          </div>
        ) : (
          <div className="relative w-full h-full">
            {products.map((product, index) => {
              // OPTIMIZED DISTRIBUTION FOR 8 PRODUCTS (180% width x 220% height)
              // Área segura: X [12-88%], Y [12-76%] (padding 154px para productos de hasta 440px)
              // Separación vertical MAYOR: ~24-27% entre filas (sin encimados)
              // Cobertura COMPLETA: 3 filas (Superior, Media, Inferior) x (Izq-Centro-Der)
              const chaosPositions = [
                { top: 15, left: 15 },   // 1️⃣ Fila SUPERIOR-izquierda (15%)
                { top: 18, left: 50 },   // 2️⃣ Fila SUPERIOR-CENTRO (18%)
                { top: 20, left: 80 },   // 3️⃣ Fila SUPERIOR-derecha (20%) - SEPARACIÓN 5% con No.1
                { top: 42, left: 22 },   // 4️⃣ Fila MEDIA-izquierda (42%) - +22-27% desde fila 1
                { top: 47, left: 72 },   // 5️⃣ Fila MEDIA-derecha (47%)
                { top: 68, left: 18 },   // 6️⃣ Fila INFERIOR-izquierda (68%) - +21-26% desde fila 2
                { top: 70, left: 55 },   // 7️⃣ Fila INFERIOR-CENTRO (70%)
                { top: 73, left: 78 },   // 8️⃣ Fila INFERIOR-derecha (73%) - Padding 154px desde bottom
              ]
              
              // Heights variadas para 8 productos (350-440px)
              const heights = [380, 420, 350, 400, 440, 370, 410, 390]
              
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
                    width: '220px',
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