import React, { useRef, useState } from "react";
import { Upload, Link, X } from "lucide-react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LogoUploaderProps {
  value: string;
  onChange: (url: string) => void;
}

type Mode = "url" | "upload";

export const LogoUploader: React.FC<LogoUploaderProps> = ({ value, onChange }) => {
  const [mode, setMode] = useState<Mode>("url");
  const [isDragging, setIsDragging] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => onChange(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const isUploaded = value?.startsWith("data:");
  const hasValue = !!value;

  return (
    <>
      <div className="space-y-2.5">
        {/* Tab Toggle — same motion pattern as Sidebar All/Favourite */}
        <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1 w-fit relative overflow-hidden">
          {(["url", "upload"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors relative z-10",
                mode === m ? "text-emerald-600" : "text-slate-600 hover:text-slate-900"
              )}
            >
              {mode === m && (
                <motion.div
                  layoutId="logoTabIndicator"
                  className="absolute inset-0 bg-white rounded-lg shadow-sm pointer-events-none"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                />
              )}
              <span className="relative z-20 flex items-center gap-1.5">
                {m === "url" ? <Link className="h-3.5 w-3.5" /> : <Upload className="h-3.5 w-3.5" />}
                {m === "url" ? "Link URL" : "Upload File"}
              </span>
            </button>
          ))}
        </div>

        {/* URL Input */}
        {mode === "url" && (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Link className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <input
              type="url"
              value={isUploaded ? "" : value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://example.com/logo.png"
              className="block w-full h-9 pl-9 pr-9 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm placeholder:text-slate-400 transition-all"
            />
            {value && !isUploaded && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Upload Drop Zone */}
        {mode === "upload" && !hasValue && (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex flex-col items-center justify-center gap-2 h-20 rounded-lg border-2 border-dashed cursor-pointer transition-all duration-150",
              isDragging
                ? "border-emerald-400 bg-emerald-50"
                : "border-slate-200 bg-slate-50/50 hover:border-emerald-300 hover:bg-slate-50"
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
            <div className="flex items-center gap-2 text-slate-400">
              <Upload className="h-4 w-4" />
              <span className="text-xs">
                <span className="font-medium text-emerald-600">Click to upload</span> or drag & drop
              </span>
            </div>
            <p className="text-[11px] text-slate-400">PNG, JPG, SVG, WEBP</p>
          </div>
        )}

        {/* Thumbnail Preview — click to lightbox, hover to show X */}
        {hasValue && (
          <div className="flex items-center gap-3">
            <div
              className="relative group w-20 h-20 rounded-lg border-2 border-slate-200 hover:border-emerald-400 overflow-hidden cursor-pointer flex-shrink-0 bg-slate-50 transition-all duration-150"
              onClick={() => setShowLightbox(true)}
            >
              <img
                src={value}
                alt="Logo preview"
                className="w-full h-full object-contain p-1"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              {/* Hover overlay with X button at top-right corner */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange("");
                    if (inputRef.current) inputRef.current.value = "";
                  }}
                  className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-700 truncate">
                {isUploaded ? "Uploaded image" : value}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isUploaded ? "Local file" : "External URL"} · Click to preview
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Portal */}
      {showLightbox && hasValue && createPortal(
        <>
          <div
            className="fixed inset-0 z-[9998] bg-black/90"
            onClick={() => setShowLightbox(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-5">
            <button
              onClick={() => setShowLightbox(false)}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={value}
              alt="Logo full size"
              className="max-w-full max-h-full w-auto h-auto object-contain rounded-xl shadow-2xl"
            />
          </div>
        </>,
        document.body
      )}
    </>
  );
};
