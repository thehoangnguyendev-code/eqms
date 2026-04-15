import React, { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { TablePagination } from "@/components/ui/table/TablePagination";
import { StatusBadge } from "@/components/ui" ;
import { ControlledCopy } from "./types";
import { MOCK_CONTROLLED_COPIES } from "@/features/documents/shared/mockData";

interface ControlledCopiesTabProps {
    copies?: ControlledCopy[];
}

export const ControlledCopiesTab: React.FC<ControlledCopiesTabProps> = ({ copies }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const sourceData = copies ?? MOCK_CONTROLLED_COPIES;

    // Filter controlled copies based on search
    const filteredCopies = useMemo(() => {
        if (!searchQuery.trim()) return sourceData;

        const query = searchQuery.toLowerCase();
        return sourceData.filter(
            (copy) =>
                copy.controlledCopiesName.toLowerCase().includes(query) ||
                copy.copyNumber.toLowerCase().includes(query) ||
                copy.openedBy.toLowerCase().includes(query) ||
                copy.documentNumber.toLowerCase().includes(query)
        );
    }, [searchQuery]);

    // Pagination
    const totalPages = Math.ceil(filteredCopies.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentCopies = filteredCopies.slice(startIndex, endIndex);

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name, copy number, opened by, or document number..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full h-9 pl-10 pr-10 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                    No.
                                </th>
                                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                    Controlled Copies Name
                                </th>
                                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">
                                    Copy Number
                                </th>
                                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">
                                    Created
                                </th>
                                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                    State
                                </th>
                                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">
                                    Opened by
                                </th>
                                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">
                                    Valid Until
                                </th>
                                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden xl:table-cell">
                                    Document Revision
                                </th>
                                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                    Document Number
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {currentCopies.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="py-12 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2.5">
                                            <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center">
                                                <Search className="h-5 w-5 text-slate-300" />
                                            </div>
                                            <p className="text-sm font-medium text-slate-500">No records to display</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                currentCopies.map((copy, index) => (
                                    <tr
                                        key={copy.id}
                                        className="hover:bg-slate-50/80 transition-colors"
                                    >
                                        <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-600">
                                            {startIndex + index + 1}
                                        </td>
                                        <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap font-medium text-slate-900">
                                            {copy.controlledCopiesName}
                                        </td>
                                        <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap font-medium text-emerald-600 hidden md:table-cell">
                                            {copy.copyNumber}
                                        </td>
                                        <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-600 hidden md:table-cell">
                                            {copy.created}
                                        </td>
                                        <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                                            <StatusBadge status={copy.state} />
                                        </td>
                                        <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-600 hidden lg:table-cell">
                                            {copy.openedBy}
                                        </td>
                                        <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-600 hidden lg:table-cell">
                                            {copy.validUntil}
                                        </td>
                                        <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-600 hidden xl:table-cell">
                                            {copy.documentRevision}
                                        </td>
                                        <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-600">
                                            {copy.documentNumber}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredCopies.length > 0 && (
                    <TablePagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={filteredCopies.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={(value) => {
                            setItemsPerPage(value);
                            setCurrentPage(1);
                        }}
                        showPageNumbers={false}
                    />
                )}
            </div>
        </div>
    );
};




