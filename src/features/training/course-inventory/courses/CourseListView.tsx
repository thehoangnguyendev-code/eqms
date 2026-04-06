import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/app/routes.constants";
import {
  Search,
  GraduationCap,
  Users,
  Edit,
  Download,
  ClipboardList,
  BarChart3,
  MoreVertical,
  SlidersHorizontal,
  ArrowDownAZ,
  ArrowDownZA,
  X,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { IconInfoCircle, IconEyeCheck, IconChecks, IconPlus } from "@tabler/icons-react";
import { FullPageLoading, SectionLoading } from "@/components/ui/loading/Loading";
import { PageHeader } from "@/components/ui/page/PageHeader";
import { coursesList } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import { DateTimePicker } from "@/components/ui/datetime-picker/DateTimePicker";
import { DateRangePicker } from "@/components/ui/datetime-picker/DateRangePicker";
import { TablePagination } from "@/components/ui/table/TablePagination";
import { TableEmptyState } from "@/components/ui/table/TableEmptyState";
import { cn } from "@/components/ui/utils";
import { formatDate } from "@/utils/format";
import { getStatusColorClass, getTrainingMethodConfig } from "@/utils/status";
import {
  TrainingRecord,
  TrainingFilters,
  TrainingStatus,
  TrainingType,
  TrainingMethod,
} from "../../types";
import { MOCK_TRAININGS } from "./mockData";
import { usePortalDropdown, useNavigateWithLoading, useTableFilter, useTableDragScroll, PortalDropdownPosition } from "@/hooks";

// ── Local Dropdown ────────────────────────────────────────────────
interface CourseDropdownMenuProps {
  training: TrainingRecord;
  isOpen: boolean;
  onClose: () => void;
  position: PortalDropdownPosition;
  onNavigate: (path: string) => void;
}

const CourseDropdownMenu: React.FC<CourseDropdownMenuProps> = ({
  training,
  isOpen,
  onClose,
  position,
  onNavigate,
}) => {
  if (!isOpen) return null;

  type MenuItem =
    | { isDivider: true }
    | { isDivider?: false; icon: React.ElementType; label: string; onClick: () => void; color?: string };

  const menuItems: MenuItem[] = [
    { icon: IconInfoCircle, label: "View Detail", onClick: () => { onNavigate(ROUTES.TRAINING.COURSE_DETAIL(training.id)); onClose(); }, color: "text-slate-500" },
    { icon: Edit, label: "Edit Course", onClick: () => { onNavigate(ROUTES.TRAINING.COURSE_EDIT(training.id)); onClose(); }, color: "text-slate-500" },
    ...(training.status === "Pending Review" ? [{ icon: IconEyeCheck, label: "Review Course", onClick: () => { onNavigate(ROUTES.TRAINING.APPROVAL_DETAIL(training.id)); onClose(); }, color: "text-slate-500" } as MenuItem] : []),
    ...(training.status === "Pending Approval" ? [{ icon: IconChecks, label: "Approve Course", onClick: () => { onNavigate(ROUTES.TRAINING.APPROVE_DETAIL(training.id)); onClose(); }, color: "text-slate-500" } as MenuItem] : []),
    { isDivider: true },
    { icon: Download, label: "Export PDF", onClick: () => { console.log("Export PDF:", training.id); onClose(); }, color: "text-slate-500" },
  ];

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-40 animate-in fade-in duration-150"
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        aria-hidden="true"
      />
      <div
        className="absolute z-50 min-w-[160px] w-[200px] max-w-[90vw] max-h-[300px] overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-200"
        style={position.style}
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
                onClick={(e) => { e.stopPropagation(); mi.onClick(); }}
                className={cn("flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-slate-50 active:bg-slate-100 transition-colors", mi.color)}
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

export const CourseListView: React.FC = () => {
  const { navigateTo, isNavigating } = useNavigateWithLoading();


  // Filters
  const [filters, setFilters] = useState<Omit<TrainingFilters, "searchQuery">>({
    typeFilter: "All",
    statusFilter: "All",
    dateFrom: "",
    dateTo: "",
  });
  const [methodFilter, setMethodFilter] = useState<TrainingMethod | "All">("All");
  const [isFilterVisible, setIsFilterVisible] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth >= 768 : true;
  });
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "trainingId",
    direction: "asc",
  });

  // Use shared Table Filter hook
  const {
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    paginatedItems: paginatedData,
    filteredItems: filteredData,
  } = useTableFilter(MOCK_TRAININGS, {
    filterFn: (training, q) => {
      const query = q.toLowerCase();
      const matchesSearch =
        !query ||
        training.title.toLowerCase().includes(query) ||
        training.trainingId.toLowerCase().includes(query) ||
        training.instructor.toLowerCase().includes(query);
      const matchesType = filters.typeFilter === "All" || training.type === filters.typeFilter;
      const matchesStatus = filters.statusFilter === "All" || training.status === filters.statusFilter;
      const matchesMethod = methodFilter === "All" || training.trainingMethod === methodFilter;

      let matchesDateFrom = true;
      let matchesDateTo = true;

      if (filters.dateFrom) {
        matchesDateFrom = new Date(training.scheduledDate) >= new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        matchesDateTo = new Date(training.scheduledDate) <= new Date(filters.dateTo);
      }

      return matchesSearch && matchesType && matchesStatus && matchesMethod && matchesDateFrom && matchesDateTo;
    }
  });

  // Handle loading state on filter changes
  useEffect(() => {
    setIsTableLoading(true);
    const timer = setTimeout(() => setIsTableLoading(false), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, filters, methodFilter]);

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const key = sortConfig.key as keyof TrainingRecord;
      let aValue: any = a[key];
      let bValue: any = b[key];

      if (key === "scheduledDate") {
        const parseD = (s: string) => {
          if (!s) return 0;
          const parts = s.split("/");
          return parts.length === 3 ? new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])).getTime() : new Date(s).getTime();
        };
        aValue = parseD(aValue);
        bValue = parseD(bValue);
      }

      if (typeof aValue === "string") aValue = aValue.toLowerCase();
      if (typeof bValue === "string") bValue = bValue.toLowerCase();

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Update pagination to use sortedData
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSortedData = useMemo(() => {
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, startIndex, itemsPerPage]);

  const { openId: openDropdownId, position: dropdownPosition, getRef, toggle: handleDropdownToggle, close: closeDropdown } = usePortalDropdown();
  const { scrollerRef, isDragging, dragEvents } = useTableDragScroll();

  // Reset to page 1 when extra filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.typeFilter, filters.statusFilter, filters.dateFrom, filters.dateTo, methodFilter, setCurrentPage]);


  // Filter Options
  const typeOptions = [
    { label: "All Types", value: "All" },
    { label: "GMP", value: "GMP" },
    { label: "Technical", value: "Technical" },
    { label: "Compliance", value: "Compliance" },
    { label: "SOP", value: "SOP" },
    { label: "Safety", value: "Safety" },
  ];

  const methodOptions = [
    { label: "All Methods", value: "All" },
    { label: "Read & Understood", value: "Read & Understood" },
    { label: "Quiz (Paper-based/Manual)", value: "Quiz (Paper-based/Manual)" },
    { label: "Hands-on / OJT", value: "Hands-on/OJT" },
  ];

  const statusOptions = [
    { label: "All Status", value: "All" },
    { label: "Draft", value: "Draft" },
    { label: "Pending Review", value: "Pending Review" },
    { label: "Pending Approval", value: "Pending Approval" },
    { label: "Effective", value: "Effective" },
    { label: "Obsoleted", value: "Obsoleted" },
  ];

  return (
    <div className="space-y-6 w-full flex-1 flex flex-col">
      {/* Header: Title + Breadcrumb + Action Button */}
      <PageHeader
        title="Courses List"
        breadcrumbItems={coursesList(navigateTo)}
        actions={
          <>
            <Button
              onClick={() => console.log("Export triggered")}
              variant="outline"
              size="sm"
              className="whitespace-nowrap gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              onClick={() => navigateTo(ROUTES.TRAINING.COURSES_CREATE)}
              size="sm"
              className="whitespace-nowrap gap-2"
            >
              <IconPlus className="h-4 w-4" />
              New Course
            </Button>
          </>
        }
      />

      {/* Unified Content Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm w-full overflow-hidden flex flex-col">
        {/* Filter Section */}
        <div className="p-4 md:p-5 flex flex-col">
          {/* Search Row + Primary Actions */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs sm:text-sm font-medium text-slate-700 block transition-colors px-0.5">
              Search
            </label>
            <div className="flex gap-2 items-center w-full">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors">
                  <Search className="h-4 w-4 text-slate-400 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Search by title, ID, or instructor..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="block w-full pl-10 pr-10 h-9 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex-shrink-0">
                <Button
                  variant={isFilterVisible ? "default" : "outline"}
                  onClick={() => setIsFilterVisible(!isFilterVisible)}
                  className="h-9 px-3 sm:px-4 gap-2 whitespace-nowrap rounded-lg"
                  size="sm"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="hidden sm:inline">Filters</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Conditional Filters Tray: Accordion Effect */}
          <AnimatePresence>
            {isFilterVisible && (
              <motion.div
                initial={{ height: 0, opacity: 0, y: -10, marginTop: 0 }}
                animate={{ height: "auto", opacity: 1, y: 0, marginTop: 16 }}
                exit={{ height: 0, opacity: 0, y: -10, marginTop: 0 }}
                transition={{
                  height: { type: "spring", bounce: 0, duration: 0.4 },
                  marginTop: { type: "spring", bounce: 0, duration: 0.4 },
                  opacity: { duration: 0.25 },
                  y: { duration: 0.3 }
                }}
                className="overflow-hidden px-1.5 -mx-1.5 pb-1.5 -mb-1.5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Training Type */}
                  <Select
                    label="Training Type"
                    value={filters.typeFilter}
                    onChange={(val) =>
                      setFilters((prev) => ({ ...prev, typeFilter: val as TrainingType | "All" }))
                    }
                    options={typeOptions}
                  />

                  {/* Training Method */}
                  <Select
                    label="Training Method"
                    value={methodFilter}
                    onChange={(val) => setMethodFilter(val as TrainingMethod | "All")}
                    options={methodOptions}
                  />

                  {/* Status */}
                  <Select
                    label="Status"
                    value={filters.statusFilter}
                    onChange={(val) =>
                      setFilters((prev) => ({ ...prev, statusFilter: val as TrainingStatus | "All" }))
                    }
                    options={statusOptions}
                  />

                  {/* Date Range */}
                  <div className="lg:col-span-1">
                    <DateRangePicker
                      label="Scheduled Date Range"
                      startDate={filters.dateFrom}
                      endDate={filters.dateTo}
                      onStartDateChange={(val) =>
                        setFilters((prev) => ({ ...prev, dateFrom: val }))
                      }
                      onEndDateChange={(val) =>
                        setFilters((prev) => ({ ...prev, dateTo: val }))
                      }
                      placeholder="Select date range"
                    />
                  </div>

                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFilters({
                          typeFilter: "All",
                          statusFilter: "All",
                          dateFrom: "",
                          dateTo: "",
                        });
                        setMethodFilter("All");
                        setSearchQuery("");
                        setCurrentPage(1);
                      }}
                      className="h-9 px-4 gap-2 font-medium transition-all duration-200 hover:bg-red-600 hover:text-white hover:border-red-600 whitespace-nowrap"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Table Section */}
        <div className="px-4 md:px-5 pb-4 md:pb-5 flex-1 flex flex-col relative">
          {isTableLoading && (
            <div className="absolute inset-0 z-20 bg-white/40 backdrop-blur-[4px] flex items-center justify-center transition-all duration-300">
              <SectionLoading text="Searching..." minHeight="150px" />
            </div>
          )}

          <div className={cn(
            "border border-slate-200 rounded-xl overflow-hidden flex flex-col flex-1 bg-white transition-all duration-300",
            isTableLoading && "blur-[2px] opacity-80"
          )}>
            <div
              ref={scrollerRef}
              className={cn(
                "flex-1 overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-50 hover:scrollbar-thumb-slate-400 pb-1.5 transition-colors",
                isDragging ? "cursor-grabbing select-none" : "cursor-grab"
              )}
              {...dragEvents}
            >
              <table className="w-full border-separate border-spacing-0 text-left">
                <thead>
                  <tr>
                    <th className="sticky top-0 z-20 bg-slate-50 py-2.5 px-2 md:py-3.5 md:px-4 text-center text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 whitespace-nowrap w-16">
                      No.
                    </th>
                    {[
                      { label: "Course ID", id: "trainingId" },
                      { label: "Course Name", id: "title" },
                      { label: "Type", id: "type" },
                      { label: "Method", id: "trainingMethod" },
                      { label: "Status", id: "status" },
                      { label: "Instructor", id: "instructor" },
                      { label: "Retraining", id: "recurrence" },
                      { label: "Scheduled", id: "scheduledDate" },
                      { label: "Enrolled", id: "enrolled", align: "text-center" }
                    ].map((col, idx) => {
                      const isSorted = sortConfig.key === col.id;
                      return (
                        <th
                          key={idx}
                          onClick={() => handleSort(col.id)}
                          className={cn(
                            "sticky top-0 z-20 bg-slate-50 py-2.5 px-2 md:py-3.5 md:px-4 text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 whitespace-nowrap cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition-colors group",
                            col.align || "text-left"
                          )}
                        >
                          <div className="flex items-center justify-between gap-2 w-full">
                            <span className="truncate">{col.label}</span>
                            <div className="flex flex-col text-slate-500 flex-shrink-0 group-hover:text-slate-700 transition-colors">
                              <ChevronUp className={cn("h-3 w-3 -mb-1", isSorted && sortConfig.direction === 'asc' ? "text-emerald-600" : "")} />
                              <ChevronDown className={cn("h-3 w-3", isSorted && sortConfig.direction === 'desc' ? "text-emerald-600" : "")} />
                            </div>
                          </div>
                        </th>
                      );
                    })}
                    <th className="sticky top-0 right-0 z-30 bg-slate-50 py-2.5 px-2 md:py-3.5 md:px-4 text-center text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 whitespace-nowrap before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-slate-200 shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.05)]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {paginatedSortedData.length > 0 ? (
                    paginatedSortedData.map((training, index) => {
                      const tdClass = "py-2.5 px-2 md:py-3.5 md:px-4 text-xs md:text-sm text-slate-700 border-b border-slate-200 whitespace-nowrap";
                      return (
                        <tr
                          key={training.id}
                          className="hover:bg-slate-50/80 transition-colors group"
                        >
                          <td className={cn(tdClass, "text-center text-slate-500 font-medium")}>
                            {startIndex + index + 1}
                          </td>
                          <td
                            className={cn(tdClass, "cursor-pointer")}
                            onClick={() => navigateTo(ROUTES.TRAINING.COURSE_DETAIL(training.id))}
                          >
                            <span className="font-medium text-emerald-600 hover:underline">
                              {training.trainingId}
                            </span>
                          </td>
                          <td className={tdClass}>
                            <div className="flex items-start gap-2">
                              <GraduationCap className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                              <div className="max-w-[200px] md:max-w-md">
                                <p className="font-medium text-slate-900">
                                  {training.title}
                                </p>
                                <p className="text-[10px] md:text-xs text-slate-500 mt-0.5">
                                  {training.description}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className={tdClass}>
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200">
                              {training.type}
                            </span>
                          </td>
                          <td className={tdClass}>
                            {training.trainingMethod && (() => {
                              const cfg = getTrainingMethodConfig(training.trainingMethod);
                              return (
                                <span className={cn(
                                  "inline-flex items-center gap-1.5 px-2 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-medium border",
                                  cfg.className
                                )}>
                                  {cfg.label}
                                </span>
                              );
                            })()}
                          </td>
                          <td className={tdClass}>
                            <span className={cn(
                              "inline-flex items-center gap-1.5 px-2 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-medium border",
                              getStatusColorClass(training.status)
                            )}>
                              {training.status}
                            </span>
                          </td>
                          <td className={tdClass}>
                            {training.instructor}
                          </td>
                          <td className={tdClass}>
                            {training.recurrence?.enabled ? (
                              <span className="inline-flex items-center gap-1.5 text-emerald-600 font-medium">
                                <IconChecks className="h-4 w-4" />
                                Every {training.recurrence.intervalMonths}m
                                <span className="text-[10px] text-slate-400 font-normal ml-1">(WP: {training.recurrence.warningPeriodDays}d)</span>
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Disabled</span>
                            )}
                          </td>
                          <td className={tdClass}>
                            {formatDate(training.scheduledDate)}
                          </td>
                          <td className={tdClass}>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-slate-400" />
                              <span className="text-slate-900 font-medium">
                                {training.enrolled}/{training.capacity}
                              </span>
                            </div>
                          </td>
                          <td
                            onClick={(e) => e.stopPropagation()}
                            className="sticky right-0 z-10 bg-white border-b border-slate-200 py-2.5 px-2 md:py-3.5 md:px-4 text-center whitespace-nowrap before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-slate-200 shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.05)] group-hover:bg-slate-50 transition-colors"
                          >
                            <button
                              ref={getRef(training.id)}
                              onClick={(e) => handleDropdownToggle(training.id, e)}
                              className="inline-flex items-center justify-center h-7 w-7 md:h-8 md:w-8 rounded-lg hover:bg-slate-200 transition-colors"
                              aria-label="More actions"
                            >
                              <MoreVertical className="h-3.5 w-3.5 md:h-4 md:w-4 text-slate-600" />
                            </button>
                            <CourseDropdownMenu
                              training={training}
                              isOpen={openDropdownId === training.id}
                              onClose={closeDropdown}
                              position={dropdownPosition}
                              onNavigate={navigateTo}
                            />
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={11}>
                        <TableEmptyState
                          title="No Training Records Found"
                          description="We couldn’t find any training records matching your filters. Try adjusting your search criteria or clear filters."
                          actionLabel="Clear Filters"
                          onAction={() => {
                            setFilters({
                              typeFilter: "All",
                              statusFilter: "All",
                              dateFrom: "",
                              dateTo: "",
                            });
                            setMethodFilter("All");
                            setSearchQuery("");
                            setCurrentPage(1);
                          }}
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={sortedData.length}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={setItemsPerPage}
              showItemCount={true}
            />
          </div>
        </div>
      </div>

      {/* ─── Loading Overlay ──────────────────────────────────── */}
      {isNavigating && <FullPageLoading text="Loading..." />}
    </div>
  );
};
