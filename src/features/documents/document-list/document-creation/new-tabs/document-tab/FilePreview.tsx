
import React from "react";
import { Worker, Viewer, SpecialZoomLevel } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { config } from "@/config";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

import filePlaceholder from "@/assets/images/image-file/file.png";
import { renderAsync } from "docx-preview";
import { ZoomIn, ZoomOut, RotateCcw, FileText, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import "./docx-preview.css";


interface FilePreviewProps {
    file?: File | null;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ file }) => {
    const defaultLayoutPluginInstance = React.useMemo(() => defaultLayoutPlugin(), []);

    const [fileUrl, setFileUrl] = React.useState<string | null>(null);
    const docxContainerRef = React.useRef<HTMLDivElement>(null);
    const [zoomLevel, setZoomLevel] = React.useState<number>(80);

    React.useEffect(() => {
        if (file) {
            const url = URL.createObjectURL(file);
            setFileUrl(url);
            return () => {
                URL.revokeObjectURL(url);
            };
        } else {
            setFileUrl(null);
        }
    }, [file]);

    React.useEffect(() => {
        const isDocx = file?.name.toLowerCase().endsWith(".docx") || file?.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        
        if (file && isDocx && docxContainerRef.current) {
            docxContainerRef.current.innerHTML = "";
            renderAsync(file, docxContainerRef.current, undefined, {
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
    }, [file]);

    if (!file) {
        return (
            <div className="w-full flex items-center justify-center h-full text-slate-400 text-xs md:text-sm" style={{ height: "calc(100vh - 300px)" }}>
                There is no file available for preview.
            </div>
        );
    }

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const isDocx = file.name.toLowerCase().endsWith(".docx") || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    const handleZoomIn = () => {
        setZoomLevel((prev) => Math.min(prev + 10, 200));
    };

    const handleZoomOut = () => {
        setZoomLevel((prev) => Math.max(prev - 10, 20));
    };

    const handleResetZoom = () => {
        setZoomLevel(80);
    };

    if (isDocx) {
        return (
            <div className="w-full h-full border rounded-xl flex flex-col">
                {/* Toolbar */}
                <div className="flex items-center rounded-t-xl justify-between px-3 md:px-4 py-2.5 md:py-3 bg-slate-50 border-b border-slate-200">
                    <div className="flex items-center gap-1.5 md:gap-2">
                        <FileText className="h-3.5 w-3.5 md:h-4 md:w-4 text-slate-600" />
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-2">
                        <Button
                            variant="outline"
                            size="icon-sm"
                            onClick={handleZoomOut}
                            disabled={zoomLevel <= 20}
                            title="Zoom Out"
                        >
                            <ZoomOut className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        </Button>
                        <div className="min-w-[60px] md:min-w-[70px] text-center">
                            <span className="text-xs md:text-xs sm:text-sm font-medium text-slate-700">{zoomLevel}%</span>
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
                                transformOrigin: 'top left',
                            }}
                        />
                    </div>
                </div>
            </div>
        );
    }

    if (!isPdf) {
        return (
            <div className="w-full" style={{ height: "calc(100vh - 300px)" }}>
                <div className="flex flex-col items-center justify-center h-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-8">
                    <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
                    <p className="text-slate-700 font-semibold mb-2">Detailed Preview Unavailable</p>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto mb-6">
                        This file type does not support in-browser previewing. Please download the file to view its contents.
                    </p>
                    <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-slate-200">
                        <img src={filePlaceholder} alt="File" className="h-16 w-16 mb-2 opacity-50" />
                        <span className="text-xs font-medium text-slate-900">{file.name}</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full overflow-hidden">
            <Worker workerUrl={config.pdf.workerUrl}>
                {fileUrl && (
                    <Viewer
                        fileUrl={fileUrl}
                        plugins={[defaultLayoutPluginInstance]}
                        defaultScale={SpecialZoomLevel.ActualSize}
                    />
                )}
            </Worker>
        </div>
    );
};
