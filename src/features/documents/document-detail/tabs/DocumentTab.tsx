import React, { useState, useRef, useEffect } from "react";
import { Worker, Viewer, SpecialZoomLevel } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { config } from "@/config";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { renderAsync } from "docx-preview";
import { ZoomIn, ZoomOut, RotateCcw, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import "./docx-preview.css";

interface DocumentTabProps {
    documentFile?: File | null;
    documentType?: 'pdf' | 'docx' | 'image';
}

export const DocumentTab: React.FC<DocumentTabProps> = ({ 
    documentFile = null,
    documentType
}) => {
    const defaultLayoutPluginInstance = defaultLayoutPlugin();
    const docxContainerRef = useRef<HTMLDivElement>(null);
    const [zoomLevel, setZoomLevel] = useState<number>(80);
    const [mockFile, setMockFile] = useState<File | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

    // Load sample.docx for testing if no file provided
    useEffect(() => {
        if (!documentFile) {
            fetch("/src/assets/sample.docx")
                .then(res => res.blob())
                .then(blob => {
                    const file = new window.File([blob], "sample.docx", { 
                        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                    });
                    setMockFile(file);
                })
                .catch(err => console.error("Error loading sample.docx:", err));
        }
    }, [documentFile]);

    const fileToRender = documentFile || mockFile;

    // Detect document type from file
    const getFileType = (): 'pdf' | 'docx' | 'image' | 'unknown' => {
        if (documentType) return documentType;
        if (!fileToRender) return 'unknown';
        
        const name = fileToRender.name.toLowerCase();
        const type = fileToRender.type.toLowerCase();
        
        // Check for images
        if (name.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/) || type.startsWith('image/')) {
            return 'image';
        }
        
        // Check for PDF
        if (name.endsWith('.pdf') || type === 'application/pdf') {
            return 'pdf';
        }
        
        // Check for DOCX
        if (name.endsWith('.docx') || type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            return 'docx';
        }
        
        return 'unknown';
    };

    const fileType = getFileType();
    const isDocx = fileType === 'docx';
    const isPdf = fileType === 'pdf';
    const isImage = fileType === 'image';

    useEffect(() => {
        if (isDocx && fileToRender && docxContainerRef.current) {
            docxContainerRef.current.innerHTML = "";
            renderAsync(fileToRender, docxContainerRef.current, undefined, {
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
    }, [fileToRender, isDocx]);

    // Create image preview URL
    useEffect(() => {
        if (isImage && fileToRender) {
            const url = URL.createObjectURL(fileToRender);
            setImagePreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [fileToRender, isImage]);

    const handleZoomIn = () => {
        setZoomLevel((prev) => Math.min(prev + 10, 200));
    };

    const handleZoomOut = () => {
        setZoomLevel((prev) => Math.max(prev - 10, 20));
    };

    const handleResetZoom = () => {
        setZoomLevel(80);
    };

    // Image viewer
    if (isImage && imagePreviewUrl) {
        return (
            <div className="w-full h-full border rounded-xl flex flex-col" style={{ height: "calc(100vh - 180px)", minHeight: "600px" }}>
                {/* Toolbar */}
                <div className="flex items-center rounded-t-xl justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-slate-600" />
                        <span className="text-xs sm:text-sm font-medium text-slate-700">Image Preview</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon-sm"
                            onClick={handleZoomOut}
                            disabled={zoomLevel <= 20}
                            title="Zoom Out"
                        >
                            <ZoomOut className="h-4 w-4" />
                        </Button>
                        <div className="min-w-[70px] text-center">
                            <span className="text-xs sm:text-sm font-medium text-slate-700">{zoomLevel}%</span>
                        </div>
                        <Button
                            variant="outline"
                            size="icon-sm"
                            onClick={handleZoomIn}
                            disabled={zoomLevel >= 200}
                            title="Zoom In"
                        >
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                        <div className="w-px h-6 bg-slate-300 mx-1" />
                        <Button
                            variant="outline"
                            size="icon-sm"
                            onClick={handleResetZoom}
                            title="Reset Zoom"
                        >
                            <RotateCcw className="h-4 w-4" />
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
                            alt={fileToRender?.name || "Preview"}
                            className="max-w-full h-auto shadow-lg"
                            style={{ maxHeight: 'calc(100vh - 280px)' }}
                        />
                    </div>
                </div>
            </div>
        );
    }

    // DOCX viewer
    if (isDocx) {
        return (
            <div className="w-full h-full border rounded-xl flex flex-col" style={{ height: "calc(100vh - 180px)", minHeight: "600px" }}>
                {/* Toolbar */}
                <div className="flex items-center rounded-t-xl justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-slate-600" />
                        <span className="text-xs sm:text-sm font-medium text-slate-700"></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon-sm"
                            onClick={handleZoomOut}
                            disabled={zoomLevel <= 20}
                            title="Zoom Out"
                        >
                            <ZoomOut className="h-4 w-4" />
                        </Button>
                        <div className="min-w-[70px] text-center">
                            <span className="text-xs sm:text-sm font-medium text-slate-700">{zoomLevel}%</span>
                        </div>
                        <Button
                            variant="outline"
                            size="icon-sm"
                            onClick={handleZoomIn}
                            disabled={zoomLevel >= 200}
                            title="Zoom In"
                        >
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                        <div className="w-px h-6 bg-slate-300 mx-1" />
                        <Button
                            variant="outline"
                            size="icon-sm"
                            onClick={handleResetZoom}
                            title="Reset Zoom"
                        >
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                {/* Document Content */}
                <div className="flex-1 overflow-auto">
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
                                transformOrigin: 'top center',
                            }}
                        />
                    </div>
                </div>
            </div>
        );
    }

    // PDF viewer
    if (isPdf && fileToRender) {
        const pdfUrl = URL.createObjectURL(fileToRender);
        return (
            <div className="w-full h-full border rounded-xl flex flex-col" style={{ height: "calc(100vh - 180px)", minHeight: "600px" }}>
                <div className="flex items-center rounded-t-xl justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-slate-600" />
                        <span className="text-xs sm:text-sm font-medium text-slate-700">PDF Document Preview</span>
                    </div>
                </div>
                <div className="flex-1">
                    <Worker workerUrl={config.pdf.workerUrl}>
                        <Viewer
                            fileUrl={pdfUrl}
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
        <div className="w-full border rounded-xl" style={{ height: "calc(100vh - 180px)", minHeight: "600px" }}>
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <FileText className="h-12 w-12 mb-3 text-slate-300" />
                <p className="text-sm">No document to preview</p>
                <p className="text-xs mt-1">Supported: PDF, DOCX, Images (JPG, PNG)</p>
            </div>
        </div>
    );
};
