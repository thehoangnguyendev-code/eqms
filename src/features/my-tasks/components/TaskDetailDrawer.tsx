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
} from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import { FullPageLoading } from "@/components/ui/loading/Loading";
import { cn } from "@/components/ui/utils";
import type { Task } from "../types";
import {
  getModuleIcon,
  isOverdue,
  getPriorityColor,
} from "../utils";

export const TaskDetailDrawer: React.FC<{
  task: Task | null;
  onClose: () => void;
}> = ({ task, onClose }) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const navigate = useNavigate();

  // Handle close with animation
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300); // Match animation duration
  };

  // Body Scroll Lock & Escape key listener
  useEffect(() => {
    if (!task) return;

    // Lock scroll
    document.body.style.overflow = "hidden";

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleEscape);

    return () => {
      // Unlock scroll
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [task]);

  if (!task) return null;

  const overdue = isOverdue(task.dueDate) && task.status !== "Completed";

  // Check if task is a document review task
  const isDocumentReviewTask =
    task.module === "Document" && task.taskId.includes("REV");

  // Check if task is a revision approval task
  const isRevisionApprovalTask =
    task.module === "Document" && task.title.toLowerCase().includes("approve");

  const handleStartReview = () => {
    // Extract document ID from taskId (e.g.,"SOP-REV-001" ->"1")
    const docId = task.id;
    setIsNavigating(true);
    setTimeout(() => {
      navigate(ROUTES.DOCUMENTS.REVISIONS.REVIEW(docId));
      handleClose();
    }, 600);
  };

  const handleStartApproval = () => {
    // Navigate to revision approval page
    const revisionId = task.id;
    setIsNavigating(true);
    setTimeout(() => {
      navigate(ROUTES.DOCUMENTS.REVISIONS.APPROVAL(revisionId));
      handleClose();
    }, 600);
  };

  // Using React Portal to render outside of the nested DOM structure (Fixes z-index issues)
  return (
    <>
      {createPortal(
        <div className="fixed inset-0 z-50 flex justify-center md:justify-end items-end md:items-center pointer-events-none">
          {/* Animation Styles */}
          <style>{`
 @keyframes slideInRight {
 from { transform: translateX(calc(100% + 20px)); opacity: 0; }
 to { transform: translateX(0); opacity: 1; }
 }
 @keyframes slideInBottom {
 from { transform: translateY(calc(100% + 16px)); opacity: 0; }
 to { transform: translateY(0); opacity: 1; }
 }
 @keyframes slideOutRight {
 from { transform: translateX(0); opacity: 1; }
 to { transform: translateX(calc(100% + 20px)); opacity: 0; }
 }
 @keyframes slideOutBottom {
 from { transform: translateY(0); opacity: 1; }
 to { transform: translateY(calc(100% + 16px)); opacity: 0; }
 }
 @keyframes fadeIn {
 from { opacity: 0; }
 to { opacity: 1; }
 }
 @keyframes fadeOut {
 from { opacity: 1; }
 to { opacity: 0; }
 }

 .responsive-drawer-enter {
 animation-duration: 0.32s;
 animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
 animation-fill-mode: forwards;
 }
 .responsive-drawer-exit {
 animation-duration: 0.22s;
 animation-timing-function: cubic-bezier(0.4, 0, 1, 1);
 animation-fill-mode: forwards;
 }

 @media (max-width: 767px) {
 .responsive-drawer-enter { animation-name: slideInBottom; }
 .responsive-drawer-exit { animation-name: slideOutBottom; }
 }
 @media (min-width: 768px) {
 .responsive-drawer-enter { animation-name: slideInRight; }
 .responsive-drawer-exit { animation-name: slideOutRight; }
 }

 .backdrop-enter { animation: fadeIn 0.25s ease-out forwards; }
  .backdrop-exit { animation: fadeOut 0.22s ease-in forwards; }
 `}</style>

          {/* Backdrop */}
          <div
            className={cn(
              "absolute inset-0 bg-slate-900/50 backdrop-blur-[3px] pointer-events-auto",
              isClosing ? "backdrop-exit" : "backdrop-enter",
            )}
            onClick={handleClose}
          />

          {/* Floating Drawer Panel */}
          <div
            ref={drawerRef}
            className={cn(
              "pointer-events-auto bg-white flex flex-col relative",
              // Floating shadow & border
              "shadow-[0_24px_64px_-12px_rgba(0,0,0,0.25),0_8px_24px_-8px_rgba(0,0,0,0.12)] ring-1 ring-slate-200/60",
              // Clip children to border-radius
              "overflow-hidden",
              // Mobile: floating bottom sheet with gap on all sides
              "w-[calc(100%-24px)] mx-3 mb-3 h-[88vh] rounded-2xl",
              // Tablet+
              "md:w-[500px] md:mx-0 md:mr-4 md:h-[calc(100vh-32px)] md:rounded-2xl",
              // Animation
              isClosing ? "responsive-drawer-exit" : "responsive-drawer-enter",
            )}
          >
            {/* Mobile Drag Handle Indicator */}
            <div className="md:hidden flex justify-center pt-3 pb-1 shrink-0 bg-white">
              <div className="h-1 w-10 bg-slate-200 rounded-full"></div>
            </div>

            {/* Header (Sticky) */}
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

            {/* Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth bg-slate-50/30" style={{ WebkitOverflowScrolling: "touch" }}>
              {/* Status & Alerts */}
              <div className="flex flex-col gap-4 mb-8">
                {overdue && (
                  <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-rose-700">
                        Task Overdue
                      </h4>
                      <p className="text-sm text-rose-600 mt-1">
                        This task was due on <strong>{task.dueDate}</strong>.
                        Immediate action is required to maintain compliance.
                      </p>
                    </div>
                  </div>
                )}

                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                      Workflow Progress
                    </span>
                    <span className="text-sm font-bold text-emerald-600">
                      {task.progress}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-700 ease-out",
                        overdue ? "bg-rose-500" : "bg-primary",
                      )}
                      style={{ width: `${task.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-slate-400 font-medium">
                    <span>Initiated</span>
                    <span>In Review</span>
                    <span>Completed</span>
                  </div>
                </div>
              </div>

              {/* Details Sections */}
              <div className="space-y-6">
                {/* Description */}
                <section className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Description
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {task.description || "No description provided."}
                  </p>
                </section>

                {/* Meta Data Grid */}
                <section className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <label className="text-xs font-medium text-slate-500 block mb-2">
                      Assigned To
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0">
                        <User className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-semibold text-slate-900 truncate">
                        {task.assignee}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <label className="text-xs font-medium text-slate-500 block mb-2">
                      Reported By
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100 shrink-0">
                        <User className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-semibold text-slate-900 truncate">
                        {task.reporter}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <label className="text-xs font-medium text-slate-500 block mb-2">
                      Due Date
                    </label>
                    <div className="flex items-center gap-2">
                      <Calendar
                        className={cn(
                          "h-4 w-4",
                          overdue ? "text-rose-500" : "text-slate-400",
                        )}
                      />
                      <span
                        className={cn(
                          "text-sm font-bold",
                          overdue ? "text-rose-600" : "text-slate-900",
                        )}
                      >
                        {task.dueDate}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <label className="text-xs font-medium text-slate-500 block mb-2">
                      Priority
                    </label>
                    <div>
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-bold border",
                          getPriorityColor(task.priority),
                        )}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </section>

                {/* Audit Trail / Timeline */}
                <section className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                    <History className="h-4 w-4" /> Audit Trail & History
                  </h3>
                  <div className="relative border-l-2 border-slate-100 ml-2 space-y-6 pb-2">
                    {task.timeline && task.timeline.length > 0 ? (
                      task.timeline.map((event, idx) => (
                        <div key={idx} className="relative pl-6">
                          <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-white border-4 border-slate-200"></div>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                            <p className="text-sm font-bold text-slate-800">
                              {event.action}
                            </p>
                            <span className="text-xs text-slate-400">
                              {event.date}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            by{""}
                            <span className="font-medium text-slate-700">
                              {event.user}
                            </span>
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="pl-6">
                        <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-white border-4 border-slate-200"></div>
                        <p className="text-sm text-slate-400 italic">
                          Task created. No further history.
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </div>

            {/* Footer Actions (Fixed) */}
            <div className="p-4 md:p-5 border-t border-slate-200 bg-white flex flex-row flex-nowrap justify-end gap-2 md:gap-3 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClose}
                className="shrink-0"
              >
                Close
              </Button>
              {task.status !== "Completed" && (
                <>
                  {isDocumentReviewTask ? (
                    <Button
                      onClick={handleStartReview}
                      variant="default"
                      size="sm"
                    >
                      Start Review
                    </Button>
                  ) : isRevisionApprovalTask ? (
                    <Button
                      onClick={handleStartApproval}
                      variant="default"
                      size="sm"
                    >
                      Review & Approve
                    </Button>
                  ) : (
                    <Button variant="default" size="sm">
                      Process Task
                    </Button>
                  )}
                </>
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
