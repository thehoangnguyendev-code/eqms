import React, { useState } from "react";
import { createPortal } from "react-dom";
import { ROUTES } from '@/app/routes.constants';
import {
  Download,
  History,
  FilePlusCorner,
  FileStack,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import { DocumentFilters } from "@/features/documents/shared/components";
import {
  IconInfoCircle,
} from "@tabler/icons-react";
import { PageHeader } from "@/components/ui/page/PageHeader";
import { revisionsOwnedByMe } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { FullPageLoading } from "@/components/ui/loading/Loading";
import { useNavigateWithLoading, usePortalDropdown } from "@/hooks";
import { useDocumentFilter, useTableSort } from "@/features/documents/hooks";

import type { DocumentType, DocumentStatus } from "@/features/documents/types";
import { MOCK_REVISIONS } from "./mockData";
import type { Revision } from "./types";
import { mapStatusToStatusType } from "@/utils/status";
import { RevisionTableView } from "@/features/documents/shared/components";
// Current logged-in user (simulated)
const CURRENT_USER = {
  id: "user-001",
  name: "Dr. Sarah Johnson",
  email: "sarah.johnson@company.com",
  department: "Quality Assurance",
};

// --- Main Component ---
export const RevisionsOwnedByMeView: React.FC = () => {
  const { navigateTo, isNavigating } = useNavigateWithLoading();

  // States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | "All">("All");
  const [typeFilter, setTypeFilter] = useState<DocumentType | "All">("All");
  const [businessUnitFilter, setBusinessUnitFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: 'id',
    direction: "asc",
  });
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [isTableLoading, setIsTableLoading] = useState(false);

  // Default columns configuration
  const columns = [
    { id: "no", label: "No.", visible: true, order: 0, locked: true },
    { id: "documentNumber", label: "Document Number", visible: true, order: 1 },
    { id: "revisionNumber", label: "Revision Number", visible: true, order: 2 },
    { id: "created", label: "Created", visible: true, order: 3 },
    { id: "openedBy", label: "Opened By", visible: true, order: 4 },
    { id: "revisionName", label: "Revision Name", visible: true, order: 5 },
    { id: "state", label: "State", visible: true, order: 6 },
    { id: "documentName", label: "Document Name", visible: true, order: 7 },
    { id: "type", label: "Document Type", visible: true, order: 8 },
    { id: "action", label: "Action", visible: true, order: 17, locked: true },
  ];

  const { openId, position, getRef, toggle, close } = usePortalDropdown();

  // Filter data
  const filteredData = useDocumentFilter(MOCK_REVISIONS, {
    searchFields: ['documentNumber', 'revisionName', 'author', 'documentName'],
    searchQuery,
    filters: {
      status: statusFilter,
      type: typeFilter,
      businessUnit: businessUnitFilter,
      department: departmentFilter,
      author: authorFilter,
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

  // Sort data
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
  }, [searchQuery, statusFilter, typeFilter, businessUnitFilter, departmentFilter, sortConfig]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
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
      case "audit":
        navigateTo(`${ROUTES.DOCUMENTS.REVISIONS.DETAIL(id)}?tab=audit`);
        break;
      default:
        break;
    }
  };

  // Render column cell
  const renderCell = (
    column: { id: string; label: string; visible: boolean; order: number; locked?: boolean },
    revision: Revision,
    index: number,
  ) => {
    if (column.id === "businessUnit") return revision.businessUnit;
    switch (column.id) {
      case "no":
        return (currentPage - 1) * itemsPerPage + index + 1;
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
        return revision.state;
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
        <PageHeader
          title="Revisions Owned By Me"
          breadcrumbItems={revisionsOwnedByMe(navigateTo)}
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
        </div>

        {/* Table Section */}
        <div className="px-4 md:px-5 pb-4 md:pb-5 flex-1 flex flex-col">
          <RevisionTableView
            revisions={filteredRevisions}
            columns={columns}
            expandedRowId={expandedRowId}
            sortConfig={sortConfig}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            isTableLoading={isTableLoading}
            onExpandRow={setExpandedRowId}
            onSort={handleSort}
            onPageChange={setCurrentPage}
            getMenuActions={(revision: Revision) => {
              const actions = [];
              actions.push({ icon: <IconInfoCircle className="h-4 w-4" />, label: "View Details", action: "view" });
              if (revision.state === "Effective") {
                actions.push({ icon: <FilePlusCorner className="h-4 w-4" />, label: "Upgrade Revision", action: "upgrade" });
                actions.push({ icon: <FileStack className="h-4 w-4" />, label: "Request Controlled Copy", action: "print" });
              }
              actions.push({ icon: <History className="h-4 w-4" />, label: "View Audit Trail", action: "audit" });
              return actions;
            }}
            onMenuAction={handleMenuAction}
            renderCell={renderCell}
            onViewItem={(id) => navigateTo(ROUTES.DOCUMENTS.REVISIONS.DETAIL(id))}
          />
        </div>
      </div>
    </div>
  );
};