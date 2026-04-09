import React, { useState, useRef, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTES } from "@/app/routes.constants";
import {
  CloudUpload,
  FileText,
  Video,
  FileImage,
  X,
  Check,
  Link2,
  Lock,
  GitBranch,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { IconRefresh } from "@tabler/icons-react";
import { cn } from "@/components/ui/utils";
import { FormSection } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page/PageHeader";
import { materialNewRevision } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { Button } from "@/components/ui/button/Button";
import { ButtonLoading, FullPageLoading } from "@/components/ui/loading/Loading";
import { Select } from "@/components/ui/select/Select";
import { AlertModal, AlertModalType } from "@/components/ui/modal/AlertModal";
import { ESignatureModal } from "@/components/ui/esign-modal";
import { getFileIconSrc } from "@/utils/fileIcons";
import { BUSINESS_UNIT_DEPARTMENTS } from "@/features/settings/user-management/constants";

import { type MaterialStatus, WORKFLOW_STEPS } from "@/features/training/materials/types";

// ─── Types ─────────────────────────────────────────────────────────
type RevisionType = "minor" | "major";
type UploadMode = "file" | "link";

interface UploadedFile {
  id: string;
  file: File | null;
  name: string;
  size: number;
  progress: number;
  status: "uploading" | "success" | "error";
}

interface RevisionFormData {
  materialName: string;
  materialCode: string;
  version: string;
  author: string;
  businessUnit: string;
  department: string;
  reviewer: string;
  approver: string;
  description: string;
  revisionNotes: string;
  externalUrl: string;
}

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

// ─── Mock Source Data ───────────────────────────────────────────────
interface SourceMaterial {
  status: MaterialStatus;
  uploadMode: UploadMode;
  existingFile: { name: string; size: number };
  form: Omit<RevisionFormData, "revisionNotes" | "externalUrl">;
}

const MOCK_MATERIAL_SOURCE: Record<string, SourceMaterial> = {
  "1": {
    status: "Effective",
    uploadMode: "file",
    existingFile: { name: "GMP_Introduction_2026.mp4", size: 131072000 },
    form: {
      materialName: "GMP Introduction Video",
      materialCode: "TM-VID-001",
      version: "2.1",
      author: "John Doe",
      businessUnit: "Quality",
      department: "Quality Assurance",
      reviewer: "jane.smith",
      approver: "dr.smith",
      description: "Comprehensive overview of Good Manufacturing Practices",
    },
  },
  "2": {
    status: "Effective",
    uploadMode: "file",
    existingFile: { name: "Cleanroom_Operations_Manual_v3.pdf", size: 4718592 },
    form: {
      materialName: "Cleanroom Operations Manual",
      materialCode: "TM-PDF-002",
      version: "3.0",
      author: "Jane Smith",
      businessUnit: "Production",
      department: "Production",
      reviewer: "mike.johnson",
      approver: "emily.davis",
      description: "Step-by-step guide for cleanroom operations and procedures",
    },
  },
  "4": {
    status: "Effective",
    uploadMode: "file",
    existingFile: { name: "Safety_Protocol_Infographic.png", size: 2202009 },
    form: {
      materialName: "Safety Protocol Infographic",
      materialCode: "TM-IMG-004",
      version: "1.0",
      author: "Sarah Williams",
      businessUnit: "HSE",
      department: "HSE",
      reviewer: "john.doe",
      approver: "patricia.wilson",
      description: "Key safety protocols illustrated for quick reference",
    },
  },
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
      description: "Understanding ISO 9001:2015 requirements and implementation",
    },
  },
  "6": {
    status: "Effective",
    uploadMode: "file",
    existingFile: { name: "SOP_Template_Pack_v2.docx", size: 1048576 },
    form: {
      materialName: "SOP Template Pack",
      materialCode: "TM-DOC-006",
      version: "2.0",
      author: "Emily Davis",
      businessUnit: "Quality",
      department: "Quality Control",
      reviewer: "jane.smith",
      approver: "dr.smith",
      description: "Standard Operating Procedure templates for documentation",
    },
  },
  "9": {
    status: "Effective",
    uploadMode: "file",
    existingFile: { name: "Deviation_Investigation_Training.mp4", size: 188743680 },
    form: {
      materialName: "Deviation Investigation Training",
      materialCode: "TM-VID-009",
      version: "1.0",
      author: "Michael Chen",
      businessUnit: "Quality",
      department: "Quality Assurance",
      reviewer: "jane.smith",
      approver: "dr.smith",
      description: "How to investigate and document process deviations",
    },
  },
};

// ─── Version Helpers ────────────────────────────────────────────────
const parseVersion = (v: string): { major: number; minor: number } => {
  const parts = v.split(".");
  return {
    major: parseInt(parts[0] ?? "1", 10) || 1,
    minor: parseInt(parts[1] ?? "0", 10) || 0,
  };
};

const suggestVersion = (current: string, type: RevisionType): string => {
  const { major, minor } = parseVersion(current);
  if (type === "major") return `${major + 1}.0`;
  return `${major}.${minor + 1}`;
};

// ─── Misc Helpers ───────────────────────────────────────────────────
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const getFileTypeLabel = (name: string) => {
  const ext = name.toLowerCase().split(".").pop();
  switch (ext) {
    case "pdf": return "PDF";
    case "mp4": return "Video";
    case "jpg": case "jpeg": case "png": return "Image";
    default: return "Document";
  }
};

const isValidUrl = (url: string): boolean => {
  try { new URL(url); return true; } catch { return false; }
};

// ─── Component ─────────────────────────────────────────────────────
export const NewRevisionView: React.FC = () => {
  const { materialId } = useParams<{ materialId: string }>();
  const navigate = useNavigate();
  const [isNavigatingOut, setIsNavigatingOut] = useState(false);

  const source = MOCK_MATERIAL_SOURCE[materialId ?? ""] ?? null;

  if (!source) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">Material Not Found</h2>
        <p className="text-sm text-slate-500">The requested material could not be found.</p>
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

  return <NewRevisionForm materialId={materialId!} source={source} />;
};


// ─── Inner Form ─────────────────────────────────────────────────────
interface NewRevisionFormProps {
  materialId: string;
  source: SourceMaterial;
}

const NewRevisionForm: React.FC<NewRevisionFormProps> = ({ materialId, source }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [revisionType, setRevisionType] = useState<RevisionType>("minor");

  const [formData, setFormData] = useState<RevisionFormData>({
    ...source.form,
    version: suggestVersion(source.form.version, "minor"),
    revisionNotes: "",
    externalUrl: "",
  });

  const [uploadMode, setUploadMode] = useState<UploadMode>(source.uploadMode);
  const [isDragActive, setIsDragActive] = useState(false);
  const [keepExistingFile, setKeepExistingFile] = useState(true);
  const [newFile, setNewFile] = useState<UploadedFile | null>(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<AlertModalType>("info");
  const [modalTitle, setModalTitle] = useState("");
  const [modalDescription, setModalDescription] = useState("");
  const [modalAction, setModalAction] = useState<(() => void) | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // E-Sign
  const [showesignModal, setshowesignModal] = useState(false);

  const departmentOptions = useMemo(() => {
    if (!formData.businessUnit) return [{ label: "Select Department", value: "" }];
    const depts = BUSINESS_UNIT_DEPARTMENTS[formData.businessUnit] || [];
    return [
      { label: "Select Department", value: "" },
      ...depts.map((d) => ({ label: d, value: d })),
    ];
  }, [formData.businessUnit]);

  const updateField = <K extends keyof RevisionFormData>(key: K, val: RevisionFormData[K]) =>
    setFormData((prev) => ({ ...prev, [key]: val }));

  // When revision type changes, re-suggest version
  const handleRevisionTypeChange = (type: RevisionType) => {
    setRevisionType(type);
    setFormData((prev) => ({ ...prev, version: suggestVersion(source.form.version, type) }));
  };

  // ─── File ─────────────────────────────────────────────────────
  const validateFile = (file: File): string | null => {
    const ext = `.${file.name.toLowerCase().split(".").pop()}`;
    if (!ACCEPTED_EXTENSIONS.includes(ext))
      return `Invalid format. Accepted: ${ACCEPTED_EXTENSIONS.join(", ")}`;
    if (file.size > MAX_FILE_SIZE_BYTES)
      return `File exceeds ${MAX_FILE_SIZE_MB}MB limit.`;
    return null;
  };

  const simulateUpload = (file: File) => {
    const entry: UploadedFile = {
      id: Date.now().toString(),
      file,
      name: file.name,
      size: file.size,
      progress: 0,
      status: "uploading",
    };
    setNewFile(entry);
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 25 + 10;
      if (p >= 100) {
        clearInterval(iv);
        setNewFile((prev) => prev ? { ...prev, progress: 100, status: "success" } : null);
      } else {
        setNewFile((prev) => prev ? { ...prev, progress: Math.round(p) } : null);
      }
    }, 300);
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const err = validateFile(files[0]);
    if (err) {
      setModalType("error"); setModalTitle("File Error"); setModalDescription(err);
      setModalAction(null); setIsModalOpen(true); return;
    }
    simulateUpload(files[0]);
    setKeepExistingFile(false);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragActive(true);
  }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragActive(false);
  }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  }, []);

  // ─── Save / Submit ─────────────────────────────────────────────
  const validateForm = (): string | null => {
    if (!formData.revisionNotes.trim()) return "Revision notes are required. Please describe what changed.";
    if (uploadMode === "link") {
      if (!formData.externalUrl.trim()) return "Please enter a URL.";
      if (!isValidUrl(formData.externalUrl)) return "Please enter a valid URL.";
    }
    if (!formData.materialName.trim()) return "Material name is required.";
    if (!formData.version.trim()) return "Version is required.";
    if (!formData.businessUnit) return "Please select a business unit.";
    if (!formData.department) return "Please select a department.";
    if (!formData.reviewer) return "Please select a reviewer.";
    if (!formData.approver) return "Please select an approver.";
    if (!formData.description.trim()) return "Description is required.";
    return null;
  };

  const handleSaveDraft = () => {
    const err = validateForm();
    if (err) {
      setModalType("error"); setModalTitle("Validation Error"); setModalDescription(err);
      setModalAction(null); setIsModalOpen(true); return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setModalType("success");
      setModalTitle("Revision Saved as Draft");
      setModalDescription(`New revision ${formData.version} of ${formData.materialCode} has been saved as draft.`);
      setModalAction(() => () => navigate(ROUTES.TRAINING.MATERIALS));
      setIsModalOpen(true);
    }, 1000);
  };

  const handleSubmitForReview = () => {
    const err = validateForm();
    if (err) {
      setModalType("error"); setModalTitle("Validation Error"); setModalDescription(err);
      setModalAction(null); setIsModalOpen(true); return;
    }
    setshowesignModal(true);
  };

  const handleESignConfirm = (_reason: string) => {
    setshowesignModal(false);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setModalType("success");
      setModalTitle("Revision Submitted for Review");
      setModalDescription(`Revision ${formData.version} of ${formData.materialCode} has been submitted for review.`);
      setModalAction(() => () => navigate(ROUTES.TRAINING.MATERIALS));
      setIsModalOpen(true);
    }, 1000);
  };

  const handleCancel = () => {
    setModalType("confirm");
    setModalTitle("Discard Upgrade Revision?");
    setModalDescription("Are you sure you want to cancel? All unsaved changes will be lost.");
    setModalAction(() => () => navigate(-1));
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 w-full flex-1 flex flex-col">
      {/* ─── Header ───────────────────────────────────────────── */}
      <PageHeader
        title="Upgrade Revision"
        breadcrumbItems={materialNewRevision(navigate)}
        actions={
          <>
            <Button variant="outline-emerald" size="sm" onClick={handleCancel} className="whitespace-nowrap">
              Cancel
            </Button>
            <Button variant="outline-emerald" size="sm" onClick={handleSaveDraft} disabled={isLoading} className="whitespace-nowrap">
              {isLoading ? <ButtonLoading text="Saving..." /> : "Save as Draft"}
            </Button>
            <Button variant="outline-emerald" size="sm" onClick={handleSubmitForReview} disabled={isLoading} className="whitespace-nowrap">
              Submit for Review
            </Button>
          </>
        }
      />

      {/* ─── Workflow Stepper ─────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <div className="flex items-stretch min-w-full">
            {WORKFLOW_STEPS.map((step, index) => {
              const currentStepIndex = 0; // Always Draft for new revision
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

      {/* ─── Previous Version Banner ──────────────────────────── */}
      <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
        <GitBranch className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-blue-800">Creating a new revision from an existing material</p>
          <p className="text-xs text-blue-700 mt-0.5">
            Current version:{" "}
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 mr-1">
              v{source.form.version}
            </span>
            {source.form.materialName} · {source.form.materialCode}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            New revision will be saved as <span className="font-semibold">Draft</span> and must go through the approval workflow before becoming effective.
          </p>
        </div>
      </div>

      {/* ─── Revision Type Selector ───────────────────────────── */}
      <FormSection
        title="Revision Type"
        icon={<GitBranch className="h-4 w-4" />}
      >
        <p className="text-xs text-slate-500 -mt-2 mb-4">Choose whether this is a minor update or a major revision.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Minor Revision */}
            <button
              onClick={() => handleRevisionTypeChange("minor")}
              className={cn(
                "flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all",
                revisionType === "minor"
                  ? "border-emerald-500 bg-emerald-50/50"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
                revisionType === "minor" ? "border-emerald-500 bg-emerald-500" : "border-slate-300"
              )}>
                {revisionType === "minor" && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-slate-900">Minor Revision</p>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      v{source.form.version}
                    </span>
                    <span className="text-slate-400">→</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                      v{suggestVersion(source.form.version, "minor")}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Small updates, corrections, or additions that don't change the overall scope.
                </p>
              </div>
            </button>

            {/* Major Revision */}
            <button
              onClick={() => handleRevisionTypeChange("major")}
              className={cn(
                "flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all",
                revisionType === "major"
                  ? "border-emerald-500 bg-emerald-50/50"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
                revisionType === "major" ? "border-emerald-500 bg-emerald-500" : "border-slate-300"
              )}>
                {revisionType === "major" && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-slate-900">Major Revision</p>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      v{source.form.version}
                    </span>
                    <span className="text-slate-400">→</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full font-medium bg-amber-100 text-amber-800 border border-amber-200">
                      v{suggestVersion(source.form.version, "major")}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Significant restructuring or functional changes requiring full re-review.
                </p>
              </div>
            </button>
          </div>
      </FormSection>

      {/* ─── Main Content Grid ────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 lg:gap-6">
        {/* ── Left: File / Resource ──────────────────────────── */}
        <div className="xl:col-span-5 space-y-4">
          <FormSection
            title="File / Resource"
            icon={<CloudUpload className="h-4 w-4" />}
          >
            <p className="text-xs text-slate-500 -mt-2 mb-4">Keep the existing file or upload a new one for this revision.</p>
              {/* Upload mode tabs */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg mb-4">
                {(["file", "link"] as UploadMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => { setUploadMode(mode); setNewFile(null); setKeepExistingFile(true); }}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                      uploadMode === mode ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    {mode === "file" ? <><CloudUpload className="h-3.5 w-3.5" />Upload File</> : <><Link2 className="h-3.5 w-3.5" />Paste Link</>}
                  </button>
                ))}
              </div>

              {/* ── File mode ─── */}
              {uploadMode === "file" && (
                <>
                  {/* Existing file kept */}
                  {keepExistingFile && !newFile && (
                    <div className="border border-emerald-200 rounded-xl p-4 bg-emerald-50/40">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white border border-emerald-200 flex items-center justify-center flex-shrink-0">
                          <img
                            src={getFileIconSrc(source.existingFile.name)}
                            alt=""
                            className="h-6 w-6 object-contain"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{source.existingFile.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {formatFileSize(source.existingFile.size)} · {getFileTypeLabel(source.existingFile.name)}
                          </p>
                          <div className="flex items-center gap-1.5 mt-2">
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                            <span className="text-xs font-medium text-emerald-600">Carrying over from v{source.form.version}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => { setKeepExistingFile(false); setTimeout(() => fileInputRef.current?.click(), 50); }}
                        className="mt-3 inline-flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 font-medium transition-colors"
                      >
                        <IconRefresh className="h-3.5 w-3.5" />
                        Upload a new file for this revision
                      </button>
                    </div>
                  )}

                  {/* Upload drop zone (triggered by "Upload new file" or no existing) */}
                  {!keepExistingFile && !newFile && (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all min-h-[220px]",
                        isDragActive
                          ? "border-emerald-500 bg-emerald-50/50"
                          : "border-slate-300 bg-slate-50/50 hover:border-emerald-400 hover:bg-emerald-50/30"
                      )}
                    >
                      <div className={cn("w-14 h-14 rounded-full flex items-center justify-center mb-4", isDragActive ? "bg-emerald-100" : "bg-slate-100")}>
                        <CloudUpload className={cn("h-7 w-7", isDragActive ? "text-emerald-600" : "text-slate-400")} />
                      </div>
                      <p className="text-sm font-medium text-slate-700">{isDragActive ? "Drop file here" : "Drag & drop the new file"}</p>
                      <p className="text-xs text-slate-500 mt-1">or click to browse</p>
                      <div className="flex items-center gap-2 mt-4">
                        {[{ icon: FileText, label: "PDF", color: "text-red-500" }, { icon: Video, label: "MP4", color: "text-purple-500" }, { icon: FileImage, label: "JPG/PNG", color: "text-blue-500" }].map(({ icon: Icon, label, color }) => (
                          <span key={label} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-white border border-slate-200 text-slate-600">
                            <Icon className={cn("h-3 w-3", color)} /> {label}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setKeepExistingFile(true); }}
                        className="mt-4 text-xs text-slate-500 hover:text-slate-700 underline"
                      >
                        Keep existing file instead
                      </button>
                    </div>
                  )}

                  {/* New file preview */}
                  {newFile && (
                    <div className="space-y-3">
                      <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                            <img src={getFileIconSrc(newFile.name)} alt="" className="h-6 w-6 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{newFile.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{formatFileSize(newFile.size)} · {getFileTypeLabel(newFile.name)}</p>
                            {newFile.status === "uploading" && (
                              <div className="mt-2">
                                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${newFile.progress}%` }} />
                                </div>
                                <p className="text-xs text-slate-500 mt-1">{newFile.progress}% uploaded</p>
                              </div>
                            )}
                            {newFile.status === "success" && (
                              <div className="flex items-center gap-1.5 mt-2">
                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                                <span className="text-xs font-medium text-emerald-600">Ready</span>
                              </div>
                            )}
                          </div>
                          <button onClick={() => { setNewFile(null); setKeepExistingFile(true); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="p-1 rounded-lg hover:bg-slate-200 transition-colors">
                            <X className="h-4 w-4 text-slate-500" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500">
                        Replacing: <span className="font-medium text-slate-700">{source.existingFile.name}</span>
                        {" "}→{" "}<span className="font-medium text-emerald-700">{newFile.name}</span>
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* ── Link mode ─── */}
              {uploadMode === "link" && (
                <div className="space-y-3">
                  <div className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center border-slate-300 bg-slate-50/50">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 bg-slate-100">
                      <Link2 className="h-7 w-7 text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-700 mb-3">Paste external resource URL</p>
                    <input
                      type="url"
                      value={formData.externalUrl}
                      onChange={(e) => updateField("externalUrl", e.target.value)}
                      placeholder="https://example.com/resource.pdf"
                      className="w-full h-9 px-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm placeholder:text-slate-400"
                    />
                  </div>
                  {formData.externalUrl && isValidUrl(formData.externalUrl) && (
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                        <Link2 className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{formData.externalUrl}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="text-xs font-medium text-emerald-600">Valid URL</span>
                        </div>
                      </div>
                      <button onClick={() => updateField("externalUrl", "")} className="p-1 rounded-lg hover:bg-slate-200 transition-colors">
                        <X className="h-4 w-4 text-slate-500" />
                      </button>
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

          {/* Revision Notes */}
          <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-amber-200 bg-amber-50/50">
              <h3 className="text-sm font-semibold text-amber-900 flex items-center gap-2">
                Revision Notes<span className="text-red-500">*</span>
              </h3>
              <p className="text-xs text-amber-700 mt-0.5">
                Document what changed in this revision compared to v{source.form.version}.
              </p>
            </div>
            <div className="p-5">
              <textarea
                value={formData.revisionNotes}
                onChange={(e) => updateField("revisionNotes", e.target.value)}
                placeholder={`Describe the changes made in this revision compared to v${source.form.version}:\n• What was added or changed\n• Why the revision was needed\n• Any regulatory references`}
                rows={5}
                className={cn(
                  "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-1 text-sm placeholder:text-slate-400 resize-none transition-colors",
                  formData.revisionNotes.trim()
                    ? "border-emerald-300 focus:ring-emerald-500 focus:border-emerald-500"
                    : "border-amber-300 focus:ring-amber-500 focus:border-amber-500"
                )}
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-slate-400">
                  {formData.revisionNotes.length} characters
                </p>
                {formData.revisionNotes.trim() && (
                  <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                    <Check className="h-3.5 w-3.5" />
                    Filled
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Revision Details ───────────────────────── */}
        <div className="xl:col-span-7 space-y-4">

          {/* Material Information */}
          <FormSection
            title="Material Information"
            icon={<FileText className="h-4 w-4" />}
          >
            <p className="text-xs text-slate-500 -mt-2 mb-5">Pre-filled from previous version. Update as needed.</p>
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
                  className="w-full h-9 px-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm placeholder:text-slate-400"
                />
              </div>

              {/* Material Code + Version */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">Material Code</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.materialCode}
                      readOnly
                      className="w-full h-9 px-4 pr-8 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-900 cursor-default focus:outline-none"
                    />
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  </div>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">Code stays the same across revisions.</p>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
                    New Version <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) => updateField("version", e.target.value)}
                    className="w-full h-9 px-4 border border-emerald-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium text-emerald-700 bg-emerald-50/30"
                  />
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    Auto-suggested based on revision type. You can edit manually.
                  </p>
                </div>
              </div>

              {/* Author */}
              <div>
                <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">Author</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.author}
                    readOnly
                    className="w-full h-9 px-4 pr-8 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-900 cursor-default focus:outline-none"
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              {/* Business Unit + Department */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Business Unit"
                  value={formData.businessUnit}
                  onChange={(val) => { updateField("businessUnit", val as string); updateField("department", ""); }}
                  options={BUSINESS_UNIT_OPTIONS}
                  placeholder="Select..."
                />
                <Select
                  label="Department"
                  value={formData.department}
                  onChange={(val) => updateField("department", val as string)}
                  options={departmentOptions}
                  placeholder={formData.businessUnit ? "Select..." : "Select BU first"}
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
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm placeholder:text-slate-400 resize-none"
                />
              </div>
            </div>
          </FormSection>
        </div>
      </div>

      {/* ─── Modals ────────────────────────────────────────────── */}
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
      <ESignatureModal
        isOpen={showesignModal}
        onClose={() => setshowesignModal(false)}
        onConfirm={handleESignConfirm}
        actionTitle="Submit Revision for Review"
      />

      {/* ─── Loading Overlay ──────────────────────────────────── */}
      {(isLoading || isNavigating) && <FullPageLoading text="Processing..." />}
    </div>
  );
};




