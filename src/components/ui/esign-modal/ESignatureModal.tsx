import React, { useState, useRef, useEffect, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, PenTool } from 'lucide-react';
import { Button } from '../button/Button';
import { cn } from "@/components/ui/utils";

/**
 * E-Signature Modal for secure action confirmation
 * 
 * @example
 * ```tsx
 * <ESignatureModal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   onConfirm={(reason) => handleApprove(reason)}
 *   actionTitle="Approve Document"
 * />
 * ```
 */
export interface ESignatureModalProps {
  /** Modal open state */
  isOpen: boolean;
  /** Callback to close modal */
  onClose: () => void;
  /** Callback on confirm with reason */
  onConfirm: (reason: string) => void;
  /** Action title displayed in modal */
  actionTitle?: string;
  /** Optional details of changes being signed */
  changes?: {
    action: string;
    oldValue: string;
    newValue: string;
    category?: 'metadata' | 'status' | 'approver' | 'reviewer';
  }[];
  /** Optional document info for context */
  documentDetails?: {
    code?: string;
    title?: string;
    revision?: string;
  };
  /** Optional transaction preset for common actions */
  transactionType?: 'distribute' | 'cancel-distribution';
}

const TRANSACTION_PRESETS = {
  'distribute': {
    actionTitle: "Confirm Distribution",
    changes: [{
      action: "Update Status",
      oldValue: "Ready for Distribution",
      newValue: "Distributed",
      category: "status" as const
    }]
  },
  'cancel-distribution': {
    actionTitle: "Cancel Distribution",
    changes: [{
      action: "Update Status",
      oldValue: "Ready for Distribution",
      newValue: "Closed - Cancelled",
      category: "status" as const
    }]
  }
};

export const ESignatureModal: React.FC<ESignatureModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  actionTitle: propActionTitle,
  changes: propChanges,
  documentDetails,
  transactionType
}) => {
    const modalId = useId();
    const titleId  = `${modalId}-title`;
    const errorId  = `${modalId}-error`;

    // Use presets if provided, otherwise fallback to props
    const preset = transactionType ? TRANSACTION_PRESETS[transactionType] : null;
    const actionTitle = propActionTitle || preset?.actionTitle || "Electronic Signature";
    const changes = propChanges || preset?.changes || [];

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');
    // Which field has a validation error — for aria-invalid
    const [errorField, setErrorField] = useState<'username' | 'password' | 'reason' | null>(null);

    const dialogRef   = useRef<HTMLDivElement>(null);
    const triggerRef  = useRef<Element | null>(null);

    // ── Focus management: save trigger, move focus in, return on close ───────────
    useEffect(() => {
      if (isOpen) {
        triggerRef.current = document.activeElement;
        const id = setTimeout(() => dialogRef.current?.focus(), 50);
        return () => clearTimeout(id);
      } else {
        if (triggerRef.current instanceof HTMLElement) {
          triggerRef.current.focus();
        }
      }
    }, [isOpen]);

    // ── Body scroll lock ─────────────────────────────────────────────────────────
    useEffect(() => {
      if (!isOpen) return;
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }, [isOpen]);

    // ── Escape key handler ───────────────────────────────────────────────────────
    useEffect(() => {
      if (!isOpen) return;
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') { e.preventDefault(); onClose(); }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // ── Reset form state when modal closes ──────────────────────────────────────
    useEffect(() => {
      if (!isOpen) {
        setPassword('');
        setReason('');
        setError('');
        setErrorField(null);
      }
    }, [isOpen]);

    // ── Focus trap: cycle Tab/Shift+Tab within the dialog ───────────────────────
    const handleDialogKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== 'Tab') return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setErrorField(null);
      if (!username.trim()) {
        setError('Username is required for the Audit Trail.');
        setErrorField('username');
        return;
      }
      if (!password) {
        setError('Password is required to complete the electronic signature.');
        setErrorField('password');
        return;
      }
      if (!reason.trim()) {
        setError('A signing reason is required for compliance.');
        setErrorField('reason');
        return;
      }
      onConfirm(reason);
      setPassword('');
      setReason('');
      setError('');
      setErrorField(null);
    };

    const totalItems = changes.length + 1;
    const itemLabel  = totalItems === 1 ? '1 item' : `${totalItems} items`;

    const portalContent = createPortal(
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            key="esign-modal-wrapper"
            className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
            style={{
              paddingTop:    'max(1rem, env(safe-area-inset-top, 1rem))',
              paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))',
              paddingLeft:   'max(1rem, env(safe-area-inset-left, 1rem))',
              paddingRight:  'max(1rem, env(safe-area-inset-right, 1rem))',
            }}
          >
            {/* Backdrop */}
            <motion.div
              key="esign-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={onClose}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />

            {/* Dialog */}
            <motion.div
              ref={dialogRef}
              key="esign-modal-content"
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              tabIndex={-1}
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-xl shadow-2xl w-[calc(100%-2rem)] max-w-md border border-slate-200 overflow-hidden relative z-10 flex flex-col max-h-[min(720px,75dvh)] focus:outline-none"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={handleDialogKeyDown}
            >
              {/* Header */}
              <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-slate-50/50 min-h-[56px]">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100 shrink-0">
                    <PenTool className="h-4 w-4 text-emerald-700 -rotate-[90deg]" />
                  </div>
                  <div className="min-w-0">
                    <h3 id={titleId} className="text-sm md:text-base font-semibold text-slate-900 leading-tight truncate">
                      Electronic Signature
                    </h3>
                    <p className="text-[9px] sm:text-[10px] text-slate-500 font-medium">21 CFR Part 11 Compliant</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close dialog"
                  className="flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="h-4 w-4 text-slate-500" />
                </button>
              </div>

              {/* Form wraps both scrollable body and fixed footer */}
              <form onSubmit={handleSubmit} noValidate className="flex flex-col flex-1 overflow-hidden">
                {/* Body - Scrollable */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">

                  {/* Document Identity */}
                  {documentDetails && (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs font-medium text-slate-500 gap-2">
                        <span className="shrink-0">Target Document</span>
                        <span className="text-emerald-600 font-bold truncate">{documentDetails.code || "N/A"}</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-800 leading-tight line-clamp-2 break-words">
                          {documentDetails.title}
                        </p>
                        <span className="inline-block text-[10px] font-semibold px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded uppercase">
                          Revision: {documentDetails.revision || "—"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Audit Trail Table */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs sm:text-sm font-medium text-slate-700">Audit Trail Summary</span>
                      <span className="text-[10px] font-medium text-slate-400 shrink-0">{itemLabel} to sign</span>
                    </div>
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                      <table className="w-full text-left border-collapse table-fixed">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th scope="col" className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Property</th>
                            <th scope="col" className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Old Value</th>
                            <th scope="col" className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">New Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Primary signing action row */}
                          <tr className="border-b border-emerald-100 bg-emerald-50/40">
                            <td className="px-3 py-3 text-[11px] font-bold text-slate-900">
                              <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 align-middle" />
                              Signing Action
                            </td>
                            <td className="px-3 py-3 text-[11px] text-slate-400 italic font-medium">—</td>
                            <td className="px-3 py-3 text-[11px] font-medium text-emerald-700 break-words">
                              {actionTitle}
                            </td>
                          </tr>

                          {changes.length > 0 ? (
                            changes.map((change, idx) => (
                              <tr
                                key={idx}
                                className={cn(
                                  "group transition-colors hover:bg-slate-50/50",
                                  idx !== changes.length - 1 ? "border-b border-slate-200" : ""
                                )}
                              >
                                <td className="px-3 py-2.5 text-[11px] font-semibold text-slate-700 truncate max-w-0" title={change.action}>
                                  {change.action}
                                </td>
                                <td className="px-3 py-2.5 max-w-0">
                                  <span className="text-[10px] text-slate-400 font-medium line-through decoration-slate-300 break-words">
                                    {change.oldValue || '—'}
                                  </span>
                                </td>
                                <td className="px-3 py-2.5 max-w-0">
                                  <span className="text-[11px] font-medium text-emerald-700 break-words">
                                    {change.newValue}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={3} className="px-3 py-3 text-[10px] text-slate-400 text-center italic">
                                No additional property changes in this transaction.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label htmlFor={`${modalId}-reason`} className="text-xs sm:text-sm font-medium text-slate-700">
                        Signing Reason <span className="text-red-500" aria-hidden="true">*</span>
                        <span className="sr-only">(required)</span>
                      </label>
                      <textarea
                        id={`${modalId}-reason`}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={2}
                        required
                        maxLength={500}
                        aria-required="true"
                        aria-invalid={errorField === 'reason' ? 'true' : undefined}
                        aria-describedby={errorField === 'reason' ? errorId : undefined}
                        className={cn(
                          "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm resize-none",
                          errorField === 'reason' ? "border-red-400" : "border-slate-200"
                        )}
                        placeholder="Provide a justification for this action..."
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor={`${modalId}-username`} className="text-xs sm:text-sm font-medium text-slate-700">
                        Username <span className="text-red-500" aria-hidden="true">*</span>
                        <span className="sr-only">(required)</span>
                      </label>
                      <input
                        id={`${modalId}-username`}
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        autoComplete="username"
                        aria-required="true"
                        aria-invalid={errorField === 'username' ? 'true' : undefined}
                        aria-describedby={errorField === 'username' ? errorId : undefined}
                        className={cn(
                          "w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm",
                          errorField === 'username' ? "border-red-400" : "border-slate-200"
                        )}
                        placeholder="Enter your username"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor={`${modalId}-password`} className="text-xs sm:text-sm font-medium text-slate-700">
                        Password <span className="text-red-500" aria-hidden="true">*</span>
                        <span className="sr-only">(required)</span>
                      </label>
                      <input
                        id={`${modalId}-password`}
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        aria-required="true"
                        aria-invalid={errorField === 'password' ? 'true' : undefined}
                        aria-describedby={errorField === 'password' ? errorId : undefined}
                        className={cn(
                          "w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm",
                          errorField === 'password' ? "border-red-400" : "border-slate-200"
                        )}
                        placeholder="Enter your password"
                      />
                    </div>

                    {error && (
                      <div
                        id={errorId}
                        role="alert"
                        className="flex items-start gap-1.5 text-xs text-red-600 font-medium bg-red-50 p-2 rounded-lg border border-red-100"
                      >
                        <AlertCircle className="h-3.5 w-3.5 mt-px shrink-0" aria-hidden="true" />
                        <span>{error}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer - Fixed */}
                <div className="flex-shrink-0 px-5 py-3 border-t border-slate-200 bg-slate-50/30 flex justify-end gap-2 min-h-[56px]">
                  <Button type="button" size="sm" variant="outline" onClick={onClose} className="min-w-[5rem]">
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="min-w-[5rem]">
                    Sign &amp; Confirm
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    );

    return portalContent;
  };
