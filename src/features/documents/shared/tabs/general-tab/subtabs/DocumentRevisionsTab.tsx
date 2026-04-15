import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { StatusBadge } from "@/components/ui" ;
import { FullPageLoading } from "@/components/ui/loading/Loading";
import { ROUTES } from "@/app/routes.constants";
import { Revision } from "./types";

interface DocumentRevisionsTabProps {
    revisions?: Revision[];
    onCountChange?: (count: number) => void;
    documentAuthor?: string;
    documentStatus?: string;
    documentCreated?: string;
    revisionFile?: File | null;
    formData?: any;
    reviewers?: any[];
    approvers?: any[];
    documentNumber?: string;
    relationshipDocs?: any[];
    correlatedDocuments?: any[];
}

export const DocumentRevisionsTab: React.FC<DocumentRevisionsTabProps> = ({ 
    revisions = [], 
    onCountChange, 
    documentAuthor = "", 
    documentStatus = "Draft", 
    documentCreated = "", 
    revisionFile = null,
    formData = null,
    reviewers = [],
    approvers = [],
    documentNumber = "",
    relationshipDocs = [],
    correlatedDocuments = []
}) => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [isNavigating, setIsNavigating] = useState(false);

    // Filter revisions based on search query
    const filteredRevisions = useMemo(() => {
        return revisions.filter((revision) =>
            revision.revisionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            revision.revisionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            revision.openedBy.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [revisions, searchQuery]);

    // Update counter when revisions change
    useEffect(() => {
        onCountChange?.(revisions?.length || 0);
    }, [revisions, onCountChange]);

    const handleRevisionClick = (revision: Revision) => {
        setIsNavigating(true);

        // Always build sourceDocument with full metadata from formData
        const sourceDocument = {
            code: revision.revisionNumber,
            name: formData?.title || revision.revisionName,
            version: revision.revisionNumber,
            type: formData?.type || "",
            author: formData?.author || documentAuthor,
            coAuthors: formData?.coAuthors || [],
            businessUnit: formData?.businessUnit || "",
            department: formData?.department || "",
            knowledgeBase: formData?.knowledgeBase || "",
            subType: formData?.subType || "",
            periodicReviewCycle: formData?.periodicReviewCycle || 0,
            periodicReviewNotification: formData?.periodicReviewNotification || 0,
            language: formData?.language || "English",
            reviewDate: formData?.reviewDate || "",
            description: formData?.description || "",
            isTemplate: formData?.isTemplate || false,
            titleLocalLanguage: formData?.titleLocalLanguage || "",
        };

        // Map reviewers/approvers from NewDocumentView format to workspace format
        const mappedReviewers = reviewers.map((r: any) => ({
            id: r.id,
            name: r.name,
            signedOn: undefined,
        }));
        const mappedApprovers = approvers.map((a: any) => ({
            id: a.id,
            name: a.name,
            signedOn: undefined,
        }));

        setTimeout(() => {
            navigate(ROUTES.DOCUMENTS.REVISIONS.WORKSPACE, {
                state: {
                    sourceDocument,
                    revisionReviewers: mappedReviewers,
                    revisionApprovers: mappedApprovers,
                    isStandalone: true,
                    revisionId: revision.id,
                    revisionCreated: revision.created,
                    revisionOpenedBy: revision.openedBy,
                    revisionState: revision.state,
                    documentAuthor: formData?.author || documentAuthor,
                    documentStatus,
                    documentCreated,
                    revisionFile,
                    documentRevisions: revisions,
                    documentNumber,
                    relationshipDocs,
                    correlatedDocuments,
                },
            });
        }, 600);
    };

    return (
        <div className="space-y-4">
            {isNavigating && <FullPageLoading text="Loading..." />}
            {/* Search Bar */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by revision number, name, or author..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
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
                                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap w-10 sm:w-16">
                                    No.
                                </th>
                                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                    Revision Number
                                </th>
                                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">
                                    Created
                                </th>
                                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">
                                    Opened by
                                </th>
                                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                    Revision Name
                                </th>
                                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                    State
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {filteredRevisions.length > 0 ? (
                                filteredRevisions.map((revision, index) => (
                                    <tr
                                        key={revision.id}
                                        className="hover:bg-slate-50/80 transition-colors"
                                    >
                                        <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-slate-500 whitespace-nowrap">
                                            {index + 1}
                                        </td>
                                        <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                                            <button
                                                onClick={() => handleRevisionClick(revision)}
                                                className="font-medium text-emerald-600 hover:text-emerald-700 hover:underline underline-offset-2 transition-colors cursor-pointer"
                                            >
                                                {revision.revisionNumber}
                                            </button>
                                        </td>
                                        <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-slate-600 whitespace-nowrap hidden md:table-cell">
                                            {revision.created}
                                        </td>
                                        <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-slate-600 whitespace-nowrap hidden md:table-cell">
                                            {revision.openedBy}
                                        </td>
                                        <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-slate-900 whitespace-nowrap">
                                            {revision.revisionName}
                                        </td>
                                        <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                                            <StatusBadge status={revision.state} />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2.5">
                                            <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center">
                                                <Search className="h-5 w-5 text-slate-300" />
                                            </div>
                                            <p className="text-sm font-medium text-slate-500">
                                                {searchQuery
                                                    ? "No records matching your search"
                                                    : "No records to display"}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};




