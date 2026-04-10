import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';
import { cn } from '../utils';

export interface PopoverProps {
  title: string;
  content: string | React.ReactNode;
  triggerClassName?: string;
  contentClassName?: string;
  placement?: 'top' | 'bottom';
}

export const Popover: React.FC<PopoverProps> = ({
  title,
  content,
  triggerClassName,
  contentClassName,
  placement = 'bottom',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (
        !triggerRef.current?.contains(e.target as Node) &&
        !popoverRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  // Close on scroll/resize
  useEffect(() => {
    if (!isOpen) return;
    const close = () => setIsOpen(false);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const newStyle: React.CSSProperties = {
        position: 'fixed',
        zIndex: 9999,
        // Align right edge of popover with right edge of trigger
        right: window.innerWidth - rect.right,
      };
      if (placement === 'top') {
        newStyle.bottom = window.innerHeight - rect.top + 8;
      } else {
        newStyle.top = rect.bottom + 8;
      }
      setStyle(newStyle);
    }
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className={cn('p-2 hover:bg-slate-100 rounded-lg transition-colors', triggerClassName)}
      >
        <Info className="h-4 w-4 text-slate-400" />
      </button>

      {isOpen && createPortal(
        <div
          ref={popoverRef}
          style={style}
          className={cn(
            'fixed bg-white border border-slate-200 rounded-lg shadow-lg',
            'animate-in fade-in zoom-in-95 duration-100',
            contentClassName
          )}
        >
          <div className="p-4">
            {title && (
              <h4 className="text-sm font-semibold text-slate-900 mb-2 border-b border-slate-100 pb-2">
                {title}
              </h4>
            )}
            <div className="text-xs text-slate-600 leading-relaxed">{content}</div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
