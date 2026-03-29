import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';
import { cn } from '../utils';

/**
 * Popover component for tooltips and contextual information
 * 
 * @example
 * ```tsx
 * <Popover 
 *   title="Help"
 *   content="This is a helpful description"
 *   placement="top"
 * />
 * ```
 */
export interface PopoverProps {
  /** Popover title */
  title: string;
  /** Popover content */
  content: string | React.ReactNode;
  /** CSS classes for trigger button */
  triggerClassName?: string;
  /** CSS classes for content */
  contentClassName?: string;
  /** Placement position */
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export const Popover: React.FC<PopoverProps> = ({
  title,
  content,
  triggerClassName,
  contentClassName,
  placement = 'bottom',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current && 
        !triggerRef.current.contains(event.target as Node) &&
        popoverRef.current && 
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleScrollOrResize = (e: Event) => {
       if (popoverRef.current && popoverRef.current.contains(e.target as Node)) {
        return;
      }
      if (isOpen) setIsOpen(false);
    };

    if (isOpen) {
      window.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize);
    }

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen]);

  const calculatePosition = () => {
    if (!triggerRef.current) return;
    
    const rect = triggerRef.current.getBoundingClientRect();
    const style: React.CSSProperties = {
      position: 'fixed',
      zIndex: 9999,
    };

    // Simple positioning logic - can be expanded for collision detection
    switch (placement) {
      case 'top':
        style.bottom = window.innerHeight - rect.top + 8;
        style.left = rect.left + rect.width / 2; // Center horizontally
        style.transform = 'translateX(-100%)'; // Adjust for right alignment if needed, or center
        // For simplicity, let's align right edge to trigger right edge for now or just use simple offsets
        // Let's stick to the previous logic's intent but with fixed coords
        style.left = rect.right; 
        style.transform = 'translateX(-100%)'; // Align right
        break;
      case 'bottom':
      default:
        style.top = rect.bottom + 8;
        style.right = window.innerWidth - rect.right; // Align right edge
        break;
    }
    
    // For this specific requirement ("Opened by" popover), it seems to be aligned to the right or left.
    // Let's make it robust.
    // If placement is bottom, align right edge of popover with right edge of trigger? 
    // Or just position it near the trigger.
    
    // Let's try to mimic the previous relative positioning but in fixed coords.
    // Previous: right-0 (aligned right)
    
    if (placement === 'bottom') {
        style.top = rect.bottom + 8;
        // Align right edge of popover with right edge of trigger
        // We can't easily do "right" with fixed positioning unless we know width.
        // Instead, let's set 'left' and translate, or just set 'left' to rect.right - popoverWidth.
        // But we don't know popover width before render.
        
        // Alternative: Set left to rect.left and let it grow right?
        // The image shows a wide popover.
        // Let's position it so the top-right corner is near the trigger.
        style.left = rect.right;
        style.transform = 'translateX(-100%)';
    } else if (placement === 'top') {
        style.bottom = window.innerHeight - rect.top + 8;
        style.left = rect.right;
        style.transform = 'translateX(-100%)';
    }
    
    setPopoverStyle(style);
  };

  const handleToggle = () => {
    if (!isOpen) {
      calculatePosition();
    }
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className={cn(
          'p-2 hover:bg-slate-100 rounded-lg transition-colors',
          triggerClassName
        )}
      >
        <Info className="h-4 w-4 text-slate-400" />
      </button>
      
      {isOpen && createPortal(
        <div
          ref={popoverRef}
          style={popoverStyle}
          className={cn(
            'fixed bg-white border border-slate-200 rounded-lg shadow-lg animate-in fade-in zoom-in-95 duration-100',
            contentClassName
          )}
        >
          <div className="p-4">
            {title && (
              <h4 className="text-sm font-semibold text-slate-900 mb-2 border-b border-slate-100 pb-2">
                {title}
              </h4>
            )}
            <div className="text-xs text-slate-600 leading-relaxed">
              {content}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
