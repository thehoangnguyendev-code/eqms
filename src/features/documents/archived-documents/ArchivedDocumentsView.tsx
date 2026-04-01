import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/app/routes.constants';
import {
    Archive,
    Download,
    ChevronUp,
    ChevronDown,
    MoreVertical
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button/Button';
import { TablePagination } from '@/components/ui/table/TablePagination';
import { TableEmptyState } from '@/components/ui/table/TableEmptyState';
import { cn } from '@/components/ui/utils';
import { ArchivedDocumentFilters } from './components/ArchivedDocumentFilters';
import { ArchivedDocument, RetentionFilter } from './types';
import {
    calculateRetentionStatus,
    getRetentionBadgeStyle,
    formatRetentionPeriod,
    logAuditTrail
} from './utils';
import { IconInfoCircle } from '@tabler/icons-react';
import { FullPageLoading } from '@/components/ui/loading/Loading';
import { Breadcrumb } from "@/components/ui/breadcrumb/Breadcrumb";
import { archivedDocuments } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { MOCK_ARCHIVED_DOCS } from './mockData';
import { usePortalDropdown, useNavigateWithLoading, useTableDragScroll } from "@/hooks";

export const ArchivedDocumentsView: React.FC = () => {
    const { navigateTo, isNavigating } = useNavigateWithLoading();
    const { scrollerRef, isDragging, dragEvents } = useTableDragScroll();
    const [searchQuery, setSearchQuery] = useState('');
    const [lastApproverFilter, setLastApproverFilter] = useState('all');
    const [retentionFilter, setRetentionFilter] = useState<RetentionFilter>('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
        key: "code",
        direction: "asc",
    });

    const { openId, position, getRef, toggle, close } = usePortalDropdown();

    // Mock user role - in production, this would come from auth context
    const userRole = 'Admin'; // or 'QA Manager', 'Quality Assurance', 'User'

    const filteredDocuments = useMemo(() => {
        const filtered = MOCK_ARCHIVED_DOCS.filter(doc => {
            // Search filter
            if (searchQuery && !doc.code.toLowerCase().includes(searchQuery.toLowerCase()) &&
                !doc.documentName.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }

            // Last Approver filter
            if (lastApproverFilter !== 'all' && doc.lastApprover !== lastApproverFilter) {
                return false;
            }

            // Date range filter
            if (startDate) {
                const parts = startDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
                if (parts) {
                    const from = new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]), 0, 0, 0);
                    if (new Date(doc.archivedDate) < from) {
                        return false;
                    }
                }
            }
            if (endDate) {
                const parts = endDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
                if (parts) {
                    const to = new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]), 23, 59, 59);
                    if (new Date(doc.archivedDate) > to) {
                        return false;
                    }
                }
            }

            // Retention filter
            if (retentionFilter !== 'all') {
                const status = calculateRetentionStatus(doc.retentionExpiry);
                if (status.status !== retentionFilter) {
                    return false;
                }
            }

            return true;
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
            const key = sortConfig.key as keyof ArchivedDocument;
            let valA: any = a[key] || "";
            let valB: any = b[key] || "";

            if (key === 'archivedDate' || key === 'retentionExpiry') {
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
    }, [searchQuery, lastApproverFilter, retentionFilter, startDate, endDate, sortConfig]);

    const handleSort = (key: string) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
        }));
        setCurrentPage(1);
    };

    // Pagination calculations
    const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedDocuments = useMemo(() => {
        return filteredDocuments.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredDocuments, startIndex, itemsPerPage]);

    const handleView = (doc: ArchivedDocument) => {
        logAuditTrail(doc.id, doc.code, 'viewed', userRole);
        navigateTo(ROUTES.DOCUMENTS.DETAIL(doc.id), {
            state: {
                initialStatus: 'Obsoleted',
                fromArchive: true
            }
        });
    };



    return (
        <div className="h-full flex flex-col space-y-6">
            {isNavigating && <FullPageLoading text="Loading..." />}
            {/* Header */}
            <div className="flex flex-row flex-wrap items-end justify-between gap-3 md:gap-4">
                <div className="min-w-[200px] flex-1">
                    <h1 className="text-lg md:text-xl lg:text-2xl font-bold tracking-tight text-slate-900">Archived Documents</h1>
                    <Breadcrumb items={archivedDocuments()} />
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

            {/* Unified Content Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm w-full overflow-hidden flex flex-col">
                {/* Filters */}
                <ArchivedDocumentFilters
                    searchQuery={searchQuery}
                    onSearchChange={(val) => { setSearchQuery(val); setCurrentPage(1); }}
                    lastApproverFilter={lastApproverFilter}
                    onLastApproverChange={(val) => { setLastApproverFilter(val); setCurrentPage(1); }}
                    retentionFilter={retentionFilter}
                    onRetentionFilterChange={(val) => { setRetentionFilter(val); setCurrentPage(1); }}
                    startDate={startDate}
                    onStartDateChange={(val) => { setStartDate(val); setCurrentPage(1); }}
                    endDate={endDate}
                    onEndDateChange={(val) => { setEndDate(val); setCurrentPage(1); }}
                />

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
                                        <th className="sticky top-0 z-20 bg-slate-50 py-2.5 px-2 md:py-3.5 md:px-4 text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 whitespace-nowrap w-16 text-center">
                                            No.
                                        </th>
                                        {[
                                            { label: "Document Code", id: "code", sortable: true },
                                            { label: "Document Name", id: "documentName", sortable: true },
                                            { label: "Version", id: "version", sortable: true },
                                            { label: "Archived Date", id: "archivedDate", sortable: true },
                                            { label: "Last Approver", id: "lastApprover", sortable: true },
                                            { label: "Retention Period", id: "retentionPeriod", sortable: true },
                                            { label: "Retention Status", id: "retentionStatus" }
                                        ].map((col, idx) => {
                                            const isSorted = sortConfig.key === col.id;
                                            const canSort = col.sortable;

                                            return (
                                                <th
                                                    key={idx}
                                                    onClick={canSort ? () => handleSort(col.id!) : undefined}
                                                    className={cn(
                                                        "sticky top-0 z-20 bg-slate-50 py-2.5 px-2 md:py-3.5 md:px-4 text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 whitespace-nowrap transition-colors",
                                                        canSort && "cursor-pointer hover:bg-slate-100 hover:text-slate-700 group"
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
                                        <th className="sticky top-0 right-0 z-30 bg-slate-50 py-2.5 px-2 md:py-3.5 md:px-4 text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center whitespace-nowrap border-b-2 border-slate-200 before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-slate-200 shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.05)]">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white">
                                    {paginatedDocuments.map((doc, index) => {
                                        const retentionStatus = calculateRetentionStatus(doc.retentionExpiry);
                                        const rowNumber = startIndex + index + 1;
                                        const tdClass = "py-2.5 px-2 md:py-3 md:px-4 text-xs md:text-sm text-slate-700 border-b border-slate-200 whitespace-nowrap";

                                        return (
                                            <tr
                                                key={doc.id}
                                                className="hover:bg-slate-50/80 transition-colors group"
                                            >
                                                <td className={cn(tdClass, "text-center text-slate-600")}>
                                                    {rowNumber}
                                                </td>
                                                <td
                                                    className={cn(tdClass, "cursor-pointer font-medium text-emerald-600 hover:underline transition-colors")}
                                                    onClick={() => handleView(doc)}
                                                >
                                                    {doc.code}
                                                </td>
                                                <td className={tdClass}>
                                                    <div className="max-w-md">
                                                        <p className="font-medium text-slate-900 truncate">{doc.documentName}</p>
                                                        <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">{doc.department}</p>
                                                    </div>
                                                </td>
                                                <td className={cn(tdClass, "text-slate-600")}>
                                                    {doc.version}
                                                </td>
                                                <td className={cn(tdClass, "text-slate-600")}>
                                                    {new Date(doc.archivedDate).toLocaleDateString("en-GB", {
                                                        day: "2-digit",
                                                        month: "2-digit",
                                                        year: "numeric",
                                                    })}
                                                </td>
                                                <td className={cn(tdClass, "text-slate-600")}>
                                                    {doc.lastApprover}
                                                </td>
                                                <td className={cn(tdClass, "text-slate-600")}>
                                                    {formatRetentionPeriod(doc.retentionPeriod)}
                                                </td>
                                                <td className={tdClass}>
                                                    <span className={cn(
                                                        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium border w-fit",
                                                        getRetentionBadgeStyle(retentionStatus.status)
                                                    )}>
                                                        {retentionStatus.message}
                                                    </span>
                                                </td>
                                                <td
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="sticky right-0 z-10 bg-white border-b border-slate-200 py-2.5 px-2 md:py-3 md:px-4 text-center whitespace-nowrap before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-slate-200 shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.05)] group-hover:bg-slate-50 transition-colors"
                                                >
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        ref={getRef(doc.id)}
                                                        onClick={(e) => toggle(doc.id, e)}
                                                        aria-label="More actions"
                                                        className="h-7 w-7 md:h-8 md:w-8"
                                                    >
                                                        <MoreVertical className="h-3.5 w-3.5 md:h-4 md:w-4 text-slate-600" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {paginatedDocuments.length === 0 && (
                                <TableEmptyState
                                    icon={<Archive className="h-5 w-5 sm:h-7 sm:w-7 md:h-8 md:w-8 text-slate-300" />}
                                    title="No Archived Documents Found"
                                    description="Try adjusting your filters or clear your search criteria."
                                />
                            )}
                        </div>

                        <TablePagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={filteredDocuments.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                            onItemsPerPageChange={setItemsPerPage}
                        />
                    </div>
                </div>
            </div>

            {/* Dropdown Menu */}
            {openId && createPortal(
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
                            transform: position.showAbove ? "translateY(-100%)" : "none",
                        }}
                    >
                        <div className="py-1">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const doc = paginatedDocuments.find(d => d.id === openId);
                                    if (doc) handleView(doc);
                                    close();
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors"
                            >
                                <IconInfoCircle className="h-4 w-4 flex-shrink-0" />
                                <span className="font-medium">View Detail</span>
                            </button>
                        </div>
                    </div>
                </>,
                window.document.body
            )}

        </div>
    );
};
