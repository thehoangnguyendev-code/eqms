import React from 'react';
import { cn } from '../utils';

/**
 * Responsive Card Components
 * Optimized for Desktop and Tablet (iPad portrait & landscape)
 */

/**
 * Card component props
 */
export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className,
  hover = false,
  padding = 'md',
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-2 md:p-3',
    md: 'p-4 md:p-5',
    lg: 'p-6 md:p-8',
  };

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-slate-200 shadow-sm',
        paddingClasses[padding],
        // Hover effect
        hover && 'transition-all hover:shadow-md hover:border-slate-200 hover:scale-[1.01]',
        className
      )}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        'flex flex-col space-y-2 md:space-y-3',
        'pb-4 md:pb-6 border-b border-slate-200',
        className
      )}
    >
      {children}
    </div>
  );
};

export const CardTitle: React.FC<CardProps> = ({ children, className }) => {
  return (
    <h3
      className={cn(
        'font-bold text-slate-900',
        // Responsive font size
        'text-lg md:text-xl lg:text-2xl',
        className
      )}
    >
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<CardProps> = ({ children, className }) => {
  return (
    <p
      className={cn(
        'text-slate-600',
        // Responsive font size
        'text-sm md:text-base',
        className
      )}
    >
      {children}
    </p>
  );
};

export const CardContent: React.FC<CardProps> = ({ children, className, padding = 'md' }) => {
  const paddingClasses = {
    none: '',
    sm: 'pt-3 md:pt-4',
    md: 'pt-4 md:pt-6',
    lg: 'pt-6 md:pt-8',
  };

  return (
    <div className={cn(paddingClasses[padding], className)}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        'flex items-center gap-2 md:gap-3',
        'pt-4 md:pt-6 border-t border-slate-200',
        // Responsive layout
        'flex-col sm:flex-row',
        className
      )}
    >
      {children}
    </div>
  );
};

// Card Grid Layout
interface CardGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export const CardGrid: React.FC<CardGridProps> = ({
  children,
  columns = 3,
  className,
}) => {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  return (
    <div
      className={cn(
        'grid gap-4 md:gap-6',
        gridClasses[columns],
        className
      )}
    >
      {children}
    </div>
  );
};

// Stat Card (for Dashboard)
interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: 'up' | 'down';
  };
  icon?: React.ReactNode;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  className,
}) => {
  return (
    <Card hover padding="md" className={className}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs md:text-sm text-slate-600 font-medium mb-1 md:mb-2">
            {title}
          </p>
          <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900">
            {value}
          </p>
          {change && (
            <div
              className={cn(
                'inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-full text-xs md:text-sm font-medium',
                change.trend === 'up'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-red-50 text-red-700'
              )}
            >
              <span>{change.trend === 'up' ? '↑' : '↓'}</span>
              <span>{Math.abs(change.value)}%</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};
