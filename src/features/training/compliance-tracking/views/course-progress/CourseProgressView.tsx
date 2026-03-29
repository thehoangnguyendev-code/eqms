import React, { useState, useMemo, useRef } from "react";
import { TrainingMethod } from "../../../types";
import { createPortal } from "react-dom";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTES } from "@/app/routes.constants";
import { FullPageLoading } from "@/components/ui/loading/Loading";
import {
  Search,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  BarChart3,
  ArrowLeft,
  Download,
  TrendingUp,
  Target,
  UserCheck,
  UserX,
  FileText,
  Paperclip,
  Mail,
  Bell,
  ExternalLink,
  Repeat,
  ShieldCheck,
  MoreVertical,
} from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb/Breadcrumb";
import { courseProgress } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import { TablePagination } from "@/components/ui/table/TablePagination";
import { TableEmptyState } from "@/components/ui/table/TableEmptyState";
import { ESignatureModal } from "@/components/ui/esign-modal";
import { cn } from "@/components/ui/utils";
import { formatDateUS } from "@/utils/format";
import { getStatusColorClass } from "@/utils/status";
import type { EnrollmentStatus, ResultStatus, EmployeeProgress, CourseProgressInfo } from "../../../types";
import { MOCK_PROGRESS_INFO, MOCK_EMPLOYEE_PROGRESS } from "../../mockData";

/* ------------------------------------------------------------------ */
/*  Local Dropdown Component                                           */
/* ------------------------------------------------------------------ */

interface EmployeeDropdownMenuProps {
  employee: EmployeeProgress;
  courseId: string;
  isOpen: boolean;
  onClose: () => void;
  position: { top: number; left: number; showAbove?: boolean };
  onNavigate: (path: string) => void;
}

const EmployeeDropdownMenu: React.FC<EmployeeDropdownMenuProps> = ({
  employee,
  courseId,
  isOpen,
  onClose,
  position,
  onNavigate,
}) => {
  if (!isOpen) return null;

  type MenuItem =
    | { isDivider: true }
    | { isDivider?: false; icon: React.ElementType; label: string; onClick: () => void; color?: string; disabled?: boolean };

  const menuItems: MenuItem[] = [];

  if (employee.enrollmentStatus === "In-Progress") {
    menuItems.push({
      icon: ExternalLink,
      label: "Enter Result",
      onClick: () => {
        onNavigate(ROUTES.TRAINING.COURSE_RESULT_ENTRY(courseId));
        onClose();
      },
      color: "text-slate-600",
    });
    menuItems.push({
      icon: Bell,
      label: "Send Reminder",
      onClick: () => {
        console.log("Reminder sent to", employee.email);
        onClose();
      },
      color: "text-slate-600",
    });
  }

  if (employee.resultStatus === "Fail") {
    menuItems.push({
      icon: Repeat,
      label: "Re-assign Training",
      onClick: () => {
        console.log("Re-assigned", employee.userId);
        onClose();
      },
      color: "text-slate-600",
    });
  }

  if (employee.enrollmentStatus === "Completed") {
    menuItems.push({
      icon: Paperclip,
      label: "View Evidence",
      onClick: () => {
        alert("Opening Evidence for " + employee.name);
        onClose();
      },
      color: "text-slate-600",
    });
  }

  if (menuItems.length === 0) {
    menuItems.push({
      label: "No Actions Available",
      icon: AlertCircle,
      onClick: () => onClose(),
      color: "text-slate-400",
      disabled: true
    });
  }

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-40 animate-in fade-in duration-150"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-hidden="true"
      />
      <div
        className="fixed z-50 min-w-[160px] w-[200px] max-w-[90vw] max-h-[300px] overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-200"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          transform: position.showAbove ? "translateY(-100%)" : "none",
        }}
      >
        <div className="py-1">
          {menuItems.map((item, i) => {
            if ("isDivider" in item && item.isDivider) {
              return <div key={i} className="my-1 border-t border-slate-100" />;
            }
            const mi = item as Exclude<MenuItem, { isDivider: true }>;
            const Icon = mi.icon;
            return (
              <button
                key={i}
                disabled={mi.disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  mi.onClick();
                }}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-slate-50 active:bg-slate-100 transition-colors",
                  mi.color,
                  mi.disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium">{mi.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>,
    window.document.body
  );
};

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export const CourseProgressView: React.FC = () => {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isESignatureOpen, setIsESignatureOpen] = useState(false);

  // Dropdown state
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, showAbove: false });
  const buttonRefs = useRef<Record<string, React.RefObject<HTMLButtonElement | null>>>({});

  const getButtonRef = (id: string) => {
    if (!buttonRefs.current[id]) {
      buttonRefs.current[id] = React.createRef<HTMLButtonElement>();
    }
    return buttonRefs.current[id];
  };

  const handleDropdownToggle = (id: string, event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (openDropdownId === id) {
      setOpenDropdownId(null);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const menuHeight = 200;
    const menuWidth = 200;
    const safeMargin = 8;
    const spaceBelow = window.innerHeight - rect.bottom;
    const shouldShowAbove = spaceBelow < menuHeight && rect.top > menuHeight;
    const top = shouldShowAbove ? rect.top + window.scrollY - 4 : rect.bottom + window.scrollY + 4;
    let left = rect.right + window.scrollX - menuWidth;
    left = Math.max(safeMargin, Math.min(left, window.innerWidth - menuWidth - safeMargin));
    setDropdownPosition({ top, left, showAbove: shouldShowAbove });
    setOpenDropdownId(id);
  };

  const info = {
    ...MOCK_PROGRESS_INFO,
    dueDate: "2026-04-15",
  };

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [enrollmentFilter, setEnrollmentFilter] = useState<EnrollmentStatus | "All">("All");
  const [resultFilter, setResultFilter] = useState<ResultStatus | "All">("All");
  const [departmentFilter, setDepartmentFilter] = useState<string>("All");
  const [businessUnitFilter, setBusinessUnitFilter] = useState<string>("All");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Derived data
  const uniqueDepartments = useMemo(
    () => Array.from(new Set(MOCK_EMPLOYEE_PROGRESS.map((e) => e.department))).sort(),
    []
  );

  const uniqueBusinessUnits = useMemo(
    () => Array.from(new Set(MOCK_EMPLOYEE_PROGRESS.map((e) => e.businessUnit))).sort(),
    []
  );

  const filteredEmployees = useMemo(() => {
    let filtered = MOCK_EMPLOYEE_PROGRESS;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.userId.toLowerCase().includes(q) ||
          e.name.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q) ||
          e.businessUnit.toLowerCase().includes(q)
      );
    }

    if (enrollmentFilter !== "All") {
      filtered = filtered.filter((e) => e.enrollmentStatus === enrollmentFilter);
    }

    if (resultFilter !== "All") {
      filtered = filtered.filter((e) => e.resultStatus === resultFilter);
    }

    if (departmentFilter !== "All") {
      filtered = filtered.filter((e) => e.department === departmentFilter);
    }

    if (businessUnitFilter !== "All") {
      filtered = filtered.filter((e) => e.businessUnit === businessUnitFilter);
    }

    return filtered;
  }, [searchQuery, enrollmentFilter, resultFilter, departmentFilter, businessUnitFilter]);

  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEmployees.slice(start, start + itemsPerPage);
  }, [filteredEmployees, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  const completionPercent = Math.round((info.completed / info.totalEnrolled) * 100);

  return (
    <div className="space-y-6 w-full flex-1 flex flex-col">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3 lg:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg md:text-xl lg:text-2xl font-bold tracking-tight text-slate-900">
            Training Progress
          </h1>
          <Breadcrumb items={courseProgress(navigate)} />
        </div>
        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          <Button
            variant="outline-emerald"
            size="sm"
            onClick={() => { setIsNavigating(true); setTimeout(() => navigate(-1), 600); }}
            className="whitespace-nowrap"
          >
            Back
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="h-4 w-4" />
            Export
          </Button>
          {completionPercent === 100 && (
            <Button
              variant="outline-emerald"
              size="sm"
              className="gap-1.5"
              onClick={() => setIsESignatureOpen(true)}
            >
              <ShieldCheck className="h-4 w-4" />
              Close & Sign-off
            </Button>
          )}
        </div>
      </div>

      {/* Course Info Card */}
      <div className="bg-white p-4 lg:p-6 rounded-xl border border-slate-200 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 -mr-16 -mt-16 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="mb-6">
            <div className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-100/50">
              {info.trainingId}
            </div>
            <h2 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
              {info.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 p-4 bg-slate-50/50 rounded-xl border border-slate-100 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-100/80 flex items-center justify-center text-emerald-600 shadow-sm">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] sm:text-sm text-slate-500 font-medium">Requirement</p>
                <p className="text-sm sm:text-base font-semibold text-slate-900 mt-0.5">
                  Passing: ≥ {info.passingScore}{info.passingGradeType === "percentage" ? "%" : "/10"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100/80 flex items-center justify-center text-blue-600 shadow-sm">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] sm:text-sm text-slate-500 font-medium">Due Date</p>
                <p className="text-sm sm:text-base font-semibold text-slate-900 mt-0.5">
                  {formatDateUS(info.dueDate)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 border-t lg:border-t-0 lg:border-l border-slate-200 pt-3 lg:pt-0 lg:pl-4 sm:col-span-2 lg:col-span-1">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-100/80 flex items-center justify-center text-amber-600 shadow-sm">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] sm:text-sm text-slate-500 font-medium">Time Remaining</p>
                <p className="text-sm sm:text-base font-semibold text-slate-900 mt-0.5">
                  30 Days Left
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs sm:text-sm font-medium text-slate-700">
              Completion: <span className="font-semibold">{info.completed}</span> / {info.totalEnrolled}
            </span>
            <span className="text-sm sm:text-base font-bold text-emerald-700">
              {completionPercent}%
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-3 lg:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-600 font-medium">Completed</p>
              <p className="text-2xl font-bold text-slate-900">{info.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-600 font-medium">In Progress</p>
              <p className="text-2xl font-bold text-slate-900">{info.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-slate-600 font-medium">Overdue</p>
              <p className="text-2xl font-bold text-slate-900">{info.overdue}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
              <Target className="h-5 w-5 text-cyan-600" />
            </div>
            <div>
              <p className="text-xs text-slate-600 font-medium">Pass Rate</p>
              <p className="text-2xl font-bold text-slate-900">{info.passRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-slate-600 font-medium">Avg. Score</p>
              <p className="text-2xl font-bold text-slate-900">
                {info.averageScore !== null ? info.averageScore.toFixed(1) : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters + table (single card) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm w-full overflow-hidden flex flex-col flex-1 min-h-0">
        <div className="p-4 md:p-5 flex flex-col">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-3 lg:gap-4 items-end">
          {/* Search */}
          <div className="xl:col-span-4">
            <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, ID, email..."
                className="w-full h-10 pl-10 pr-4 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          {/* Enrollment Filter */}
          <div className="xl:col-span-2">
            <Select
              label="Enrollment"
              value={enrollmentFilter}
              onChange={(e) => {
                setEnrollmentFilter(e.target.value as typeof enrollmentFilter);
                setCurrentPage(1);
              }}
              options={[
                { label: "All Enrollments", value: "All" },
                { label: "Completed", value: "Completed" },
                { label: "In-Progress", value: "In-Progress" },
                { label: "Not Started", value: "Not Started" },
                { label: "Overdue", value: "Overdue" },
                { label: "Exempt", value: "Exempt" },
              ]}
            />
          </div>

          {/* Result Status */}
          <div className="xl:col-span-2">
            <Select
              label="Result"
              value={resultFilter}
              onChange={(e) => {
                setResultFilter(e.target.value as typeof resultFilter);
                setCurrentPage(1);
              }}
              options={[
                { label: "All Results", value: "All" },
                { label: "Pass", value: "Pass" },
                { label: "Fail", value: "Fail" },
                { label: "Pending", value: "Pending" },
                { label: "N/A", value: "N/A" },
              ]}
            />
          </div>

          {/* Department */}
          <div className="xl:col-span-2">
            <Select
              label="Department"
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { label: "All Depts", value: "All" },
                ...uniqueDepartments.map((d) => ({ label: String(d), value: String(d) })),
              ]}
            />
          </div>

          {/* Business Unit */}
          <div className="xl:col-span-2">
            <Select
              label="Business Unit"
              value={businessUnitFilter}
              onChange={(e) => {
                setBusinessUnitFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { label: "All BUs", value: "All" },
                ...uniqueBusinessUnits.map((bu) => ({ label: String(bu), value: String(bu) })),
              ]}
            />
          </div>
        </div>
        </div>

        <div className="px-4 md:px-5 pb-4 md:pb-5 flex-1 flex flex-col relative min-h-0">
          <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col flex-1 bg-slate-50/10 transition-all duration-300 min-h-0">
            <div className="flex-1 overflow-auto flex-1 scrollbar-always-visible scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 hover:scrollbar-thumb-slate-400 scrollbar-thumb-rounded-full scrollbar-track-rounded-full pb-4">
          <table className="w-full">
            <thead className="bg-slate-50/80 border-b-2 border-slate-200 sticky top-0 z-30">
              <tr>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap w-10 sm:w-[60px]">
                  No.
                </th>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Employee Code
                </th>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Name
                </th>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">
                  Email
                </th>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">
                  Department
                </th>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">
                  Business Unit
                </th>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Enrollment
                </th>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Score
                </th>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Result
                </th>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">
                  Attempts
                </th>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden xl:table-cell">
                  Completed At
                </th>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Evidence
                </th>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap sticky right-0 bg-slate-50 z-20 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-200 shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.05)]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {paginatedEmployees.map((emp, index) => {
                const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;
                return (
                  <tr key={emp.userId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-center whitespace-nowrap text-slate-500 font-medium">
                      {rowNumber}
                    </td>
                    <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                      <span className="font-medium text-emerald-600">{emp.userId}</span>
                    </td>
                    <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                      <div>
                        <p className="font-medium text-slate-900">{emp.name}</p>
                        <p className="text-[10px] sm:text-xs text-slate-500">{emp.jobTitle}</p>
                      </div>
                    </td>
                    <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-600 hidden lg:table-cell">
                      {emp.email}
                    </td>
                    <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-700 hidden md:table-cell">
                      {emp.department}
                    </td>
                    <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-700 hidden lg:table-cell">
                      {emp.businessUnit}
                    </td>
                    <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-center whitespace-nowrap">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border",
                          getStatusColorClass(emp.enrollmentStatus)
                        )}
                      >
                        {emp.enrollmentStatus}
                      </span>
                    </td>
                    <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-center whitespace-nowrap">
                      {emp.score !== null ? (
                        <span
                          className={cn(
                            "font-semibold",
                            emp.score >= info.passingScore
                              ? "text-emerald-700"
                              : "text-red-600"
                          )}
                        >
                          {emp.score}/{info.passingGradeType === "percentage" ? 100 : 10}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-center whitespace-nowrap">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border",
                          getStatusColorClass(emp.resultStatus)
                        )}
                      >
                        {emp.resultStatus === "Pass" && (
                          <CheckCircle2 className="h-3 w-3" />
                        )}
                        {emp.resultStatus === "Fail" && (
                          <XCircle className="h-3 w-3" />
                        )}
                        {emp.resultStatus}
                      </span>
                    </td>
                    <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-center whitespace-nowrap text-slate-700 hidden lg:table-cell">
                      {emp.attempts > 0 ? emp.attempts : "—"}
                    </td>
                    <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-700 hidden xl:table-cell">
                      {emp.completedAt ? formatDateUS(emp.completedAt) : "—"}
                    </td>
                    <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-center whitespace-nowrap">
                      {emp.enrollmentStatus === "Completed" ? (
                        <button
                          className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors"
                          title="View Exam Scan"
                          onClick={(e) => {
                            e.stopPropagation();
                            alert("Opening Exam Scan...");
                          }}
                        >
                          <Paperclip className="h-4 w-4" />
                        </button>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-center whitespace-nowrap sticky right-0 bg-white group-hover:bg-slate-50 transition-colors z-30 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-200 shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.05)]">
                      <button
                        ref={getButtonRef(emp.userId)}
                        onClick={(e) => handleDropdownToggle(emp.userId, e)}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-slate-100 transition-colors"
                        aria-label="More actions"
                      >
                        <MoreVertical className="h-4 w-4 text-slate-600" />
                      </button>
                      <EmployeeDropdownMenu
                        employee={emp}
                        courseId={courseId || ""}
                        isOpen={openDropdownId === emp.userId}
                        onClose={() => setOpenDropdownId(null)}
                        position={dropdownPosition}
                        onNavigate={navigate}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredEmployees.length > 0 && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredEmployees.length}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
            showItemCount={true}
          />
        )}

        {/* Empty State */}
        {filteredEmployees.length === 0 && (
          <TableEmptyState
            title="No Results Found"
            description="No employees match your current filters. Try adjusting your search or filter criteria."
            actionLabel="Clear Filters"
            onAction={() => {
              setSearchQuery("");
              setEnrollmentFilter("All");
              setResultFilter("All");
              setDepartmentFilter("All");
              setBusinessUnitFilter("All");
              setCurrentPage(1);
            }}
          />
        )}
          </div>
        </div>
      </div>

      {/* ─── Sign-off Modal ──────────────────────────────────── */}
      <ESignatureModal
        isOpen={isESignatureOpen}
        onClose={() => setIsESignatureOpen(false)}
        onConfirm={(signature) => {
          console.log("Course archived with signature:", signature);
          setIsESignatureOpen(false);
          alert("Course successfully closed and archived!");
        }}
        actionTitle="Training Batch Sign-off"
      />

      {/* ─── Loading Overlay ──────────────────────────────────── */}
      {isNavigating && <FullPageLoading text="Loading..." />}
    </div>
  );
};



