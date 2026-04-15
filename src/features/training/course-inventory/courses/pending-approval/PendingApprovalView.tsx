import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/app/routes.constants";
import {
  Search,
  GraduationCap,
  Users,
  Download,
  MoreVertical,
  ChevronUp,
  ChevronDown,
  X,
} from "lucide-react";
import { IconInfoCircle, IconChecks } from "@tabler/icons-react";
import { PageHeader } from "@/components/ui/page/PageHeader";
import { coursePendingApproval } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { Button } from "@/components/ui/button/Button";
import { FullPageLoading, SectionLoading } from "@/components/ui/loading/Loading";
import { Select } from "@/components/ui/select/Select";
import { DateRangePicker } from "@/components/ui/datetime-picker/DateRangePicker";
import { TablePagination } from "@/components/ui/table/TablePagination";
import { TableEmptyState } from "@/components/ui/table/TableEmptyState";
import { cn } from "@/components/ui/utils";
import { getStatusColorClass, getTrainingMethodConfig } from "@/utils/status";
import { formatDateUS } from "@/utils/format";
import { CourseApproval, CourseWorkflowStatus, TrainingMethod, TrainingType } from "../../../types";
import { MOCK_PENDING_APPROVAL } from "../mockData";
import { usePortalDropdown, useNavigateWithLoading, useTableDragScroll } from "@/hooks";

const TYPE_OPTIONS = [
  { label: "All Types", value: "All" },
  { label: "GMP", value: "GMP" },
  { label: "Technical", value: "Technical" },
  { label: "Compliance", value: "Compliance" },
  { label: "SOP", value: "SOP" },
  { label: "Safety", value: "Safety" },
];

const METHOD_OPTIONS = [
  { label: "All Methods", value: "All" },
  { label: "Quiz (Paper-based/Manual)", value: "Quiz (Paper-based/Manual)" },
  { label: "Hands-on / OJT", value: "Hands-on/OJT" },
  { label: "Read & Understood", value: "Read & Understood" },
];

export const PendingApprovalView: React.FC = () => {
  const { navigateTo, isNavigating } = useNavigateWithLoading();

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [methodFilter, setMethodFilter] = useState<string>("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: "asc" | "desc" }>({
    key: "scheduledDate",
    direction: "desc",
  });

  const { openId: openDropdownId, position: dropdownPosition, getRef, toggle: handleDropdownToggle, close: closeDropdown } = usePortalDropdown();
  const { scrollerRef, isDragging, dragEvents } = useTableDragScroll();

  // Sorting Handler
  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const filteredData = useMemo(() => {
    return MOCK_PENDING_APPROVAL.filter((item) => {
      const matchesSearch =
        item.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.trainingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.instructor || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === "All" || item.trainingType === typeFilter;
      const matchesMethod = methodFilter === "All" || item.trainingMethod === methodFilter;

      let matchesDateFrom = true;
      let matchesDateTo = true;
      if (dateFrom) {
        matchesDateFrom = new Date(item.scheduledDate || item.submittedAt) >= new Date(dateFrom);
      }
      if (dateTo) {
        matchesDateTo = new Date(item.scheduledDate || item.submittedAt) <= new Date(dateTo);
      }

      return matchesSearch && matchesType && matchesMethod && matchesDateFrom && matchesDateTo;
    });
  }, [searchQuery, typeFilter, methodFilter, dateFrom, dateTo]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      let aVal: any = (a as any)[sortConfig.key!];
      let bVal: any = (b as any)[sortConfig.key!];

      if (sortConfig.key === "scheduledDate") {
        aVal = new Date(aVal || a.submittedAt).getTime();
        bVal = new Date(bVal || b.submittedAt).getTime();
      } else if (sortConfig.key === "enrolled") {
        aVal = a.enrolled ?? 0;
        bVal = b.enrolled ?? 0;
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Handle loading state on filter changes
  React.useEffect(() => {
    setIsTableLoading(true);
    const timer = setTimeout(() => setIsTableLoading(false), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, typeFilter, methodFilter, dateFrom, dateTo, sortConfig]);

  // Pagination using sortedData
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSortedData = useMemo(() => {
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, startIndex, itemsPerPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleViewDetail = (id: string) => {
    navigateTo(`${ROUTES.TRAINING.PENDING_APPROVAL}/${id}`);
    closeDropdown();
  };

  const handleApproveCourse = (id: string) => {
    navigateTo(`${ROUTES.TRAINING.PENDING_APPROVAL}/${id}`);
    closeDropdown();
  };

  return (
    <div className="space-y-6 w-full flex-1 flex flex-col">
      {/* Header */}
      <PageHeader
        title="Pending Approval"
        breadcrumbItems={coursePendingApproval(navigateTo)}
        actions={
          <>
            <Button
              onClick={() => console.log("Export pending approval")}
              variant="outline"
              size="sm"
              className="whitespace-nowrap gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </>
        }
      />

      {/* Unified Content Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm w-full overflow-hidden flex flex-col">
        {/* Filter Section */}
        <div className="p-4 md:p-5 flex flex-col">
          <div className="px-1.5 -mx-1.5 pb-1.5 -mb-1.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                  <div className="w-full">
                    <label className="text-xs sm:text-sm font-medium text-slate-700 block transition-colors px-0.5 mb-1.5">
                      Search
                    </label>
                    <div className="relative">
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
                  </div>

                  {/* Training Type */}
                  <Select
                    label="Training Type"
                    value={typeFilter}
                    onChange={(val) => {
                      setTypeFilter(val);
                      setCurrentPage(1);
                    }}
                    options={TYPE_OPTIONS}
                  />

                  {/* Training Method */}
                  <Select
                    label="Training Method"
                    value={methodFilter}
                    onChange={(val) => {
                      setMethodFilter(val);
                      setCurrentPage(1);
                    }}
                    options={METHOD_OPTIONS}
                  />

                  {/* Status (readonly) */}
                  <Select
                    label="Status"
                    value="Pending Approval"
                    onChange={() => { }}
                    options={[{ label: "Pending Approval", value: "Pending Approval" }]}
                    disabled
                  />

                  {/* Date Range */}
                  <div className="lg:col-span-1">
                    <DateRangePicker
                      label="Scheduled Date Range"
                      startDate={dateFrom}
                      endDate={dateTo}
                      onStartDateChange={(val) => {
                        setDateFrom(val);
                        setCurrentPage(1);
                      }}
                      onEndDateChange={(val) => {
                        setDateTo(val);
                        setCurrentPage(1);
                      }}
                      placeholder="Select date range"
                    />
                  </div>

                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTypeFilter("All");
                        setMethodFilter("All");
                        setDateFrom("");
                        setDateTo("");
                        setSearchQuery("");
                        setCurrentPage(1);
                      }}
                      className="h-9 px-4 gap-2 font-medium transition-all duration-200 hover:bg-red-600 hover:text-white hover:border-red-600 whitespace-nowrap"
                    >
                      Clear Filters
                    </Button>
                  </div>
            </div>
          </div>
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
                      { label: "Course Name", id: "courseTitle" },
                      { label: "Type", id: "trainingType" },
                      { label: "Method", id: "trainingMethod" },
                      { label: "Status", id: "approvalStatus" },
                      { label: "Instructor", id: "instructor" },
                      { label: "Scheduled Date", id: "scheduledDate" },
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
                  {paginatedSortedData.length === 0 ? (
                    <tr>
                      <td colSpan={10}>
                        <TableEmptyState
                          title="No courses pending approval"
                          description="All courses have been approved or no courses match your filters."
                        />
                      </td>
                    </tr>
                  ) : (
                    paginatedSortedData.map((item, index) => {
                      const tdClass = "py-2.5 px-2 md:py-3.5 md:px-4 text-xs md:text-sm text-slate-700 border-b border-slate-200 whitespace-nowrap";
                      const methodCfg = getTrainingMethodConfig(item.trainingMethod);

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50/80 transition-colors group"
                        >
                          <td className={cn(tdClass, "text-center text-slate-500 font-medium")}>
                            {startIndex + index + 1}
                          </td>
                          <td
                            className={cn(tdClass, "cursor-pointer")}
                            onClick={() => handleViewDetail(item.id)}
                          >
                            <span className="font-medium text-emerald-600 hover:underline">{item.trainingId}</span>
                          </td>
                          <td className={tdClass}>
                            <div className="flex items-start gap-2">
                              <GraduationCap className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                              <div className="max-w-[200px] md:max-w-md">
                                <p className="font-medium text-slate-900">{item.courseTitle}</p>
                                <p className="text-[10px] md:text-xs text-slate-500 mt-0.5">{item.relatedDocument}</p>
                              </div>
                            </div>
                          </td>
                          <td className={tdClass}>
                            {item.trainingType && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200">
                                {item.trainingType}
                              </span>
                            )}
                          </td>
                          <td className={tdClass}>
                            <span className={cn(
                              "inline-flex items-center gap-1.5 px-2 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-medium border",
                              methodCfg.className
                            )}>
                              {methodCfg.label}
                            </span>
                          </td>
                          <td className={tdClass}>
                            <span className={cn(
                              "inline-flex items-center gap-1.5 px-2 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-medium border",
                              getStatusColorClass(item.approvalStatus)
                            )}>
                              {item.approvalStatus}
                            </span>
                          </td>
                          <td className={tdClass}>
                            {item.instructor || "—"}
                          </td>
                          <td className={tdClass}>
                            {formatDateUS(item.scheduledDate || item.submittedAt)}
                          </td>
                          <td className={tdClass}>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-slate-400" />
                              <span className="text-slate-900 font-medium">
                                {item.enrolled ?? 0}/{item.capacity ?? 0}
                              </span>
                            </div>
                          </td>
                          <td
                            onClick={(e) => e.stopPropagation()}
                            className="sticky right-0 z-10 bg-white border-b border-slate-200 py-2.5 px-2 md:py-3.5 md:px-4 text-center whitespace-nowrap before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-slate-200 shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.05)] group-hover:bg-slate-50 transition-colors"
                          >
                            <button
                              ref={getRef(item.id)}
                              onClick={(e) => handleDropdownToggle(item.id, e)}
                              className="inline-flex items-center justify-center h-7 w-7 md:h-8 md:w-8 rounded-lg hover:bg-slate-200 transition-colors"
                              aria-label="Actions"
                            >
                              <MoreVertical className="h-3.5 w-3.5 md:h-4 md:w-4 text-slate-600" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={sortedData.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
              showItemCount={true}
            />
          </div>
        </div>
      </div>

      {/* Action Dropdown Portal */}
      {openDropdownId && createPortal(
        <>
          <div
            className="fixed inset-0 z-40 animate-in fade-in duration-150"
            onClick={(e) => {
              e.stopPropagation();
              closeDropdown();
            }}
            aria-hidden="true"
          />
          <div
            className="absolute z-50 min-w-[160px] w-[200px] max-w-[90vw] max-h-[300px] overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-200"
            style={dropdownPosition.style}
          >
            <div className="py-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewDetail(openDropdownId);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-slate-50 active:bg-slate-100 transition-colors text-slate-500"
              >
                <IconInfoCircle className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium">View Details</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleApproveCourse(openDropdownId);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-slate-50 active:bg-slate-100 transition-colors text-slate-500"
              >
                <IconChecks className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium">Approve Course</span>
              </button>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* ─── Loading Overlay ──────────────────────────────────── */}
      {isNavigating && <FullPageLoading text="Loading..." />}
    </div>
  );
};
