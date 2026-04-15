import React, { useState, useMemo } from "react";
import {
    Search,
    X,
    Calendar,
    TrendingUp,
    Plus,
    MoreVertical,
    Clock,
    Download,
    CheckCircle,
    ArrowRightLeft,
} from "lucide-react";
import { IconPlus } from "@tabler/icons-react";
import { PageHeader } from "@/components/ui/page/PageHeader";
import { changeControl } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import { DateTimePicker } from "@/components/ui/datetime-picker/DateTimePicker";
import { StatusBadge } from "@/components/ui";
import { TablePagination } from "@/components/ui/table/TablePagination";
import { TableEmptyState } from "@/components/ui/table/TableEmptyState";
import { cn } from "@/components/ui/utils";
import {
    ChangeControl,
    ChangeControlFilters,
    ChangeStatus,
    ChangeType,
    ChangeImpact,
} from "./types";
import { MOCK_CHANGES } from "./mockData";

// ============================================================================
// COMPONENT
// ============================================================================
export const ChangeControlView: React.FC = () => {
    const [filters, setFilters] = useState<ChangeControlFilters>({
        searchQuery: "",
        typeFilter: "All",
        impactFilter: "All",
        statusFilter: "All",
        dateFrom: "",
        dateTo: "",
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const typeOptions = [
        { label: "All Types", value: "All" },
        { label: "Process Change", value: "Process Change" },
        { label: "Equipment Change", value: "Equipment Change" },
        { label: "Material Change", value: "Material Change" },
        { label: "Specification Change", value: "Specification Change" },
        { label: "Facility Change", value: "Facility Change" },
        { label: "Cleaning Procedure", value: "Cleaning Procedure" },
        { label: "Analytical Method", value: "Analytical Method" },
    ];

    const impactOptions = [
        { label: "All Impact", value: "All" },
        { label: "Low", value: "Low" },
        { label: "Medium", value: "Medium" },
        { label: "High", value: "High" },
    ];

    const statusOptions = [
        { label: "All Status", value: "All" },
        { label: "Draft", value: "Draft" },
        { label: "Submitted", value: "Submitted" },
        { label: "Impact Assessment", value: "Impact Assessment" },
        { label: "Pending Approval", value: "Pending Approval" },
        { label: "Approved", value: "Approved" },
        { label: "Implementation", value: "Implementation" },
        { label: "Verification", value: "Verification" },
        { label: "Closed", value: "Closed" },
        { label: "Rejected", value: "Rejected" },
    ];

    const filteredData = useMemo(() => {
        return MOCK_CHANGES.filter((item) => {
            const matchesSearch =
                item.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                item.changeId.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(filters.searchQuery.toLowerCase());
            const matchesType = filters.typeFilter === "All" || item.type === filters.typeFilter;
            const matchesImpact = filters.impactFilter === "All" || item.impact === filters.impactFilter;
            const matchesStatus = filters.statusFilter === "All" || item.status === filters.statusFilter;
            const matchesDateFrom = !filters.dateFrom || item.initiatedDate >= filters.dateFrom;
            const matchesDateTo = !filters.dateTo || item.initiatedDate <= filters.dateTo;
            return matchesSearch && matchesType && matchesImpact && matchesStatus && matchesDateFrom && matchesDateTo;
        });
    }, [MOCK_CHANGES, filters]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredData, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const getStatusColor = (status: ChangeStatus) => {
        switch (status) {
            case "Draft": return "draft" as const;
            case "Submitted": return "pendingReview" as const;
            case "Impact Assessment": return "pendingReview" as const;
            case "Pending Approval": return "pendingApproval" as const;
            case "Approved": return "approved" as const;
            case "Implementation": return "inProgress" as const;
            case "Verification": return "pendingApproval" as const;
            case "Closed": return "effective" as const;
            case "Rejected": return "rejected" as const;
            default: return "draft" as const;
        }
    };

    const getImpactColor = (impact: ChangeImpact) => {
        switch (impact) {
            case "High": return "bg-red-50 text-red-700 border-red-200";
            case "Medium": return "bg-orange-50 text-orange-700 border-orange-200";
            case "Low": return "bg-emerald-50 text-emerald-700 border-emerald-200";
        }
    };

    return (
        <div className="space-y-6 w-full flex-1 flex flex-col">
            {/* Header */}
            <PageHeader
                title="Change Controls"
                breadcrumbItems={changeControl()}
                actions={
                    <>
                        <Button onClick={() => { }} variant="outline" size="sm" className="whitespace-nowrap gap-2">
                            <Download className="h-4 w-4" />
                            Export
                        </Button>
                        <Button onClick={() => { }} size="sm" className="whitespace-nowrap gap-2">
                            <IconPlus className="h-4 w-4" />
                            New Change Request
                        </Button>
                    </>
                }
            />

            {/* Filters */}
            <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-9 gap-4 items-end">
                    <div className="md:col-span-2 xl:col-span-3">
                        <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">Search</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by title, ID, or description..."
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
                        <Select label="Change Type" value={filters.typeFilter} onChange={(v) => setFilters({ ...filters, typeFilter: v as ChangeType | "All" })} options={typeOptions} />
                    </div>
                    <div className="xl:col-span-3">
                        <Select label="Impact" value={filters.impactFilter} onChange={(v) => setFilters({ ...filters, impactFilter: v as ChangeImpact | "All" })} options={impactOptions} />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4 items-end mt-4">
                    <div className="xl:col-span-2">
                        <Select label="Status" value={filters.statusFilter} onChange={(v) => setFilters({ ...filters, statusFilter: v as ChangeStatus | "All" })} options={statusOptions} />
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
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <ArrowRightLeft className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-600 font-medium">Total Changes</p>
                            <p className="text-2xl font-bold text-slate-900">{MOCK_CHANGES.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-600 font-medium">Pending</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {MOCK_CHANGES.filter((c) => ["Submitted", "Impact Assessment", "Pending Approval"].includes(c.status)).length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-600 font-medium">In Progress</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {MOCK_CHANGES.filter((c) => ["Implementation", "Verification"].includes(c.status)).length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-cyan-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-600 font-medium">Closed</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {MOCK_CHANGES.filter((c) => c.status === "Closed").length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="border rounded-xl bg-white shadow-sm overflow-hidden flex flex-col">
                {paginatedData.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[820px] md:min-w-[980px] lg:min-w-[1120px] xl:min-w-[1260px]">
                                <thead className="bg-slate-50/80 border-b-2 border-slate-200 sticky top-0 z-30">
                                    <tr>
                                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap w-10 sm:w-16">No.</th>
                                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">ID</th>
                                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Title</th>
                                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">Type</th>
                                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Impact</th>
                                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">Assigned To</th>
                                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">Target Date</th>
                                        <th className="sticky right-0 bg-slate-50 py-2.5 px-2 sm:py-3.5 sm:px-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider z-[1] whitespace-nowrap before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-200 shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.05)]">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white">
                                    {paginatedData.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors cursor-pointer group">
                                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-900">
                                                {(currentPage - 1) * itemsPerPage + index + 1}
                                            </td>
                                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                                                <span className="font-medium text-emerald-600">{item.changeId}</span>
                                            </td>
                                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-900 font-medium max-w-xs truncate">
                                                {item.title}
                                            </td>
                                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-700 hidden md:table-cell">{item.type}</td>
                                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                                                <span className={cn("inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border", getImpactColor(item.impact))}>
                                                    {item.impact}
                                                </span>
                                            </td>
                                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                                                <StatusBadge status={getStatusColor(item.status)} />
                                            </td>
                                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-900 hidden lg:table-cell">{item.assignedTo}</td>
                                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-900 hidden md:table-cell">
                                                {new Date(item.targetDate).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })}
                                            </td>
                                            <td
                                                onClick={(e) => e.stopPropagation()}
                                                className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-center sticky right-0 bg-white z-30 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-200 shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.05)] group-hover:bg-slate-50"
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
                        title="No Change Controls Found"
                        description="No change control records match your current filters. Try adjusting your search criteria or clear filters."
                        actionLabel="Clear Filters"
                        onAction={() => {
                            setFilters({ searchQuery: "", typeFilter: "All", impactFilter: "All", statusFilter: "All", dateFrom: "", dateTo: "" });
                            setCurrentPage(1);
                        }}
                    />
                )}
            </div>
        </div>
    );
};






