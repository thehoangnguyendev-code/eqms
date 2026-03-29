import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Lock, AlertCircle } from 'lucide-react';
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
}

export const ESignatureModal: React.FC<ESignatureModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  actionTitle
}) => {
  const [username, setUsername] = useState('Dr. A. Smith'); // Simulated logged-in user
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Username and Password are mandatory for Audit Trail.');
      return;
    }
    // Simulate verification
    onConfirm('');
    // Reset
    setPassword('');
    setError('');
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
      style={{
        // iOS Safari safe area support
        paddingTop: 'max(1rem, env(safe-area-inset-top, 1rem))',
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))',
        paddingLeft: 'max(1rem, env(safe-area-inset-left, 1rem))',
        paddingRight: 'max(1rem, env(safe-area-inset-right, 1rem))',
      }}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 animate-in zoom-in-95 duration-200 overflow-hidden"
        style={{
          // Ensure modal doesn't exceed viewport on mobile
          maxHeight: 'calc(100dvh - 2rem)',
        }}
      >

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
              <Lock className="h-3.5 w-3.5 text-blue-700" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">Electronic Signature</h3>
              <p className="text-[10px] text-slate-500 font-medium">21 CFR Part 11 Compliance</p>
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs sm:text-sm font-medium text-slate-700">Username <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
              placeholder="Enter your username"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs sm:text-sm font-medium text-slate-700">Password <span className="text-red-500">*</span></label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
              placeholder="Enter your password"
            />
          </div>

          {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" size='sm' variant="outline" onClick={onClose} className="min-w-[5rem]">Cancel</Button>
            <Button type="submit" size='sm' className="min-w-[5rem]">Sign</Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
