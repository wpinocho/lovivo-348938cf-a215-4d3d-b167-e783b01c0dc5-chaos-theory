import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

/**
 * ARTIST PROCESS
 * Split-screen layout with parallax scrolling
 */
export const ArtistProcess = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Parallax: image scrolls faster than container
  const imageY = useTransform(scrollYProgress, [0, 1], ['-20%', '20%']);

  return (
    <section ref={containerRef} className="relative py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="border-b border-black/10 pb-6">
              <h2 className="text-5xl md:text-6xl font-serif font-bold tracking-tight text-black">
                The Drip<br />Technique
              </h2>
            </div>

            <div className="space-y-6 text-black/70 font-sans leading-relaxed">
              <p className="text-lg">
                A revolutionary method pioneered by Jackson Pollock in the late 1940s, 
                the drip technique abandoned traditional brushwork in favor of pure gestural abstraction.
              </p>

              <p>
                Paint is poured, dripped, and thrown onto canvas laid flat on the floor, 
                allowing the artist to work from all angles. The resulting compositions 
                capture spontaneous movement frozen in time—a visual representation of 
                controlled chaos.
              </p>

              <p className="text-sm tracking-[0.2em] uppercase text-black/50 pt-4">
                "I am nature" — Jackson Pollock, 1950
              </p>
            </div>

            {/* Process Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-black/5">
              <div>
                <div className="text-3xl font-serif font-bold text-black">8</div>
                <div className="text-xs tracking-[0.2em] uppercase text-black/50 mt-1">
                  Pieces
                </div>
              </div>
              <div>
                <div className="text-3xl font-serif font-bold text-black">1/1</div>
                <div className="text-xs tracking-[0.2em] uppercase text-black/50 mt-1">
                  Edition
                </div>
              </div>
              <div>
                <div className="text-3xl font-serif font-bold text-black">2024</div>
                <div className="text-xs tracking-[0.2em] uppercase text-black/50 mt-1">
                  Series
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Parallax Image */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative h-[600px] overflow-hidden"
          >
            <motion.div
              style={{ y: imageY }}
              className="w-full h-[120%] relative"
            >
              <img
                src="https://images.unsplash.com/photo-1549887534-1541e9326642?w=800&h=1000&fit=crop"
                alt="Abstract expressionism process"
                className="w-full h-full object-cover"
              />
              {/* Subtle overlay */}
              <div className="absolute inset-0 bg-black/5" />
            </motion.div>

            {/* Hairline border */}
            <div className="absolute inset-0 border border-black/10 pointer-events-none" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};