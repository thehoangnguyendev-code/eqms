import React, { useState } from "react";
import { createPortal } from "react-dom";
import { UserX, X } from "lucide-react";
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

  if (!isOpen) return null;

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

  return (
    <>
      {createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={handleClose}
            aria-hidden="true"
          />
          <div className="relative z-50 w-full max-w-md bg-white rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start gap-3 p-5 border-b border-slate-100">
              <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                <UserX className="h-5 w-5 text-rose-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-slate-900">Terminate Employee</h2>
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
            <div className="p-5 space-y-4">
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
            <div className="flex justify-end gap-2 px-5 pb-5">
              <Button variant="outline" size="sm" onClick={handleClose}>
                Cancel
              </Button>
              <Button size="sm" variant="destructive" onClick={handleConfirm}>
                Terminate Employee
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
      <ESignatureModal
        isOpen={eSignOpen}
        onClose={() => setESignOpen(false)}
        onConfirm={handleESignConfirm}
        actionTitle={`Terminate Employee: ${userName}`}
      />
    </>
  );
};



