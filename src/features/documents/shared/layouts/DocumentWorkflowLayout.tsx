import React, { useState } from "react";
import {
    Check,
    ChevronRight as ChevronRightIcon,
    List,
    CheckCircle,
    FileText,
} from "lucide-react";
import { cn } from '@/components/ui/utils';
import { Button } from "@/components/ui/button/Button";
import { Breadcrumb } from "@/components/ui/breadcrumb/Breadcrumb";
import type { BreadcrumbItem } from "@/components/ui/breadcrumb/Breadcrumb";
import { TabNav } from "@/components/ui/tabs/TabNav";
import type { TabItem } from "@/components/ui/tabs/TabNav";

import type { DocumentStatus } from "@/features/documents/types";

// --- Types ---
type TabType = "document" | "general" | "workingNotes" | "documentInfo" | "training" | "reviewers" | "approvers" | "signatures" | "audit";

interface BatchDocument {
    id: string;
    documentId: string;
    title: string;
    status?: string;
    isCompleted?: boolean;
}

// BreadcrumbItem type is imported from @/components/ui/breadcrumb/Breadcrumb
// TabItem is imported from @/components/ui/tabs/TabNav

interface DocumentWorkflowLayoutProps {
    // Header props
    title: string;
    breadcrumbs: BreadcrumbItem[];
    onBack: () => void;
    
    // Header actions (optional - buttons next to Back)
    headerActions?: React.ReactNode;
    
    // Document info
    documentId: string;
    documentStatus: DocumentStatus;
    
    // Status stepper
    statusSteps: DocumentStatus[];
    currentStatus: DocumentStatus;
    
    // Tabs
    tabs: TabItem[];
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
    
    // Batch navigation (optional)
    batchInfo?: {
        currentIndex: number;
        totalDocuments: number;
        documents: BatchDocument[];
        onNavigate: (documentId: string, index: number) => void;
        onFinishBatch?: () => void;
    };
    
    // Footer actions (buttons below tab card)
    footerActions?: React.ReactNode;

    // Content rendered after the tab card (e.g. sub-tabs)
    afterTabContent?: React.ReactNode;
    
    // Content
    children: React.ReactNode;
}

// --- Default Tabs ---
export const DEFAULT_WORKFLOW_TABS: TabItem[] = [
    { id: "general", label: "General Information" },
    { id: "workingNotes", label: "Working Notes" },
    { id: "documentInfo", label: "Information from Document" },
    { id: "training", label: "Training Information" },
    { id: "document", label: "Document" },
    { id: "reviewers", label: "Reviewers" },
    { id: "approvers", label: "Approvers" },
    { id: "signatures", label: "Signatures" },
    { id: "audit", label: "Audit Trail" },
];

// --- Batch Navigation Bar Component ---
interface BatchNavigationBarProps {
    currentIndex: number;
    totalDocuments: number;
    documents: BatchDocument[];
    onNavigate: (documentId: string, index: number) => void;
    onFinishBatch?: () => void;
}

const BatchNavigationBar: React.FC<BatchNavigationBarProps> = ({
    currentIndex,
    totalDocuments,
    documents,
    onNavigate,
    onFinishBatch,
}) => {
    const [isListOpen, setIsListOpen] = useState(false);
    const isFirstDocument = currentIndex === 0;
    const isLastDocument = currentIndex === totalDocuments - 1;

    const handlePrevious = () => {
        if (!isFirstDocument) {
            const prevDoc = documents[currentIndex - 1];
            onNavigate(prevDoc.id, currentIndex - 1);
        }
    };

    const handleNext = () => {
        if (!isLastDocument) {
            const nextDoc = documents[currentIndex + 1];
            onNavigate(nextDoc.id, currentIndex + 1);
        }
    };

    const handleFinish = () => {
        if (onFinishBatch) {
            onFinishBatch();
        }
    };

    const handleDocumentClick = (doc: BatchDocument, index: number) => {
        onNavigate(doc.id, index);
        setIsListOpen(false);
    };

    return (
        <div className="bg-slate-50 border-b border-slate-200 min-h-[50px] px-4 md:px-6 py-3">
            <div className="flex items-center justify-between gap-4">
                {/* Left: Progress Info */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-emerald-600" />
                        <span className="text-sm font-semibold text-slate-900">
                            Tài liệu {currentIndex + 1}/{totalDocuments}
                        </span>
                        <span className="text-xs text-slate-500">trong lô</span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="hidden md:flex items-center gap-2">
                        <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-emerald-600 transition-all duration-300"
                                style={{ width: `${((currentIndex + 1) / totalDocuments) * 100}%` }}
                            />
                        </div>
                        <span className="text-xs text-slate-500">
                            {Math.round(((currentIndex + 1) / totalDocuments) * 100)}%
                        </span>
                    </div>
                </div>

                {/* Right: Navigation Buttons */}
                <div className="flex items-center gap-2">
                    {/* View Batch List Button */}
                    <div className="relative">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsListOpen(!isListOpen)}
                            className="gap-2 min-h-[44px] md:min-h-[40px]"
                        >
                            <List className="h-4 w-4" />
                            <span className="hidden md:inline">Danh sách lô</span>
                        </Button>

                        {/* Batch List Popover */}
                        {isListOpen && (
                            <>
                                {/* Backdrop */}
                                <div 
                                    className="fixed inset-0 z-40"
                                    onClick={() => setIsListOpen(false)}
                                />
                                
                                {/* Popover */}
                                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 z-50 max-h-96 overflow-hidden flex flex-col">
                                    <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
                                        <h4 className="font-semibold text-slate-900">Tài liệu trong lô</h4>
                                        <p className="text-xs text-slate-500 mt-1">{totalDocuments} tài liệu</p>
                                    </div>
                                    <div className="overflow-y-auto">
                                        {documents.map((doc, index) => (
                                            <button
                                                key={doc.id}
                                                onClick={() => handleDocumentClick(doc, index)}
                                                className={cn(
                                                    "w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0",
                                                    index === currentIndex && "bg-emerald-50 hover:bg-emerald-50"
                                                )}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={cn(
                                                                "text-xs font-semibold",
                                                                index === currentIndex ? "text-emerald-700" : "text-slate-500"
                                                            )}>
                                                                #{index + 1}
                                                            </span>
                                                            <span className="text-sm font-medium text-slate-900 truncate">
                                                                {doc.documentId}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-600 truncate">{doc.title}</p>
                                                    </div>
                                                    {doc.isCompleted && (
                                                        <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-1" />
                                                    )}
                                                    {index === currentIndex && (
                                                        <div className="h-2 w-2 rounded-full bg-emerald-600 shrink-0 mt-2" />
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Previous Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrevious}
                        disabled={isFirstDocument}
                        className="gap-2 min-h-[44px] md:min-h-[40px] min-w-[44px] md:min-w-[auto]"
                    >
                        <span className="hidden md:inline">Previous</span>
                    </Button>

                    {/* Next/Finish Button */}
                    {isLastDocument ? (
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleFinish}
                            className="gap-2 min-h-[44px] md:min-h-[40px] bg-emerald-600 hover:bg-emerald-700"
                        >
                            <span>Finish Batch</span>
                        </Button>
                    ) : (
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleNext}
                            className="gap-2 min-h-[44px] md:min-h-[40px] min-w-[44px] md:min-w-[auto] bg-emerald-600 hover:bg-emerald-700"
                        >
                            <ChevronRightIcon className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---
export const DocumentWorkflowLayout: React.FC<DocumentWorkflowLayoutProps> = ({
    title,
    breadcrumbs,
    onBack,
    headerActions,
    documentId,
    documentStatus,
    statusSteps,
    currentStatus,
    tabs,
    activeTab,
    onTabChange,
    batchInfo,
    footerActions,
    afterTabContent,
    children,
}) => {
    const currentStepIndex = statusSteps.indexOf(currentStatus);

    return (
        <div className="space-y-6 w-full">
            {/* Batch Navigation Bar */}
            {batchInfo && (
                <BatchNavigationBar
                    currentIndex={batchInfo.currentIndex}
                    totalDocuments={batchInfo.totalDocuments}
                    documents={batchInfo.documents}
                    onNavigate={batchInfo.onNavigate}
                    onFinishBatch={batchInfo.onFinishBatch}
                />
            )}
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 lg:gap-4">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-lg md:text-xl lg:text-2xl font-bold tracking-tight text-slate-900">
                            {title}
                        </h1>
                        <Breadcrumb items={breadcrumbs} />
                    </div>
                    <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                        <Button
                        onClick={onBack}
                        size="sm"
                        variant="outline"
                        className="whitespace-nowrap !border-emerald-600 !text-emerald-600 hover:!bg-emerald-50 self-start md:self-auto"
                    >
                        Back
                    </Button>
                        {headerActions}
                    </div>
                </div>
            </div>

            {/* Status Stepper */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100" style={{ marginBottom: '0'}}>
                    <div className="flex items-stretch min-w-full">
                        {statusSteps.map((step, index) => {
                            const isCompleted = index < currentStepIndex;
                            const isCurrent = index === currentStepIndex;
                            const isFirst = index === 0;
                            const isLast = index === statusSteps.length - 1;

                            return (
                                <div
                                    key={step}
                                    className="relative flex-1 flex items-center justify-center min-w-[150px]"
                                    style={{ minHeight: '60px' }}
                            >
                                {/* Arrow Shape Background */}
                                <div
                                    className={cn(
                                        "absolute inset-0 transition-all",
                                        isCompleted
                                            ? "bg-emerald-100"
                                            : isCurrent
                                                ? "bg-emerald-600"
                                                : "bg-slate-100"
                                    )}
                                    style={{
                                        clipPath: isFirst
                                            ? 'polygon(0% 0%, calc(100% - 20px) 0%, 100% 50%, calc(100% - 20px) 100%, 0% 100%)'
                                            : isLast
                                                ? 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 20px 50%)'
                                                : 'polygon(0% 0%, calc(100% - 20px) 0%, 100% 50%, calc(100% - 20px) 100%, 0% 100%, 20px 50%)'
                                    }}
                                />

                                {/* Content */}
                                <div className="relative z-10 flex items-center gap-2 px-6">
                                    {isCompleted && (
                                        <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                                    )}
                                    <span
                                        className={cn(
                                            "text-xs md:text-sm font-medium text-center",
                                            isCurrent
                                                ? "text-white"
                                                : isCompleted
                                                    ? "text-slate-700"
                                                    : "text-slate-400"
                                        )}
                                    >
                                        {step}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
            {/* Tab Navigation */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <TabNav tabs={tabs} activeTab={activeTab} onChange={(id) => onTabChange(id as TabType)} />
                {/* Tab Content */}
                <div className="p-3 sm:p-4 md:p-6">
                    {children}
                </div>
            </div>

            {/* Footer Actions */}
            {footerActions && (
                <div className="flex items-center gap-2 md:gap-3">
                    {footerActions}
                </div>
            )}
        </div>
    );
};
