import React, { useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/app/routes.constants";
import {
  Search,
  Users,
  CheckCircle2,
  Clock,
  Download,
  TrendingUp,
  GraduationCap,
  MoreVertical,
  ClipboardList,
  Archive,
  Send,
  Mail,
  Smartphone,
  Info,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { IconTimeline } from "@tabler/icons-react";
import { PageHeader } from "@/components/ui/page/PageHeader";
import { courseStatus } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import { TablePagination } from "@/components/ui/table/TablePagination";
import { FormModal } from "@/components/ui/modal/FormModal";
import { AlertModal, AlertModalType } from "@/components/ui/modal/AlertModal";
import { ESignatureModal } from "@/components/ui/esign-modal";
import { Checkbox } from "@/components/ui/checkbox/Checkbox";
import { FullPageLoading } from "@/components/ui/loading";
import { cn } from "@/components/ui/utils";
import { usePortalDropdown, useNavigateWithLoading } from "@/hooks";
import type { CourseComplianceRecord, CourseStatusFilters } from "../../../types";
import { MOCK_COURSE_STATUS } from "../../mockData";

// --- Sub-components ---
const CourseRow: React.FC<{
  course: CourseComplianceRecord;
  index: number;
  currentPage: number;
  itemsPerPage: number;
  onViewProgress: (id: string) => void;
  showDetailList: (course: CourseComplianceRecord, type: "Total" | "Completed" | "InProgress" | "Overdue") => void;
  getRef: (id: string) => any;
  handleDropdownToggle: (id: string, e: React.MouseEvent) => void;
  openDropdownId: string | null;
  closeDropdown: () => void;
  dropdownPosition: { top: number; left: number; showAbove?: boolean };
  handleCloseArchive: (course: CourseComplianceRecord) => void;
  handleResultEntry: (id: string) => void;
}> = React.memo(({
  course,
  index,
  currentPage,
  itemsPerPage,
  onViewProgress,
  showDetailList,
  getRef,
  handleDropdownToggle,
  openDropdownId,
  closeDropdown,
  dropdownPosition,
  handleCloseArchive,
  handleResultEntry,
}) => {
  const getCompletionRate = (course: CourseComplianceRecord) => {
    return Math.round((course.completed / course.totalAssigned) * 100);
  };

  const getCompletionColor = (rate: number): string => {
    if (rate >= 90) return "text-emerald-600";
    if (rate >= 70) return "text-blue-600";
    if (rate >= 50) return "text-amber-600";
    return "text-red-600";
  };

  const completionRate = getCompletionRate(course);
  const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;

  return (
    <tr
      key={course.id}
      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
      onClick={() => onViewProgress(course.id)}
    >
      <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-center text-slate-500 font-medium">
        {rowNumber}
      </td>
      <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
        <span className="font-medium text-emerald-600">{course.courseId}</span>
      </td>
      <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm">
        <div className="flex items-start gap-2 max-w-[200px] lg:max-w-[300px]">
          <GraduationCap className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
          <span className="font-medium text-slate-900 truncate">
            {course.courseTitle}
          </span>
        </div>
      </td>
      <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm">
        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200">
          {course.courseType}
        </span>
      </td>
      <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm">
        <div
          className="flex items-center gap-2 hover:bg-slate-100 p-1 rounded transition-colors group/stat"
          onClick={(e) => {
            e.stopPropagation();
            onViewProgress(course.id);
          }}
        >
          <Users className="h-3.5 w-3.5 text-slate-400 group-hover/stat:text-slate-600" />
          <span className="text-slate-900 font-medium border-b border-transparent group-hover/stat:border-slate-400">
            {course.totalAssigned}
          </span>
        </div>
      </td>
      <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-emerald-700">
        <div
          onClick={(e) => { e.stopPropagation(); showDetailList(course, "Completed"); }}
          className="flex items-center gap-2 hover:bg-emerald-50 p-1 rounded transition-colors group/stat"
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 group-hover/stat:text-emerald-700" />
          <span className="font-medium border-b border-transparent group-hover/stat:border-emerald-600">
            {course.completed}
          </span>
        </div>
      </td>
      <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-blue-700">
        <div
          onClick={(e) => { e.stopPropagation(); showDetailList(course, "InProgress"); }}
          className="flex items-center gap-2 hover:bg-blue-50 p-1 rounded transition-colors group/stat"
        >
          <Clock className="h-3.5 w-3.5 text-blue-600 group-hover/stat:text-blue-700" />
          <span className="font-medium border-b border-transparent group-hover/stat:border-blue-600">
            {course.inProgress}
          </span>
        </div>
      </td>
      <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-red-700">
        <div
          onClick={(e) => { e.stopPropagation(); showDetailList(course, "Overdue"); }}
          className="flex items-center gap-2 hover:bg-red-50 p-1 rounded transition-colors group/stat"
        >
          <Clock className="h-3.5 w-3.5 text-red-600 group-hover/stat:text-red-700" />
          <span className="font-medium border-b border-transparent group-hover/stat:border-red-600">
            {course.overdue}
          </span>
        </div>
      </td>
      <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm font-medium text-slate-900">
        {course.averageScore}%
      </td>
      <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm min-w-[120px]">
        <div className="flex items-center gap-2">
          <div className="flex-1 max-w-[80px]">
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  completionRate >= 90 ? "bg-emerald-600" :
                    completionRate >= 70 ? "bg-blue-600" :
                      completionRate >= 50 ? "bg-amber-600" : "bg-red-600"
                )}
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
          <span className={cn("font-bold text-xs truncate", getCompletionColor(completionRate))}>
            {completionRate}%
          </span>
        </div>
      </td>
      <td
        className="sticky right-0 bg-white py-2 px-2 text-center group-hover:bg-slate-50 z-20 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={getRef(course.id)}
          onClick={(e) => handleDropdownToggle(course.id, e)}
          className="h-8 w-8 mx-auto rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
        >
          <MoreVertical className="h-4 w-4 text-slate-500" />
        </button>
        <CourseActionMenu
          course={course}
          isOpen={openDropdownId === course.id}
          onClose={closeDropdown}
          position={dropdownPosition}
          onViewProgress={onViewProgress}
          onResultEntry={handleResultEntry}
          onCloseArchive={handleCloseArchive}
        />
      </td>
    </tr>
  );
});

interface CourseActionMenuProps {
  course: CourseComplianceRecord;
  isOpen: boolean;
  onClose: () => void;
  position: { top: number; left: number; showAbove?: boolean };
  onViewProgress: (id: string) => void;
  onResultEntry: (id: string) => void;
  onCloseArchive: (course: CourseComplianceRecord) => void;
}

const CourseActionMenu: React.FC<CourseActionMenuProps> = ({
  course,
  isOpen,
  onClose,
  position,
  onViewProgress,
  onResultEntry,
  onCloseArchive,
}) => {
  if (!isOpen) return null;

  const completionRate = Math.round((course.completed / course.totalAssigned) * 100);

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[60]"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      />
      <div
        className="fixed z-[70] min-w-[180px] rounded-lg border border-slate-200 bg-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-200"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          transform: position.showAbove ? "translateY(-100%)" : "none",
        }}
      >
        <div className="py-1">
          {/* View Progress - Always visible */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewProgress(course.id);
              onClose();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <IconTimeline className="h-4 w-4 text-slate-500" />
            View Progress
          </button>

          {/* Result Entry - Only if in progress or has incomplete status */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onResultEntry(course.id);
              onClose();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <ClipboardList className="h-4 w-4 text-slate-500" />
            Result Entry
          </button>

          {/* Close & Archive - Only if 100% completion */}
          {completionRate === 100 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseArchive(course);
                  onClose();
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50 transition-colors"
              >
                <Archive className="h-4 w-4 text-slate-500" />
                Close & Archive
              </button>
            </>
          )}
        </div>
      </div>
    </>,
    document.body
  );
};

// --- Main Component ---

export const CourseStatusView: React.FC = () => {
  const { navigateTo, isNavigating } = useNavigateWithLoading();


  // Filters
  const [filters, setFilters] = useState<CourseStatusFilters>({
    searchQuery: "",
    departmentFilter: "All",
    typeFilter: "All",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { openId: openDropdownId, position: dropdownPosition, getRef, toggle: handleDropdownToggle, close: closeDropdown } = usePortalDropdown();


  // Details Modal State
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [detailsModalType, setDetailsModalType] = useState<
    "Total" | "Completed" | "InProgress" | "Overdue"
  >("Total");
  const [selectedCourse, setSelectedCourse] =
    useState<CourseComplianceRecord | null>(null);

  // Reminders State
  const [isRemindersModalOpen, setIsRemindersModalOpen] = useState(false);
  const [isSendingReminders, setIsSendingReminders] = useState(false);

  // Archive & E-Sign State
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isESignOpen, setIsESignOpen] = useState(false);

  // Reminders Selection State
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [notifyPush, setNotifyPush] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(true);

  // Feedback State
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    type: AlertModalType;
    title: string;
    description: string;
  }>({ type: "info", title: "", description: "" });

  const departmentOptions = [
    { label: "All Departments", value: "All" },
    { label: "Quality Assurance", value: "Quality Assurance" },
    { label: "QC Lab", value: "QC Lab" },
    { label: "Documentation", value: "Documentation" },
  ];

  const typeOptions = [
    { label: "All Types", value: "All" },
    { label: "GMP", value: "GMP" },
    { label: "Technical", value: "Technical" },
    { label: "Compliance", value: "Compliance" },
    { label: "SOP", value: "SOP" },
  ];

  // Filtered Data
  const filteredData = useMemo(() => {
    return MOCK_COURSE_STATUS.filter((course) => {
      const matchesSearch =
        course.courseTitle
          .toLowerCase()
          .includes(filters.searchQuery.toLowerCase()) ||
        course.courseId.toLowerCase().includes(filters.searchQuery.toLowerCase());
      const matchesDepartment =
        filters.departmentFilter === "All" ||
        course.department === filters.departmentFilter;
      const matchesType =
        filters.typeFilter === "All" || course.courseType === filters.typeFilter;

      return matchesSearch && matchesDepartment && matchesType;
    });
  }, [filters]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  // Memoized stats for dashboard
  const stats = useMemo(() => {
    const totalCourses = MOCK_COURSE_STATUS.length;
    const totalAssigned = MOCK_COURSE_STATUS.reduce((sum, c) => sum + c.totalAssigned, 0);
    const completed = MOCK_COURSE_STATUS.reduce((sum, c) => sum + c.completed, 0);
    const avgScore = totalCourses > 0
      ? Math.round(MOCK_COURSE_STATUS.reduce((sum, c) => sum + c.averageScore, 0) / totalCourses)
      : 0;

    return { totalCourses, totalAssigned, completed, avgScore };
  }, []);

  // --- Handlers ---
  const handleViewProgress = useCallback((courseId: string) => {
    navigateTo(ROUTES.TRAINING.COURSE_PROGRESS(courseId));
  }, [navigateTo]);

  const handleResultEntry = useCallback((courseId: string) => {
    navigateTo(ROUTES.TRAINING.COURSE_RESULT_ENTRY(courseId));
  }, [navigateTo]);

  const handleCloseArchive = useCallback((course: CourseComplianceRecord) => {
    setSelectedCourse(course);
    setIsArchiveModalOpen(true);
  }, []);

  const handleDetailList = useCallback((
    course: CourseComplianceRecord,
    type: "Total" | "Completed" | "InProgress" | "Overdue"
  ) => {
    setSelectedCourse(course);
    setDetailsModalType(type);
    setIsDetailsModalOpen(true);
  }, []);

  const handleConfirmArchive = () => {
    setIsArchiveModalOpen(false);
    setIsESignOpen(true);
  };

  const handleESignSuccess = () => {
    setIsESignOpen(false);
    setAlertConfig({
      type: "success",
      title: "Course Archived",
      description: `The course "${selectedCourse?.courseTitle}" has been successfully closed and archived for audit.`,
    });
    setAlertOpen(true);
  };

  const handleSendReminders = async () => {
    setIsSendingReminders(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsSendingReminders(false);
    setIsRemindersModalOpen(false);
    setAlertConfig({
      type: "success",
      title: "Reminders Sent",
      description: `Notifications have been sent to ${selectedEmployees.length || 30} selected employees.`,
    });
    setAlertOpen(true);
  };

  const toggleEmployeeSelection = (id: string) => {
    setSelectedEmployees(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const selectAllAffected = (ids: string[]) => {
    if (selectedEmployees.length === ids.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(ids);
    }
  };

  // Mock employee list for details modal
  const getMockEmployees = (type: string) => {
    const list = [
      { id: "EMP-1002", name: "Nguyen Van An", dept: "QA", status: "Completed", date: "15/03/2026" },
      { id: "EMP-1005", name: "Tran Thi Binh", dept: "QC", status: "In Progress", date: "-" },
      { id: "EMP-1010", name: "Le Van Cuong", dept: "Production", status: "Overdue", date: "01/03/2026" },
      { id: "EMP-1012", name: "Pham Thi Dung", dept: "Documentation", status: "Completed", date: "12/03/2026" },
      { id: "EMP-1015", name: "Hoang Van Em", dept: "Engineering", status: "In Progress", date: "-" },
    ];

    if (type === "Completed") return list.filter(e => e.status === "Completed");
    if (type === "InProgress") return list.filter(e => e.status === "In Progress");
    if (type === "Overdue") return list.filter(e => e.status === "Overdue");
    return list;
  };

  return (
    <div className="space-y-6 w-full flex-1 flex flex-col">
      {/* Header */}
      <PageHeader
        title="Course Status"
        breadcrumbItems={courseStatus(navigateTo)}
        actions={
          <div className="flex items-center gap-2">
            <Button
              onClick={() => console.log("Export status")}
              variant="outline"
              size="sm"
              className="whitespace-nowrap gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              onClick={() => setIsRemindersModalOpen(true)}
              variant="default"
              size="sm"
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              Send Reminders
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <div className="bg-white p-4 lg:p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4 items-end">
          <div className="xl:col-span-4">
            <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by course name or ID..."
                value={filters.searchQuery}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
                }
                className="w-full h-9 pl-10 pr-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm placeholder:text-slate-400 transition-colors"
              />
            </div>
          </div>

          <div className="xl:col-span-4">
            <Select
              label="Department"
              value={filters.departmentFilter}
              onChange={(val) =>
                setFilters((prev) => ({ ...prev, departmentFilter: val }))
              }
              options={departmentOptions}
            />
          </div>

          <div className="xl:col-span-4">
            <Select
              label="Type"
              value={filters.typeFilter}
              onChange={(val) =>
                setFilters((prev) => ({ ...prev, typeFilter: val }))
              }
              options={typeOptions}
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-600 font-medium">Total Courses</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalCourses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-600 font-medium">Total Assigned</p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.totalAssigned}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-600 font-medium">Completed</p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.completed}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-slate-600 font-medium">Avg. Score</p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.avgScore}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-xl bg-white shadow-sm overflow-hidden flex flex-col flex-1">
        <div className="flex-1 overflow-auto scrollbar-always-visible scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 hover:scrollbar-thumb-slate-400 scrollbar-thumb-rounded-full scrollbar-track-rounded-full pb-1.5">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap w-10 sm:w-[60px]">
                  No.
                </th>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Course ID
                </th>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Course Name
                </th>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Type
                </th>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Total Assigned
                </th>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Completed
                </th>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  In Progress
                </th>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Overdue
                </th>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Avg. Score
                </th>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Completion
                </th>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap text-center sticky right-0 bg-slate-50 z-20 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-200">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {paginatedData.map((course, index) => (
                <CourseRow
                  key={course.id}
                  course={course}
                  index={index}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  onViewProgress={handleViewProgress}
                  showDetailList={handleDetailList}
                  getRef={getRef}
                  handleDropdownToggle={handleDropdownToggle}
                  openDropdownId={openDropdownId}
                  closeDropdown={closeDropdown}
                  dropdownPosition={dropdownPosition}
                  handleCloseArchive={handleCloseArchive}
                  handleResultEntry={handleResultEntry}
                />
              ))}
            </tbody>
          </table>
        </div>

        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredData.length}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={(val) => {
            setItemsPerPage(val);
            setCurrentPage(1);
          }}
          showItemCount={true}
        />
      </div>

      {/* --- Modals --- */}

      {/* Employee Details Modal */}
      <FormModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title={`${detailsModalType} Employees - ${selectedCourse?.courseTitle}`}
        showCancel={false}
        confirmText="Close"
        size="xl"
      >
        <div className="space-y-4">
          <div className="bg-slate-50 p-3 rounded-lg flex items-center gap-4 text-[10px] sm:text-sm text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold">{selectedCourse?.courseId}</span>
            </div>
            <div className="h-3 w-[1px] bg-slate-200" />
            <span>{selectedCourse?.totalAssigned} Total Participants</span>
          </div>

          <div className="border rounded-lg flex-1 overflow-auto scrollbar-always-visible scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 hover:scrollbar-thumb-slate-400 scrollbar-thumb-rounded-full scrollbar-track-rounded-full pb-1.5">
            <table className="w-full text-[10px] sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2 text-left font-bold text-slate-500 uppercase tracking-wider text-[8px] sm:text-[10px] whitespace-nowrap">Employee ID</th>
                  <th className="px-4 py-2 text-left font-bold text-slate-500 uppercase tracking-wider text-[8px] sm:text-[10px] whitespace-nowrap">Name</th>
                  <th className="px-4 py-2 text-left font-bold text-slate-500 uppercase tracking-wider text-[8px] sm:text-[10px] whitespace-nowrap">Department</th>
                  <th className="px-4 py-2 text-left font-bold text-slate-500 uppercase tracking-wider text-[8px] sm:text-[10px] whitespace-nowrap">Status</th>
                  <th className="px-4 py-2 text-left font-bold text-slate-500 uppercase tracking-wider text-[8px] sm:text-[10px] whitespace-nowrap">Completed Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {getMockEmployees(detailsModalType).map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium text-slate-700 whitespace-nowrap">{emp.id}</td>
                    <td className="px-4 py-3 text-slate-900 font-semibold whitespace-nowrap">{emp.name}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{emp.dept}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-bold border whitespace-nowrap",
                        emp.status === "Completed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          emp.status === "In Progress" ? "bg-blue-50 text-blue-700 border-blue-200" :
                            "bg-red-50 text-red-700 border-red-200"
                      )}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{emp.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </FormModal>

      <FormModal
        isOpen={isRemindersModalOpen}
        onClose={() => setIsRemindersModalOpen(false)}
        title="Send Training Reminders"
        description="Notify employees who are currently in progress or overdue."
        confirmText="Send Notifications"
        onConfirm={handleSendReminders}
        isLoading={isSendingReminders}
        size="lg"
      >
        <div className="space-y-5 sm:space-y-6">
          {/* Summary Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 sm:p-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3">
                <span className="text-lg sm:text-xl font-bold text-red-600">8</span>
                <span className="text-[9px] sm:text-[10px] font-bold text-red-800 uppercase tracking-tight bg-red-100/50 px-2 py-0.5 rounded">Overdue</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg sm:text-xl font-bold text-blue-600">22</span>
                <span className="text-[9px] sm:text-[10px] font-bold text-blue-800 uppercase tracking-tight bg-blue-100/50 px-2 py-0.5 rounded">In Progress</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] sm:text-sm font-medium text-slate-700">Affected Employees</label>
              <button
                onClick={() => selectAllAffected(["EMP-1010", "EMP-1005", "EMP-1015", "EMP-1022", "EMP-1033", "EMP-1045"])}
                className="text-[10px] sm:text-xs text-emerald-600 font-semibold hover:underline transition-colors"
              >
                {selectedEmployees.length === 6 ? "Deselect All" : "Select All"}
              </button>
            </div>

            <div className="max-h-[200px] overflow-y-auto pr-1 space-y-2">
              {[
                { id: "EMP-1010", name: "Le Van Cuong", dept: "Production", title: "Senior Operator", status: "Overdue" },
                { id: "EMP-1005", name: "Tran Thi Binh", dept: "QC", title: "Lab Technician", status: "In Progress" },
                { id: "EMP-1015", name: "Hoang Van Em", dept: "Engineering", title: "Maintenance Specialist", status: "In Progress" },
                { id: "EMP-1022", name: "Dang Van Hung", dept: "Maintenance", title: "Junior Engineer", status: "Overdue" },
                { id: "EMP-1033", name: "Nguyen Thu Huong", dept: "QA", title: "Quality Specialist", status: "In Progress" },
                { id: "EMP-1045", name: "Tran Xuan Bac", dept: "Warehouse", title: "Staff", status: "Overdue" },
              ].map((emp) => (
                <div
                  key={emp.id}
                  onClick={() => toggleEmployeeSelection(emp.id)}
                  className={cn(
                    "flex items-center justify-between p-2.5 border rounded-lg transition-all cursor-pointer",
                    selectedEmployees.includes(emp.id)
                      ? "border-emerald-500 bg-emerald-50/50"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedEmployees.includes(emp.id)}
                      onChange={() => toggleEmployeeSelection(emp.id)}
                    />
                    <div className="flex flex-col">
                      <span className="text-[10px] sm:text-sm font-semibold text-slate-700">{emp.name}</span>
                      <span className="text-[9px] sm:text-xs text-slate-500 font-medium">{emp.id} • {emp.title} • {emp.dept}</span>
                    </div>
                  </div>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold border whitespace-nowrap",
                    emp.status === "Overdue"
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-blue-50 text-blue-700 border-blue-200"
                  )}>
                    {emp.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs sm:text-sm font-medium text-slate-700 block">Delivery Methods</label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all cursor-pointer group">
                <div className="h-9 w-9 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100 group-hover:bg-emerald-100 transition-colors shrink-0">
                  <Smartphone className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-700 text-[10px] sm:text-sm truncate">Push Notification</p>
                </div>
                <Checkbox checked={notifyPush} onChange={setNotifyPush} className="shrink-0" />
              </label>

              <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all cursor-pointer group">
                <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100 group-hover:bg-blue-100 transition-colors shrink-0">
                  <Mail className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-700 text-[10px] sm:text-sm truncate">Email Delivery</p>
                </div>
                <Checkbox checked={notifyEmail} onChange={setNotifyEmail} className="shrink-0" />
              </label>
            </div>
          </div>
        </div>
      </FormModal>

      {/* Archive Confirmation Modal */}
      <FormModal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        onConfirm={handleConfirmArchive}
        title="Close & Archive Course"
        confirmText="Confirm & Archive"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs sm:text-sm font-bold text-amber-900">Archive Confirmation</p>
              <p className="text-[10px] sm:text-xs text-amber-800 mt-1">
                You are about to close <span className="font-bold underline">{selectedCourse?.courseTitle}</span>.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] sm:text-xs font-semibold text-slate-700 uppercase tracking-wider">Historical records will be:</p>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-100 rounded text-[10px] sm:text-xs text-slate-600">
                <span className="shrink-0">•</span> Locked for all future result entries.
              </div>
              <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-100 rounded text-[10px] sm:text-xs text-slate-600">
                <span className="shrink-0">•</span> Moved to the Audit-Ready Training Archive.
              </div>
              <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-100 rounded text-[10px] sm:text-xs text-slate-600">
                <span className="shrink-0">•</span> Marked as permanently completed.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
            <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0" />
            <p className="text-[9px] sm:text-xs text-blue-800 font-medium">
              This action requires an Electronic Signature for compliance.
            </p>
          </div>
        </div>
      </FormModal>

      {/* Electronic Signature Modal */}
      <ESignatureModal
        isOpen={isESignOpen}
        onClose={() => setIsESignOpen(false)}
        onConfirm={handleESignSuccess}
        actionTitle={`Close and Archive Training Course ID: ${selectedCourse?.courseId}`}
      />

      {/* Global Alert */}
      <AlertModal
        isOpen={alertOpen}
        onClose={() => setAlertOpen(false)}
        type={alertConfig.type}
        title={alertConfig.title}
        description={alertConfig.description}
      />

      {isNavigating && <FullPageLoading text="Navigating..." />}
    </div>
  );
};



