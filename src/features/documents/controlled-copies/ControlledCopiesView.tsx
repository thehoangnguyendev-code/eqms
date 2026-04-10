import React, { useState, useMemo, createRef, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ROUTES } from '@/app/routes.constants';
import {
  Download,
  ChevronUp,
  ChevronDown,
  Search,
  MoreVertical,
  Edit,
  FileX,
  Link2,
  Shredder,
  ArrowDownAZ,
  ArrowDownZA,
  History,
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
import { PageHeader } from "@/components/ui/page/PageHeader";
import { controlledCopies } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { SectionLoading } from "@/components/ui/loading/Loading";
import { usePortalDropdown, useNavigateWithLoading, useTableDragScroll, PortalDropdownPosition } from "@/hooks";

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
  position: PortalDropdownPosition;
  onViewDetails: () => void;
  onEdit: () => void;
  onCancel?: () => void;
  onDistribute?: () => void;
  onReportLostDamaged?: () => void;
  onCreateLink?: () => void;
  onViewAuditTrail: () => void;
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
  onViewAuditTrail,
  viewType,
}) => {

    if (!isOpen) return null;

    return createPortal(
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-40 animate-in fade-in duration-150"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-hidden="true"
        />
        {/* Menu */}
        <div
          className="absolute z-50 min-w-[200px] max-w-[90vw] max-h-[300px] overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-200"
          style={position.style}
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
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewAuditTrail();
                onClose();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors"
            >
              <History className="h-4 w-4 flex-shrink-0" />
              <span className="font-medium">View Audit Trail</span>
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
      </>
      ,
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

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

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
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "documentNumber",
    direction: "asc",
  });

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
    const filtered = baseData.filter((copy) => {
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

    const parseDate = (dStr: string) => {
      if (!dStr) return 0;
      const parts = dStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (parts) {
        return new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1])).getTime();
      }
      return new Date(dStr).getTime();
    };

    // Apply sorting
    return [...filtered].sort((a, b) => {
      const key = sortConfig.key as keyof ControlledCopy;
      let valA: any = a[key] || "";
      let valB: any = b[key] || "";

      if (key === 'createdDate' || key === 'validUntil') {
        valA = parseDate(valA);
        valB = parseDate(valB);
      } else if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [baseData, searchQuery, statusFilter, createdFromDate, createdToDate, validFromDate, validToDate, viewType, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  // Event handlers
  const handleViewDetails = (copy: ControlledCopy) => {
    navigateTo(ROUTES.DOCUMENTS.CONTROLLED_COPIES.DETAIL(copy.id));
  };

  const handleViewAuditTrail = (copy: ControlledCopy) => {
    navigateTo(`${ROUTES.DOCUMENTS.CONTROLLED_COPIES.DETAIL(copy.id)}?tab=audit`);
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

  if (isLoading || isNavigating) return <SectionLoading minHeight="60vh" />;

  return (
    <div className="space-y-6 w-full flex-1 flex flex-col">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <PageHeader
          title={getPageTitle()}
          breadcrumbItems={controlledCopies(navigateTo, viewType)}
          actions={
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
          }
        />
      </div>

      {/* Unified Content Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm w-full overflow-hidden flex flex-col">
        {/* Filter Section */}
        <div className="p-4 md:p-5 border-b border-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors" />
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
          <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col flex-1 bg-white transition-all duration-300">
            <div
              ref={scrollerRef}
              className={cn(
                "flex-1 overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-50 hover:scrollbar-thumb-slate-400",
                isDragging ? "cursor-grabbing select-none" : "cursor-grab"
              )}
              {...dragEvents}
            >
              <table className="w-full min-w-max border-separate border-spacing-0 text-left">
                <thead>
                  <tr>
                    <th className="sticky top-0 z-20 bg-slate-50 py-2.5 px-2 md:py-3.5 md:px-4 text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 whitespace-nowrap w-16">
                      No.
                    </th>
                    {DEFAULT_COLUMNS.filter((c) => c.visible).map((col) => {
                      const isSorted = sortConfig.key === col.id;
                      return (
                        <th
                          key={col.id}
                          onClick={() => handleSort(col.id)}
                          className="sticky top-0 z-20 bg-slate-50 py-2.5 px-2 md:py-3.5 md:px-4 text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 whitespace-nowrap cursor-pointer hover:bg-slate-100 transition-colors group"
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
                    <th className="sticky top-0 right-0 z-30 bg-slate-50 py-2.5 px-2 md:py-3.5 md:px-4 text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center whitespace-nowrap border-b-2 border-slate-200 before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-slate-200 shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.05)]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={DEFAULT_COLUMNS.filter((c) => c.visible).length + 2}
                        className="py-12 text-center border-b border-slate-200"
                      >
                        <div className="flex flex-col items-center justify-center gap-2.5 text-slate-400">
                          <Search className="h-8 w-8 opacity-20" />
                          <p className="text-sm font-medium">No controlled copies found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((copy, index) => {
                      const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;
                      const statusConfig = getStatusConfig(copy.status);
                      const tdClass = "py-2.5 px-2 md:py-3 md:px-4 text-xs md:text-sm text-slate-500 font-medium border-b border-slate-200 whitespace-nowrap";

                      return (
                        <tr
                          key={copy.id}
                          className="hover:bg-slate-50/80 transition-colors group"
                        >
                          <td className={tdClass}>
                            {rowNumber}
                          </td>
                          <td
                            className={cn(tdClass, "cursor-pointer font-medium text-emerald-600 hover:underline transition-colors")}
                            onClick={() => handleViewDetails(copy)}
                          >
                            {copy.documentNumber}
                          </td>
                          <td className={tdClass}>
                            {formatDateTimeParts(copy.createdDate, copy.createdTime)}
                          </td>
                          <td className={tdClass}>
                            {copy.openedBy}
                          </td>
                          <td className={cn(tdClass, "font-medium text-slate-900")}>
                            {copy.name}
                          </td>
                          <td className={tdClass}>
                            <span
                              className={cn(
                                "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium border",
                                statusConfig.color
                              )}
                            >
                              {copy.status}
                            </span>
                          </td>
                          <td className={tdClass}>
                            {formatDateUS(copy.validUntil)}
                          </td>
                          <td className={tdClass}>
                            <span className="font-medium text-slate-900">{copy.document}</span>
                          </td>
                          <td className={tdClass}>
                            {copy.distributionList}
                          </td>
                          <td
                            onClick={(e) => e.stopPropagation()}
                            className="sticky right-0 z-10 bg-white border-b border-slate-200 py-2.5 px-2 md:py-3 md:px-4 text-center whitespace-nowrap before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-slate-200 shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.05)] group-hover:bg-slate-50 transition-colors"
                          >
                            <button
                              ref={getRef(copy.id)}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggle(copy.id, e);
                              }}
                              className="inline-flex items-center justify-center h-7 w-7 md:h-8 md:w-8 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
                              aria-label="More actions"
                            >
                              <MoreVertical className="h-3.5 w-3.5 md:h-4 md:w-4" />
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
              totalItems={filteredData.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
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
            onViewAuditTrail={() => {
              if (selectedCopy) handleViewAuditTrail(selectedCopy);
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
      <CreateLinkModal
        isOpen={isCreateLinkModalOpen && !!selectedCopyForLink}
        onClose={() => {
          setIsCreateLinkModalOpen(false);
          // Suggestion: Clear it after a delay or on animation complete
        }}
        documentId={selectedCopyForLink?.documentNumber || ""}
        documentTitle={selectedCopyForLink?.name || ""}
      />

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





