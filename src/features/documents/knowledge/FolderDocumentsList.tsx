import React, { useState, useMemo } from "react";
import {
    IconLayoutGrid,
    IconLayoutList,
    IconArrowUp,
    IconArrowDown,
    IconDotsVertical,
    IconChevronLeft
} from "@tabler/icons-react";
import { Search } from "lucide-react";
import { cn } from "@/components/ui/utils";
import { motion, AnimatePresence } from "framer-motion";

// Dynamically import all file icons from the assets folder
const ALL_ICONS = import.meta.glob("@/assets/images/image-file/*.png", { eager: true, import: "default" }) as Record<string, string>;

// Create a mapping of filename (without extension) to the imported path
const FILE_ICONS_MAP: Record<string, string> = {};
Object.entries(ALL_ICONS).forEach(([path, src]) => {
    const filename = path.split("/").pop()?.replace(".png", "") || "";
    if (filename) FILE_ICONS_MAP[filename.toLowerCase()] = src;
});

interface DocumentItem {
    id: string;
    name: string;
    fileType: string;
    lastOpened: string;
    fileSize: string;
}

interface FolderDocumentsListProps {
    departmentId: string;
    departmentName: string;
    onBack: () => void;
}

// Mock data for documents in a folder (now with more varied file types)
const MOCK_FOLDER_DOCUMENTS: Record<string, DocumentItem[]> = {
    qa: [
        { id: "qa-1", name: "QA SOP for Internal Audits", fileType: "PDF", lastOpened: "28/03/2026", fileSize: "2.4 MB" },
        { id: "qa-2", name: "Quality Manual 2026", fileType: "PDF", lastOpened: "30/03/2026", fileSize: "5.1 MB" },
        { id: "qa-3", name: "Audit Checklist v2.1", fileType: "DOCX", lastOpened: "25/03/2026", fileSize: "840 KB" },
        { id: "qa-4", name: "Supplier Qualification Form", fileType: "XLSX", lastOpened: "15/03/2026", fileSize: "1.2 MB" },
        { id: "qa-5", name: "Validation Master Plan", fileType: "PDF", lastOpened: "10/03/2026", fileSize: "3.8 MB" },
        { id: "qa-6", name: "CAPA Management Procedure", fileType: "DOCX", lastOpened: "05/03/2026", fileSize: "1.1 MB" },
        { id: "qa-7", name: "Software Requirements Specs", fileType: "XML", lastOpened: "12/03/2026", fileSize: "150 KB" },
        { id: "qa-8", name: "Audit evidence - photos", fileType: "ZIP", lastOpened: "08/03/2026", fileSize: "45.2 MB" },
        { id: "qa-9", name: "Process Flow Animation", fileType: "MP4", lastOpened: "02/03/2026", fileSize: "125 MB" },
        { id: "qa-10", name: "System Log Export", fileType: "CSV", lastOpened: "01/03/2026", fileSize: "2.8 MB" },
    ],
    qc: [
        { id: "qc-1", name: "QC Calibration Schedule", fileType: "XLSX", lastOpened: "29/03/2026", fileSize: "450 KB" },
        { id: "qc-2", name: "Raw Material Testing Protocol", fileType: "PDF", lastOpened: "27/03/2026", fileSize: "1.8 MB" },
        { id: "qc-3", name: "Finished Product Specs - Batch A", fileType: "PDF", lastOpened: "20/03/2026", fileSize: "2.2 MB" },
        { id: "qc-4", name: "Test Report Export", fileType: "TXT", lastOpened: "15/03/2026", fileSize: "15 KB" },
        { id: "qc-5", name: "Material Safety Data Sheet", fileType: "JPG", lastOpened: "10/03/2026", fileSize: "1.2 MB" },
    ]
};

const getFileIcon = (type: string) => {
    const key = type.toLowerCase();
    const src = FILE_ICONS_MAP[key] || FILE_ICONS_MAP["file"]; // Fallback to generic 'file.png'
    return <img src={src} alt={type} className="h-7 w-7 object-contain" />;
};

type SortField = "name" | "fileType" | "lastOpened" | "fileSize";

export const FolderDocumentsList: React.FC<FolderDocumentsListProps> = ({
    departmentId,
    departmentName,
    onBack
}) => {
    const [viewMode, setViewMode] = useState<"grid" | "list">("list");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortField, setSortField] = useState<SortField>("name");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    // Get documents for the selected department, default to a generic list if not found
    const documents = MOCK_FOLDER_DOCUMENTS[departmentId] || MOCK_FOLDER_DOCUMENTS.qa;

    const filteredAndSortedDocs = useMemo(() => {
        let result = documents.filter(doc =>
            doc.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        result.sort((a, b) => {
            let comparison = 0;
            if (sortField === "name") comparison = a.name.localeCompare(b.name);
            else if (sortField === "fileType") comparison = a.fileType.localeCompare(b.fileType);
            else if (sortField === "lastOpened") {
                const dateA = new Date(a.lastOpened.split('/').reverse().join('-'));
                const dateB = new Date(b.lastOpened.split('/').reverse().join('-'));
                comparison = dateA.getTime() - dateB.getTime();
            }
            else if (sortField === "fileSize") {
                const getBytes = (size: string) => {
                    const value = parseFloat(size);
                    if (size.includes("KB")) return value * 1024;
                    if (size.includes("MB")) return value * 1024 * 1024;
                    return value;
                };
                comparison = getBytes(a.fileSize) - getBytes(b.fileSize);
            }

            return sortOrder === "asc" ? comparison : -comparison;
        });

        return result;
    }, [documents, searchQuery, sortField, sortOrder]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return null;
        return sortOrder === "asc" ? <IconArrowUp className="h-3 w-3 inline ml-1" /> : <IconArrowDown className="h-3 w-3 inline ml-1" />;
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            {/* Folder Header */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-5 shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        <IconChevronLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h2 className="text-lg md:text-xl font-bold text-slate-900">{departmentName}</h2>
                        <p className="text-xs text-slate-500">{filteredAndSortedDocs.length} documents in this folder</p>
                    </div>
                </div>
            </div>

            {/* Search & Actions Strip */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
                <div className="p-3 md:p-4 border-b border-slate-100 bg-slate-50/30">
                    <div className="flex flex-col sm:flex-row sm:items-end gap-3 md:gap-4">
                        <div className="flex-1 group">
                            <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
                                Search
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search in this folder..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="block w-full pl-10 pr-10 h-9 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all placeholder:text-slate-400 shadow-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className={cn("p-2 md:p-6 flex-1", viewMode === "list" ? "overflow-x-auto" : "overflow-y-auto")}>
                    {filteredAndSortedDocs.length === 0 ? (
                        <div className="text-center py-20">
                            <img src={FILE_ICONS_MAP["file"]} alt="No docs" className="h-10 w-10 md:h-12 md:w-12 text-slate-200 mx-auto mb-4 opacity-20 grayscale" />
                            <p className="text-slate-500 font-medium text-xs md:text-sm">No results found in this folder</p>
                        </div>
                    ) : viewMode === "list" ? (
                        /* List View (Table with Borders) - Optimized for density with Fixed Name Column */
                        <div className="min-w-full overflow-x-auto rounded-lg border border-slate-200 shadow-sm relative">
                            <table className="w-full text-[11px] md:text-sm text-left border-collapse translate-x-0">
                                <thead className="bg-slate-50 relative z-20">
                                    <tr className="text-slate-700">
                                        <th className="sticky left-0 z-30 px-2 md:px-4 py-2 md:py-3 font-semibold border-b border-r border-slate-200 cursor-pointer bg-slate-50 hover:bg-white transition-colors group whitespace-nowrap min-w-[160px] md:min-w-[240px]" onClick={() => handleSort("name")}>
                                            <div className="flex items-center justify-between gap-1.5">
                                                <span>File Name</span>
                                                <SortIcon field="name" />
                                            </div>
                                        </th>
                                        <th className="px-2 md:px-4 py-2 md:py-3 font-semibold border-b border-r border-slate-200 cursor-pointer hover:bg-white transition-colors whitespace-nowrap" onClick={() => handleSort("fileType")}>
                                            <div className="flex items-center justify-between gap-1.5">
                                                <span>File Type</span>
                                                <SortIcon field="fileType" />
                                            </div>
                                        </th>
                                        <th className="px-2 md:px-4 py-2 md:py-3 font-semibold border-b border-r border-slate-200 cursor-pointer hover:bg-white transition-colors whitespace-nowrap" onClick={() => handleSort("lastOpened")}>
                                            <div className="flex items-center justify-between gap-1.5">
                                                <span>Last Opened</span>
                                                <SortIcon field="lastOpened" />
                                            </div>
                                        </th>
                                        <th className="px-2 md:px-4 py-2 md:py-3 font-semibold border-b border-slate-200 cursor-pointer hover:bg-white transition-colors whitespace-nowrap" onClick={() => handleSort("fileSize")}>
                                            <div className="flex items-center justify-between gap-1.5">
                                                <span>File Size</span>
                                                <SortIcon field="fileSize" />
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {filteredAndSortedDocs.map((doc) => (
                                        <tr key={doc.id} className="group hover:bg-slate-50 transition-colors">
                                            <td className="sticky left-0 z-10 px-2 md:px-4 py-2 md:py-3 border-r border-slate-200 bg-white group-hover:bg-slate-50 transition-colors shadow-[1px_0_0_0_rgb(226,232,240)] md:shadow-none">
                                                <div className="flex items-center gap-2 md:gap-3">
                                                    <div className="shrink-0">{getFileIcon(doc.fileType)}</div>
                                                    <span className="font-medium text-slate-900 truncate max-w-[120px] sm:max-w-[200px] lg:max-w-[400px] leading-tight">{doc.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-2 md:px-4 py-2 md:py-3 border-r border-slate-200 text-slate-600 font-medium whitespace-nowrap">{doc.fileType}</td>
                                            <td className="px-2 md:px-4 py-2 md:py-3 border-r border-slate-200 text-slate-600 whitespace-nowrap">{doc.lastOpened}</td>
                                            <td className="px-2 md:px-4 py-2 md:py-3 text-slate-600 whitespace-nowrap">{doc.fileSize}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        /* Grid View - Simplified */
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4 px-0.5">
                            {filteredAndSortedDocs.map((doc) => (
                                <div key={doc.id} className="group border border-slate-200 rounded-xl p-3 md:p-4 hover:border-emerald-500 hover:shadow-md transition-all bg-white relative">
                                    <div className="flex flex-col items-center text-center gap-2 md:gap-3">
                                        <div className="p-2 md:p-3 rounded-lg bg-slate-50 group-hover:bg-emerald-50 transition-colors">
                                            {getFileIcon(doc.fileType)}
                                        </div>
                                        <div className="w-full">
                                            <p className="font-semibold text-slate-900 text-[10px] md:text-sm line-clamp-2 mb-1 min-h-[2.2rem] md:min-h-[2.5rem] flex items-center justify-center leading-tight">{doc.name}</p>
                                            <div className="h-px w-6 md:w-8 bg-slate-100 mx-auto mb-1.5 md:mb-2" />
                                            <p className="text-[9px] md:text-[10px] text-slate-400 font-bold tracking-wider">{doc.fileType} • {doc.fileSize}</p>
                                        </div>
                                        <p className="text-[9px] md:text-[10px] text-slate-500">Opened: {doc.lastOpened}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
