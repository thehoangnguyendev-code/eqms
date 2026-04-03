import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/components/ui/utils';

interface Document3DProps {
  color?: string;
  size?: number;
  className?: string;
  isOpen?: boolean;
}

/**
 * A premium 3D document (paper) component with lift and tilt animations.
 */
export const Document3D: React.FC<Document3DProps> = ({ 
  color = '#3b82f6', 
  size = 1, 
  className = '',
  isOpen = false
}) => {
  return (
    <motion.div
      style={{ 
        transform: `scale(${size})`,
        perspective: '1000px',
        transformStyle: 'preserve-3d'
      }}
      className={cn("relative w-12 h-16 flex items-center justify-center", className)}
      animate={isOpen ? { rotateY: 15, rotateX: 10, y: -8 } : { rotateY: 0, rotateX: 0, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* 3D Paper Shadow */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[90%] h-2 bg-slate-900/5 blur-md rounded-full" />

      {/* Main Paper Sheet */}
      <div 
        className="relative w-10 h-14 bg-white rounded-sm border border-slate-200 shadow-sm overflow-hidden flex flex-col gap-1.5 p-2.5"
        style={{ 
          transform: 'translateZ(10px)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.05)'
        }}
      >
        {/* Document Header Line */}
        <div className={cn("w-2/3 h-1 rounded-full", color.startsWith('#') ? "" : color)} style={{ backgroundColor: color.startsWith('#') ? color : undefined }} />
        
        {/* Content Silhouettes */}
        <div className="w-full h-0.5 bg-slate-100 rounded-full" />
        <div className="w-full h-0.5 bg-slate-100 rounded-full" />
        <div className="w-4/5 h-0.5 bg-slate-100 rounded-full" />
        <div className="w-full h-0.5 bg-slate-100 rounded-full" />
        <div className="w-1/2 h-0.5 bg-slate-100 rounded-full" />

        {/* Paper Corner Fold (3D Effect) */}
        <div 
          className="absolute top-0 right-0 w-3 h-3 bg-white border-l border-b border-slate-200"
          style={{ 
             boxShadow: '1px 1px 2px rgba(0,0,0,0.05)',
             clipPath: 'polygon(0 0, 0 100%, 100% 100%)'
          }}
        />

        {/* Glossy Sheen Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
      </div>

      {/* Behind Layers for Thickness */}
      <div 
        className="absolute w-10 h-14 bg-slate-50 rounded-sm border border-slate-100 shadow-sm"
        style={{ transform: 'translateZ(-2px) translate(1px, 1px)' }}
      />
      <div 
        className="absolute w-10 h-14 bg-slate-100 rounded-sm border border-slate-200"
        style={{ transform: 'translateZ(-5px) translate(2px, 2px)' }}
      />
    </motion.div>
  );
};

export default Document3D;
