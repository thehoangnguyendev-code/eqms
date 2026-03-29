import React, { useState, useMemo, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ROUTES } from '@/app/routes.constants';
import { createPortal } from "react-dom";
import {
  ChevronRight,
  MoreVertical,
  Download,
  History,
  Link2,
  SquarePen,
  Search,
  ArrowDownAZ,
  ArrowDownZA,
  X,
  SlidersHorizontal,
} from "lucide-react";
import {
  IconInfoCircle,
  IconEyeCheck,
  IconChecks,
  IconPlus,
} from "@tabler/icons-react";
import { Breadcrumb } from "@/components/ui/breadcrumb/Breadcrumb";
import { documentList } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { Button } from "@/components/ui/button/Button";
import { StatusBadge, StatusType } from "@/components/ui";
import { TablePagination } from "@/components/ui/table/TablePagination";
import { TableEmptyState } from "@/components/ui/table/TableEmptyState";
import { SectionLoading, FullPageLoading } from "@/components/ui/loading/Loading";
import { cn } from "@/components/ui/utils";
import { formatDateUS } from "@/utils/format";
import { getDocumentTypeColorClass } from "@/utils/status";
import { DocumentFilters } from "./../shared/components/DocumentFilters";
import { DetailDocumentView } from "../document-detail/DetailDocumentView";
import { CreateLinkModal } from "./../shared/components/CreateLinkModal";
import { usePortalDropdown, useNavigateWithLoading } from "@/hooks";

import type { DocumentType, DocumentStatus } from "@/features/documents/types";

import { MOCK_DOCUMENTS, CURRENT_USER } from './mockData';
import type { Document, RelatedDocument, CorrelatedDocument } from './mockData';

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
  position: { top: number; left: number; showAbove?: boolean };
  onViewDocument?: (documentId: string, tab?: string) => void;
  onNavigateTo: (to: string) => void;
  onCreateLink?: (document: Document) => void;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  document,
  isOpen,
  onClose,
  position,
  onViewDocument,
  onNavigateTo,
  onCreateLink,
}) => {
  if (!isOpen) return null;

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

    // Always available: Create Shareable Link
    items.push({
      icon: Link2,
      label: "Create Shareable Link",
      onClick: () => {
        onCreateLink?.(document);
        onClose();
      },
      color: "text-slate-500"
    });

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
        className="fixed z-50 min-w-[160px] w-[200px] max-w-[90vw] max-h-[300px] overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-200"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          transform: position.showAbove ? 'translateY(-100%)' : 'none'
        }}
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
  const [isCreateLinkModalOpen, setIsCreateLinkModalOpen] = useState(false);
  const [selectedDocumentForLink, setSelectedDocumentForLink] = useState<Document | null>(null);
  const [isLocalNavigating, setIsLocalNavigating] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isDragging, setIsDragging] = useState(false);

  const tableScrollerRef = useRef<HTMLDivElement | null>(null);
  const dragStartX = useRef(0);
  const scrollStartLeft = useRef(0);
  const dragMoved = useRef(false);

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

  const handleCreateLink = (document: Document) => {
    setSelectedDocumentForLink(document);
    setIsCreateLinkModalOpen(true);
  };

  const handleDragMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    dragMoved.current = false;
    dragStartX.current = e.clientX;
    scrollStartLeft.current = tableScrollerRef.current?.scrollLeft ?? 0;
    setIsDragging(true);
  };

  const handleDragMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !tableScrollerRef.current) return;
    const deltaX = e.clientX - dragStartX.current;
    if (Math.abs(deltaX) > 5) {
      dragMoved.current = true;
    }
    tableScrollerRef.current.scrollLeft = scrollStartLeft.current - deltaX;
  };

  const stopDrag = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  const handleScrollClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragMoved.current) {
      dragMoved.current = false;
      e.preventDefault();
      e.stopPropagation();
    }
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
      const fieldA = a.title.toLowerCase();
      const fieldB = b.title.toLowerCase();
      if (sortOrder === "asc") return fieldA > fieldB ? 1 : -1;
      return fieldA < fieldB ? 1 : -1;
    });
  }, [searchQuery, statusFilter, typeFilter, departmentFilter, authorFilter, versionFilter,
    createdFromDate, createdToDate, effectiveFromDate, effectiveToDate, validFromDate, validToDate,
    relatedDocumentFilter, correlatedDocumentFilter, templateFilter, config, sortOrder, businessUnitFilter]);

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
      <div className="flex flex-row flex-wrap items-end justify-between gap-3 md:gap-4">
        <div className="min-w-[200px] flex-1">
          <h1 className="text-lg md:text-xl lg:text-2xl font-bold tracking-tight text-slate-900">
            {config.title}
          </h1>
          <Breadcrumb items={documentList(navigateTo, viewType === "owned-by-me" ? "owned" : undefined)} />
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
        </div>
      </div>

      {isLoading ? (
        <FullPageLoading text="Loading documents..." />
      ) : (
        <>
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
                      placeholder="Search documents..."
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
                      <>
                        <ArrowDownAZ className="h-4 w-4 text-emerald-600" />
                      </>
                    ) : (
                      <>
                        <ArrowDownZA className="h-4 w-4 text-emerald-600" />
                      </>
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
                {paginatedDocuments.length > 0 ? (
                  <>
                    <div
                      ref={tableScrollerRef}
                      className="overflow-x-auto overflow-y-hidden cursor-grab"
                      style={{ WebkitOverflowScrolling: 'touch', cursor: isDragging ? 'grabbing' : 'grab' }}
                      onMouseDown={handleDragMouseDown}
                      onMouseMove={handleDragMouseMove}
                      onMouseUp={stopDrag}
                      onMouseLeave={stopDrag}
                      onClickCapture={handleScrollClickCapture}
                    >
                      <table className="w-full min-w-max">
                        <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-30">
                          <tr>
                            <th className="py-2.5 px-2 sm:py-3.5 sm:px-3 w-9 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap"></th>
                            {visibleColumns.map(col => (
                              <th
                                key={col.id}
                                className={cn(
                                  "py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap",
                                  col.id === 'action' && "sticky right-0 bg-slate-50 text-center z-[1] shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.05)] before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-200"
                                )}
                              >
                                {col.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                          {paginatedDocuments.map((doc, index) => {
                            const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                            return (
                              <React.Fragment key={doc.id}>
                                <tr className="hover:bg-slate-50/80 transition-colors group">
                                  <td className="py-2 px-2 sm:py-3.5 sm:px-3 w-9 whitespace-nowrap"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (doc.hasRelatedDocuments || doc.hasCorrelatedDocuments) {
                                        setExpandedRowId(expandedRowId === doc.id ? null : doc.id);
                                      }
                                    }}
                                  >
                                    {doc.hasRelatedDocuments || doc.hasCorrelatedDocuments ? (
                                      <button
                                        className="inline-flex items-center justify-center h-6 w-6 rounded-md hover:bg-slate-200 transition-colors"
                                        aria-label={expandedRowId === doc.id ? "Collapse documents" : "Expand documents"}
                                      >
                                        <ChevronRight className={cn("h-3.5 w-3.5 text-slate-500 transition-transform duration-200", expandedRowId === doc.id && "rotate-90")} />
                                      </button>
                                    ) : (
                                      <span className="inline-flex h-6 w-6" />
                                    )}
                                  </td>
                                  {visibleColumns.map(col => {
                                    if (col.id === 'no') {
                                      return (
                                        <td key={col.id} className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-700">
                                          {globalIndex}
                                        </td>
                                      );
                                    }
                                    if (col.id === 'documentId') {
                                      return (
                                        <td key={col.id} className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleViewDocument(doc.id);
                                            }}
                                            className="font-medium text-emerald-600 hover:underline transition-colors"
                                          >
                                            {doc.documentId}
                                          </button>
                                        </td>
                                      );
                                    }
                                    if (col.id === 'created') {
                                      return (
                                        <td key={col.id} className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-600">
                                          {formatDateUS(doc.created)}
                                        </td>
                                      );
                                    }
                                    if (col.id === 'openedBy') {
                                      return (
                                        <td key={col.id} className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-600">
                                          {doc.openedBy}
                                        </td>
                                      );
                                    }
                                    if (col.id === 'title') {
                                      return (
                                        <td key={col.id} className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                                          <div className="font-medium text-slate-900">
                                            {doc.title}
                                          </div>
                                        </td>
                                      );
                                    }
                                    if (col.id === 'status') {
                                      return (
                                        <td key={col.id} className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                                          <StatusBadge status={mapDocumentStatusToStatusType(doc.status)} />
                                        </td>
                                      );
                                    }
                                    if (col.id === 'type') {
                                      return (
                                        <td key={col.id} className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                                          <span className={cn(
                                            "inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border",
                                            getDocumentTypeColorClass(doc.type)
                                          )}>
                                            {doc.type}
                                          </span>
                                        </td>
                                      );
                                    }
                                    if (col.id === 'relatedDocuments' && config.showRelatedDocumentsColumn) {
                                      return (
                                        <td key={col.id} className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-center">
                                          {doc.hasRelatedDocuments ? (
                                            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                                              Yes
                                            </span>
                                          ) : (
                                            <span className="text-slate-600 font-medium">No</span>
                                          )}
                                        </td>
                                      );
                                    }
                                    if (col.id === 'correlatedDocuments') {
                                      return (
                                        <td key={col.id} className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-center">
                                          {doc.hasCorrelatedDocuments ? (
                                            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                                              Yes
                                            </span>
                                          ) : (
                                            <span className="text-slate-600 font-medium">No</span>
                                          )}
                                        </td>
                                      );
                                    }
                                    if (col.id === 'template') {
                                      return (
                                        <td key={col.id} className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-center">
                                          {doc.isTemplate ? (
                                            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">Yes</span>
                                          ) : (
                                            <span className="text-slate-600 font-medium">No</span>
                                          )}
                                        </td>
                                      );
                                    }
                                    if (col.id === 'businessUnit') {
                                      return (
                                        <td key={col.id} className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-600">
                                          {doc.businessUnit}
                                        </td>
                                      );
                                    }
                                    if (col.id === 'department') {
                                      return (
                                        <td key={col.id} className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-600">
                                          {doc.department}
                                        </td>
                                      );
                                    }
                                    if (col.id === 'author') {
                                      return (
                                        <td key={col.id} className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-600">
                                          {doc.author}
                                        </td>
                                      );
                                    }
                                    if (col.id === 'effectiveDate') {
                                      return (
                                        <td key={col.id} className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-600">
                                          {formatDateUS(doc.effectiveDate)}
                                        </td>
                                      );
                                    }
                                    if (col.id === 'validUntil') {
                                      return (
                                        <td key={col.id} className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-600">
                                          {formatDateUS(doc.validUntil)}
                                        </td>
                                      );
                                    }
                                    if (col.id === 'action') {
                                      return (
                                        <td
                                          key={col.id}
                                          onClick={(e) => e.stopPropagation()}
                                          className="sticky right-0 bg-white py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-center z-30 whitespace-nowrap before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-200 shadow-[-8px_0_16px_-2px_rgba(0,0,0,0.12)] group-hover:bg-slate-50"
                                        >
                                          <button
                                            ref={getRef(doc.id)}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggle(doc.id, e);
                                            }}
                                            className="inline-flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-lg hover:bg-slate-100 transition-colors"
                                          >
                                            <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-600" />
                                          </button>
                                          <DropdownMenu
                                            document={doc}
                                            triggerRef={getRef(doc.id)}
                                            isOpen={openId === doc.id}
                                            onClose={close}
                                            position={position}
                                            onViewDocument={handleViewDocument}
                                            onNavigateTo={navigateTo}
                                            onCreateLink={handleCreateLink}
                                          />
                                        </td>
                                      );
                                    }
                                    return null;
                                  })}
                                </tr>
                                {(doc.hasRelatedDocuments || doc.hasCorrelatedDocuments) &&
                                  ((doc.relatedDocuments?.length ?? 0) > 0 || (doc.correlatedDocuments?.length ?? 0) > 0) && (
                                    <tr>
                                      <td colSpan={visibleColumns.length} className="p-0 border-0">
                                        <div
                                          className={cn("grid", expandedRowId === doc.id ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
                                          style={{ transition: 'grid-template-rows 300ms cubic-bezier(0.4, 0, 0.2, 1)' }}
                                        >
                                          <div className="overflow-hidden px-1.5 -mx-1.5 pb-1.5 -mb-1.5">
                                            <div className={cn("bg-slate-50/60 border-b border-slate-200 px-4 py-2 transition-opacity duration-200", expandedRowId === doc.id ? "opacity-100" : "opacity-0")}>
                                              <div className="ml-9 flex flex-wrap gap-6">
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
                                                              <td className="py-1.5 px-2.5 text-slate-500 whitespace-nowrap">{cor.correlationType ?? "�"}</td>
                                                            </tr>
                                                          ))}
                                                        </tbody>
                                                      </table>
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="p-0 border-0 sticky right-0 z-30 bg-white before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-200 shadow-[-8px_0_16px_-2px_rgba(0,0,0,0.12)]">
                                        <div
                                          className={cn("grid", expandedRowId === doc.id ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
                                          style={{ transition: 'grid-template-rows 300ms cubic-bezier(0.4, 0, 0.2, 1)' }}
                                        >
                                          <div className="overflow-hidden px-1.5 -mx-1.5 pb-1.5 -mb-1.5">
                                            <div className="bg-slate-50/60 border-b border-slate-200 h-full w-full" />
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
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

      {/* Create Shareable Link Modal */}
      {selectedDocumentForLink && (
        <CreateLinkModal
          isOpen={isCreateLinkModalOpen}
          onClose={() => {
            setIsCreateLinkModalOpen(false);
            setSelectedDocumentForLink(null);
          }}
          documentId={selectedDocumentForLink.documentId}
          documentTitle={selectedDocumentForLink.title}
        />
      )}
    </div>
  );
};






