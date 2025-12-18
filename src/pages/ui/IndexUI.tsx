import { ChaosHero } from '@/components/ChaosHero';
import { MasonryGallery } from '@/components/MasonryGallery';
import { ArtistProcess } from '@/components/ArtistProcess';
import { CustomCursor } from '@/components/CustomCursor';
import { FloatingCart } from '@/components/FloatingCart';
import { EcommerceTemplate } from '@/templates/EcommerceTemplate';
import type { UseIndexLogicReturn } from '@/components/headless/HeadlessIndex';

/**
 * CHAOS THEORY - MOMA Gallery Landing Page
 * 
 * High-end, gallery-style interface for Pollock-inspired collection.
 * Design: Intellectual, expensive, avant-garde.
 */

interface IndexUIProps {
  logic: UseIndexLogicReturn;
}

export const IndexUI = ({ logic }: IndexUIProps) => {
  const {
    filteredProducts,
    loading,
  } = logic;

  return (
    <EcommerceTemplate 
      showCart={true}
    >
      {/* Custom Cursor with Ink Trail */}
      <CustomCursor />

      {/* Hero: "The Splash" */}
      <ChaosHero />

      {/* Masonry Gallery Grid */}
      {!loading && filteredProducts.length > 0 && (
        <MasonryGallery products={filteredProducts} />
      )}

      {/* Artist Process Section */}
      <ArtistProcess />

      <FloatingCart />
    </EcommerceTemplate>
  );
};