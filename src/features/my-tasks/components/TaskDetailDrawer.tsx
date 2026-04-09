import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/app/routes.constants";
import {
  X,
  AlertCircle,
  FileText,
  User,
  Calendar,
  History,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import { FullPageLoading } from "@/components/ui/loading/Loading";
import { cn } from "@/components/ui/utils";
import { FormSection } from "@/components/ui/form";
import type { Task } from "../types";
import {
  getModuleIcon,
  isOverdue,
  getPriorityColor,
} from "../utils";

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


export const TaskDetailDrawer: React.FC<{
  task: Task | null;
  onClose: () => void;
}> = ({ task, onClose }) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Dragging / Bottom Sheet State
  const [drawerHeight, setDrawerHeight] = useState(88); // vh
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(88);

  const MIN_HEIGHT = 40;
  const MAX_HEIGHT = 100;
  const CLOSE_THRESHOLD = 25;

  // Handle close with animation
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  // Body Scroll Lock & Escape key listener
  useEffect(() => {
    if (!task) return;
    document.body.style.overflow = "hidden";
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [task]);

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

  if (!task) return null;

  const overdue = isOverdue(task.dueDate) && task.status !== "Completed";
  const isDocumentReviewTask =
    task.module === "Document" && task.taskId.includes("REV");
  const isRevisionApprovalTask =
    task.module === "Document" && task.title.toLowerCase().includes("approve");

  const handleStartReview = () => {
    const docId = task.id;
    setIsNavigating(true);
    setTimeout(() => {
      navigate(ROUTES.DOCUMENTS.REVISIONS.REVIEW(docId));
      handleClose();
    }, 600);
  };

  const handleStartApproval = () => {
    const revisionId = task.id;
    setIsNavigating(true);
    setTimeout(() => {
      navigate(ROUTES.DOCUMENTS.REVISIONS.APPROVAL(revisionId));
      handleClose();
    }, 600);
  };

  const isFullHeight = drawerHeight >= 98;

  return (
    <>
      {createPortal(
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:justify-end">
          {/* Style for non-draggable MD animations (keeping consistent with legacy but cleaning up) */}
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
              isClosing ? "backdrop-exit" : "backdrop-enter",
            )}
            onClick={handleClose}
          />

          {/* Drawer Panel */}
          <div
            ref={drawerRef}
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
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                  task.module === "Training" ? "bg-emerald-100" :
                    task.module === "Document" ? "bg-amber-100" :
                      task.module === "Deviation" ? "bg-rose-100" :
                        task.module === "CAPA" ? "bg-blue-100" : "bg-slate-100"
                )}>
                  {(() => {
                    const ModuleIcon = getModuleIcon(task.module);
                    const iconColor =
                      task.module === "Training" ? "text-emerald-600" :
                        task.module === "Document" ? "text-amber-600" :
                          task.module === "Deviation" ? "text-rose-600" :
                            task.module === "CAPA" ? "text-blue-600" : "text-slate-600";
                    return <ModuleIcon className={cn("h-4 w-4", iconColor)} />;
                  })()}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-400 font-medium">{task.taskId} · {task.module}</p>
                  <p className="text-sm font-bold text-slate-800 truncate" title={task.title}>{task.title}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="flex-shrink-0 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>

            {/* Body */}
            <div 
              className="flex-1 overflow-y-auto p-5 scroll-smooth bg-slate-50/30 space-y-5" 
              style={{ 
                WebkitOverflowScrolling: "touch",
                overscrollBehavior: "contain"
              }}
            >
              {overdue && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3.5 flex items-start gap-3">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wide">Task Overdue</h4>
                    <p className="text-[11px] text-rose-600 mt-0.5">
                      Completed by {task.dueDate}. Immediate action required.
                    </p>
                  </div>
                </div>
              )}

              {/* Workflow Progress */}
              <FormSection title="Workflow Progress" icon={<Layers className="h-4 w-4" />}>
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completion Percentage</span>
                  <span className="text-sm font-bold text-emerald-600">{task.progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-700 ease-out", overdue ? "bg-rose-500" : "bg-emerald-500")}
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
              </FormSection>

              {/* Description */}
              <FormSection title="Task Description" icon={<FileText className="h-4 w-4" />}>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {task.description || "No description provided."}
                </p>
              </FormSection>

              {/* Assignment Grid */}
              <div className="grid grid-cols-2 gap-4">
                <FormSection title="Assigned To" icon={<User className="h-4 w-4" />}>
                  <div className="text-sm font-bold text-slate-800 truncate" title={task.assignee}>
                    {task.assignee}
                  </div>
                </FormSection>
                <FormSection title="Due Date" icon={<Calendar className="h-4 w-4" />}>
                  <div className={cn("text-sm font-bold", overdue ? "text-rose-600" : "text-slate-800")}>
                    {task.dueDate}
                  </div>
                </FormSection>
              </div>

              {/* Audit Trail */}
              <FormSection title="Audit Trail" icon={<History className="h-4 w-4" />}>
                <div className="relative border-l-2 border-slate-100 ml-1 space-y-5 pb-1">
                  {task.timeline && task.timeline.map((event, idx) => (
                    <div key={idx} className="relative pl-5">
                      <div className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full bg-white border-[3px] border-slate-200" />
                      <p className="text-sm font-bold text-slate-800">{event.action}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{event.date} by {event.user}</p>
                    </div>
                  ))}
                </div>
              </FormSection>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-white flex justify-end gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={handleClose}>Close</Button>
              {task.status !== "Completed" && (
                <Button 
                  onClick={isDocumentReviewTask ? handleStartReview : isRevisionApprovalTask ? handleStartApproval : undefined} 
                  variant="default" 
                  size="sm"
                >
                  {isDocumentReviewTask ? "Start Review" : isRevisionApprovalTask ? "Review & Approve" : "Process Task"}
                </Button>
              )}
            </div>
          </div>
        </div>,
        document.body,
      )}
      {isNavigating && <FullPageLoading text="Loading..." />}
    </>
  );
};
