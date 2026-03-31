import React, { useState, useEffect, useCallback } from "react";
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

  if (!totalImages || !slides || slides.length === 0) {
    return null;
  }

  return (
    <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 p-4 lg:p-6 items-center justify-center bg-white self-stretch">
      <div className="relative w-full h-full rounded-[1.2rem] overflow-hidden bg-slate-900 min-h-[600px]">
        {/* Carousel Images with motion effects */}
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              className="absolute inset-0"
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.05, opacity: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <img
                src={AUTH_SLIDE_IMAGES[currentSlide]}
                alt={`Product showcase ${currentSlide + 1}`}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Modern gradient overlays */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent pointer-events-none" />
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-slate-950/30 via-transparent to-transparent pointer-events-none" />

        {/* main content */}
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-10 lg:p-14 xl:p-20 pointer-events-none">
          <div className="max-w-2xl pointer-events-auto">
            <div className="relative h-[220px] mb-6 flex flex-col justify-end">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="space-y-4"
                >
                  {/* Tag with line */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-0.5 bg-emerald-500 rounded-full" />
                    <span className="text-emerald-400 font-semibold tracking-wider text-sm uppercase">
                      {slides[currentSlide % slides.length].tag}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-4xl lg:text-5xl font-bold leading-tight text-white tracking-tight drop-shadow-lg">
                    {slides[currentSlide % slides.length].title}
                  </h2>

                  {/* Description */}
                  <p className="text-lg text-slate-200/90 leading-relaxed font-light max-w-lg">
                    {slides[currentSlide % slides.length].description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Indicators with progress bar style */}
            <div className="flex gap-3 mt-12">
              {AUTH_SLIDE_IMAGES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleSlideChange(index)}
                  className="group focus:outline-none py-2"
                  aria-label={`Go to slide ${index + 1}`}
                >
                  <div className="relative h-1 w-8 rounded-full bg-white/20 transition-all group-hover:bg-white/40 overflow-hidden">
                    {index === currentSlide && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: interval / 1000, ease: "linear" }}
                        className="absolute inset-0 bg-emerald-500 rounded-full"
                        style={{ originX: 0 }}
                      />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Navigation buttons Prev / Next */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={() =>
                  handleSlideChange((currentSlide - 1 + totalImages) % totalImages)
                }
                className="p-2.5 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all border border-white/10"
                aria-label="Previous slide"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <button
                onClick={() => handleSlideChange((currentSlide + 1) % totalImages)}
                className="p-2.5 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all border border-white/10"
                aria-label="Next slide"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
