import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '@/lib/supabase';
import { useSettings } from '@/contexts/SettingsContext';

/**
 * MASONRY GALLERY
 * Asymmetrical grid layout mimicking a real gallery wall
 */

interface MasonryGalleryProps {
  products: Product[];
}

export const MasonryGallery = ({ products }: MasonryGalleryProps) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { formatMoney } = useSettings();

  // Masonry column heights (asymmetrical)
  const columnHeights = ['500px', '600px', '550px', '480px'];

  return (
    <section className="relative py-24 px-4 md:px-8 bg-white">
      {/* Section Header */}
      <div className="max-w-7xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="border-b border-black/10 pb-8"
        >
          <h2 className="text-5xl md:text-7xl font-serif font-bold tracking-tight text-black">
            The Collection
          </h2>
          <p className="mt-4 text-sm tracking-[0.2em] uppercase text-black/50 font-sans">
            {products.length} Limited Edition Pieces
          </p>
        </motion.div>
      </div>

      {/* Masonry Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, index) => {
            const isHovered = hoveredId === product.id;
            const isOtherHovered = hoveredId !== null && hoveredId !== product.id;

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative group cursor-pointer"
                style={{ height: columnHeights[index % 4] }}
                onMouseEnter={() => setHoveredId(product.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <Link to={`/products/${product.slug}`} className="block h-full">
                  {/* Artwork Image - Frameless */}
                  <motion.div
                    className="relative w-full h-full overflow-hidden"
                    animate={{
                      scale: isHovered ? 1.05 : 1,
                      opacity: isOtherHovered ? 0.3 : 1,
                    }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  >
                    <img
                      src={product.images?.[0] || '/placeholder.svg'}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />

                    {/* Hover Overlay with Metadata */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isHovered ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 bg-black/80 flex items-end p-6"
                    >
                      <div className="text-white">
                        <h3 className="text-2xl font-serif font-bold mb-2">
                          {product.title}
                        </h3>
                        <p className="text-sm tracking-[0.2em] uppercase text-white/60 mb-3">
                          2024 • Limited Edition
                        </p>
                        <p className="text-xl font-serif">
                          {formatMoney(product.price)}
                        </p>
                        
                        {/* View Piece cursor hint */}
                        <motion.div
                          className="mt-4 text-xs tracking-[0.3em] uppercase text-white/80"
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          View Piece →
                        </motion.div>
                      </div>
                    </motion.div>
                  </motion.div>

                  {/* Hairline border */}
                  <div className="absolute inset-0 border border-black/5 pointer-events-none" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Gallery Note */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6 }}
        className="max-w-7xl mx-auto mt-24 text-center"
      >
        <p className="text-xs tracking-[0.3em] uppercase text-black/40 font-sans">
          Each piece is authenticated and numbered
        </p>
      </motion.div>
    </section>
  );
};