import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/components/ui/utils';

interface Document3DProps {
  color?: string;
  size?: number;
  className?: string;
  isOpen?: boolean;
}

/**
 * A ultra-premium 3D document component with more pronounced fanning effects
 * for better visual clarity.
 */
export const Document3D: React.FC<Document3DProps> = ({ 
  color = '#3b82f6', 
  size = 1, 
  className = '',
  isOpen = false
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const finalScale = isMobile ? size * 0.8 : size;

  return (
    <div 
        className={cn("relative flex items-center justify-center isolate flex-none", className)}
        style={{ width: 96, height: 120, transform: `scale(${finalScale})` }}
    >
      {/* Background Soft Glow when Open */}
      <motion.div 
        className="absolute inset-0 bg-blue-400/5 blur-3xl rounded-full"
        animate={isOpen ? { opacity: 1, scale: 1.5 } : { opacity: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
      />

      <motion.div
        style={{ 
          perspective: '1200px',
          transformStyle: 'preserve-3d',
          width: '100%',
          height: '100%'
        }}
        className="relative flex items-center justify-center pointer-events-none"
        animate={isOpen ? { rotateY: 20, rotateX: 10 } : { rotateY: 0, rotateX: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        {/* Dynamic Deep Field Shadow */}
        <motion.div 
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[90%] h-6 bg-slate-900/10 blur-2xl rounded-full"
            animate={isOpen ? { opacity: 0.3, scale: 1.4, y: 15 } : { opacity: 0.05, scale: 0.8 }}
        />

        {/* BACK PAGE - More pronounced fanning out */}
        <motion.div
          className="absolute w-16 h-24 bg-slate-100 rounded-[2px] border border-slate-300 shadow-sm flex flex-col p-3 top-1/2 left-1/2 -ml-8 -mt-12"
          style={{ transformOrigin: 'bottom center' }}
          animate={isOpen 
              ? { x: 22, y: -12, rotateZ: 12, rotateY: -15, scale: 0.98 } 
              : { x: 2, y: 1, rotateZ: 1, rotateY: 0, scale: 1 }
          }
          transition={{ type: 'spring', stiffness: 80, damping: 18 }}
        >
          <div className="w-2 h-2 rounded-full mb-2 opacity-50 shrink-0" style={{ backgroundColor: color }} />
          <div className="flex flex-col gap-2.5 flex-1 overflow-hidden opacity-40">
            <div className="w-full h-1 bg-slate-200 rounded-full" />
            <div className="w-full h-1 bg-slate-200 rounded-full" />
            <div className="w-3/4 h-1 bg-slate-200 rounded-full" />
            <div className="w-full h-1 bg-slate-200 rounded-full" />
            <div className="w-full h-1 bg-slate-200 rounded-full" />
          </div>
        </motion.div>

        {/* FRONT PAGE - More pronounced fanning out */}
        <motion.div 
          className="absolute w-16 h-24 bg-white rounded-[2px] border border-slate-300 shadow-lg flex flex-col p-4 top-1/2 left-1/2 -ml-8 -mt-12"
          style={{ 
            transformStyle: 'preserve-3d',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,1), 0 8px 25px rgba(0,0,0,0.14)',
            zIndex: 20
          }}
          animate={isOpen 
              ? { x: -18, y: -5, rotateZ: -8, rotateY: 15, translateZ: 25 } 
              : { x: 0, y: 0, rotateZ: 0, rotateY: 0, translateZ: 8 }
          }
          transition={{ type: 'spring', stiffness: 80, damping: 15 }}
        >
          {/* Header Icons */}
          <div className="flex items-center gap-2.5 mb-4 shrink-0">
            <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: color }} />
            <div className="w-1/2 h-2 bg-slate-50/80 rounded-full" />
          </div>
          
          {/* Paragraph Outlines */}
          <div className="flex flex-col gap-2.5 flex-1 opacity-90">
            <div className="w-full h-1 bg-slate-50/60 rounded-full" />
            <div className="w-full h-1 bg-slate-50/60 rounded-full" />
            <div className="w-[90%] h-1 bg-slate-50/60 rounded-full" />
            <div className="h-2" />
            <div className="w-full h-1 bg-slate-50/60 rounded-full" />
            <div className="w-[80%] h-1 bg-slate-50/60 rounded-full" />
          </div>

          {/* Paper Fold (Corner) */}
          <div className="absolute top-0 right-0 w-5 h-5 bg-slate-50 border-l border-b border-slate-300 shadow-[1px_1px_2px_rgba(0,0,0,0.05)]" style={{ clipPath: 'polygon(0 0, 0 100%, 100% 100%)' }} />

          {/* Premium Glossy Reflection Surface */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent pointer-events-none" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Document3D;
