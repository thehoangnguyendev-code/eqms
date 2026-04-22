import React, { useState } from "react";
import {
    History,
    Search,
    Calendar,
    ChevronDown,
    Info,
    Monitor,
} from "lucide-react";
import { cn } from "@/components/ui/utils";
import { parseDMYStart, parseDMYEnd } from "@/lib/date";
import { Select, SelectOption } from "@/components/ui/select/Select";
import { Button } from "@/components/ui/button/Button";
import { FormModal } from "@/components/ui/modal/FormModal";
import { DateRangePicker } from "@/components/ui/datetime-picker/DateRangePicker";
import { TablePagination } from "@/components/ui/table/TablePagination";

interface AuditEntry {
    id: string;
    timestamp: string;
    user: {
        name: string;
        role: string;
        department: string;
    };
    action: string;
    actionType: "create" | "review" | "approve" | "reject" | "edit" | "download" | "print" | "view";
    changes?: {
        field: string;
        oldValue: string;
        newValue: string;
    }[];
    reason?: string;
    ipAddress: string;
    device: string;
}

const mockAuditData: AuditEntry[] = [
    {
        id: "AUD-2025-001",
        timestamp: "2025-12-27 14:30:05",
        user: { name: "Robert Johnson", role: "Director", department: "Quality Assurance" },
        action: "Approved Document",
        actionType: "approve",
        reason: "Document meets all GMP requirements and is ready for implementation",
        ipAddress: "192.168.1.105",
        device: "Windows 11 Pro - Chrome 120"
    },
    {
        id: "AUD-2025-002",
        timestamp: "2025-12-26 16:45:22",
        user: { name: "Jane Smith", role: "QA Manager", department: "Quality Assurance" },
        action: "Reviewed Document",
        actionType: "review",
        changes: [
            { field: "Section 4.2", oldValue: "Process must be validated", newValue: "Process must be validated and documented" },
            { field: "Effective Date", oldValue: "2025-12-20", newValue: "2025-12-27" }
        ],
        reason: "Added clarification on documentation requirements",
        ipAddress: "192.168.1.103",
        device: "Windows 10 - Firefox 121"
    },
    {
        id: "AUD-2025-003",
        timestamp: "2025-12-25 10:15:33",
        user: { name: "John Doe", role: "Document Author", department: "Quality Control" },
        action: "Submitted for Review",
        actionType: "review",
        ipAddress: "192.168.1.102",
        device: "Windows 11 - Edge 120"
    },
    {
        id: "AUD-2025-004",
        timestamp: "2025-12-24 09:20:15",
        user: { name: "John Doe", role: "Document Author", department: "Quality Control" },
        action: "Edited Draft",
        actionType: "edit",
        changes: [
            { field: "Purpose", oldValue: "To establish procedure for...", newValue: "To establish comprehensive procedure for..." }
        ],
        reason: "Improved clarity of document purpose",
        ipAddress: "192.168.1.102",
        device: "Windows 11 - Edge 120"
    },
    {
        id: "AUD-2025-005",
        timestamp: "2025-12-23 14:00:00",
        user: { name: "John Doe", role: "Document Author", department: "Quality Control" },
        action: "Created Draft",
        actionType: "create",
        ipAddress: "192.168.1.102",
        device: "Windows 11 - Edge 120"
    },
    {
        id: "AUD-2025-006",
        timestamp: "2025-12-27 11:20:45",
        user: { name: "Sarah Williams", role: "Training Coordinator", department: "Human Resources" },
        action: "Downloaded Controlled Copy",
        actionType: "download",
        reason: "For training session materials",
        ipAddress: "192.168.1.110",
        device: "MacOS Sonoma - Safari 17"
    },
    {
        id: "AUD-2025-007",
        timestamp: "2025-12-26 08:30:12",
        user: { name: "Michael Chen", role: "QC Analyst", department: "Quality Control" },
        action: "Printed Controlled Copy",
        actionType: "print",
        reason: "Hard copy required for cleanroom use (Copy No. 03)",
        ipAddress: "192.168.1.108",
        device: "Windows 10 - Chrome 120"
    }
];

const actionTypeOptions: SelectOption[] = [
    { value: "all", label: "All Actions" },
    { value: "create", label: "Create" },
    { value: "edit", label: "Edit" },
    { value: "review", label: "Review" },
    { value: "approve", label: "Approve" },
    { value: "reject", label: "Reject" },
    { value: "download", label: "Download" },
    { value: "print", label: "Print" }
];

const userOptions: SelectOption[] = [
    { value: "all", label: "All Users" },
    { value: "Robert Johnson", label: "Robert Johnson" },
    { value: "Jane Smith", label: "Jane Smith" },
    { value: "John Doe", label: "John Doe" },
    { value: "Sarah Williams", label: "Sarah Williams" },
    { value: "Michael Chen", label: "Michael Chen" }
];

const departmentOptions: SelectOption[] = [
    { value: "all", label: "All Departments" },
    { value: "Quality Assurance", label: "Quality Assurance" },
    { value: "Quality Control", label: "Quality Control" },
    { value: "Human Resources", label: "Human Resources" }
];

export const AuditTab: React.FC = () => {
    const [selectedAction, setSelectedAction] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUser, setSelectedUser] = useState("all");
    const [selectedDepartment, setSelectedDepartment] = useState("all");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);
    const [showChangesModal, setShowChangesModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const filteredData = mockAuditData.filter(entry => {
        const matchesAction = selectedAction === "all" || entry.actionType === selectedAction;
        const matchesSearch = entry.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.action.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesUser = selectedUser === "all" || entry.user.name === selectedUser;
        const matchesDepartment = selectedDepartment === "all" || entry.user.department === selectedDepartment;

        // Date filtering (DateRangePicker outputs dd/MM/yyyy HH:mm:ss or dd/MM/yyyy format)
        const entryDate = new Date(entry.timestamp);
        let matchesDateFrom = true;
        let matchesDateTo = true;

        if (dateFrom) {
            const from = parseDMYStart(dateFrom);
            if (from) matchesDateFrom = entryDate >= from;
        }
        if (dateTo) {
            const to = parseDMYEnd(dateTo);
            if (to) matchesDateTo = entryDate <= to;
        }

        return matchesAction && matchesSearch && matchesUser && matchesDepartment &&
            matchesDateFrom && matchesDateTo;
    });

    // Pagination
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const startItem = filteredData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, filteredData.length);

    const getActionBadge = (actionType: string) => {
        const styles = {
            create: "bg-blue-50 text-blue-700 border-blue-200",
            edit: "bg-amber-50 text-amber-700 border-amber-200",
            review: "bg-purple-50 text-purple-700 border-purple-200",
            approve: "bg-emerald-50 text-emerald-700 border-emerald-200",
            reject: "bg-red-50 text-red-700 border-red-200",
            download: "bg-emerald-50 text-emerald-700 border-emerald-200",
            print: "bg-slate-50 text-slate-700 border-slate-200",
            view: "bg-slate-50 text-slate-600 border-slate-200"
        };
        return styles[actionType as keyof typeof styles] || styles.view;
    };

    const openChangesModal = (entry: AuditEntry) => {
        setSelectedEntry(entry);
        setShowChangesModal(true);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Filter Section */}
            <div className="bg-white w-full mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4 items-end">
                    {/* Row 1: Search, Action Type, User */}

                    {/* Search */}
                    <div className="md:col-span-2 xl:col-span-4 w-full">
                        <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
                            Search
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder="Search by user or action..."
                                className="block w-full pl-10 pr-3 h-9 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-colors placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    {/* Action Filter */}
                    <div className="xl:col-span-4 w-full">
                        <Select
                            label="Action Type"
                            value={selectedAction}
                            onChange={(value) => {
                                setSelectedAction(value as string);
                                setCurrentPage(1);
                            }}
                            options={actionTypeOptions}
                            placeholder="All Actions"
                            searchPlaceholder="Search actions..."
                        />
                    </div>

                    {/* User Filter */}
                    <div className="xl:col-span-4 w-full">
                        <Select
                            label="User"
                            value={selectedUser}
                            onChange={(value) => {
                                setSelectedUser(value as string);
                                setCurrentPage(1);
                            }}
                            options={userOptions}
                            placeholder="All Users"
                            searchPlaceholder="Search users..."
                        />
                    </div>

                    {/* Row 2: Department, Date From, Date To */}

                    {/* Department Filter */}
                    <div className="xl:col-span-4 w-full">
                        <Select
                            label="Department"
                            value={selectedDepartment}
                            onChange={(value) => {
                                setSelectedDepartment(value as string);
                                setCurrentPage(1);
                            }}
                            options={departmentOptions}
                            placeholder="All Departments"
                            searchPlaceholder="Search departments..."
                        />
                    </div>

                    {/* Date Picker */}
                    <div className="md:col-span-2 xl:col-span-4 w-full">
                        <DateRangePicker
                            label="Timestamp Date Range"
                            startDate={dateFrom}
                            endDate={dateTo}
                            onStartDateChange={(dateStr) => {
                                setDateFrom(dateStr);
                                setCurrentPage(1);
                            }}
                            onEndDateChange={(dateStr) => {
                                setDateTo(dateStr);
                                setCurrentPage(1);
                            }}
                            placeholder="Select date range"
                            includeTime={true}
                        />
                    </div>
                </div>
            </div>

            {/* Audit Trail Table */}
            <div className="flex-1 overflow-hidden border rounded-xl bg-white shadow-sm flex flex-col">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-30">
                            <tr>
                                <th className="px-2 py-2.5 sm:px-4 sm:py-3.5 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                    No.
                                </th>
                                <th className="px-2 py-2.5 sm:px-4 sm:py-3.5 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                    Timestamp
                                </th>
                                <th className="px-2 py-2.5 sm:px-4 sm:py-3.5 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                    User
                                </th>
                                <th className="px-2 py-2.5 sm:px-4 sm:py-3.5 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                    Action
                                </th>
                                <th className="px-2 py-2.5 sm:px-4 sm:py-3.5 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                    Changes
                                </th>
                                <th className="px-2 py-2.5 sm:px-4 sm:py-3.5 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                    Reason
                                </th>
                                <th className="px-2 py-2.5 sm:px-4 sm:py-3.5 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                    IP / Device
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <History className="h-12 w-12 text-slate-300" />
                                            <div>
                                                <p className="text-xs sm:text-sm font-medium text-slate-700">No audit entries found</p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {searchQuery || selectedAction !== "all"
                                                        ? "Try adjusting your filters or search query"
                                                        : "No audit trail records available for this document"}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((entry, index) => (
                                    <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                                        {/* số thứ tự */}
                                        <td className="px-2 py-2 sm:px-4 sm:py-4 whitespace-nowrap text-center">
                                            <div className="text-xs sm:text-sm text-slate-500">{(currentPage - 1) * itemsPerPage + index + 1}</div>
                                        </td>
                                        {/* Timestamp */}
                                        <td className="px-2 py-2 sm:px-4 sm:py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5 sm:gap-2">
                                                <div>
                                                    <div className="text-xs sm:text-sm font-medium text-slate-900">
                                                        {entry.timestamp.split('')[1]}
                                                    </div>
                                                    <div className="text-[10px] sm:text-xs text-slate-500">
                                                        {entry.timestamp.split('')[0]}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* User */}
                                        <td className="px-2 py-2 sm:px-4 sm:py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-xs sm:text-sm font-medium text-slate-900">
                                                    {entry.user.name}
                                                </div>
                                                <div className="text-[10px] sm:text-xs text-slate-600">
                                                    {entry.user.role}
                                                </div>
                                                <div className="text-[10px] sm:text-xs text-slate-500">
                                                    {entry.user.department}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Action */}
                                        <td className="px-2 py-2 sm:px-4 sm:py-4 whitespace-nowrap">
                                            <span className={cn(
                                                "inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border",
                                                getActionBadge(entry.actionType)
                                            )}>
                                                {entry.action}
                                            </span>
                                        </td>

                                        {/* Changes */}
                                        <td className="px-2 py-2 sm:px-4 sm:py-4 whitespace-nowrap">
                                            {entry.changes && entry.changes.length > 0 ? (
                                                <button
                                                    onClick={() => openChangesModal(entry)}
                                                    className="flex items-center gap-1.5 text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 hover:underline"
                                                >
                                                    {entry.changes.length} field{entry.changes.length > 1 ? 's' : ''} changed
                                                </button>
                                            ) : (
                                                <span className="text-xs sm:text-sm text-slate-400">No changes</span>
                                            )}
                                        </td>

                                        {/* Reason */}
                                        <td className="px-2 py-2 sm:px-4 sm:py-4 whitespace-nowrap">
                                            {entry.reason ? (
                                                <p className="text-xs sm:text-sm text-slate-700">{entry.reason}</p>
                                            ) : (
                                                <span className="text-xs sm:text-sm text-slate-400">—</span>
                                            )}
                                        </td>

                                        {/* IP / Device */}
                                        <td className="px-2 py-2 sm:px-4 sm:py-4 whitespace-nowrap">
                                            <div className="flex items-start gap-1.5 sm:gap-2">
                                                <Monitor className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <div className="text-[10px] sm:text-xs text-slate-700">
                                                        {entry.ipAddress}
                                                    </div>
                                                    <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5">
                                                        {entry.device}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <TablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredData.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={setItemsPerPage}
                />
            </div>

            {/* Changes Detail Modal */}
            <FormModal
                isOpen={showChangesModal}
                onClose={() => setShowChangesModal(false)}
                title="Change Details"
                description={selectedEntry && (
                    <span className="text-sm text-slate-600 mt-0.5">
                        {selectedEntry.action} by {selectedEntry.user.name} on {selectedEntry.timestamp}
                    </span>
                )}
                confirmText="Close"
                onConfirm={() => setShowChangesModal(false)}
                showCancel={false}
                size="xl"
            >
                {selectedEntry && (
                    <>
                        {selectedEntry.changes && selectedEntry.changes.length > 0 ? (
                            <div className="space-y-4">
                                {selectedEntry.changes.map((change, index) => (
                                    <div key={index} className="border border-slate-200 rounded-lg p-4">
                                        <div className="text-xs sm:text-sm font-semibold text-slate-900 mb-3">
                                            {change.field}
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3">
                                            <div className="bg-red-50/50 border border-red-100 rounded-lg p-3">
                                                <div className="text-[10px] uppercase tracking-wider font-bold text-red-600 mb-1.5 flex items-center gap-1.5">
                                                    Old Value
                                                </div>
                                                <div className="text-xs sm:text-sm text-slate-700 break-words bg-white/60 p-2 rounded-lg border border-red-100 min-h-[2.5rem]">
                                                    {change.oldValue || <span className="text-slate-400 italic">None</span>}
                                                </div>
                                            </div>
                                            <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-3">
                                                <div className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 mb-1.5 flex items-center gap-1.5">
                                                    New Value
                                                </div>
                                                <div className="text-xs sm:text-sm text-slate-700 break-words bg-white/60 p-2 rounded-lg border border-emerald-100 min-h-[2.5rem]">
                                                    {change.newValue || <span className="text-slate-400 italic">None</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 text-center py-8">No changes recorded</p>
                        )}

                        {selectedEntry.reason && (
                            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <div className="text-[10px] uppercase tracking-wider font-bold text-amber-700 mb-1.5 flex items-center gap-1.5">Reason for Change</div>
                                <div className="text-xs sm:text-sm text-slate-700">{selectedEntry.reason}</div>
                            </div>
                        )}
                    </>
                )}
            </FormModal>
        </div>
    );
};
