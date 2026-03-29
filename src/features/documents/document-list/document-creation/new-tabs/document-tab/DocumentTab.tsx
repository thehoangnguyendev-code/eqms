import React, { useState, useRef } from "react";
import { Upload, File, X, CheckCircle2, AlertCircle, Check } from "lucide-react";
import { IconCloudUpload } from "@tabler/icons-react";
import { cn } from "@/components/ui/utils";
import { FilePreview } from "./FilePreview";
import { getFileIconSrc, defaultFileIcon } from "@/utils/fileIcons";
import type { ParentDocument, RelatedDocument } from "@/features/documents/shared/tabs/general-tab/subtabs/types";

export interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  status: "uploading" | "success" | "error";
  error?: string;
}

interface DocumentTabProps {
  uploadedFiles: UploadedFile[];
  onFilesChange: (
    files: UploadedFile[] | ((prev: UploadedFile[]) => UploadedFile[]),
  ) => void;
  selectedFile: File | null;
  onSelectFile: (file: File | null) => void;
  maxFiles?: number; // Maximum number of files allowed (undefined = unlimited)
  isObsoleted?: boolean; // Disable all file operations when obsoleted
  hideUpload?: boolean; // Hide upload section and show "no attachment" message
  // Optional extended props for document relationships
  parentDocument?: ParentDocument | null;
  onParentDocumentChange?: (doc: ParentDocument | null) => void;
  relatedDocuments?: RelatedDocument[];
  onRelatedDocumentsChange?: (docs: RelatedDocument[]) => void;
  documentType?: string;
  onSuggestedCodeChange?: (code: string) => void;
}

export const DocumentTab: React.FC<DocumentTabProps> = ({
  uploadedFiles,
  onFilesChange,
  selectedFile,
  onSelectFile,
  maxFiles,
  isObsoleted = false,
  hideUpload = false,
  // Extended props (unused in this component but accepted for compatibility)
  parentDocument: _parentDocument,
  onParentDocumentChange: _onParentDocumentChange,
  relatedDocuments: _relatedDocuments,
  onRelatedDocumentsChange: _onRelatedDocumentsChange,
  documentType: _documentType,
  onSuggestedCodeChange: _onSuggestedCodeChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if max files limit is reached or document is obsoleted
  const isMaxFilesReached =
    isObsoleted || (maxFiles !== undefined && uploadedFiles.length >= maxFiles);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isMaxFilesReached) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (isMaxFilesReached) return;

    const files = Array.from(e.dataTransfer.files) as File[];
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && !isMaxFilesReached) {
      const files = Array.from(e.target.files) as File[];
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    // Limit files based on maxFiles
    let filesToUpload = files;
    if (maxFiles !== undefined) {
      const remainingSlots = maxFiles - uploadedFiles.length;
      if (remainingSlots <= 0) return;
      filesToUpload = files.slice(0, remainingSlots);
    }

    const newFiles: UploadedFile[] = filesToUpload.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      progress: 0,
      status: "uploading",
    }));

    onFilesChange((prev) => [...prev, ...newFiles]);

    // Auto-select first file for preview
    if (!selectedFile && newFiles.length > 0) {
      onSelectFile(newFiles[0].file);
    }

    // Simulate upload progress
    newFiles.forEach((uploadedFile) => {
      simulateUpload(uploadedFile.id);
    });
  };

  const simulateUpload = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;

      onFilesChange((prev) =>
        prev.map((f) =>
          f.id === fileId ? { ...f, progress: Math.min(progress, 100) } : f,
        ),
      );

      if (progress >= 100) {
        clearInterval(interval);
        onFilesChange((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, status: "success" } : f)),
        );
      }
    }, 200);
  };

  const handleRemoveFile = (fileId: string) => {
    const fileToRemove = uploadedFiles.find((f) => f.id === fileId);
    onFilesChange((prev) => prev.filter((f) => f.id !== fileId));

    // If removed file was selected, clear preview or select another
    if (fileToRemove && selectedFile === fileToRemove.file) {
      const remaining = uploadedFiles.filter((f) => f.id !== fileId);
      onSelectFile(remaining.length > 0 ? remaining[0].file : null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Show "No attachment" message when hideUpload is true */}
      {hideUpload ? (
        <div className="border-2 border-dashed rounded-xl flex items-center justify-center bg-slate-50">
          <div className="text-center p-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <File className="h-8 w-8 text-slate-400" />
            </div>
            <h4 className="text-sm font-semibold text-slate-700 mb-2">
              There is no attachment to display
            </h4>
          </div>
        </div>
      ) : (
        <>
          {/* File Preview and Uploaded Files */}
          <div className="space-y-4 md:space-y-6">
            {/* Uploaded Files List - Horizontal scroll on desktop */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-700">
                    Uploaded Files ({uploadedFiles.length})
                  </h4>
                  {maxFiles !== undefined && (
                    <span className="text-xs text-slate-500">
                      {uploadedFiles.length}/{maxFiles}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1 gap-4">
                  {uploadedFiles.map((uploadedFile) => (
                    <div
                      key={uploadedFile.id}
                      className={cn(
                        "relative group bg-white border rounded-lg p-3 transition-all cursor-pointer hover:shadow-md",
                        selectedFile === uploadedFile.file
                          ? "border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50/30"
                          : "border-slate-200 hover:border-emerald-500/50",
                      )}
                      onClick={() => onSelectFile(uploadedFile.file)}
                    >
                      <div className="flex items-start gap-2">
                        {/* File Icon */}
                        <div className="w-8 h-8 flex items-center justify-center shrink-0">
                          {(() => {
                            const iconSrc = getFileIconSrc(uploadedFile.file.name);
                            return (
                              <img
                                src={iconSrc}
                                alt="file icon"
                                className="h-7 w-7 object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display =
                                    "none";
                                }}
                              />
                            );
                          })()}
                        </div>

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">
                                {uploadedFile.file.name}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {formatFileSize(uploadedFile.file.size)}
                              </p>
                            </div>

                            {/* Status & Remove */}
                            <div className="flex items-center gap-1">
                              {uploadedFile.status === "success" && (
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              )}
                              {uploadedFile.status === "error" && (
                                <AlertCircle className="h-3.5 w-3.5 text-red-600" />
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!isObsoleted) {
                                    handleRemoveFile(uploadedFile.id);
                                  }
                                }}
                                disabled={isObsoleted}
                                className={cn(
                                  "p-1 rounded-lg transition-colors",
                                  isObsoleted
                                    ? "cursor-not-allowed opacity-50"
                                    : "hover:bg-red-50"
                                )}
                                title={isObsoleted ? "Cannot remove file when obsoleted" : "Remove"}
                              >
                                <X className="h-3.5 w-3.5 text-slate-400 hover:text-red-600" />
                              </button>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          {uploadedFile.status === "uploading" && (
                            <div className="mt-1.5">
                              <div className="flex items-center justify-between text-xs text-slate-500 mb-0.5">
                                <span>Uploading...</span>
                                <span>{uploadedFile.progress}%</span>
                              </div>
                              <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
                                  style={{ width: `${uploadedFile.progress}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Status Messages */}
                          {uploadedFile.status === "success" && (
                            <p className="text-xs text-emerald-600 mt-1 font-medium flex items-center gap-1">
                              <Check className="h-3.5 w-3.5 shrink-0" /> Uploaded
                            </p>
                          )}
                          {uploadedFile.status === "error" && (
                            <p className="text-xs text-red-600 mt-1">
                              {uploadedFile.error || "Upload failed"}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* File Preview - Full width */}
            <div className=" grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
              {(() => {
                if (uploadedFiles.length === 0) {
                  return (
                    <div
                      className={cn(
                        "h-full border-2 border-dashed rounded-xl p-8 lg:p-12 flex items-center justify-center transition-all duration-200",
                        isMaxFilesReached
                          ? "border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed"
                          : isDragging
                            ? "border-emerald-500 bg-emerald-50 scale-[1.02]"
                            : "border-slate-200 bg-white hover:border-slate-400"
                      )}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <div className="text-center">
                        <IconCloudUpload className={cn(
                          "h-12 w-12 lg:h-16 lg:w-16 mx-auto mb-3 lg:mb-4 transition-colors",
                          isMaxFilesReached
                            ? "text-slate-400"
                            : isDragging
                              ? "text-emerald-600"
                              : "text-slate-400"
                        )} />
                        <h4 className="text-base lg:text-lg font-semibold text-slate-900 mb-2">
                          {isObsoleted
                            ? "Document is obsoleted"
                            : isMaxFilesReached
                              ? `Maximum ${maxFiles} file${maxFiles! > 1 ? 's' : ''} uploaded`
                              : isDragging
                                ? "Drop files here"
                                : "Drop files here or click to browse"}
                        </h4>
                        <p className="text-xs lg:text-sm text-slate-600 mb-4 lg:mb-6">
                          {isObsoleted
                            ? "File upload is disabled for obsoleted documents"
                            : isMaxFilesReached
                              ? "Remove existing file to upload a new one"
                              : "Support for PDF, DOCX, DOC, and other document formats"}
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple={maxFiles === undefined || maxFiles > 1}
                          onChange={handleFileSelect}
                          className="hidden"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.txt"
                          disabled={isMaxFilesReached}
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isMaxFilesReached}
                          className={cn(
                            "px-5 py-2 rounded-lg font-medium transition-colors shadow-sm text-sm",
                            isMaxFilesReached
                              ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                              : "bg-emerald-600 hover:bg-emerald-700 text-white"
                          )}
                        >
                          Browse Files
                        </button>
                      </div>
                    </div>
                  );
                }

                const selected = uploadedFiles.find(
                  (f) => f.file === selectedFile,
                );

                if (!selected || selected.status !== "success") {
                  return (
                    <div className="h-full flex items-center justify-center border rounded-xl bg-slate-50">
                      <div className="text-center p-8">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
                          {selected?.status === "uploading" ? (
                            <Upload className="h-6 w-6 text-slate-400 animate-pulse" />
                          ) : (
                            <AlertCircle className="h-6 w-6 text-slate-400" />
                          )}
                        </div>
                        <p className="text-sm text-slate-600">
                          {selected?.status === "uploading" && "Uploading file..."}
                          {selected?.status === "error" && "File upload failed"}
                          {!selected && "Select a file to preview"}
                        </p>
                      </div>
                    </div>
                  );
                }

                return <FilePreview file={selectedFile} />;
              })()}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

