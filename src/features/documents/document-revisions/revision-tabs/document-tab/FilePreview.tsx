import React, { useState, useEffect, useRef } from"react";
import { FileText, File as FileIcon, Image as ImageIcon, AlertCircle, AlertTriangle, ZoomIn, ZoomOut, RotateCcw } from"lucide-react";
import { Worker, Viewer, SpecialZoomLevel } from"@react-pdf-viewer/core";
import { config } from"@/config";
import"@react-pdf-viewer/core/lib/styles/index.css";
import"@react-pdf-viewer/default-layout/lib/styles/index.css";
import"./docx-preview.css";

import filePlaceholder from"@/assets/images/image-file/file.png";
import { renderAsync } from"docx-preview";
import { Button } from"@/components/ui/button/Button";
import { Loading } from"@/components/ui/loading/Loading";

interface FilePreviewProps {
 file: File | null;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ file }) => {
 const [previewUrl, setPreviewUrl] = useState<string | null>(null);
 const [previewType, setPreviewType] = useState<"pdf" |"image" |"text" |"docx" |"unsupported">("unsupported");
 const docxContainerRef = useRef<HTMLDivElement>(null);
 const [zoomLevel, setZoomLevel] = useState<number>(80);
 const [textContent, setTextContent] = useState<string>("");
 const [isLoading, setIsLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);

 const handleZoomIn = () => {
 setZoomLevel((prev) => Math.min(prev + 10, 200));
 };

 const handleZoomOut = () => {
 setZoomLevel((prev) => Math.max(prev - 10, 20));
 };

 const handleResetZoom = () => {
 setZoomLevel(80);
 };

 useEffect(() => {
 if (!file) {
 setPreviewUrl(null);
 setPreviewType("unsupported");
 setTextContent("");
 setError(null);
 return;
 }

 setIsLoading(true);
 setError(null);

 const fileType = file.type;
 const fileName = file.name.toLowerCase();

 // PDF - use iframe
 if (fileType ==="application/pdf" || fileName.endsWith(".pdf")) {
 setPreviewType("pdf");
 const url = URL.createObjectURL(file);
 setPreviewUrl(url);
 setIsLoading(false);
 }
 // Word documents - use docx-preview
 else if (
 fileName.endsWith(".docx") ||
 fileType ==="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
 ) {
 setPreviewType("docx");
 setIsLoading(true);
 if (docxContainerRef.current) {
 docxContainerRef.current.innerHTML ="";
 renderAsync(file, docxContainerRef.current, undefined, {
 breakPages: true,
 inWrapper: true,
 ignoreWidth: false,
 ignoreHeight: false,
 renderHeaders: true,
 renderFooters: true,
 })
 .then(() => setIsLoading(false))
 .catch((error) => {
 console.error("Error rendering docx:", error);
 setError("Failed to render Word document");
 setIsLoading(false);
 });
 } else {
 setIsLoading(false);
 }
 }
 // Old .doc format - not supported
 else if (
 fileName.endsWith(".doc") ||
 fileType ==="application/msword"
 ) {
 setPreviewType("unsupported");
 setIsLoading(false);
 }
 // Images
 else if (fileType.startsWith("image/")) {
 setPreviewType("image");
 const url = URL.createObjectURL(file);
 setPreviewUrl(url);
 setIsLoading(false);
 }
 // Text files
 else if (
 fileType ==="text/plain" ||
 fileName.endsWith(".txt") ||
 fileName.endsWith(".md") ||
 fileName.endsWith(".json") ||
 fileName.endsWith(".xml") ||
 fileName.endsWith(".csv")
 ) {
 setPreviewType("text");
 const reader = new FileReader();
 reader.onload = (e) => {
 setTextContent(e.target?.result as string ||"");
 setIsLoading(false);
 };
 reader.onerror = () => {
 setError("Failed to read text file");
 setIsLoading(false);
 };
 reader.readAsText(file);
 }
 // Unsupported
 else {
 console.warn("Unsupported file type:", { fileName, fileType });
 setPreviewType("unsupported");
 setIsLoading(false);
 }

 // Cleanup
 return () => {
 if (previewUrl) {
 URL.revokeObjectURL(previewUrl);
 }
 };
 }, [file]);

 if (!file) {
 return (
 <div className="h-full flex items-center justify-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
 <div className="text-center p-6 md:p-8">
 <FileIcon className="h-12 w-12 md:h-16 md:w-16 text-slate-300 mx-auto mb-3 md:mb-4" />
 <p className="text-slate-500 font-medium text-sm md:text-base">No file selected</p>
 <p className="text-xs md:text-sm text-slate-400 mt-1.5 md:mt-2">
 Upload a file to see preview
 </p>
 </div>
 </div>
 );
 }

 if (isLoading) {
 return (
 <div className="h-full flex items-center justify-center bg-white rounded-xl border border-slate-200">
 <Loading size="default" text="Loading preview..." />
 </div>
 );
 }

 return (
 <div className="h-full flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden">
 {/* Header */}
 <div className="px-4 md:px-6 py-3 md:py-4 border-b border-slate-200 bg-slate-50">
 <div className="flex items-start gap-2 md:gap-3">
 <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
 {previewType ==="pdf" && <FileText className="h-4 w-4 md:h-5 md:w-5 text-emerald-600" />}
 {previewType ==="image" && <ImageIcon className="h-4 w-4 md:h-5 md:w-5 text-emerald-600" />}
 {previewType ==="text" && <FileText className="h-4 w-4 md:h-5 md:w-5 text-emerald-600" />}
 {previewType ==="unsupported" && <FileIcon className="h-4 w-4 md:h-5 md:w-5 text-slate-400" />}
 </div>
 <div className="flex-1 min-w-0">
 <h3 className="text-xs md:text-sm font-semibold text-slate-900 truncate">
 {file.name}
 </h3>
 <p className="text-[10px] md:text-xs text-slate-500 mt-0.5">
 {(file.size / 1024).toFixed(2)} KB • {file.type ||"Unknown type"}
 </p>
 </div>
 </div>
 </div>

 {/* Preview Content */}
 <div className="flex-1 overflow-auto">
 {error && (
 <div className="h-full flex items-center justify-center p-4 md:p-6">
 <div className="text-center max-w-md">
 <AlertCircle className="h-12 w-12 md:h-16 md:w-16 text-red-500 mx-auto mb-3 md:mb-4" />
 <h4 className="text-base md:text-lg font-semibold text-slate-900 mb-1.5 md:mb-2">
 Error Loading Preview
 </h4>
 <p className="text-xs md:text-sm text-slate-600 mb-3 md:mb-4">
 {error}
 </p>
 </div>
 </div>
 )}

 {!error && previewType ==="pdf" && previewUrl && (
 <div className="h-full">
 <Worker workerUrl={config.pdf.workerUrl}>
 <Viewer key={previewUrl} fileUrl={previewUrl} defaultScale={SpecialZoomLevel.ActualSize} />
 </Worker>
 </div>
 )}

 {!error && previewType ==="image" && previewUrl && (
 <div className="flex items-center justify-center h-full p-4 md:p-6">
 <img
 src={previewUrl}
 alt={file.name}
 className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
 />
 </div>
 )}

 {!error && previewType ==="text" && (
 <div className="p-4 md:p-6">
 <div className="bg-slate-50 rounded-lg p-3 md:p-4 text-xs md:text-sm">
 <pre className="whitespace-pre-wrap text-slate-700">{textContent}</pre>
 </div>
 </div>
 )}

 {!error && previewType ==="docx" && (
 <div className="w-full h-full border rounded-xl flex flex-col" style={{ height:"calc(100vh - 180px)", minHeight:"600px" }}>
 {/* Toolbar */}
 <div className="flex items-center rounded-t-xl justify-between px-3 md:px-4 py-2.5 md:py-3 bg-slate-50 border-b border-slate-200">
 <div className="flex items-center gap-1.5 md:gap-2">
 <FileText className="h-3.5 w-3.5 md:h-4 md:w-4 text-slate-600" />
 <span className="hidden sm:inline text-xs md:text-xs sm:text-sm font-medium text-slate-700"></span>
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
 transformOrigin:'top left',
 }}
 />
 </div>
 </div>
 </div>
 )}

 {!error && previewType ==="unsupported" && (
 <div className="h-full flex items-center justify-center p-4 md:p-6">
 <div className="text-center w-full">
 <div className="w-full h-[calc(100vh-280px)]" style={{ minHeight:"500px" }}>
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
 <div className="text-[10px] md:text-xs text-slate-500 bg-slate-50 rounded-lg p-3 md:p-4 text-left mt-3 md:mt-4 inline-block text-left">
 <p className="font-semibold mb-1.5 md:mb-2">Supported formats:</p>
 <ul className="space-y-0.5 md:space-y-1 list-disc list-inside">
 <li>PDF Documents (.pdf)</li>
 <li>Word Documents (.docx)</li>
 <li>Images (.jpg, .png, .gif, .webp, etc.)</li>
 <li>Text Files (.txt, .md, .json, .xml, .csv)</li>
 </ul>
 <p className="mt-2 md:mt-3 text-slate-600">
 <AlertTriangle className="h-3.5 w-3.5 text-amber-600 inline shrink-0" /> Old Word format (.doc) is not supported. Please use .docx format.
 </p>
 </div>
 </div>
 </div>
 )}
 </div>
 </div>
 );
};
