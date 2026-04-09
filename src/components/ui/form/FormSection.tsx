import React from 'react';
import { cn } from '@/components/ui/utils';

export interface FormSectionProps {
  title: string;
  icon?: React.ReactNode;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * FormSection component with card-like styling and optional icon.
 * Standardized across the application for form grouping.
 */
export const FormSection: React.FC<FormSectionProps> = ({ 
  title, 
  icon, 
  description,
  children, 
  className 
}) => {
  return (
    <div className={cn("bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden", className)}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-2.5">
          {icon && <span className="text-emerald-600">{icon}</span>}
          <div>
            <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
            {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
          </div>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
};
