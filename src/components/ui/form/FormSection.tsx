import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/components/ui/utils';

export interface FormSectionProps {
  title: string;
  /** Icon displayed in the header (wrapped in emerald color) */
  icon?: React.ReactNode;
  /** Optional subtitle below the title */
  description?: string;
  children: React.ReactNode;
  className?: string;
  /** Extra content rendered on the right side of the header (e.g. badge, counter) */
  headerRight?: React.ReactNode;
}

/**
 * FormSection — standardized card section used across all detail/form views.
 *
 * Features:
 * - Fade-in animation on mount
 * - Optional icon with emerald styling
 * - Optional description subtitle
 * - Optional headerRight slot for badges, counters, etc.
 */
export const FormSection: React.FC<FormSectionProps> = ({
  title,
  icon,
  description,
  children,
  className,
  headerRight,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn("bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden", className)}
    >
      <div className="flex items-center justify-between gap-2.5 px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-white to-slate-50/50">
        <div className="flex items-center gap-2.5">
          {icon && (
            <span className="text-emerald-600 flex-shrink-0">
              {icon}
            </span>
          )}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">{title}</h3>
            {description && (
              <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">{description}</p>
            )}
          </div>
        </div>
        {headerRight && <div className="flex-shrink-0">{headerRight}</div>}
      </div>
      <div className="p-5">{children}</div>
    </motion.div>
  );
};
