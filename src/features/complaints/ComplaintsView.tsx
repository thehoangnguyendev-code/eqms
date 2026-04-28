import React, { useState, useMemo } from "react";
import {
    Search,
    X,
    TrendingUp,
    MoreVertical,
    Clock,
    Download,
    CheckCircle,
    AlertTriangle,
    MessageSquareWarning,
} from "lucide-react";
import { IconPlus } from "@tabler/icons-react";
import { PageHeader } from "@/components/ui/page/PageHeader";
import { complaints } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import { DateTimePicker } from "@/components/ui/datetime-picker/DateTimePicker";
import { StatusBadge } from "@/components/ui";
import { TablePagination } from "@/components/ui/table/TablePagination";
import { TableEmptyState } from "@/components/ui/table/TableEmptyState";
import { cn } from "@/components/ui/utils";
import {
    Complaint,
    ComplaintFilters,
    ComplaintStatus,
    ComplaintType,
    ComplaintPriority,
    ComplaintSource,
} from "./types";
import { MOCK_COMPLAINTS } from "./mockData";

// ============================================================================
// COMPONENT
// ============================================================================
export const ComplaintsView: React.FC = () => {
    const [filters, setFilters] = useState<ComplaintFilters>({
        searchQuery: "",
        typeFilter: "All",
        priorityFilter: "All",
        statusFilter: "All",
        sourceFilter: "All",
        dateFrom: "",
        dateTo: "",
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const typeOptions = [
        { label: "All Types", value: "All" },
        { label: "Product Quality", value: "Product Quality" },
        { label: "Adverse Event", value: "Adverse Event" },
        { label: "Packaging", value: "Packaging" },
        { label: "Labeling", value: "Labeling" },
        { label: "Delivery", value: "Delivery" },
        { label: "Counterfeit Suspicion", value: "Counterfeit Suspicion" },
        { label: "Stability", value: "Stability" },
    ];

    const priorityOptions = [
        { label: "All Priority", value: "All" },
        { label: "Critical", value: "Critical" },
        { label: "High", value: "High" },
        { label: "Medium", value: "Medium" },
        { label: "Low", value: "Low" },
    ];

    const statusOptions = [
        { label: "All Status", value: "All" },
        { label: "Received", value: "Received" },
        { label: "Under Investigation", value: "Under Investigation" },
        { label: "Pending Review", value: "Pending Review" },
        { label: "Root Cause Identified", value: "Root Cause Identified" },
        { label: "CAPA Initiated", value: "CAPA Initiated" },
        { label: "Closed", value: "Closed" },
        { label: "Rejected", value: "Rejected" },
    ];

    const sourceOptions = [
        { label: "All Sources", value: "All" },
        { label: "Customer", value: "Customer" },
        { label: "Healthcare Professional", value: "Healthcare Professional" },
        { label: "Patient", value: "Patient" },
        { label: "Regulatory Authority", value: "Regulatory Authority" },
        { label: "Distributor", value: "Distributor" },
        { label: "Internal", value: "Internal" },
    ];

    const filteredData = useMemo(() => {
        return MOCK_COMPLAINTS.filter((item) => {
            const matchesSearch =
                item.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                item.complaintId.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(filters.searchQuery.toLowerCase());
            const matchesType = filters.typeFilter === "All" || item.type === filters.typeFilter;
            const matchesPriority = filters.priorityFilter === "All" || item.priority === filters.priorityFilter;
            const matchesStatus = filters.statusFilter === "All" || item.status === filters.statusFilter;
            const matchesSource = filters.sourceFilter === "All" || item.source === filters.sourceFilter;
            const matchesDateFrom = !filters.dateFrom || item.reportedDate >= filters.dateFrom;
            const matchesDateTo = !filters.dateTo || item.reportedDate <= filters.dateTo;
            return matchesSearch && matchesType && matchesPriority && matchesStatus && matchesSource && matchesDateFrom && matchesDateTo;
        });
    }, [MOCK_COMPLAINTS, filters]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredData, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const getStatusColor = (status: ComplaintStatus) => {
        switch (status) {
            case "Received": return "draft" as const;
            case "Under Investigation": return "pendingReview" as const;
            case "Pending Review": return "pendingReview" as const;
            case "Root Cause Identified": return "pendingApproval" as const;
            case "CAPA Initiated": return "inProgress" as const;
            case "Closed": return "effective" as const;
            case "Rejected": return "rejected" as const;
            default: return "draft" as const;
        }
    };

    const getPriorityColor = (priority: ComplaintPriority) => {
        switch (priority) {
            case "Critical": return "bg-red-50 text-red-700 border-red-200";
            case "High": return "bg-orange-50 text-orange-700 border-orange-200";
            case "Medium": return "bg-amber-50 text-amber-700 border-amber-200";
            case "Low": return "bg-emerald-50 text-emerald-700 border-emerald-200";
        }
    };

    return (
        <div className="space-y-6 w-full flex-1 flex flex-col">
            {/* Header */}
            <PageHeader
                title="Complaints Management"
                breadcrumbItems={complaints()}
                actions={
                    <>
                        <Button onClick={() => { }} variant="outline" size="sm" className="whitespace-nowrap gap-2">
                            <Download className="h-4 w-4" />
                            Export
                        </Button>
                        <Button onClick={() => { }} size="sm" className="whitespace-nowrap gap-2">
                            <IconPlus className="h-4 w-4" />
                            Log Complaint
                        </Button>
                    </>
                }
            />

            {/* Filters */}
            <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-2 xl:col-span-4">
                        <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">Search</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by title, ID, description..."
                                value={filters.searchQuery}
                                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                                className="w-full h-9 pl-10 pr-10 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm placeholder:text-slate-400 transition-colors"
                            />
                            {filters.searchQuery && (
                                <button
                                    onClick={() => {
                                        setFilters({ ...filters, searchQuery: "" });
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
                    <div className="xl:col-span-3">
                        <Select label="Type" value={filters.typeFilter} onChange={(v) => setFilters({ ...filters, typeFilter: v as ComplaintType | "All" })} options={typeOptions} />
                    </div>
                    <div className="xl:col-span-2">
                        <Select label="Priority" value={filters.priorityFilter} onChange={(v) => setFilters({ ...filters, priorityFilter: v as ComplaintPriority | "All" })} options={priorityOptions} />
                    </div>
                    <div className="xl:col-span-3">
                        <Select label="Source" value={filters.sourceFilter} onChange={(v) => setFilters({ ...filters, sourceFilter: v as ComplaintSource | "All" })} options={sourceOptions} />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4 items-end mt-4">
                    <div className="xl:col-span-2">
                        <Select label="Status" value={filters.statusFilter} onChange={(v) => setFilters({ ...filters, statusFilter: v as ComplaintStatus | "All" })} options={statusOptions} />
                    </div>
                    <div className="xl:col-span-2">
                        <DateTimePicker label="From Date" value={filters.dateFrom} onChange={(v) => setFilters({ ...filters, dateFrom: v })} />
                    </div>
                    <div className="xl:col-span-2">
                        <DateTimePicker label="To Date" value={filters.dateTo} onChange={(v) => setFilters({ ...filters, dateTo: v })} />
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <MessageSquareWarning className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-600 font-medium">Total</p>
                            <p className="text-2xl font-bold text-slate-900">{MOCK_COMPLAINTS.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-600 font-medium">Open</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {MOCK_COMPLAINTS.filter((c) => !["Closed", "Rejected"].includes(c.status)).length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-600 font-medium">Critical</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {MOCK_COMPLAINTS.filter((c) => c.priority === "Critical").length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-cyan-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-600 font-medium">Resolved</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {MOCK_COMPLAINTS.filter((c) => c.status === "Closed").length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden flex flex-col">
                {paginatedData.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[820px] md:min-w-[980px] lg:min-w-[1120px] xl:min-w-[1260px]">
                                <thead className="bg-slate-50 border-b-2 border-slate-200 sticky top-0 z-30">
                                    <tr>
                                        <th className="py-2.5 px-2 md:py-3.5 md:px-4 text-left text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap w-10 sm:w-16">No.</th>
                                        <th className="py-2.5 px-2 md:py-3.5 md:px-4 text-left text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">ID</th>
                                        <th className="py-2.5 px-2 md:py-3.5 md:px-4 text-left text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Title</th>
                                        <th className="py-2.5 px-2 md:py-3.5 md:px-4 text-left text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">Type</th>
                                        <th className="py-2.5 px-2 md:py-3.5 md:px-4 text-left text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Priority</th>
                                        <th className="py-2.5 px-2 md:py-3.5 md:px-4 text-left text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                                        <th className="py-2.5 px-2 md:py-3.5 md:px-4 text-left text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">Source</th>
                                        <th className="py-2.5 px-2 md:py-3.5 md:px-4 text-left text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">Deadline</th>
                                        <th className="sticky right-0 bg-slate-50 py-2.5 px-2 md:py-3.5 md:px-4 text-center text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider z-[1] whitespace-nowrap before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-200 shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.05)]">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white">
                                    {paginatedData.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                                            <td className="py-2.5 px-2 md:py-3 md:px-4 text-xs md:text-sm whitespace-nowrap text-slate-900">
                                                {(currentPage - 1) * itemsPerPage + index + 1}
                                            </td>
                                            <td className="py-2.5 px-2 md:py-3 md:px-4 text-xs md:text-sm whitespace-nowrap">
                                                <span className="font-medium text-emerald-600">{item.complaintId}</span>
                                            </td>
                                            <td className="py-2.5 px-2 md:py-3 md:px-4 text-xs md:text-sm whitespace-nowrap text-slate-900 font-medium max-w-xs truncate">
                                                {item.title}
                                            </td>
                                            <td className="py-2.5 px-2 md:py-3 md:px-4 text-xs md:text-sm whitespace-nowrap text-slate-700 hidden md:table-cell">{item.type}</td>
                                            <td className="py-2.5 px-2 md:py-3 md:px-4 text-xs md:text-sm whitespace-nowrap">
                                                <span className={cn("inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border", getPriorityColor(item.priority))}>
                                                    {item.priority}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-2 md:py-3 md:px-4 text-xs md:text-sm whitespace-nowrap">
                                                <StatusBadge status={getStatusColor(item.status)} />
                                            </td>
                                            <td className="py-2.5 px-2 md:py-3 md:px-4 text-xs md:text-sm whitespace-nowrap text-slate-900 hidden lg:table-cell">{item.source}</td>
                                            <td className="py-2.5 px-2 md:py-3 md:px-4 text-xs md:text-sm whitespace-nowrap text-slate-900 hidden md:table-cell">
                                                {new Date(item.responseDeadline).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })}
                                            </td>
                                            <td
                                                onClick={(e) => e.stopPropagation()}
                                                className="py-2.5 px-2 md:py-3 md:px-4 text-xs md:text-sm text-center sticky right-0 bg-white z-30 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-200 shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.05)] group-hover:bg-slate-50"
                                            >
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); }}
                                                    className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-slate-100 transition-colors"
                                                    aria-label="More actions"
                                                >
                                                    <MoreVertical className="h-4 w-4 text-slate-600" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <TablePagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={filteredData.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                            onItemsPerPageChange={setItemsPerPage}
                        />
                    </>
                ) : (
                    <TableEmptyState
                        title="No Complaints Found"
                        description="No complaint records match your current filters. Try adjusting your search criteria."
                        actionLabel="Clear Filters"
                        onAction={() => {
                            setFilters({ searchQuery: "", typeFilter: "All", priorityFilter: "All", statusFilter: "All", sourceFilter: "All", dateFrom: "", dateTo: "" });
                            setCurrentPage(1);
                        }}
                    />
                )}
            </div>
        </div>
    );
};






