import React from "react";
import { createPortal } from "react-dom";
import { Award, Download, X as XIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button/Button";
import { Badge } from "@/components/ui/badge/Badge";
import { FormModal } from "@/components/ui/modal/FormModal";
import { cn } from "@/components/ui/utils";
import { formatDate } from "@/utils/format";
import type { Certification } from "../types";

interface CertPreviewModalProps {
  isOpen: boolean; // Added isOpen prop for external control
  cert: Certification | null; // Allow null when closing
  onClose: () => void;
}

export const CertPreviewModal: React.FC<CertPreviewModalProps> = ({ isOpen, cert, onClose }) => {
  if (!cert && !isOpen) return null;

  const isImage = cert?.fileType?.startsWith("image/");
  const isPdf = cert?.fileType === "application/pdf";
  const isExpired = cert?.expiryDate ? new Date(cert.expiryDate) < new Date() : false;

  const handleDownload = () => {
    if (!cert?.fileObjectUrl || !cert?.fileName) return;
    const a = document.createElement("a");
    a.href = cert.fileObjectUrl;
    a.download = cert.fileName;
    a.click();
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={cert?.name || "Certificate Preview"}
      description={cert?.issuingOrg}
      size="xl"
      showFooter={cert?.fileObjectUrl && cert?.fileName ? true : false}
      confirmText="Download"
      onConfirm={handleDownload}
    >
      <div className="flex flex-col h-full min-h-0">
        {/* Info grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5 pb-5 border-b border-slate-100 bg-white shrink-0">
          <div>
            <p className="text-[10px] sm:text-xs text-slate-400 mb-0.5">Issue Date</p>
            <p className="text-sm font-semibold text-slate-700">
              {cert?.issueDate ? formatDate(cert.issueDate) : "—"}
            </p>
          </div>
          <div>
            <p className="text-[10px] sm:text-xs text-slate-400 mb-0.5">Expiry Date</p>
            <p className={cn("text-sm font-semibold", isExpired ? "text-red-600" : "text-slate-700")}>
              {cert?.expiryDate ? formatDate(cert.expiryDate) : "No expiry"}
            </p>
          </div>
          <div>
            <p className="text-[10px] sm:text-xs text-slate-400 mb-0.5">Status</p>
            {isExpired ? (
              <Badge color="red" size="sm" pill>Expired</Badge>
            ) : (
              <Badge color="emerald" size="sm" pill>Valid</Badge>
            )}
          </div>
          {cert?.fileName && (
            <div>
              <p className="text-[10px] sm:text-xs text-slate-400 mb-0.5">File</p>
              <p className="text-sm font-semibold text-slate-700 truncate">{cert.fileName}</p>
            </div>
          )}
        </div>

        {/* File preview */}
        <div className="flex-1 min-h-0">
          {cert?.fileObjectUrl ? (
            isImage ? (
              <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center p-2 min-h-[200px]">
                <img
                  src={cert.fileObjectUrl}
                  alt={cert.name}
                  className="max-w-full max-h-[400px] object-contain shadow-sm"
                />
              </div>
            ) : isPdf ? (
              <iframe
                src={cert.fileObjectUrl}
                className="w-full h-[420px] rounded-lg border border-slate-200 shadow-sm"
                title={cert.name}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 rounded-lg border-2 border-dashed border-slate-200 gap-3 bg-slate-50/30">
                <div className="h-14 w-14 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                  <Award className="h-7 w-7 text-slate-300" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-700">{cert?.fileName}</p>
                  {cert?.fileSize != null && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      {(cert.fileSize / 1024).toFixed(1)} KB
                    </p>
                  )}
                </div>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-12 rounded-lg border-2 border-dashed border-slate-100 gap-3 bg-slate-50/10">
              <Award className="h-10 w-10 text-slate-200" />
              <p className="text-sm font-medium text-slate-400 italic">No file attached to this certificate</p>
            </div>
          )}
        </div>
      </div>
    </FormModal>
  );
};
