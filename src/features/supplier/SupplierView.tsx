import React, { useState, useMemo } from "react";
import {
    Search,
    X,
    TrendingUp,
    MoreVertical,
    Download,
    CheckCircle,
    AlertTriangle,
    Building2,
    ShieldCheck,
} from "lucide-react";
import { IconPlus } from "@tabler/icons-react";
import { PageHeader } from "@/components/ui/page/PageHeader";
import { supplier } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import { StatusBadge } from "@/components/ui";
import { TablePagination } from "@/components/ui/table/TablePagination";
import { TableEmptyState } from "@/components/ui/table/TableEmptyState";
import { cn } from "@/components/ui/utils";
import {
    Supplier,
    SupplierFilters,
    SupplierStatus,
    SupplierCategory,
    SupplierRiskRating,
} from "./types";
import { MOCK_SUPPLIERS } from "./mockData";

// ============================================================================
// COMPONENT
// ============================================================================
export const SupplierView: React.FC = () => {
    const [filters, setFilters] = useState<SupplierFilters>({
        searchQuery: "",
        categoryFilter: "All",
        statusFilter: "All",
        riskFilter: "All",
        dateFrom: "",
        dateTo: "",
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const categoryOptions = [
        { label: "All Categories", value: "All" },
        { label: "API Manufacturer", value: "API Manufacturer" },
        { label: "Excipient Supplier", value: "Excipient Supplier" },
        { label: "Packaging Material", value: "Packaging Material" },
        { label: "Contract Manufacturer", value: "Contract Manufacturer" },
        { label: "Laboratory Service", value: "Laboratory Service" },
        { label: "Equipment Vendor", value: "Equipment Vendor" },
        { label: "Logistics Provider", value: "Logistics Provider" },
    ];

    const statusOptions = [
        { label: "All Status", value: "All" },
        { label: "Qualified", value: "Qualified" },
        { label: "Conditionally Approved", value: "Conditionally Approved" },
        { label: "Under Evaluation", value: "Under Evaluation" },
        { label: "Audit Scheduled", value: "Audit Scheduled" },
        { label: "Suspended", value: "Suspended" },
        { label: "Disqualified", value: "Disqualified" },
        { label: "New", value: "New" },
    ];

    const riskOptions = [
        { label: "All Risk Levels", value: "All" },
        { label: "Low", value: "Low" },
        { label: "Medium", value: "Medium" },
        { label: "High", value: "High" },
        { label: "Critical", value: "Critical" },
    ];

    const filteredData = useMemo(() => {
        return MOCK_SUPPLIERS.filter((item) => {
            const matchesSearch =
                item.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                item.supplierId.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                item.country.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                item.contactPerson.toLowerCase().includes(filters.searchQuery.toLowerCase());
            const matchesCategory = filters.categoryFilter === "All" || item.category === filters.categoryFilter;
            const matchesStatus = filters.statusFilter === "All" || item.status === filters.statusFilter;
            const matchesRisk = filters.riskFilter === "All" || item.riskRating === filters.riskFilter;
            return matchesSearch && matchesCategory && matchesStatus && matchesRisk;
        });
    }, [MOCK_SUPPLIERS, filters]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredData, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const getStatusColor = (status: SupplierStatus) => {
        switch (status) {
            case "Qualified": return "approved" as const;
            case "Conditionally Approved": return "pendingApproval" as const;
            case "Under Evaluation": return "pendingReview" as const;
            case "Audit Scheduled": return "inProgress" as const;
            case "Suspended": return "rejected" as const;
            case "Disqualified": return "obsolete" as const;
            case "New": return "draft" as const;
            default: return "draft" as const;
        }
    };

    const getRiskColor = (risk: SupplierRiskRating) => {
        switch (risk) {
            case "Critical": return "bg-red-100 text-red-800 border-red-300";
            case "High": return "bg-orange-50 text-orange-700 border-orange-200";
            case "Medium": return "bg-amber-50 text-amber-700 border-amber-200";
            case "Low": return "bg-emerald-50 text-emerald-700 border-emerald-200";
        }
    };

    return (
        <div className="space-y-6 w-full flex-1 flex flex-col">
            {/* Header */}
            <PageHeader
                title="Supplier Management"
                breadcrumbItems={supplier()}
                actions={
                    <>
                        <Button onClick={() => { }} variant="outline" size="sm" className="whitespace-nowrap gap-2">
                            <Download className="h-4 w-4" />
                            Export
                        </Button>
                        <Button onClick={() => { }} size="sm" className="whitespace-nowrap gap-2">
                            <IconPlus className="h-4 w-4" />
                            Add Supplier
                        </Button>
                    </>
                }
            />

            {/* Filters */}
            <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-2 xl:col-span-3">
                        <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">Search</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by name, ID, country..."
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
                        <Select label="Category" value={filters.categoryFilter} onChange={(v) => setFilters({ ...filters, categoryFilter: v as SupplierCategory | "All" })} options={categoryOptions} />
                    </div>
                    <div className="xl:col-span-3">
                        <Select label="Status" value={filters.statusFilter} onChange={(v) => setFilters({ ...filters, statusFilter: v as SupplierStatus | "All" })} options={statusOptions} />
                    </div>
                    <div className="xl:col-span-3">
                        <Select label="Risk Rating" value={filters.riskFilter} onChange={(v) => setFilters({ ...filters, riskFilter: v as SupplierRiskRating | "All" })} options={riskOptions} />
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-600 font-medium">Total Suppliers</p>
                            <p className="text-2xl font-bold text-slate-900">{MOCK_SUPPLIERS.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <ShieldCheck className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-600 font-medium">Qualified</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {MOCK_SUPPLIERS.filter((s) => s.status === "Qualified").length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-600 font-medium">Under Review</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {MOCK_SUPPLIERS.filter((s) => ["Under Evaluation", "Conditionally Approved"].includes(s.status)).length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-600 font-medium">Suspended</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {MOCK_SUPPLIERS.filter((s) => ["Suspended", "Disqualified"].includes(s.status)).length}
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
                            <table className="w-full min-w-[820px] md:min-w-[980px] lg:min-w-[1140px] xl:min-w-[1280px]">
                                <thead className="bg-slate-50 border-b-2 border-slate-200 sticky top-0 z-30">
                                    <tr>
                                        <th className="py-2.5 px-2 md:py-3.5 md:px-4 text-left text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">No.</th>
                                        <th className="py-2.5 px-2 md:py-3.5 md:px-4 text-left text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">ID</th>
                                        <th className="py-2.5 px-2 md:py-3.5 md:px-4 text-left text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Name</th>
                                        <th className="py-2.5 px-2 md:py-3.5 md:px-4 text-left text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Category</th>
                                        <th className="py-2.5 px-2 md:py-3.5 md:px-4 text-left text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Risk</th>
                                        <th className="py-2.5 px-2 md:py-3.5 md:px-4 text-left text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                                        <th className="py-2.5 px-2 md:py-3.5 md:px-4 text-left text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">Country</th>
                                        <th className="py-2.5 px-2 md:py-3.5 md:px-4 text-left text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">Next Audit</th>
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
                                                <span className="font-medium text-emerald-600">{item.supplierId}</span>
                                            </td>
                                            <td className="py-2.5 px-2 md:py-3 md:px-4 text-xs md:text-sm whitespace-nowrap text-slate-900 font-medium max-w-xs truncate">
                                                {item.name}
                                            </td>
                                            <td className="py-2.5 px-2 md:py-3 md:px-4 text-xs md:text-sm whitespace-nowrap text-slate-700">{item.category}</td>
                                            <td className="py-2.5 px-2 md:py-3 md:px-4 text-xs md:text-sm whitespace-nowrap">
                                                <span className={cn("inline-flex items-center px-2 py-0.5 sm:px-2 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border", getRiskColor(item.riskRating))}>
                                                    {item.riskRating}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-2 md:py-3 md:px-4 text-xs md:text-sm whitespace-nowrap">
                                                <StatusBadge status={getStatusColor(item.status)} />
                                            </td>
                                            <td className="py-2.5 px-2 md:py-3 md:px-4 text-xs md:text-sm whitespace-nowrap text-slate-700 hidden lg:table-cell">{item.country}</td>
                                            <td className="py-2.5 px-2 md:py-3 md:px-4 text-xs md:text-sm whitespace-nowrap text-slate-900 hidden md:table-cell">
                                                {item.nextAuditDate ? new Date(item.nextAuditDate).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—"}
                                            </td>
                                            <td
                                                onClick={(e) => e.stopPropagation()}
                                                className="py-2.5 px-2 md:py-3 md:px-4 text-xs md:text-sm text-center sticky right-0 bg-white z-30 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-200 shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.05)] group-hover:bg-slate-50"
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
                        title="No Suppliers Found"
                        description="No supplier records match your current filters. Try adjusting your search criteria."
                        actionLabel="Clear Filters"
                        onAction={() => {
                            setFilters({ searchQuery: "", categoryFilter: "All", statusFilter: "All", riskFilter: "All", dateFrom: "", dateTo: "" });
                            setCurrentPage(1);
                        }}
                    />
                )}
            </div>
        </div>
    );
};




