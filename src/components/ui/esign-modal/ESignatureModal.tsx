import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, AlertCircle, PenTool } from 'lucide-react';
import { Button } from '../button/Button';

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
  actionTitle: string;
  /** Optional details of changes being signed */
  changes?: {
    action: string;
    oldValue: string;
    newValue: string;
  }[];
}

export const ESignatureModal: React.FC<ESignatureModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  actionTitle,
  changes = []
}) => {
  const [username, setUsername] = useState('Dr. A. Smith'); // Simulated logged-in user
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
            className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden relative z-10 flex flex-col"
            style={{
              // Ensure modal doesn't exceed viewport on mobile
              maxHeight: 'calc(100dvh - 2rem)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - Fixed */}
            <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50/50 min-h-[56px]">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                  <PenTool className="h-4 w-4 text-emerald-700 -rotate-[90deg] transition-transform" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">Electronic Signature</h3>
                  <p className="text-[9px] sm:text-[10px] text-slate-500 font-medium font-mono">21 CFR Part 11 COMPLIANT</p>
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
              {/* Change Details Table */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs sm:text-sm font-semibold text-slate-700">Audit Trail Summary</span>
                </div>
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Property</th>
                        <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Old Value</th>
                        <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">New Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Primary Action Row */}
                      <tr className="border-b border-emerald-100 bg-emerald-50/30">
                        <td className="px-3 py-2 text-xs font-bold text-slate-800">Signing Purpose</td>
                        <td className="px-3 py-2 text-xs text-slate-400 italic">—</td>
                        <td className="px-3 py-2 text-xs font-bold text-emerald-700 decoration-emerald-500/30 decoration-2 underline-offset-4 tracking-tight">
                          {actionTitle}
                        </td>
                      </tr>

                      {/* Additional Property Changes */}
                      {changes.length > 0 ? (
                        changes.map((change, idx) => (
                          <tr key={idx} className={idx !== changes.length - 1 ? "border-b border-slate-100" : ""}>
                            <td className="px-3 py-2 text-xs font-medium text-slate-700">{change.action}</td>
                            <td className="px-3 py-2 text-xs text-slate-500 line-through decoration-slate-300">{change.oldValue || '—'}</td>
                            <td className="px-3 py-2 text-xs font-semibold text-emerald-600">{change.newValue}</td>
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
                <div className="bg-emerald-50/30 p-2.5 rounded-lg border border-emerald-100/50 mb-1">
                  <p className="text-[10px] sm:text-xs text-emerald-700 leading-relaxed font-medium">
                    Electronic signature via credentials is legally binding and equivalent to a handwritten signature.
                  </p>
                </div>
                
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
            <div className="flex-shrink-0 px-5 py-3 border-t border-slate-100 bg-slate-50/30 flex justify-end gap-2 min-h-[56px]">
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
