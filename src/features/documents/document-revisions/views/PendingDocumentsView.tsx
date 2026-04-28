import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ROUTES } from '@/app/routes.constants';
import {
  ChevronUp,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  History,
  Download,
  X,
  ArrowDownAZ,
  ArrowDownZA,
} from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import { TablePagination } from "@/components/ui/table/TablePagination";
import { TableEmptyState } from "@/components/ui/table/TableEmptyState";
import { StatusBadge as UiStatusBadge, StatusType } from "@/components/ui";
import { cn } from "@/components/ui/utils";
import { mapStatusToStatusType } from "@/utils/status";
import { DocumentFilters } from "@/features/documents/shared/components";
import {
  IconChecks,
  IconEyeCheck,
  IconInfoCircle,
  IconFileExport,
} from "@tabler/icons-react";
import { PageHeader } from "@/components/ui/page/PageHeader";
import { pendingDocuments } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { SectionLoading, FullPageLoading } from "@/components/ui/loading/Loading";
import { usePortalDropdown, useNavigateWithLoading, useTableDragScroll, PortalDropdownPosition } from "@/hooks";
import { useDocumentFilter, useTableSort } from "@/features/documents/hooks";

import type { DocumentType, DocumentStatus } from "@/features/documents/types";
import type { RelatedDocument, CorrelatedDocument } from "@/features/documents/document-revisions/views/types";
import { MOCK_DOCUMENTS as ALL_DOCUMENTS } from "@/features/documents/document-list/mockData";
import { MOCK_REVISIONS as ALL_REVISIONS } from "@/features/documents/document-revisions/views/mockData";

// --- Types ---
type ViewType = "review" | "approval";

interface ReviewerApprover {
  userId: string;
  userName: string;
  status: "Pending" | "Approved" | "Rejected";
}

interface Revision {
  id: string;
  documentNumber: string;
  revisionNumber: string;
  created: string;
  openedBy: string;
  revisionName: string;
  state: DocumentStatus;
  author: string;
  effectiveDate: string;
  validUntil: string;
  documentName: string;
  type: DocumentType;
  businessUnit: string;
  department: string;
  reviewers?: ReviewerApprover[];
  approvers?: ReviewerApprover[];
  hasRelatedDocuments?: boolean;
  hasCorrelatedDocuments?: boolean;
  isTemplate?: boolean;
  relatedDocuments?: RelatedDocument[];
  correlatedDocuments?: CorrelatedDocument[];
}

// --- Mock Data ---
// Current logged-in user (simulated)
const CURRENT_USER = {
  id: "user-001",
  name: "Dr. Sarah Johnson",
  email: "sarah.johnson@company.com",
  department: "Quality Assurance",
};

// Helper to convert Document to Revision format
const convertDocumentToRevision = (doc: any, isReview: boolean): Revision => {
  return {
    id: doc.id,
    documentNumber: doc.documentId,
    revisionNumber: doc.version,
    created: doc.created,
    openedBy: doc.openedBy,
    revisionName: doc.title,
    state: doc.status,
    author: doc.author,
    effectiveDate: doc.effectiveDate,
    validUntil: doc.validUntil,
    documentName: doc.title,
    type: doc.type,
    businessUnit: doc.businessUnit,
    department: doc.department,
    hasRelatedDocuments: doc.hasRelatedDocuments,
    hasCorrelatedDocuments: doc.hasCorrelatedDocuments,
    isTemplate: doc.isTemplate,
    // Assign current user as reviewer/approver for documents with matching status
    ...(isReview
      ? {
        reviewers: [
          {
            userId: CURRENT_USER.id,
            userName: CURRENT_USER.name,
            status: "Pending",
          },
        ],
      }
      : {
        approvers: [
          {
            userId: CURRENT_USER.id,
            userName: CURRENT_USER.name,
            status: "Pending",
          },
        ],
      }),
  };
};

// Helper to ensure Revision has reviewer/approver info
const ensureReviewerApproverInfo = (rev: any, isReview: boolean): Revision => {
  return {
    ...rev,
    ...(isReview
      ? {
        reviewers: rev.reviewers || [
          {
            userId: CURRENT_USER.id,
            userName: CURRENT_USER.name,
            status: "Pending",
          },
        ],
      }
      : {
        approvers: rev.approvers || [
          {
            userId: CURRENT_USER.id,
            userName: CURRENT_USER.name,
            status: "Pending",
          },
        ],
      }),
  };
};

const MOCK_REVIEW_REVISIONS: Revision[] = [
  {
    id: "rev-001",
    documentNumber: "SOP.0002.01",
    revisionNumber: "2.0",
    created: "2026-01-10",
    openedBy: "QA Admin",
    revisionName: "Batch Record Review Procedure Update",
    state: "Pending Review",
    author: "John Doe",
    effectiveDate: "2026-01-20",
    validUntil: "2027-01-20",
    documentName: "Batch Record Review Procedure",
    type: "SOP",
    businessUnit: "Quality",
    department: "Quality Assurance",
    reviewers: [
      { userId: "user-001", userName: "Dr. Sarah Johnson", status: "Pending" },
      { userId: "user-002", userName: "Michael Chen", status: "Pending" },
    ],
    hasRelatedDocuments: true,
    hasCorrelatedDocuments: true,
    relatedDocuments: [
      { id: "rel-pend-001-1", documentNumber: "SOP.0002.00", documentName: "Previous Batch Record Procedure", revisionNumber: "1.0", type: "SOP", state: "Effective" },
      { id: "rel-pend-001-2", documentNumber: "FORM.0002.01", documentName: "Batch Record Form", revisionNumber: "1.0", type: "Form", state: "Effective" },
    ],
    correlatedDocuments: [
      { id: "cor-pend-001-1", documentNumber: "POL.0003.01", documentName: "GMP Compliance Policy", revisionNumber: "2.0", type: "Policy", state: "Effective", correlationType: "Compliance" },
    ],
  },
  {
    id: "rev-002",
    documentNumber: "POL.0001.01",
    revisionNumber: "3.0",
    created: "2026-01-12",
    openedBy: "IT Manager",
    revisionName: "Information Security Policy Revision",
    state: "Pending Review",
    author: "Jane Smith",
    effectiveDate: "2026-02-01",
    validUntil: "2027-02-01",
    documentName: "Information Security Policy",
    type: "Policy",
    businessUnit: "Corporate",
    department: "IT",
    reviewers: [
      { userId: "user-001", userName: "Dr. Sarah Johnson", status: "Pending" },
    ],
    hasRelatedDocuments: true,
    relatedDocuments: [
      { id: "rel-pend-002-1", documentNumber: "POL.0001.00", documentName: "Previous Information Security Policy", revisionNumber: "2.0", type: "Policy", state: "Effective" },
    ],
  },
  {
    id: "rev-003",
    documentNumber: "FORM.0005.01",
    revisionNumber: "1.5",
    created: "2026-01-14",
    openedBy: "QC Supervisor",
    revisionName: "Lab Equipment Calibration Log Update",
    state: "Pending Review",
    author: "Mike Johnson",
    effectiveDate: "2026-01-25",
    validUntil: "2027-01-25",
    documentName: "Lab Equipment Calibration Log",
    type: "Form",
    businessUnit: "Quality",
    department: "Quality Control",
    reviewers: [
      { userId: "user-001", userName: "Dr. Sarah Johnson", status: "Pending" },
      { userId: "user-003", userName: "Emma Williams", status: "Pending" },
    ],
  },
  // Revision not assigned to current user (should be filtered out)
  {
    id: "rev-007",
    documentNumber: "SOP.0010.01",
    revisionNumber: "1.0",
    created: "2026-01-13",
    openedBy: "Admin",
    revisionName: "Other Department Procedure",
    state: "Pending Review",
    author: "Other Author",
    effectiveDate: "2026-02-15",
    validUntil: "2027-02-15",
    documentName: "Other Department Document",
    type: "SOP",
    businessUnit: "Operations",
    department: "Production",
    reviewers: [
      { userId: "user-999", userName: "Other Reviewer", status: "Pending" },
    ],
  },
];

const MOCK_APPROVAL_REVISIONS: Revision[] = [
  {
    id: "rev-004",
    documentNumber: "SOP.0003.01",
    revisionNumber: "4.0",
    created: "2026-01-08",
    openedBy: "Production Manager",
    revisionName: "Production Line Setup Revision",
    state: "Pending Approval",
    author: "Robert Brown",
    effectiveDate: "2026-02-01",
    validUntil: "2027-02-01",
    documentName: "Production Line Setup",
    type: "SOP",
    businessUnit: "Operations",
    department: "Production",
    approvers: [
      { userId: "user-001", userName: "Dr. Sarah Johnson", status: "Pending" },
      { userId: "user-004", userName: "John Davis", status: "Pending" },
    ],
    hasRelatedDocuments: true,
    hasCorrelatedDocuments: true,
    relatedDocuments: [
      { id: "rel-pend-004-1", documentNumber: "SOP.0003.00", documentName: "Previous Production Setup SOP", revisionNumber: "3.0", type: "SOP", state: "Effective" },
    ],
    correlatedDocuments: [
      { id: "cor-pend-004-1", documentNumber: "FORM.0010.01", documentName: "Production Line Checklist", revisionNumber: "1.0", type: "Form", state: "Effective", correlationType: "Reference" },
      { id: "cor-pend-004-2", documentNumber: "SPEC.0020.01", documentName: "Equipment Specification", revisionNumber: "2.0", type: "Specification", state: "Approved", correlationType: "Compliance" },
    ],
  },
  {
    id: "rev-005",
    documentNumber: "REP.0002.01",
    revisionNumber: "1.0",
    created: "2026-01-09",
    openedBy: "Validation Specialist",
    revisionName: "Autoclave Validation Report",
    state: "Pending Approval",
    author: "Emily Davis",
    effectiveDate: "2026-02-05",
    validUntil: "2027-02-05",
    documentName: "Validation Report for Autoclave",
    type: "Report",
    businessUnit: "Research",
    department: "Validation",
    approvers: [
      { userId: "user-001", userName: "Dr. Sarah Johnson", status: "Pending" },
    ],
  },
  {
    id: "rev-006",
    documentNumber: "SPEC.0001.01",
    revisionNumber: "2.5",
    created: "2026-01-11",
    openedBy: "QC Manager",
    revisionName: "Sodium Chloride Specification Update",
    state: "Pending Approval",
    author: "David Wilson",
    effectiveDate: "2026-02-10",
    validUntil: "2027-02-10",
    documentName: "Raw Material Specification: Sodium Chloride",
    type: "Specification",
    businessUnit: "Quality",
    department: "Quality Control",
    approvers: [
      { userId: "user-001", userName: "Dr. Sarah Johnson", status: "Pending" },
      { userId: "user-005", userName: "Dr. Lisa Park", status: "Pending" },
    ],
  },
  // Revision not assigned to current user (should be filtered out)
  {
    id: "rev-008",
    documentNumber: "POL.0020.01",
    revisionNumber: "2.0",
    created: "2026-01-12",
    openedBy: "Admin",
    revisionName: "Other Policy Revision",
    state: "Pending Approval",
    author: "Other Author",
    effectiveDate: "2026-03-01",
    validUntil: "2027-03-01",
    documentName: "Other Policy Document",
    type: "Policy",
    businessUnit: "Corporate",
    department: "HR",
    approvers: [
      { userId: "user-888", userName: "Other Approver", status: "Pending" },
    ],
  },
];

// --- Helper Components ---

const DropdownMenu: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  position: PortalDropdownPosition;
  onAction: (action: string) => void;
  viewType: ViewType;
}> = ({ isOpen, onClose, position, onAction, viewType }) => {
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
        className="absolute z-50 min-w-[160px] w-[200px] max-w-[90vw] max-h-[300px] overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-200"
        style={position.style}
      >
        <div className="py-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAction("view");
              onClose();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors"
          >
            <IconInfoCircle className="h-4 w-4 flex-shrink-0" />
            <span className="font-medium">View Details</span>
          </button>
          {viewType === "review" ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAction("review");
                onClose();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors"
            >
              <IconEyeCheck className="h-4 w-4 flex-shrink-0" />
              <span className="font-medium">Review Revision</span>
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAction("approve");
                onClose();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors"
            >
              <IconChecks className="h-4 w-4 flex-shrink-0" />
              <span className="font-medium">Approve Revision</span>
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAction("audit");
              onClose();
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
};

// --- Main Component ---

interface PendingDocumentsViewProps {
  viewType: ViewType;
  onViewDocument?: (documentId: string) => void;
}

export const PendingDocumentsView: React.FC<PendingDocumentsViewProps> = ({
  viewType,
  onViewDocument,
}) => {
  const { navigateTo, isNavigating } = useNavigateWithLoading();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<DocumentType | "All">("All");
  const [businessUnitFilter, setBusinessUnitFilter] = useState<string>("All");
  const [departmentFilter, setDepartmentFilter] = useState<string>("All");
  // Author filter is always set to current user for pending views
  const [authorFilter, setAuthorFilter] = useState<string>(CURRENT_USER.name);
  const [createdFromDate, setCreatedFromDate] = useState<string>("");
  const [createdToDate, setCreatedToDate] = useState<string>("");
  const [effectiveFromDate, setEffectiveFromDate] = useState<string>("");
  const [effectiveToDate, setEffectiveToDate] = useState<string>("");
  const [validFromDate, setValidFromDate] = useState<string>("");
  const [validToDate, setValidToDate] = useState<string>("");
  const [relatedDocumentFilter, setRelatedDocumentFilter] = useState("All");
  const [correlatedDocumentFilter, setCorrelatedDocumentFilter] = useState("All");
  const [templateFilter, setTemplateFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "revisionName",
    direction: "asc",
  });

  const { openId, position, getRef, toggle, close } = usePortalDropdown();
  const { scrollerRef, isDragging, dragEvents } = useTableDragScroll();

  const handleClearFilters = () => {
    setSearchQuery("");
    setTypeFilter("All");
    setBusinessUnitFilter("All");
    setDepartmentFilter("All");
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

  // Get config based on viewType
  const config = useMemo(() => {
    const isReview = viewType === "review";
    const targetStatus = isReview ? "Pending Review" : "Pending Approval";

    // Get all revisions from All Revisions view with target status
    const revisionsFromAllRevisions = ALL_REVISIONS.filter(
      (rev) => rev.state === targetStatus,
    ).map((rev) => ensureReviewerApproverInfo(rev, isReview));

    // Get all documents from All Documents view with target status and convert to Revision format
    const documentsAsRevisions = ALL_DOCUMENTS.filter(
      (doc) => doc.status === targetStatus,
    ).map((doc) => convertDocumentToRevision(doc, isReview));

    // Combine with existing mock data
    const existingMockData = isReview
      ? MOCK_REVIEW_REVISIONS
      : MOCK_APPROVAL_REVISIONS;

    // Merge all sources (deduplicate by id)
    const allRevisions = [
      ...existingMockData,
      ...revisionsFromAllRevisions,
      ...documentsAsRevisions,
    ];
    const uniqueRevisions = Array.from(
      new Map(allRevisions.map((item) => [item.id, item])).values(),
    );

    switch (viewType) {
      case "review":
        return {
          title: "Pending My Review",
          breadcrumbLast: "Pending My Review",
          statusFilter: "Pending Review" as DocumentStatus,
          revisions: uniqueRevisions,
        };
      case "approval":
        return {
          title: "Pending My Approval",
          breadcrumbLast: "Pending My Approval",
          statusFilter: "Pending Approval" as DocumentStatus,
          revisions: uniqueRevisions,
        };
      default:
        return {
          title: "Pending Documents",
          breadcrumbLast: "Pending Documents",
          statusFilter: "Pending Review" as DocumentStatus,
          revisions: [],
        };
    }
  }, [viewType]);

  // First filter for revisions assigned to current user
  const assignedRevisions = useMemo(() => {
    return config.revisions.filter((rev) => {
      return viewType === "review"
        ? rev.reviewers?.some(
            (r) => r.userId === CURRENT_USER.id && r.status === "Pending",
          )
        : rev.approvers?.some(
            (a) => a.userId === CURRENT_USER.id && a.status === "Pending",
          );
    });
  }, [config.revisions, viewType]);

  // Apply user filters using reusable hook
  const filteredData = useDocumentFilter(assignedRevisions, {
    searchFields: ['documentName', 'revisionName', 'documentNumber', 'author', 'department', 'openedBy'] as (keyof Revision)[],
    searchQuery,
    filters: {
      status: config.statusFilter, // Fixed status based on viewType
      type: typeFilter,
      businessUnit: businessUnitFilter,
      department: departmentFilter,
      author: "All", // Not filtering by author in this view
      createdFromDate,
      createdToDate,
      effectiveFromDate,
      effectiveToDate,
      validFromDate,
      validToDate,
      relatedDocument: relatedDocumentFilter,
      correlatedDocument: correlatedDocumentFilter,
      template: templateFilter,
    },
  });

  // Sort data using reusable hook
  const filteredRevisions = useTableSort(filteredData, {
    sortConfig,
    dateFields: ['created', 'effectiveDate', 'validUntil'],
  });

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
    typeFilter,
    departmentFilter,
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
    viewType,
    businessUnitFilter,
  ]);

  const totalPages = Math.ceil(filteredRevisions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentRevisions = useMemo(() => {
    return filteredRevisions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRevisions, startIndex, itemsPerPage]);

  const handleAction = (action: string) => {
    if (!openId) return;

    close();

    switch (action) {
      case "view":
        onViewDocument?.(openId);
        break;
      case "review":
        navigateTo(ROUTES.DOCUMENTS.REVISIONS.REVIEW(openId));
        break;
      case "approve":
        navigateTo(ROUTES.DOCUMENTS.REVISIONS.APPROVAL(openId));
        break;
      case "audit":
        navigateTo(`${ROUTES.DOCUMENTS.REVISIONS.DETAIL(openId)}?tab=audit`);
        break;
    }
  };

  return (
    <div className="space-y-6 w-full flex-1 flex flex-col">
      {isNavigating && <FullPageLoading text="Loading..." />}
      {/* Header: Title + Breadcrumb */}
      <div className="flex flex-col gap-4">
        <PageHeader
          title={config.title}
          breadcrumbItems={pendingDocuments(navigateTo, `pending-${viewType}`)}
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
        <div className="p-4 md:p-5 flex flex-col">
          <div className="px-1.5 -mx-1.5 pb-1.5 -mb-1.5">
            <DocumentFilters
                    showCard={false}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    statusFilter={config.statusFilter}
                    onStatusChange={() => { }} // No-op since disabled
                    typeFilter={typeFilter}
                    onTypeChange={setTypeFilter}
                    businessUnitFilter={businessUnitFilter}
                    onBusinessUnitChange={setBusinessUnitFilter}
                    departmentFilter={departmentFilter}
                    onDepartmentChange={setDepartmentFilter}
                    authorFilter={authorFilter}
                    onAuthorChange={setAuthorFilter}
                    createdFromDate={createdFromDate}
                    onCreatedFromDateChange={setCreatedFromDate}
                    createdToDate={createdToDate}
                    onCreatedToDateChange={setCreatedToDate}
                    effectiveFromDate={effectiveFromDate}
                    onEffectiveFromDateChange={setEffectiveFromDate}
                    effectiveToDate={effectiveToDate}
                    onEffectiveToDateChange={setEffectiveToDate}
                    validFromDate={validFromDate}
                    onValidFromDateChange={setValidFromDate}
                    validToDate={validToDate}
                    onValidToDateChange={setValidToDate}
                    disableStatusFilter={true}
                    authorFilterDisabled={true}
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
            "border border-slate-200 rounded-xl overflow-hidden flex flex-col flex-1 bg-white transition-all duration-300",
            isTableLoading && "blur-[2px] opacity-80"
          )}>
            {currentRevisions.length > 0 ? (
              <>
                {/* Table with Horizontal Scroll */}
                <div
                  ref={scrollerRef}
                  className={cn(
                    "flex-1 overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-50 hover:scrollbar-thumb-slate-400"
                  )}
                  {...dragEvents}
                >
                  <table className="w-full min-w-max border-separate border-spacing-0 text-left">
                    <thead>
                      <tr>
                        {[
                          { label: "", id: "expander", width: "w-8 md:w-10" },
                          { label: "No.", id: "no" },
                          { label: "Document Number", id: "documentNumber", sortable: true },
                          { label: "Revision Number", id: "revisionNumber", sortable: true },
                          { label: "Created", id: "created", sortable: true },
                          { label: "Opened By", id: "openedBy", sortable: true },
                          { label: "Revision Name", id: "revisionName", sortable: true },
                          { label: "State", id: "state", sortable: true },
                          { label: "Document Name", id: "documentName", sortable: true },
                          { label: "Document Type", id: "type", sortable: true },
                          { label: "Related Document", id: "relatedDocument", align: "text-center" },
                          { label: "Correlated Document", id: "correlatedDocument", align: "text-center" },
                          { label: "Template", id: "template", align: "text-center" },
                          { label: "Business Unit", id: "businessUnit", sortable: true },
                          { label: "Department", id: "department", sortable: true },
                          { label: "Author", id: "author", sortable: true },
                          { label: "Effective Date", id: "effectiveDate", sortable: true },
                          { label: "Valid Until", id: "validUntil", sortable: true }
                        ].map((col, idx) => {
                          const isSorted = sortConfig.key === col.id;
                          const canSort = col.sortable;

                          return (
                            <th
                              key={idx}
                              onClick={canSort ? () => handleSort(col.id!) : undefined}
                              className={cn(
                                "sticky top-0 z-20 bg-slate-50 py-3 px-4 text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 whitespace-nowrap transition-colors",
                                canSort && "cursor-pointer hover:bg-slate-100 hover:text-slate-700 group",
                                col.width,
                                col.align || "text-left"
                              )}
                            >
                              <div className="flex items-center justify-between gap-2 w-full">
                                <span className="truncate">{col.label}</span>
                                {canSort && (
                                  <div className="flex flex-col text-slate-500 flex-shrink-0 group-hover:text-slate-700 transition-colors">
                                    <ChevronUp className={cn("h-3 w-3 -mb-1", isSorted && sortConfig.direction === 'asc' ? "text-emerald-600" : "")} />
                                    <ChevronDown className={cn("h-3 w-3", isSorted && sortConfig.direction === 'desc' ? "text-emerald-600" : "")} />
                                  </div>
                                )}
                              </div>
                            </th>
                          );
                        })}
                        {/* Cột Action Sticky */}
                        <th className="sticky top-0 right-0 z-30 bg-slate-50 py-3 px-4 text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center whitespace-nowrap border-b-2 border-slate-200 before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-slate-200 shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.05)]">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {currentRevisions.map((rev, index) => {
                        const isExpanded = expandedRowId === rev.id;
                        const hasDocs = rev.hasRelatedDocuments || rev.hasCorrelatedDocuments;
                        const tdClass = "py-3 px-4 text-xs md:text-sm text-slate-700 border-b border-slate-200 whitespace-nowrap";

                        return (
                          <React.Fragment key={rev.id}>
                            <tr
                              className="hover:bg-slate-50/80 transition-colors group"
                            >
                              <td className="py-3 px-4 border-b border-slate-200 whitespace-nowrap" onClick={(e) => {
                                e.stopPropagation();
                                if (hasDocs) setExpandedRowId(isExpanded ? null : rev.id);
                              }}>
                                {hasDocs && (
                                  <button className="flex items-center justify-center h-5 w-5 md:h-6 md:w-6 rounded-lg hover:bg-slate-200 transition-colors">
                                    <ChevronRight className={cn("h-3.5 w-3.5 md:h-4 md:w-4 text-slate-500 transition-transform duration-200", isExpanded && "rotate-90")} />
                                  </button>
                                )}
                              </td>
                              <td className={tdClass}>{startIndex + index + 1}</td>
                              <td
                                onClick={() => (viewType === 'review' ? navigateTo(ROUTES.DOCUMENTS.REVISIONS.REVIEW(rev.id)) : navigateTo(ROUTES.DOCUMENTS.REVISIONS.APPROVAL(rev.id)))}
                                className={cn(tdClass, "cursor-pointer")}
                              >
                                <span className="font-medium text-emerald-600 hover:underline">
                                  {rev.documentNumber}
                                </span>
                              </td>
                              <td className={tdClass}>{rev.revisionNumber}</td>
                              <td className={tdClass}>{rev.created}</td>
                              <td className={tdClass}>{rev.openedBy}</td>
                              <td className={tdClass}>
                                <span className="font-medium text-slate-900">
                                  {rev.revisionName}
                                </span>
                              </td>
                              <td className={tdClass}>
                                <UiStatusBadge status={mapStatusToStatusType(rev.state) as StatusType} />
                              </td>
                              <td className={cn(tdClass, "text-slate-600")}>{rev.documentName}</td>
                              <td className={tdClass}>{rev.type}</td>
                              <td className={cn(tdClass, "text-center")}>
                                {rev.hasRelatedDocuments ? (
                                  <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">Yes</span>
                                ) : (
                                  <span className="text-slate-600 font-medium">No</span>
                                )}
                              </td>
                              <td className={cn(tdClass, "text-center")}>
                                {rev.hasCorrelatedDocuments ? (
                                  <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">Yes</span>
                                ) : (
                                  <span className="text-slate-600 font-medium">No</span>
                                )}
                              </td>
                              <td className={cn(tdClass, "text-center")}>
                                {rev.isTemplate ? (
                                  <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">Yes</span>
                                ) : (
                                  <span className="text-slate-600 font-medium">No</span>
                                )}
                              </td>
                              <td className={tdClass}>{rev.businessUnit}</td>
                              <td className={tdClass}>{rev.department}</td>
                              <td className={tdClass}>{rev.author}</td>
                              <td className={tdClass}>{rev.effectiveDate}</td>
                              <td className={tdClass}>{rev.validUntil}</td>
                              <td
                                onClick={(e) => e.stopPropagation()}
                                className="sticky right-0 z-10 bg-white border-b border-slate-200 py-3 px-4 text-center whitespace-nowrap before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-slate-200 shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.05)] group-hover:bg-slate-50 transition-colors"
                              >
                                <button
                                  ref={getRef(rev.id)}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggle(rev.id, e);
                                  }}
                                  className="inline-flex items-center justify-center h-7 w-7 md:h-8 md:w-8 rounded-lg hover:bg-slate-100 transition-colors"
                                >
                                  <MoreVertical className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                </button>
                              </td>
                            </tr>
                            <AnimatePresence initial={false}>
                              {isExpanded && hasDocs && (
                                <tr className="bg-slate-50/50">
                                  <td colSpan={18} className="p-0 border-b border-slate-200">
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="px-4 py-3">
                                        <div className="ml-9 flex flex-wrap gap-6">
                                          {rev.relatedDocuments && rev.relatedDocuments.length > 0 && (
                                            <div>
                                              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                                Related Documents ({rev.relatedDocuments.length})
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
                                                    {rev.relatedDocuments.map((doc: RelatedDocument) => (
                                                      <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="py-1.5 px-2.5 font-medium text-emerald-600 whitespace-nowrap">{doc.documentNumber}</td>
                                                        <td className="py-1.5 px-2.5 text-slate-700 whitespace-nowrap">{doc.documentName}</td>
                                                        <td className="py-1.5 px-2.5 text-slate-600 whitespace-nowrap">{doc.revisionNumber}</td>
                                                        <td className="py-1.5 px-2.5 text-slate-600 whitespace-nowrap">{doc.type}</td>
                                                        <td className="py-1.5 px-2.5 whitespace-nowrap">
                                                          <UiStatusBadge status={mapStatusToStatusType(doc.state) as StatusType} />
                                                        </td>
                                                      </tr>
                                                    ))}
                                                  </tbody>
                                                </table>
                                              </div>
                                            </div>
                                          )}
                                          {rev.correlatedDocuments && rev.correlatedDocuments.length > 0 && (
                                            <div>
                                              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                                Correlated Documents ({rev.correlatedDocuments.length})
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
                                                    {rev.correlatedDocuments.map((doc: CorrelatedDocument) => (
                                                      <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="py-1.5 px-2.5 font-medium text-emerald-600 whitespace-nowrap">{doc.documentNumber}</td>
                                                        <td className="py-1.5 px-2.5 text-slate-700 whitespace-nowrap">{doc.documentName}</td>
                                                        <td className="py-1.5 px-2.5 text-slate-600 whitespace-nowrap">{doc.revisionNumber}</td>
                                                        <td className="py-1.5 px-2.5 text-slate-600 whitespace-nowrap">{doc.type}</td>
                                                        <td className="py-1.5 px-2.5 whitespace-nowrap">
                                                          <UiStatusBadge status={mapStatusToStatusType(doc.state) as StatusType} />
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
                title="No Pending Documents Found"
                description={`We couldn't find any documents pending your ${viewType} matching these filters.`}
                actionLabel="Clear Filters"
                onAction={handleClearFilters}
              />
            )}
          </div>
        </div>
      </div>
      {/* Dropdown Menu */}
      <DropdownMenu
        isOpen={!!openId}
        onClose={close}
        position={position}
        onAction={handleAction}
        viewType={viewType}
      />
    </div>
  );
};




