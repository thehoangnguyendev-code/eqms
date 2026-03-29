import React, { useState, useMemo } from "react";
import {
    Search,
    TrendingUp,
    MoreVertical,
    Download,
    CheckCircle,
    Pill,
    FlaskConical,
    Package,
} from "lucide-react";
import { IconPlus } from "@tabler/icons-react";
import { PageHeader } from "@/components/ui/page/PageHeader";
import { product } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import { StatusBadge } from "@/components/ui";
import { TablePagination } from "@/components/ui/table/TablePagination";
import { TableEmptyState } from "@/components/ui/table/TableEmptyState";
import { cn } from "@/components/ui/utils";
import {
    Product,
    ProductFilters,
    ProductStatus,
    ProductType,
    DosageForm,
} from "./types";
import { MOCK_PRODUCTS } from "./mockData";

// ============================================================================
// COMPONENT
// ============================================================================
export const ProductView: React.FC = () => {
    const [filters, setFilters] = useState<ProductFilters>({
        searchQuery: "",
        typeFilter: "All",
        statusFilter: "All",
        dosageFilter: "All",
        dateFrom: "",
        dateTo: "",
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const typeOptions = [
        { label: "All Types", value: "All" },
        { label: "Drug Substance", value: "Drug Substance" },
        { label: "Drug Product", value: "Drug Product" },
        { label: "Intermediate", value: "Intermediate" },
        { label: "Finished Product", value: "Finished Product" },
        { label: "Biological Product", value: "Biological Product" },
        { label: "Medical Device", value: "Medical Device" },
    ];

    const statusOptions = [
        { label: "All Status", value: "All" },
        { label: "Development", value: "Development" },
        { label: "Registered", value: "Registered" },
        { label: "Commercially Available", value: "Commercially Available" },
        { label: "Under Variation", value: "Under Variation" },
        { label: "Withdrawn", value: "Withdrawn" },
        { label: "Discontinued", value: "Discontinued" },
        { label: "Recall", value: "Recall" },
    ];

    const dosageOptions = [
        { label: "All Forms", value: "All" },
        { label: "Tablet", value: "Tablet" },
        { label: "Capsule", value: "Capsule" },
        { label: "Injection", value: "Injection" },
        { label: "Syrup", value: "Syrup" },
        { label: "Cream", value: "Cream" },
        { label: "Suspension", value: "Suspension" },
        { label: "Powder", value: "Powder" },
    ];

    const filteredData = useMemo(() => {
        return MOCK_PRODUCTS.filter((item) => {
            const matchesSearch =
                item.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                item.productId.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                item.activeIngredient.toLowerCase().includes(filters.searchQuery.toLowerCase());
            const matchesType = filters.typeFilter === "All" || item.type === filters.typeFilter;
            const matchesStatus = filters.statusFilter === "All" || item.status === filters.statusFilter;
            const matchesDosage = filters.dosageFilter === "All" || item.dosageForm === filters.dosageFilter;
            return matchesSearch && matchesType && matchesStatus && matchesDosage;
        });
    }, [MOCK_PRODUCTS, filters]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredData, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const getStatusColor = (status: ProductStatus) => {
        switch (status) {
            case "Development": return "draft" as const;
            case "Registered": return "approved" as const;
            case "Commercially Available": return "effective" as const;
            case "Under Variation": return "pendingReview" as const;
            case "Withdrawn": return "archived" as const;
            case "Discontinued": return "obsolete" as const;
            case "Recall": return "rejected" as const;
            default: return "draft" as const;
        }
    };

    return (
        <div className="space-y-6 w-full flex-1 flex flex-col">
            {/* Header */}
            <PageHeader
                title="Product Management"
                breadcrumbItems={product()}
                actions={
                    <>
                        <Button onClick={() => { }} variant="outline" size="sm" className="whitespace-nowrap gap-2">
                            <Download className="h-4 w-4" />
                            Export
                        </Button>
                        <Button onClick={() => { }} size="sm" className="whitespace-nowrap gap-2">
                            <IconPlus className="h-4 w-4" />
                            Add Product
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
                                placeholder="Search by name, ID, ingredient..."
                                value={filters.searchQuery}
                                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                                className="w-full h-9 pl-10 pr-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm placeholder:text-slate-400 transition-colors"
                            />
                        </div>
                    </div>
                    <div className="xl:col-span-3">
                        <Select label="Product Type" value={filters.typeFilter} onChange={(v) => setFilters({ ...filters, typeFilter: v as ProductType | "All" })} options={typeOptions} />
                    </div>
                    <div className="xl:col-span-3">
                        <Select label="Status" value={filters.statusFilter} onChange={(v) => setFilters({ ...filters, statusFilter: v as ProductStatus | "All" })} options={statusOptions} />
                    </div>
                    <div className="xl:col-span-3">
                        <Select label="Dosage Form" value={filters.dosageFilter} onChange={(v) => setFilters({ ...filters, dosageFilter: v as DosageForm | "All" })} options={dosageOptions} />
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <Package className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-600 font-medium">Total Products</p>
                            <p className="text-2xl font-bold text-slate-900">{MOCK_PRODUCTS.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Pill className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-600 font-medium">Active</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {MOCK_PRODUCTS.filter((p) => p.status === "Commercially Available").length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                            <FlaskConical className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-600 font-medium">In Development</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {MOCK_PRODUCTS.filter((p) => p.status === "Development").length}
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
                            <p className="text-xs text-slate-600 font-medium">Registered</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {MOCK_PRODUCTS.filter((p) => p.status === "Registered").length}
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
                                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Name</th>
                                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Form</th>
                                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Strength</th>
                                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">MA Number</th>
                                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">Markets</th>
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
                                                <span className="font-medium text-emerald-600">{item.productId}</span>
                                            </td>
                                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-900 font-medium max-w-xs truncate">
                                                {item.name}
                                            </td>
                                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-700">{item.dosageForm}</td>
                                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-700">{item.strength}</td>
                                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                                                <StatusBadge status={getStatusColor(item.status)} />
                                            </td>
                                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-700 hidden lg:table-cell">
                                                {item.maNumber || "—"}
                                            </td>
                                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-700 hidden md:table-cell">
                                                <div className="flex gap-1">
                                                    {item.markets.map((m) => (
                                                        <span key={m} className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                                            {m}
                                                        </span>
                                                    ))}
                                                </div>
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
                        title="No Products Found"
                        description="No product records match your current filters. Try adjusting your search criteria."
                        actionLabel="Clear Filters"
                        onAction={() => {
                            setFilters({ searchQuery: "", typeFilter: "All", statusFilter: "All", dosageFilter: "All", dateFrom: "", dateTo: "" });
                            setCurrentPage(1);
                        }}
                    />
                )}
            </div>
        </div>
    );
};




