import React, { useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button/Button";
import { DateTimePicker } from "@/components/ui/datetime-picker/DateTimePicker";
import { ESignatureModal } from "@/components/ui/esign-modal/ESignatureModal";
import { cn } from "@/components/ui/utils";

interface SuspendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, suspendedUntil: string) => void;
  userName: string;
}

export const SuspendModal: React.FC<SuspendModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userName,
}) => {
  const [reason, setReason] = useState("");
  const [suspendedUntil, setSuspendedUntil] = useState("");
  const [error, setError] = useState("");
  const [eSignOpen, setESignOpen] = useState(false);

  const resetForm = () => {
    setReason("");
    setSuspendedUntil("");
    setError("");
    setESignOpen(false);
  };

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError("Suspension reason is required");
      return;
    }
    setESignOpen(true);
  };

  const handleESignConfirm = (_esignReason: string) => {
    onConfirm(reason.trim(), suspendedUntil);
    resetForm();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const portalContent = createPortal(
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="suspend-modal-wrapper"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden"
        >
          {/* Backdrop */}
          <motion.div
            key="suspend-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={handleClose}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            key="suspend-modal-content"
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
            style={{ maxHeight: 'calc(100dvh - 2rem)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start gap-3 p-5 border-b border-slate-100 bg-white min-h-[64px] shrink-0">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-slate-900">Suspend User</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Suspending <span className="font-semibold text-slate-700">{userName}</span>
                </p>
              </div>
              <button
                onClick={handleClose}
                className="h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1 min-h-0">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter reason for suspension..."
                  rows={3}
                  className={cn(
                    "w-full px-3 py-2.5 text-sm border rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 placeholder:text-slate-400",
                    error ? "border-red-300 bg-red-50" : "border-slate-200"
                  )}
                />
                {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
              </div>

              <div>
                <DateTimePicker
                  label="Suspended Until (optional)"
                  value={suspendedUntil}
                  onChange={setSuspendedUntil}
                  placeholder="Leave empty for indefinite"
                />
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">Leave empty to suspend indefinitely</p>
              </div>

              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700 leading-relaxed">
                The user will be unable to log in while suspended. All data and records will be preserved.
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 px-5 pb-5 pt-2 bg-white shrink-0">
              <Button variant="outline" size="sm" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirm}
                className="bg-amber-500 hover:bg-amber-600 text-white border-amber-500 hover:border-amber-600"
              >
                Suspend User
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );

  return (
    <>
      {portalContent}
      <ESignatureModal
        isOpen={eSignOpen}
        onClose={() => setESignOpen(false)}
        onConfirm={handleESignConfirm}
        actionTitle={`Suspend User: ${userName}`}
      />
    </>
  );
};
