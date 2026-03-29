import React from "react";
import { createPortal } from "react-dom";
import { Award, Download, X as XIcon } from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import { Badge } from "@/components/ui/badge/Badge";
import { cn } from "@/components/ui/utils";
import { formatDate } from "@/utils/format";
import type { Certification } from "../types";

interface CertPreviewModalProps {
  cert: Certification;
  onClose: () => void;
}

export const CertPreviewModal: React.FC<CertPreviewModalProps> = ({ cert, onClose }) => {
  const isImage = cert.fileType?.startsWith("image/");
  const isPdf = cert.fileType === "application/pdf";
  const isExpired = cert.expiryDate ? new Date(cert.expiryDate) < new Date() : false;

  const handleDownload = () => {
    if (!cert.fileObjectUrl || !cert.fileName) return;
    const a = document.createElement("a");
    a.href = cert.fileObjectUrl;
    a.download = cert.fileName;
    a.click();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-xl shadow-2xl w-full max-w-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-emerald-600 flex-shrink-0"><Award className="h-4 w-4" /></span>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-slate-800 truncate">{cert.name}</h3>
              <p className="text-xs text-slate-500">{cert.issuingOrg}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
            {cert.fileObjectUrl && cert.fileName && (
              <Button variant="outline" size="xs" onClick={handleDownload}>
                <Download className="h-3.5 w-3.5" />
                Download
              </Button>
            )}
            <button
              onClick={onClose}
              className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-5">
          {/* Info grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5 pb-5 border-b border-slate-100">
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Issue Date</p>
              <p className="text-sm font-semibold text-slate-700">
                {cert.issueDate ? formatDate(cert.issueDate) : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Expiry Date</p>
              <p className={cn("text-sm font-semibold", isExpired ? "text-red-600" : "text-slate-700")}>
                {cert.expiryDate ? formatDate(cert.expiryDate) : "No expiry"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Status</p>
              {isExpired ? (
                <Badge color="red" size="sm" pill>Expired</Badge>
              ) : (
                <Badge color="emerald" size="sm" pill>Valid</Badge>
              )}
            </div>
            {cert.fileName && (
              <div>
                <p className="text-xs text-slate-400 mb-0.5">File</p>
                <p className="text-sm font-semibold text-slate-700 truncate">{cert.fileName}</p>
              </div>
            )}
          </div>

          {/* File preview */}
          {cert.fileObjectUrl ? (
            isImage ? (
              <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center p-2">
                <img
                  src={cert.fileObjectUrl}
                  alt={cert.name}
                  className="max-w-full max-h-[400px] object-contain"
                />
              </div>
            ) : isPdf ? (
              <iframe
                src={cert.fileObjectUrl}
                className="w-full h-[420px] rounded-lg border border-slate-200"
                title={cert.name}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 rounded-lg border-2 border-dashed border-slate-200 gap-3">
                <div className="h-14 w-14 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Award className="h-7 w-7 text-slate-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-600">{cert.fileName}</p>
                  {cert.fileSize != null && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      {(cert.fileSize / 1024).toFixed(1)} KB
                    </p>
                  )}
                </div>
                <Button variant="default" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                  Download File
                </Button>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-12 rounded-lg border-2 border-dashed border-slate-200 gap-3">
              <Award className="h-10 w-10 text-slate-300" />
              <p className="text-sm font-medium text-slate-500">No file attached to this certificate</p>
            </div>
          )}
        </div>
      </div>
    </div>,
    window.document.body
  );
};
