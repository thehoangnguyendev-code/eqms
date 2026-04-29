import React, { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Download, ShieldCheck, X, Calendar, ZoomIn, ZoomOut } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button/Button";
import { cn } from "@/components/ui/utils"; import type { EmployeeTrainingFile, CompletedCourseRecord } from "../../types";
import logo from "@/assets/images/logo_doc_nobg.png";

interface CertificatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: EmployeeTrainingFile;
  course: CompletedCourseRecord;
}

export const CertificatePreviewModal: React.FC<CertificatePreviewModalProps> = ({
  isOpen,
  onClose,
  employee,
  course,
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const previewAreaRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [autoScale, setAutoScale] = useState(1);
  const [userScale, setUserScale] = useState(1);
  const pinchStartDistance = useRef<number | null>(null);

  // Responsive base scaling logic
  React.useLayoutEffect(() => {
    const updateScale = () => {
      if (!previewAreaRef.current) return;
      const baseWidth = 794;
      const padding = window.innerWidth < 640 ? 32 : 80;
      const availableWidth = previewAreaRef.current.clientWidth - padding;

      if (availableWidth < baseWidth) {
        setAutoScale(availableWidth / baseWidth);
      } else {
        setAutoScale(1);
      }
    };

    if (isOpen) {
      updateScale();
      window.addEventListener("resize", updateScale);
    }
    return () => window.removeEventListener("resize", updateScale);
  }, [isOpen]);

  // Touch Zoom (Pinch) Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      pinchStartDistance.current = distance;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStartDistance.current) {
      const distance = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      const ratio = distance / pinchStartDistance.current;
      setUserScale(prev => Math.min(Math.max(0.5, prev * ratio), 3));
      pinchStartDistance.current = distance;
    }
  };

  const handleTouchEnd = () => {
    pinchStartDistance.current = null;
  };

  const currentScale = autoScale * userScale;

  const handleExportPDF = async () => {
    if (!certificateRef.current) return;
    setIsExporting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff",
        // Capture at the natural A4 pixel width (794px @ 96dpi)
        width: certificateRef.current.scrollWidth,
        height: certificateRef.current.scrollHeight,
        onclone: (_clonedDoc, clonedElement) => {
          // The second arg is the cloned version of certificateRef.current itself.
          // Walk up to find the scale wrapper and neutralise it so html2canvas
          // captures the certificate at 1:1, not at the zoomed-in/out preview scale.
          let el: HTMLElement | null = clonedElement.parentElement;
          while (el) {
            const t = el.style.transform;
            if (t && t.includes("scale")) {
              el.style.transform = "none";
              el.style.width = "210mm";
              el.style.height = "297mm";
              break;
            }
            el = el.parentElement;
          }

          // Force all inline-flex / flex children to render correctly
          clonedElement.style.transform = "none";
          clonedElement.style.position = "relative";

          // Inline all computed background-colors so html2canvas picks them up
          // (fixes Tailwind bg-* classes that rely on CSS variables)
          clonedElement.querySelectorAll<HTMLElement>("*").forEach((node) => {
            const computed = window.getComputedStyle(node);
            const bg = computed.backgroundColor;
            const color = computed.color;
            const borderColor = computed.borderColor;
            if (bg && bg !== "rgba(0, 0, 0, 0)") node.style.backgroundColor = bg;
            if (color) node.style.color = color;
            if (borderColor) node.style.borderColor = borderColor;
          });
        },
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      const fileName = `CERT_${employee.employeeId}_${course.courseCode}_${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("PDF Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const qrValue = `CERTIFICATE OF COMPLETION\nEmployee: ${employee.employeeName} (${employee.employeeId})\nCourse: ${course.courseCode} - ${course.courseTitle}\nVersion: ${course.version}\nCompleted: ${course.completionDate}\nVerified by EQMS Training System`;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-hidden">
          {/* Backdrop (No blur as requested) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-slate-100 rounded-xl shadow-2xl w-full max-w-5xl h-full flex flex-col overflow-hidden border border-slate-200 relative z-10"
            style={{ maxHeight: "calc(100vh - 2rem)" }}
          >
            {/* Modal Header - Synced with FormModal */}
            <div className="flex-shrink-0 bg-white border-b border-slate-100 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="text-sm md:text-base lg:text-lg font-semibold text-slate-900 leading-tight">Certificate Preview</h3>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Zoom Controls */}
                <div className="hidden md:flex items-center bg-slate-100 rounded-lg p-1 mr-2 border border-slate-200">
                  <button
                    onClick={() => setUserScale(prev => Math.max(0.5, prev - 0.1))}
                    className="p-1 hover:bg-white rounded transition-colors text-slate-500"
                    title="Zoom Out"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <span className="text-[10px] font-bold px-2 text-slate-600 min-w-[45px] text-center">
                    {Math.round(userScale * 100)}%
                  </span>
                  <button
                    onClick={() => setUserScale(prev => Math.min(3, prev + 0.1))}
                    className="p-1 hover:bg-white rounded transition-colors text-slate-500"
                    title="Zoom In"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                </div>

                <Button
                  size="sm"
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-sm px-2 sm:px-4"
                >
                  {isExporting ? (
                    <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">
                    {isExporting ? "Exporting..." : "Export PDF"}
                  </span>
                </Button>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-4 w-4 text-slate-500" />
                </button>
              </div>
            </div>

            {/* Scrollable Preview Area */}
            <div
              ref={previewAreaRef}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="flex-1 overflow-auto bg-slate-200/50 p-4 sm:p-10 flex flex-col items-center custom-scrollbar"
            >
              <div
                style={{
                  transform: `scale(${currentScale})`,
                  transformOrigin: "top center",
                  width: "210mm",
                  height: `${currentScale * 297}mm`,
                  minHeight: `${currentScale * 297}mm`,
                }}
                className="transition-transform duration-100 ease-out flex-shrink-0"
              >
                {/* Actual Certificate Container (A4 Proportion) */}
                <div
                  id="cert-id-capture"
                  ref={certificateRef}
                  className="bg-white shadow-xl flex flex-col p-[15mm] relative overflow-hidden"
                  style={{
                    width: "210mm",
                    height: "297mm",
                    minHeight: "297mm",
                    maxHeight: "297mm",
                    fontFamily: "'Inter', system-ui, sans-serif",
                  }}
                >
                  {/* Decorative Border */}
                  <div className="absolute inset-0 border-[10px] border-emerald-500/10 pointer-events-none" />
                  <div className="absolute inset-4 border border-emerald-100 pointer-events-none" />

                  {/* Header Section */}
                  <div className="flex flex-col items-center text-center space-y-4 pt-4">
                    <img src={logo} alt="Company Logo" className="h-24 w-auto mb-2" />
                    <div className="space-y-1">
                      <p className="text-emerald-600 font-black tracking-wider uppercase text-3xl">Certificate of Completion</p>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="mt-5 text-center space-y-8">
                    <div className="space-y-1">
                      <p className="text-slate-500 text-base italic">This is to certify that</p>
                      <h1 className="text-4xl font-black text-slate-900 tracking-tight py-2 underline decoration-emerald-100 underline-offset-8">
                        {employee.employeeName}
                      </h1>
                      <p className="text-slate-500 font-semibold tracking-wide uppercase text-[10px] pt-1">
                        EMPLOYEE ID: {employee.employeeId} · {employee.jobPosition}
                      </p>
                    </div>

                    <div className="max-w-2xl mx-auto space-y-3">
                      <p className="text-slate-600 text-base leading-relaxed">
                        has successfully fulfilled all requirements and demonstrated proficiency in the curriculum of
                      </p>
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-1.5 relative overflow-hidden">
                        {/* Background Watermark Icon */}
                        <ShieldCheck className="absolute -right-4 -bottom-4 h-20 w-20 text-slate-200/50 -rotate-12" />

                        <h2 className="text-xl font-bold text-slate-900 relative z-10">{course.courseCode}: {course.courseTitle}</h2>
                        <div className="flex items-center justify-center gap-4 text-xs font-medium text-slate-500 relative z-10">
                          <span className="flex items-center gap-1.5"> Version {course.version}</span>
                          <span className="h-1 w-1 rounded-full bg-slate-300" />
                          <span className="flex items-center gap-1.5"> Completed on {course.completionDate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Additional Training Metadata */}
                    <div className="max-w-xl mx-auto grid grid-cols-3 gap-6 py-4 border-y border-slate-100">
                      <div className="text-center space-y-0.5">
                        <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Assessment</p>
                        <p className="text-xs font-bold text-slate-700">{course.score}% Score</p>
                      </div>
                      <div className="text-center space-y-0.5">
                        <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Duration</p>
                        <p className="text-xs font-bold text-slate-700">2.5 Hours</p>
                      </div>
                      <div className="text-center space-y-0.5">
                        <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Standard</p>
                        <p className="text-xs font-bold text-slate-700 uppercase">GxP / ISO 9001</p>
                      </div>
                    </div>

                    {/* Recognition statement */}
                    <p className="max-w-xl mx-auto text-slate-500 text-[11px] leading-relaxed italic">
                      This certification confirms that the individual has been assessed and verified in accordance
                      with the company's Quality Management System and regulatory requirements for specialized industrial tasks.
                    </p>
                  </div>

                  {/* Signature Section - Dual Authentication */}
                  <div className=" grid grid-cols-2 gap-16 px-10">
                    {/* Authorized Trainer */}
                    <div className="flex flex-col items-center space-y-3 text-center">
                      <div className="w-full border-b border-slate-300 pb-2 flex flex-col items-center min-h-[70px] justify-end relative">
                        <ShieldCheck className="absolute top-0 opacity-10 h-10 w-10 text-emerald-600" />
                        <span className="italic text-slate-600 text-lg leading-none">{course.trainerName}</span>
                        <span className="text-[8px] text-emerald-500 font-bold mt-2 uppercase tracking-wider italic">E-Signed</span>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-slate-900">{course.trainerName}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Authorized Trainer / Evaluator</p>
                        <p className="text-[9px] text-slate-400 italic mt-0.5">{course.trainerEsignDate}</p>
                      </div>
                    </div>

                    {/* Quality Manager */}
                    <div className="flex flex-col items-center space-y-3 text-center">
                      <div className="w-full border-b border-slate-300 pb-2 flex flex-col items-center min-h-[70px] justify-end relative">
                        <ShieldCheck className="absolute top-0 opacity-10 h-10 w-10 text-amber-600" />
                        <span className="italic text-slate-600 text-lg leading-none">Elizabeth Taylor</span>
                        <span className="text-[8px] text-amber-600 font-bold mt-2 uppercase tracking-wider italic">Verified Approval</span>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-slate-900">Elizabeth Taylor</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Quality Manager</p>
                        <p className="text-[9px] text-slate-400 italic mt-0.5">2026-04-13 11:24 (AUTH)</p>
                      </div>
                    </div>
                  </div>

                  {/* Verification Footer with QR Code */}
                  <div className="mt-8 pt-6 border-t border-slate-100 flex items-end justify-between px-2">
                    <div className="flex items-center gap-6">
                      <div className="p-1.5 border border-slate-100 rounded-lg bg-white shadow-sm shrink-0">
                        <QRCodeSVG value={qrValue} size={60} level="L" marginSize={0} />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest leading-none">Digital Authentication</p>
                        <p className="text-[8px] text-slate-400 font-medium max-w-[150px] leading-tight mt-1">Validity can be verified by scanning the QR code above.</p>
                        <p className="text-[9px] text-emerald-600 font-black mt-1 uppercase">CERTIFICATE ID: CERT-{course.id.split('-').pop()?.toUpperCase()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Info Bar - Redesigned (Fixed at bottom) */}
            <div className="flex-shrink-0 bg-white border-t border-slate-200 px-4 sm:px-6 py-2.5 flex items-center justify-between z-20">
              <div className="flex items-center gap-3 sm:gap-6">
                <div className="flex items-center gap-1.5 leading-none">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="text-[11px] font-semibold text-slate-700 whitespace-nowrap">System Status: Verified</span>
                </div>

                <div className="h-3.5 w-px bg-slate-200 hidden sm:block" />

                <div className="flex items-center gap-6 hidden sm:flex">
                  <div className="flex items-center gap-1.5 text-slate-500 leading-none">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider">21 CFR Part 11</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 leading-none">
                    <span className="text-[11px] font-semibold tracking-tight">Auto-generated · {new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <p className="text-[11px] font-semibold text-slate-500 hidden lg:block leading-none">Quality Assurance Department</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
