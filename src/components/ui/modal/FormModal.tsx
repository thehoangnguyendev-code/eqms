import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from '../button/Button';
import { cn } from '../utils';
import { ButtonLoading } from '../loading/Loading';

export interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title?: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  confirmDisabled?: boolean;
  showCancel?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

const sizeToClass: Record<NonNullable<FormModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  '2xl': 'max-w-3xl',
};

export const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  children,
  confirmText = 'Save',
  cancelText = 'Cancel',
  isLoading = false,
  confirmDisabled = false,
  showCancel = true,
  size = 'xl',
  className,
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
      style={{
        paddingTop: `max(0.75rem, env(safe-area-inset-top))`,
        paddingBottom: `max(0.75rem, env(safe-area-inset-bottom))`,
        paddingLeft: `max(0.75rem, env(safe-area-inset-left))`,
        paddingRight: `max(0.75rem, env(safe-area-inset-right))`,
      }}
    >
      <div
        className={cn(
          'bg-white rounded-xl shadow-xl w-full border border-slate-200 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col',
          sizeToClass[size],
          className
        )}
        style={{ maxHeight: 'calc(100dvh - 2rem)' }}
      >
        <div className="px-4 sm:px-6 pt-3 sm:pt-4 pb-2 sm:pb-3 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {title && (
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-6 truncate">{title}</h3>
              )}
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4 text-slate-500" />
            </button>
          </div>
          {description && (
            <div className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">{description}</div>
          )}
        </div>
        <div className="px-4 sm:px-6 py-4 sm:py-5 bg-white overflow-y-auto flex-1 min-h-0">
          {children}
        </div>
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-2 sm:gap-3 shrink-0">
          {showCancel && (
            <Button size="sm" variant="outline" onClick={onClose} disabled={isLoading}>
              {cancelText}
            </Button>
          )}
          <Button size="sm" onClick={onConfirm || onClose} disabled={isLoading || confirmDisabled}>
            {isLoading ? <ButtonLoading text="Processing..." /> : confirmText}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};
