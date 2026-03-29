import React, { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "../button/Button";
import { cn } from "../utils";
import { ButtonLoading } from "../loading/Loading";

export type AlertModalType = "success" | "error" | "warning" | "info" | "confirm";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  description?: React.ReactNode;
  type?: AlertModalType;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  showCancel?: boolean;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  type = "info",
  confirmText,
  cancelText = 'Cancel',
  isLoading = false,
  showCancel,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Focus trap & keyboard handling
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }

    if (e.key === 'Tab' && modalRef.current) {
      const focusableEls = modalRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusableEls.length === 0) return;
      const first = focusableEls[0];
      const last = focusableEls[focusableEls.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    // Save current focus
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Focus first focusable element in modal
    requestAnimationFrame(() => {
      if (modalRef.current) {
        const firstFocusable = modalRef.current.querySelector<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled])'
        );
        firstFocusable?.focus();
      }
    });

    // Add keyboard listener
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus
      previousFocusRef.current?.focus();
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const config = {
    success: {
      defaultConfirmText: "OK",
    },
    error: {
      defaultConfirmText: "Close",
    },
    warning: {
      defaultConfirmText: "Confirm",
    },
    info: {
      defaultConfirmText: "OK",
    },
    confirm: {
      defaultConfirmText: "Confirm",
    },
  };

  const currentConfig = config[type];

  // Determine if we should show the cancel button
  // If showCancel is explicitly provided, use it.
  // Otherwise, show it for 'confirm' and 'warning' types.
  const shouldShowCancel =
    showCancel !== undefined
      ? showCancel
      : type === "confirm" || type === "warning";

  const finalConfirmText = confirmText || currentConfig.defaultConfirmText;

  // Custom button styles based on type
  const getConfirmButtonClass = () => {
    if (type === "error")
      return "bg-red-600 hover:bg-red-700 focus-visible:ring-red-500";
    if (type === "warning")
      return "bg-amber-600 hover:bg-amber-700 focus-visible:ring-amber-500";
    return "";
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      style={{
        // iOS Safari safe area support
        paddingTop: 'max(1rem, env(safe-area-inset-top, 1rem))',
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))',
        paddingLeft: 'max(1rem, env(safe-area-inset-left, 1rem))',
        paddingRight: 'max(1rem, env(safe-area-inset-right, 1rem))',
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="alert-modal-title"
        aria-describedby={description ? "alert-modal-desc" : undefined}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 animate-in zoom-in-95 duration-200 overflow-hidden"
        style={{
          // Ensure modal doesn't exceed viewport on mobile
          maxHeight: 'calc(100dvh - 2rem)',
        }}
      >

        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <h3
                id="alert-modal-title"
                className="text-base sm:text-lg font-semibold text-slate-900"
              >
                {title}
              </h3>
              {description && (
                <div
                  id="alert-modal-desc"
                  className="text-sm text-slate-600 leading-relaxed"
                >
                  {description}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="px-5 sm:px-6 py-3 sm:py-4 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-2 sm:gap-3">
          {shouldShowCancel && (
            <Button
              size="sm"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
          )}

          <Button
            size="sm"
            onClick={onConfirm || onClose}
            className={getConfirmButtonClass()}
            disabled={isLoading}
          >
            {isLoading ? (
              <ButtonLoading
                text="Processing..."
                light={type === "error"}
              />
            ) : (
              finalConfirmText
            )}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};
