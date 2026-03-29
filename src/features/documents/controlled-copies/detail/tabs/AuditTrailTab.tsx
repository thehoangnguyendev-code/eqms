import React, { useState } from "react";
import { History, Search, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { cn } from "@/components/ui/utils";
import { Select, SelectOption } from "@/components/ui/select/Select";
import { Button } from "@/components/ui/button/Button";
import { DateTimePicker } from "@/components/ui/datetime-picker/DateTimePicker";
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
    actionType: "create" | "request" | "approve" | "distribute" | "obsolete" | "cancel" | "edit" | "download" | "print" | "view";
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
        id: "AUD-CC-001",
        timestamp: "2024-01-05 09:30:45",
        user: { name: "John Smith", role: "QA Manager", department: "Quality Assurance" },
        action: "Requested Controlled Copy",
        actionType: "request",
        reason: "New production line setup",
        ipAddress: "192.168.1.102",
        device: "Windows 11 Pro - Chrome 120"
    },
    {
        id: "AUD-CC-002",
        timestamp: "2024-01-05 10:15:22",
        user: { name: "Jane Doe", role: "QM", department: "Quality Management" },
        action: "Approved Request",
        actionType: "approve",
        reason: "Approved for printing",
        ipAddress: "192.168.1.105",
        device: "Windows 10 - Edge 120"
    },
    {
        id: "AUD-CC-003",
        timestamp: "2024-01-05 11:00:18",
        user: { name: "System", role: "Automated", department: "System" },
        action: "Copy Printed",
        actionType: "print",
        reason: "Controlled copy printed successfully",
        ipAddress: "192.168.1.1",
        device: "Server - Automated Process"
    },
    {
        id: "AUD-CC-004",
        timestamp: "2024-01-05 11:15:33",
        user: { name: "Document Controller", role: "Controller", department: "Document Control" },
        action: "Copy Issued",
        actionType: "distribute",
        reason: "Delivered to location",
        ipAddress: "192.168.1.110",
        device: "Windows 11 - Firefox 121"
    },
    {
        id: "AUD-CC-005",
        timestamp: "2024-01-05 11:30:00",
        user: { name: "System", role: "Automated", department: "System" },
        action: "Status Changed to Distributed",
        actionType: "distribute",
        reason: "Document received at location",
        ipAddress: "192.168.1.1",
        device: "Server - Automated Process"
    },
    {
        id: "AUD-CC-006",
        timestamp: "2024-01-06 14:20:45",
        user: { name: "Michael Brown", role: "Production Manager", department: "Production" },
        action: "Downloaded Copy",
        actionType: "download",
        reason: "Backup for production records",
        ipAddress: "192.168.1.115",
        device: "MacOS Sonoma - Safari 17"
    }
];

const actionTypeOptions: SelectOption[] = [
    { value: "all", label: "All Actions" },
    { value: "request", label: "Request" },
    { value: "approve", label: "Approve" },
    { value: "distribute", label: "Distribute" },
    { value: "obsolete", label: "Obsolete" },
    { value: "cancel", label: "Cancel" },
    { value: "edit", label: "Edit" },
    { value: "download", label: "Download" },
    { value: "print", label: "Print" }
];

const userOptions: SelectOption[] = [
    { value: "all", label: "All Users" },
    { value: "John Smith", label: "John Smith" },
    { value: "Jane Doe", label: "Jane Doe" },
    { value: "System", label: "System" },
    { value: "Document Controller", label: "Document Controller" },
    { value: "Michael Brown", label: "Michael Brown" }
];

const departmentOptions: SelectOption[] = [
    { value: "all", label: "All Departments" },
    { value: "Quality Assurance", label: "Quality Assurance" },
    { value: "Quality Management", label: "Quality Management" },
    { value: "Document Control", label: "Document Control" },
    { value: "Production", label: "Production" },
    { value: "System", label: "System" }
];

export const AuditTrailTab: React.FC = () => {
    const [selectedAction, setSelectedAction] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUser, setSelectedUser] = useState("all");
    const [selectedDepartment, setSelectedDepartment] = useState("all");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const filteredData = mockAuditData.filter((entry) => {
        const matchesAction = selectedAction === "all" || entry.actionType === selectedAction;
        const matchesSearch =
            entry.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.action.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesUser = selectedUser === "all" || entry.user.name === selectedUser;
        const matchesDepartment = selectedDepartment === "all" || entry.user.department === selectedDepartment;

        // Date filtering
        const entryDate = new Date(entry.timestamp);
        const matchesDateFrom = !dateFrom || entryDate >= new Date(dateFrom);
        const matchesDateTo = !dateTo || entryDate <= new Date(dateTo);

        return (
            matchesAction &&
            matchesSearch &&
            matchesUser &&
            matchesDepartment &&
            matchesDateFrom &&
            matchesDateTo
        );
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
            request: "bg-blue-50 text-blue-700 border-blue-200",
            approve: "bg-emerald-50 text-emerald-700 border-emerald-200",
            distribute: "bg-cyan-50 text-cyan-700 border-cyan-200",
            obsolete: "bg-amber-50 text-amber-700 border-amber-200",
            cancel: "bg-red-50 text-red-700 border-red-200",
            edit: "bg-purple-50 text-purple-700 border-purple-200",
            download: "bg-emerald-50 text-emerald-700 border-emerald-200",
            print: "bg-slate-50 text-slate-700 border-slate-200",
            view: "bg-slate-50 text-slate-600 border-slate-200"
        };
        return styles[actionType as keyof typeof styles] || styles.view;
    };

    return (
        <div className="flex flex-col h-full">
            {/* Filter Section */}
            <div className="bg-white w-full mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4 items-end">
                    {/* Search */}
                    <div className="md:col-span-2 xl:col-span-4 w-full">
                        <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">Search</label>
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
                        />
                    </div>

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
                        />
                    </div>

                    {/* Date From */}
                    <div className="xl:col-span-4 w-full">
                        <DateTimePicker
                            label="From Date"
                            value={dateFrom}
                            onChange={(dateStr) => {
                                setDateFrom(dateStr);
                                setCurrentPage(1);
                            }}
                            placeholder="Select start date"
                        />
                    </div>

                    {/* Date To */}
                    <div className="xl:col-span-4 w-full">
                        <DateTimePicker
                            label="To Date"
                            value={dateTo}
                            onChange={(dateStr) => {
                                setDateTo(dateStr);
                                setCurrentPage(1);
                            }}
                            placeholder="Select end date"
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
                                    <td colSpan={6} className="px-4 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <History className="h-12 w-12 text-slate-300" />
                                            <div>
                                                <p className="text-xs sm:text-sm font-medium text-slate-700">No audit entries found</p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {searchQuery || selectedAction !== "all"
                                                        ? "Try adjusting your filters or search query"
                                                        : "No audit trail records available for this controlled copy"}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((entry, index) => {
                                    const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;
                                    return (
                                        <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-2 py-2 sm:px-4 sm:py-3.5 text-center text-xs sm:text-sm text-slate-600 font-medium">
                                                {rowNumber}
                                            </td>
                                            <td className="px-2 py-2 sm:px-4 sm:py-3.5 text-xs sm:text-sm text-slate-700 whitespace-nowrap">
                                                {entry.timestamp}
                                            </td>
                                            <td className="px-2 py-2 sm:px-4 sm:py-3.5 text-xs sm:text-sm">
                                                <div>
                                                    <div className="font-medium text-slate-900">{entry.user.name}</div>
                                                    <div className="text-[10px] sm:text-xs text-slate-500">
                                                        {entry.user.role} - {entry.user.department}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-2 py-2 sm:px-4 sm:py-3.5 text-xs sm:text-sm whitespace-nowrap">
                                                <div className="flex items-center gap-1.5 sm:gap-2">
                                                    <span
                                                        className={cn(
                                                            "inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border",
                                                            getActionBadge(entry.actionType)
                                                        )}
                                                    >
                                                        {entry.action}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-2 py-2 sm:px-4 sm:py-3.5 text-xs sm:text-sm text-slate-700">
                                                <div className="max-w-xs">
                                                    {entry.reason || (
                                                        <span className="text-slate-400 italic">No reason provided</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-2 py-2 sm:px-4 sm:py-3.5 text-xs sm:text-sm">
                                                <div className="text-slate-700">
                                                    <div className="text-[10px] sm:text-xs">{entry.ipAddress}</div>
                                                    <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5">{entry.device}</div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredData.length > 0 && (
                    <TablePagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={filteredData.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={setItemsPerPage}
                    />
                )}
            </div>
        </div>
    );
};
