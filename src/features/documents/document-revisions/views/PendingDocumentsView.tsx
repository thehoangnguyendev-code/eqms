import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ROUTES } from '@/app/routes.constants';
import {
  ChevronRight,
  MoreVertical,
  History,
  Download,
  Search,
  SlidersHorizontal,
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
import { Breadcrumb } from "@/components/ui/breadcrumb/Breadcrumb";
import { pendingDocuments } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { SectionLoading, FullPageLoading } from "@/components/ui/loading/Loading";
import { usePortalDropdown, useNavigateWithLoading } from "@/hooks";

import type { DocumentType, DocumentStatus } from "@/features/documents/types";
import type { RelatedDocument, CorrelatedDocument } from "@/features/documents/document-revisions/views/mockData";
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
  position: { top: number; left: number; showAbove?: boolean };
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
              onAction("history");
              onClose();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors"
          >
            <History className="h-4 w-4 flex-shrink-0" />
            <span className="font-medium">History</span>
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
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const { openId, position, getRef, toggle, close } = usePortalDropdown();

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

  // Filter revisions - only show revisions assigned to current user
  const filteredRevisions = useMemo(() => {
    const filtered = config.revisions.filter((rev) => {
      // First check if current user is assigned as reviewer/approver
      const isAssignedToCurrentUser =
        viewType === "review"
          ? rev.reviewers?.some(
            (r) => r.userId === CURRENT_USER.id && r.status === "Pending",
          )
          : rev.approvers?.some(
            (a) => a.userId === CURRENT_USER.id && a.status === "Pending",
          );

      if (!isAssignedToCurrentUser) return false;

      const matchesSearch =
        rev.documentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rev.revisionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rev.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rev.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rev.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rev.openedBy.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = rev.state === config.statusFilter;
      const matchesType = typeFilter === "All" || rev.type === typeFilter;
      const matchesBusinessUnit = businessUnitFilter === "All" || rev.businessUnit === businessUnitFilter;
      const matchesDepartment =
        departmentFilter === "All" || rev.department === departmentFilter;

      // Date filtering
      let matchesCreatedFrom = true;
      let matchesCreatedTo = true;
      if (createdFromDate) {
        const parts = createdFromDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (parts) {
          const from = new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]), 0, 0, 0);
          matchesCreatedFrom = new Date(rev.created) >= from;
        }
      }
      if (createdToDate) {
        const parts = createdToDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (parts) {
          const to = new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]), 23, 59, 59);
          matchesCreatedTo = new Date(rev.created) <= to;
        }
      }

      let matchesEffectiveFrom = true;
      let matchesEffectiveTo = true;
      if (effectiveFromDate) {
        const parts = effectiveFromDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (parts) {
          const from = new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]), 0, 0, 0);
          matchesEffectiveFrom = new Date(rev.effectiveDate) >= from;
        }
      }
      if (effectiveToDate) {
        const parts = effectiveToDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (parts) {
          const to = new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]), 23, 59, 59);
          matchesEffectiveTo = new Date(rev.effectiveDate) <= to;
        }
      }

      let matchesValidFrom = true;
      let matchesValidTo = true;
      if (validFromDate) {
        const parts = validFromDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (parts) {
          const from = new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]), 0, 0, 0);
          matchesValidFrom = new Date(rev.validUntil) >= from;
        }
      }
      if (validToDate) {
        const parts = validToDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (parts) {
          const to = new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]), 23, 59, 59);
          matchesValidTo = new Date(rev.validUntil) <= to;
        }
      }

      const matchesRelatedDocument =
        relatedDocumentFilter === "All" ||
        (relatedDocumentFilter === "yes" ? !!rev.hasRelatedDocuments : !rev.hasRelatedDocuments);

      const matchesCorrelatedDocument =
        correlatedDocumentFilter === "All" ||
        (correlatedDocumentFilter === "yes" ? !!rev.hasCorrelatedDocuments : !rev.hasCorrelatedDocuments);

      const matchesTemplate =
        templateFilter === "All" ||
        (templateFilter === "yes" ? !!rev.isTemplate : !rev.isTemplate);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        matchesDepartment &&
        matchesCreatedFrom &&
        matchesCreatedTo &&
        matchesEffectiveFrom &&
        matchesEffectiveTo &&
        matchesValidFrom &&
        matchesValidTo &&
        matchesRelatedDocument &&
        matchesCorrelatedDocument &&
        matchesTemplate &&
        matchesBusinessUnit
      );
    });

    // Apply sorting
    return [...filtered].sort((a, b) => {
      const nameA = a.revisionName.toLowerCase();
      const nameB = b.revisionName.toLowerCase();
      if (sortOrder === "asc") return nameA.localeCompare(nameB);
      return nameB.localeCompare(nameA);
    });
  }, [
    searchQuery,
    config.statusFilter,
    config.revisions,
    typeFilter,
    departmentFilter,
    viewType,
    createdFromDate,
    createdToDate,
    effectiveFromDate,
    effectiveToDate,
    validFromDate,
    validToDate,
    relatedDocumentFilter,
    correlatedDocumentFilter,
    templateFilter,
    sortOrder,
    businessUnitFilter,
  ]);


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
    sortOrder,
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
      case "history":
        console.log(`View history for document ${openId}`);
        break;
    }
  };

  return (
    <div className="space-y-6 w-full flex-1 flex flex-col">
      {isNavigating && <FullPageLoading text="Loading..." />}
      {/* Header: Title + Breadcrumb */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-row flex-wrap items-end justify-between gap-3 md:gap-4">
          <div className="min-w-[200px] flex-1">
            <h1 className="text-lg md:text-xl lg:text-2xl font-bold tracking-tight text-slate-900">
              {config.title}
            </h1>
            <Breadcrumb items={pendingDocuments(navigateTo, `pending-${viewType}`)} />
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
                  placeholder="Search pending documents..."
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
                <div className="pt-2">
                  <DocumentFilters
                    hideSearch
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
            {currentRevisions.length > 0 ? (
              <>
                {/* Table with Horizontal Scroll */}
                <div className="overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 hover:scrollbar-thumb-slate-400 scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
                  <table className="w-full">
                    <thead className="bg-slate-50/80 border-b-2 border-slate-200 sticky top-0 z-30">
                      <tr>
                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-3 w-9 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap"></th>
                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                          No.
                        </th>
                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                          Document Number
                        </th>
                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                          Revision Number
                        </th>
                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                          Created
                        </th>
                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                          Opened By
                        </th>
                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                          Revision Name
                        </th>
                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                          State
                        </th>
                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                          Document Name
                        </th>
                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                          Document Type
                        </th>
                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                          Related Document
                        </th>
                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                          Correlated Document
                        </th>
                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                          Template
                        </th>
                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                          Business Unit
                        </th>
                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                          Department
                        </th>
                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                          Author
                        </th>
                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                          Effective Date
                        </th>
                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                          Valid Until
                        </th>
                        <th
                          className="sticky right-0 bg-slate-50 py-2.5 px-2 sm:py-3.5 sm:px-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider z-[1] whitespace-nowrap before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-200 shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.05)]"
                          style={{ width: "60px" }}
                        >
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {currentRevisions.map((rev, index) => (
                        <React.Fragment key={rev.id}>
                          <tr
                            onClick={() => (viewType === 'review' ? navigateTo(ROUTES.DOCUMENTS.REVISIONS.REVIEW(rev.id)) : navigateTo(ROUTES.DOCUMENTS.REVISIONS.APPROVAL(rev.id)))}
                            className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                          >
                            <td className="py-2 px-2 sm:py-3.5 sm:px-3 w-9 whitespace-nowrap"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (rev.hasRelatedDocuments || rev.hasCorrelatedDocuments) {
                                  setExpandedRowId(expandedRowId === rev.id ? null : rev.id);
                                }
                              }}
                            >
                              {rev.hasRelatedDocuments || rev.hasCorrelatedDocuments ? (
                                <button
                                  className="inline-flex items-center justify-center h-6 w-6 rounded-md hover:bg-slate-200 transition-colors"
                                  aria-label={expandedRowId === rev.id ? "Collapse documents" : "Expand documents"}
                                >
                                  <ChevronRight className={cn("h-3.5 w-3.5 text-slate-500 transition-transform duration-200", expandedRowId === rev.id && "rotate-90")} />
                                </button>
                              ) : (
                                <span className="inline-flex h-6 w-6" />
                              )}
                            </td>
                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                              {startIndex + index + 1}
                            </td>
                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                              <span className="font-medium text-emerald-600">
                                {rev.documentNumber}
                              </span>
                            </td>
                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                              {rev.revisionNumber}
                            </td>
                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                              {rev.created}
                            </td>
                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                              {rev.openedBy}
                            </td>
                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                              <span className="font-medium text-slate-900">
                                {rev.revisionName}
                              </span>
                            </td>
                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                              <UiStatusBadge status={mapStatusToStatusType(rev.state) as StatusType} />
                            </td>
                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-600">
                              {rev.documentName}
                            </td>
                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                              {rev.type}
                            </td>
                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-center">
                              {rev.hasRelatedDocuments ? (
                                <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">Yes</span>
                              ) : (
                                <span className="text-slate-600 font-medium">No</span>
                              )}
                            </td>
                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-center">
                              {rev.hasCorrelatedDocuments ? (
                                <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">Yes</span>
                              ) : (
                                <span className="text-slate-600 font-medium">No</span>
                              )}
                            </td>
                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-center">
                              {rev.isTemplate ? (
                                <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">Yes</span>
                              ) : (
                                <span className="text-slate-600 font-medium">No</span>
                              )}
                            </td>
                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                              {rev.businessUnit}
                            </td>
                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                              {rev.department}
                            </td>
                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                              {rev.author}
                            </td>
                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                              {rev.effectiveDate}
                            </td>
                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                              {rev.validUntil}
                            </td>
                            <td
                              onClick={(e) => e.stopPropagation()}
                              className="sticky right-0 bg-white py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-center z-30 whitespace-nowrap before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-200 shadow-[-8px_0_16px_-2px_rgba(0,0,0,0.12)] group-hover:bg-slate-50"
                            >
                              <button
                                ref={getRef(rev.id)}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggle(rev.id, e);
                                }}
                                className="inline-flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-lg hover:bg-slate-100 transition-colors"
                                aria-label="More actions"
                              >
                                <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-600" />
                              </button>
                            </td>
                          </tr>
                          {(rev.hasRelatedDocuments || rev.hasCorrelatedDocuments) &&
                            ((rev.relatedDocuments?.length ?? 0) > 0 || (rev.correlatedDocuments?.length ?? 0) > 0) && (
                              <tr>
                                <td colSpan={18} className="p-0 border-0">
                                  <div
                                    className={cn("grid", expandedRowId === rev.id ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
                                    style={{ transition: 'grid-template-rows 300ms cubic-bezier(0.4, 0, 0.2, 1)' }}
                                  >
                                    <div className="overflow-hidden px-1.5 -mx-1.5 pb-1.5 -mb-1.5">
                                      <div className={cn("bg-slate-50/60 border-b border-slate-200 px-4 py-2 transition-opacity duration-200", expandedRowId === rev.id ? "opacity-100" : "opacity-0")}>
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
                                                    {rev.relatedDocuments.map((doc) => (
                                                      <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="py-1.5 px-2.5 font-medium text-emerald-600 whitespace-nowrap">{doc.documentNumber}</td>
                                                        <td className="py-1.5 px-2.5 text-slate-700 whitespace-nowrap">{doc.documentName}</td>
                                                        <td className="py-1.5 px-2.5 text-slate-600 whitespace-nowrap">{doc.revisionNumber}</td>
                                                        <td className="py-1.5 px-2.5 text-slate-600 whitespace-nowrap">{doc.type}</td>
                                                        <td className="py-1.5 px-2.5 whitespace-nowrap">
                                                          <UiStatusBadge status={mapStatusToStatusType(doc.state) as StatusType} size="sm" />
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
                                                    {rev.correlatedDocuments.map((doc) => (
                                                      <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="py-1.5 px-2.5 font-medium text-emerald-600 whitespace-nowrap">{doc.documentNumber}</td>
                                                        <td className="py-1.5 px-2.5 text-slate-700 whitespace-nowrap">{doc.documentName}</td>
                                                        <td className="py-1.5 px-2.5 text-slate-600 whitespace-nowrap">{doc.revisionNumber}</td>
                                                        <td className="py-1.5 px-2.5 text-slate-600 whitespace-nowrap">{doc.type}</td>
                                                        <td className="py-1.5 px-2.5 whitespace-nowrap">
                                                          <UiStatusBadge status={mapStatusToStatusType(doc.state) as StatusType} size="sm" />
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
                                    </div>
                                  </div>
                                </td>
                                <td className="p-0 border-0 sticky right-0 z-30 bg-white before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-200 shadow-[-8px_0_16px_-2px_rgba(0,0,0,0.12)]">
                                  <div
                                    className={cn("grid", expandedRowId === rev.id ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
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
                      ))}
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




