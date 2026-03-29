import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from '@/app/routes.constants';
import { IconFolderFilled, IconFile, IconSearch, IconPlus, IconUpload, IconDownload, IconLayoutGrid, IconLayoutList } from "@tabler/icons-react";
import { Breadcrumb } from "@/components/ui/breadcrumb/Breadcrumb";
import { knowledgeBase } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import { cn } from "@/components/ui/utils";
import { FullPageLoading } from "@/components/ui/loading/Loading";
import { Search } from "lucide-react";
import { motion } from "framer-motion";

interface Department {
    id: string;
    name: string;
    icon: React.ReactNode;
    documentCount: number;
    color: string;
}

const DEPARTMENTS: Department[] = [
    { id: "qa", name: "Quality Assurance (QA)", icon: <IconFolderFilled className="h-12 w-12" />, documentCount: 45, color: "text-emerald-600" },
    { id: "qc", name: "Quality Control (QC)", icon: <IconFolderFilled className="h-12 w-12" />, documentCount: 38, color: "text-blue-600" },
    { id: "production", name: "Production", icon: <IconFolderFilled className="h-12 w-12" />, documentCount: 62, color: "text-amber-600" },
    { id: "rnd", name: "Research & Development (R&D)", icon: <IconFolderFilled className="h-12 w-12" />, documentCount: 51, color: "text-purple-600" },
    { id: "regulatory", name: "Regulatory Affairs", icon: <IconFolderFilled className="h-12 w-12" />, documentCount: 29, color: "text-red-600" },
    { id: "warehouse", name: "Warehouse", icon: <IconFolderFilled className="h-12 w-12" />, documentCount: 22, color: "text-cyan-600" },
    { id: "maintenance", name: "Maintenance", icon: <IconFolderFilled className="h-12 w-12" />, documentCount: 18, color: "text-orange-600" },
    { id: "engineering", name: "Engineering", icon: <IconFolderFilled className="h-12 w-12" />, documentCount: 34, color: "text-indigo-600" },
    { id: "hr", name: "Human Resources (HR)", icon: <IconFolderFilled className="h-12 w-12" />, documentCount: 15, color: "text-pink-600" },
    { id: "finance", name: "Finance & Accounting", icon: <IconFolderFilled className="h-12 w-12" />, documentCount: 27, color: "text-emerald-600" },
    { id: "procurement", name: "Procurement", icon: <IconFolderFilled className="h-12 w-12" />, documentCount: 20, color: "text-teal-600" },
    { id: "logistics", name: "Logistics", icon: <IconFolderFilled className="h-12 w-12" />, documentCount: 16, color: "text-sky-600" },
    { id: "it", name: "IT Department", icon: <IconFolderFilled className="h-12 w-12" />, documentCount: 31, color: "text-violet-600" },
    { id: "safety", name: "Safety & Environment", icon: <IconFolderFilled className="h-12 w-12" />, documentCount: 24, color: "text-rose-600" },
    { id: "management", name: "Management", icon: <IconFolderFilled className="h-12 w-12" />, documentCount: 42, color: "text-slate-600" },
];

export const KnowledgeView: React.FC = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [isNavigating, setIsNavigating] = useState(false);

    const handleNavigate = (path: string) => {
        setIsNavigating(true);
        setTimeout(() => navigate(path), 600);
    };

    const filteredDepartments = useMemo(() => {
        const filtered = DEPARTMENTS.filter(dept =>
            dept.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        return filtered.sort((a, b) => {
            if (sortOrder === "asc") {
                return a.name.localeCompare(b.name);
            } else {
                return b.name.localeCompare(a.name);
            }
        });
    }, [searchQuery, sortOrder]);

    const totalDocuments = DEPARTMENTS.reduce((sum, dept) => sum + dept.documentCount, 0);

    return (
        <div className="space-y-6 w-full flex-1 flex flex-col">
            {/* Header: Title + Breadcrumb */}
            <div 
                className="flex flex-row flex-wrap items-end justify-between gap-3 md:gap-4"
            >
                <div className="min-w-[200px] flex-1">
                    <h1 className="text-lg md:text-xl lg:text-2xl font-bold tracking-tight text-slate-900">
                        Knowledge Base
                    </h1>
                    <Breadcrumb items={knowledgeBase()} />
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-3 md:p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                            <IconFolderFilled className="h-5 w-5 md:h-6 md:w-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-xs md:text-sm text-slate-600">Total Departments</p>
                            <p className="text-xl md:text-2xl font-bold text-slate-900">
                                {DEPARTMENTS.length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-3 md:p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                            <IconFile className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs md:text-sm text-slate-600">Total Documents</p>
                            <p className="text-xl md:text-2xl font-bold text-slate-900">
                                {totalDocuments}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 md:p-4 shadow-sm">
                <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
                    Search
                </label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search departments..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 h-9 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                    />
                </div>
            </div>

            {/* Department Folders Grid */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex-1">
                <div className="border-b border-slate-200 px-4 md:px-6 py-4">
                    <div className="space-y-3">
                        <div>
                            <h2 className="text-base md:text-lg font-semibold text-slate-900">Department Folders</h2>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                            {/* Sort Order Select */}
                            <div className="flex-1 sm:flex-none sm:min-w-[160px]">
                                <Select
                                    value={sortOrder}
                                    onChange={(value) => setSortOrder(value as "asc" | "desc")}
                                    options={[
                                        { label: "Sort A-Z", value: "asc" },
                                        { label: "Sort Z-A", value: "desc" },
                                    ]}
                                    placeholder="Sort order..."
                                    enableSearch={false}
                                />
                            </div>
                            
                            {/* View Mode Toggle */}
                            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 shrink-0 relative overflow-hidden">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={cn(
                                        "flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all relative z-10",
                                        viewMode === "grid"
                                            ? "text-slate-900"
                                            : "text-slate-600 hover:text-slate-900"
                                    )}
                                >
                                    {viewMode === "grid" && (
                                        <motion.div
                                            layoutId="activeViewModeIndicator"
                                            className="absolute inset-0 bg-white rounded-lg shadow-sm pointer-events-none"
                                            transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                                        />
                                    )}
                                    <span className="relative z-20 flex items-center gap-1.5">
                                        <IconLayoutGrid className="h-4 w-4" />
                                        <span>Grid</span>
                                    </span>
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={cn(
                                        "flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all relative z-10",
                                        viewMode === "list"
                                            ? "text-slate-900"
                                            : "text-slate-600 hover:text-slate-900"
                                    )}
                                >
                                    {viewMode === "list" && (
                                        <motion.div
                                            layoutId="activeViewModeIndicator"
                                            className="absolute inset-0 bg-white rounded-lg shadow-sm pointer-events-none"
                                            transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                                        />
                                    )}
                                    <span className="relative z-20 flex items-center gap-1.5">
                                        <IconLayoutList className="h-4 w-4" />
                                        <span>List</span>
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 md:p-6">
                    {filteredDepartments.length === 0 ? (
                        <div className="text-center py-8 md:py-12">
                            <div className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3 md:mb-4">
                                <IconFolderFilled className="h-6 w-6 md:h-7 md:w-7 text-slate-300" />
                            </div>
                            <p className="text-sm md:text-base text-slate-900 font-semibold">No departments found</p>
                            <p className="text-xs md:text-sm text-slate-500 mt-1">Try adjusting your search query</p>
                        </div>
                    ) : viewMode === "grid" ? (
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                            {filteredDepartments.map((dept, index) => (
                                <button
                                    key={dept.id}
                                    onClick={() => handleNavigate(`${ROUTES.DOCUMENTS.ALL}?department=${dept.id}`)}
                                    className="group relative bg-white border-2 border-slate-200 rounded-xl p-4 md:p-5 hover:border-emerald-500 hover:shadow-lg transition-all duration-200 text-left"
                                >
                                    <div className="flex flex-col items-center gap-2 md:gap-3">
                                        <div className={cn("transition-colors", dept.color)}>
                                            <IconFolderFilled className="h-10 w-10 md:h-12 md:w-12" />
                                        </div>
                                        <div className="text-center w-full">
                                            <p className="font-semibold text-slate-900 text-xs md:text-sm line-clamp-2 mb-1">
                                                {dept.name}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {dept.documentCount} {dept.documentCount === 1 ? 'doc' : 'docs'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="absolute top-2 md:top-3 right-2 md:right-3">
                                        <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredDepartments.map((dept, index) => (
                                <button
                                    key={dept.id}
                                    onClick={() => handleNavigate(`${ROUTES.DOCUMENTS.ALL}?department=${dept.id}`)}
                                    className="group w-full bg-white border border-slate-200 rounded-lg p-3 md:p-4 hover:border-emerald-500 hover:shadow-md transition-all duration-200 text-left"
                                >
                                    <div className="flex items-center gap-3 md:gap-4">
                                        <div className={cn("transition-colors shrink-0", dept.color)}>
                                            <IconFolderFilled className="h-8 w-8 md:h-10 md:w-10" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-slate-900 text-xs md:text-sm mb-0.5">
                                                {dept.name}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {dept.documentCount} {dept.documentCount === 1 ? 'document' : 'documents'}
                                            </p>
                                        </div>
                                        <div className="shrink-0">
                                            <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {isNavigating && <FullPageLoading text="Loading..." />}
        </div>
    );
};
