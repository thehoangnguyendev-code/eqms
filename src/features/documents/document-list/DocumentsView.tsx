import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { ROUTES } from '@/app/routes.constants';
import { createPortal } from "react-dom";
import {
  ChevronRight,
  ChevronUp,
  ChevronDown,
  MoreVertical,
  Download,
  History,
  SquarePen,
} from "lucide-react";
import {
  IconInfoCircle,
  IconEyeCheck,
  IconChecks,
  IconPlus,
} from "@tabler/icons-react";
import { PageHeader } from "@/components/ui/page/PageHeader";
import { documentList } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { Button } from "@/components/ui/button/Button";
import { StatusBadge, StatusType } from "@/components/ui";
import { TablePagination } from "@/components/ui/table/TablePagination";
import { TableEmptyState } from "@/components/ui/table/TableEmptyState";
import { SectionLoading, FullPageLoading } from "@/components/ui/loading/Loading";
import { cn } from "@/components/ui/utils";
import { formatDateUS } from "@/utils/format";
import { DocumentFilters } from "./../shared/components/DocumentFilters";
import { DetailDocumentView } from "../document-detail/DetailDocumentView";
import { usePortalDropdown, useNavigateWithLoading, useTableDragScroll, PortalDropdownPosition } from "@/hooks";

import type { DocumentType, DocumentStatus } from "@/features/documents/types";

import { MOCK_DOCUMENTS, CURRENT_USER } from './mockData';
import type { Document, RelatedDocument, CorrelatedDocument } from './types';

// --- Types ---
type ViewType = "all" | "owned-by-me";

interface TableColumn {
  id: string;
  label: string;
  visible: boolean;
  order: number;
  locked?: boolean;
}

// --- Helper Functions ---

// Map DocumentStatus to StatusType for StatusBadge component
const mapDocumentStatusToStatusType = (status: DocumentStatus): StatusType => {
  switch (status) {
    case "Active":
      return "active";
    case "Effective":
      return "effective";
    case "Approved":
      return "approved";
    case "Pending Approval":
      return "pendingApproval";
    case "Pending Review":
      return "pendingReview";
    case "Draft":
      return "draft";
    case "Obsoleted":
      return "obsolete";
    case "Closed - Cancelled":
      return "archived";
    default:
      return "draft";
  }
};

// --- Dropdown Component ---

interface DropdownMenuProps {
  document: Document;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  isOpen: boolean;
  onClose: () => void;
  position: PortalDropdownPosition;
  onViewDocument?: (documentId: string, tab?: string) => void;
  onNavigateTo: (to: string) => void;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  document,
  isOpen,
  onClose,
  position,
  onViewDocument,
  onNavigateTo,
}) => {

  // Dynamic menu items based on document status
  const getMenuItems = () => {
    const items = [];

    // Always available: View Details
    items.push({
      icon: IconInfoCircle,
      label: "View Details",
      onClick: () => {
        onViewDocument?.(document.id);
        onClose();
      },
      color: "text-slate-500"
    });

    // Status-specific actions
    switch (document.status) {
      case "Draft":
        items.push(
          {
            icon: SquarePen,
            label: "Edit Document",
            onClick: () => {
              console.log("Edit document:", document.id);
              onClose();
            },
            color: "text-slate-500"
          }
        );
        break;

      case "Pending Review":
        items.push({
          icon: IconEyeCheck,
          label: "Review Document",
          onClick: () => {
            onNavigateTo(ROUTES.DOCUMENTS.REVISIONS.REVIEW(document.id));
            onClose();
          },
          color: "text-slate-500"
        });
        break;

      case "Pending Approval":
        items.push({
          icon: IconChecks,
          label: "Approve Document",
          onClick: () => {
            onNavigateTo(ROUTES.DOCUMENTS.REVISIONS.APPROVAL(document.id));
            onClose();
          },
          color: "text-slate-500"
        });
        break;

      case "Active":
      case "Effective":
      case "Obsoleted":
      case "Closed - Cancelled":
        break;
    }

    // Always available: Version History & Audit Trail
    items.push({
      icon: History,
      label: "View Audit Trail",
      onClick: () => {
        onViewDocument?.(document.id, "audit");
        onClose();
      },
      color: "text-slate-500"
    });

    return items;
  };

  const menuItems = getMenuItems();

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
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  item.onClick();
                }}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-slate-50 active:bg-slate-100 transition-colors",
                  item.color
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>,
    window.document.body
  );
};

// --- Main Component ---

interface DocumentsViewProps {
  viewType: ViewType;
  onViewDocument?: (documentId: string, tab?: string) => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({ viewType, onViewDocument }) => {
  const { navigateTo, isNavigating } = useNavigateWithLoading();
  const location = useLocation();

  // Configuration based on viewType
  const config = useMemo(() => {
    switch (viewType) {
      case "all":
        return {
          title: "All Documents",
          breadcrumbLast: "All Documents",
          showNewDocButton: true,
          showRelatedDocumentsColumn: true,
          filterDocuments: (docs: Document[]) => docs,
          authorFilterDisabled: false,
          defaultAuthorFilter: "All" as string,
          allowedStatuses: ["Draft", "Active", "Obsoleted", "Closed - Cancelled"] as DocumentStatus[],
          defaultColumns: [
            { id: 'no', label: 'No.', visible: true, order: 0, locked: true },
            { id: 'documentId', label: 'Document Number', visible: true, order: 1 },
            { id: 'created', label: 'Created', visible: true, order: 2 },
            { id: 'openedBy', label: 'Opened By', visible: true, order: 3 },
            { id: 'title', label: 'Document Name', visible: true, order: 4 },
            { id: 'status', label: 'State', visible: true, order: 5 },
            { id: 'type', label: 'Document Type', visible: true, order: 6 },
            { id: 'relatedDocuments', label: 'Related Document', visible: true, order: 7 },
            { id: 'correlatedDocuments', label: 'Correlated Document', visible: true, order: 8 },
            { id: 'template', label: 'Template', visible: true, order: 9 },
            { id: 'businessUnit', label: 'Business Unit', visible: true, order: 10 },
            { id: 'department', label: 'Department', visible: true, order: 11 },
            { id: 'author', label: 'Author', visible: true, order: 12 },
            { id: 'effectiveDate', label: 'Effective Date', visible: true, order: 13 },
            { id: 'validUntil', label: 'Valid Until', visible: true, order: 14 },
            { id: 'action', label: 'Action', visible: true, order: 15, locked: true },
          ] as TableColumn[],
        };
      case "owned-by-me":
        return {
          title: "Documents Owned By Me",
          breadcrumbLast: "Documents Owned By Me",
          showNewDocButton: false,
          showRelatedDocumentsColumn: true, // Match "all" configuration
          filterDocuments: (docs: Document[]) => docs.filter(doc => doc.author === CURRENT_USER.name),
          authorFilterDisabled: true,
          defaultAuthorFilter: CURRENT_USER.name,
          allowedStatuses: ["Draft", "Active", "Obsoleted", "Closed - Cancelled"] as DocumentStatus[],
          defaultColumns: [
            { id: 'no', label: 'No.', visible: true, order: 0, locked: true },
            { id: 'documentId', label: 'Document Number', visible: true, order: 1 },
            { id: 'created', label: 'Created', visible: true, order: 2 },
            { id: 'openedBy', label: 'Opened By', visible: true, order: 3 },
            { id: 'title', label: 'Document Name', visible: true, order: 4 },
            { id: 'status', label: 'State', visible: true, order: 5 },
            { id: 'type', label: 'Document Type', visible: true, order: 6 },
            { id: 'relatedDocuments', label: 'Related Document', visible: true, order: 7 },
            { id: 'correlatedDocuments', label: 'Correlated Document', visible: true, order: 8 },
            { id: 'template', label: 'Template', visible: true, order: 9 },
            { id: 'businessUnit', label: 'Business Unit', visible: true, order: 10 },
            { id: 'department', label: 'Department', visible: true, order: 11 },
            { id: 'author', label: 'Author', visible: true, order: 12 },
            { id: 'effectiveDate', label: 'Effective Date', visible: true, order: 13 },
            { id: 'validUntil', label: 'Valid Until', visible: true, order: 14 },
            { id: 'action', label: 'Action', visible: true, order: 15, locked: true },
          ] as TableColumn[],
        };
    }
  }, [viewType]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | "All">("All");
  const [typeFilter, setTypeFilter] = useState<DocumentType | "All">("All");
  const [businessUnitFilter, setBusinessUnitFilter] = useState<string>("All");
  const [departmentFilter, setDepartmentFilter] = useState<string>("All");
  const [createdFromDate, setCreatedFromDate] = useState<string>("");
  const [createdToDate, setCreatedToDate] = useState<string>("");
  const [effectiveFromDate, setEffectiveFromDate] = useState<string>("");
  const [effectiveToDate, setEffectiveToDate] = useState<string>("");
  const [validFromDate, setValidFromDate] = useState<string>("");
  const [validToDate, setValidToDate] = useState<string>("");
  const [authorFilter, setAuthorFilter] = useState<string>(config.defaultAuthorFilter);
  const [versionFilter, setVersionFilter] = useState<string>("");
  const [relatedDocumentFilter, setRelatedDocumentFilter] = useState<string>("All");
  const [correlatedDocumentFilter, setCorrelatedDocumentFilter] = useState<string>("All");
  const [templateFilter, setTemplateFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [columns, setColumns] = useState<TableColumn[]>(config.defaultColumns);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [selectedDocumentTab, setSelectedDocumentTab] = useState<string>("general");
  const [isLoading, setIsLoading] = useState(false);
  const [isLocalNavigating, setIsLocalNavigating] = useState(false);

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "title",
    direction: "asc",
  });
  const { scrollerRef, isDragging, dragEvents } = useTableDragScroll();

  const { openId, position, getRef, toggle, close } = usePortalDropdown();

  // Reset to list view when user navigates to this page from sidebar (each navigation generates a new location.key)
  useEffect(() => {
    setSelectedDocumentId(null);
    setSelectedDocumentTab("general");
  }, [location.key]);

  // Update authorFilter when viewType changes
  useEffect(() => {
    setAuthorFilter(config.defaultAuthorFilter);
  }, [viewType, config.defaultAuthorFilter]);

  // Update columns when viewType changes
  useEffect(() => {
    setColumns(config.defaultColumns);
  }, [viewType, config.defaultColumns]);

  const handleNewDocument = () => {
    navigateTo(ROUTES.DOCUMENTS.NEW);
  };

  const handleViewDocument = (documentId: string, tab: string = "general") => {
    const document = MOCK_DOCUMENTS.find(doc => doc.id === documentId);

    if (document?.status === "Pending Review") {
      navigateTo(ROUTES.DOCUMENTS.REVISIONS.REVIEW(documentId));
    } else if (document?.status === "Pending Approval") {
      navigateTo(ROUTES.DOCUMENTS.REVISIONS.APPROVAL(documentId));
    } else {
      // For local view switching, we use a custom timeout but can't easily use the hook's isNavigating
      // unless we expose a way to manually set it.
      // I'll keep it as it's not a route change.
      // Wait, if I'm switching to a detail view that is NOT a new route, maybe I should use its own state.
      // But I removed the local isNavigating... I should probably keep a local one for this case.
      // I'll name it isLocalNavigating.
      setIsLocalNavigating(true);
      setTimeout(() => {
        window.document.getElementById('main-scroll-container')?.scrollTo({ top: 0, behavior: 'instant' });
        setSelectedDocumentId(documentId);
        setSelectedDocumentTab(tab);
        setIsLocalNavigating(false);
      }, 600);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setTypeFilter("All");
    setBusinessUnitFilter("All");
    setDepartmentFilter("All");
    setCreatedFromDate("");
    setCreatedToDate("");
    setEffectiveFromDate("");
    setEffectiveToDate("");
    setValidFromDate("");
    setValidToDate("");
    setAuthorFilter(config.defaultAuthorFilter);
    setVersionFilter("");
    setRelatedDocumentFilter("All");
    setCorrelatedDocumentFilter("All");
    setTemplateFilter("All");
    setCurrentPage(1);
  };

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  };


  useEffect(() => {
    if (!isLoading) {
      setIsTableLoading(true);
      const timer = setTimeout(() => {
        setIsTableLoading(false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [
    searchQuery, statusFilter, typeFilter, businessUnitFilter, departmentFilter, authorFilter, versionFilter,
    createdFromDate, createdToDate, effectiveFromDate, effectiveToDate, validFromDate, validToDate,
    relatedDocumentFilter, correlatedDocumentFilter, templateFilter, config
  ]);

  // Filter documents based on viewType and filters
  const filteredDocuments = useMemo(() => {
    // First apply viewType-specific filtering
    let docs = config.filterDocuments(MOCK_DOCUMENTS);

    // Filter by allowed statuses for the current view
    if (config.allowedStatuses) {
      docs = docs.filter(doc => config.allowedStatuses!.includes(doc.status));
    }

    // Then apply user filters
    return docs.filter((doc) => {
      const matchesSearch =
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.documentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.openedBy.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "All" || doc.status === statusFilter;
      const matchesType = typeFilter === "All" || doc.type === typeFilter;
      const matchesBusinessUnit = businessUnitFilter === "All" || doc.businessUnit === businessUnitFilter;
      const matchesDepartment = departmentFilter === "All" || doc.department === departmentFilter;
      const matchesAuthor = authorFilter === "All" || doc.author === authorFilter;
      const matchesVersion = !versionFilter || doc.version.toLowerCase().includes(versionFilter.toLowerCase());

      const docCreatedDate = new Date(doc.created);
      let matchesCreatedFrom = true;
      let matchesCreatedTo = true;
      if (createdFromDate) {
        const parts = createdFromDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (parts) {
          const from = new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]), 0, 0, 0);
          matchesCreatedFrom = docCreatedDate >= from;
        }
      }
      if (createdToDate) {
        const parts = createdToDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (parts) {
          const to = new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]), 23, 59, 59);
          matchesCreatedTo = docCreatedDate <= to;
        }
      }

      const docEffectiveDate = new Date(doc.effectiveDate);
      let matchesEffectiveFrom = true;
      let matchesEffectiveTo = true;
      if (effectiveFromDate) {
        const parts = effectiveFromDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (parts) {
          const from = new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]), 0, 0, 0);
          matchesEffectiveFrom = docEffectiveDate >= from;
        }
      }
      if (effectiveToDate) {
        const parts = effectiveToDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (parts) {
          const to = new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]), 23, 59, 59);
          matchesEffectiveTo = docEffectiveDate <= to;
        }
      }

      const docValidUntilDate = new Date(doc.validUntil);
      let matchesValidFrom = true;
      let matchesValidTo = true;
      if (validFromDate) {
        const parts = validFromDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (parts) {
          const from = new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]), 0, 0, 0);
          matchesValidFrom = docValidUntilDate >= from;
        }
      }
      if (validToDate) {
        const parts = validToDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (parts) {
          const to = new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]), 23, 59, 59);
          matchesValidTo = docValidUntilDate <= to;
        }
      }

      const matchesRelatedDocument =
        relatedDocumentFilter === "All" ||
        (relatedDocumentFilter === "yes" ? !!doc.hasRelatedDocuments : !doc.hasRelatedDocuments);

      const matchesCorrelatedDocument =
        correlatedDocumentFilter === "All" ||
        (correlatedDocumentFilter === "yes" ? !!doc.hasCorrelatedDocuments : !doc.hasCorrelatedDocuments);

      const matchesTemplate =
        templateFilter === "All" ||
        (templateFilter === "yes" ? !!doc.isTemplate : !doc.isTemplate);

      return matchesSearch && matchesStatus && matchesType && matchesBusinessUnit && matchesDepartment && matchesAuthor && matchesVersion &&
        matchesCreatedFrom && matchesCreatedTo && matchesEffectiveFrom && matchesEffectiveTo &&
        matchesValidFrom && matchesValidTo && matchesRelatedDocument && matchesCorrelatedDocument && matchesTemplate;
    }).sort((a, b) => {
      const key = sortConfig.key as keyof Document;

      const parseDate = (dStr: string) => {
        if (!dStr) return 0;
        const parts = dStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (parts) {
          return new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1])).getTime();
        }
        return new Date(dStr).getTime();
      };

      // Handle special cases or default values
      let valA: any = a[key];
      let valB: any = b[key];

      // Convert to comparison-friendly format
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
  }, [searchQuery, statusFilter, typeFilter, departmentFilter, authorFilter, versionFilter,
    createdFromDate, createdToDate, effectiveFromDate, effectiveToDate, validFromDate, validToDate,
    relatedDocumentFilter, correlatedDocumentFilter, templateFilter, config, sortConfig, businessUnitFilter]);

  const visibleColumns = useMemo(() => {
    return columns.filter(col => col.visible).sort((a, b) => a.order - b.order);
  }, [columns]);

  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const paginatedDocuments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredDocuments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredDocuments, currentPage, itemsPerPage]);

  // Trigger table loading when filters change
  useEffect(() => {
    if (!isLoading) {
      setIsTableLoading(true);
      const timer = setTimeout(() => {
        setIsTableLoading(false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [
    searchQuery, statusFilter, typeFilter, businessUnitFilter, departmentFilter, authorFilter, versionFilter,
    createdFromDate, createdToDate, effectiveFromDate, effectiveToDate, validFromDate, validToDate,
    relatedDocumentFilter, correlatedDocumentFilter, templateFilter, config
  ]);

  const selectedDocument = useMemo(() =>
    MOCK_DOCUMENTS.find(doc => doc.id === selectedDocumentId),
    [selectedDocumentId]
  );

  if (selectedDocumentId && selectedDocument) {
    return (
      <DetailDocumentView
        documentId={selectedDocumentId}
        initialStatus={selectedDocument.status}
        onBack={() => {
          window.document.getElementById('main-scroll-container')?.scrollTo({ top: 0, behavior: 'instant' });
          setSelectedDocumentId(null);
          setSelectedDocumentTab("general");
        }}
        initialTab={selectedDocumentTab as any}
      />
    );
  }

  return (
    <div className="flex flex-col h-full gap-4 md:gap-6">
      {(isNavigating || isLocalNavigating) && <FullPageLoading text="Loading..." />}
      {/* Header: Title + Breadcrumb + Action Button */}
      <PageHeader
        title={config.title}
        breadcrumbItems={documentList(navigateTo, viewType === "owned-by-me" ? "owned" : undefined)}
        actions={
          <>
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
            {config.showNewDocButton && (
              <Button
                onClick={handleNewDocument}
                size="sm"
                className="whitespace-nowrap gap-2"
              >
                <IconPlus className="h-4 w-4" />
                New Document
              </Button>
            )}
          </>
        }
      />

      {isLoading ? (
        <FullPageLoading text="Loading documents..." />
      ) : (
        <>
          {/* Unified Content Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm w-full overflow-hidden flex flex-col">
            {/* Filter Section */}
            <div className="p-4 md:p-5 flex flex-col">
              <div className="px-1.5 -mx-1.5 pb-1.5 -mb-1.5">
                <DocumentFilters
                  showCard={false}
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
                  authorFilter={authorFilter}
                  onAuthorChange={(value) => {
                    setAuthorFilter(value);
                    setCurrentPage(1);
                  }}
                  authorFilterDisabled={config.authorFilterDisabled}
                  allowedStatuses={config.allowedStatuses}
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
            </div>

            {/* Table Section */}
            <div className="px-4 md:px-5 pb-4 md:pb-5 flex-1 flex flex-col relative">
              {isTableLoading && (
                <div className="absolute inset-0 z-20 bg-white/40 backdrop-blur-[4px] flex items-center justify-center transition-all duration-300">
                  <SectionLoading text="Searching..." minHeight="150px" />
                </div>
              )}

              <div className={cn(
                "border border-slate-200 rounded-xl overflow-hidden flex flex-col flex-1 bg-white transition-all duration-300 relative",
                isTableLoading && "blur-[2px] opacity-80 pointer-events-none"
              )}>
                {paginatedDocuments.length > 0 ? (
                  <>
                    <div
                      ref={scrollerRef}
                      className={cn(
                        "flex-1 overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-50 hover:scrollbar-thumb-slate-400",
                        isDragging ? "cursor-grabbing select-none" : "cursor-grab"
                      )}
                      style={{ WebkitOverflowScrolling: 'touch' }}
                      {...dragEvents}
                    >
                      <table className="w-full min-w-max border-separate border-spacing-0 text-left">
                        <thead>
                          <tr>
                            <th className="sticky top-0 z-20 bg-slate-50 py-2.5 px-2 md:py-3.5 md:px-4 text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 whitespace-nowrap w-9"></th>
                            {visibleColumns.map(col => {
                              const isSorted = sortConfig.key === col.id;
                              const canSort = col.id !== 'action' && col.id !== 'no' && col.id !== 'relatedDocuments' && col.id !== 'correlatedDocuments' && col.id !== 'template';

                              return (
                                <th
                                  key={col.id}
                                  onClick={canSort ? () => handleSort(col.id) : undefined}
                                  className={cn(
                                    "sticky top-0 z-20 bg-slate-50 py-2.5 px-2 md:py-3.5 md:px-4 text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 whitespace-nowrap transition-colors",
                                    canSort && "cursor-pointer hover:bg-slate-100 hover:text-slate-700",
                                    col.id === 'action' && "right-0 z-30 text-center before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-slate-200 shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.05)]"
                                  )}
                                >
                                  <div className="flex items-center justify-between gap-2 md:gap-3 w-full">
                                    <span className="truncate">{col.label}</span>
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
                          {paginatedDocuments.map((doc, index) => {
                            const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                            const isExpanded = expandedRowId === doc.id;
                            const hasSubDocs = doc.hasRelatedDocuments || doc.hasCorrelatedDocuments;
                            const tdClass = "py-2.5 px-2 md:py-3 md:px-4 text-xs md:text-sm text-slate-700 border-b border-slate-200 whitespace-nowrap";

                            return (
                              <React.Fragment key={doc.id}>
                                <tr
                                  className="hover:bg-slate-50/80 transition-colors group"
                                >
                                  <td className="py-2.5 px-2 md:py-3 md:px-3 border-b border-slate-200 whitespace-nowrap" onClick={(e) => {
                                    e.stopPropagation();
                                    if (hasSubDocs) setExpandedRowId(isExpanded ? null : doc.id);
                                  }}>
                                    {hasSubDocs && (
                                      <button className="flex items-center justify-center h-5 w-5 md:h-6 md:w-6 rounded-lg hover:bg-slate-200 transition-colors">
                                        <ChevronRight className={cn("h-3.5 w-3.5 md:h-4 md:w-4 text-slate-500 transition-transform duration-200", isExpanded && "rotate-90")} />
                                      </button>
                                    )}
                                  </td>
                                  {visibleColumns.map(col => {
                                    if (col.id === 'action') {
                                      return (
                                        <td
                                          key={col.id}
                                          onClick={(e) => e.stopPropagation()}
                                          className="sticky right-0 z-10 bg-white border-b border-slate-200 py-2.5 px-2 md:py-3 md:px-4 text-center whitespace-nowrap before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-slate-200 shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.05)] group-hover:bg-slate-50 transition-colors"
                                        >
                                          <button
                                            ref={getRef(doc.id)}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggle(doc.id, e);
                                            }}
                                            className="inline-flex items-center justify-center h-7 w-7 md:h-8 md:w-8 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
                                          >
                                            <MoreVertical className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                          </button>
                                          <DropdownMenu
                                            document={doc}
                                            triggerRef={getRef(doc.id)}
                                            isOpen={openId === doc.id}
                                            onClose={close}
                                            position={position}
                                            onViewDocument={handleViewDocument}
                                            onNavigateTo={navigateTo}
                                          />
                                        </td>
                                      );
                                    }

                                    let content;
                                    if (col.id === 'no') content = globalIndex;
                                    else if (col.id === 'documentId') content = null;
                                    else if (col.id === 'title') content = <span className="font-medium text-slate-900">{doc.title}</span>;
                                    else if (col.id === 'status') content = <StatusBadge status={mapDocumentStatusToStatusType(doc.status)} />;
                                    else if (col.id === 'created') content = formatDateUS(doc.created);
                                    else if (col.id === 'effectiveDate') content = formatDateUS(doc.effectiveDate);
                                    else if (col.id === 'validUntil') content = formatDateUS(doc.validUntil);
                                    else if (col.id === 'relatedDocuments') content = doc.hasRelatedDocuments ? <span className="text-emerald-600 font-medium">Yes</span> : <span className="text-slate-400">No</span>;
                                    else if (col.id === 'correlatedDocuments') content = doc.hasCorrelatedDocuments ? <span className="text-emerald-600 font-medium">Yes</span> : <span className="text-slate-400">No</span>;
                                    else if (col.id === 'template') content = doc.isTemplate ? <span className="text-emerald-600 font-medium">Yes</span> : <span className="text-slate-400">No</span>;
                                    else content = doc[col.id as keyof Document] as string;

                                    return (
                                      <td
                                        key={col.id}
                                        className={cn(
                                          tdClass,
                                          col.id === 'documentId' && "cursor-pointer"
                                        )}
                                        onClick={col.id === 'documentId' ? () => handleViewDocument(doc.id) : undefined}
                                      >
                                        {col.id === 'documentId' ? (
                                          <span className="font-medium text-emerald-600 hover:underline">
                                            {doc.documentId}
                                          </span>
                                        ) : content}
                                      </td>
                                    );
                                  })}
                                </tr>
                                <AnimatePresence initial={false}>
                                  {isExpanded && hasSubDocs && (
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
                                              {/* Bảng Related Documents */}
                                              {doc.relatedDocuments && doc.relatedDocuments.length > 0 && (
                                                <div>
                                                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                                    Related Documents ({doc.relatedDocuments.length})
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
                                                        {doc.relatedDocuments.map((rel: RelatedDocument) => (
                                                          <tr key={rel.id} className="hover:bg-slate-50 transition-colors">
                                                            <td className="py-1.5 px-2.5 font-medium text-emerald-600 whitespace-nowrap">{rel.documentNumber}</td>
                                                            <td className="py-1.5 px-2.5 text-slate-700 whitespace-nowrap">{rel.documentName}</td>
                                                            <td className="py-1.5 px-2.5 text-slate-600 whitespace-nowrap">{rel.revisionNumber}</td>
                                                            <td className="py-1.5 px-2.5 text-slate-600 whitespace-nowrap">{rel.type}</td>
                                                            <td className="py-1.5 px-2.5 whitespace-nowrap">
                                                              <StatusBadge status={mapDocumentStatusToStatusType(rel.state)} size="sm" />
                                                            </td>
                                                          </tr>
                                                        ))}
                                                      </tbody>
                                                    </table>
                                                  </div>
                                                </div>
                                              )}

                                              {/* Bảng Correlated Documents */}
                                              {doc.correlatedDocuments && doc.correlatedDocuments.length > 0 && (
                                                <div>
                                                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                                    Correlated Documents ({doc.correlatedDocuments.length})
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
                                                        {doc.correlatedDocuments.map((cor: CorrelatedDocument) => (
                                                          <tr key={cor.id} className="hover:bg-slate-50 transition-colors">
                                                            <td className="py-1.5 px-2.5 font-medium text-emerald-600 whitespace-nowrap">{cor.documentNumber}</td>
                                                            <td className="py-1.5 px-2.5 text-slate-700 whitespace-nowrap">{cor.documentName}</td>
                                                            <td className="py-1.5 px-2.5 text-slate-600 whitespace-nowrap">{cor.revisionNumber}</td>
                                                            <td className="py-1.5 px-2.5 text-slate-600 whitespace-nowrap">{cor.type}</td>
                                                            <td className="py-1.5 px-2.5 whitespace-nowrap">
                                                              <StatusBadge status={mapDocumentStatusToStatusType(cor.state)} size="sm" />
                                                            </td>
                                                            <td className="py-1.5 px-2.5 text-slate-500 whitespace-nowrap">{cor.correlationType ?? "—"}</td>
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
                      onPageChange={setCurrentPage}
                      totalItems={filteredDocuments.length}
                      itemsPerPage={itemsPerPage}
                      onItemsPerPageChange={setItemsPerPage}
                    />
                  </>
                ) : (
                  <TableEmptyState
                    title="No Documents Found"
                    description="We couldn't find any documents matching your filters. Try adjusting your search criteria or clear filters."
                    actionLabel="Clear Filters"
                    onAction={handleClearFilters}
                  />
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};






