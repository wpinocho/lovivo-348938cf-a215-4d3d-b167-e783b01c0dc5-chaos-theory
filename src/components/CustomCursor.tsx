import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/**
 * CUSTOM CURSOR
 * Leaves a subtle trail of "digital ink" dots
 */
export const CustomCursor = () => {
  const [trail, setTrail] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 200 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    let lastTrailTime = 0;
    const trailDelay = 50; // milliseconds between trail dots

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);

      const now = Date.now();
      if (now - lastTrailTime > trailDelay) {
        const newDot = {
          x: e.clientX,
          y: e.clientY,
          id: now,
        };

        setTrail((prev) => {
          const updated = [...prev, newDot];
          // Keep only last 8 dots
          return updated.slice(-8);
        });

        lastTrailTime = now;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [cursorX, cursorY]);

  // Auto-fade trail dots
  useEffect(() => {
    if (trail.length > 0) {
      const timer = setTimeout(() => {
        setTrail((prev) => prev.slice(1));
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [trail]);

  return (
    <>
      {/* Main Cursor */}
      <motion.div
        className="fixed top-0 left-0 w-3 h-3 bg-black/20 rounded-full pointer-events-none z-[9999] mix-blend-difference"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%',
        }}
      />

      {/* Ink Trail */}
      {trail.map((dot, index) => (
        <motion.div
          key={dot.id}
          className="fixed top-0 left-0 rounded-full pointer-events-none z-[9998]"
          initial={{
            x: dot.x,
            y: dot.y,
            scale: 1,
            opacity: 0.6,
          }}
          animate={{
            scale: 0,
            opacity: 0,
          }}
          transition={{
            duration: 0.8,
            ease: 'easeOut',
          }}
          style={{
            width: `${4 - index * 0.3}px`,
            height: `${4 - index * 0.3}px`,
            backgroundColor: `rgba(0, 0, 0, ${0.15 - index * 0.015})`,
            translateX: '-50%',
            translateY: '-50%',
          }}
        />
      ))}
    </>
  );
};