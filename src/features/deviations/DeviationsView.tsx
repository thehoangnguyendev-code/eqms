import React, { useState, useMemo } from "react";
import {
  Search,
  AlertTriangle,
  Calendar,
  Users,
  TrendingUp,
  Plus,
  Eye,
  Edit,
  MoreVertical,
  Package,
  Clock,
  Download,
} from "lucide-react";
import { IconPlus } from "@tabler/icons-react";
import { PageHeader } from "@/components/ui/page/PageHeader";
import { deviations } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import { DateTimePicker } from "@/components/ui/datetime-picker/DateTimePicker";
import { StatusBadge } from "@/components/ui";
import { TablePagination } from "@/components/ui/table/TablePagination";
import { TableEmptyState } from "@/components/ui/table/TableEmptyState";
import { FullPageLoading } from "@/components/ui/loading/Loading";
import { usePortalDropdown, useNavigateWithLoading, useTableDragScroll, PortalDropdownPosition } from "@/hooks";
import { createPortal } from "react-dom";
import { cn } from "@/components/ui/utils";
import {
  Deviation,
  DeviationFilters,
  DeviationStatus,
  DeviationCategory,
  DeviationSeverity,
} from "./types";
import { MOCK_DEVIATIONS } from "./mockData";

export const DeviationsView: React.FC = () => {
  const { navigateTo, isNavigating } = useNavigateWithLoading();
  const { scrollerRef, isDragging, dragEvents } = useTableDragScroll();
  const { openId, position, getRef, toggle, close } = usePortalDropdown();
  const [filters, setFilters] = useState<DeviationFilters>({
    searchQuery: "",
    categoryFilter: "All",
    severityFilter: "All",
    statusFilter: "All",
    dateFrom: "",
    dateTo: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const categoryOptions = [
    { label: "All Categories", value: "All" },
    { label: "Product Quality", value: "Product Quality" },
    { label: "Process", value: "Process" },
    { label: "Equipment", value: "Equipment" },
    { label: "Material", value: "Material" },
    { label: "Documentation", value: "Documentation" },
    { label: "Personnel", value: "Personnel" },
    { label: "Environmental", value: "Environmental" },
  ];

  const severityOptions = [
    { label: "All Severity", value: "All" },
    { label: "Critical", value: "Critical" },
    { label: "Major", value: "Major" },
    { label: "Minor", value: "Minor" },
  ];

  const statusOptions = [
    { label: "All Status", value: "All" },
    { label: "Open", value: "Open" },
    { label: "Under Investigation", value: "Under Investigation" },
    { label: "Pending Review", value: "Pending Review" },
    { label: "Pending Approval", value: "Pending Approval" },
    { label: "Closed", value: "Closed" },
    { label: "Cancelled", value: "Cancelled" },
  ];

  const filteredData = useMemo(() => {
    return MOCK_DEVIATIONS.filter((dev) => {
      const matchesSearch =
        dev.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        dev.deviationId
          .toLowerCase()
          .includes(filters.searchQuery.toLowerCase()) ||
        dev.description
          .toLowerCase()
          .includes(filters.searchQuery.toLowerCase());

      const matchesCategory =
        filters.categoryFilter === "All" ||
        dev.category === filters.categoryFilter;
      const matchesSeverity =
        filters.severityFilter === "All" ||
        dev.severity === filters.severityFilter;
      const matchesStatus =
        filters.statusFilter === "All" || dev.status === filters.statusFilter;

      const matchesDateFrom =
        !filters.dateFrom || dev.reportedDate >= filters.dateFrom;
      const matchesDateTo =
        !filters.dateTo || dev.reportedDate <= filters.dateTo;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesSeverity &&
        matchesStatus &&
        matchesDateFrom &&
        matchesDateTo
      );
    });
  }, [MOCK_DEVIATIONS, filters]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const getStatusColor = (
    status: DeviationStatus,
  ):
    | "draft"
    | "pendingReview"
    | "pendingApproval"
    | "approved"
    | "effective"
    | "archived" => {
    switch (status) {
      case "Open":
        return "draft";
      case "Under Investigation":
        return "pendingReview";
      case "Pending Review":
        return "pendingReview";
      case "Pending Approval":
        return "pendingApproval";
      case "Closed":
        return "effective";
      default:
        return "archived";
    }
  };

  const getSeverityColor = (severity: DeviationSeverity) => {
    switch (severity) {
      case "Critical":
        return "bg-red-50 text-red-700 border-red-200";
      case "Major":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "Minor":
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  const handleView = (id: string) => {
    // navigateTo(ROUTES.DEVIATIONS.DETAIL(id));
    console.log("View Deviation:", id);
  };

  const handleEdit = (id: string) => {
    // navigateTo(ROUTES.DEVIATIONS.EDIT(id));
    console.log("Edit Deviation:", id);
  };

  return (
    <div className="space-y-6 w-full flex-1 flex flex-col">
      {isNavigating && <FullPageLoading text="Loading..." />}
      {/* Header: Title + Breadcrumb + Action Button */}
      <PageHeader
        title="Deviations & Non-Conformances"
        breadcrumbItems={deviations()}
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
              onClick={() => console.log("New Deviation")}
              size="sm"
              className="whitespace-nowrap gap-2"
            >
              <IconPlus className="h-4 w-4" />
              New Deviation
            </Button>
          </>
        }
      />

      {/* Filters */}
      <div className="bg-white p-4 lg:p-5 rounded-xl border border-slate-200 shadow-sm">
        {/* Row 1: Search + Category + Severity */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-9 gap-4 items-end">
          <div className="md:col-span-2 xl:col-span-3">
            <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title, ID, or description..."
                value={filters.searchQuery}
                onChange={(e) =>
                  setFilters({ ...filters, searchQuery: e.target.value })
                }
                className="w-full h-9 pl-10 pr-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm placeholder:text-slate-400 transition-colors"
              />
            </div>
          </div>

          <div className="xl:col-span-3">
            <Select
              label="Category"
              value={filters.categoryFilter}
              onChange={(value) =>
                setFilters({
                  ...filters,
                  categoryFilter: value as DeviationCategory | "All",
                })
              }
              options={categoryOptions}
            />
          </div>

          <div className="xl:col-span-3">
            <Select
              label="Severity"
              value={filters.severityFilter}
              onChange={(value) =>
                setFilters({
                  ...filters,
                  severityFilter: value as DeviationSeverity | "All",
                })
              }
              options={severityOptions}
            />
          </div>
        </div>

        {/* Row 2: Status + Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4 items-end mt-4">
          <div className="xl:col-span-2">
            <Select
              label="Status"
              value={filters.statusFilter}
              onChange={(value) =>
                setFilters({
                  ...filters,
                  statusFilter: value as DeviationStatus | "All",
                })
              }
              options={statusOptions}
            />
          </div>

          <div className="xl:col-span-2">
            <DateTimePicker
              label="From Date"
              value={filters.dateFrom}
              onChange={(value) => setFilters({ ...filters, dateFrom: value })}
            />
          </div>

          <div className="xl:col-span-2">
            <DateTimePicker
              label="To Date"
              value={filters.dateTo}
              onChange={(value) => setFilters({ ...filters, dateTo: value })}
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-600 font-medium">Total</p>
              <p className="text-2xl font-bold text-slate-900">
                {MOCK_DEVIATIONS.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-600 font-medium">Open</p>
              <p className="text-2xl font-bold text-slate-900">
                {
                  MOCK_DEVIATIONS.filter(
                    (d) =>
                      d.status === "Open" || d.status === "Under Investigation",
                  ).length
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-slate-600 font-medium">Critical</p>
              <p className="text-2xl font-bold text-slate-900">
                {
                  MOCK_DEVIATIONS.filter((d) => d.severity === "Critical")
                    .length
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-cyan-600" />
            </div>
            <div>
              <p className="text-xs text-slate-600 font-medium">Closed</p>
              <p className="text-2xl font-bold text-slate-900">
                {MOCK_DEVIATIONS.filter((d) => d.status === "Closed").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-xl bg-white shadow-sm overflow-hidden flex flex-col">
        {paginatedData.length > 0 ? (
          <>
            <div 
              ref={scrollerRef}
              className={cn(
                "overflow-x-auto transition-colors",
                isDragging ? "cursor-grabbing select-none" : "cursor-grab"
              )}
              {...dragEvents}
            >
              <table className="w-full">
                <thead className="bg-slate-50/80 border-b-2 border-slate-200 sticky top-0 z-30">
                  <tr>
                    <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap w-10 sm:w-16">
                      No.
                    </th>
                    <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      ID
                    </th>
                    <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      Title
                    </th>
                    <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">
                      Category
                    </th>
                    <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      Severity
                    </th>
                    <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      Status
                    </th>
                    <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">
                      Assigned To
                    </th>
                    <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">
                      Deadline
                    </th>
                    <th className="sticky right-0 bg-slate-50 py-2.5 px-2 sm:py-3.5 sm:px-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider z-[1] whitespace-nowrap before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-200 shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.05)]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {paginatedData.map((dev, index) => (
                    <tr
                      key={dev.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-900">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                        <span className="font-medium text-emerald-600">
                          {dev.deviationId}
                        </span>
                      </td>
                      <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-900 font-medium max-w-xs truncate">
                        {dev.title}
                      </td>
                      <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-700 hidden md:table-cell">
                        {dev.category}
                      </td>
                      <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-medium border",
                            getSeverityColor(dev.severity),
                          )}
                        >
                          {dev.severity}
                        </span>
                      </td>
                      <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                        <StatusBadge status={getStatusColor(dev.status)} />
                      </td>
                      <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-900 hidden lg:table-cell">
                        {dev.assignedTo}
                      </td>
                      <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-900 hidden md:table-cell">
                        {new Date(dev.investigationDeadline).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          },
                        )}
                      </td>
                      <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-center sticky right-0 bg-white z-30 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-200 shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.05)] group-hover:bg-slate-50">
                        <button
                          ref={getRef(dev.id)}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggle(dev.id, e);
                          }}
                          className="inline-flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-lg hover:bg-slate-200 transition-colors"
                          aria-label="More actions"
                        >
                          <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-600" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredData.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </>
        ) : (
          <TableEmptyState
            title="No Deviations Found"
            description="We couldn't find any deviation records matching your filters. Try adjusting your search criteria or clear filters."
            actionLabel="Clear Filters"
            onAction={() => {
              setFilters({
                searchQuery: "",
                categoryFilter: "All",
                severityFilter: "All",
                statusFilter: "All",
                dateFrom: "",
                dateTo: "",
              });
              setCurrentPage(1);
            }}
          />
        )}
      </div>

      {/* Action Menu */}
      <DeviationActionMenu
        isOpen={openId !== null}
        onClose={close}
        position={position}
        onView={() => {
          if (openId) handleView(openId);
        }}
        onEdit={() => {
          if (openId) handleEdit(openId);
        }}
      />
    </div>
  );
};

interface DeviationActionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  position: PortalDropdownPosition;
  onView: () => void;
  onEdit: () => void;
}

const DeviationActionMenu: React.FC<DeviationActionMenuProps> = ({
  isOpen,
  onClose,
  position,
  onView,
  onEdit,
}) => {
  if (!isOpen) return null;

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
        className="absolute z-50 min-w-[160px] rounded-lg border border-slate-200 bg-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-200"
        style={position.style}
      >
        <div className="py-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView();
              onClose();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors"
          >
            <Eye className="h-4 w-4 flex-shrink-0" />
            <span>View Detail</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
              onClose();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors"
          >
            <Edit className="h-4 w-4 flex-shrink-0" />
            <span>Edit Deviation</span>
          </button>
        </div>
      </div>
    </>,
    document.body
  );
};






