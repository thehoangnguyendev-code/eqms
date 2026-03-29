import React from 'react';
import { cn } from '../utils';

/**
 * Status type for document workflows
 */
export type StatusType = 
  | 'draft' 
  | 'pendingReview' 
  | 'pendingApproval' 
  | 'approved' 
  | 'rejected'
  | 'pendingTraining' 
  | 'readyForPublishing' 
  | 'published' 
  | 'effective' 
  | 'active'
  | 'archived' 
  | 'obsolete'
  | 'current'
  | 'blocked'
  | 'inProgress'
  | 'completed'
  | 'cancelled';

const STATUS_CONFIG: Record<StatusType, { label: string; className: string }> = {
  draft: { 
    label: 'Draft', 
    className: 'bg-slate-100 text-slate-700 border-slate-200' 
  },
  pendingReview: { 
    label: 'Pending Review', 
    className: 'bg-amber-50 text-amber-700 border-amber-200' 
  },
  pendingApproval: { 
    label: 'Pending Approval', 
    className: 'bg-blue-50 text-blue-700 border-blue-200' 
  },
  approved: { 
    label: 'Approved', 
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200' 
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-50 text-red-700 border-red-200'
  },
  current: {
    label: 'Current',
    className: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  blocked: {
    label: 'Blocked',
    className: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  inProgress: {
    label: 'In Progress',
    className: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  pendingTraining: {
    label: 'Pending Training',
    className: 'bg-purple-50 text-purple-700 border-purple-200'
  },
  readyForPublishing: {
    label: 'Ready for Publishing',
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  },
  published: {
    label: 'Published',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  effective: { 
    label: 'Effective', 
    className: 'bg-emerald-100 text-emerald-800 border-emerald-300' 
  },
  active: {
    label: 'Active',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  archived: {
    label: 'Closed - Cancelled',
    className: 'bg-gray-100 text-gray-700 border-gray-200'
  },
  obsolete: { 
    label: 'Obsoleted', 
    className: 'bg-rose-50 text-rose-700 border-rose-200' 
  },
  completed: {
    label: 'Completed',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-red-50 text-red-700 border-red-200'
  }
};

/**
 * Status Badge component for displaying document workflow states
 * 
 * @example
 * ```tsx
 * <StatusBadge status="approved" />
 * <StatusBadge status="pendingReview" size="sm" />
 * <StatusBadge status="effective" icon={<CheckIcon />} />
 * ```
 */
export interface StatusBadgeProps {
  /** Status type to display */
  status: StatusType;
  /** Additional CSS classes */
  className?: string;
  /** Badge size variant */
  size?: 'default' | 'sm' | 'lg';
  /** Optional icon to display */
  icon?: React.ReactNode;
  /** Optional custom label */
  label?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  className,
  size = 'default',
  icon,
  label
}) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    default: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  };
  
  return (
    <span 
      role="status"
      className={cn(
      "inline-flex items-center gap-1 rounded-full font-medium border select-none", 
      sizeClasses[size],
      config.className, 
      className
    )}>
      {icon}
      {label || config.label}
    </span>
  );
};




