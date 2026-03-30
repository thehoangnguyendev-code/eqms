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
  SlidersHorizontal,
  ArrowDownAZ,
  ArrowDownZA,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { IconInfoCircle, IconEyeCheck } from "@tabler/icons-react";
import { PageHeader } from "@/components/ui/page/PageHeader";
import { coursePendingReview } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { Button } from "@/components/ui/button/Button";
import { FullPageLoading, SectionLoading } from "@/components/ui/loading/Loading";
import { Select } from "@/components/ui/select/Select";
import { DateTimePicker } from "@/components/ui/datetime-picker/DateTimePicker";
import { TablePagination } from "@/components/ui/table/TablePagination";
import { TableEmptyState } from "@/components/ui/table/TableEmptyState";
import { cn } from "@/components/ui/utils";
import { getStatusColorClass, getTrainingMethodConfig } from "@/utils/status";
import { formatDateUS } from "@/utils/format";
import { CourseApproval, CourseWorkflowStatus, TrainingMethod, TrainingType } from "../../../types";
import { MOCK_PENDING_REVIEWS as MOCK_APPROVALS } from "../mockData";
import { usePortalDropdown, useNavigateWithLoading, useTableDragScroll } from "@/hooks";

// --- Constants ---
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

// --- Component ---
export const PendingReviewView: React.FC = () => {
  const { navigateTo, isNavigating } = useNavigateWithLoading();


  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [methodFilter, setMethodFilter] = useState<string>("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isTableLoading, setIsTableLoading] = useState(false);

  // Filtered data
  const filteredData = useMemo(() => {
    return MOCK_APPROVALS.filter((item) => {
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

  // Handle loading state on filter changes
  React.useEffect(() => {
    setIsTableLoading(true);
    const timer = setTimeout(() => setIsTableLoading(false), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, typeFilter, methodFilter, dateFrom, dateTo]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const nameA = a.courseTitle.toLowerCase();
      const nameB = b.courseTitle.toLowerCase();
      if (sortOrder === "asc") return nameA.localeCompare(nameB);
      return nameB.localeCompare(nameA);
    });
  }, [filteredData, sortOrder]);

  // Pagination using sortedData
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSortedData = useMemo(() => {
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, startIndex, itemsPerPage]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const { openId: openDropdownId, position: dropdownPosition, getRef, toggle: handleDropdownToggle, close: closeDropdown } = usePortalDropdown();
  const { scrollerRef, isDragging, dragEvents } = useTableDragScroll();


  const handleViewDetail = (id: string) => {
    navigateTo(ROUTES.TRAINING.APPROVAL_DETAIL(id));
    closeDropdown();
  };

  const handleReviewCourse = (id: string) => {
    navigateTo(ROUTES.TRAINING.APPROVAL_DETAIL(id));
    closeDropdown();
  };

  return (
    <div className="space-y-6 w-full flex-1 flex flex-col">
      {/* Header */}
      <PageHeader
        title="Pending Review"
        breadcrumbItems={coursePendingReview(navigateTo)}
        actions={
          <>
            <Button
              onClick={() => console.log("Export pending review")}
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
          {/* Search Row + Primary Actions */}
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="w-full flex-1 group">
              <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block transition-colors group-focus-within:text-emerald-600">
                Search
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors">
                  <Search className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
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

            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant={isFilterVisible ? "default" : "outline"}
                onClick={() => setIsFilterVisible(!isFilterVisible)}
                className="h-9 px-4 gap-2 whitespace-nowrap rounded-lg"
                size="sm"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>

              <Button
                variant="outline"
                onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                className="h-9 px-4 gap-2 whitespace-nowrap border-slate-200 rounded-lg"
                size="sm"
              >
                {sortOrder === "asc" ? (
                  <ArrowDownAZ className="h-4 w-4 text-emerald-600" />
                ) : (
                  <ArrowDownZA className="h-4 w-4 text-emerald-600" />
                )}
              </Button>
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
                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    value="Pending Review"
                    onChange={() => { }}
                    options={[{ label: "Pending Review", value: "Pending Review" }]}
                    disabled
                  />

                  {/* Date From */}
                  <DateTimePicker
                    label="From Date"
                    value={dateFrom}
                    onChange={(val) => {
                      setDateFrom(val);
                      setCurrentPage(1);
                    }}
                    placeholder="Select start date"
                  />

                  {/* Date To */}
                  <DateTimePicker
                    label="To Date"
                    value={dateTo}
                    onChange={(val) => {
                      setDateTo(val);
                      setCurrentPage(1);
                    }}
                    placeholder="Select end date"
                  />

                  <div className="flex items-end pb-0.5">
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
            "border border-slate-200 rounded-xl overflow-hidden flex flex-col flex-1 bg-slate-50/10 transition-all duration-300",
            isTableLoading && "blur-[2px] opacity-80"
          )}>
            <div 
              ref={scrollerRef}
              className={cn(
                "flex-1 overflow-auto scrollbar-always-visible scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 hover:scrollbar-thumb-slate-400 scrollbar-thumb-rounded-full scrollbar-track-rounded-full pb-1.5 transition-colors",
                isDragging ? "cursor-grabbing select-none" : "cursor-grab"
              )}
              {...dragEvents}
            >
              <table className="w-full">
                <thead className="bg-slate-50 border-b-2 border-slate-200 sticky top-0 z-30">
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
                      Method
                    </th>
                    <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      Status
                    </th>
                    <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      Instructor
                    </th>
                    <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      Scheduled Date
                    </th>
                    <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      Enrolled
                    </th>
                    <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap text-center sticky right-0 bg-slate-50 z-[1] before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-200 shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.05)]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {paginatedSortedData.length === 0 ? (
                    <tr>
                      <td colSpan={10}>
                        <TableEmptyState
                          title="No approvals found"
                          description="No course approvals match your current filters."
                        />
                      </td>
                    </tr>
                  ) : (
                    paginatedSortedData.map((item, index) => {
                      const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;
                      const methodCfg = getTrainingMethodConfig(item.trainingMethod);

                      return (
                        <tr
                          key={item.id}
                          onClick={() => handleViewDetail(item.id)}
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                        >
                          <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-center whitespace-nowrap text-slate-500 font-medium">
                            {startIndex + index + 1}
                          </td>
                          <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                            <span className="font-medium text-emerald-600">{item.trainingId}</span>
                          </td>
                          <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                            <div className="flex items-start gap-1.5 sm:gap-2">
                              <GraduationCap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium text-slate-900">{item.courseTitle}</p>
                                <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">{item.relatedDocument}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                            {item.trainingType && (
                              <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200">
                                {item.trainingType}
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                            <span className={cn(
                              "inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border",
                              methodCfg.className
                            )}>
                              {methodCfg.label}
                            </span>
                          </td>
                          <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                            <span className={cn(
                              "inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border",
                              getStatusColorClass(item.approvalStatus)
                            )}>
                              {item.approvalStatus}
                            </span>
                          </td>
                          <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-700">
                            {item.instructor || "—"}
                          </td>
                          <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-700">
                            {formatDateUS(item.scheduledDate || item.submittedAt)}
                          </td>
                          <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
                              <span className="text-slate-900 font-medium">
                                {item.enrolled ?? 0}/{item.capacity ?? 0}
                              </span>
                            </div>
                          </td>
                          <td
                            onClick={(e) => e.stopPropagation()}
                            className="sticky right-0 bg-white py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-center z-30 whitespace-nowrap before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-200 shadow-[-8px_0_16px_-2px_rgba(0,0,0,0.12)] group-hover:bg-slate-50"
                          >
                            <button
                              ref={getRef(item.id)}
                              onClick={(e) => handleDropdownToggle(item.id, e)}
                              className="inline-flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-lg hover:bg-slate-100 transition-colors"
                              aria-label="Actions"
                            >
                              <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-600" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {sortedData.length > 0 && (
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={sortedData.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
                showItemCount={true}
              />
            )}
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
            className="fixed z-50 min-w-[160px] w-[200px] max-w-[90vw] max-h-[300px] overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-200"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              transform: dropdownPosition.showAbove ? 'translateY(-100%)' : 'none'
            }}
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
                  handleReviewCourse(openDropdownId);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-slate-50 active:bg-slate-100 transition-colors text-slate-500"
              >
                <IconEyeCheck className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium">Review Course</span>
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
