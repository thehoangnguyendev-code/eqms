import React, { useState, useRef, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTES } from "@/app/routes.constants";
import {
  FileText,
  Video,
  FileImage,
  X,
  Check,
  CloudUpload,
  AlertCircle,
  Link2,
  ArrowLeft,
  Lock,
} from "lucide-react";
import { IconRefresh } from "@tabler/icons-react";
import { PageHeader } from "@/components/ui/page/PageHeader";
import { materialEdit } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { Button } from "@/components/ui/button/Button";
import { ButtonLoading, FullPageLoading } from "@/components/ui/loading/Loading";
import { Select } from "@/components/ui/select/Select";
import { AlertModal, AlertModalType } from "@/components/ui/modal/AlertModal";
import { ESignatureModal } from "@/components/ui/esign-modal";
import { cn } from "@/components/ui/utils";
import { getFileIconSrc } from "@/utils/fileIcons";
import { BUSINESS_UNIT_DEPARTMENTS } from "@/features/settings/user-management/constants";

import { type MaterialStatus, WORKFLOW_STEPS } from "@/features/training/materials/types";

// ─── Types ─────────────────────────────────────────────────────────
interface UploadedFile {
  id: string;
  file: File | null;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: "uploading" | "success" | "error" | "existing";
}

type UploadMode = "file" | "link";

interface MaterialFormData {
  materialName: string;
  materialCode: string;
  version: string;
  author: string;
  businessUnit: string;
  department: string;
  reviewer: string;
  approver: string;
  description: string;
  externalUrl: string;
}

const ACCEPTED_EXTENSIONS = [".pdf", ".mp4", ".jpg", ".jpeg", ".png"];
const MAX_FILE_SIZE_MB = 500;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const BUSINESS_UNIT_OPTIONS = [
  { label: "Select Business Unit", value: "" },
  ...Object.keys(BUSINESS_UNIT_DEPARTMENTS).map((bu) => ({
    label: bu,
    value: bu,
  })),
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

// ─── Mock Existing Data (replace with API call in production) ──────
const MOCK_MATERIAL_DATA: Record<
  string,
  {
    status: MaterialStatus;
    form: MaterialFormData;
    existingFile: { name: string; size: number };
    uploadMode: UploadMode;
  }
> = {
  "5": {
    status: "Draft",
    uploadMode: "file",
    existingFile: { name: "ISO9001_Training_2026.mp4", size: 220200960 },
    form: {
      materialName: "ISO 9001 Training Video",
      materialCode: "TM-VID-005",
      version: "4.2",
      author: "Robert Brown",
      businessUnit: "Quality",
      department: "Quality Assurance",
      reviewer: "john.doe",
      approver: "emily.davis",
      description:
        "Understanding ISO 9001:2015 requirements and implementation",
      externalUrl: "",
    },
  },
  "12": {
    status: "Draft",
    uploadMode: "file",
    existingFile: { name: "Water_System_Qualification.pdf", size: 12582912 },
    form: {
      materialName: "Water System Qualification",
      materialCode: "TM-PDF-012",
      version: "2.0",
      author: "Jennifer Lee",
      businessUnit: "Engineering",
      department: "Engineering",
      reviewer: "mike.johnson",
      approver: "david.miller",
      description: "Procedures for water system IQ, OQ, and PQ",
      externalUrl: "",
    },
  },
};

// ─── Helpers ───────────────────────────────────────────────────────
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const getFileTypeFromName = (
  name: string,
): "PDF" | "Video" | "Image" | "Document" => {
  const ext = name.toLowerCase().split(".").pop();
  switch (ext) {
    case "pdf":
      return "PDF";
    case "mp4":
      return "Video";
    case "jpg":
    case "jpeg":
    case "png":
      return "Image";
    default:
      return "Document";
  }
};

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// ─── FormSection ───────────────────────────────────────────────────
const FormSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
      <span className="text-emerald-600">{icon}</span>
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

// ─── Component ─────────────────────────────────────────────────────
export const EditMaterialView: React.FC = () => {
  const navigate = useNavigate();
  const { materialId } = useParams<{ materialId: string }>();
  const [isNavigatingOut, setIsNavigatingOut] = useState(false);

  // Load existing data (replace with API call)
  const existingData = MOCK_MATERIAL_DATA[materialId ?? ""] ?? null;

  // Guard: non-Draft or not found
  if (!existingData || existingData.status !== "Draft") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <Lock className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">
          Cannot Edit Material
        </h2>
        <p className="text-sm text-slate-500 text-center max-w-sm">
          Only materials with{" "}
          <span className="font-semibold text-slate-700">Draft</span> status can
          be edited. This material is currently{" "}
          <span className="font-semibold text-slate-700">
            {existingData ? existingData.status : "not found"}
          </span>
          .
        </p>
        <Button
          variant="outline-emerald"
          size="sm"
          onClick={() => { setIsNavigatingOut(true); setTimeout(() => navigate(-1), 600); }}
          className="whitespace-nowrap gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        {isNavigatingOut && <FullPageLoading text="Loading..." />}
      </div>
    );
  }

  return (
    <EditMaterialForm materialId={materialId!} existingData={existingData} />
  );
};

// ─── Inner Form Component ───────────────────────────────────────────
interface EditMaterialFormProps {
  materialId: string;
  existingData: (typeof MOCK_MATERIAL_DATA)[string];
}

const EditMaterialForm: React.FC<EditMaterialFormProps> = ({
  materialId,
  existingData,
}) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentStepIndex = 0; // Always Draft when editing

  // Form state (pre-populated)
  const [formData, setFormData] = useState<MaterialFormData>(existingData.form);
  const [uploadMode, setUploadMode] = useState<UploadMode>(
    existingData.uploadMode,
  );
  const [isDragActive, setIsDragActive] = useState(false);
  const [isReplacingFile, setIsReplacingFile] = useState(false);

  // File replace state — null means "keep existing"
  const [newFile, setNewFile] = useState<UploadedFile | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<AlertModalType>("info");
  const [modalTitle, setModalTitle] = useState("");
  const [modalDescription, setModalDescription] = useState("");
  const [modalAction, setModalAction] = useState<(() => void) | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // E-Sign modal state
  const [showesignModal, setShowesignModal] = useState(false);

  const departmentOptions = useMemo(() => {
    if (!formData.businessUnit)
      return [{ label: "Select Department", value: "" }];
    const departments = BUSINESS_UNIT_DEPARTMENTS[formData.businessUnit] || [];
    return [
      { label: "Select Department", value: "" },
      ...departments.map((d) => ({ label: d, value: d })),
    ];
  }, [formData.businessUnit]);

  const updateField = <K extends keyof MaterialFormData>(
    key: K,
    value: MaterialFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // ─── File handlers ────────────────────────────────────────────
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
    const uploadFile: UploadedFile = {
      id: Date.now().toString(),
      file,
      name: file.name,
      size: file.size,
      type: file.name,
      progress: 0,
      status: "uploading",
    };
    setNewFile(uploadFile);

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 25 + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setNewFile((prev) =>
          prev ? { ...prev, progress: 100, status: "success" } : null,
        );
      } else {
        setNewFile((prev) =>
          prev ? { ...prev, progress: Math.round(progress) } : null,
        );
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
    setIsReplacingFile(false);
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

  const removeNewFile = () => {
    setNewFile(null);
    setIsReplacingFile(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ─── Save / Submit ────────────────────────────────────────────
  const validateForm = (): string | null => {
    if (uploadMode === "link") {
      if (!formData.externalUrl.trim()) return "Please enter a URL.";
      if (!isValidUrl(formData.externalUrl.trim()))
        return "Please enter a valid URL.";
    }
    if (!formData.materialName.trim()) return "Please enter material name.";
    if (!formData.materialCode.trim()) return "Material code is required.";
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
      setModalTitle("Changes Saved");
      setModalDescription(
        "Material has been updated and saved as draft successfully.",
      );
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
    setShowesignModal(true);
  };

  const handleESignConfirm = (_reason: string) => {
    setShowesignModal(false);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setModalType("success");
      setModalTitle("Submitted for Review");
      setModalDescription(
        "Training material has been updated and submitted for review. The reviewer will be notified.",
      );
      setModalAction(() => () => navigate(-1));
      setIsModalOpen(true);
    }, 1000);
  };

  const handleCancel = () => {
    setModalType("confirm");
    setModalTitle("Discard Changes?");
    setModalDescription(
      "Are you sure you want to cancel? All unsaved changes will be lost.",
    );
    setModalAction(() => () => navigate(-1));
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 w-full flex-1 flex flex-col">
      {/* ─── Header ─────────────────────────────────────────────── */}
      <PageHeader
        title="Edit Training Material"
        breadcrumbItems={materialEdit(navigate)}
        actions={
          <>
            <Button
              variant="outline-emerald"
              onClick={handleCancel}
              size="sm"
              className="whitespace-nowrap"
            >
              Cancel
            </Button>
            <Button
              variant="outline-emerald"
              onClick={handleSaveDraft}
              size="sm"
              className="whitespace-nowrap"
              disabled={isLoading}
            >
              {isLoading ? <ButtonLoading text="Saving..." /> : "Save Draft"}
            </Button>
            <Button
              onClick={handleSubmitForReview}
              variant="outline-emerald"
              size="sm"
              className="whitespace-nowrap"
              disabled={isLoading}
            >
              Submit for Review
            </Button>
          </>
        }
      />

      {/* ─── Draft-only notice ──────────────────────────────────── */}
      <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
        <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">
            Editing Draft Material
          </p>
          <p className="text-xs text-amber-700 mt-0.5">
            You are editing{" "}
            <span className="font-semibold">
              {formData.materialCode} — {formData.materialName}
            </span>
            . Edits are only permitted while the material is in{" "}
            <span className="font-semibold">Draft</span> status. Save your
            changes or submit for review when ready.
          </p>
        </div>
      </div>

      {/* ─── Workflow Stepper ───────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
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
                        "text-xs md:text-sm font-medium text-center whitespace-nowrap",
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
        {/* Left: File Section */}
        <div className="xl:col-span-5">
          <FormSection
            title="File / Resource"
            icon={<CloudUpload className="h-4 w-4" />}
          >
            <p className="text-xs text-slate-500 -mt-2 mb-4">
              Keep the existing file or replace it with a new one.
            </p>
              {/* Upload Mode Tabs */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg mb-4">
                <button
                  onClick={() => {
                    setUploadMode("file");
                    setNewFile(null);
                    setIsReplacingFile(false);
                  }}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                    uploadMode === "file"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700",
                  )}
                >
                  <CloudUpload className="h-3.5 w-3.5" />
                  Upload File
                </button>
                <button
                  onClick={() => {
                    setUploadMode("link");
                    setNewFile(null);
                    setIsReplacingFile(false);
                  }}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                    uploadMode === "link"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700",
                  )}
                >
                  <Link2 className="h-3.5 w-3.5" />
                  Paste Link
                </button>
              </div>

              {/* ── File Mode ───────────────────────────────── */}
              {uploadMode === "file" && (
                <>
                  {/* Existing file (until user triggers replace) */}
                  {!isReplacingFile && !newFile && (
                    <div className="border border-emerald-200 rounded-xl p-4 bg-emerald-50/40">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white border border-emerald-200 flex items-center justify-center flex-shrink-0">
                          <img
                            src={getFileIconSrc(existingData.existingFile.name)}
                            alt="file icon"
                            className="h-6 w-6 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {existingData.existingFile.name}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {formatFileSize(existingData.existingFile.size)} ·{" "}
                            {getFileTypeFromName(
                              existingData.existingFile.name,
                            )}
                          </p>
                          <div className="flex items-center gap-1.5 mt-2">
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                            <span className="text-xs font-medium text-emerald-600">
                              Current file
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setIsReplacingFile(true);
                          setTimeout(() => fileInputRef.current?.click(), 50);
                        }}
                        className="mt-3 inline-flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 font-medium transition-colors"
                      >
                        <IconRefresh className="h-3.5 w-3.5" />
                        Replace with a different file
                      </button>
                    </div>
                  )}

                  {/* Replace-file drop zone */}
                  {isReplacingFile && !newFile && (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 min-h-[220px]",
                        isDragActive
                          ? "border-emerald-500 bg-emerald-50/50"
                          : "border-slate-300 bg-slate-50/50 hover:border-emerald-400 hover:bg-emerald-50/30",
                      )}
                    >
                      <div
                        className={cn(
                          "w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors",
                          isDragActive ? "bg-emerald-100" : "bg-slate-100",
                        )}
                      >
                        <CloudUpload
                          className={cn(
                            "h-7 w-7",
                            isDragActive
                              ? "text-emerald-600"
                              : "text-slate-400",
                          )}
                        />
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-slate-700 text-center">
                        {isDragActive
                          ? "Drop replacement file here"
                          : "Drag & drop a replacement file"}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        or click to browse
                      </p>
                      <div className="flex items-center gap-2 mt-4">
                        {[
                          {
                            icon: FileText,
                            label: "PDF",
                            color: "text-red-500",
                          },
                          {
                            icon: Video,
                            label: "MP4",
                            color: "text-purple-500",
                          },
                          {
                            icon: FileImage,
                            label: "JPG/PNG",
                            color: "text-blue-500",
                          },
                        ].map(({ icon: Icon, label, color }) => (
                          <span
                            key={label}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-white border border-slate-200 text-slate-600"
                          >
                            <Icon className={cn("h-3 w-3", color)} />
                            {label}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsReplacingFile(false);
                        }}
                        className="mt-4 text-xs text-slate-500 hover:text-slate-700 underline transition-colors"
                      >
                        Keep current file
                      </button>
                    </div>
                  )}

                  {/* New file preview */}
                  {newFile && (
                    <div className="space-y-3">
                      <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                            <img
                              src={getFileIconSrc(newFile.name)}
                              alt="file icon"
                              className="h-6 w-6 object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {newFile.name}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {formatFileSize(newFile.size)} ·{" "}
                              {getFileTypeFromName(newFile.name)}
                            </p>
                            {newFile.status === "uploading" && (
                              <div className="mt-2">
                                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                                    style={{ width: `${newFile.progress}%` }}
                                  />
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                  {newFile.progress}% uploaded
                                </p>
                              </div>
                            )}
                            {newFile.status === "success" && (
                              <div className="flex items-center gap-1.5 mt-2">
                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                                <span className="text-xs font-medium text-emerald-600">
                                  Ready to replace
                                </span>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={removeNewFile}
                            className="flex-shrink-0 p-1 rounded-lg hover:bg-slate-200 transition-colors"
                            title="Cancel replacement"
                          >
                            <X className="h-4 w-4 text-slate-500" />
                          </button>
                        </div>
                      </div>
                      {/* Revert */}
                      <p className="text-xs text-slate-500">
                        Replacing:{" "}
                        <span className="font-medium text-slate-700">
                          {existingData.existingFile.name}
                        </span>{" "}
                        →{" "}
                        <span className="font-medium text-emerald-700">
                          {newFile.name}
                        </span>
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* ── Link Mode ────────────────────────────── */}
              {uploadMode === "link" && (
                <div className="space-y-3">
                  <div className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center border-slate-300 bg-slate-50/50">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 bg-slate-100">
                      <Link2 className="h-7 w-7 text-slate-400" />
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-slate-700 text-center mb-3">
                      Paste external resource URL
                    </p>
                    <div className="w-full flex items-center gap-2">
                      <input
                        type="url"
                        value={formData.externalUrl}
                        onChange={(e) =>
                          updateField("externalUrl", e.target.value)
                        }
                        placeholder="https://example.com/training-document.pdf"
                        className="flex-1 h-9 px-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm placeholder:text-slate-400"
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      Supports any URL: YouTube, Google Drive, SharePoint, web
                      pages, etc.
                    </p>
                  </div>
                  {formData.externalUrl && isValidUrl(formData.externalUrl) && (
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                          <Link2 className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {formData.externalUrl}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            External Link
                          </p>
                          <div className="flex items-center gap-1.5 mt-2">
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                            <span className="text-xs font-medium text-emerald-600">
                              Valid URL
                            </span>
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

        {/* Right: Material Information */}
        <div className="xl:col-span-7">
          <FormSection
            title="Material Information"
            icon={<FileText className="h-4 w-4" />}
          >
            <p className="text-xs text-slate-500 -mt-2 mb-5">
              Update the details for this training material
            </p>
            <div className="space-y-5">
              {/* Material Name */}
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

              {/* Material Code + Version */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
                    Material Code
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.materialCode}
                      readOnly
                      className="w-full h-9 px-4 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-900 cursor-default focus:outline-none pr-8"
                    />
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  </div>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    Material code cannot be changed after creation.
                  </p>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
                    Version
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.version}
                      readOnly
                      className="w-full h-9 px-4 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-900 cursor-default focus:outline-none pr-8"
                    />
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  </div>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    Version is managed by the approval workflow.
                  </p>
                </div>
              </div>

              {/* Author */}
              <div>
                <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
                  Author
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.author}
                    readOnly
                    className="w-full h-9 px-4 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-900 cursor-default focus:outline-none pr-8"
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              {/* Business Unit + Department */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Business Unit"
                  value={formData.businessUnit}
                  onChange={(val) => {
                    updateField("businessUnit", val as string);
                    updateField("department", "");
                  }}
                  options={BUSINESS_UNIT_OPTIONS}
                  placeholder="Select business unit..."
                />
                <Select
                  label="Department"
                  value={formData.department}
                  onChange={(val) => updateField("department", val as string)}
                  options={departmentOptions}
                  placeholder={
                    formData.businessUnit
                      ? "Select department..."
                      : "Select Business Unit first"
                  }
                  disabled={!formData.businessUnit}
                />
              </div>

              {/* Reviewer + Approver */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
                    Reviewer <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.reviewer}
                    onChange={(val) => updateField("reviewer", val as string)}
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
                    onChange={(val) => updateField("approver", val as string)}
                    options={APPROVER_OPTIONS}
                    placeholder="Select approver..."
                  />
                </div>
              </div>

              {/* Description */}
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
        onConfirm={
          modalAction
            ? () => {
              setIsModalOpen(false);
              setIsNavigating(true);
              setTimeout(() => modalAction(), 600);
            }
            : undefined
        }
        type={modalType}
        title={modalTitle}
        description={modalDescription}
        isLoading={isLoading}
        confirmText={
          modalType === "success"
            ? "OK"
            : modalType === "confirm"
              ? "Discard"
              : undefined
        }
      />

      {/* ─── E-Signature Modal ──────────────────────────────────── */}
      <ESignatureModal
        isOpen={showesignModal}
        onClose={() => setShowesignModal(false)}
        onConfirm={handleESignConfirm}
        actionTitle="Submit Material for Review"
      />

      {(isLoading || isNavigating) && <FullPageLoading text="Processing..." />}
    </div>
  );
};



