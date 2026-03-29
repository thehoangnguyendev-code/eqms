import React, { useState, useMemo, useRef, createRef, RefObject } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ROUTES } from '@/app/routes.constants';
import {
  ChevronRight,
  MoreVertical,
  History,
  Download,
  FilePlusCorner,
  FileStack,
  Search,
  SlidersHorizontal,
  X,
  ArrowDownAZ,
  ArrowDownZA,
} from "lucide-react";
import { Button } from '@/components/ui/button/Button';
import { StatusBadge, StatusType } from '@/components/ui';
import { TablePagination } from '@/components/ui/table/TablePagination';
import { TableEmptyState } from '@/components/ui/table/TableEmptyState';
import { DocumentFilters } from "@/features/documents/shared/components";
import { cn } from '@/components/ui/utils';
import { IconInfoCircle, IconEyeCheck, IconChecks } from "@tabler/icons-react";
import { Breadcrumb } from "@/components/ui/breadcrumb/Breadcrumb";
import { revisionList } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { SectionLoading, FullPageLoading } from "@/components/ui/loading/Loading";
import { usePortalDropdown, useNavigateWithLoading } from "@/hooks";

import type { DocumentType, DocumentStatus } from "@/features/documents/types";
import { Revision, MOCK_REVISIONS } from "./mockData";
import type { RelatedDocument, CorrelatedDocument } from "./mockData";
import { mapStatusToStatusType } from "@/utils/status";



// --- Main Component ---
export const RevisionListView: React.FC = () => {
  const { navigateTo, isNavigating } = useNavigateWithLoading();

  // States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | "All">("All");
  const [typeFilter, setTypeFilter] = useState<DocumentType | "All">("All");
  const [businessUnitFilter, setBusinessUnitFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [authorFilter, setAuthorFilter] = useState("All");
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
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const { openId, position, getRef, toggle, close } = usePortalDropdown();

  // Filtered data
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

    // Apply sorting
    return [...filtered].sort((a, b) => {
      const nameA = a.revisionName.toLowerCase();
      const nameB = b.revisionName.toLowerCase();
      if (sortOrder === "asc") return nameA.localeCompare(nameB);
      return nameB.localeCompare(nameA);
    });
  }, [
    searchQuery,
    statusFilter,
    typeFilter,
    businessUnitFilter,
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
    sortOrder,
  ]);

  // Handle loading state on filter changes
  React.useEffect(() => {
    setIsTableLoading(true);
    const timer = setTimeout(() => setIsTableLoading(false), 300);
    return () => clearTimeout(timer);
  }, [
    searchQuery,
    statusFilter,
    typeFilter,
    businessUnitFilter,
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
    sortOrder,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredRevisions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRevisions = useMemo(() => {
    return filteredRevisions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRevisions, startIndex, itemsPerPage]);

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
    setAuthorFilter("All");
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
      navigateTo(ROUTES.DOCUMENTS.REVISIONS.NEW_MULTI(revision.id), { state: { from: ROUTES.DOCUMENTS.REVISIONS.ALL } });
    } else {
      navigateTo(ROUTES.DOCUMENTS.REVISIONS.NEW_STANDALONE(revision.id), { state: { from: ROUTES.DOCUMENTS.REVISIONS.ALL } });
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
      case "review":
        navigateTo(ROUTES.DOCUMENTS.REVISIONS.REVIEW(id));
        break;
      case "approve":
        navigateTo(ROUTES.DOCUMENTS.REVISIONS.APPROVAL(id));
        break;
      case "audit":
        navigateTo(`${ROUTES.DOCUMENTS.REVISIONS.DETAIL(id)}?tab=audit`);
        break;
      default:
        break;
    }
  };



  return (
    <div className="flex flex-col h-full gap-4 md:gap-6">
      {isNavigating && <FullPageLoading text="Loading..." />}
      {/* Header */}
      <div className="flex flex-row flex-wrap items-end justify-between gap-3 md:gap-4">
        <div className="min-w-[200px] flex-1">
          <h1 className="text-lg md:text-xl lg:text-2xl font-bold tracking-tight text-slate-900">
            All Revisions
          </h1>
          <Breadcrumb items={revisionList(navigateTo)} />
        </div>
        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          <Button
            onClick={() => {
              console.log("Export triggered");
              // TODO: Implement export functionality
            }}
            variant="outline"
            size="sm"
            className="whitespace-nowrap gap-2 self-start md:self-auto"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
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
                  placeholder="Search revisions..."
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
                <div className="overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 hover:scrollbar-thumb-slate-400 scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
                  <table className="w-full">
                    <thead className="bg-slate-50/80 border-b-2 border-slate-200 sticky top-0 z-30">
                      <tr>
                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-3 w-9 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap"></th>
                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">No.</th>
                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Document Number</th>
                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Revision Number</th>
                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Created</th>
                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Opened By</th>
                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Revision Name</th>
                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">State</th>
                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Document Name</th>
                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Document Type</th>
                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Related Document</th>
                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Correlated Document</th>
                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Template</th>
                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Business Unit</th>
                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Department</th>
                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Author</th>
                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Effective Date</th>
                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Valid Until</th>
                        <th className="sticky right-0 bg-slate-50 py-2.5 px-2 sm:py-3.5 sm:px-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider z-[1] whitespace-nowrap before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-200 shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.05)]">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {paginatedRevisions.map((revision, index) => (
                        <React.Fragment key={revision.id}>
                          <tr
                            onClick={() => handleViewRevision(revision.id)}
                            className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                          >
                            {/* Expand/collapse chevron cell */}
                            <td
                              className="py-2 px-2 sm:py-3.5 sm:px-3 w-9 whitespace-nowrap"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (revision.hasRelatedDocuments || revision.hasCorrelatedDocuments) {
                                  setExpandedRowId(expandedRowId === revision.id ? null : revision.id);
                                }
                              }}
                            >
                              {revision.hasRelatedDocuments || revision.hasCorrelatedDocuments ? (
                                <button
                                  className="inline-flex items-center justify-center h-6 w-6 rounded-md hover:bg-slate-200 transition-colors"
                                  aria-label={expandedRowId === revision.id ? "Collapse documents" : "Expand documents"}
                                >
                                  <ChevronRight
                                    className={cn(
                                      "h-3.5 w-3.5 text-slate-500 transition-transform duration-200",
                                      expandedRowId === revision.id && "rotate-90"
                                    )}
                                  />
                                </button>
                              ) : (
                                <span className="inline-flex h-6 w-6" />
                              )}
                            </td>
                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-700">{startIndex + index + 1}</td>
                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-700">
                              <span className="font-medium text-emerald-600">{revision.documentNumber}</span>
                            </td>
                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-700">
                              {revision.revisionNumber}
                            </td>
                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-700">{revision.created}</td>
                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-700">{revision.openedBy}</td>
                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-700">
                              <span className="font-medium text-slate-900">{revision.revisionName}</span>
                            </td>
                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-700">
                              <StatusBadge status={mapStatusToStatusType(revision.state) as StatusType} />
                            </td>
                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-600">{revision.documentName}</td>
                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-700">{revision.type}</td>
                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-center">
                              {revision.hasRelatedDocuments ? (
                                <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">Yes</span>
                              ) : (
                                <span className="text-slate-600 font-medium">No</span>
                              )}
                            </td>
                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-center">
                              {revision.hasCorrelatedDocuments ? (
                                <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">Yes</span>
                              ) : (
                                <span className="text-slate-600 font-medium">No</span>
                              )}
                            </td>
                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-center">
                              {revision.isTemplate ? (
                                <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">Yes</span>
                              ) : (
                                <span className="text-slate-600 font-medium">No</span>
                              )}
                            </td>
                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-700">{revision.businessUnit}</td>
                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-700">{revision.department}</td>
                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-700">{revision.author}</td>
                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-700">{revision.effectiveDate}</td>
                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-700">{revision.validUntil}</td>
                            <td
                              onClick={(e) => e.stopPropagation()}
                              className="sticky right-0 bg-white py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-center z-30 whitespace-nowrap before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-200 shadow-[-8px_0_16px_-2px_rgba(0,0,0,0.12)] group-hover:bg-slate-50"
                            >
                              <button
                                ref={getRef(revision.id)}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggle(revision.id, e);
                                }}
                                className="inline-flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-lg hover:bg-slate-100 transition-colors"
                                aria-label="More actions"
                              >
                                <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-600" />
                              </button>
                            </td>
                          </tr>
                          {/* Accordion row — related + correlated documents (always rendered for smooth animation) */}
                          {(revision.hasRelatedDocuments || revision.hasCorrelatedDocuments) &&
                            ((revision.relatedDocuments?.length ?? 0) > 0 || (revision.correlatedDocuments?.length ?? 0) > 0) && (
                              <tr>
                                <td colSpan={19} className="p-0 border-0">
                                  <div
                                    className={cn(
                                      "grid",
                                      expandedRowId === revision.id ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                                    )}
                                    style={{
                                      transition: 'grid-template-rows 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                                    }}
                                  >
                                    <div className="overflow-hidden px-1.5 -mx-1.5 pb-1.5 -mb-1.5">
                                      <div
                                        className={cn(
                                          "bg-slate-50/60 border-b border-slate-200 px-4 py-2 transition-opacity duration-200",
                                          expandedRowId === revision.id ? "opacity-100" : "opacity-0"
                                        )}
                                      >
                                        <div className="ml-9 flex flex-wrap gap-6">
                                          {/* Related Documents table */}
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
                                          {/* Correlated Documents table */}
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
                                    </div>
                                  </div>
                                </td>
                                <td className="p-0 border-0 sticky right-0 z-30 bg-white before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-200 shadow-[-8px_0_16px_-2px_rgba(0,0,0,0.12)]">
                                  <div
                                    className={cn(
                                      "grid",
                                      expandedRowId === revision.id ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                                    )}
                                    style={{
                                      transition: 'grid-template-rows 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                                    }}
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
                title="No Revisions Found"
                description="We couldn't find any revision records matching your filters. Try adjusting your search criteria or clear filters."
                actionLabel="Clear Filters"
                onAction={handleClearFilters}
              />
            )}
          </div>
        </div>
      </div>

      {/* Dropdown Menu (Portal) */}
      {openId && (() => {
        const currentRevision = MOCK_REVISIONS.find(r => r.id === openId);
        const isPendingReview = currentRevision?.state === "Pending Review";
        const isPendingApproval = currentRevision?.state === "Pending Approval";
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
              className="fixed z-50 min-w-[180px] rounded-lg border border-slate-200 bg-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-200"
              style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
                transform: position.showAbove ? 'translateY(-100%)' : 'none',
                transformOrigin: "top right",
              }}
            >
              <div className="py-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMenuAction("view", openId);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  <IconInfoCircle className="h-4 w-4 text-slate-500" />
                  <span>View Details</span>
                </button>
                {isPendingReview && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMenuAction("review", openId);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 transition-colors"
                  >
                    <IconEyeCheck className="h-4 w-4 text-slate-500" />
                    <span>Review Revision</span>
                  </button>
                )}
                {isPendingApproval && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMenuAction("approve", openId);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 transition-colors"
                  >
                    <IconChecks className="h-4 w-4 text-slate-500" />
                    <span>Approve Revision</span>
                  </button>
                )}
                {isEffective && currentRevision && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNewRevision(currentRevision);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 transition-colors"
                    >
                      <FilePlusCorner className="h-4 w-4 text-slate-500" />
                      <span>Upgrade Revision</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrintControlledCopy(currentRevision);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 transition-colors"
                    >
                      <FileStack className="h-4 w-4 text-slate-500" />
                      <span>Request Controlled Copy</span>
                    </button>
                  </>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMenuAction("audit", openId);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  <History className="h-4 w-4 text-slate-500" />
                  <span>View Audit Trail</span>
                </button>
              </div>
            </div>
          </>,
          document.body
        );
      })()}
    </div>
  );
};





