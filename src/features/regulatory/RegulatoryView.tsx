import React, { useState, useMemo } from "react";
import {
    Search,
    TrendingUp,
    MoreVertical,
    Download,
    CheckCircle,
    Clock,
    FileText,
    Scale,
} from "lucide-react";
import { IconPlus } from "@tabler/icons-react";
import { PageHeader } from "@/components/ui/page/PageHeader";
import { regulatory } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import { DateTimePicker } from "@/components/ui/datetime-picker/DateTimePicker";
import { StatusBadge } from "@/components/ui";
import { TablePagination } from "@/components/ui/table/TablePagination";
import { TableEmptyState } from "@/components/ui/table/TableEmptyState";
import { cn } from "@/components/ui/utils";
import {
    RegulatorySubmission,
    RegulatoryFilters,
    SubmissionStatus,
    SubmissionType,
    RegulatoryAuthority,
} from "./types";
import { MOCK_SUBMISSIONS } from "./mockData";

// ============================================================================
// COMPONENT
// ============================================================================
export const RegulatoryView: React.FC = () => {
    const [filters, setFilters] = useState<RegulatoryFilters>({
        searchQuery: "",
        typeFilter: "All",
        authorityFilter: "All",
        statusFilter: "All",
        dateFrom: "",
        dateTo: "",
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const typeOptions = [
        { label: "All Types", value: "All" },
        { label: "Marketing Authorization Application", value: "Marketing Authorization Application" },
        { label: "Type IA Variation", value: "Type IA Variation" },
        { label: "Type IB Variation", value: "Type IB Variation" },
        { label: "Type II Variation", value: "Type II Variation" },
        { label: "Renewal", value: "Renewal" },
        { label: "PSUR/PBRER", value: "PSUR/PBRER" },
        { label: "GMP Certificate", value: "GMP Certificate" },
        { label: "Annual Report", value: "Annual Report" },
    ];

    const authorityOptions = [
        { label: "All Authorities", value: "All" },
        { label: "EMA", value: "EMA" },
        { label: "FDA", value: "FDA" },
        { label: "MHRA", value: "MHRA" },
        { label: "BfArM", value: "BfArM" },
        { label: "ANSM", value: "ANSM" },
        { label: "AIFA", value: "AIFA" },
        { label: "AEMPS", value: "AEMPS" },
        { label: "National Authority", value: "National Authority" },
    ];

    const statusOptions = [
        { label: "All Status", value: "All" },
        { label: "Draft", value: "Draft" },
        { label: "Submitted", value: "Submitted" },
        { label: "Under Review", value: "Under Review" },
        { label: "Questions Received", value: "Questions Received" },
        { label: "Response Submitted", value: "Response Submitted" },
        { label: "Approved", value: "Approved" },
        { label: "Refused", value: "Refused" },
        { label: "Withdrawn", value: "Withdrawn" },
    ];

    const filteredData = useMemo(() => {
        return MOCK_SUBMISSIONS.filter((item) => {
            const matchesSearch =
                item.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                item.submissionId.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(filters.searchQuery.toLowerCase());
            const matchesType = filters.typeFilter === "All" || item.type === filters.typeFilter;
            const matchesAuthority = filters.authorityFilter === "All" || item.authority === filters.authorityFilter;
            const matchesStatus = filters.statusFilter === "All" || item.status === filters.statusFilter;
            const submDate = item.submissionDate || item.createdAt.split("T")[0];
            const matchesDateFrom = !filters.dateFrom || submDate >= filters.dateFrom;
            const matchesDateTo = !filters.dateTo || submDate <= filters.dateTo;
            return matchesSearch && matchesType && matchesAuthority && matchesStatus && matchesDateFrom && matchesDateTo;
        });
    }, [MOCK_SUBMISSIONS, filters]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredData, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const getStatusColor = (status: SubmissionStatus) => {
        switch (status) {
            case "Draft": return "draft" as const;
            case "Submitted": return "pendingReview" as const;
            case "Under Review": return "pendingApproval" as const;
            case "Questions Received": return "blocked" as const;
            case "Response Submitted": return "inProgress" as const;
            case "Approved": return "effective" as const;
            case "Refused": return "rejected" as const;
            case "Withdrawn": return "archived" as const;
            default: return "draft" as const;
        }
    };

    const getAuthorityBadge = (authority: RegulatoryAuthority) => {
        const colors: Record<string, string> = {
            "EMA": "bg-blue-50 text-blue-700 border-blue-200",
            "FDA": "bg-indigo-50 text-indigo-700 border-indigo-200",
            "MHRA": "bg-purple-50 text-purple-700 border-purple-200",
            "BfArM": "bg-emerald-50 text-emerald-700 border-emerald-200",
            "ANSM": "bg-cyan-50 text-cyan-700 border-cyan-200",
            "AIFA": "bg-amber-50 text-amber-700 border-amber-200",
            "AEMPS": "bg-orange-50 text-orange-700 border-orange-200",
            "National Authority": "bg-slate-50 text-slate-700 border-slate-200",
        };
        return colors[authority] || "bg-slate-50 text-slate-700 border-slate-200";
    };

    return (
        <div className="space-y-6 w-full flex-1 flex flex-col">
            {/* Header */}
            <PageHeader
                title="Regulatory Management"
                breadcrumbItems={regulatory()}
                actions={
                    <>
                        <Button onClick={() => { }} variant="outline" size="sm" className="whitespace-nowrap gap-2">
                            <Download className="h-4 w-4" />
                            Export
                        </Button>
                        <Button onClick={() => { }} size="sm" className="whitespace-nowrap gap-2">
                            <IconPlus className="h-4 w-4" />
                            New Submission
                        </Button>
                    </>
                }
            />

            {/* Filters */}
            <div className="bg-white p-4 lg:p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-2 xl:col-span-3">
                        <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">Search</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by title, ID, or reference..."
                                value={filters.searchQuery}
                                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                                className="w-full h-9 pl-10 pr-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm placeholder:text-slate-400 transition-colors"
                            />
                        </div>
                    </div>
                    <div className="xl:col-span-3">
                        <Select label="Submission Type" value={filters.typeFilter} onChange={(v) => setFilters({ ...filters, typeFilter: v as SubmissionType | "All" })} options={typeOptions} />
                    </div>
                    <div className="xl:col-span-3">
                        <Select label="Authority" value={filters.authorityFilter} onChange={(v) => setFilters({ ...filters, authorityFilter: v as RegulatoryAuthority | "All" })} options={authorityOptions} />
                    </div>
                    <div className="xl:col-span-3">
                        <Select label="Status" value={filters.statusFilter} onChange={(v) => setFilters({ ...filters, statusFilter: v as SubmissionStatus | "All" })} options={statusOptions} />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4 items-end mt-4">
                    <div className="xl:col-span-3">
                        <DateTimePicker label="From Date" value={filters.dateFrom} onChange={(v) => setFilters({ ...filters, dateFrom: v })} />
                    </div>
                    <div className="xl:col-span-3">
                        <DateTimePicker label="To Date" value={filters.dateTo} onChange={(v) => setFilters({ ...filters, dateTo: v })} />
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <Scale className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-600 font-medium">Total Submissions</p>
                            <p className="text-2xl font-bold text-slate-900">{MOCK_SUBMISSIONS.length}</p>
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
                                {MOCK_SUBMISSIONS.filter((s) => ["Draft", "Submitted", "Under Review", "Questions Received"].includes(s.status)).length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-600 font-medium">Under Review</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {MOCK_SUBMISSIONS.filter((s) => s.status === "Under Review").length}
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
                            <p className="text-xs text-slate-600 font-medium">Approved</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {MOCK_SUBMISSIONS.filter((s) => s.status === "Approved").length}
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
                            <table className="w-full">
                                <thead className="bg-slate-50/80 border-b-2 border-slate-200 sticky top-0 z-30">
                                    <tr>
                                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">No.</th>
                                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">ID</th>
                                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Title</th>
                                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Type</th>
                                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Authority</th>
                                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">Product</th>
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
                                                <span className="font-medium text-emerald-600">{item.submissionId}</span>
                                            </td>
                                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-900 font-medium max-w-xs truncate">
                                                {item.title}
                                            </td>
                                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-700">
                                                <span className="max-w-[140px] truncate inline-block">{item.type}</span>
                                            </td>
                                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                                                <span className={cn("inline-flex items-center px-2 py-0.5 sm:px-2 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border", getAuthorityBadge(item.authority))}>
                                                    {item.authority}
                                                </span>
                                            </td>
                                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                                                <StatusBadge status={getStatusColor(item.status)} />
                                            </td>
                                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-700 hidden lg:table-cell">
                                                <span className="max-w-[160px] truncate inline-block">{item.relatedProduct || "—"}</span>
                                            </td>
                                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-900 hidden md:table-cell">
                                                {new Date(item.targetDate).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })}
                                            </td>
                                            <td
                                                onClick={(e) => e.stopPropagation()}
                                                className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-center sticky right-0 bg-white z-30 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-200 shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.05)] group-hover:bg-slate-50"
                                            >
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); }}
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
                        title="No Submissions Found"
                        description="No regulatory submissions match your current filters. Try adjusting your search criteria."
                        actionLabel="Clear Filters"
                        onAction={() => {
                            setFilters({ searchQuery: "", typeFilter: "All", authorityFilter: "All", statusFilter: "All", dateFrom: "", dateTo: "" });
                            setCurrentPage(1);
                        }}
                    />
                )}
            </div>
        </div>
    );
};




