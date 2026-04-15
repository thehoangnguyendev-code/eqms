import React from 'react';
import { cn } from '../utils';

/**
 * Button component following shadcn/ui design system
 * 
 * @example
 * ```tsx
 * <Button variant="default" size="sm" onClick={handleClick}>
 *   Submit
 * </Button>
 * 
 * <Button variant="destructive" size="sm">
 *   Delete
 * </Button>
 * 
 * <Button variant="link">
 *   Learn more
 * </Button>
 * 
 * <Button variant="ghost" size="icon">
 *   <Settings className="h-4 w-4" />
 * </Button>
 * ```
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button style variant */
  variant?: 'default' | 'outline' | 'outline-emerald' | 'ghost' | 'destructive' | 'secondary' | 'link';
  /** Button size with responsive support */
  size?: 'xs' | 'sm' | 'default' | 'lg' | 'xl' | 'icon' | 'icon-sm' | 'icon-lg';
  /** Make button full width */
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', fullWidth = false, type, ...props }, ref) => {
    const variants = {
      default: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm hover:shadow-md active:scale-[0.97] transition-all duration-200',
      outline: 'border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-200 text-slate-900 shadow-sm hover:shadow active:scale-[0.97] transition-all duration-200',
      'outline-emerald': 'border border-emerald-600 bg-white text-emerald-600 hover:bg-emerald-50 disabled:border-slate-300 disabled:text-slate-400 disabled:hover:bg-transparent shadow-sm active:scale-[0.97] transition-all duration-200',
      ghost: 'hover:bg-slate-100 hover:text-slate-900 active:scale-[0.97] transition-all duration-200',
      destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md active:scale-[0.97] transition-all duration-200',
      secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 active:scale-[0.97] transition-all duration-200',
      link: 'text-emerald-600 underline-offset-4 hover:underline active:scale-[0.97] transition-all duration-200',
    };

    const sizes = {
      // Responsive sizes — mobile sizes meet 44px minimum touch target
      xs: 'h-8 md:h-7 px-2 md:px-3 text-xs',
      sm: 'h-9 md:h-9 px-3 md:px-4 text-xs md:text-sm',
      default: 'h-10 md:h-11 px-4 md:px-6 text-sm md:text-base',
      lg: 'h-12 md:h-14 px-6 md:px-8 text-base md:text-lg',
      xl: 'h-14 md:h-16 px-8 md:px-10 text-lg md:text-xl',
      'icon-sm': 'h-10 w-10 md:h-9 md:w-9 p-0',
      icon: 'h-11 w-11 md:h-11 md:w-11 p-0',
      'icon-lg': 'h-12 w-12 md:h-14 md:w-14 p-0',
    };

    return (
      <button
        ref={ref}
        type={type ?? 'button'}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium',
          'ring-offset-background transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
