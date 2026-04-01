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
import { IconMessage2 } from "@tabler/icons-react";

// Hook to detect mobile screen
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  return isMobile;
};

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

// ─── Version Card ─────────────────────────────────────────────────────────────
interface VersionCardProps {
  entry: MaterialVersionEntry;
  isLatest: boolean;
  fileType?: string;
}

const VersionCard: React.FC<VersionCardProps> = ({ entry, isLatest, fileType }) => {
  const [showNotes, setShowNotes] = useState(false);

  return (
    <div className="border border-slate-200 rounded-xl shadow-sm overflow-hidden bg-white">
      {/* Card Header */}
      <div className="px-4 pt-3.5 pb-2.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/30">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-slate-900 text-white text-[10px] sm:text-[11px] font-bold tracking-wide">
            v{entry.version}
          </span>
          <StatusBadge status={statusToType(entry.status)} size="sm" />
          {isLatest && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
              Current
            </span>
          )}
        </div>
      </div>

      {/* Inline Preview */}
      {entry.fileUrl && (
        <div className="mx-4 mt-3 mb-0 rounded-lg border border-slate-200 bg-slate-50 p-2.5 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
            <span className="text-[11px] text-slate-700 font-medium truncate">
              {fileType ? `${fileType} · ` : ""}
              v{entry.version}
            </span>
          </div>
          <a
            href={entry.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-bold hover:underline shrink-0"
          >
            Open <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}

      {/* Form-style Body */}
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Created By</label>
            <p className="text-sm font-bold text-slate-800">{entry.uploadedBy || "—"}</p>
            <p className="text-[10px] text-slate-400 font-medium">{formatDate(entry.uploadedAt)}</p>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Reviewed By</label>
            <p className="text-sm font-bold text-slate-800">{entry.reviewedBy || "—"}</p>
            <p className="text-[10px] text-slate-400 font-medium">{formatDate(entry.reviewedAt)}</p>
          </div>
        </div>

        {entry.reviewComment && (
          <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-2.5">
            <p className="text-[10px] font-bold text-amber-700 uppercase mb-1">Reviewer Comment</p>
            <p className="text-xs text-slate-600 italic">"{entry.reviewComment}"</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Approved By</label>
            <p className="text-sm font-bold text-slate-800">{entry.approvedBy || "—"}</p>
            <p className="text-[10px] text-slate-400 font-medium">{formatDate(entry.approvedAt)}</p>
          </div>
          {entry.approvalComment && (
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-2.5 col-span-1 sm:col-span-1">
              <p className="text-[10px] font-bold text-emerald-700 uppercase mb-1">Approver Comment</p>
              <p className="text-xs text-slate-600 italic">"{entry.approvalComment}"</p>
            </div>
          )}
        </div>

        {entry.revisionNotes && (
          <div className="pt-1 border-t border-slate-100 mt-2">
            <button
               onClick={() => setShowNotes((v) => !v)}
               className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-600 transition-colors w-full py-1"
            >
              <IconMessage2 className="h-3 w-3" />
              Notes
              {showNotes ? <ChevronUp className="h-3 w-3 ml-auto" /> : <ChevronDown className="h-3 w-3 ml-auto" />}
            </button>
            {showNotes && (
              <div className="mt-1 p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-600 leading-relaxed whitespace-pre-wrap italic">
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
  const isMobile = useIsMobile();
  const history = material.versionHistory ?? [];
  const sorted = [...history].reverse();

  // Dragging / Bottom Sheet State
  const [drawerHeight, setDrawerHeight] = useState(88); // vh
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = React.useRef(0);
  const dragStartHeight = React.useRef(88);

  const MIN_HEIGHT = 40;
  const MAX_HEIGHT = 100;
  const CLOSE_THRESHOLD = 25;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
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

  // Handling both touch AND mouse events for better desktop-mobile-simulation testing
  const handleDragStart = (clientY: number) => {
      setIsDragging(true);
      dragStartY.current = clientY;
      dragStartHeight.current = drawerHeight;
  };

  const handleDragMove = (clientY: number) => {
      if (!isDragging) return;
      const viewportHeight = window.innerHeight;
      const deltaY = dragStartY.current - clientY;
      const deltaVh = (deltaY / viewportHeight) * 100;
      
      let newHeight = dragStartHeight.current + deltaVh;
      newHeight = Math.max(0, Math.min(MAX_HEIGHT, newHeight));
      setDrawerHeight(newHeight);
  };

  const handleDragEnd = () => {
      setIsDragging(false);
      if (drawerHeight < CLOSE_THRESHOLD) {
          handleClose();
      } else {
          setDrawerHeight(88); // Snap back to 88
      }
  };

  useEffect(() => {
      if (!isDragging) return;
      const onMove = (e: MouseEvent) => handleDragMove(e.clientY);
      const onEnd = () => handleDragEnd();
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onEnd);
      return () => {
          document.removeEventListener("mousemove", onMove);
          document.removeEventListener("mouseup", onEnd);
      };
  }, [isDragging, drawerHeight]);

  const handleTouchStart = (e: React.TouchEvent) => handleDragStart(e.touches[0].clientY);
  const handleTouchMove = (e: React.TouchEvent) => handleDragMove(e.touches[0].clientY);
  const handleTouchEnd = () => handleDragEnd();

  const isFullHeight = drawerHeight >= 98;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:justify-end">
      <style>{`
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideOutRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
        @keyframes slideInBottom { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes slideOutBottom { from { transform: translateY(0); opacity: 1; } to { transform: translateY(100%); opacity: 0; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
        .desktop-drawer-enter { animation: slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .desktop-drawer-exit { animation: slideOutRight 0.25s cubic-bezier(0.4, 0, 1, 1) forwards; }
        .mobile-drawer-enter { animation: slideInBottom 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .mobile-drawer-exit { animation: slideOutBottom 0.3s cubic-bezier(0.4, 0, 1, 1) forwards; }
        .backdrop-enter { animation: fadeIn 0.3s ease-out forwards; }
        .backdrop-exit { animation: fadeOut 0.25s ease-in forwards; }
      `}</style>

      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-slate-900/60 backdrop-blur-sm pointer-events-auto",
          isClosing ? "backdrop-exit" : "backdrop-enter"
        )}
        onClick={handleClose}
      />

      {/* Drawer Panel */}
      <div
        className={cn(
          "pointer-events-auto bg-white flex flex-col relative overflow-hidden shadow-2xl",
          isMobile 
            ? cn("w-full transition-all flex flex-col", isFullHeight ? "rounded-none" : "rounded-t-2xl") 
            : "w-[500px] h-[calc(100vh-32px)] mr-4 rounded-2xl border border-slate-200",
          isClosing 
            ? (isMobile ? "mobile-drawer-exit" : "desktop-drawer-exit") 
            : (isMobile ? (!isDragging && "mobile-drawer-enter") : "desktop-drawer-enter"),
        )}
        style={isMobile ? {
          height: `${drawerHeight}dvh`,
          transition: isDragging ? 'none' : 'transform 400ms cubic-bezier(0.16, 1, 0.3, 1), height 400ms cubic-bezier(0.16, 1, 0.3, 1), border-radius 200ms ease',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          paddingTop: isFullHeight ? 'env(safe-area-inset-top, 0px)' : '0px',
        } : {}}
      >
        {/* Mobile Drag Handle */}
        {isMobile && (
          <div 
            className="flex flex-col items-center py-3 cursor-grab active:cursor-grabbing select-none touch-none bg-white shrink-0"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={(e) => handleDragStart(e.clientY)}
          >
            <div className={cn(
              "rounded-full transition-all duration-200",
              isDragging ? "w-20 h-1.5 bg-slate-400" : "w-12 h-1 bg-slate-200 hover:bg-slate-300"
            )} />
          </div>
        )}

        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <History className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-slate-400 font-medium">History</p>
              <p className="text-sm font-bold text-slate-800 truncate">{material.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
              {material.materialId}
            </span>
            <button
              onClick={handleClose}
              className="flex-shrink-0 p-1 rounded-lg hover:bg-slate-100"
              aria-label="Close"
            >
              <X className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div 
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30" 
          style={{ 
            WebkitOverflowScrolling: "touch",
            overscrollBehavior: "contain"
          }}
        >
          {/* Version list */}
          {sorted.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl py-10 text-center px-4 flex flex-col items-center shadow-sm">
              <History className="h-10 w-10 text-slate-200 mb-3" />
              <p className="text-sm font-bold text-slate-700">No revisions found</p>
              <p className="text-xs text-slate-400 mt-1">This material is in its first version.</p>
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
        <div className="px-5 py-3.5 border-t border-slate-200 bg-white shrink-0 flex items-center justify-between">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">
            {sorted.length} REVISION{sorted.length !== 1 ? "S" : ""}
          </p>
          <Button variant="outline" size="sm" onClick={handleClose}>Close</Button>
        </div>
      </div>
    </div>,
    document.body
  );
};
