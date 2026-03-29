import React, { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Upload, Trash2, FileText, Eye, Download, Library } from "lucide-react";
import { Textarea } from "@/components/ui/form/ResponsiveForm";
import { Button } from "@/components/ui/button/Button";
import { SelectFromLibraryModal, type LibraryItem } from "@/features/training/course-inventory/shared/SelectFromLibraryModal";
import { cn } from "@/components/ui/utils";
import { TrainingFile } from "../../types";

import { getFileIconSrc, defaultFileIcon } from "@/utils/fileIcons";

interface DocumentTrainingTabProps {
    readOnly?: boolean;
    trainingFiles: TrainingFile[];
    setTrainingFiles?: React.Dispatch<React.SetStateAction<TrainingFile[]>>;
    instruction: string;
    setInstruction?: (v: string) => void;
}

const ACCEPTED_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/webm",
    "video/quicktime",
];
const ACCEPTED_EXTENSIONS = ".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.mov";
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/* ─── Library Mock Data ─────────────────────────────────────────── */
const LIBRARY_MATERIALS: LibraryItem[] = [
    { id: "lib-1", code: "MAT-2026-001", title: "GMP Introduction Video", fileName: "GMP_Introduction_2026.mp4", type: "Video", fileSize: 131072000, category: "GMP" },
    { id: "lib-2", code: "MAT-2026-002", title: "Cleanroom Operations Manual", fileName: "Cleanroom_Operations_Manual.pdf", type: "PDF", fileSize: 4718592, category: "Technical" },
    { id: "lib-3", code: "MAT-2026-003", title: "Equipment Handling Guide", fileName: "Equipment_Handling_Guide.pdf", type: "PDF", fileSize: 8597504, category: "Technical" },
    { id: "lib-4", code: "MAT-2026-004", title: "Safety Protocol Infographic", fileName: "Safety_Protocol_Infographic.png", type: "Image", fileSize: 2202009, category: "Safety" },
    { id: "lib-5", code: "MAT-2026-005", title: "ISO 9001 Training Video", fileName: "ISO9001_Training_2026.mp4", type: "Video", fileSize: 220200960, category: "Compliance" },
    { id: "lib-6", code: "MAT-2026-006", title: "SOP Template Pack", fileName: "SOP_Templates_v3.docx", type: "Document", fileSize: 1048576, category: "SOP" },
    { id: "lib-7", code: "MAT-2026-007", title: "Chemical Handling Procedures", fileName: "Chemical_Handling_Procedures.pdf", type: "PDF", fileSize: 3145728, category: "Safety" },
    { id: "lib-8", code: "MAT-2026-008", title: "HPLC Training Slides", fileName: "HPLC_Training_Slides.pptx", type: "Document", fileSize: 15728640, category: "Technical" },
];

/* ─── Save to Library Prompt ────────────────────────────────────── */
const SaveToLibraryModal: React.FC<{
    isOpen: boolean;
    fileName: string;
    onConfirm: () => void;
    onSkip: () => void;
}> = ({ isOpen, fileName, onConfirm, onSkip }) => {
    if (!isOpen) return null;

    return createPortal(
        <>
            <div className="fixed inset-0 z-50 bg-black/50 animate-in fade-in duration-200" onClick={onSkip} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Library className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-slate-900">Save to Library?</h3>
                            </div>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            Would you like to save <span className="font-medium text-slate-900">"{fileName}"</span> to
                            the shared Training Materials Library? This will make the file available for reuse in other
                            training courses.
                        </p>
                    </div>
                    <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-200">
                        <Button variant="outline" size="sm" onClick={onSkip}>
                            No, Skip
                        </Button>
                        <Button variant="default" size="sm" onClick={onConfirm}>
                            Yes, Save to Library
                        </Button>
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
};

export const DocumentTab: React.FC<DocumentTrainingTabProps> = ({
    readOnly = false,
    trainingFiles,
    setTrainingFiles,
    instruction,
    setInstruction,
}) => {
    // Defensive check for trainingFiles
    const safeFiles = trainingFiles || [];

    const [isDragOver, setIsDragOver] = useState(false);
    const [showLibraryModal, setShowLibraryModal] = useState(false);
    const [showSaveToLibrary, setShowSaveToLibrary] = useState(false);
    const [pendingSaveFileName, setPendingSaveFileName] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLibrarySelect = useCallback((materials: LibraryItem[]) => {
        if (!setTrainingFiles) return;
        const newFiles: TrainingFile[] = materials.map((m) => ({
            id: `lib-${m.id}-${Date.now()}`,
            file: new File([], m.fileName),
            name: m.fileName,
            size: m.fileSize,
            type: m.type === "PDF" ? "application/pdf" : m.type === "Video" ? "video/mp4" : "application/octet-stream",
            progress: 100,
            status: "success" as const,
        }));
        setTrainingFiles((prev) => [...prev, ...newFiles]);
    }, [setTrainingFiles]);

    const processFiles = useCallback((files: FileList | File[]) => {
        if (!setTrainingFiles) return;
        const validFiles = Array.from(files).filter(file => {
            if (!ACCEPTED_TYPES.includes(file.type)) {
                alert(`"${file.name}" is not a supported file type.`);
                return false;
            }
            if (file.size > MAX_FILE_SIZE) {
                alert(`"${file.name}" exceeds the 50MB size limit.`);
                return false;
            }
            return true;
        });

        const newFiles: TrainingFile[] = validFiles.map(file => ({
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            progress: 0,
            status: "uploading" as const,
        }));

        setTrainingFiles(prev => [...prev, ...newFiles]);

        // Simulate upload progress & prompt save-to-library on completion
        newFiles.forEach(tf => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 30 + 10;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    setTrainingFiles!(prev =>
                        prev.map(f => f.id === tf.id ? { ...f, progress: 100, status: "success" } : f)
                    );
                    // prompt save to library for first completed file
                    setTimeout(() => {
                        setPendingSaveFileName(tf.name);
                        setShowSaveToLibrary(true);
                    }, 400);
                } else {
                    setTrainingFiles!(prev =>
                        prev.map(f => f.id === tf.id ? { ...f, progress: Math.round(progress) } : f)
                    );
                }
            }, 200);
        });
    }, [setTrainingFiles]);

    const handleFileDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
        }
    }, [processFiles]);

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFiles(e.target.files);
            e.target.value = "";
        }
    };

    const removeFile = (id: string) => {
        setTrainingFiles?.(prev => prev.filter(f => f.id !== id));
    };

    // ─── Read-Only Mode ────────────────────────────────────────────
    if (readOnly) {
        return (
            <div className="p-4 lg:p-6 space-y-6">
                {/* Training Files */}
                <div className="space-y-4">
                    {safeFiles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                                <Upload className="h-6 w-6 text-slate-300" />
                            </div>
                            <p className="text-sm font-medium text-slate-900">No training materials uploaded</p>
                            <p className="text-xs text-slate-500 mt-1">
                                Training documents will appear here once uploaded.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs sm:text-sm font-medium text-slate-700">
                                    {safeFiles.length} file{safeFiles.length > 1 ? "s" : ""} uploaded
                                </p>
                            </div>
                            <div className="space-y-2">
                                {safeFiles.map((file) => (
                                    <div
                                        key={file.id}
                                        className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                                    >
                                        <img
                                            src={getFileIconSrc(file.name)}
                                            alt=""
                                            className="h-10 w-10 object-contain"
                                            onError={(e) => { (e.target as HTMLImageElement).src = defaultFileIcon; }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                                            <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-slate-200 transition-colors"
                                                title="Preview"
                                            >
                                                <Eye className="h-4 w-4 text-slate-600" />
                                            </button>
                                            <button
                                                className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-slate-200 transition-colors"
                                                title="Download"
                                            >
                                                <Download className="h-4 w-4 text-slate-600" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Instruction (read-only) */}
                {instruction && (
                    <div className="border-t border-slate-200 pt-6">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs sm:text-sm font-medium text-slate-700">
                                Instruction
                            </label>
                            <Textarea
                                value={instruction}
                                readOnly
                                rows={4}
                                className="!text-sm"
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ─── Edit Mode ─────────────────────────────────────────────────

    return (
        <div className="p-4 lg:p-6 space-y-6">
            {/* Section Header */}
            <div>
                <h3 className="text-base font-semibold text-slate-900">Upload Training Materials</h3>
                <p className="text-xs text-slate-500 mt-1">Upload SOP documents (PDF), presentation slides, or training videos for this course, or select from the shared materials library.</p>
            </div>

            {/* Action Buttons Row */}
            <div className="flex items-center gap-3">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload from Computer
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowLibraryModal(true)}
                >
                    <Library className="h-4 w-4 mr-2" />
                    Select from Library
                </Button>
            </div>

            {/* Drop Zone */}
            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                    "relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-all",
                    isDragOver
                        ? "border-emerald-400 bg-emerald-50"
                        : "border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300"
                )}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_EXTENSIONS}
                    multiple
                    onChange={handleFileInputChange}
                    className="hidden"
                />
                <Upload className={cn(
                    "h-8 w-8 mb-3 transition-colors",
                    isDragOver ? "text-emerald-500" : "text-slate-400"
                )} />
                <p className="text-xs sm:text-sm font-medium text-slate-700">
                    {isDragOver ? "Drop files here" : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    PDF, Word, PowerPoint, Videos (max 100MB each)
                </p>
            </div>

            {/* File List */}
            {safeFiles.length > 0 && (
                <div>
                    <h4 className="text-xs sm:text-sm font-medium text-slate-700 mb-2">Uploaded Files ({safeFiles.length})</h4>
                    <div className="space-y-2">
                        {safeFiles.map(file => (
                            <div
                                key={file.id}
                                className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 group hover:bg-slate-100 transition-colors"
                            >
                                {/* File Icon */}
                                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                                    <img
                                        src={getFileIconSrc(file.name)}
                                        alt="file icon"
                                        className="h-7 w-7 object-contain"
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                    />
                                </div>

                                {/* File Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm font-medium text-slate-700 truncate">{file.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs text-slate-400">{formatFileSize(file.size)}</span>
                                        {file.status === "uploading" && (
                                            <span className="text-xs text-emerald-600 font-medium">{file.progress}%</span>
                                        )}
                                        {file.status === "success" && (
                                            <span className="text-xs text-emerald-600 font-medium">Uploaded</span>
                                        )}
                                        {file.status === "error" && (
                                            <span className="text-xs text-red-600 font-medium">Failed</span>
                                        )}
                                    </div>
                                    {/* Progress Bar */}
                                    {file.status === "uploading" && (
                                        <div className="w-full h-1 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                                                style={{ width: `${file.progress}%` }}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Remove Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFile(file.id);
                                    }}
                                    className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                    aria-label="Remove file"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Instruction / Notes */}
            <div className="border-t border-slate-200 pt-6">
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs sm:text-sm font-medium text-slate-700">
                        Instruction
                    </label>
                    <Textarea
                        value={instruction}
                        onChange={(e) => setInstruction?.(e.target.value)}
                        rows={4}
                        className="!text-sm"
                        placeholder="e.g., Focus on Chapter 3 – Cleaning Validation Procedures. Pay special attention to Appendix B for equipment handling."
                    />
                    <p className="text-xs text-slate-500">Provide notes to help employees focus on specific sections or key points in the training materials.</p>
                </div>
            </div>

            {/* Library Modal */}
            <SelectFromLibraryModal
                isOpen={showLibraryModal}
                onClose={() => setShowLibraryModal(false)}
                onSelect={handleLibrarySelect}
                items={LIBRARY_MATERIALS}
                excludeFileNames={safeFiles.map((f) => f.name)}
            />

            {/* Save to Library Prompt */}
            <SaveToLibraryModal
                isOpen={showSaveToLibrary}
                fileName={pendingSaveFileName}
                onConfirm={() => {
                    // In a real app, this would call an API to save to library
                    setShowSaveToLibrary(false);
                    setPendingSaveFileName("");
                }}
                onSkip={() => {
                    setShowSaveToLibrary(false);
                    setPendingSaveFileName("");
                }}
            />
        </div>
    );
};
