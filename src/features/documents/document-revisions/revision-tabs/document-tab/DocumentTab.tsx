import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  File,
  X,
  FileText,
  CheckCircle2,
  AlertCircle,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Image as ImageIcon,
  Check,
} from "lucide-react";
import { Worker, Viewer, SpecialZoomLevel } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { config } from "@/config";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { renderAsync } from "docx-preview";
import { cn } from "@/components/ui/utils";
import { FilePreview } from "./FilePreview";
import { IconCloudUpload } from "@tabler/icons-react";
import { Button } from "@/components/ui/button/Button";
import "./docx-preview.css";
import { getFileIconSrc, defaultFileIcon } from "@/utils/fileIcons";

export interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  status: "uploading" | "success" | "error";
  error?: string;
}

interface DocumentTabProps {
  mode?: "edit" | "view";
  uploadedFiles?: UploadedFile[];
  onFilesChange?: (
    files: UploadedFile[] | ((prev: UploadedFile[]) => UploadedFile[])
  ) => void;
  selectedFile?: File | null;
  onSelectFile?: (file: File | null) => void;
}

export const DocumentTab: React.FC<DocumentTabProps> = ({
  mode = "edit",
  uploadedFiles = [],
  onFilesChange = () => {},
  selectedFile = null,
  onSelectFile = () => {},
}) => {
  const docxContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(80);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [pdfObjectUrl, setPdfObjectUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  // Detect file type
  const getFileType = (): 'pdf' | 'docx' | 'image' | 'unknown' => {
    if (!selectedFile) return 'unknown';
    const name = selectedFile.name.toLowerCase();
    const type = selectedFile.type.toLowerCase();
    if (name.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/) || type.startsWith('image/')) return 'image';
    if (name.endsWith('.pdf') || type === 'application/pdf') return 'pdf';
    if (name.endsWith('.docx') || type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'docx';
    return 'unknown';
  };

  const fileType = getFileType();
  const isDocx = fileType === 'docx';
  const isPdf = fileType === 'pdf';
  const isImage = fileType === 'image';

  useEffect(() => {
    if (mode === "view" && isDocx && selectedFile && docxContainerRef.current) {
      docxContainerRef.current.innerHTML = "";
      renderAsync(selectedFile, docxContainerRef.current, undefined, {
        breakPages: true,
        inWrapper: true,
        ignoreWidth: false,
        ignoreHeight: false,
        renderHeaders: true,
        renderFooters: true,
      }).catch((error) => {
        console.error("Error rendering docx:", error);
      });
    }
  }, [selectedFile, isDocx, mode]);

  useEffect(() => {
    if (mode === "view" && isImage && selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setImagePreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setImagePreviewUrl(null);
    }
  }, [selectedFile, isImage, mode]);

  // PDF blob URL — created once per file, stable across re-renders (prevents white-screen on toolbar interaction)
  useEffect(() => {
    if (mode === "view" && isPdf && selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPdfObjectUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPdfObjectUrl(null);
    }
  }, [selectedFile, isPdf, mode]);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 10, 20));
  const handleResetZoom = () => setZoomLevel(80);

  // VIEW MODE - Read-only document viewer (PDF, DOCX & Images)
  if (mode === "view") {
    // Image viewer
    if (isImage && imagePreviewUrl) {
      return (
        <div
          className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
          style={{ height: "calc(100vh - 180px)", minHeight: "600px" }}
        >
          {/* Toolbar */}
          <div className="flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-1.5 md:gap-2">
              <ImageIcon className="h-3.5 w-3.5 md:h-4 md:w-4 text-slate-600" />
              <span className="hidden sm:inline font-medium text-slate-700 text-xs md:text-sm">
                Image Preview (Read-Only)
              </span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 50}
                title="Zoom Out"
              >
                <ZoomOut className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </Button>
              <div className="min-w-[60px] md:min-w-[70px] text-center">
                <span className="text-xs md:text-xs sm:text-sm font-medium text-slate-700">
                  {zoomLevel}%
                </span>
              </div>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 200}
                title="Zoom In"
              >
                <ZoomIn className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </Button>
              <div className="w-px h-5 md:h-6 bg-slate-300 mx-0.5 md:mx-1" />
              <Button
                variant="outline"
                size="icon-sm"
                onClick={handleResetZoom}
                title="Reset Zoom"
              >
                <RotateCcw className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </Button>
            </div>
          </div>
          {/* Image Content */}
          <div className="flex-1 overflow-auto bg-slate-50 flex items-center justify-center">
            <div
              className="transition-transform duration-200"
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'center',
              }}
            >
              <img
                src={imagePreviewUrl}
                alt={selectedFile?.name || "Preview"}
                className="max-w-full h-auto shadow-lg"
                style={{ maxHeight: 'calc(100vh - 280px)' }}
              />
            </div>
          </div>
        </div>
      );
    }

    if (isDocx) {
      return (
        <div
          className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
          style={{ height: "calc(100vh - 180px)", minHeight: "600px" }}
        >
          {/* Toolbar */}
          <div className="flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-1.5 md:gap-2">       
              <FileText className="h-3.5 w-3.5 md:h-4 md:w-4 text-slate-600" />
            </div>
            <div className="flex items-center gap-1.5 md:gap-2">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 50}
                title="Zoom Out"
              >
                <ZoomOut className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </Button>
              <div className="min-w-[60px] md:min-w-[70px] text-center">
                <span className="text-xs md:text-xs sm:text-sm font-medium text-slate-700">
                  {zoomLevel}%
                </span>
              </div>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 200}
                title="Zoom In"
              >
                <ZoomIn className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </Button>
              <div className="w-px h-5 md:h-6 bg-slate-300 mx-0.5 md:mx-1" />
              <Button
                variant="outline"
                size="icon-sm"
                onClick={handleResetZoom}
                title="Reset Zoom"
              >
                <RotateCcw className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </Button>
            </div>
          </div>
          {/* Document Content */}
          <div className="flex-1 overflow-auto p-2 md:p-4">
            <div 
              className="inline-block min-w-full"
              style={{
                width: `${(100 / zoomLevel) * 100}%`,
              }}
            >
              <div
                ref={docxContainerRef}
                className="docx-preview-container transition-transform duration-200 origin-top-left"
                style={{
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: "top left",
                }}
              />
            </div>
          </div>
        </div>
      );
    }

    // PDF viewer
    if (isPdf && pdfObjectUrl) {
      return (
        <div
          className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col"
          style={{ height: "calc(100vh - 180px)", minHeight: "600px" }}
        >
          <div className="flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-1.5 md:gap-2">
              <FileText className="h-3.5 w-3.5 md:h-4 md:w-4 text-slate-600" />
              <span className="hidden sm:inline font-medium text-slate-700 text-xs md:text-sm">
                PDF Document Preview (Read-Only)
              </span>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <Worker workerUrl={config.pdf.workerUrl}>
              <Viewer
                fileUrl={pdfObjectUrl}
                plugins={[defaultLayoutPluginInstance]}
                defaultScale={SpecialZoomLevel.PageWidth}
              />
            </Worker>
          </div>
        </div>
      );
    }

    // No file or unsupported type
    return (
      <div
        className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex items-center justify-center"
        style={{ height: "calc(100vh - 180px)", minHeight: "600px" }}
      >
        <div className="text-center text-slate-400">
          <FileText className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-2 md:mb-3 text-slate-300" />
          <p className="text-xs md:text-sm">No document to preview</p>
        </div>
      </div>
    );
  }

  // EDIT MODE - Upload functionality

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files) as File[];
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    const newFiles: UploadedFile[] = files.map((file) => ({
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
          f.id === fileId ? { ...f, progress: Math.min(progress, 100) } : f
        )
      );

      if (progress >= 100) {
        clearInterval(interval);
        onFilesChange((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, status: "success" } : f))
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Left Column: Upload Area */}
      <div className="space-y-6">
        {/* Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative border-2 border-dashed rounded-xl p-6 md:p-8 transition-all duration-200",
            isDragging
              ? "border-emerald-500 bg-emerald-50"
              : "border-slate-200 bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50/50"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.txt"
          />

          <div className="flex flex-col items-center justify-center text-center">
            <div
              className={cn(
                "w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center mb-2.5 md:mb-3 transition-colors",
                isDragging ? "bg-emerald-100" : "bg-slate-200"
              )}
            >
              <IconCloudUpload
                className={cn(
                  "h-6 w-6 md:h-7 md:w-7 transition-colors",
                  isDragging ? "text-emerald-600" : "text-slate-500"
                )}
              />
            </div>

            <h3 className="text-sm md:text-base font-semibold text-slate-900 mb-1.5 md:mb-2">
              {isDragging ? "Drop files here" : "Upload Document Files"}
            </h3>
            <p className="text-xs md:text-sm text-slate-500 mb-3 md:mb-4">
              Drag and drop your files here, or click to browse
            </p>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 md:px-5 py-1.5 md:py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors shadow-sm text-xs md:text-sm"
            >
              Browse Files
            </button>

            <p className="text-[10px] md:text-xs text-slate-400 mt-2.5 md:mt-3">
              PDF, Office, Images, Text (Max 50MB)
            </p>
          </div>
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-2.5 md:space-y-3">
            <h4 className="text-xs md:text-sm font-semibold text-slate-700">
              Uploaded Files ({uploadedFiles.length})
            </h4>

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {uploadedFiles.map((uploadedFile) => (
                <div
                  key={uploadedFile.id}
                  className={cn(
                    "bg-white border rounded-lg p-2.5 md:p-3 transition-all cursor-pointer",
                    selectedFile === uploadedFile.file
                      ? "border-emerald-500"
                      : "border-slate-200"
                  )}
                  onClick={() => onSelectFile(uploadedFile.file)}
                >
                  <div className="flex items-start gap-2 md:gap-3">
                    {/* File Icon */}
                    <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center shrink-0">
                      {(() => {
                        const iconSrc = getFileIconSrc(uploadedFile.file.name);
                        return (
                          <img
                            src={iconSrc}
                            alt="file icon"
                            className="h-6 w-6 md:h-8 md:w-8 object-contain"
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
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs md:text-sm font-medium text-slate-900 truncate">
                            {uploadedFile.file.name}
                          </p>
                          <p className="text-[10px] md:text-xs text-slate-500 mt-0.5">
                            {formatFileSize(uploadedFile.file.size)}
                          </p>
                        </div>

                        {/* Status Icon */}
                        <div className="flex items-center gap-1 md:gap-1.5">
                          {uploadedFile.status === "success" && (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5 md:h-4 md:w-4 text-emerald-600" />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectFile(uploadedFile.file);
                                }}
                                className="p-1 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Preview"
                              >
                                <Eye className="h-3.5 w-3.5 md:h-4 md:w-4 text-emerald-600" />
                              </button>
                            </>
                          )}
                          {uploadedFile.status === "error" && (
                            <AlertCircle className="h-3.5 w-3.5 md:h-4 md:w-4 text-red-600" />
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFile(uploadedFile.id);
                            }}
                            className="p-1 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove"
                          >
                            <X className="h-3.5 w-3.5 md:h-4 md:w-4 text-slate-400 hover:text-red-600" />
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {uploadedFile.status === "uploading" && (
                        <div className="mt-1.5 md:mt-2">
                          <div className="flex items-center justify-between text-[10px] md:text-xs text-slate-500 mb-1">
                            <span>Uploading...</span>
                            <span>{uploadedFile.progress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
                              style={{ width: `${uploadedFile.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Success Message */}
                      {uploadedFile.status === "success" && (
                        <p className="text-[10px] md:text-xs text-emerald-600 mt-1 md:mt-1.5 font-medium flex items-center gap-1">
                          <Check className="h-3.5 w-3.5 shrink-0" /> Upload completed
                        </p>
                      )}

                      {/* Error Message */}
                      {uploadedFile.status === "error" && (
                        <p className="text-[10px] md:text-xs text-red-600 mt-1 md:mt-1.5">
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

        {/* Info Box */}
        <div className="p-2.5 md:p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2 md:gap-2.5">
            <File className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs md:text-sm text-blue-800">
              <p className="font-medium mb-0.5 md:mb-1">Upload Guidelines</p>
              <ul className="space-y-0.5 text-blue-700">
                <li>• Upload main document and supporting files</li>
                <li>• Files are version controlled and tracked</li>
                <li>• Click on any file to preview</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: File Preview */}
      <div className="h-full min-h-[600px] border rounded-xl">
        {(() => {
          const selected = uploadedFiles.find((f) => f.file === selectedFile);
          if (!selected || selected.status !== "success") {
            return (
              <div
                className="w-full h-full flex items-center justify-center text-slate-400 text-xs md:text-sm"
                style={{ height: "calc(100vh - 180px)", minHeight: "600px" }}
              >
                {selected && selected.status === "uploading" && "Uploading..."}
                {selected &&
                  selected.status === "error" &&
                  "File download failed"}
                {!selected && "File not selected for preview"}
              </div>
            );
          }
          return <FilePreview file={selectedFile} />;
        })()}
      </div>
    </div>
  );
};
