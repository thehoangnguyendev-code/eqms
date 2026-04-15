import React, { useState, useMemo } from "react";
import {
    Search,
    X,
    TrendingUp,
    MoreVertical,
    Download,
    CheckCircle,
    AlertTriangle,
    Wrench,
    Monitor,
} from "lucide-react";
import { IconPlus } from "@tabler/icons-react";
import { PageHeader } from "@/components/ui/page/PageHeader";
import { equipmentManagement } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import { DateTimePicker } from "@/components/ui/datetime-picker/DateTimePicker";
import { StatusBadge } from "@/components/ui";
import { TablePagination } from "@/components/ui/table/TablePagination";
import { TableEmptyState } from "@/components/ui/table/TableEmptyState";
import { cn } from "@/components/ui/utils";
import {
    Equipment,
    EquipmentFilters,
    EquipmentStatus,
    EquipmentType,
} from "./types";
import { MOCK_EQUIPMENT } from "./mockData";

// ============================================================================
// COMPONENT
// ============================================================================
export const EquipmentView: React.FC = () => {
    const [filters, setFilters] = useState<EquipmentFilters>({
        searchQuery: "",
        typeFilter: "All",
        statusFilter: "All",
        locationFilter: "",
        dateFrom: "",
        dateTo: "",
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const typeOptions = [
        { label: "All Types", value: "All" },
        { label: "Manufacturing", value: "Manufacturing" },
        { label: "Laboratory", value: "Laboratory" },
        { label: "Packaging", value: "Packaging" },
        { label: "Storage", value: "Storage" },
        { label: "Utility", value: "Utility" },
        { label: "HVAC", value: "HVAC" },
        { label: "Water System", value: "Water System" },
    ];

    const statusOptions = [
        { label: "All Status", value: "All" },
        { label: "Active", value: "Active" },
        { label: "Under Maintenance", value: "Under Maintenance" },
        { label: "Calibration Due", value: "Calibration Due" },
        { label: "Qualification Due", value: "Qualification Due" },
        { label: "Out of Service", value: "Out of Service" },
        { label: "Retired", value: "Retired" },
        { label: "Pending Installation", value: "Pending Installation" },
    ];

    const filteredData = useMemo(() => {
        return MOCK_EQUIPMENT.filter((item) => {
            const matchesSearch =
                item.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                item.equipmentId.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                item.location.toLowerCase().includes(filters.searchQuery.toLowerCase());
            const matchesType = filters.typeFilter === "All" || item.type === filters.typeFilter;
            const matchesStatus = filters.statusFilter === "All" || item.status === filters.statusFilter;
            return matchesSearch && matchesType && matchesStatus;
        });
    }, [MOCK_EQUIPMENT, filters]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredData, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const getStatusColor = (status: EquipmentStatus) => {
        switch (status) {
            case "Active": return "active" as const;
            case "Under Maintenance": return "inProgress" as const;
            case "Calibration Due": return "pendingReview" as const;
            case "Qualification Due": return "pendingApproval" as const;
            case "Out of Service": return "rejected" as const;
            case "Retired": return "archived" as const;
            case "Pending Installation": return "draft" as const;
            default: return "draft" as const;
        }
    };

    return (
        <div className="space-y-6 w-full flex-1 flex flex-col">
            {/* Header */}
            <PageHeader
                title="Equipment Management"
                breadcrumbItems={equipmentManagement()}
                actions={
                    <>
                        <Button onClick={() => { }} variant="outline" size="sm" className="whitespace-nowrap gap-2">
                            <Download className="h-4 w-4" />
                            Export
                        </Button>
                        <Button onClick={() => { }} size="sm" className="whitespace-nowrap gap-2">
                            <IconPlus className="h-4 w-4" />
                            Add Equipment
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
                                placeholder="Search by name, ID, or location..."
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
                        <Select label="Equipment Type" value={filters.typeFilter} onChange={(v) => setFilters({ ...filters, typeFilter: v as EquipmentType | "All" })} options={typeOptions} />
                    </div>
                    <div className="xl:col-span-3">
                        <Select label="Status" value={filters.statusFilter} onChange={(v) => setFilters({ ...filters, statusFilter: v as EquipmentStatus | "All" })} options={statusOptions} />
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <Monitor className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-600 font-medium">Total Equipment</p>
                            <p className="text-2xl font-bold text-slate-900">{MOCK_EQUIPMENT.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-600 font-medium">Active</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {MOCK_EQUIPMENT.filter((e) => e.status === "Active").length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                            <Wrench className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-600 font-medium">Maintenance Due</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {MOCK_EQUIPMENT.filter((e) => ["Under Maintenance", "Calibration Due"].includes(e.status)).length}
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
                            <p className="text-xs text-slate-600 font-medium">Out of Service</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {MOCK_EQUIPMENT.filter((e) => e.status === "Out of Service").length}
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
                            <table className="w-full min-w-[820px] md:min-w-[980px] lg:min-w-[1140px] xl:min-w-[1280px]">
                                <thead className="bg-slate-50/80 border-b-2 border-slate-200 sticky top-0 z-30">
                                    <tr>
                                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">No.</th>
                                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">ID</th>
                                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Name</th>
                                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Type</th>
                                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">Location</th>
                                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">Next Calibration</th>
                                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden xl:table-cell">Responsible</th>
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
                                                <span className="font-medium text-emerald-600">{item.equipmentId}</span>
                                            </td>
                                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-900 font-medium max-w-xs truncate">
                                                {item.name}
                                            </td>
                                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-700">{item.type}</td>
                                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                                                <StatusBadge status={getStatusColor(item.status)} />
                                            </td>
                                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-700 hidden lg:table-cell">{item.location}</td>
                                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-900 hidden md:table-cell">
                                                {item.nextCalibrationDate ? new Date(item.nextCalibrationDate).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—"}
                                            </td>
                                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-900 hidden xl:table-cell">{item.responsiblePerson}</td>
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
                        title="No Equipment Found"
                        description="No equipment records match your current filters. Try adjusting your search criteria."
                        actionLabel="Clear Filters"
                        onAction={() => {
                            setFilters({ searchQuery: "", typeFilter: "All", statusFilter: "All", locationFilter: "", dateFrom: "", dateTo: "" });
                            setCurrentPage(1);
                        }}
                    />
                )}
            </div>
        </div>
    );
};




