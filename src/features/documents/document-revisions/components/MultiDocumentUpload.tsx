import React, { useState, useRef, useMemo } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, X } from "lucide-react";
import { cn } from "@/components/ui/utils";

interface DocumentSlot {
    id: string;
    code: string;
    name: string;
    type: string;
    nextVersion: string;
    file: File | null;
}

interface MultiDocumentUploadProps {
    documents: Array<{
        id: string;
        code: string;
        name: string;
        type: string;
        nextVersion: string;
    }>;
    uploadedFiles: { [documentId: string]: File | null };
    onFilesChange: (files: { [documentId: string]: File | null }) => void;
}

export const MultiDocumentUpload: React.FC<MultiDocumentUploadProps> = ({
    documents,
    uploadedFiles,
    onFilesChange,
}) => {
    // Convert uploadedFiles from parent to document slots format
    const documentSlots = useMemo<DocumentSlot[]>(() => 
        documents.map(doc => ({
            ...doc,
            file: uploadedFiles[doc.id] || null,
        })),
        [documents, uploadedFiles]
    );
    
    const [dragOverSlotId, setDragOverSlotId] = useState<string | null>(null);
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

    const handleDragOver = (e: React.DragEvent, slotId: string) => {
        e.preventDefault();
        setDragOverSlotId(slotId);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOverSlotId(null);
    };

    const handleDrop = (e: React.DragEvent, slotId: string) => {
        e.preventDefault();
        setDragOverSlotId(null);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleFileForSlot(slotId, files[0]);
        }
    };

    const handleFileSelect = (slotId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileForSlot(slotId, e.target.files[0]);
        }
    };

    const handleFileForSlot = (slotId: string, file: File) => {
        // Notify parent with updated file mapping
        const updatedFiles = { ...uploadedFiles, [slotId]: file };
        onFilesChange(updatedFiles);
    };

    const handleRemoveFile = (slotId: string) => {
        // Notify parent with file removed
        const updatedFiles = { ...uploadedFiles, [slotId]: null };
        onFilesChange(updatedFiles);
    };

    const allFilesUploaded = documentSlots.every(slot => slot.file !== null);
    const uploadedCount = documentSlots.filter(slot => slot.file !== null).length;

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Header with Progress */}
            <div className="bg-slate-50 border border-emerald-200 rounded-xl p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                        <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-2">
                            Upload Document Files
                        </h3>
                        <p className="text-xs md:text-sm text-slate-600 mb-3 md:mb-4">
                            Drag and drop new version files into each placeholder below. The system will map files to their corresponding documents.
                        </p>
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="flex-1 bg-white rounded-full h-2 overflow-hidden border border-slate-200">
                                <div
                                    className="bg-emerald-600 h-full transition-all duration-300"
                                    style={{ width: `${(uploadedCount / documents.length) * 100}%` }}
                                />
                            </div>
                            <span className="text-xs md:text-sm font-semibold text-slate-700 min-w-[60px] md:min-w-[80px]">
                                {uploadedCount} / {documents.length}
                            </span>
                        </div>
                    </div>
                    {allFilesUploaded && (
                        <div className="flex items-center gap-1.5 md:gap-2 bg-emerald-100 text-emerald-700 px-3 md:px-4 py-2 rounded-lg shrink-0">
                            <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5" />
                            <span className="font-medium text-xs md:text-sm">All files uploaded!</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Document Slots List */}
            <div className="space-y-2 md:space-y-3">
                {documentSlots.map((slot, index) => {
                    const isDragging = dragOverSlotId === slot.id;
                    const hasFile = slot.file !== null;

                    return (
                        <div
                            key={slot.id}
                            className={cn(
                                "relative border-2 rounded-xl transition-all duration-200",
                                isDragging && "border-emerald-500 bg-emerald-50 scale-[1.02]",
                                hasFile && "border-emerald-200 bg-emerald-50/50",
                                !hasFile && !isDragging && "border-slate-200 bg-white hover:border-slate-200 hover:shadow-sm"
                            )}
                            onDragOver={(e) => handleDragOver(e, slot.id)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, slot.id)}
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 p-3 md:p-4">
                                {/* Slot Number Badge */}
                                <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-600 text-white rounded-lg flex items-center justify-center font-bold text-xs md:text-sm shadow-sm shrink-0">
                                    {index + 1}
                                </div>

                                {/* Document Info */}
                                <div className="flex-1 min-w-0 space-y-0.5 md:space-y-1">
                                    <h4 className="font-semibold text-slate-900 text-xs md:text-sm truncate">
                                        {slot.code}
                                    </h4>
                                    <p className="text-xs text-slate-600 truncate">
                                        {slot.name}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-1.5 md:gap-2 text-xs">
                                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium border border-slate-200">
                                            {slot.type}
                                        </span>
                                        <span className="text-slate-500">
                                            → Version {slot.nextVersion}
                                        </span>
                                    </div>
                                </div>

                                {/* File Status / Upload Button */}
                                <div className="w-full sm:w-auto sm:shrink-0">
                                    {!hasFile ? (
                                        <div className="flex flex-col items-stretch sm:items-end gap-2">
                                            <input
                                                ref={el => { fileInputRefs.current[slot.id] = el; }}
                                                type="file"
                                                className="hidden"
                                                onChange={(e) => handleFileSelect(slot.id, e)}
                                            />
                                            <button
                                                onClick={() => fileInputRefs.current[slot.id]?.click()}
                                                className={cn(
                                                    "px-3 md:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs md:text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 md:gap-2 shadow-sm",
                                                    isDragging && "scale-105 shadow-md"
                                                )}
                                            >
                                                <Upload className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                                <span>Upload File</span>
                                            </button>
                                            {isDragging && (
                                                <p className="text-xs text-emerald-600 font-medium animate-pulse text-center sm:text-right">
                                                    Drop file here
                                                </p>
                                            )}
                                        </div>
                                    ) : slot.file && (
                                        <div className="flex items-center gap-2 md:gap-3">
                                            <div className="flex-1 sm:flex-initial sm:text-right sm:min-w-[200px]">
                                                <div className="flex items-center sm:justify-end gap-1.5 md:gap-2 mb-0.5 md:mb-1">
                                                    <CheckCircle2 className="h-3.5 w-3.5 md:h-4 md:w-4 text-emerald-600 shrink-0" />
                                                    <p className="text-xs md:text-sm font-semibold text-slate-900 truncate max-w-[150px] sm:max-w-[180px]">
                                                        {slot.file.name}
                                                    </p>
                                                </div>
                                                <p className="text-xs text-slate-500">
                                                    {(slot.file.size / 1024).toFixed(2)} KB
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveFile(slot.id)}
                                                className="p-1.5 md:p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors shrink-0"
                                                title="Remove file"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Warning if not all uploaded */}
            {!allFilesUploaded && uploadedCount > 0 && (
                <div className="flex items-start gap-2 md:gap-3 bg-amber-50 border border-amber-200 rounded-lg p-3 md:p-4">
                    <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-xs md:text-sm font-medium text-amber-900">
                            Upload Incomplete
                        </p>
                        <p className="text-xs text-amber-700 mt-0.5 md:mt-1">
                            Please upload files for all {documents.length} documents before proceeding to the next step.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
