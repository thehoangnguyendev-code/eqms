import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
    X,
    User,
    FileText,
    BookOpen,
    Download,
    Send,
    Building2,
    Briefcase,
    Calendar,
    Hash,
    TrendingUp,
    ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import { FullPageLoading } from "@/components/ui/loading";
import { cn } from "@/components/ui/utils";
import { ROUTES } from "@/app/routes.constants";
import { DRAWER_STYLES, formatDate } from "./constants";
import type { EmployeeRow, SOPColumn } from "../../types";
import { MOCK_SOPS, MOCK_EMPLOYEES, getCell } from "../../mockData";
import { IconBook, IconInfoCircle, IconLocation } from "@tabler/icons-react";

// ─── Props ────────────────────────────────────────────────────────────
export interface HeaderActionDrawerProps {
    type: "employee" | "sop";
    /** Full EmployeeRow when type="employee", full SOPColumn when type="sop" */
    data: EmployeeRow | SOPColumn;
    onClose: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────
const EMPLOYEE_ACTIONS = [
    { icon: User, label: "View Profile" },
    { icon: Send, label: "Assign Training" },
    { icon: Download, label: "Export Report" },
] as const;

const SOP_ACTIONS = [
    { icon: IconInfoCircle, label: "View Details" },
    { icon: IconBook, label: "Assign Training" },
    { icon: Download, label: "Export Report" },
] as const;

const CATEGORY_COLORS: Record<string, string> = {
    GMP: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Technical: "bg-blue-50 text-blue-700 border-blue-200",
    Safety: "bg-amber-50 text-amber-700 border-amber-200",
    Compliance: "bg-purple-50 text-purple-700 border-purple-200",
};

// ─── Helpers ──────────────────────────────────────────────────────────
const getInitials = (name: string) =>
    name.split("").filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase();

const getRateColors = (rate: number) => {
    if (rate >= 80) return { text: "text-emerald-600", bar: "bg-emerald-500" };
    if (rate >= 60) return { text: "text-amber-600", bar: "bg-amber-500" };
    return { text: "text-red-600", bar: "bg-red-500" };
};

const READ_ONLY_CLASS =
    "w-full h-9 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-default";

// ─── Sub-components ───────────────────────────────────────────────────
const ReadOnlyField: React.FC<{
    icon?: React.FC<{ className?: string }>;
    label: string;
    value: string;
}> = ({ icon: Icon, label, value }) => (
    <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
            <label className="text-xs sm:text-sm font-medium text-slate-700">
                {label}
            </label>
        </div>
        <input
            type="text"
            readOnly
            value={value || ""}
            placeholder="—"
            className={READ_ONLY_CLASS}
        />
    </div>
);

const StatTile: React.FC<{
    value: number;
    label: string;
    color: string;
    bg: string;
}> = ({ value, label, color, bg }) => (
    <div className={cn("rounded-lg p-2.5 text-center", bg)}>
        <p className={cn("text-xl font-bold leading-none mb-1", color)}>{value}</p>
        <p className="text-[10px] text-slate-500 font-medium leading-tight">{label}</p>
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────
export const HeaderActionDrawer: React.FC<HeaderActionDrawerProps> = ({
    type,
    data,
    onClose,
}) => {
    const navigate = useNavigate();
    const [isClosing, setIsClosing] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);

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

    // ── Employee compliance stats ───────────────────────────────────
    const employeeStats = useMemo(() => {
        if (type !== "employee") return null;
        const emp = data as EmployeeRow;
        const required = MOCK_SOPS.filter((sop) => {
            const cell = getCell(emp.id, sop.id);
            return cell && cell.status !== "NotRequired";
        });
        const qualified = required.filter((sop) => getCell(emp.id, sop.id)?.status === "Qualified").length;
        const overdue = required.filter((sop) => getCell(emp.id, sop.id)?.status === "Required").length;
        const inProgress = required.filter((sop) => getCell(emp.id, sop.id)?.status === "InProgress").length;
        const total = required.length;
        const rate = total > 0 ? Math.round((qualified / total) * 100) : 100;
        return { qualified, overdue, inProgress, total, rate };
    }, [type, data]);

    // ── SOP compliance stats ────────────────────────────────────────
    const sopStats = useMemo(() => {
        if (type !== "sop") return null;
        const sop = data as SOPColumn;
        const required = MOCK_EMPLOYEES.filter((emp) => {
            const cell = getCell(emp.id, sop.id);
            return cell && cell.status !== "NotRequired";
        });
        const qualified = required.filter((emp) => getCell(emp.id, sop.id)?.status === "Qualified").length;
        const overdue = required.filter((emp) => getCell(emp.id, sop.id)?.status === "Required").length;
        const inProgress = required.filter((emp) => getCell(emp.id, sop.id)?.status === "InProgress").length;
        const total = required.length;
        const rate = total > 0 ? Math.round((qualified / total) * 100) : 100;
        return { qualified, overdue, inProgress, total, rate };
    }, [type, data]);

    const stats = type === "employee" ? employeeStats : sopStats;
    const empData = type === "employee" ? (data as EmployeeRow) : null;
    const sopData = type === "sop" ? (data as SOPColumn) : null;
    const actions = type === "employee" ? EMPLOYEE_ACTIONS : SOP_ACTIONS;
    const rateColors = getRateColors(stats?.rate ?? 100);

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
                    "w-[calc(100%-24px)] mx-3 mb-3 h-[92vh] rounded-2xl",
                    "md:w-[500px] md:mx-0 md:mr-4 md:h-[calc(100vh-32px)] md:rounded-2xl",
                    isClosing ? "tm-drawer-exit" : "tm-drawer-enter"
                )}
            >
                {/* Mobile drag handle */}
                <div className="md:hidden flex justify-center pt-3 pb-1 shrink-0 bg-white">
                    <div className="h-1 w-10 bg-slate-200 rounded-full" />
                </div>

                {/* ── Header ───────────────────────────────────────────────────── */}
                <div className="px-4 py-3 border-b border-slate-100 shrink-0 bg-white">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            {empData ? (
                                <>
                                    {/* Initials avatar */}
                                    <div className="h-9 w-9 rounded-full bg-emerald-100 border-2 border-emerald-200 flex items-center justify-center flex-shrink-0">
                                        <span className="text-xs font-bold text-emerald-700">
                                            {getInitials(empData.name)}
                                        </span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-900 leading-tight truncate">{empData.name}</p>
                                        <p className="text-[11px] text-slate-500 truncate">{empData.jobTitle} · {empData.department}</p>
                                    </div>
                                </>
                            ) : sopData ? (
                                <>
                                    {/* Document icon */}
                                    <div className="h-9 w-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0">
                                        <FileText className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Training Course</span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-900 leading-tight truncate">{sopData.title}</p>
                                    </div>
                                </>
                            ) : null}
                        </div>

                        <button
                            onClick={handleClose}
                            className="flex-shrink-0 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                            aria-label="Close"
                        >
                            <X className="h-4 w-4 text-slate-500" />
                        </button>
                    </div>
                </div>

                {/* ── Scrollable Body ──────────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/30 scroll-smooth" style={{ WebkitOverflowScrolling: "touch" }}>
                    {/* Identification / Info Card */}
                    <div className="border border-slate-200 rounded-xl shadow-sm overflow-hidden bg-white">
                        <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
                            {empData ? <User className="h-3.5 w-3.5 text-slate-600" /> : <FileText className="h-3.5 w-3.5 text-slate-600" />}
                            <span className="text-sm font-semibold text-slate-600">
                                {empData ? "Personnel Information" : "Material Information"}
                            </span>
                        </div>
                        <div className="p-4 space-y-4">
                            {empData ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <ReadOnlyField icon={Briefcase} label="Job Title" value={empData.jobTitle} />
                                        <ReadOnlyField icon={Building2} label="Department" value={empData.department} />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <ReadOnlyField icon={Hash} label="Employee Code" value={empData.employeeCode} />
                                        <ReadOnlyField icon={Calendar} label="Hire Date" value={formatDate(empData.hireDate)} />
                                    </div>
                                </>
                            ) : sopData ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <ReadOnlyField icon={BookOpen} label="Category" value={sopData.category} />
                                        <ReadOnlyField icon={Hash} label="Version" value={`${sopData.version}`} />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <ReadOnlyField icon={Hash} label="Course Code" value={sopData.code} />
                                        <ReadOnlyField icon={Calendar} label="Effective Date" value={formatDate(sopData.effectiveDate)} />
                                    </div>
                                </>
                            ) : null}
                        </div>
                    </div>

                    {/* Compliance summary card */}
                    {stats && (
                        <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                                <TrendingUp className="h-3.5 w-3.5 text-slate-600" />
                                <span className="text-sm font-semibold text-slate-600">
                                    Training Compliance
                                </span>
                            </div>
                            <div className="p-4">

                                {/* Rate bar */}
                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-xs text-slate-500">Compliance Rate</span>
                                        <span className={cn("text-sm font-bold tabular-nums", rateColors.text)}>
                                            {stats.rate}%
                                        </span>
                                    </div>
                                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={cn("h-full rounded-full transition-all duration-700", rateColors.bar)}
                                            style={{ width: `${stats.rate}%` }}
                                        />
                                    </div>
                                    <p className="mt-1.5 text-[10px] text-slate-400">
                                        {stats.qualified} qualified out of {stats.total} required{""}
                                        {type === "employee" ? "trainings" : "employees"}
                                    </p>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <StatTile value={stats.qualified} label="Qualified" color="text-emerald-600" bg="bg-emerald-50" />
                                    <StatTile value={stats.overdue} label="Required" color="text-red-600" bg="bg-red-50" />
                                    <StatTile value={stats.inProgress} label="In Progress" color="text-amber-600" bg="bg-amber-50" />
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Quick Actions card */}
                    <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                            <IconLocation className="h-3.5 w-3.5 text-slate-600" />
                            <span className="text-sm font-semibold text-slate-600">
                                Quick Actions
                            </span>
                        </div>
                        <div className="px-2 py-2">
                            {actions.map(({ icon: Icon, label: actionLabel }) => (
                                <button
                                    key={actionLabel}
                                    onClick={() => {
                                        setIsNavigating(true);
                                        setTimeout(() => {
                                            if (actionLabel === "View Profile" && type === "employee") {
                                                navigate(ROUTES.SETTINGS.USERS_PROFILE((data as EmployeeRow).id));
                                            } else if (actionLabel === "View Document" && type === "sop") {
                                                navigate(ROUTES.TRAINING.MATERIAL_DETAIL((data as SOPColumn).id));
                                            } else if (actionLabel === "Assign Training") {
                                                if (type === "employee") {
                                                    navigate(ROUTES.TRAINING.ASSIGNMENT_NEW + `?employeeId=${(data as EmployeeRow).id}`);
                                                } else {
                                                    navigate(ROUTES.TRAINING.ASSIGNMENT_NEW + `?courseId=${(data as SOPColumn).id}`);
                                                }
                                            }
                                            handleClose();
                                        }, 600);
                                    }}
                                    className="flex w-full items-center gap-2.5 px-2.5 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                                >
                                    <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                        <Icon className="h-3.5 w-3.5 text-slate-500" />
                                    </div>
                                    <span className="font-medium flex-1 text-left text-[13px]">{actionLabel}</span>
                                    <ArrowRight className="h-3 w-3 text-slate-300 flex-shrink-0" />
                                </button>
                            ))}
                        </div>
                    </section>
                </div>

                {/* ── Footer ───────────────────────────────────────────────── */}
                <div className="px-4 py-3 border-t border-slate-200 bg-white shrink-0 flex justify-end">
                    <Button variant="outline" size="sm" onClick={handleClose}>
                        Close
                    </Button>
                </div>
            </div>

            {isNavigating && <FullPageLoading text="Loading..." />}
        </div>,
        document.body
    );
};
