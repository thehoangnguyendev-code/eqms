import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, User, FileText, CalendarDays, Trophy, Clock, AlertTriangle, CalendarCheck, Layers } from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import { cn } from "@/components/ui/utils";
import type { TrainingCell, EmployeeRow, SOPColumn } from "../../types";
import { CELL_CONFIG, DRAWER_STYLES, formatDate } from "./constants";

interface CellDetailDrawerProps {
    cell: TrainingCell;
    employee: EmployeeRow;
    sop: SOPColumn;
    onClose: () => void;
}

export const CellDetailDrawer: React.FC<CellDetailDrawerProps> = ({
    cell,
    employee,
    sop,
    onClose,
}) => {
    const [isClosing, setIsClosing] = useState(false);
    const cfg = CELL_CONFIG[cell.status];
    const isRequired = cell.status === "Required";
    const isInProgress = cell.status === "InProgress";
    const parseDMY = (d: string): Date => {
        const m = d.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
        return new Date(d);
    };
    const daysRemaining = cell.expiryDate
        ? Math.ceil((parseDMY(cell.expiryDate).getTime() - Date.now()) / 86400000)
        : null;
    const expiryTone = isRequired
        ? "text-red-700"
        : isInProgress
            ? "text-amber-700"
            : "text-slate-700";
    const expiryBadgeTone = isRequired
        ? "bg-red-50 text-red-700"
        : isInProgress
            ? "bg-amber-50 text-amber-700"
            : "bg-slate-50 text-slate-600";

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
        <div className="fixed inset-0 z-50 flex justify-center md:justify-end items-end md:items-center pointer-events-none">
            <style>{DRAWER_STYLES}</style>

            {/* Backdrop */}
            <div
                className={cn(
                    "absolute inset-0 bg-slate-900/50 backdrop-blur-[3px] pointer-events-auto",
                    isClosing ? "tm-backdrop-exit" : "tm-backdrop-enter"
                )}
                onClick={handleClose}
            />

            {/* Floating Drawer panel */}
            <div
                className={cn(
                    "pointer-events-auto bg-white flex flex-col relative",
                    "shadow-[0_24px_64px_-12px_rgba(0,0,0,0.25),0_8px_24px_-8px_rgba(0,0,0,0.12)] ring-1 ring-slate-200/60",
                    "overflow-hidden",
                    "w-[calc(100%-24px)] mx-3 mb-3 h-[88vh] rounded-2xl",
                    "md:w-[500px] md:mx-0 md:mr-4 md:h-[calc(100vh-32px)] md:rounded-2xl",
                    isClosing ? "tm-drawer-exit" : "tm-drawer-enter"
                )}
            >
                {/* Mobile drag handle */}
                <div className="md:hidden flex justify-center pt-3 pb-1 shrink-0 bg-white">
                    <div className="h-1 w-10 bg-slate-200 rounded-full" />
                </div>

                {/* Header */}
                <div className="px-4 py-3 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", cfg.bg)}>
                            <cfg.Icon className={cn("h-4 w-4", cfg.iconColor)} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] text-slate-400 font-medium">Compliance Tracking</p>
                            <p className="text-sm font-bold text-slate-800 truncate" title={cfg.label}>{cfg.label}</p>
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

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/30 custom-scrollbar scroll-smooth" style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "thin", scrollbarColor: "#cbd5e1 transparent" }}>
                    {/* Employee card */}
                    <div className="bg-white border border-slate-100 rounded-xl p-4 flex items-center gap-3 shadow-sm">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-slate-500" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] text-slate-400 font-medium mb-0.5">Employee</p>
                            <p className="text-sm font-semibold text-slate-900 truncate">{employee.name}</p>
                            <p className="text-xs text-slate-500 truncate">
                                {employee.department} · {employee.jobTitle}
                            </p>
                        </div>
                    </div>

                    {/* SOP card */}
                    <div className="bg-white border border-slate-100 rounded-xl p-4 flex items-center gap-3 shadow-sm">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                            <FileText className="h-4 w-4 text-slate-500" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] text-slate-400 font-medium mb-0.5">SOP / Document</p>
                            <p className="text-sm font-semibold text-slate-900 truncate">{sop.code}</p>
                            <p className="text-xs text-slate-500 truncate">{sop.title}</p>
                        </div>
                    </div>

                    {/* ── Contextual alert for Required / InProgress ── */}
                    {(cell.status === "Required" || cell.status === "InProgress") && (() => {
                        const isRequired = cell.status === "Required";
                        return (
                            <div className={cn(
                                "rounded-xl px-4 py-3 flex items-start gap-3 border",
                                isRequired
                                    ? "bg-red-50 border-red-200"
                                    : "bg-amber-50 border-amber-200"
                            )}>
                                <AlertTriangle className={cn("h-4 w-4 mt-0.5 shrink-0", isRequired ? "text-red-500" : "text-amber-500")} />
                                <div>
                                    <p className={cn("text-xs font-bold mb-0.5", isRequired ? "text-red-800" : "text-amber-800")}>
                                        {isRequired ? "Training Required" : "Training In Progress"}
                                    </p>
                                    <p className={cn("text-[11px] leading-relaxed", isRequired ? "text-red-600" : "text-amber-600")}>
                                        {isRequired
                                            ? "This employee is required to complete this training but has not been assigned or evaluated."
                                            : "A training assignment exists but pending score entry to complete the process."}
                                    </p>
                                </div>
                            </div>
                        );
                    })()}

                    {/* ── Score + Attempts ── */}
                    <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
                        <div className="px-4 pt-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                            <Trophy className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Assessment</span>
                        </div>
                        <div className="p-4 flex items-center gap-5">
                            {/* Score ring */}
                            {(() => {
                                const score = cell.score ?? 0;
                                const hasScore = cell.score != null;
                                const radius = 28;
                                const circumference = 2 * Math.PI * radius;
                                const filled = hasScore ? (score / 100) * circumference : 0;
                                const scoreColor =
                                    score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";
                                return (
                                    <div className="relative shrink-0">
                                        <svg width="72" height="72" className="-rotate-90">
                                            <circle cx="36" cy="36" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="7" />
                                            {hasScore && (
                                                <circle
                                                    cx="36" cy="36" r={radius}
                                                    fill="none"
                                                    stroke={scoreColor}
                                                    strokeWidth="7"
                                                    strokeLinecap="round"
                                                    strokeDasharray={circumference}
                                                    strokeDashoffset={circumference - filled}
                                                    style={{ transition: "stroke-dashoffset 0.6s ease" }}
                                                />
                                            )}
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-base font-extrabold text-slate-800 leading-none">
                                                {hasScore ? `${score}` : "—"}
                                            </span>
                                            {hasScore && <span className="text-[9px] text-slate-400 font-medium">pts</span>}
                                        </div>
                                    </div>
                                );
                            })()}

                            <div className="flex-1 space-y-3">
                                {/* Score label */}
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium mb-1">Score</p>
                                    <p className="text-sm font-semibold text-slate-800">
                                        {cell.score != null ? `${cell.score} / 100` : "Not assessed"}
                                    </p>
                                </div>

                                {/* Attempts */}
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium mb-1.5">Attempts</p>
                                    <div className="flex items-center gap-1.5">
                                        {Array.from({ length: Math.min(cell.attempts || 0, 6) }).map((_, i) => (
                                            <span key={i} className="h-2 w-2 rounded-full bg-emerald-400" />
                                        ))}
                                        {(cell.attempts || 0) === 0 && (
                                            <span className="text-xs text-slate-400">No attempts</span>
                                        )}
                                        {(cell.attempts || 0) > 6 && (
                                            <span className="text-[10px] text-slate-400 font-medium">+{(cell.attempts || 0) - 6} more</span>
                                        )}
                                        {(cell.attempts || 0) > 0 && (
                                            <span className="ml-1 text-xs text-slate-500 font-medium">
                                                {cell.attempts} {cell.attempts === 1 ? "attempt" : "attempts"}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Training Timeline ── */}
                    <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
                        <div className="px-4 pt-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Training Timeline</span>
                        </div>
                        <div className="p-4">
                            <div className="flex items-start gap-3">
                                    <div className="flex flex-col items-center pt-1">
                                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />
                                        <div className="w-px flex-1 bg-slate-200 my-1.5" style={{ minHeight: 32 }} />
                                        <div className={cn(
                                            "h-2.5 w-2.5 rounded-full ring-4",
                                            cell.status === "Required" ? "bg-red-500 ring-red-50"
                                                : cell.status === "InProgress" ? "bg-amber-500 ring-amber-50"
                                                    : "bg-slate-400 ring-slate-100"
                                        )} />
                                    </div>

                                    {/* Labels */}
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide flex items-center gap-1.5">
                                                <CalendarCheck className="h-3 w-3" /> Last Trained
                                            </p>
                                            <p className="text-sm font-semibold text-slate-800 mt-0.5">
                                                {formatDate(cell.lastTrainedDate)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide flex items-center gap-1.5">
                                                <CalendarDays className="h-3 w-3" /> Latest Evaluated
                                            </p>
                                            <p className={cn(
                                                "text-sm font-semibold mt-0.5",
                                                cell.status === "Required" ? "text-red-600"
                                                    : cell.status === "InProgress" ? "text-amber-600"
                                                        : "text-slate-800"
                                            )}>
                                                {formatDate(cell.expiryDate)}
                                            </p>
                                        {/* Days remaining */}
                                        {cell.expiryDate && (() => {
                                            const m = cell.expiryDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
                                            const d = m ? new Date(+m[3], +m[2] - 1, +m[1]) : new Date(cell.expiryDate);
                                            const days = Math.ceil((d.getTime() - Date.now()) / 86400000);
                                            if (days < 0) return (
                                                <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                                                    {Math.abs(days)} days overdue
                                                </span>
                                            );
                                            if (days <= 30) return (
                                                <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full">
                                                    {days} days remaining
                                                </span>
                                            );
                                            return (
                                                <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full">
                                                    {days} days remaining
                                                </span>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── SOP Information ── */}
                    <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
                        <div className="px-4 pt-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                            <Layers className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Document Info</span>
                        </div>
                        <div className="p-4 grid grid-cols-2 gap-3">
                            <div className="bg-slate-50 rounded-lg px-3 py-2.5">
                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide mb-1">Version</p>
                                <p className="text-sm font-bold text-slate-800">{sop.version}</p>
                            </div>
                            <div className="bg-slate-50 rounded-lg px-3 py-2.5">
                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide mb-1">Category</p>
                                <span className={cn(
                                    "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border",
                                    sop.category === "GMP" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                                    sop.category === "Safety" && "bg-amber-50 text-amber-700 border-amber-200",
                                    sop.category === "Technical" && "bg-blue-50 text-blue-700 border-blue-200",
                                    sop.category === "Compliance" && "bg-purple-50 text-purple-700 border-purple-200",
                                )}>
                                    {sop.category}
                                </span>
                            </div>
                            <div className="col-span-2 bg-slate-50 rounded-lg px-3 py-2.5">
                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide mb-1">Effective Date</p>
                                <p className="text-sm font-semibold text-slate-700">{formatDate(sop.effectiveDate)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-4 border-t border-slate-100 bg-white shrink-0 flex justify-end">
                    <Button variant="outline" size="sm" onClick={handleClose}>
                        Close
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
};
