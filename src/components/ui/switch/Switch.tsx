import React from 'react';
import { cn } from '@/components/ui/utils';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  /**
   * If true, uses a fixed small size. If false or omitted, uses responsive size (sm on mobile, md on desktop)
   */
  size?: 'sm' | 'responsive';
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  className,
  size = 'responsive',
}) => {
  const isSm = size === 'sm';

  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        "relative inline-flex items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:ring-offset-2 shrink-0",
        isSm 
          ? "h-5 w-9" 
          : "h-5 w-9 sm:h-6 sm:w-11",
        checked ? "bg-emerald-500" : "bg-slate-300",
        disabled && "opacity-50 cursor-not-allowed",
        !disabled && "cursor-pointer",
        className
      )}
      role="switch"
      aria-checked={checked}
      disabled={disabled}
    >
      <span
        className={cn(
          "inline-block transform rounded-full bg-white transition-transform duration-200 shadow-sm",
          isSm 
            ? "h-3.5 w-3.5" 
            : "h-3.5 w-3.5 sm:h-4 sm:w-4",
          checked
            ? (isSm ? "translate-x-5" : "translate-x-5 sm:translate-x-6")
            : (isSm ? "translate-x-0.5" : "translate-x-0.5 sm:translate-x-1")
        )}
      />
    </button>
  );
};
