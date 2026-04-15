import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, AlertCircle, PenTool } from 'lucide-react';
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
  // Use presets if provided, otherwise fallback to props
  const preset = transactionType ? TRANSACTION_PRESETS[transactionType] : null;
  const actionTitle = propActionTitle || preset?.actionTitle || "Electronic Signature";
  const changes = propChanges || preset?.changes || [];

  const [username, setUsername] = useState('Dr. A. Smith');
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Username and Password are mandatory for Audit Trail.');
      return;
    }
    if (!reason.trim()) {
      setError('Please provide a reason for signing.');
      return;
    }
    // Simulate verification
    onConfirm(reason);
    // Reset
    setPassword('');
    setReason('');
    setError('');
  };

  const portalContent = createPortal(
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="esign-modal-wrapper"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden"
          style={{
            // iOS Safari safe area support
            paddingTop: 'max(1rem, env(safe-area-inset-top, 1rem))',
            paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))',
            paddingLeft: 'max(1rem, env(safe-area-inset-left, 1rem))',
            paddingRight: 'max(1rem, env(safe-area-inset-right, 1rem))',
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

          {/* Modal content */}
          <motion.div
            key="esign-modal-content"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 350,
              duration: 0.3
            }}
            className="bg-white rounded-xl shadow-2xl w-[calc(100%-2rem)] max-w-md border border-slate-200 overflow-hidden relative z-10 flex flex-col"
            style={{
              // Reduced height on mobile to ensure content stays within view and scrolls
              maxHeight: 'min(720px, 75dvh)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - Fixed */}
            <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-slate-50/50 min-h-[56px]">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                  <PenTool className="h-4 w-4 text-emerald-700 -rotate-[90deg] transition-transform" />
                </div>
                <div>
                  <h3 className="text-sm md:text-base lg:text-lg font-semibold text-slate-900 leading-tight">Electronic Signature</h3>
                  <p className="text-[9px] sm:text-[10px] text-slate-500 font-medium">21 CFR Part 11 Compliant</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>

            {/* Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              {/* Document Identity Section (if provided) */}
              {documentDetails && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                    <span>Target Document</span>
                    <span className="text-emerald-600 font-bold">{documentDetails.code || "N/A"}</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-800 leading-tight line-clamp-2">
                      {documentDetails.title}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded uppercase">
                        Revision: {documentDetails.revision || "—"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Change Details Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium text-slate-700">
                    Audit Trail Summary
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">
                    {changes.length + 1} item(s) to sign
                  </span>
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                  <table className="w-full text-left border-collapse table-fixed">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Property</th>
                        <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Old Value</th>
                        <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">New Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Primary Action Row - High Priority */}
                      <tr className="border-b border-emerald-100 bg-emerald-50/40">
                        <td className="px-3 py-3 text-[11px] font-bold text-slate-900 flex items-center gap-1.5">
                          <div className="w-1 h-1 rounded-full bg-emerald-500" />
                          Signing Action
                        </td>
                        <td className="px-3 py-3 text-[11px] text-slate-400 italic font-medium">—</td>
                        <td className="px-3 py-3 text-[11px] font-medium text-emerald-700">
                          {actionTitle}
                        </td>
                      </tr>

                      {/* Additional Property Changes */}
                      {changes.length > 0 ? (
                        changes.map((change, idx) => (
                          <tr
                            key={idx}
                            className={cn(
                              "group transition-colors hover:bg-slate-50/50",
                              idx !== changes.length - 1 ? "border-b border-slate-200" : ""
                            )}
                          >
                            <td className="px-3 py-2.5 text-[11px] font-semibold text-slate-700 truncate" title={change.action}>
                              {change.action}
                            </td>
                            <td className="px-3 py-2.5">
                              <span className="text-[10px] text-slate-400 font-medium line-through decoration-slate-300 break-all">
                                {change.oldValue || '—'}
                              </span>
                            </td>
                            <td className="px-3 py-2.5">
                              <span className="text-[11px] font-medium text-emerald-700">
                                {change.newValue}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-3 py-3 text-[10px] text-slate-400 text-center italic bg-slate-50/20">
                            No secondary property modifications in this transaction.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-slate-700">Signing Reason <span className="text-red-500">*</span></label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm resize-none"
                    placeholder="Provide a justification for this action..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-slate-700">Username <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                    placeholder="Enter your username"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-slate-700">Password <span className="text-red-500">*</span></label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                    placeholder="Enter your password"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium bg-red-50 p-2 rounded-lg border border-red-100">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {error}
                  </div>
                )}
              </div>
            </div>

            {/* Footer - Fixed */}
            <div className="flex-shrink-0 px-5 py-3 border-t border-slate-200 bg-slate-50/30 flex justify-end gap-2 min-h-[56px]">
              <Button type="button" size='sm' variant="outline" onClick={onClose} className="min-w-[5rem]">Cancel</Button>
              <Button type="submit" onClick={handleSubmit} size='sm' className="min-w-[5rem]">Sign & Confirm</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );

  return portalContent;
};
