import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from '@/app/routes.constants';
import { IconFile, IconSearch, IconPlus, IconUpload, IconDownload, IconLayoutGrid, IconLayoutList } from "@tabler/icons-react";
import { Breadcrumb } from "@/components/ui/breadcrumb/Breadcrumb";
import { knowledgeBase } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import { cn } from "@/components/ui/utils";
import { FullPageLoading } from "@/components/ui/loading/Loading";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { StatusBadge } from "@/components/ui/status-badge/StatusBadge";
import Folder from "@/components/Folder";
import Document3D from "@/components/Document3D";

const COLOR_MAP: Record<string, string> = {
    "text-emerald-600": "#059669",
    "text-blue-600": "#2563eb",
    "text-amber-600": "#d97706",
    "text-purple-600": "#9333ea",
    "text-red-600": "#dc2626",
    "text-cyan-600": "#0891b2",
    "text-orange-600": "#ea580c",
    "text-indigo-600": "#4f46e5",
    "text-pink-600": "#db2777",
    "text-teal-600": "#0d9488",
    "text-sky-600": "#0284c7",
    "text-violet-600": "#7c3aed",
    "text-rose-600": "#e11d48",
    "text-slate-600": "#475569",
};

interface Department {
    id: string;
    name: string;
    documentCount: number;
    color: string;
}

const DEPARTMENTS: Department[] = [
    { id: "qa", name: "Quality Assurance (QA)", documentCount: 45, color: "text-emerald-600" },
    { id: "qc", name: "Quality Control (QC)", documentCount: 38, color: "text-blue-600" },
    { id: "production", name: "Production", documentCount: 62, color: "text-amber-600" },
    { id: "rnd", name: "Research & Development (R&D)", documentCount: 51, color: "text-purple-600" },
    { id: "regulatory", name: "Regulatory Affairs", documentCount: 29, color: "text-red-600" },
    { id: "warehouse", name: "Warehouse", documentCount: 22, color: "text-cyan-600" },
    { id: "maintenance", name: "Maintenance", documentCount: 18, color: "text-orange-600" },
    { id: "engineering", name: "Engineering", documentCount: 34, color: "text-indigo-600" },
    { id: "hr", name: "Human Resources (HR)", documentCount: 15, color: "text-pink-600" },
    { id: "finance", name: "Finance & Accounting", documentCount: 27, color: "text-emerald-600" },
    { id: "procurement", name: "Procurement", documentCount: 20, color: "text-teal-600" },
    { id: "logistics", name: "Logistics", documentCount: 16, color: "text-sky-600" },
    { id: "it", name: "IT Department", documentCount: 31, color: "text-violet-600" },
    { id: "safety", name: "Safety & Environment", documentCount: 24, color: "text-rose-600" },
    { id: "management", name: "Management", documentCount: 42, color: "text-slate-600" },
];

import { FolderDocumentsList } from "./FolderDocumentsList";

export const KnowledgeView: React.FC = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("list");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [isNavigating, setIsNavigating] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
    const [hoveredDeptId, setHoveredDeptId] = useState<string | null>(null);
    const [isHoveringTotalStats, setIsHoveringTotalStats] = useState(false);
    const [isHoveringDocStats, setIsHoveringDocStats] = useState(false);

    const handleNavigate = (path: string) => {
        setIsNavigating(true);
        setTimeout(() => navigate(path), 600);
    };

    const handleFolderClick = (dept: Department) => {
        setIsNavigating(true);
        setTimeout(() => {
            setSelectedDepartment(dept);
            setIsNavigating(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }, 500);
    };

    const handleBackToFolders = () => {
        setIsNavigating(true);
        setTimeout(() => {
            setSelectedDepartment(null);
            setIsNavigating(false);
        }, 400);
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
        <div className="space-y-6 w-full flex-1 flex flex-col min-h-0">
            {/* Header: Title + Breadcrumb */}
            <div
                className="flex flex-row flex-wrap items-end justify-between gap-3 md:gap-4 shrink-0"
            >
                <div className="min-w-[200px] flex-1">
                    <h1 className="text-lg md:text-xl lg:text-2xl font-bold tracking-tight text-slate-900 transition-all">
                        {selectedDepartment ? selectedDepartment.name : "Knowledge Base"}
                    </h1>
                    <Breadcrumb
                        items={(() => {
                            const baseItems = knowledgeBase(navigate);
                            if (!selectedDepartment) return baseItems;

                            // When a folder is open, the "Knowledge Base" item should be clickable to return
                            const modifiedBase = baseItems.map((item, idx) => {
                                if (idx === baseItems.length - 1) {
                                    return { ...item, isActive: false, onClick: handleBackToFolders };
                                }
                                return item;
                            });

                            return [...modifiedBase, { label: selectedDepartment.name, isActive: true }];
                        })()}
                    />
                </div>
            </div>

            {!selectedDepartment ? (
                <div className="space-y-6 flex-1 flex flex-col min-h-0">
                    {/* Stats Overview */}
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-4 shrink-0">
                        <div
                            className="bg-slate-50/50 border border-slate-200 rounded-xl p-3 md:p-4 shadow-sm group cursor-pointer transition-all hover:bg-white hover:border-emerald-500 hover:shadow-md"
                            onMouseEnter={() => setIsHoveringTotalStats(true)}
                            onMouseLeave={() => setIsHoveringTotalStats(false)}
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 md:h-12 md:w-12 flex items-center justify-center shrink-0 transition-colors mr-2">
                                    <Folder
                                        color="#059669"
                                        size={0.65}
                                        className="mt-1"
                                        onOpenChange={() => { }}
                                        isOpen={isHoveringTotalStats}
                                    />
                                </div>
                                <div>
                                    <p className="text-xs md:text-sm text-slate-600">Total Departments</p>
                                    <p className="text-xl md:text-2xl font-bold text-slate-900">
                                        {DEPARTMENTS.length}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div
                            className="bg-slate-50/50 border border-slate-200 rounded-xl p-3 md:p-4 shadow-sm group cursor-pointer transition-all hover:bg-white hover:border-blue-500 hover:shadow-md"
                            onMouseEnter={() => setIsHoveringDocStats(true)}
                            onMouseLeave={() => setIsHoveringDocStats(false)}
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 md:h-12 md:w-12 flex items-center justify-center shrink-0 mr-2">
                                    <Document3D
                                        color="#2563eb"
                                        size={0.6}
                                        className="mt-1"
                                        isOpen={isHoveringDocStats}
                                    />
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

                    {/* Unified Knowledge Base Card */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
                        {/* 1. Header Row */}
                        <div className="border-b border-slate-100 px-4 md:px-6 py-4 flex items-center justify-between bg-slate-50/20">
                            <h2 className="text-base font-semibold text-slate-900">
                                Department Folders
                            </h2>
                            <StatusBadge
                                status="draft"
                                label={`${filteredDepartments.length} folders`}
                                size="sm"
                                className="bg-slate-100/80 border-slate-200/60"
                            />
                        </div>

                        {/* 2. Actions Row (Search + Sort + View) */}
                        <div className="p-4 md:p-5 border-b border-slate-100 bg-white">
                            <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center">
                                {/* Search input */}
                                <div className="w-full sm:flex-1 group">
                                    <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
                                        Search
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="Type to filter folders..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="block w-full pl-10 pr-10 h-9 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all placeholder:text-slate-400 shadow-sm"
                                        />
                                    </div>
                                </div>

                                {/* Sort + View Controls */}
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    {/* Sort Select */}
                                    <div className="flex-1 sm:w-[150px]">
                                        <Select
                                            label="Order"
                                            value={sortOrder}
                                            onChange={(value) => setSortOrder(value as "asc" | "desc")}
                                            options={[
                                                { label: "Name A-Z", value: "asc" },
                                                { label: "Name Z-A", value: "desc" },
                                            ]}
                                            placeholder="Order..."
                                            enableSearch={false}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Main Content Area */}
                        <div className="p-4 md:p-6 overflow-auto flex-1 min-h-0">
                            {filteredDepartments.length === 0 ? (
                                <div className="text-center py-8 md:py-12">
                                    <div className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3 md:mb-4">
                                        <Folder
                                            color="#cbd5e1"
                                            size={0.5}
                                            className="mt-1 opacity-40"
                                            onOpenChange={() => { }}
                                            isOpen={false}
                                        />
                                    </div>
                                    <p className="text-sm md:text-base text-slate-900 font-semibold">No departments found</p>
                                    <p className="text-xs md:text-sm text-slate-500 mt-1">Try adjusting your search query</p>
                                </div>
                            ) : viewMode === "grid" ? (
                                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                                    {filteredDepartments.map((dept) => (
                                        <button
                                            key={dept.id}
                                            onClick={() => handleFolderClick(dept)}
                                            onMouseEnter={() => setHoveredDeptId(dept.id)}
                                            onMouseLeave={() => setHoveredDeptId(null)}
                                            className="group relative bg-white border border-slate-200 rounded-xl p-4 md:p-6 lg:p-8 hover:border-emerald-500 hover:shadow-xl transition-all duration-300 text-left flex flex-col items-center gap-6"
                                        >
                                            <div className="shrink-0 flex items-center justify-center">
                                                <Folder
                                                    color={COLOR_MAP[dept.color] || "#059669"}
                                                    size={1}
                                                    className="w-24 h-20 flex items-center justify-center"
                                                    onOpenChange={() => { }}
                                                    isOpen={hoveredDeptId === dept.id}
                                                />
                                            </div>
                                            <div className="text-center w-full min-w-0">
                                                <p className="font-bold text-slate-900 text-sm md:text-base truncate mb-1 px-1 group-hover:text-emerald-600 transition-colors">
                                                    {dept.name}
                                                </p>
                                                <p className="text-[10px] md:text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                    {dept.documentCount} {dept.documentCount === 1 ? 'document' : 'documents'}
                                                </p>
                                            </div>
                                            <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {filteredDepartments.map((dept) => (
                                        <button
                                            key={dept.id}
                                            onClick={() => handleFolderClick(dept)}
                                            onMouseEnter={() => setHoveredDeptId(dept.id)}
                                            onMouseLeave={() => setHoveredDeptId(null)}
                                            className="group w-full bg-white border border-slate-200 rounded-lg p-3 md:p-4 hover:border-emerald-500 hover:shadow-md transition-all duration-200 text-left"
                                        >
                                            <div className="flex items-center gap-3 md:gap-4">
                                                <div className="shrink-0 flex items-center justify-center -ml-2">
                                                    <Folder
                                                        color={COLOR_MAP[dept.color] || "#059669"}
                                                        size={0.6}
                                                        className="w-16 h-12 flex items-center justify-center pointer-events-none"
                                                        onOpenChange={() => { }}
                                                        isOpen={hoveredDeptId === dept.id}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-slate-900 text-xs md:text-sm mb-0.5 group-hover:text-emerald-600 transition-colors">
                                                        {dept.name}
                                                    </p>
                                                    <p className="text-xs text-slate-500 font-medium">
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
                </div>
            ) : (
                <div className="flex-1 min-h-0">
                    <FolderDocumentsList
                        departmentId={selectedDepartment.id}
                        departmentName={selectedDepartment.name}
                        onBack={handleBackToFolders}
                    />
                </div>
            )}

            {isNavigating && <FullPageLoading text="Loading..." />}
        </div>
    );
};