import React, { useState, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/app/routes.constants";
import {
  Upload,
  FileText,
  Video,
  FileImage,
  X,
  Check,
  CloudUpload,
  AlertCircle,
  File,
  Eye,
  ArrowLeft,
  Send,
  Link2,
  ExternalLink,
  Info,
} from "lucide-react";
import { cn } from "@/components/ui/utils";
import { FormSection } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page/PageHeader";
import { uploadMaterial } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { Button } from "@/components/ui/button/Button";
import { ButtonLoading, FullPageLoading } from "@/components/ui/loading/Loading";
import { Select } from "@/components/ui/select/Select";
import { AlertModal, AlertModalType } from "@/components/ui/modal/AlertModal";
import { ESignatureModal } from "@/components/ui/esign-modal";
import { getFileIconSrc } from "@/utils/fileIcons";
import { BUSINESS_UNIT_DEPARTMENTS } from "@/features/settings/user-management/constants";
import {
  type MaterialStatus,
  type MaterialWorkflowFormData,
  type MaterialUploadMode,
  type MaterialUploadedFile,
  WORKFLOW_STEPS,
} from "@/features/training/materials/types";
import { TabNav, type TabItem } from "@/components/ui/tabs/TabNav";

const ACCEPTED_FORMATS: Record<string, string[]> = {
  "application/pdf": [".pdf"],
  "video/mp4": [".mp4"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
};

const ACCEPTED_EXTENSIONS = [".pdf", ".mp4", ".jpg", ".jpeg", ".png"];
const MAX_FILE_SIZE_MB = 500;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const BUSINESS_UNIT_OPTIONS = [
  { label: "Select Business Unit", value: "" },
  ...Object.keys(BUSINESS_UNIT_DEPARTMENTS).map((bu) => ({ label: bu, value: bu })),
];

const REVIEWER_OPTIONS = [
  { label: "Select Reviewer", value: "" },
  { label: "John Doe", value: "john.doe" },
  { label: "Jane Smith", value: "jane.smith" },
  { label: "Mike Johnson", value: "mike.johnson" },
  { label: "Sarah Williams", value: "sarah.williams" },
  { label: "Robert Brown", value: "robert.brown" },
];

const APPROVER_OPTIONS = [
  { label: "Select Approver", value: "" },
  { label: "Dr. A. Smith", value: "dr.smith" },
  { label: "Emily Davis", value: "emily.davis" },
  { label: "David Miller", value: "david.miller" },
  { label: "Patricia Wilson", value: "patricia.wilson" },
];

// ─── Helpers ───────────────────────────────────────────────────────
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const getFileTypeFromName = (name: string): "PDF" | "Video" | "Image" | "Document" => {
  const ext = name.toLowerCase().split(".").pop();
  switch (ext) {
    case "pdf": return "PDF";
    case "mp4": return "Video";
    case "jpg": case "jpeg": case "png": return "Image";
    default: return "Document";
  }
};

const generateMaterialId = (fileType: "PDF" | "Video" | "Image" | "Document"): string => {
  const prefix: Record<string, string> = {
    PDF: "TM-PDF",
    Video: "TM-VID",
    Image: "TM-IMG",
    Document: "TM-DOC",
  };
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `${prefix[fileType]}-${randomNum}`;
};




// ─── Component ─────────────────────────────────────────────────────
export const UploadMaterialView: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Workflow state
  const [currentStatus] = useState<MaterialStatus>("Draft");
  const currentStepIndex = WORKFLOW_STEPS.indexOf(currentStatus);

  // Form state
  const [formData, setFormData] = useState<MaterialWorkflowFormData>({
    materialName: "",
    materialId: "",
    version: "1.0",
    author: "Dr. A. Smith", // Current logged-in user
    businessUnit: "",
    department: "",
    reviewer: "",
    approver: "",
    description: "",
    externalUrl: "",
  });

  // Department options based on selected Business Unit
  const departmentOptions = useMemo(() => {
    if (!formData.businessUnit) return [{ label: "Select Department", value: "" }];
    const departments = BUSINESS_UNIT_DEPARTMENTS[formData.businessUnit] || [];
    return [
      { label: "Select Department", value: "" },
      ...departments.map((dept) => ({ label: dept, value: dept })),
    ];
  }, [formData.businessUnit]);

  const uploadModeTabs = useMemo<TabItem[]>(() => [
    { id: "file", label: "Upload File", icon: CloudUpload },
    { id: "link", label: "Paste Link", icon: Link2 },
  ], []);

  // Upload mode state
  const [uploadMode, setUploadMode] = useState<MaterialUploadMode>("file");

  // File state
  const [uploadedFile, setUploadedFile] = useState<MaterialUploadedFile | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<AlertModalType>("info");
  const [modalTitle, setModalTitle] = useState("");
  const [modalDescription, setModalDescription] = useState("");
  const [modalAction, setModalAction] = useState<(() => void) | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // E-Sign modal state
  const [showesignModal, setshowesignModal] = useState(false);
  const [eSignAction, setESignAction] = useState<"submit" | null>(null);

  // ─── Form handlers ────────────────────────────────────────────
  const updateField = <K extends keyof MaterialWorkflowFormData>(key: K, value: MaterialWorkflowFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // ─── File upload handlers ─────────────────────────────────────
  const validateFile = (file: File): string | null => {
    const ext = `.${file.name.toLowerCase().split(".").pop()}`;
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      return `Invalid file format. Accepted: ${ACCEPTED_EXTENSIONS.join(", ")}`;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `File size exceeds ${MAX_FILE_SIZE_MB}MB limit.`;
    }
    return null;
  };

  const simulateUpload = (file: File) => {
    const uploadFile: MaterialUploadedFile = {
      id: Date.now().toString(),
      file,
      name: file.name,
      size: file.size,
      type: file.name,
      progress: 0,
      status: "uploading",
    };
    setUploadedFile(uploadFile);

    // Auto-generate material ID based on file type
    const fileType = getFileTypeFromName(file.name);
    const autoCode = generateMaterialId(fileType);
    setFormData((prev) => ({
      ...prev,
      materialId: prev.materialId || autoCode,
      materialName: prev.materialName || file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
    }));

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 25 + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setUploadedFile((prev) => prev ? { ...prev, progress: 100, status: "success" } : null);
      } else {
        setUploadedFile((prev) => prev ? { ...prev, progress: Math.round(progress) } : null);
      }
    }, 300);
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const error = validateFile(file);
    if (error) {
      setModalType("error");
      setModalTitle("File Upload Error");
      setModalDescription(error);
      setModalAction(null);
      setIsModalOpen(true);
      return;
    }
    simulateUpload(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  }, []);

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ─── Link handlers ────────────────────────────────────────────
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleAddLink = () => {
    const url = formData.externalUrl.trim();
    if (!url) return;
    if (!isValidUrl(url)) {
      setModalType("error");
      setModalTitle("Invalid URL");
      setModalDescription("Please enter a valid URL (e.g., https://example.com/document.pdf)");
      setModalAction(null);
      setIsModalOpen(true);
      return;
    }
    // Auto-fill material name from URL if empty
    if (!formData.materialName) {
      try {
        const urlObj = new URL(url);
        const pathName = urlObj.pathname.split("/").pop() || "";
        const name = decodeURIComponent(pathName).replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        if (name) updateField("materialName", name);
      } catch { /* ignore */ }
    }
    // Auto-generate material ID if empty
    if (!formData.materialId) {
      updateField("materialId", generateMaterialId("Document"));
    }
  };

  // ─── Save / Submit ────────────────────────────────────────────
  const validateForm = (): string | null => {
    if (uploadMode === "file") {
      if (!uploadedFile || uploadedFile.status !== "success") return "Please upload a file first.";
    } else {
      if (!formData.externalUrl.trim()) return "Please enter a URL.";
      if (!isValidUrl(formData.externalUrl.trim())) return "Please enter a valid URL.";
    }
    if (!formData.materialName.trim()) return "Please enter material name.";
    if (!formData.materialId.trim()) return "Material ID is required.";
    if (!formData.businessUnit) return "Please select a business unit.";
    if (!formData.department) return "Please select a department.";
    if (!formData.reviewer) return "Please select a reviewer.";
    if (!formData.approver) return "Please select an approver.";
    if (!formData.description.trim()) return "Please enter a description.";
    return null;
  };

  const handleSaveDraft = () => {
    const error = validateForm();
    if (error) {
      setModalType("error");
      setModalTitle("Validation Error");
      setModalDescription(error);
      setModalAction(null);
      setIsModalOpen(true);
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setModalType("success");
      setModalTitle("Material Saved");
      setModalDescription("Training material has been saved as draft successfully.");
      setModalAction(() => () => navigate(-1));
      setIsModalOpen(true);
    }, 1000);
  };

  const handleSubmitForReview = () => {
    const error = validateForm();
    if (error) {
      setModalType("error");
      setModalTitle("Validation Error");
      setModalDescription(error);
      setModalAction(null);
      setIsModalOpen(true);
      return;
    }
    setESignAction("submit");
    setshowesignModal(true);
  };

  const handleESignConfirm = (reason: string) => {
    setshowesignModal(false);
    setESignAction(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setModalType("success");
      setModalTitle("Submitted for Review");
      setModalDescription("Training material has been submitted for review. The reviewer will be notified.");
      setModalAction(() => () => navigate(-1));
      setIsModalOpen(true);
    }, 1000);
  };

  const handleCancel = () => {
    setModalType("confirm");
    setModalTitle("Discard Changes?");
    setModalDescription("Are you sure you want to cancel? All unsaved changes will be lost.");
    setModalAction(() => () => navigate(-1));
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 w-full flex-1 flex flex-col">
      {/* ─── Header ─────────────────────────────────────────────── */}
      <PageHeader
        title="Upload Training Material"
        breadcrumbItems={uploadMaterial(navigate)}
        actions={
          <>
            <Button variant="outline-emerald" onClick={handleCancel} size="sm" className="whitespace-nowrap">
              Cancel
            </Button>
            <Button variant="outline-emerald" onClick={handleSaveDraft} size="sm" className="whitespace-nowrap" disabled={isLoading}>
              {isLoading ? <ButtonLoading text="Saving..." /> : "Save Draft"}
            </Button>
            <Button onClick={handleSubmitForReview} variant="outline-emerald" size="sm" className="whitespace-nowrap" disabled={isLoading}>
              Submit
            </Button>
          </>
        }
      />

      {/* ─── Workflow Stepper ───────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Mobile View (Compact circles) */}
        <div className="flex sm:hidden items-center justify-start gap-0 px-2 py-4 bg-slate-50/50 border-b border-slate-100 overflow-x-auto">
          <div className="flex items-center justify-start min-w-max mx-auto">
            {WORKFLOW_STEPS.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isLast = index === WORKFLOW_STEPS.length - 1;

              return (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center gap-1.5 select-none w-[80px] flex-shrink-0">
                    <div
                      className={cn(
                        "relative w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold transition-all shadow-sm",
                        isCurrent
                          ? step === "Obsoleted"
                            ? "bg-red-500 text-white"
                            : "bg-emerald-600 text-white ring-4 ring-emerald-100"
                          : isCompleted
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-100 text-slate-400 border border-slate-200",
                      )}
                    >
                      {isCompleted ? <Check className="h-3.5 w-3.5" /> : index + 1}
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-semibold text-center leading-tight transition-colors whitespace-normal break-words max-w-[72px] min-h-[24px]",
                        isCurrent
                          ? "text-emerald-700"
                          : isCompleted
                            ? "text-emerald-700"
                            : "text-slate-400",
                      )}
                    >
                      {step}
                    </span>
                  </div>
                  {!isLast && (
                    <div
                      className={cn(
                        "w-6 h-0.5 flex-shrink-0 transition-all self-start mt-3.5 rounded-full",
                        isCompleted ? "bg-emerald-500" : "bg-slate-200",
                      )}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Desktop View (Arrow shapes) */}
        <div className="hidden sm:block overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
          <div className="flex items-stretch min-w-full">
            {WORKFLOW_STEPS.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isFirst = index === 0;
              const isLast = index === WORKFLOW_STEPS.length - 1;
              return (
                <div
                  key={step}
                  className="relative flex-1 flex items-center justify-center min-w-[140px]"
                  style={{ minHeight: "56px" }}
                >
                  <div
                    className={cn(
                      "absolute inset-0 transition-all",
                      isCurrent
                        ? step === "Obsoleted" ? "bg-red-500" : "bg-emerald-600"
                        : isCompleted
                          ? "bg-emerald-100"
                          : "bg-slate-100"
                    )}
                    style={{
                      clipPath: isFirst
                        ? "polygon(0% 0%, calc(100% - 20px) 0%, 100% 50%, calc(100% - 20px) 100%, 0% 100%)"
                        : isLast
                          ? "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 20px 50%)"
                          : "polygon(0% 0%, calc(100% - 20px) 0%, 100% 50%, calc(100% - 20px) 100%, 0% 100%, 20px 50%)",
                    }}
                  />
                  <div className="relative z-10 flex items-center gap-2 px-6">
                    {isCompleted && <Check className="h-4 w-4 text-emerald-600 shrink-0" />}
                    <span
                      className={cn(
                        "text-xs md:text-sm font-medium text-center whitespace-normal break-words",
                        isCurrent ? "text-white" : isCompleted ? "text-slate-700" : "text-slate-400"
                      )}
                    >
                      {step}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Main Form Content ──────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 lg:gap-6">
        {/* Left: File Upload */}
        <div className="xl:col-span-5">
          <FormSection
            title="File Upload"
            icon={<Upload className="h-4 w-4" />}
          >
            <p className="text-xs text-slate-500 -mt-2 mb-4">
              {uploadMode === "file"
                ? `Supported formats: PDF, MP4, JPG, PNG · Max: ${MAX_FILE_SIZE_MB}MB`
                : "Paste a URL to an external training resource"}
            </p>
            {/* Upload Mode Tabs */}
            <TabNav
              tabs={uploadModeTabs}
              activeTab={uploadMode}
              onChange={(tabId) => setUploadMode(tabId as MaterialUploadMode)}
              variant="pill"
              className="mb-4"
              layoutId="uploadModeTabIndicator"
            />

            {/* ── File Upload Mode ─────────────────────────── */}
            {uploadMode === "file" && !uploadedFile && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 min-h-[220px]",
                  isDragActive
                    ? "border-emerald-500 bg-emerald-50/50"
                    : "border-slate-300 bg-slate-50/50 hover:border-emerald-400 hover:bg-emerald-50/30"
                )}
              >
                <div className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors",
                  isDragActive ? "bg-emerald-100" : "bg-slate-100"
                )}>
                  <CloudUpload className={cn("h-7 w-7", isDragActive ? "text-emerald-600" : "text-slate-400")} />
                </div>
                <p className="text-xs sm:text-sm font-medium text-slate-700 text-center">
                  {isDragActive ? "Drop your file here" : "Drag & drop your file here"}
                </p>
                <p className="text-xs text-slate-500 mt-1">or click to browse</p>
                <div className="flex items-center gap-2 mt-4">
                  {[
                    { icon: FileText, label: "PDF", color: "text-red-500" },
                    { icon: Video, label: "MP4", color: "text-purple-500" },
                    { icon: FileImage, label: "JPG/PNG", color: "text-blue-500" },
                  ].map(({ icon: Icon, label, color }) => (
                    <span key={label} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white border border-slate-200 text-slate-600">
                      <Icon className={cn("h-3 w-3", color)} />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Uploaded File Preview */}
            {uploadMode === "file" && uploadedFile && (
              <div className="border border-slate-200 rounded-xl p-4 md:p-5 bg-slate-50/50">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                    <img src={getFileIconSrc(uploadedFile.name)} alt="file icon" className="h-6 w-6 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{uploadedFile.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatFileSize(uploadedFile.size)} · {getFileTypeFromName(uploadedFile.name)}
                    </p>
                    {uploadedFile.status === "uploading" && (
                      <div className="mt-2">
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                            style={{ width: `${uploadedFile.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{uploadedFile.progress}% uploaded</p>
                      </div>
                    )}
                    {uploadedFile.status === "success" && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-xs font-medium text-emerald-600">Upload complete</span>
                      </div>
                    )}
                    {uploadedFile.status === "error" && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <AlertCircle className="h-3.5 w-3.5 text-red-600" />
                        <span className="text-xs font-medium text-red-600">Upload failed</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={removeFile}
                    className="flex-shrink-0 p-1 rounded-lg hover:bg-slate-200 transition-colors"
                    title="Remove file"
                  >
                    <X className="h-4 w-4 text-slate-500" />
                  </button>
                </div>

                {/* Replace file */}
                {uploadedFile.status === "success" && (
                  <button
                    onClick={() => {
                      removeFile();
                      setTimeout(() => fileInputRef.current?.click(), 100);
                    }}
                    className="mt-3 text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                  >
                    Replace with another file
                  </button>
                )}
              </div>
            )}

            {/* ── Link Mode ────────────────────────────── */}
            {uploadMode === "link" && (
              <div className="space-y-3">
                <div className="border-2 border-dashed rounded-xl p-4 md:p-5 flex flex-col items-center justify-center border-slate-300 bg-slate-50/50">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 bg-slate-100">
                    <Link2 className="h-7 w-7 text-slate-400" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-slate-700 text-center mb-3">Paste external resource URL</p>
                  <div className="w-full flex items-center gap-2">
                    <input
                      type="url"
                      value={formData.externalUrl}
                      onChange={(e) => updateField("externalUrl", e.target.value)}
                      onBlur={handleAddLink}
                      placeholder="https://example.com/training-document.pdf"
                      className="flex-1 h-9 px-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm placeholder:text-slate-400"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Supports any URL: YouTube, Google Drive, SharePoint, web pages, etc.</p>
                </div>

                {/* Link Preview */}
                {formData.externalUrl && isValidUrl(formData.externalUrl) && (
                  <div className="border border-slate-200 rounded-xl p-4 md:p-5 bg-slate-50/50">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                        <Link2 className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{formData.externalUrl}</p>
                        <p className="text-xs text-slate-500 mt-0.5">External Link</p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="text-xs font-medium text-emerald-600">Valid URL</span>
                        </div>
                      </div>
                      <button
                        onClick={() => updateField("externalUrl", "")}
                        className="flex-shrink-0 p-1 rounded-lg hover:bg-slate-200 transition-colors"
                        title="Remove link"
                      >
                        <X className="h-4 w-4 text-slate-500" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_EXTENSIONS.join(",")}
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
          </FormSection>
        </div>

        {/* Right: Material Information Form */}
        <div className="xl:col-span-7">
          <FormSection
            title="Material Information"
            icon={<Info className="h-4 w-4" />}
          >
            <div className="space-y-5">
              {/* Row 1: Material Name */}
              <div>
                <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
                  Material Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.materialName}
                  onChange={(e) => updateField("materialName", e.target.value)}
                  placeholder="Enter material name..."
                  className="w-full h-9 px-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm placeholder:text-slate-400"
                />
              </div>

              {/* Row 2: Material ID + Version */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
                    Material ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.materialId}
                    onChange={(e) => updateField("materialId", e.target.value)}
                    placeholder="Auto-generated (e.g., TM-PDF-001)"
                    className="w-full h-9 px-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm placeholder:text-slate-400 bg-slate-50"
                  />
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 flex items-center gap-1">Auto-generated based on file type. You can modify it.</p>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
                    Version
                  </label>
                  <input
                    type="text"
                    value={formData.version}
                    readOnly
                    className="w-full h-9 px-4 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-900 cursor-default focus:outline-none"
                  />
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 flex items-center gap-1">Default 1.0 for initial upload.</p>
                </div>
              </div>

              {/* Row 3: Author */}
              <div>
                <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
                  Author
                </label>
                <input
                  type="text"
                  value={formData.author}
                  readOnly
                  className="w-full h-9 px-4 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-900 cursor-default focus:outline-none"
                />
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 flex items-center gap-1">Automatically set to the current logged-in user.</p>
              </div>

              {/* Row 4: Business Unit + Department */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Business Unit"
                  value={formData.businessUnit}
                  onChange={(val) => {
                    updateField("businessUnit", val);
                    updateField("department", "");
                  }}
                  options={BUSINESS_UNIT_OPTIONS}
                  placeholder="Select business unit..."
                />
                <Select
                  label="Department"
                  value={formData.department}
                  onChange={(val) => updateField("department", val)}
                  options={departmentOptions}
                  placeholder={formData.businessUnit ? "Select department..." : "Select Business Unit first"}
                  disabled={!formData.businessUnit}
                />
              </div>

              {/* Row 5: Reviewer + Approver */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
                    Reviewer <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.reviewer}
                    onChange={(val) => updateField("reviewer", val)}
                    options={REVIEWER_OPTIONS}
                    placeholder="Select reviewer..."
                  />
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
                    Approver <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.approver}
                    onChange={(val) => updateField("approver", val)}
                    options={APPROVER_OPTIONS}
                    placeholder="Select approver..."
                  />
                </div>
              </div>

              {/* Row 6: Description */}
              <div>
                <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Describe the content or purpose of this training material..."
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm placeholder:text-slate-400 resize-none"
                />
              </div>
            </div>
          </FormSection>
        </div>
      </div>

      {/* ─── Alert Modal ────────────────────────────────────────── */}
      <AlertModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={modalAction ? () => { setIsNavigating(true); setTimeout(() => { modalAction(); setIsModalOpen(false); }, 600); } : undefined}
        type={modalType}
        title={modalTitle}
        description={modalDescription}
        isLoading={isLoading}
        confirmText={modalType === "success" ? "OK" : modalType === "confirm" ? "Discard" : undefined}
      />

      {/* ─── E-Signature Modal ──────────────────────────────────── */}
      <ESignatureModal
        isOpen={showesignModal}
        onClose={() => { setshowesignModal(false); setESignAction(null); }}
        onConfirm={handleESignConfirm}
        actionTitle="Submit Material for Review"
      />

      {/* ─── Loading Overlay ──────────────────────────────────── */}
      {(isLoading || isNavigating) && <FullPageLoading text="Processing..." />}
    </div>
  );
};




