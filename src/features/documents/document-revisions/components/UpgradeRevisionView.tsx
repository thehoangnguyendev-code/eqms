import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { ROUTES } from '@/app/routes.constants';
import { 
    FileText, 
    AlertCircle,
    CheckCircle,
    Check,
} from "lucide-react";
import { Loading, FullPageLoading } from '@/components/ui/loading/Loading';
import { Button } from '@/components/ui/button/Button';
import { cn } from '@/components/ui/utils';
import { AlertModal } from '@/components/ui/modal/AlertModal';
import { Breadcrumb } from '@/components/ui/breadcrumb/Breadcrumb';
import { standaloneRevision } from '@/components/ui/breadcrumb/breadcrumbs.config';

// --- Types ---
interface SourceDocument {
    id: string;
    documentId: string;
    title: string;
    type: string;
    version: string;
    status: string;
    department: string;
    author: string;
    effectiveDate: string;
    description?: string;
}

// --- Mock Data Function ---
const fetchSourceDocument = async (id: string): Promise<SourceDocument> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock data - replace with actual API call
    return {
        id,
        documentId: `SOP.${id.padStart(4, "0")}.01`,
        title: "Standard Operating Procedure for Quality Control Testing",
        type: "SOP",
        version: "1.0",
        status: "Effective",
        department: "Quality Assurance",
        author: "Dr. Sarah Johnson",
        effectiveDate: "2024-01-15",
        description: "Comprehensive procedure for conducting quality control tests on pharmaceutical products",
    };
};

export const UpgradeRevisionView: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const sourceDocId = searchParams.get("sourceDocId");
    // Preserve the origin so Cancel returns to the correct list
    const fromPath: string = (location.state as { from?: string })?.from ?? ROUTES.DOCUMENTS.REVISIONS.ALL;
    
    // Loading state
    const [isLoadingDocument, setIsLoadingDocument] = useState(true);
    const [sourceDocument, setSourceDocument] = useState<SourceDocument | null>(null);
    
    // Form state
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [revisionNumber, setRevisionNumber] = useState("");
    const [effectiveDate, setEffectiveDate] = useState("");
    const [reasonForChange, setReasonForChange] = useState("");
    const [additionalNotes, setAdditionalNotes] = useState("");
    
    // UI state
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showError, setShowError] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);

    // Load source document
    useEffect(() => {
        const loadDocument = async () => {
            if (!sourceDocId) {
                setIsLoadingDocument(false);
                return;
            }

            try {
                setIsLoadingDocument(true);
                const doc = await fetchSourceDocument(sourceDocId);
                setSourceDocument(doc);
                
                // Auto-populate form
                const currentVersion = parseFloat(doc.version);
                const newVersion = (currentVersion + 1).toFixed(1);
                setRevisionNumber(newVersion);
                
                // Set default effective date to 30 days from now
                const defaultDate = new Date();
                defaultDate.setDate(defaultDate.getDate() + 30);
                setEffectiveDate(defaultDate.toISOString().split('T')[0]);
                
            } catch (error) {
                console.error("Error loading source document:", error);
            } finally {
                setIsLoadingDocument(false);
            }
        };

        loadDocument();
    }, [sourceDocId]);

    // File upload handlers
    const handleFileUpload = (file: File) => {
        if (file.type === "application/pdf") {
            setUploadedFile(file);
        } else {
            alert("Only PDF files are allowed");
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileUpload(file);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileUpload(file);
    };

    const handleRemoveFile = () => {
        setUploadedFile(null);
    };

    // Form validation
    const isFormValid = () => {
        return (
            uploadedFile &&
            revisionNumber &&
            effectiveDate &&
            reasonForChange.trim().length >= 50
        );
    };

    // Save handlers
    const handleSaveDraft = async () => {
        setIsSaving(true);
        setShowSaveModal(false);
        
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // TODO: Implement actual save API call
            
            navigate(ROUTES.DOCUMENTS.REVISIONS.ALL);
        } catch (error) {
            console.error("Error saving draft:", error);
            setIsSaving(false);
        }
    };

    const handleSubmit = async () => {
        if (!isFormValid()) {
            setShowError(true);
            return;
        }
        
        setIsSubmitting(true);
        setShowSubmitModal(false);
        
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // TODO: Implement actual submit API call
            
            navigate(ROUTES.DOCUMENTS.REVISIONS.ALL);
        } catch (error) {
            console.error("Error submitting revision:", error);
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setShowCancelModal(false);
        setIsNavigating(true);
        setTimeout(() => navigate(fromPath), 600);
    };

    // Loading state
    if (isLoadingDocument) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loading size="default" text="Loading document information..." />
            </div>
        );
    }

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 lg:gap-4">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-lg md:text-xl lg:text-2xl font-bold tracking-tight text-slate-900">
                            {sourceDocument 
                                ? `Upgrade Revision [${sourceDocument.documentId}]`
                                : 'Upgrade Revision'
                            }
                        </h1>
                        <Breadcrumb items={standaloneRevision(navigate)} />
                    </div>
                    <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                        <Button 
                            size="sm" 
                            variant="outline-emerald" 
                            onClick={() => setShowCancelModal(true)} 
                            className="whitespace-nowrap flex items-center gap-2"
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            variant="outline-emerald"
                            onClick={() => {
                                // Navigate to RevisionWorkspaceView
                                setIsNavigating(true);
                                setTimeout(() => navigate(ROUTES.DOCUMENTS.REVISIONS.WORKSPACE, {
                                    state: {
                                        sourceDocument: sourceDocument ? {
                                            code: sourceDocument.documentId,
                                            name: sourceDocument.title,
                                            version: sourceDocument.version,
                                            type: sourceDocument.type,
                                        } : null,
                                        isStandalone: true,
                                        reasonForChange: reasonForChange,
                                    }
                                }), 600);
                            }}
                            disabled={!reasonForChange.trim()}
                            className="shadow-sm"
                        >
                            Continue
                        </Button>
                    </div>
                </div>
            </div>

            {/* Source Document Info */}
            {sourceDocument && (
                <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-white shadow-sm p-6">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <FileText className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-semibold text-slate-900 mb-1">
                                Source Document
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Document Code</p>
                                    <p className="text-sm font-semibold text-slate-900">{sourceDocument.documentId}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Document Name</p>
                                    <p className="text-xs sm:text-sm font-medium text-slate-700">{sourceDocument.title}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Current Version</p>
                                    <p className="text-sm font-semibold text-emerald-600">{sourceDocument.version}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Next Version</p>
                                    <p className="text-sm font-semibold text-blue-600">{revisionNumber}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Info Banner */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <h3 className="text-sm font-semibold text-blue-900 mb-1">
                        Standalone Document Revision
                    </h3>
                    <p className="text-sm text-blue-700">
                        No parent-child relationships detected. This is a standalone revision that does not affect other linked documents.
                    </p>
                </div>
            </div>

            {/* Reason for Change */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
                <div className="mb-4">
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                        Reason for Change <span className="text-red-500">*</span>
                    </label>
                    <p className="text-sm text-slate-500">
                        Provide a detailed explanation for creating this revision.
                    </p>
                </div>
                
                <textarea
                    value={reasonForChange}
                    onChange={(e) => {
                        setReasonForChange(e.target.value);
                        setShowError(false);
                    }}
                    placeholder="e.g., Updated testing procedures to comply with new regulatory requirements. Modified sections 3.2 and 4.5 to reflect current best practices..."
                    className={cn(
                        "w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 resize-none",
                        showError && !reasonForChange.trim()
                            ? "border-red-300 bg-red-50"
                            : "border-slate-200 bg-white"
                    )}
                    rows={5}
                    maxLength={2000}
                />
                
                {showError && !reasonForChange.trim() && (
                    <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        Reason for change is required
                    </p>
                )}
                
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                    <p className={cn(
                        "text-xs",
                        !reasonForChange.trim() ? "text-amber-600 font-medium" : "text-slate-500"
                    )}>
                        {reasonForChange.length} / 2000 characters
                    </p>
                    <p className={cn(
                        "text-xs",
                        !reasonForChange.trim() ? "text-amber-600 font-medium" : "text-emerald-600"
                    )}>
                        {reasonForChange.trim() ? <><Check className="h-3.5 w-3.5 inline shrink-0" /> Required field filled</> : "Reason is required"}
                    </p>
                </div>
            </div>

            {/* Modals */}
            <AlertModal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={handleCancel}
                type="warning"
                title="Cancel Revision Creation?"
                description="Are you sure you want to cancel? All unsaved changes will be lost."
                confirmText="Yes, Cancel"
                cancelText="No, Stay"
                showCancel={true}
            />

            {(isSaving || isSubmitting || isNavigating) && <FullPageLoading text="Processing..." />}
        </div>
    );
};
