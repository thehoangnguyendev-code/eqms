import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Award, Upload, X as XIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DateTimePicker } from "@/components/ui/datetime-picker/DateTimePicker";
import { Button } from "@/components/ui/button/Button";
import { cn } from "@/components/ui/utils";
import type { Certification } from "../types";

interface CertAddModalProps {
  isOpen: boolean; // Added isOpen prop for external control
  onClose: () => void;
  onSave: (data: Omit<Certification, "id">) => void;
  editing?: Certification | null;
}

export const CertAddModal: React.FC<CertAddModalProps> = ({ isOpen, onClose, onSave, editing }) => {
  const [name, setName] = useState(editing?.name ?? "");
  const [issuingOrg, setIssuingOrg] = useState(editing?.issuingOrg ?? "");
  const [issueDate, setIssueDate] = useState(editing?.issueDate ?? "");
  const [expiryDate, setExpiryDate] = useState(editing?.expiryDate ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Certificate name is required";
    if (!issuingOrg.trim()) errs.issuingOrg = "Issuing organization is required";
    return errs;
  };

  const handleSave = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSave({
      name: name.trim(),
      issuingOrg: issuingOrg.trim(),
      issueDate,
      expiryDate,
      fileObjectUrl: file ? URL.createObjectURL(file) : editing?.fileObjectUrl,
      fileName: file ? file.name : editing?.fileName,
      fileSize: file ? file.size : editing?.fileSize,
      fileType: file ? file.type : editing?.fileType,
    });
  };

  const portalContent = createPortal(
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="cert-add-modal-wrapper"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden"
        >
          {/* Backdrop */}
          <motion.div
            key="cert-add-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            key="cert-add-modal-content"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 350,
              duration: 0.3
            }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden relative z-10 flex flex-col"
            style={{ maxHeight: 'calc(100dvh - 2rem)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white min-h-[56px] shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="text-emerald-600"><Award className="h-4 w-4" /></span>
                <h3 className="text-sm font-semibold text-slate-800">
                  {editing ? "Edit Certificate" : "Add Certificate"}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Close"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1 min-h-0">
              {/* Certificate Name */}
              <div>
                <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
                  Certificate Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. ISO 9001 Lead Auditor"
                  className={cn(
                    "w-full h-9 px-3 text-sm border rounded-lg focus:outline-none focus:ring-1 transition-colors placeholder:text-slate-400",
                    errors.name
                      ? "border-red-400 focus:ring-red-400 focus:border-red-400"
                      : "border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
                  )}
                />
                {errors.name && <p className="text-xs text-red-600 font-medium mt-1.5">{errors.name}</p>}
              </div>

              {/* Issuing Organization */}
              <div>
                <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
                  Issuing Organization <span className="text-red-500">*</span>
                </label>
                <input
                  value={issuingOrg}
                  onChange={(e) => setIssuingOrg(e.target.value)}
                  placeholder="e.g. Bureau Veritas"
                  className={cn(
                    "w-full h-9 px-3 text-sm border rounded-lg focus:outline-none focus:ring-1 transition-colors placeholder:text-slate-400",
                    errors.issuingOrg
                      ? "border-red-400 focus:ring-red-400 focus:border-red-400"
                      : "border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
                  )}
                />
                {errors.issuingOrg && <p className="text-xs text-red-600 font-medium mt-1.5">{errors.issuingOrg}</p>}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <DateTimePicker
                    label="Issue Date"
                    value={issueDate}
                    onChange={setIssueDate}
                    placeholder="Select date"
                  />
                  {errors.issueDate && <p className="text-xs text-red-600 font-medium mt-1.5">{errors.issueDate}</p>}
                </div>
                <div>
                  <DateTimePicker
                    label="Expiry Date"
                    value={expiryDate}
                    onChange={setExpiryDate}
                    placeholder="No expiry"
                  />
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
                  Certificate File
                </label>
                <div
                  className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:border-emerald-300 hover:bg-emerald-50/30 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {file ? (
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <Upload className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
                        <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                        className="h-6 w-6 flex items-center justify-center rounded text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                      >
                        <XIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : editing?.fileName ? (
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <Upload className="h-4 w-4 text-slate-400" />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-medium text-slate-600 truncate">{editing.fileName}</p>
                        <p className="text-xs text-slate-400">Click to replace file</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <Upload className="h-6 w-6 text-slate-300 mx-auto" />
                      <p className="text-sm text-slate-500">Click to upload or drag &amp; drop</p>
                      <p className="text-xs text-slate-400">PDF, JPG, PNG, DOCX (max 10MB)</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.docx,.doc"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setFile(f);
                    e.target.value = "";
                  }}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
              <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
              <Button variant="default" size="sm" onClick={handleSave}>
                {editing ? "Save Changes" : "Add Certificate"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );

  return portalContent;
};
