import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AUTH_SLIDE_IMAGES, CAROUSEL_INTERVAL } from "./authCarousel";

export interface AuthSlide {
  tag: string;
  title: string;
  description: string;
}

interface AuthBrandingProps {
  slides: AuthSlide[];
  interval?: number;
}

/**
 * Optimized Branding Carousel for Auth pages.
 * Prioritizes GPU-accelerated transforms and memoization for smooth performance on all devices.
 */
export const AuthBranding: React.FC<AuthBrandingProps> = ({
  slides,
  interval = CAROUSEL_INTERVAL
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-play carousel
  useEffect(() => {
    if (!AUTH_SLIDE_IMAGES.length) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % AUTH_SLIDE_IMAGES.length);
    }, interval);

    return () => clearInterval(timer);
  }, [interval]);

  const handleSlideChange = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  const totalImages = AUTH_SLIDE_IMAGES.length;

  // Memoize active slide content to prevent recalculation
  const activeSlide = useMemo(() => 
    slides[currentSlide % slides.length], 
    [slides, currentSlide]
  );

  if (!totalImages || !slides || slides.length === 0) {
    return null;
  }

  return (
    <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 p-4 lg:p-6 items-center justify-center bg-transparent self-stretch overflow-hidden relative z-10">
      <div className="relative w-full h-full rounded-[1.2rem] overflow-hidden bg-slate-900 shadow-xl min-h-[600px] flex flex-col">
        
        {/* Optimized Carousel Background - Uses opacity and simple scale for GPU efficiency */}
        <div className="absolute inset-0 pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              className="absolute inset-0"
              initial={{ scale: 1.05, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 0.8, 
                ease: [0.33, 1, 0.68, 1] // Custom ease-out cubic
              }}
            >
              <img
                src={AUTH_SLIDE_IMAGES[currentSlide]}
                alt=""
                className="w-full h-full object-cover select-none"
                loading="eager"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Modern high-performance overlays */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent pointer-events-none" />
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-slate-950/30 via-transparent to-transparent pointer-events-none" />

        {/* content layer */}
        <div className="relative z-20 flex-1 flex flex-col justify-end p-10 lg:p-14 xl:p-16 pointer-events-none">
          <div className="max-w-2xl pointer-events-auto">
            {/* Height-stable content area */}
            <div className="min-h-[180px] flex flex-col justify-end mb-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-0.5 bg-emerald-500 rounded-full" />
                    <span className="text-emerald-400 font-bold tracking-widest text-[10px] uppercase">
                      {activeSlide.tag}
                    </span>
                  </div>

                  <h2 className="text-4xl xl:text-5xl font-bold leading-[1.1] text-white tracking-tight drop-shadow-md">
                    {activeSlide.title}
                  </h2>

                  <p className="text-base text-slate-200/90 leading-relaxed font-light max-w-lg">
                    {activeSlide.description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Pagination Indicators - Uses scaleX for layout-thrashing-free animation */}
            <div className="flex gap-2.5 mb-8">
              {AUTH_SLIDE_IMAGES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleSlideChange(index)}
                  className="group flex-1 max-w-[40px] focus:outline-none"
                  aria-label={`Go to slide ${index + 1}`}
                >
                  <div className="relative h-1 w-full rounded-full bg-white/20 transition-colors group-hover:bg-white/40 overflow-hidden">
                    {index === currentSlide && (
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: interval / 1000, ease: "linear" }}
                        className="absolute inset-0 bg-emerald-500 rounded-full origin-left"
                      />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* High-performance Navigation controls */}
            <div className="flex gap-4">
              <button
                onClick={() => handleSlideChange((currentSlide - 1 + totalImages) % totalImages)}
                className="p-3 rounded-full bg-white/5 backdrop-blur-md text-white hover:bg-white/20 transition-all border border-white/5 active:scale-95"
                aria-label="Previous slide"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
              </button>
              <button
                onClick={() => handleSlideChange((currentSlide + 1) % totalImages)}
                className="p-3 rounded-full bg-white/5 backdrop-blur-md text-white hover:bg-white/20 transition-all border border-white/5 active:scale-95"
                aria-label="Next slide"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
