import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  History,
  Clock,
  FileText,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import { StatusBadge } from "@/components/ui/badge";
import type { StatusType } from "@/components/ui/badge";
import { cn } from "@/components/ui/utils";
import type { TrainingMaterial, MaterialVersionEntry } from "@/features/training/materials/types";

// ─── Animation styles (same as CellDetailDrawer) ─────────────────────────────
const DRAWER_STYLES = `
  @keyframes vhSlideInRight  { from { transform: translateX(calc(100% + 20px)); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  @keyframes vhSlideInBottom { from { transform: translateY(calc(100% + 16px)); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes vhSlideOutRight  { from { transform: translateX(0); opacity: 1; } to { transform: translateX(calc(100% + 20px)); opacity: 0; } }
  @keyframes vhSlideOutBottom { from { transform: translateY(0); opacity: 1; } to { transform: translateY(calc(100% + 16px)); opacity: 0; } }
  @keyframes vhFadeIn  { from { opacity: 0; } to { opacity: 1; } }
  @keyframes vhFadeOut { from { opacity: 1; } to { opacity: 0; } }
  .vh-drawer-enter { animation-duration: 0.32s; animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1); animation-fill-mode: forwards; }
  .vh-drawer-exit  { animation-duration: 0.22s; animation-timing-function: cubic-bezier(0.4, 0, 1, 1);   animation-fill-mode: forwards; }
  @media (max-width: 767px) {
    .vh-drawer-enter { animation-name: vhSlideInBottom; }
    .vh-drawer-exit  { animation-name: vhSlideOutBottom; }
  }
  @media (min-width: 768px) {
    .vh-drawer-enter { animation-name: vhSlideInRight; }
    .vh-drawer-exit  { animation-name: vhSlideOutRight; }
  }
  .vh-backdrop-enter { animation: vhFadeIn  0.25s ease-out forwards; }
  .vh-backdrop-exit  { animation: vhFadeOut 0.22s ease-in  forwards; }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (d?: string): string => {
  if (!d) return "—";
  const m = d.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) return `${m[1]}/${m[2]}/${m[3]}`;
  const iso = d.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`;
  return d;
};

const statusToType = (status: MaterialVersionEntry["status"]): StatusType => {
  switch (status) {
    case "Draft": return "draft";
    case "Pending Review": return "pendingReview";
    case "Pending Approval": return "pendingApproval";
    case "Effective": return "effective";
    case "Obsoleted": return "obsolete";
    default: return "draft";
  }
};

const READ_ONLY_CLASS =
  "w-full h-9 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-default";

// ─── Version Card ─────────────────────────────────────────────────────────────
interface VersionCardProps {
  entry: MaterialVersionEntry;
  isLatest: boolean;
  fileType?: string;
}

const VersionCard: React.FC<VersionCardProps> = ({ entry, isLatest, fileType }) => {
  const [showNotes, setShowNotes] = useState(false);

  return (
    <div className="border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Card Header */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-900 text-white text-[11px] font-bold tracking-wide">
            v{entry.version}
          </span>
          <StatusBadge status={statusToType(entry.status)} size="sm" />
          {isLatest && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
              Current
            </span>
          )}
        </div>
      </div>

      {/* Inline Preview */}
      {entry.fileUrl && (
        <div className="mx-4 mt-3 mb-0 rounded-lg border border-slate-200 bg-slate-50 p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="h-4 w-4 text-slate-500 flex-shrink-0" />
            <span className="text-xs text-slate-700 font-medium truncate">
              {fileType ? `${fileType} · ` : ""}
              {entry.fileSize ? `${entry.fileSize} · ` : ""}
              v{entry.version}
            </span>
          </div>
          <a
            href={entry.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold hover:underline flex-shrink-0"
          >
            Open File <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}

      {/* Form-style Body */}
      <div className="p-4 space-y-4">
        {/* Row 1: Created */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs sm:text-sm font-medium text-slate-700">
              Created By
            </label>
            <input
              type="text"
              readOnly
              value={entry.uploadedBy || ""}
              placeholder="—"
              className={READ_ONLY_CLASS}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs sm:text-sm font-medium text-slate-700">
              Created On
            </label>
            <input
              type="text"
              readOnly
              value={formatDate(entry.uploadedAt)}
              placeholder="—"
              className={cn(READ_ONLY_CLASS, "text-slate-500")}
            />
          </div>
        </div>

        {/* Row 2: Reviewed */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs sm:text-sm font-medium text-slate-700">
              Reviewed By
            </label>
            <input
              type="text"
              readOnly
              value={entry.reviewedBy || ""}
              placeholder="—"
              className={READ_ONLY_CLASS}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs sm:text-sm font-medium text-slate-700">
              Reviewed On
            </label>
            <input
              type="text"
              readOnly
              value={formatDate(entry.reviewedAt)}
              placeholder="—"
              className={cn(READ_ONLY_CLASS, "text-slate-500")}
            />
          </div>
          {entry.reviewComment && (
            <div className="col-span-1 md:col-span-2 flex flex-col gap-1.5">
              <label className="text-xs sm:text-sm font-medium text-slate-700">
                Review Comments
              </label>
              <div className="w-full p-2.5 bg-amber-50/40 border border-amber-100 rounded-lg text-xs text-slate-600 leading-relaxed italic">
                "{entry.reviewComment}"
              </div>
            </div>
          )}
        </div>

        {/* Row 3: Approved */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs sm:text-sm font-medium text-slate-700">
              Approved By
            </label>
            <input
              type="text"
              readOnly
              value={entry.approvedBy || ""}
              placeholder="—"
              className={READ_ONLY_CLASS}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs sm:text-sm font-medium text-slate-700">
              Approved On
            </label>
            <input
              type="text"
              readOnly
              value={formatDate(entry.approvedAt)}
              placeholder="—"
              className={cn(READ_ONLY_CLASS, "text-slate-500")}
            />
          </div>
          {entry.approvalComment && (
            <div className="col-span-1 md:col-span-2 flex flex-col gap-1.5">
              <label className="text-xs sm:text-sm font-medium text-slate-700">
                Approval Comments
              </label>
              <div className="w-full p-2.5 bg-emerald-50/40 border border-emerald-100 rounded-lg text-xs text-slate-600 leading-relaxed italic">
                "{entry.approvalComment}"
              </div>
            </div>
          )}
        </div>


        {/* Revision Notes */}
        {entry.revisionNotes && (
          <div className="pt-2">
            <button
              onClick={() => setShowNotes((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-slate-600 transition-colors"
            >
              <FileText className="h-3.5 w-3.5" />
              Revision Notes
              {showNotes ? <ChevronUp className="h-3 w-3 ml-auto" /> : <ChevronDown className="h-3 w-3 ml-auto" />}
            </button>
            {showNotes && (
              <div className="mt-2 p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                {entry.revisionNotes}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Drawer ──────────────────────────────────────────────────────────────
export interface VersionHistoryDrawerProps {
  material: TrainingMaterial;
  onClose: () => void;
}

export const VersionHistoryDrawer: React.FC<VersionHistoryDrawerProps> = ({ material, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);
  const history = material.versionHistory ?? [];
  // Show newest version first
  const sorted = [...history].reverse();

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 280);
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-center md:justify-end items-end md:items-center pointer-events-none">
      <style>{DRAWER_STYLES}</style>

      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-slate-900/50 backdrop-blur-[3px] pointer-events-auto",
          isClosing ? "vh-backdrop-exit" : "vh-backdrop-enter"
        )}
        onClick={handleClose}
      />

      {/* Floating Drawer Panel */}
      <div
        className={cn(
          "pointer-events-auto bg-white flex flex-col relative",
          "shadow-[0_24px_64px_-12px_rgba(0,0,0,0.25),0_8px_24px_-8px_rgba(0,0,0,0.12)] ring-1 ring-slate-200/60",
          "overflow-hidden",
          "w-[calc(100%-24px)] mx-3 mb-3 h-[88vh] rounded-2xl",
          "md:w-[500px] md:mx-0 md:mr-4 md:h-[calc(100vh-32px)] md:rounded-2xl",
          isClosing ? "vh-drawer-exit" : "vh-drawer-enter"
        )}
      >
        {/* Mobile drag handle */}
        <div className="md:hidden flex justify-center pt-3 pb-1 shrink-0 bg-white">
          <div className="h-1 w-10 bg-slate-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <History className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-slate-400 font-medium">Version History</p>
              <p className="text-sm font-bold text-slate-800 truncate">{material.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wide">
              {material.materialId}
            </span>
            <button
              onClick={handleClose}
              className="flex-shrink-0 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/30 scroll-smooth" style={{ WebkitOverflowScrolling: "touch" }}>
          {/* Material summary card */}
          <div className="border border-slate-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
              <FileText className="h-4 w-4 text-slate-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-emerald-700 font-medium mb-0.5">Current Version</p>
              <p className="text-sm font-semibold text-slate-900 truncate">{material.title}</p>
              <p className="text-xs text-slate-500">
                v{material.version} · {material.type} · {material.department}
              </p>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-[10px] text-slate-400 font-medium mb-0.5">Last Updated</p>
              <p className="text-xs font-semibold text-slate-700">{formatDate(material.uploadedAt)}</p>
            </div>
          </div>

          {/* History count badge */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <History className="h-3.5 w-3.5 text-slate-600" />
              <span className="text-sm font-semibold text-slate-600">
                Version History
              </span>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
              {sorted.length} {sorted.length === 1 ? "version" : "versions"}
            </span>
          </div>

          {/* Version list */}
          {sorted.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-xl shadow-sm flex flex-col items-center justify-center py-10 text-center px-5">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <AlertCircle className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-700">No version history</p>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                This material has not been through any previous revisions.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sorted.map((entry, idx) => (
                <VersionCard
                  key={entry.version}
                  entry={entry}
                  isLatest={idx === 0}
                  fileType={material.type}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 bg-white shrink-0 flex items-center justify-between">
          <p className="text-xs text-red-700">
            {sorted.length} revision{sorted.length !== 1 ? "s" : ""} recorded
          </p>
          <Button variant="outline" size="sm" onClick={handleClose}>
            Close
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};
