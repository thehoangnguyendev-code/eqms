import React, { useState, useMemo, createRef, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { ROUTES } from '@/app/routes.constants';
import {
  Download,
  Search,
  MoreVertical,
  Edit,
  FileX,
  Link2,
  Shredder,
} from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import { cn } from "@/components/ui/utils";
import { Select } from "@/components/ui/select/Select";
import { DateRangePicker } from "@/components/ui/datetime-picker/DateRangePicker";
import { ESignatureModal } from "@/components/ui/esign-modal/ESignatureModal";
import { TablePagination } from "@/components/ui/table/TablePagination";
import { formatDateUS, formatDateTimeParts } from "@/utils/format";
import { CreateLinkModal } from "@/features/documents/shared/components";
import { CancelDistributionModal } from "./components/CancelDistributionModal";
import { DestructionTypeSelectionModal } from "./components/DestructionTypeSelectionModal";
import { useToast } from "@/components/ui/toast/Toast";
import type { ControlledCopy, ControlledCopyStatus, TableColumn } from "./types";
import { IconInfoCircle, IconShare3 } from "@tabler/icons-react";
import { Breadcrumb } from "@/components/ui/breadcrumb/Breadcrumb";
import { controlledCopies } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { FullPageLoading } from "@/components/ui/loading/Loading";
import { usePortalDropdown, useNavigateWithLoading, useTableDragScroll } from "@/hooks";

import { MOCK_ALL_CONTROLLED_COPIES } from './mockData';

// Default Columns Configuration
const DEFAULT_COLUMNS: TableColumn[] = [
  { id: "documentNumber", label: "Document Number", visible: true, order: 1, locked: true },
  { id: "created", label: "Created", visible: true, order: 2 },
  { id: "openedBy", label: "Opened by", visible: true, order: 3 },
  { id: "name", label: "Name", visible: true, order: 4 },
  { id: "status", label: "State", visible: true, order: 5 },
  { id: "validUntil", label: "Valid Until", visible: true, order: 6 },
  { id: "document", label: "Document", visible: true, order: 7 },
  { id: "distributionList", label: "Distribution List", visible: true, order: 8 },
];

// View types
type ViewType = "all" | "ready" | "distributed";

// ==================== HELPER FUNCTIONS ====================

const getStatusConfig = (status: ControlledCopyStatus) => {
  const configs = {
    "Ready for Distribution": {
      color: "bg-blue-50 text-blue-700 border-blue-200",
    },
    "Distributed": {
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    "Obsolete": {
      color: "bg-amber-50 text-amber-700 border-amber-200",
    },
    "Closed - Cancelled": {
      color: "bg-red-50 text-red-700 border-red-200",
    },
  };
  return configs[status] || configs["Ready for Distribution"];
};

// ==================== DROPDOWN MENU COMPONENT ====================

const DropdownMenu: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  position: { top: number; left: number; showAbove?: boolean };
  onViewDetails: () => void;
  onEdit: () => void;
  onCancel?: () => void;
  onDistribute?: () => void;
  onReportLostDamaged?: () => void;
  onCreateLink?: () => void;
  viewType: ViewType;
}> = ({
  isOpen,
  onClose,
  position,
  onViewDetails,
  onEdit,
  onCancel,
  onDistribute,
  onReportLostDamaged,
  onCreateLink,
  viewType,
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
          className="fixed z-50 min-w-[160px] w-[200px] max-w-[90vw] max-h-[300px] overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-200"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            transform: position.showAbove ? "translateY(-100%)" : "none",
          }}
        >
          <div className="py-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails();
                onClose();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors"
            >
              <IconInfoCircle className="h-4 w-4 flex-shrink-0" />
              <span className="font-medium">View Details</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
                onClose();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors"
            >
              <Edit className="h-4 w-4 flex-shrink-0" />
              <span className="font-medium">Edit Controlled Copy</span>
            </button>
            {onDistribute && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDistribute();
                  onClose();
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors"
              >
                <IconShare3 className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium">Distribute</span>
              </button>
            )}
            {onCreateLink && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateLink();
                  onClose();
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors"
              >
                <Link2 className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium">Create Shareable Link</span>
              </button>
            )}
            {viewType === "ready" && onCancel && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel();
                  onClose();
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors"
              >
                <FileX className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium">Cancel Distribution</span>
              </button>
            )}
            {(viewType === "distributed" || (viewType === "all" && onReportLostDamaged)) && onReportLostDamaged && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReportLostDamaged();
                  onClose();
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors"
              >
                <Shredder className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium">Report Lost/Damaged</span>
              </button>
            )}
            {viewType === "all" && onCancel && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel();
                  onClose();
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors"
              >
                <FileX className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium">Cancel Distribution</span>
              </button>
            )}
          </div>
        </div>
      </>,
      window.document.body
    );
  };

// ==================== MAIN COMPONENT ====================

interface ControlledCopiesViewProps {
  viewType?: ViewType;
}

export const ControlledCopiesView: React.FC<ControlledCopiesViewProps> = ({ viewType: propViewType = "all" }) => {
  const { navigateTo, isNavigating } = useNavigateWithLoading();
  const { showToast } = useToast();

  // Use prop viewType instead of URL params
  const viewType = propViewType;

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ControlledCopyStatus | "All">("All");
  const [createdFromDate, setCreatedFromDate] = useState("");
  const [createdToDate, setCreatedToDate] = useState("");
  const [validFromDate, setValidFromDate] = useState("");
  const [validToDate, setValidToDate] = useState("");

  // Modal states
  const [isCreateLinkModalOpen, setIsCreateLinkModalOpen] = useState(false);
  const [selectedCopyForLink, setSelectedCopyForLink] = useState<ControlledCopy | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedCopyForCancel, setSelectedCopyForCancel] = useState<ControlledCopy | null>(null);
  const [cancelFormData, setCancelFormData] = useState({
    cancellationReason: "",
    returnToStage: "Draft" as "Draft" | "Cancelled"
  });
  const [cancelFormErrors, setCancelFormErrors] = useState<{ cancellationReason?: string }>({});
  const [isESignModalOpen, setisESignModalOpen] = useState(false);
  const [isDistributeisESignModalOpen, setisDistributeisESignModalOpen] = useState(false);
  const [selectedCopyForDistribute, setSelectedCopyForDistribute] = useState<ControlledCopy | null>(null);

  // Report Lost/Damaged modal
  const [isReportLostDamagedModalOpen, setIsReportLostDamagedModalOpen] = useState(false);
  const [selectedCopyForReportLostDamaged, setSelectedCopyForReportLostDamaged] = useState<ControlledCopy | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { openId, position, getRef, toggle, close } = usePortalDropdown();
  const { scrollerRef, isDragging, dragEvents } = useTableDragScroll();

  // Get filtered data based on view type
  const baseData = useMemo(() => {
    switch (viewType) {
      case "ready":
        return MOCK_ALL_CONTROLLED_COPIES.filter((copy) => copy.status === "Ready for Distribution");
      case "distributed":
        return MOCK_ALL_CONTROLLED_COPIES.filter((copy) => copy.status === "Distributed");
      case "all":
      default:
        return MOCK_ALL_CONTROLLED_COPIES;
    }
  }, [viewType]);

  // Apply filters
  const filteredData = useMemo(() => {
    return baseData.filter((copy) => {
      const matchesSearch =
        searchQuery === "" ||
        copy.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        copy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        copy.document.toLowerCase().includes(searchQuery.toLowerCase()) ||
        copy.openedBy.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = viewType !== "all" || statusFilter === "All" || copy.status === statusFilter;

      // Created Date filtering
      let matchesCreatedFrom = true;
      let matchesCreatedTo = true;
      if (createdFromDate) {
        const parts = createdFromDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (parts) {
          const from = new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]), 0, 0, 0);
          matchesCreatedFrom = new Date(copy.createdDate) >= from;
        }
      }
      if (createdToDate) {
        const parts = createdToDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (parts) {
          const to = new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]), 23, 59, 59);
          matchesCreatedTo = new Date(copy.createdDate) <= to;
        }
      }

      // Valid Until Date filtering
      let matchesValidFrom = true;
      let matchesValidTo = true;
      if (validFromDate) {
        const parts = validFromDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (parts) {
          const from = new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]), 0, 0, 0);
          matchesValidFrom = new Date(copy.validUntil) >= from;
        }
      }
      if (validToDate) {
        const parts = validToDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (parts) {
          const to = new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]), 23, 59, 59);
          matchesValidTo = new Date(copy.validUntil) <= to;
        }
      }

      return matchesSearch && matchesStatus && matchesCreatedFrom && matchesCreatedTo && matchesValidFrom && matchesValidTo;
    });
  }, [baseData, searchQuery, statusFilter, createdFromDate, createdToDate, validFromDate, validToDate, viewType]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  // Event handlers
  const handleViewDetails = (copy: ControlledCopy) => {
    navigateTo(ROUTES.DOCUMENTS.CONTROLLED_COPIES.DETAIL(copy.id));
  };

  const handleEdit = (copy: ControlledCopy) => {
    console.log("Edit copy:", copy);
    // TODO: Navigate to edit page
  };

  const handleCreateLink = (copy: ControlledCopy) => {
    setSelectedCopyForLink(copy);
    setIsCreateLinkModalOpen(true);
    close();
  };

  const handleCancel = (copy: ControlledCopy) => {
    setSelectedCopyForCancel(copy);
    setIsCancelModalOpen(true);
    setCancelFormData({ cancellationReason: "", returnToStage: "Draft" });
    setCancelFormErrors({});
    close();
  };

  const handleCancelFormSubmit = () => {
    // Validate form
    const errors: { cancellationReason?: string } = {};
    if (!cancelFormData.cancellationReason.trim()) {
      errors.cancellationReason = "Cancellation reason is required";
    } else if (cancelFormData.cancellationReason.trim().length < 10) {
      errors.cancellationReason = "Cancellation reason must be at least 10 characters";
    }

    if (Object.keys(errors).length > 0) {
      setCancelFormErrors(errors);
      return;
    }

    // Open ESignature modal
    setIsCancelModalOpen(false);
    setisESignModalOpen(true);
  };

  const handleESignConfirm = (reason: string) => {
    // Process cancellation
    setisESignModalOpen(false);
    setSelectedCopyForCancel(null);
    setCancelFormData({ cancellationReason: "", returnToStage: "Draft" });

    showToast({
      type: "success",
      message: `Controlled copy ${selectedCopyForCancel?.documentNumber} has been cancelled and returned to ${cancelFormData.returnToStage} status.`
    });
  };

  const handleCancelModalClose = () => {
    setIsCancelModalOpen(false);
    setSelectedCopyForCancel(null);
    setCancelFormData({ cancellationReason: "", returnToStage: "Draft" });
    setCancelFormErrors({});
  };

  const handleReportLostDamaged = (copy: ControlledCopy) => {
    setSelectedCopyForReportLostDamaged(copy);
    setIsReportLostDamagedModalOpen(true);
    close();
  };

  const handleReportLostDamagedConfirm = (type: "Lost" | "Damaged") => {
    setIsReportLostDamagedModalOpen(false);
    if (selectedCopyForReportLostDamaged) {
      navigateTo(`${ROUTES.DOCUMENTS.CONTROLLED_COPIES.DESTROY(selectedCopyForReportLostDamaged.id)}?type=${type}`);
    }
  };

  const handleDistribute = (copy: ControlledCopy) => {
    setSelectedCopyForDistribute(copy);
    setisDistributeisESignModalOpen(true);
    close();
  };

  const handleDistributeESignConfirm = (reason: string) => {
    setisDistributeisESignModalOpen(false);

    showToast({
      type: "success",
      title: "Controlled Copy Distributed",
      message: "The controlled copy has been successfully distributed.",
      duration: 3500,
    });

    // TODO: Call API to distribute controlled copy
    // Update status to "Distributed"
    // Add audit trail entry
    // Send notification

    setSelectedCopyForDistribute(null);
  };

  const handleViewRow = (copy: ControlledCopy) => {
    handleViewDetails(copy);
  };

  const statusOptions = [
    { label: "All States", value: "All" },
    { label: "Ready for Distribution", value: "Ready for Distribution" },
    { label: "Distributed", value: "Distributed" },
    { label: "Obsolete", value: "Obsolete" },
    { label: "Closed - Cancelled", value: "Closed - Cancelled" },
  ];

  // Get page title and breadcrumb based on view type
  const getPageTitle = () => {
    switch (viewType) {
      case "ready":
        return "Ready for Distribution";
      case "distributed":
        return "Distributed Copies";
      case "all":
      default:
        return "All Controlled Copies";
    }
  };

  return (
    <div className="space-y-6 w-full flex-1 flex flex-col">
      {isNavigating && <FullPageLoading text="Loading..." />}
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-row flex-wrap items-end justify-between gap-3 md:gap-4">
          <div className="min-w-[200px] flex-1">
            <h1 className="text-lg md:text-xl lg:text-2xl font-bold tracking-tight text-slate-900">{getPageTitle()}</h1>
            <Breadcrumb items={controlledCopies(navigateTo, viewType)} />
          </div>
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <Button
              onClick={() => {
                console.log("Export triggered");
                // TODO: Implement export functionality
              }}
              variant="outline"
              size="sm"
              className="whitespace-nowrap gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Unified Content Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm w-full overflow-hidden flex flex-col">
        {/* Filter Section */}
        <div className="p-4 md:p-5 border-b border-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">Search</label>
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Document #, Name, Document ID..."
                  className="w-full h-9 pl-10 pr-4 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:text-slate-400 bg-white"
                />
              </div>
            </div>
            <div>
              <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">State</label>
              {viewType === "all" ? (
                <Select
                  value={statusFilter}
                  onChange={(value) => {
                    setStatusFilter(value as ControlledCopyStatus | "All");
                    setCurrentPage(1);
                  }}
                  options={statusOptions}
                  placeholder="All States"
                />
              ) : (
                <Select
                  value={viewType === "ready" ? "Ready for Distribution" : "Distributed"}
                  onChange={() => { }}
                  options={[
                    {
                      label: viewType === "ready" ? "Ready for Distribution" : "Distributed",
                      value: viewType === "ready" ? "Ready for Distribution" : "Distributed",
                    },
                  ]}
                  placeholder={viewType === "ready" ? "Ready for Distribution" : "Distributed"}
                  disabled
                />
              )}
            </div>
            <div>
              <DateRangePicker
                label="Created Date Range"
                startDate={createdFromDate}
                endDate={createdToDate}
                onStartDateChange={(d) => { setCreatedFromDate(d); setCurrentPage(1); }}
                onEndDateChange={(d) => { setCreatedToDate(d); setCurrentPage(1); }}
                placeholder="Select date range"
              />
            </div>
            <div>
              <DateRangePicker
                label="Valid Until Date Range"
                startDate={validFromDate}
                endDate={validToDate}
                onStartDateChange={(d) => { setValidFromDate(d); setCurrentPage(1); }}
                onEndDateChange={(d) => { setValidToDate(d); setCurrentPage(1); }}
                placeholder="Select date range"
              />
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="px-4 md:px-5 pb-4 md:pb-5 flex-1 flex flex-col relative">
          <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col flex-1 bg-slate-50/10 transition-all duration-300">
            <div 
              ref={scrollerRef}
              className={cn(
                "flex-1 overflow-auto scrollbar-always-visible scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 hover:scrollbar-thumb-slate-400 scrollbar-thumb-rounded-full scrollbar-track-rounded-full pb-1.5 transition-colors",
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
                    {DEFAULT_COLUMNS.filter((c) => c.visible).map((col) => (
                      <th
                        key={col.id}
                        className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                      >
                        {col.label}
                      </th>
                    ))}
                    <th className="sticky right-0 bg-slate-50 py-2.5 px-2 sm:py-3.5 sm:px-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider z-[1] whitespace-nowrap before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-200 shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.05)]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={DEFAULT_COLUMNS.filter((c) => c.visible).length + 2}
                        className="py-12 text-center"
                      >
                        <div className="flex flex-col items-center justify-center gap-2.5">
                          <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center">
                            <Search className="h-6 w-6 text-slate-300" />
                          </div>
                          <p className="text-sm font-medium text-slate-500">No controlled copies found</p>
                          <p className="text-xs text-slate-400">Try adjusting your filters</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((copy, index) => {
                      const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;
                      const statusConfig = getStatusConfig(copy.status);

                      return (
                        <tr
                          key={copy.id}
                          className="hover:bg-slate-50/80 transition-colors group"
                        >
                          <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-slate-600 whitespace-nowrap">
                            {rowNumber}
                          </td>
                          <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewRow(copy);
                              }}
                              className="font-medium text-emerald-600 hover:underline transition-colors"
                            >
                              {copy.documentNumber}
                            </button>
                          </td>
                          <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-slate-600 whitespace-nowrap">
                            {formatDateTimeParts(copy.createdDate, copy.createdTime)}
                          </td>
                          <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-slate-600 whitespace-nowrap">
                            {copy.openedBy}
                          </td>
                          <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-slate-900 whitespace-nowrap">
                            {copy.name}
                          </td>
                          <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border ${statusConfig.color}`}
                            >
                              {copy.status}
                            </span>
                          </td>
                          <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-slate-600 whitespace-nowrap">
                            {formatDateUS(copy.validUntil)}
                          </td>
                          <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                            <span className="font-medium text-slate-900">{copy.document}</span>
                          </td>
                          <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-slate-600 whitespace-nowrap">
                            {copy.distributionList}
                          </td>
                          <td
                            onClick={(e) => e.stopPropagation()}
                            className="sticky right-0 bg-white py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-center z-30 whitespace-nowrap before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-200 shadow-[-8px_0_16px_-2px_rgba(0,0,0,0.12)] group-hover:bg-slate-50"
                          >
                            <button
                              ref={getRef(copy.id)}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggle(copy.id, e);
                              }}
                              className="inline-flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-lg hover:bg-slate-100 transition-colors"
                              aria-label="More actions"
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

            {filteredData.length > 0 && (
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredData.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            )}
          </div>
        </div>
      </div>

      {/* Dropdown Menu */}
      {openId && (() => {
        const selectedCopy = paginatedData.find((c) => c.id === openId);
        return (
          <DropdownMenu
            isOpen={openId !== null}
            onClose={close}
            position={position}
            viewType={viewType}
            onViewDetails={() => {
              if (selectedCopy) handleViewDetails(selectedCopy);
            }}
            onEdit={() => {
              if (selectedCopy) handleEdit(selectedCopy);
            }}
            onCreateLink={() => {
              if (selectedCopy) handleCreateLink(selectedCopy);
            }}
            onDistribute={
              selectedCopy && selectedCopy.status === "Ready for Distribution"
                ? () => handleDistribute(selectedCopy)
                : undefined
            }
            onCancel={
              viewType === "ready" || viewType === "all"
                ? () => {
                  if (selectedCopy) handleCancel(selectedCopy);
                }
                : undefined
            }
            onReportLostDamaged={
              viewType === "distributed" || viewType === "all"
                ? () => {
                  if (selectedCopy) handleReportLostDamaged(selectedCopy);
                }
                : undefined
            }
          />
        );
      })()}

      {/* Create Shareable Link Modal */}
      {selectedCopyForLink && (
        <CreateLinkModal
          isOpen={isCreateLinkModalOpen}
          onClose={() => {
            setIsCreateLinkModalOpen(false);
            setSelectedCopyForLink(null);
          }}
          documentId={selectedCopyForLink.documentNumber}
          documentTitle={selectedCopyForLink.name}
        />
      )}

      {/* Cancel Distribution Modal */}
      {selectedCopyForCancel && (
        <CancelDistributionModal
          isOpen={isCancelModalOpen}
          onClose={handleCancelModalClose}
          onConfirm={handleCancelFormSubmit}
          formData={cancelFormData}
          onFormDataChange={setCancelFormData}
          errors={cancelFormErrors}
          onErrorChange={setCancelFormErrors}
        />
      )}

      {/* ESignature Modal - Cancel Distribution */}
      <ESignatureModal
        isOpen={isESignModalOpen}
        onClose={() => setisESignModalOpen(false)}
        onConfirm={handleESignConfirm}
        actionTitle="Cancel Distribution"
      />

      {/* ESignature Modal - Distribute */}
      <ESignatureModal
        isOpen={isDistributeisESignModalOpen}
        onClose={() => {
          setisDistributeisESignModalOpen(false);
          setSelectedCopyForDistribute(null);
        }}
        onConfirm={handleDistributeESignConfirm}
        actionTitle="Confirm Distribution of Controlled Copy"
      />

      {/* Destruction Type Selection Modal */}
      <DestructionTypeSelectionModal
        isOpen={isReportLostDamagedModalOpen}
        onClose={() => {
          setIsReportLostDamagedModalOpen(false);
          setSelectedCopyForReportLostDamaged(null);
        }}
        onConfirm={handleReportLostDamagedConfirm}
      />
    </div>
  );
};





