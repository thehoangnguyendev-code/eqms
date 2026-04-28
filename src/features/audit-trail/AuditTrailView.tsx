import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { usePortalDropdown, useTableDragScroll } from "@/hooks";
import { useLocation } from "react-router-dom";
import {
    Search,
    MoreVertical,
    FileText,
    Download,
    X,
    ChevronUp,
    ChevronDown,
} from "lucide-react";
import { IconInfoCircle } from "@tabler/icons-react";
import { PageHeader } from "@/components/ui/page/PageHeader";
import { auditTrail } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import { DateRangePicker } from "@/components/ui/datetime-picker/DateRangePicker";
import { TablePagination } from "@/components/ui/table/TablePagination";
import { TableEmptyState } from "@/components/ui/table/TableEmptyState";
import { FullPageLoading } from "@/components/ui/loading/Loading";
import { cn } from "@/components/ui/utils";
import { formatDateTime } from "@/utils/format";
import type { AuditTrailRecord, AuditAction, AuditModule } from "./types";
import { MOCK_AUDIT_RECORDS } from "./mockData";
import { AuditTrailDetailView } from "./AuditTrailDetailView";
import { AuditExportModal } from "./components/AuditExportModal";

// --- Helper Functions ---

// --- Dropdown Component ---
interface DropdownMenuProps {
    record: AuditTrailRecord;
    isOpen: boolean;
    onClose: () => void;
    onViewDetails: () => void;
    onExport: () => void;
    position: { top: number; left: number; showAbove?: boolean };
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
    record,
    isOpen,
    onClose,
    onViewDetails,
    onExport,
    position,
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
                className="fixed z-50 min-w-[160px] w-[200px] max-w-[90vw] max-h-[300px] overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-200"
                style={{
                    top: `${position.top}px`,
                    left: `${position.left}px`,
                    transform: position.showAbove ? 'translateY(-100%)' : 'none'
                }}
            >
                <div className="py-1">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails();
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors"
                    >
                        <IconInfoCircle className="h-4 w-4 flex-shrink-0" />
                        <span className="font-medium">View Details</span>
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onExport();
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors"
                    >
                        <Download className="h-4 w-4 flex-shrink-0" />
                        <span className="font-medium">Export</span>
                    </button>
                </div>
            </div>
        </>,
        document.body
    );
};

// --- Main Component ---
export const AuditTrailView: React.FC = () => {
    const location = useLocation();

    // View state
    const [selectedRecord, setSelectedRecord] = useState<AuditTrailRecord | null>(null);
    const [isNavigating, setIsNavigating] = useState(false);

    // Reset to list view when user navigates to this page from sidebar
    useEffect(() => {
        setSelectedRecord(null);
    }, [location.key]);

    // Filters state
    const [searchQuery, setSearchQuery] = useState("");
    const [moduleFilter, setModuleFilter] = useState<AuditModule | "All">("All");
    const [actionFilter, setActionFilter] = useState<AuditAction | "All">("All");
    const [userFilter, setUserFilter] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
        key: "timestamp",
        direction: "desc",
    });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Dropdown state
    const { openId: openDropdownId, position: dropdownPosition, getRef, toggle: handleDropdownToggle, close: closeDropdown } = usePortalDropdown();
    const { scrollerRef, isDragging, dragEvents } = useTableDragScroll();

    // Export modal state
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportingRecord, setExportingRecord] = useState<AuditTrailRecord | null>(null);

    const handleSort = (key: string) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
        }));
        setCurrentPage(1);
    };

    // Filter data
    const filteredData = useMemo(() => {
        return MOCK_AUDIT_RECORDS.filter((record) => {
            const matchesSearch =
                searchQuery === "" ||
                record.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                record.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                record.description.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesModule = moduleFilter === "All" || record.module === moduleFilter;
            const matchesAction = actionFilter === "All" || record.action === actionFilter;
            const matchesUser =
                userFilter === "" ||
                record.user.toLowerCase().includes(userFilter.toLowerCase());

            // Date filtering (DateRangePicker outputs dd/MM/yyyy HH:mm:ss or dd/MM/yyyy format)
            let matchesDateFrom = true;
            let matchesDateTo = true;
            if (dateFrom) {
                const dateTimeParts = dateFrom.match(/^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})$/);
                const dateParts = dateFrom.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
                if (dateTimeParts) {
                    const from = new Date(parseInt(dateTimeParts[3]), parseInt(dateTimeParts[2]) - 1, parseInt(dateTimeParts[1]), parseInt(dateTimeParts[4]), parseInt(dateTimeParts[5]), parseInt(dateTimeParts[6]));
                    matchesDateFrom = new Date(record.timestamp) >= from;
                } else if (dateParts) {
                    const from = new Date(parseInt(dateParts[3]), parseInt(dateParts[2]) - 1, parseInt(dateParts[1]));
                    matchesDateFrom = new Date(record.timestamp) >= from;
                }
            }
            if (dateTo) {
                const dateTimeParts = dateTo.match(/^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})$/);
                const dateParts = dateTo.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
                if (dateTimeParts) {
                    const to = new Date(parseInt(dateTimeParts[3]), parseInt(dateTimeParts[2]) - 1, parseInt(dateTimeParts[1]), parseInt(dateTimeParts[4]), parseInt(dateTimeParts[5]), parseInt(dateTimeParts[6]));
                    matchesDateTo = new Date(record.timestamp) <= to;
                } else if (dateParts) {
                    const to = new Date(parseInt(dateParts[3]), parseInt(dateParts[2]) - 1, parseInt(dateParts[1]), 23, 59, 59);
                    matchesDateTo = new Date(record.timestamp) <= to;
                }
            }

            return (
                matchesSearch &&
                matchesModule &&
                matchesAction &&
                matchesUser &&
                matchesDateFrom &&
                matchesDateTo
            );
        }).sort((a, b) => {
            const key = sortConfig.key as keyof AuditTrailRecord;
            let valA: any = a[key];
            let valB: any = b[key];

            if (key === 'timestamp') {
                valA = new Date(valA).getTime();
                valB = new Date(valB).getTime();
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
        moduleFilter,
        actionFilter,
        userFilter,
        dateFrom,
        dateTo,
        sortConfig,
    ]);

    // Pagination
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredData, currentPage, itemsPerPage]);

    // Reset page when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [
        searchQuery,
        moduleFilter,
        actionFilter,
        userFilter,
        dateFrom,
        dateTo,
    ]);

    // Module options
    const moduleOptions = [
        { label: "All Modules", value: "All" },
        { label: "Document", value: "Document" },
        { label: "Revision", value: "Revision" },
        { label: "User", value: "User" },
        { label: "Role", value: "Role" },
        { label: "CAPA", value: "CAPA" },
        { label: "Deviation", value: "Deviation" },
        { label: "Training", value: "Training" },
        { label: "Controlled Copy", value: "Controlled Copy" },
        { label: "System", value: "System" },
        { label: "Settings", value: "Settings" },
        { label: "Report", value: "Report" },
        { label: "Task", value: "Task" },
        { label: "Notification", value: "Notification" },
    ];

    // Action options
    const actionOptions = [
        { label: "All Actions", value: "All" },
        { label: "Create", value: "Create" },
        { label: "Update", value: "Update" },
        { label: "Delete", value: "Delete" },
        { label: "Approve", value: "Approve" },
        { label: "Reject", value: "Reject" },
        { label: "Review", value: "Review" },
        { label: "Publish", value: "Publish" },
        { label: "Archive", value: "Archive" },
        { label: "Restore", value: "Restore" },
        { label: "Login", value: "Login" },
        { label: "Logout", value: "Logout" },
        { label: "Export", value: "Export" },
        { label: "Download", value: "Download" },
        { label: "Upload", value: "Upload" },
        { label: "Assign", value: "Assign" },
        { label: "Unassign", value: "Unassign" },
        { label: "Enable", value: "Enable" },
        { label: "Disable", value: "Disable" },
    ];

    // Show detail view if a record is selected
    if (selectedRecord) {
        return (
            <AuditTrailDetailView
                record={selectedRecord}
                onBack={() => {
                    document.getElementById('main-scroll-container')?.scrollTo({ top: 0, behavior: 'instant' });
                    setSelectedRecord(null);
                }}
            />
        );
    }

    return (
        <div className="space-y-6 w-full flex-1 flex flex-col">
            {/* Header */}
            <PageHeader
                title="Audit Trail"
                breadcrumbItems={auditTrail()}
                actions={
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => console.log("Export all")}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                }
            />

            {/* Unified Content Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm w-full overflow-hidden flex flex-col">
                <div className="p-4 md:p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        {/* Search */}
                        <div className="w-full">
                            <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block transition-colors">
                                Search
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by entity, user, or description..."
                                    className="w-full h-9 pl-10 pr-10 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm placeholder:text-slate-400 transition-all bg-white"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchQuery("");
                                            setCurrentPage(1);
                                        }}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                        aria-label="Clear search"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Module Filter */}
                        <div>
                            <Select
                                label="Module"
                                value={moduleFilter}
                                onChange={(value) => setModuleFilter(value as AuditModule | "All")}
                                options={moduleOptions}
                                placeholder="All Modules"
                            />
                        </div>

                        {/* Action Filter */}
                        <div>
                            <Select
                                label="Action"
                                value={actionFilter}
                                onChange={(value) => setActionFilter(value as AuditAction | "All")}
                                options={actionOptions}
                                placeholder="All Actions"
                            />
                        </div>

                        {/* Timestamp Date Range */}
                        <div>
                            <DateRangePicker
                                label="Timestamp Date Range"
                                startDate={dateFrom}
                                endDate={dateTo}
                                onStartDateChange={setDateFrom}
                                onEndDateChange={setDateTo}
                                placeholder="Select date range"
                                includeTime={true}
                            />
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="px-4 md:px-5 pb-4 md:pb-5 flex-1 flex flex-col relative">
                    <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col flex-1 bg-slate-50/10 transition-all duration-300">
                        {paginatedData.length > 0 ? (
                            <>
                                <div
                                    ref={scrollerRef}
                                    className={cn(
                                        "overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 hover:scrollbar-thumb-slate-400 scrollbar-thumb-rounded-full scrollbar-track-rounded-full transition-colors",
                                        isDragging ? "cursor-grabbing select-none" : "cursor-grab"
                                    )}
                                    {...dragEvents}
                                >
                                    <table className="w-full min-w-[980px] md:min-w-[1180px] lg:min-w-[1380px] xl:min-w-[1560px]">
                                        {/* Table Header */}
                                        <thead className="bg-slate-50 border-b-2 border-slate-200 sticky top-0 z-30">
                                            <tr>
                                                <th className="py-3 px-4 text-left text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                                    No.
                                                </th>
                                                {[
                                                    { id: 'timestamp', label: 'Timestamp' },
                                                    { id: 'user', label: 'User' },
                                                    { id: 'module', label: 'Module' },
                                                    { id: 'action', label: 'Action' },
                                                    { id: 'entityId', label: 'Entity' },
                                                    { id: 'description', label: 'Description' },
                                                    { id: 'ipAddress', label: 'IP Address' },
                                                    { id: 'device', label: 'Device' },
                                                ].map((col) => {
                                                    const isSorted = sortConfig.key === col.id;
                                                    return (
                                                        <th
                                                            key={col.id}
                                                            onClick={() => handleSort(col.id)}
                                                            className="py-3 px-4 text-left text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition-colors group"
                                                        >
                                                            <div className="flex items-center justify-between gap-2">
                                                                <span>{col.label}</span>
                                                                <div className="flex flex-col text-slate-400 group-hover:text-slate-500">
                                                                    <ChevronUp className={cn("h-3 w-3 -mb-1", isSorted && sortConfig.direction === 'asc' ? "text-emerald-600 font-bold" : "")} />
                                                                    <ChevronDown className={cn("h-3 w-3", isSorted && sortConfig.direction === 'desc' ? "text-emerald-600 font-bold" : "")} />
                                                                </div>
                                                            </div>
                                                        </th>
                                                    );
                                                })}

                                                <th className="sticky right-0 bg-slate-50 py-3 px-4 text-center text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider z-[1] whitespace-nowrap before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-200 shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.05)]">
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>

                                        {/* Table Body */}
                                        <tbody className="divide-y divide-slate-200 bg-white">
                                            {paginatedData.map((record, index) => (
                                                <tr
                                                    key={record.id}
                                                    className="hover:bg-slate-50 transition-colors group"
                                                >
                                                    {/* No. */}
                                                    <td className="py-3 px-4 text-xs md:text-sm whitespace-nowrap text-slate-900">
                                                        {startItem + index}
                                                    </td>

                                                    {/* Timestamp */}
                                                    <td className="py-3 px-4 text-xs md:text-sm whitespace-nowrap text-slate-900">
                                                        {formatDateTime(record.timestamp)}
                                                    </td>

                                                    {/* User */}
                                                    <td className="py-3 px-4 text-xs md:text-sm whitespace-nowrap">
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-slate-900">
                                                                {record.user}
                                                            </span>
                                                            <span className="text-[10px] sm:text-xs text-slate-500">
                                                                {record.userId}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Module */}
                                                    <td className="py-3 px-4 text-xs md:text-sm whitespace-nowrap">
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-50 text-slate-700 border-slate-200">
                                                            {record.module}
                                                        </span>
                                                    </td>

                                                    {/* Action */}
                                                    <td className="py-3 px-4 text-xs md:text-sm whitespace-nowrap">
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">
                                                            {record.action}
                                                        </span>
                                                    </td>

                                                    {/* Entity */}
                                                    <td className="py-3 px-4 text-xs md:text-sm whitespace-nowrap">
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-slate-900">
                                                                {record.entityId}
                                                            </span>
                                                            <span className="text-[10px] sm:text-xs text-slate-500">
                                                                {record.entityName}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Description */}
                                                    <td className="py-3 px-4 text-xs md:text-sm text-slate-700 whitespace-nowrap">
                                                        {record.description}
                                                    </td>

                                                    {/* IP Address */}
                                                    <td className="py-3 px-4 text-xs md:text-sm whitespace-nowrap text-slate-900">
                                                        {record.ipAddress}
                                                    </td>

                                                    {/* Device */}
                                                    <td className="py-3 px-4 text-xs md:text-sm whitespace-nowrap text-slate-900">
                                                        {record.device || "-"}
                                                    </td>

                                                    {/* Action Column */}
                                                    <td
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="sticky right-0 bg-white py-3 px-4 text-xs md:text-sm text-center z-30 whitespace-nowrap before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-200 shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.05)] group-hover:bg-slate-50"
                                                    >
                                                        <button
                                                            ref={getRef(record.id)}
                                                            onClick={(e) => handleDropdownToggle(record.id, e)}
                                                            className="inline-flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-lg hover:bg-slate-100 transition-colors"
                                                            aria-label="More actions"
                                                        >
                                                            <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-600" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination Footer */}
                                <TablePagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                    totalItems={totalItems}
                                    itemsPerPage={itemsPerPage}
                                    onItemsPerPageChange={setItemsPerPage}
                                    showItemCount={true}
                                />
                            </>
                        ) : (
                            <TableEmptyState
                                title="No Audit Records Found"
                                description="We couldn't find any audit records matching your filters. Try adjusting your search criteria or clear filters."
                                actionLabel="Clear Filters"
                                onAction={() => {
                                    setSearchQuery("");
                                    setModuleFilter("All");
                                    setActionFilter("All");
                                    setUserFilter("");
                                    setDateFrom("");
                                    setDateTo("");
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Dropdown Menu */}
            {openDropdownId &&
                paginatedData.find((r) => r.id === openDropdownId) && (
                    <DropdownMenu
                        record={paginatedData.find((r) => r.id === openDropdownId)!}
                        isOpen={true}
                        onClose={() => closeDropdown()}
                        onViewDetails={() => {
                            const record = paginatedData.find((r) => r.id === openDropdownId);
                            if (record) {
                                closeDropdown();
                                setIsNavigating(true);
                                setTimeout(() => {
                                    document.getElementById('main-scroll-container')?.scrollTo({ top: 0, behavior: 'instant' });
                                    setSelectedRecord(record);
                                    setIsNavigating(false);
                                }, 600);
                            }
                        }}
                        onExport={() => {
                            const record = paginatedData.find((r) => r.id === openDropdownId);
                            if (record) {
                                setExportingRecord(record);
                                setIsExportModalOpen(true);
                                closeDropdown();
                            }
                        }}
                        position={dropdownPosition}
                    />
                )}

            {/* Export Modal */}
            {exportingRecord && (
                <AuditExportModal
                    isOpen={isExportModalOpen}
                    onClose={() => {
                        setIsExportModalOpen(false);
                        setExportingRecord(null);
                    }}
                    record={exportingRecord}
                />
            )}

            {isNavigating && <FullPageLoading text="Loading..." />}
        </div>
    );
};
