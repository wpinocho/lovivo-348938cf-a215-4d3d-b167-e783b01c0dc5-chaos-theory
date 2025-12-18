import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * CHAOS HERO - "The Splash"
 * Full-screen hero with interactive paint-bleed typography
 */
interface ChaosHeroProps {
  onGalleryClick?: () => void;
}

export const ChaosHero = ({ onGalleryClick }: ChaosHeroProps) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 20;
    const y = (e.clientY - rect.top - rect.height / 2) / 20;
    mouseX.set(x);
    mouseY.set(y);
  };

  const chaosX = useTransform(mouseX, [-50, 50], [-15, 15]);
  const chaosY = useTransform(mouseY, [-50, 50], [-10, 10]);
  const controlX = useTransform(mouseX, [-50, 50], [10, -10]);
  const controlY = useTransform(mouseY, [-50, 50], [8, -8]);

  return (
    <section 
      className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-white"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Subtle paint drip background placeholder */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-1 h-full bg-black animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute top-0 left-1/2 w-1 h-full bg-black animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute top-0 left-3/4 w-1 h-full bg-black animate-pulse" style={{ animationDuration: '5s' }} />
      </div>

      {/* Main Typography */}
      <div className="relative z-10 text-center">
        <motion.div
          className="relative"
          style={{ x: chaosX, y: chaosY }}
          animate={{
            filter: isHovering 
              ? ['blur(0px)', 'blur(2px)', 'blur(0px)']
              : 'blur(0px)',
            scale: isHovering ? [1, 1.02, 1] : 1,
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h1 className="text-[12vw] font-serif font-bold tracking-tighter leading-none text-black">
            CHAOS
          </h1>
        </motion.div>

        <motion.div
          className="text-4xl md:text-6xl font-serif tracking-[0.3em] text-black/40 my-4"
          style={{ x: controlX, y: controlY }}
        >
          /
        </motion.div>

        <motion.div
          className="relative"
          style={{ x: controlX, y: controlY }}
          animate={{
            filter: isHovering 
              ? ['blur(0px)', 'blur(1.5px)', 'blur(0px)']
              : 'blur(0px)',
            scale: isHovering ? [1, 1.01, 1] : 1,
          }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
        >
          <h1 className="text-[12vw] font-serif font-bold tracking-tighter leading-none text-black">
            CONTROL
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-12 text-sm tracking-[0.2em] uppercase text-black/60 font-sans"
        >
          A Pollock-Inspired Collection
        </motion.p>

        {/* Gallery Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          onClick={onGalleryClick}
          className="mt-8 px-8 py-3 border border-black text-black text-sm tracking-[0.2em] uppercase hover:bg-black hover:text-white transition-all duration-300"
        >
          Gallery
        </motion.button>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2"
      >
        <div className="w-[1px] h-16 bg-black/20 relative overflow-hidden">
          <motion.div
            className="absolute w-full h-8 bg-black/60"
            animate={{ y: [0, 48, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </section>
  );
};