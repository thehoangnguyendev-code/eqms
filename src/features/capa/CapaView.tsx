import React, { useState, useMemo } from "react";
import {
    Search,
    X,
    Shield,
    Calendar,
    TrendingUp,
    CheckCircle,
    Plus,
    Eye,
    Edit,
    AlertTriangle,
    FileText,
    Download,
} from "lucide-react";
import { IconPlus } from "@tabler/icons-react";
import { PageHeader } from "@/components/ui/page/PageHeader";
import { capa } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import { DateTimePicker } from "@/components/ui/datetime-picker/DateTimePicker";
import { StatusBadge } from "@/components/ui";
import { TablePagination } from "@/components/ui/table/TablePagination";
import { TableEmptyState } from "@/components/ui/table/TableEmptyState";
import { FilterCard } from "@/components/ui/card/FilterCard";
import { ActionDropdown } from "@/components/ui/dropdown/ActionDropdown";
import { useNavigateWithLoading, useTableDragScroll } from "@/hooks";
import { FullPageLoading } from "@/components/ui/loading/Loading";
import { cn } from "@/components/ui/utils";
import { CAPA, CAPAFilters, CAPAType, CAPASource, CAPAStatus } from "./types";
import { MOCK_CAPAS } from "./mockData";

export const CAPAView: React.FC = () => {
    const { navigateTo, isNavigating } = useNavigateWithLoading();
    const { scrollerRef, isDragging, dragEvents } = useTableDragScroll();
    const [filters, setFilters] = useState<CAPAFilters>({
        searchQuery: "",
        typeFilter: "All",
        sourceFilter: "All",
        statusFilter: "All",
        dateFrom: "",
        dateTo: "",
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const typeOptions = [
        { label: "All Types", value: "All" },
        { label: "Corrective", value: "Corrective" },
        { label: "Preventive", value: "Preventive" },
        { label: "Both", value: "Both" },
    ];

    const sourceOptions = [
        { label: "All Sources", value: "All" },
        { label: "Deviation", value: "Deviation" },
        { label: "Audit Finding", value: "Audit Finding" },
        { label: "Customer Complaint", value: "Customer Complaint" },
        { label: "Internal Review", value: "Internal Review" },
        { label: "Risk Assessment", value: "Risk Assessment" },
        { label: "Regulatory Inspection", value: "Regulatory Inspection" },
        { label: "Self-Identified", value: "Self-Identified" },
    ];

    const statusOptions = [
        { label: "All Status", value: "All" },
        { label: "Open", value: "Open" },
        { label: "Under Investigation", value: "Under Investigation" },
        { label: "Action Plan Pending", value: "Action Plan Pending" },
        { label: "Implementation", value: "Implementation" },
        { label: "Verification", value: "Verification" },
        { label: "Effectiveness Check", value: "Effectiveness Check" },
        { label: "Closed", value: "Closed" },
        { label: "Cancelled", value: "Cancelled" },
    ];

    const filteredData = useMemo(() => {
        return MOCK_CAPAS.filter((capa) => {
            const matchesSearch =
                capa.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                capa.capaId.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                capa.description
                    .toLowerCase()
                    .includes(filters.searchQuery.toLowerCase());

            const matchesType =
                filters.typeFilter === "All" || capa.type === filters.typeFilter;
            const matchesSource =
                filters.sourceFilter === "All" || capa.source === filters.sourceFilter;
            const matchesStatus =
                filters.statusFilter === "All" || capa.status === filters.statusFilter;

            const matchesDateFrom =
                !filters.dateFrom || capa.initiatedDate >= filters.dateFrom;
            const matchesDateTo =
                !filters.dateTo || capa.initiatedDate <= filters.dateTo;

            return (
                matchesSearch &&
                matchesType &&
                matchesSource &&
                matchesStatus &&
                matchesDateFrom &&
                matchesDateTo
            );
        });
    }, [MOCK_CAPAS, filters]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredData, currentPage]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const getStatusColor = (
        status: CAPAStatus,
    ):
        | "draft"
        | "pendingReview"
        | "pendingApproval"
        | "approved"
        | "effective"
        | "archived" => {
        switch (status) {
            case "Open":
            case "Under Investigation":
                return "draft";
            case "Action Plan Pending":
                return "pendingReview";
            case "Implementation":
            case "Verification":
                return "approved";
            case "Effectiveness Check":
                return "pendingApproval";
            case "Closed":
                return "effective";
            default:
                return "archived";
        }
    };

    const getTypeIcon = (type: CAPAType) => {
        switch (type) {
            case "Corrective":
                return <AlertTriangle className="h-3.5 w-3.5" />;
            case "Preventive":
                return <Shield className="h-3.5 w-3.5" />;
            default:
                return <CheckCircle className="h-3.5 w-3.5" />;
        }
    };

    const getTypeColor = (type: CAPAType) => {
        switch (type) {
            case "Corrective":
                return "bg-orange-50 text-orange-700 border-orange-200";
            case "Preventive":
                return "bg-cyan-50 text-cyan-700 border-cyan-200";
            case "Both":
                return "bg-emerald-50 text-emerald-700 border-emerald-200";
        }
    };

    const handleView = (id: string) => {
        // navigateTo(ROUTES.CAPA.DETAIL(id));
        console.log("View CAPA:", id);
    };

    const handleEdit = (id: string) => {
        // navigateTo(ROUTES.CAPA.EDIT(id));
        console.log("Edit CAPA:", id);
    };

    return (
        <div className="space-y-6 w-full flex-1 flex flex-col">
            {isNavigating && <FullPageLoading text="Loading..." />}
            {/* Header: Title + Breadcrumb + Action Button */}
            <PageHeader
                title="CAPA Management"
                breadcrumbItems={capa()}
                actions={
                    <>
                        <Button
                            onClick={() => console.log("Export triggered")}
                            variant="outline"
                            size="sm"
                            className="whitespace-nowrap gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Export
                        </Button>
                        <Button
                            onClick={() => console.log("New CAPA")}
                            size="sm"
                            className="whitespace-nowrap gap-2"
                        >
                            <IconPlus className="h-4 w-4" />
                            New CAPA
                        </Button>
                    </>
                }
            />

            {/* Filters */}
            <FilterCard>
                <FilterCard.Row>
                    <FilterCard.Item span={4} mdSpan={2}>
                        <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
                            Search
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by title, ID, or description..."
                                value={filters.searchQuery}
                                onChange={(e) =>
                                    setFilters({ ...filters, searchQuery: e.target.value })
                                }
                                className="w-full h-9 pl-10 pr-10 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm placeholder:text-slate-400 transition-colors"
                            />
                            {filters.searchQuery && (
                                <button
                                    type="button"
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
                    </FilterCard.Item>

                    <FilterCard.Item span={4}>
                        <Select
                            label="Type"
                            value={filters.typeFilter}
                            onChange={(value) =>
                                setFilters({
                                    ...filters,
                                    typeFilter: value as CAPAType | "All",
                                })
                            }
                            options={typeOptions}
                        />
                    </FilterCard.Item>

                    <FilterCard.Item span={4}>
                        <Select
                            label="Source"
                            value={filters.sourceFilter}
                            onChange={(value) =>
                                setFilters({
                                    ...filters,
                                    sourceFilter: value as CAPASource | "All",
                                })
                            }
                            options={sourceOptions}
                        />
                    </FilterCard.Item>
                </FilterCard.Row>

                <FilterCard.Row className="mt-4">
                    <FilterCard.Item span={4}>
                        <Select
                            label="Status"
                            value={filters.statusFilter}
                            onChange={(value) =>
                                setFilters({
                                    ...filters,
                                    statusFilter: value as CAPAStatus | "All",
                                })
                            }
                            options={statusOptions}
                        />
                    </FilterCard.Item>

                    <FilterCard.Item span={4}>
                        <DateTimePicker
                            label="From Date"
                            value={filters.dateFrom}
                            onChange={(value) => setFilters({ ...filters, dateFrom: value })}
                        />
                    </FilterCard.Item>

                    <FilterCard.Item span={4}>
                        <DateTimePicker
                            label="To Date"
                            value={filters.dateTo}
                            onChange={(value) => setFilters({ ...filters, dateTo: value })}
                        />
                    </FilterCard.Item>
                </FilterCard.Row>
            </FilterCard>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <Shield className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-600 font-medium">Total CAPAs</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {MOCK_CAPAS.length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-cyan-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-600 font-medium">In Progress</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {
                                    MOCK_CAPAS.filter(
                                        (c) => !["Closed", "Cancelled"].includes(c.status),
                                    ).length
                                }
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-600 font-medium">
                                Due This Month
                            </p>
                            <p className="text-2xl font-bold text-slate-900">
                                {
                                    MOCK_CAPAS.filter((c) => {
                                        const targetDate = new Date(c.targetCompletionDate);
                                        const now = new Date();
                                        return (
                                            targetDate.getMonth() === now.getMonth() &&
                                            targetDate.getFullYear() === now.getFullYear()
                                        );
                                    }).length
                                }
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-600 font-medium">Closed</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {MOCK_CAPAS.filter((c) => c.status === "Closed").length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden flex flex-col">
                {paginatedData.length > 0 ? (
                    <>
                        <div 
                            ref={scrollerRef}
                            className={cn(
                                "overflow-x-auto transition-colors",
                                isDragging ? "cursor-grabbing select-none" : "cursor-grab"
                            )}
                            {...dragEvents}
                        >
                            <table className="w-full min-w-[820px] md:min-w-[980px] lg:min-w-[1120px] xl:min-w-[1260px]">
                                <thead className="bg-slate-50 border-b-2 border-slate-200 sticky top-0 z-30">
                                    <tr>
                                        <th className="py-2.5 px-2 md:py-3.5 md:px-4 text-left text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap w-10 sm:w-16">
                                            No.
                                        </th>
                                        <th className="py-2.5 px-2 md:py-3.5 md:px-4 text-left text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                            CAPA ID
                                        </th>
                                        <th className="py-2.5 px-2 md:py-3.5 md:px-4 text-left text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                            Title
                                        </th>
                                        <th className="py-2.5 px-2 md:py-3.5 md:px-4 text-left text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                            Type
                                        </th>
                                        <th className="py-2.5 px-2 md:py-3.5 md:px-4 text-left text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">
                                            Source
                                        </th>
                                        <th className="py-2.5 px-2 md:py-3.5 md:px-4 text-left text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                            Status
                                        </th>
                                        <th className="py-2.5 px-2 md:py-3.5 md:px-4 text-left text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">
                                            Assigned To
                                        </th>
                                        <th className="py-2.5 px-2 md:py-3.5 md:px-4 text-left text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">
                                            Target Date
                                        </th>
                                        <th className="sticky right-0 bg-slate-50 py-2.5 px-2 md:py-3.5 md:px-4 text-center text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider z-[1] whitespace-nowrap before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-200 shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.05)]">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white">
                                    {paginatedData.map((capa, index) => (
                                        <tr
                                            key={capa.id}
                                            className="hover:bg-slate-50 transition-colors group"
                                        >
                                            <td className="py-2.5 px-2 md:py-3 md:px-4 text-xs md:text-sm whitespace-nowrap text-slate-900">
                                                {(currentPage - 1) * itemsPerPage + index + 1}
                                            </td>
                                            <td className="py-2.5 px-2 md:py-3 md:px-4 text-xs md:text-sm whitespace-nowrap">
                                                <span className="font-medium text-emerald-600">
                                                    {capa.capaId}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-2 md:py-3 md:px-4 text-xs md:text-sm whitespace-nowrap text-slate-900 font-medium max-w-xs truncate">
                                                {capa.title}
                                            </td>
                                            <td className="py-2.5 px-2 md:py-3 md:px-4 text-xs md:text-sm whitespace-nowrap">
                                                <span
                                                    className={cn(
                                                        "inline-flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-medium border",
                                                        getTypeColor(capa.type),
                                                    )}
                                                >
                                                    {getTypeIcon(capa.type)}
                                                    {capa.type}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-2 md:py-3 md:px-4 text-xs md:text-sm whitespace-nowrap text-slate-700 hidden md:table-cell">
                                                {capa.source}
                                            </td>
                                            <td className="py-2.5 px-2 md:py-3 md:px-4 text-xs md:text-sm whitespace-nowrap">
                                                <StatusBadge status={getStatusColor(capa.status)} />
                                            </td>
                                            <td className="py-2.5 px-2 md:py-3 md:px-4 text-xs md:text-sm whitespace-nowrap text-slate-900 hidden lg:table-cell">
                                                {capa.assignedTo}
                                            </td>
                                            <td className="py-2.5 px-2 md:py-3 md:px-4 text-xs md:text-sm whitespace-nowrap text-slate-900 hidden md:table-cell">
                                                {new Date(capa.targetCompletionDate).toLocaleDateString(
                                                    "en-GB",
                                                    {
                                                        day: "2-digit",
                                                        month: "2-digit",
                                                        year: "numeric",
                                                    },
                                                )}
                                            </td>
                                            <td className="py-2.5 px-2 md:py-3 md:px-4 text-xs md:text-sm text-center sticky right-0 bg-white z-30 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-200 shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.05)] group-hover:bg-slate-50">
                                                <ActionDropdown
                                                    size="default"
                                                    actions={[
                                                        {
                                                            label: "View Detail",
                                                            icon: <Eye className="h-4 w-4" />,
                                                            onClick: () => handleView(capa.id),
                                                        },
                                                        {
                                                            label: "Edit CAPA",
                                                            icon: <Edit className="h-4 w-4" />,
                                                            onClick: () => handleEdit(capa.id),
                                                        },
                                                    ]}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
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
                        title="No CAPAs Found"
                        description="We couldn't find any CAPA records matching your filters. Try adjusting your search criteria or clear filters."
                        actionLabel="Clear Filters"
                        onAction={() => {
                            setFilters({
                                searchQuery: "",
                                typeFilter: "All",
                                sourceFilter: "All",
                                statusFilter: "All",
                                dateFrom: "",
                                dateTo: "",
                            });
                            setCurrentPage(1);
                        }}
                    />
                )}
            </div>
        </div>
    );
};






