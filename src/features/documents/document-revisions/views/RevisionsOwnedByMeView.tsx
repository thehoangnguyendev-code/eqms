import React, {
  useState,
  useMemo,
  useRef,
  createRef,
  RefObject,
} from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ROUTES } from '@/app/routes.constants';
import {
  ChevronRight,
  ChevronUp,
  ChevronDown,
  MoreVertical,
  Download,
  History,
  FilePlusCorner,
  FileStack,
  Search,
  SlidersHorizontal,
  X,
  ArrowDownAZ,
  ArrowDownZA,
} from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import { StatusBadge, StatusType } from "@/components/ui/badge";
import { TablePagination } from "@/components/ui/table/TablePagination";
import { TableEmptyState } from "@/components/ui/table/TableEmptyState";
import { DocumentFilters } from "@/features/documents/shared/components";
import { cn } from "@/components/ui/utils";
import {
  IconInfoCircle,
} from "@tabler/icons-react";
import { Breadcrumb } from "@/components/ui/breadcrumb/Breadcrumb";
import { revisionsOwnedByMe } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { SectionLoading, FullPageLoading } from "@/components/ui/loading/Loading";
import { usePortalDropdown, useNavigateWithLoading, useTableDragScroll } from "@/hooks";

import type { DocumentType, DocumentStatus } from "@/features/documents/types";
import type { RelatedDocument, CorrelatedDocument, Revision } from "./mockData";
import { MOCK_REVISIONS } from "./mockData";
import { mapStatusToStatusType } from "@/utils/status";

// --- Types ---
interface TableColumn {
  id: string;
  label: string;
  visible: boolean;
  order: number;
  locked?: boolean;
}

// Current logged-in user (simulated)
const CURRENT_USER = {
  id: "user-001",
  name: "Dr. Sarah Johnson",
  email: "sarah.johnson@company.com",
  department: "Quality Assurance",
};

// Default columns configuration
const DEFAULT_COLUMNS: TableColumn[] = [
  { id: "no", label: "No.", visible: true, order: 0, locked: true },
  { id: "documentNumber", label: "Document Number", visible: true, order: 1 },
  { id: "revisionNumber", label: "Revision Number", visible: true, order: 2 },
  { id: "created", label: "Created", visible: true, order: 3 },
  { id: "openedBy", label: "Opened By", visible: true, order: 4 },
  { id: "revisionName", label: "Revision Name", visible: true, order: 5 },
  { id: "state", label: "State", visible: true, order: 6 },
  { id: "documentName", label: "Document Name", visible: true, order: 7 },
  { id: "type", label: "Document Type", visible: true, order: 8 },
  { id: "relatedDocuments", label: "Related Document", visible: true, order: 9 },
  { id: "correlatedDocuments", label: "Correlated Document", visible: true, order: 10 },
  { id: "template", label: "Template", visible: true, order: 11 },
  { id: "businessUnit", label: "Business Unit", visible: true, order: 12 },
  { id: "department", label: "Department", visible: true, order: 13 },
  { id: "author", label: "Author", visible: true, order: 14 },
  { id: "effectiveDate", label: "Effective Date", visible: true, order: 15 },
  { id: "validUntil", label: "Valid Until", visible: true, order: 16 },
  { id: "action", label: "Action", visible: true, order: 17, locked: true },
];

// --- Main Component ---
export const RevisionsOwnedByMeView: React.FC = () => {
  const { navigateTo, isNavigating } = useNavigateWithLoading();

  // States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | "All">("All");
  const [typeFilter, setTypeFilter] = useState<DocumentType | "All">("All");
  const [businessUnitFilter, setBusinessUnitFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");

  // Author filter is set to current user and will be readonly
  const [authorFilter, setAuthorFilter] = useState(CURRENT_USER.name);

  const [createdFromDate, setCreatedFromDate] = useState("");
  const [createdToDate, setCreatedToDate] = useState("");
  const [effectiveFromDate, setEffectiveFromDate] = useState("");
  const [effectiveToDate, setEffectiveToDate] = useState("");
  const [validFromDate, setValidFromDate] = useState("");
  const [validToDate, setValidToDate] = useState("");
  const [relatedDocumentFilter, setRelatedDocumentFilter] = useState("All");
  const [correlatedDocumentFilter, setCorrelatedDocumentFilter] = useState("All");
  const [templateFilter, setTemplateFilter] = useState("All");
  const [columns, setColumns] = useState<TableColumn[]>([...DEFAULT_COLUMNS]);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isFilterVisible, setIsFilterVisible] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth >= 768 : true;
  });
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "revisionName",
    direction: "asc",
  });

  const { openId, position, getRef, toggle, close } = usePortalDropdown();
  const { scrollerRef, isDragging, dragEvents } = useTableDragScroll();

  // Filtered data (Using MOCK_REVISIONS instead of MOCK_MY_REVISIONS)
  const filteredRevisions = useMemo(() => {
    const filtered = MOCK_REVISIONS.filter((revision) => {
      const matchesSearch =
        searchQuery === "" ||
        revision.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        revision.revisionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        revision.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        revision.documentName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "All" || revision.state === statusFilter;
      const matchesType = typeFilter === "All" || revision.type === typeFilter;
      const matchesBusinessUnit = businessUnitFilter === "All" || revision.businessUnit === businessUnitFilter;
      const matchesDepartment = departmentFilter === "All" || revision.department === departmentFilter;

      // matchesAuthor will ensure only documents owned by CURRENT_USER are shown 
      // because authorFilter is strictly tied to CURRENT_USER.name
      const matchesAuthor = authorFilter === "All" || revision.author === authorFilter;

      const matchesCreatedDate = (() => {
        if (!createdFromDate && !createdToDate) return true;
        const revisionDate = new Date(revision.created);
        let matchesFrom = true;
        let matchesTo = true;
        if (createdFromDate) {
          const parts = createdFromDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
          if (parts) {
            const from = new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]), 0, 0, 0);
            matchesFrom = revisionDate >= from;
          }
        }
        if (createdToDate) {
          const parts = createdToDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
          if (parts) {
            const to = new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]), 23, 59, 59);
            matchesTo = revisionDate <= to;
          }
        }
        return matchesFrom && matchesTo;
      })();

      const matchesEffectiveDate = (() => {
        if (!effectiveFromDate && !effectiveToDate) return true;
        const revisionDate = new Date(revision.effectiveDate);
        let matchesFrom = true;
        let matchesTo = true;
        if (effectiveFromDate) {
          const parts = effectiveFromDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
          if (parts) {
            const from = new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]), 0, 0, 0);
            matchesFrom = revisionDate >= from;
          }
        }
        if (effectiveToDate) {
          const parts = effectiveToDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
          if (parts) {
            const to = new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]), 23, 59, 59);
            matchesTo = revisionDate <= to;
          }
        }
        return matchesFrom && matchesTo;
      })();

      const matchesValidDate = (() => {
        if (!validFromDate && !validToDate) return true;
        const revisionDate = new Date(revision.validUntil);
        let matchesFrom = true;
        let matchesTo = true;
        if (validFromDate) {
          const parts = validFromDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
          if (parts) {
            const from = new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]), 0, 0, 0);
            matchesFrom = revisionDate >= from;
          }
        }
        if (validToDate) {
          const parts = validToDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
          if (parts) {
            const to = new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]), 23, 59, 59);
            matchesTo = revisionDate <= to;
          }
        }
        return matchesFrom && matchesTo;
      })();

      const matchesRelatedDocument =
        relatedDocumentFilter === "All" ||
        (relatedDocumentFilter === "yes" ? !!revision.hasRelatedDocuments : !revision.hasRelatedDocuments);

      const matchesCorrelatedDocument =
        correlatedDocumentFilter === "All" ||
        (correlatedDocumentFilter === "yes" ? !!revision.hasCorrelatedDocuments : !revision.hasCorrelatedDocuments);

      const matchesTemplate =
        templateFilter === "All" ||
        (templateFilter === "yes" ? !!revision.isTemplate : !revision.isTemplate);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        matchesBusinessUnit &&
        matchesDepartment &&
        matchesAuthor &&
        matchesCreatedDate &&
        matchesEffectiveDate &&
        matchesValidDate &&
        matchesRelatedDocument &&
        matchesCorrelatedDocument &&
        matchesTemplate
        );
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
        const key = sortConfig.key as keyof Revision;
        let valA: any = a[key] || "";
        let valB: any = b[key] || "";
  
        if (key === 'created' || key === 'effectiveDate' || key === 'validUntil') {
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
    }, [
      searchQuery,
      statusFilter,
      typeFilter,
      departmentFilter,
      authorFilter,
      createdFromDate,
      createdToDate,
      effectiveFromDate,
      effectiveToDate,
      validFromDate,
      validToDate,
      relatedDocumentFilter,
      correlatedDocumentFilter,
      templateFilter,
      sortConfig,
    ]);
  
    const handleSort = (key: string) => {
      setSortConfig((prev) => ({
        key,
        direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
      }));
      setCurrentPage(1);
    };

  // Handle loading state on filter changes
  React.useEffect(() => {
    setIsTableLoading(true);
    const timer = setTimeout(() => setIsTableLoading(false), 300);
    return () => clearTimeout(timer);
  }, [
    searchQuery,
    statusFilter,
    typeFilter,
    departmentFilter,
    authorFilter,
    createdFromDate,
    createdToDate,
    effectiveFromDate,
    effectiveToDate,
    validFromDate,
    validToDate,
    relatedDocumentFilter,
    correlatedDocumentFilter,
    templateFilter,
    sortConfig,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredRevisions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRevisions = useMemo(() => {
    return filteredRevisions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRevisions, startIndex, itemsPerPage]);

  // Visible columns
  const visibleColumns = useMemo(
    () => columns.filter((col) => col.visible).sort((a, b) => a.order - b.order),
    [columns]
  );

  // Handlers
  const handleViewRevision = (id: string) => {
    navigateTo(ROUTES.DOCUMENTS.REVISIONS.DETAIL(id));
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setTypeFilter("All");
    setBusinessUnitFilter("All");
    setDepartmentFilter("All");
    // Ensure author filter doesn't reset to "All", keeps Current User
    setAuthorFilter(CURRENT_USER.name);
    setCreatedFromDate("");
    setCreatedToDate("");
    setEffectiveFromDate("");
    setEffectiveToDate("");
    setValidFromDate("");
    setValidToDate("");
    setRelatedDocumentFilter("All");
    setCorrelatedDocumentFilter("All");
    setTemplateFilter("All");
    setCurrentPage(1);
  };

  const handleNewRevision = (revision: Revision) => {
    close();
    if (revision.hasRelatedDocuments) {
      navigateTo(ROUTES.DOCUMENTS.REVISIONS.NEW_MULTI(revision.id), { state: { from: ROUTES.DOCUMENTS.REVISIONS.OWNED } });
    } else {
      navigateTo(ROUTES.DOCUMENTS.REVISIONS.NEW_STANDALONE(revision.id), { state: { from: ROUTES.DOCUMENTS.REVISIONS.OWNED } });
    }
  };

  const handlePrintControlledCopy = (revision: Revision) => {
    const relatedDocuments = revision.hasRelatedDocuments
      ? [
        {
          id: revision.id,
          documentId: revision.documentNumber,
          title: revision.revisionName,
          version: revision.revisionNumber,
          status: revision.state as any,
          isParent: true,
        },
      ]
      : [];

    close();
    navigateTo(ROUTES.DOCUMENTS.CONTROLLED_COPIES.REQUEST, {
      state: {
        documentId: revision.documentNumber,
        documentTitle: revision.revisionName,
        documentVersion: revision.revisionNumber,
        relatedDocuments,
      },
    });
  };

  const handleMenuAction = (action: string, id: string) => {
    close();

    switch (action) {
      case "view":
        navigateTo(ROUTES.DOCUMENTS.REVISIONS.DETAIL(id));
        break;
      case "download":
        // TODO: Implement download functionality
        break;
      case "audit":
        navigateTo(`${ROUTES.DOCUMENTS.REVISIONS.DETAIL(id)}?tab=audit`);
        break;
      default:
        break;
    }
  };

  // Render column cell
  const renderCell = (
    column: TableColumn,
    revision: Revision,
    index: number,
  ) => {
    if (column.id === "businessUnit") return revision.businessUnit;
    switch (column.id) {
      case "no":
        return startIndex + index + 1;
      case "documentNumber":
        return (
          <span className="font-medium text-emerald-600">
            {revision.documentNumber}
          </span>
        );
      case "revisionNumber":
        return revision.revisionNumber;
      case "created":
        return revision.created;
      case "openedBy":
        return revision.openedBy;
      case "revisionName":
        return <span className="font-medium text-slate-900">{revision.revisionName}</span>;
      case "state":
        return (
          <span className="inline-flex items-center gap-1.5">
            <StatusBadge status={mapStatusToStatusType(revision.state) as StatusType} />
          </span>
        );
      case "documentName":
        return <span className="text-slate-600">{revision.documentName}</span>;
      case "type":
        return revision.type;
      case "relatedDocuments":
        return revision.hasRelatedDocuments ? (
          <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">Yes</span>
        ) : (
          <span className="text-slate-600 font-medium">No</span>
        );
      case "correlatedDocuments":
        return revision.hasCorrelatedDocuments ? (
          <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">Yes</span>
        ) : (
          <span className="text-slate-600 font-medium">No</span>
        );
      case "template":
        return revision.isTemplate ? (
          <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">Yes</span>
        ) : (
          <span className="text-slate-600 font-medium">No</span>
        );
      case "department":
        return revision.department;
      case "author":
        return revision.author;
      case "effectiveDate":
        return revision.effectiveDate;
      case "validUntil":
        return revision.validUntil;
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {isNavigating && <FullPageLoading text="Loading..." />}
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 md:gap-4">
          <div className="min-w-[200px] flex-1">
            <h1 className="text-lg md:text-xl lg:text-2xl font-bold tracking-tight text-slate-900">
              Revisions Owned By Me
            </h1>
            <Breadcrumb items={revisionsOwnedByMe(navigateTo)} />
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
        <div className="p-4 md:p-5 flex flex-col">
          {/* Search Row + Primary Actions */}
          <div className="flex flex-row gap-2 sm:gap-3 items-end">
            <div className="flex-1">
              <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block transition-colors">
                Search
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors">
                  <Search className="h-4 w-4 text-slate-400 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Search your revisions..."
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
                <div className="pt-2">
                  <DocumentFilters
                    hideSearch
                    searchQuery={searchQuery}
                    onSearchChange={(value) => {
                      setSearchQuery(value);
                      setCurrentPage(1);
                    }}
                    statusFilter={statusFilter}
                    onStatusChange={(value) => {
                      setStatusFilter(value);
                      setCurrentPage(1);
                    }}
                    typeFilter={typeFilter}
                    onTypeChange={(value) => {
                      setTypeFilter(value);
                      setCurrentPage(1);
                    }}
                    businessUnitFilter={businessUnitFilter}
                    onBusinessUnitChange={(value) => {
                      setBusinessUnitFilter(value);
                      setCurrentPage(1);
                    }}
                    departmentFilter={departmentFilter}
                    onDepartmentChange={(value) => {
                      setDepartmentFilter(value);
                      setCurrentPage(1);
                    }}

                    // Pass author props & disable it
                    authorFilter={authorFilter}
                    onAuthorChange={() => { }} // Disabled -> No-op
                    authorFilterDisabled={true}

                    createdFromDate={createdFromDate}
                    onCreatedFromDateChange={(dateStr) => {
                      setCreatedFromDate(dateStr);
                      setCurrentPage(1);
                    }}
                    createdToDate={createdToDate}
                    onCreatedToDateChange={(dateStr) => {
                      setCreatedToDate(dateStr);
                      setCurrentPage(1);
                    }}
                    effectiveFromDate={effectiveFromDate}
                    onEffectiveFromDateChange={(dateStr) => {
                      setEffectiveFromDate(dateStr);
                      setCurrentPage(1);
                    }}
                    effectiveToDate={effectiveToDate}
                    onEffectiveToDateChange={(dateStr) => {
                      setEffectiveToDate(dateStr);
                      setCurrentPage(1);
                    }}
                    validFromDate={validFromDate}
                    onValidFromDateChange={(dateStr) => {
                      setValidFromDate(dateStr);
                      setCurrentPage(1);
                    }}
                    validToDate={validToDate}
                    onValidToDateChange={(dateStr) => {
                      setValidToDate(dateStr);
                      setCurrentPage(1);
                    }}
                    showTypeFilter={true}
                    showDepartmentFilter={true}
                    relatedDocumentFilter={relatedDocumentFilter}
                    onRelatedDocumentFilterChange={(value) => {
                      setRelatedDocumentFilter(value);
                      setCurrentPage(1);
                    }}
                    correlatedDocumentFilter={correlatedDocumentFilter}
                    onCorrelatedDocumentFilterChange={(value) => {
                      setCorrelatedDocumentFilter(value);
                      setCurrentPage(1);
                    }}
                    templateFilter={templateFilter}
                    onTemplateFilterChange={(value) => {
                      setTemplateFilter(value);
                      setCurrentPage(1);
                    }}
                    onClearFilters={handleClearFilters}
                  />
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
            {paginatedRevisions.length > 0 ? (
              <>
                {/* Table with Horizontal Scroll */}
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
                        <th className="sticky top-0 z-20 bg-slate-50 py-2.5 px-2 md:py-3.5 md:px-4 text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 whitespace-nowrap w-9"></th>
                        {visibleColumns.map((column) => {
                          const isSorted = sortConfig.key === column.id;
                          const canSort = column.id !== 'action' && column.id !== 'no' && column.id !== 'relatedDocuments' && column.id !== 'correlatedDocuments' && column.id !== 'template';

                          return (
                            <th
                              key={column.id}
                              onClick={canSort ? () => handleSort(column.id) : undefined}
                              className={cn(
                                "sticky top-0 z-20 bg-slate-50 py-2.5 px-2 md:py-3.5 md:px-4 text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 whitespace-nowrap transition-colors",
                                canSort && "cursor-pointer hover:bg-slate-100 hover:text-slate-700",
                                column.id === "action"
                                  ? "right-0 z-30 text-center before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-slate-200 shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.05)]"
                                  : "text-left",
                              )}
                            >
                              <div className="flex items-center justify-between gap-2 w-full">
                                <span className="truncate">{column.label}</span>
                                {canSort && (
                                  <div className="flex flex-col text-slate-400 flex-shrink-0 group-hover:text-slate-500">
                                    <ChevronUp className={cn("h-3 w-3 -mb-1", isSorted && sortConfig.direction === 'asc' ? "text-emerald-600 font-bold" : "")} />
                                    <ChevronDown className={cn("h-3 w-3", isSorted && sortConfig.direction === 'desc' ? "text-emerald-600 font-bold" : "")} />
                                  </div>
                                )}
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {paginatedRevisions.map((revision, index) => {
                        const isExpanded = expandedRowId === revision.id;
                        const hasDocs = revision.hasRelatedDocuments || revision.hasCorrelatedDocuments;
                        const tdClass = "py-2.5 px-2 md:py-3 md:px-4 text-xs md:text-sm text-slate-700 border-b border-slate-200 whitespace-nowrap";

                        return (
                          <React.Fragment key={revision.id}>
                            <tr
                              className="hover:bg-slate-50/80 transition-colors group"
                            >
                              <td className="py-2.5 px-2 md:py-3 md:px-3 border-b border-slate-200 whitespace-nowrap" onClick={(e) => {
                                e.stopPropagation();
                                if (hasDocs) setExpandedRowId(isExpanded ? null : revision.id);
                              }}>
                                {hasDocs && (
                                  <button className="flex items-center justify-center h-5 w-5 md:h-6 md:w-6 rounded-md hover:bg-slate-200 transition-colors">
                                    <ChevronRight className={cn("h-3.5 w-3.5 md:h-4 md:w-4 text-slate-500 transition-transform duration-200", isExpanded && "rotate-90")} />
                                  </button>
                                )}
                              </td>
                              {visibleColumns.map((column) =>
                                column.id === "action" ? (
                                  <td
                                    key={column.id}
                                    onClick={(e) => e.stopPropagation()}
                                    className="sticky right-0 z-10 bg-white border-b border-slate-200 py-2.5 px-2 md:py-3 md:px-4 text-center whitespace-nowrap before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-slate-200 shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.05)] group-hover:bg-slate-50 transition-colors"
                                  >
                                    <button
                                      ref={getRef(revision.id)}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggle(revision.id, e);
                                      }}
                                      className="inline-flex items-center justify-center h-7 w-7 md:h-8 md:w-8 rounded-lg hover:bg-slate-100 transition-colors"
                                    >
                                      <MoreVertical className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                    </button>
                                  </td>
                                ) : (
                                  <td
                                    key={column.id}
                                    className={cn(
                                      tdClass,
                                      column.id === "documentNumber" && "cursor-pointer"
                                    )}
                                    onClick={column.id === "documentNumber" ? () => handleViewRevision(revision.id) : undefined}
                                  >
                                    {renderCell(column, revision, index)}
                                  </td>
                                ),
                              )}
                            </tr>
                            <AnimatePresence initial={false}>
                              {isExpanded && hasDocs && (
                                <tr className="bg-slate-50/50">
                                  <td colSpan={visibleColumns.length} className="p-0 border-b border-slate-200">
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="px-4 py-3">
                                        <div className="ml-9 flex flex-wrap gap-6">
                                          {revision.relatedDocuments && revision.relatedDocuments.length > 0 && (
                                            <div>
                                              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                                Related Documents ({revision.relatedDocuments.length})
                                              </p>
                                              <div className="rounded-lg border border-slate-200 overflow-hidden inline-block">
                                                <table className="text-xs table-auto">
                                                  <thead>
                                                    <tr className="bg-slate-100 border-b border-slate-200">
                                                      <th className="py-1.5 px-2.5 text-left font-semibold text-slate-600 whitespace-nowrap">Document Number</th>
                                                      <th className="py-1.5 px-2.5 text-left font-semibold text-slate-600 whitespace-nowrap">Document Name</th>
                                                      <th className="py-1.5 px-2.5 text-left font-semibold text-slate-600 whitespace-nowrap">Revision</th>
                                                      <th className="py-1.5 px-2.5 text-left font-semibold text-slate-600 whitespace-nowrap">Type</th>
                                                      <th className="py-1.5 px-2.5 text-left font-semibold text-slate-600 whitespace-nowrap">State</th>
                                                    </tr>
                                                  </thead>
                                                  <tbody className="divide-y divide-slate-100 bg-white">
                                                    {revision.relatedDocuments.map((doc: RelatedDocument) => (
                                                      <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="py-1.5 px-2.5 font-medium text-emerald-600 whitespace-nowrap">{doc.documentNumber}</td>
                                                        <td className="py-1.5 px-2.5 text-slate-700 whitespace-nowrap">{doc.documentName}</td>
                                                        <td className="py-1.5 px-2.5 text-slate-600 whitespace-nowrap">{doc.revisionNumber}</td>
                                                        <td className="py-1.5 px-2.5 text-slate-600 whitespace-nowrap">{doc.type}</td>
                                                        <td className="py-1.5 px-2.5 whitespace-nowrap">
                                                          <StatusBadge status={mapStatusToStatusType(doc.state) as StatusType} size="sm" />
                                                        </td>
                                                      </tr>
                                                    ))}
                                                  </tbody>
                                                </table>
                                              </div>
                                            </div>
                                          )}
                                          {revision.correlatedDocuments && revision.correlatedDocuments.length > 0 && (
                                            <div>
                                              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                                Correlated Documents ({revision.correlatedDocuments.length})
                                              </p>
                                              <div className="rounded-lg border border-slate-200 overflow-hidden inline-block">
                                                <table className="text-xs table-auto">
                                                  <thead>
                                                    <tr className="bg-slate-100 border-b border-slate-200">
                                                      <th className="py-1.5 px-2.5 text-left font-semibold text-slate-600 whitespace-nowrap">Document Number</th>
                                                      <th className="py-1.5 px-2.5 text-left font-semibold text-slate-600 whitespace-nowrap">Document Name</th>
                                                      <th className="py-1.5 px-2.5 text-left font-semibold text-slate-600 whitespace-nowrap">Revision</th>
                                                      <th className="py-1.5 px-2.5 text-left font-semibold text-slate-600 whitespace-nowrap">Type</th>
                                                      <th className="py-1.5 px-2.5 text-left font-semibold text-slate-600 whitespace-nowrap">State</th>
                                                      <th className="py-1.5 px-2.5 text-left font-semibold text-slate-600 whitespace-nowrap">Correlation Type</th>
                                                    </tr>
                                                  </thead>
                                                  <tbody className="divide-y divide-slate-100 bg-white">
                                                    {revision.correlatedDocuments.map((doc: CorrelatedDocument) => (
                                                      <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="py-1.5 px-2.5 font-medium text-emerald-600 whitespace-nowrap">{doc.documentNumber}</td>
                                                        <td className="py-1.5 px-2.5 text-slate-700 whitespace-nowrap">{doc.documentName}</td>
                                                        <td className="py-1.5 px-2.5 text-slate-600 whitespace-nowrap">{doc.revisionNumber}</td>
                                                        <td className="py-1.5 px-2.5 text-slate-600 whitespace-nowrap">{doc.type}</td>
                                                        <td className="py-1.5 px-2.5 whitespace-nowrap">
                                                          <StatusBadge status={mapStatusToStatusType(doc.state) as StatusType} size="sm" />
                                                        </td>
                                                        <td className="py-1.5 px-2.5 text-slate-500 whitespace-nowrap">{doc.correlationType ?? "—"}</td>
                                                      </tr>
                                                    ))}
                                                  </tbody>
                                                </table>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </motion.div>
                                  </td>
                                  <td className="p-0 border-b border-slate-200 sticky right-0 z-10 bg-white before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-slate-200 shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.05)]">
                                  </td>
                                </tr>
                              )}
                            </AnimatePresence>
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Footer */}
                <TablePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredRevisions.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={setItemsPerPage}
                />
              </>
            ) : (
              <TableEmptyState
                title="No Revisions Found"
                description="We couldn't find any revision records matching your filters. Try adjusting your search criteria or clear filters."
                actionLabel="Clear Filters"
                onAction={handleClearFilters}
              />
            )}
          </div>
        </div>
      </div>

      {/* Dropdown Menu */}
      {openId && (() => {
        const currentRevision = MOCK_REVISIONS.find(r => r.id === openId);
        const isEffective = currentRevision?.state === "Effective";

        return createPortal(
          <>
            <div
              className="fixed inset-0 z-40 animate-in fade-in duration-150"
              onClick={(e) => {
                e.stopPropagation();
                close();
              }}
              aria-hidden="true"
            />
            <div
              className="absolute z-50 min-w-[180px] rounded-lg border border-slate-200 bg-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-200"
              style={position.style}
            >
              <div className="py-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMenuAction("view", openId);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors"
                >
                  <IconInfoCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="font-medium">View Details</span>
                </button>
                {isEffective && currentRevision && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNewRevision(currentRevision);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors"
                    >
                      <FilePlusCorner className="h-4 w-4 flex-shrink-0" />
                      <span className="font-medium">Upgrade Revision</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrintControlledCopy(currentRevision);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors"
                    >
                      <FileStack className="h-4 w-4 flex-shrink-0" />
                      <span className="font-medium">Request Controlled Copy</span>
                    </button>
                  </>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMenuAction("download", openId);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors"
                >
                  <Download className="h-4 w-4 flex-shrink-0" />
                  <span className="font-medium">Download</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMenuAction("audit", openId);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors"
                >
                  <History className="h-4 w-4 flex-shrink-0" />
                  <span className="font-medium">View Audit Trail</span>
                </button>
              </div>
            </div>
          </>,
          document.body,
        );
      })()}
    </div>
  );
};