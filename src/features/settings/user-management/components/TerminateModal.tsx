import React, { useState } from "react";
import { createPortal } from "react-dom";
import { UserX, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import { DateTimePicker } from "@/components/ui/datetime-picker/DateTimePicker";
import { ESignatureModal } from "@/components/ui/esign-modal/ESignatureModal";

const TERMINATION_REASON_OPTIONS = [
  { label: "Resignation", value: "Resignation" },
  { label: "Layoff / Redundancy", value: "Layoff / Redundancy" },
  { label: "Contract Ended", value: "Contract Ended" },
  { label: "Retirement", value: "Retirement" },
  { label: "Dismissal", value: "Dismissal" },
  { label: "Other", value: "Other" },
];

interface TerminateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, terminationDate: string) => void;
  userName: string;
}

export const TerminateModal: React.FC<TerminateModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userName,
}) => {
  const [reason, setReason] = useState("");
  const [terminationDate, setTerminationDate] = useState("");
  const [errors, setErrors] = useState<{ reason?: string; date?: string }>({});
  const [eSignOpen, setESignOpen] = useState(false);

  const resetForm = () => {
    setReason("");
    setTerminationDate("");
    setErrors({});
    setESignOpen(false);
  };

  const handleConfirm = () => {
    const newErrors: { reason?: string; date?: string } = {};
    if (!reason) newErrors.reason = "Termination reason is required";
    if (!terminationDate) newErrors.date = "Termination date is required";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setESignOpen(true);
  };

  const handleESignConfirm = (_esignReason: string) => {
    onConfirm(reason, terminationDate);
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
          key="terminate-modal-wrapper"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden"
        >
          {/* Backdrop */}
          <motion.div
            key="terminate-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={handleClose}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            key="terminate-modal-content"
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
            <div className="flex items-start gap-3 p-4 md:p-5 border-b border-slate-100 bg-white min-h-[64px] shrink-0">
              <div className="flex-1 min-w-0">
                <h2 className="text-sm md:text-base lg:text-lg font-semibold text-slate-900">Terminate Employee</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Terminating <span className="font-semibold text-slate-700">{userName}</span>
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
            <div className="p-4 md:p-5 space-y-4 overflow-y-auto flex-1 min-h-0">
              <div>
                <Select
                  label={<>Reason <span className="text-red-500">*</span></>}
                  value={reason}
                  onChange={(v) => {
                    setReason(v);
                    setErrors((e) => ({ ...e, reason: undefined }));
                  }}
                  options={TERMINATION_REASON_OPTIONS}
                  placeholder="Select termination reason"
                />
                {errors.reason && <p className="text-xs text-red-600 mt-1">{errors.reason}</p>}
              </div>

              <div>
                <DateTimePicker
                  label={<>Termination Date <span className="text-red-500">*</span></>}
                  value={terminationDate}
                  onChange={(v) => {
                    setTerminationDate(v);
                    setErrors((e) => ({ ...e, date: undefined }));
                  }}
                  placeholder="Select termination date"
                />
                {errors.date && <p className="text-xs text-red-600 mt-1">{errors.date}</p>}
              </div>

              <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 leading-relaxed">
                The user's account will be permanently deactivated. All historical records, documents, and audit trail entries will be preserved.
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 px-5 pb-5 pt-2 bg-white shrink-0">
              <Button variant="outline" size="sm" onClick={handleClose}>
                Cancel
              </Button>
              <Button size="sm" variant="destructive" onClick={handleConfirm}>
                Terminate Employee
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
        actionTitle={`Terminate Employee: ${userName}`}
      />
    </>
  );
};
