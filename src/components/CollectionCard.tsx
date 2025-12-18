import { motion } from 'framer-motion'
import { type Collection } from '@/lib/supabase'

/**
 * COLLECTION CARD - Gallery Frameless Style
 * Minimal design, image-first presentation
 */

interface CollectionCardProps {
  collection: Collection
  onViewProducts: (collectionId: string) => void
}

export const CollectionCard = ({ collection, onViewProducts }: CollectionCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="cursor-pointer"
      onClick={() => onViewProducts(collection.id)}
    >
      {/* Frameless Image */}
      <div className="aspect-[3/4] bg-white overflow-hidden border border-black/5">
        {collection.image ? (
          <img 
            src={collection.image} 
            alt={collection.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-black/20 text-xs tracking-[0.3em] uppercase">
            No Image
          </div>
        )}
      </div>
      
      {/* Minimal Metadata */}
      <div className="mt-4">
        <h3 className="text-xl font-serif font-bold text-black mb-1">
          {collection.name}
        </h3>
        
        {collection.description && (
          <p className="text-sm text-black/60 line-clamp-2 leading-relaxed">
            {collection.description}
          </p>
        )}
        
        <div className="mt-3 text-xs tracking-[0.3em] uppercase text-black/40">
          View Collection →
        </div>
      </div>
    </motion.div>
  )
}