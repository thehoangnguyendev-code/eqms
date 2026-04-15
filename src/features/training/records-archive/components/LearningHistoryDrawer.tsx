import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  History,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Award,
  Calendar,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import { Badge } from "@/components/ui/badge/Badge";
import { cn } from "@/components/ui/utils";
import type { EmployeeTrainingFile, CompletedCourseRecord } from "../../types";
import { motion, AnimatePresence } from "framer-motion";

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

// ─── History Node ─────────────────────────────────────────────────────────────
interface HistoryNodeProps {
  course: CompletedCourseRecord;
  isLatest: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onViewCertificate: (course: CompletedCourseRecord) => void;
}

const HistoryNode: React.FC<HistoryNodeProps> = ({
  course,
  isLatest,
  isExpanded,
  onToggle,
  onViewCertificate
}) => {
  return (
    <div className={cn(
      "border transition-all duration-300 rounded-xl overflow-hidden bg-white",
      isExpanded ? "border-emerald-200 shadow-md" : "border-slate-200 shadow-sm hover:border-slate-300"
    )}>
      {/* Node Header */}
      <button
        onClick={onToggle}
        className={cn(
          "w-full text-left px-4 py-3 flex items-center justify-between transition-colors relative z-10",
          isExpanded ? "bg-emerald-50/20" : "bg-slate-50/30 hover:bg-slate-100/50"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-900 text-white text-xs font-medium">
              {course.version}
            </span>
            <Badge color={course.status === "Pass" ? "emerald" : "red"} size="xs">
              {course.status === "Pass" ? "PASSED" : "FAILED"}
            </Badge>
            {isLatest && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium uppercase">
                Active
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-slate-600 truncate max-w-[180px]">
            {course.courseCode}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-emerald-600" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          )}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-5 border-t border-slate-100 space-y-8">
              {/* Training Outcome Section - Flat Integrated Style */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-emerald-600" />
                    <h3 className="text-sm font-semibold text-slate-800 tracking-tight">Training Outcome</h3>
                  </div>
                  <Badge color={course.score >= course.passingScore ? "emerald" : "red"} size="xs">Grade: {course.score}%</Badge>
                </div>
                <div className="h-px bg-slate-100 w-full" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                      <Award className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-[12px] font-medium text-slate-700">Passing Requirement</p>
                      <p className="text-sm font-semibold text-slate-900">{course.passingScore}% or higher</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                      <Calendar className="h-4 w-4 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-[12px] font-medium text-slate-700">Record Validity</p>
                      <p className="text-sm font-semibold text-slate-800 uppercase">{course.expiryDate || "NEVER EXPIRES"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compliance Verification Section */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <h3 className="text-sm font-semibold text-slate-800 tracking-tight">Compliance Verification</h3>
                </div>
                <div className="h-px bg-slate-100 w-full" />

                <div className="divide-y divide-slate-100">
                  {[
                    { label: "E-Signed By (Trainee)", value: course.traineeName },
                    { label: "Trainee Signature Timestamp", value: course.traineeEsignDate },
                    { label: "Verified By (Trainer)", value: course.trainerName },
                    { label: "Trainer Verification Timestamp", value: course.trainerEsignDate },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center gap-4 py-2.5">
                      <span className="w-[180px] shrink-0 text-xs text-slate-600 font-normal">{label}</span>
                      <span className="text-xs font-normal text-slate-800">{value || "—"}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end">
                <Button
                  variant="outline-emerald"
                  size="xs"
                  className="gap-2"
                  onClick={() => onViewCertificate(course)}
                >
                  View Certificate ({course.version})
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Main Drawer ──────────────────────────────────────────────────────────────
export interface LearningHistoryDrawerProps {
  employee: EmployeeTrainingFile;
  onClose: () => void;
  onViewCertificate: (course: CompletedCourseRecord) => void;
}

export const LearningHistoryDrawer: React.FC<LearningHistoryDrawerProps> = ({
  employee,
  onClose,
  onViewCertificate
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const isMobile = useIsMobile();
  const history = employee.completedCourses ?? [];

  // Sort by date (descending)
  const sorted = [...history].sort((a, b) =>
    new Date(b.completionDate).getTime() - new Date(a.completionDate).getTime()
  );

  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    new Set(sorted[0]?.id ? [sorted[0].id] : [])
  );

  const isAllExpanded = expandedNodes.size === sorted.length && sorted.length > 0;

  const toggleAll = () => {
    if (isAllExpanded) {
      setExpandedNodes(new Set());
    } else {
      setExpandedNodes(new Set(sorted.map(s => s.id)));
    }
  };

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Dragging / Bottom Sheet State
  const [drawerHeight, setDrawerHeight] = useState(88); // vh
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = React.useRef(0);
  const dragStartHeight = React.useRef(88);

  const MAX_HEIGHT = 100;
  const CLOSE_THRESHOLD = 25;

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

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center md:justify-end">
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
        .custom-drawer-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(203, 213, 225, 0.4) transparent;
          scrollbar-gutter: stable;
        }
        .custom-drawer-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-drawer-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-drawer-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(203, 213, 225, 0.4);
          border-radius: 10px;
        }
        .custom-drawer-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.6);
        }
        @keyframes marker-pulse-emerald {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6); }
          70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        @keyframes marker-pulse-slate {
          0% { box-shadow: 0 0 0 0 rgba(15, 23, 42, 0.4); }
          70% { box-shadow: 0 0 0 8px rgba(15, 23, 42, 0); }
          100% { box-shadow: 0 0 0 0 rgba(15, 23, 42, 0); }
        }
        .animate-pulse-emerald {
          animation: marker-pulse-emerald 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-pulse-slate {
          animation: marker-pulse-slate 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
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
            : (isMobile ? (!isDragging && "mobile-drawer-enter") : "desktop-drawer-enter")
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
              <p className="text-[11px] text-slate-400 font-medium leading-none mb-1">Learning History</p>
              <p className="text-sm font-bold text-slate-800 truncate leading-none">{employee.employeeName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
              {employee.employeeId}
            </span>
            <button
              onClick={handleClose}
              className="flex-shrink-0 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Global Actions Toggle */}
        {sorted.length > 0 && (
          <div className="px-4 pt-2 pb-2.5 border-b border-slate-200 flex items-center justify-start bg-slate-50/10 shrink-0">
            <Button
              variant="outline-emerald"
              size="sm"
              onClick={toggleAll}
            >
              {isAllExpanded ? (
                <>
                  <Minimize2 className="h-3 w-3 mr-2" />
                  Collapse All
                </>
              ) : (
                <>
                  <Maximize2 className="h-3 w-3 mr-2" />
                  Expand All
                </>
              )}
            </Button>
          </div>
        )}

        {/* Body */}
        <div
          className="flex-1 overflow-y-auto px-4 pb-4 pt-0 space-y-4 bg-slate-50/30 custom-drawer-scrollbar"
          style={{
            WebkitOverflowScrolling: "touch",
            overscrollBehavior: "contain"
          }}
        >
          {sorted.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl py-10 text-center px-4 flex flex-col items-center shadow-sm mt-4">
              <History className="h-10 w-10 text-slate-200 mb-3" />
              <p className="text-sm font-bold text-slate-700">No training history found</p>
              <p className="text-xs text-slate-400 mt-1">This employee has not completed any courses yet.</p>
            </div>
          ) : (
            <div className="relative pl-8 pr-1 pt-4 pb-4 space-y-6">
              {/* Vertical Timeline Line */}
              <div className="absolute left-4 top-0 bottom-6 w-px bg-slate-200" />

              {sorted.map((course, idx) => (
                <div key={course.id} className="relative">
                  {/* Timeline Marker */}
                  <div className={cn(
                    "absolute -left-6 top-[14px] w-4 h-4 rounded-full border-[3px] border-white z-10 transition-all duration-300 shadow-sm",
                    expandedNodes.has(course.id)
                      ? (idx === 0
                        ? "bg-emerald-700 ring-4 ring-emerald-100 animate-pulse-emerald"
                        : "bg-emerald-500 ring-4 ring-emerald-50 animate-pulse-emerald")
                      : (idx === 0 ? "bg-emerald-600 ring-4 ring-emerald-100" : "bg-slate-300 ring-4 ring-slate-50")
                  )} />

                  <HistoryNode
                    course={course}
                    isLatest={idx === 0}
                    isExpanded={expandedNodes.has(course.id)}
                    onToggle={() => toggleNode(course.id)}
                    onViewCertificate={onViewCertificate}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200 bg-white shrink-0 flex items-center justify-between">
          <p className="text-xs font-medium text-slate-400 tracking-tight">
            {sorted.length} Record{sorted.length !== 1 ? "s" : ""}
          </p>
          <Button variant="outline" size="sm" onClick={handleClose}>Close</Button>
        </div>
      </div>
    </div>,
    document.body
  );
};
