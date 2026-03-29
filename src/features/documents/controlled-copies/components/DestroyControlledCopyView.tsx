import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ROUTES } from '@/app/routes.constants';
import {
  ArrowLeft,
  Upload,
  Calendar,
  User,
  FileText,
  X,
  AlertTriangle,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import { ESignatureModal } from "@/components/ui/esign-modal/ESignatureModal";
import { AlertModal } from "@/components/ui/modal/AlertModal";
import { DateTimePicker } from "@/components/ui/datetime-picker/DateTimePicker";
import { useToast } from "@/components/ui/toast/Toast";
import { FullPageLoading } from "@/components/ui/loading/Loading";
import { Breadcrumb } from "@/components/ui/breadcrumb/Breadcrumb";
import { destroyControlledCopy } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { MOCK_DESTROY_CONTROLLED_COPY as MOCK_CONTROLLED_COPY } from "../mockData";

interface EvidenceFile {
  file: File;
  preview: string;
  id: string;
}

interface DestructionFormData {
  destructionDate: string;
  destructionMethod: string;
  destructedBy: string;
  destructionSupervisor: string;
  evidenceFiles: EvidenceFile[];
}

export const DestroyControlledCopyView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { showToast } = useToast();

  // Get destruction type from URL params or navigation state
  const [destructionType, setDestructionType] = useState<"Lost" | "Damaged">("Damaged");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const typeParam = params.get("type");
    
    if (typeParam === "Lost" || typeParam === "Damaged") {
      setDestructionType(typeParam);
    } else if (location.state?.type) {
      setDestructionType(location.state.type);
    } else {
      // Redirect back if no type specified
      navigate(ROUTES.DOCUMENTS.CONTROLLED_COPIES.ALL);
    }
  }, [location, navigate]);

  // Get current datetime when component mounts
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [formData, setFormData] = useState<DestructionFormData>({
    destructionDate: getCurrentDateTime(),
    destructionMethod: "",
    destructedBy: "",
    destructionSupervisor: "",
    evidenceFiles: [],
  });

  const [isesignModalOpen, setisesignModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const controlledCopy = MOCK_CONTROLLED_COPY; // In production: fetch by id

  const handleInputChange = (field: keyof DestructionFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file sizes
    const invalidFiles = files.filter(file => file.size > 10 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      setErrors((prev) => ({ ...prev, evidenceFile: "Some files exceed 10MB limit" }));
      return;
    }

    // Validate file types
    const nonImageFiles = files.filter(file => !file.type.startsWith("image/"));
    if (nonImageFiles.length > 0) {
      setErrors((prev) => ({ ...prev, evidenceFile: "Only image files are allowed" }));
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const newEvidenceFiles: EvidenceFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Simulate upload progress
      await new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newEvidenceFiles.push({
            file,
            preview: reader.result as string,
            id: `${Date.now()}-${i}`,
          });
          setUploadProgress(Math.round(((i + 1) / files.length) * 100));
          setTimeout(resolve, 300); // Simulate upload delay
        };
        reader.readAsDataURL(file);
      });
    }

    setFormData((prev) => ({
      ...prev,
      evidenceFiles: [...prev.evidenceFiles, ...newEvidenceFiles],
    }));

    setIsUploading(false);
    setUploadProgress(0);

    if (errors.evidenceFile) {
      setErrors((prev) => ({ ...prev, evidenceFile: "" }));
    }

    // Reset input
    e.target.value = "";
  };

  const handleRemoveFile = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      evidenceFiles: prev.evidenceFiles.filter(file => file.id !== id),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.destructionDate) {
      newErrors.destructionDate = "Destruction date is required";
    }
    if (!formData.destructionMethod.trim()) {
      newErrors.destructionMethod = "Destruction method is required";
    }
    if (!formData.destructedBy.trim()) {
      newErrors.destructedBy = "Executor name is required";
    }
    if (!formData.destructionSupervisor.trim()) {
      newErrors.destructionSupervisor = "Supervisor name is required";
    }
    // Evidence photos only required for Damaged cases
    if (destructionType === "Damaged" && formData.evidenceFiles.length === 0) {
      newErrors.evidenceFile = "At least one evidence photo is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      setisesignModalOpen(true);
    }
  };

  const handleESignConfirm = async (reason: string) => {
    setisesignModalOpen(false);
    setIsLoading(true);
    try {
      // TODO: Call API to mark as destroyed

      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      showToast({
        type: "success",
        title: "Controlled Copy Destroyed",
        message: `Controlled copy ${controlledCopy.controlNumber} has been marked as destroyed.`,
        duration: 3500,
      });

      navigate(ROUTES.DOCUMENTS.CONTROLLED_COPIES.ALL);
    } catch (error) {
      setIsLoading(false);
      showToast({
        type: "error",
        title: "Destruction Failed",
        message: "Failed to mark controlled copy as destroyed. Please try again.",
        duration: 3500,
      });
    }
  };

  const handleCancelConfirm = () => {
    setIsCancelModalOpen(false);
    setIsNavigating(true);
    setTimeout(() => navigate(ROUTES.DOCUMENTS.CONTROLLED_COPIES.ALL), 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 lg:gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg md:text-xl lg:text-2xl font-bold tracking-tight text-slate-900">
              Report {destructionType} Controlled Copy
            </h1>
            <Breadcrumb items={destroyControlledCopy(undefined, destructionType)} />
          </div>
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <Button
              variant="outline-emerald"
              size="sm"
              onClick={() => setIsCancelModalOpen(true)}
              disabled={isLoading}
              className="whitespace-nowrap flex items-center gap-2"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700"
            >
              Submit
            </Button>
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-5">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-red-900 mb-1">
              Irreversible Action - Proceed with Caution
            </h3>
            <p className="text-sm text-red-800 leading-relaxed">
              This action cannot be undone. Once marked as {destructionType.toLowerCase()}, this controlled copy will
              be permanently removed from active inventory and cannot be recovered. Ensure all
              {destructionType === "Damaged" ? " destruction" : ""} procedures are followed according to company policy.
            </p>
          </div>
        </div>
      </div>

      {/* Controlled Copy Information */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Controlled Copy Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Control Number
            </label>
            <p className="text-sm font-semibold text-slate-900 mt-1">
              {controlledCopy.controlNumber}
            </p>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Copy Number
            </label>
            <p className="text-sm text-slate-900 mt-1">
              {controlledCopy.copyNumber} of {controlledCopy.totalCopies}
            </p>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Status
            </label>
            <p className="text-sm text-slate-900 mt-1">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                {controlledCopy.status}
              </span>
            </p>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Document
            </label>
            <p className="text-sm text-slate-900 mt-1">
              {controlledCopy.documentId} - {controlledCopy.documentTitle}
            </p>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Location
            </label>
            <p className="text-sm text-slate-900 mt-1">{controlledCopy.location}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Recipient
            </label>
            <p className="text-sm text-slate-900 mt-1">{controlledCopy.recipientName}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Distributed Date
            </label>
            <p className="text-sm text-slate-900 mt-1">
              {new Date(controlledCopy.distributedDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Destruction Form */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-6">
          {destructionType} Report Details
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Destruction Information */}
          <div className="space-y-5">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-200">
              <Calendar className="h-4 w-4 text-slate-600" />
              Destruction Information
            </h3>

            {/* Destruction Date */}
            <div>
              <DateTimePicker
                label="Destruction Date"
                value={formData.destructionDate}
                onChange={(value) => handleInputChange("destructionDate", value)}
                placeholder="Select date"
              />
              {errors.destructionDate && (
                <p className="text-xs text-red-600 mt-1">{errors.destructionDate}</p>
              )}
              <p className="text-xs text-slate-500 mt-1.5">
                Auto-captured at page open time (adjustable)
              </p>
            </div>

            {/* Destruction Method */}
            <div>
              <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
                Destruction Method <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.destructionMethod}
                onChange={(e) => handleInputChange("destructionMethod", e.target.value)}
                placeholder="e.g., Paper shredding, Incineration, etc."
                className={`w-full h-9 px-4 border rounded-lg text-sm focus:outline-none focus:ring-1 transition-colors ${
                  errors.destructionMethod
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
                }`}
              />
              {errors.destructionMethod && (
                <p className="text-xs text-red-600 mt-1">{errors.destructionMethod}</p>
              )}
            </div>

            {/* Executor */}
            <div>
              <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
                Executor (Person Performing) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={formData.destructedBy}
                  onChange={(e) => handleInputChange("destructedBy", e.target.value)}
                  placeholder="Enter executor name"
                  className={`w-full h-9 pl-10 pr-4 border rounded-lg text-sm focus:outline-none focus:ring-1 transition-colors ${
                    errors.destructedBy
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
                  }`}
                />
              </div>
              {errors.destructedBy && (
                <p className="text-xs text-red-600 mt-1">{errors.destructedBy}</p>
              )}
            </div>

            {/* Supervisor */}
            <div>
              <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
                Supervisor (Witness) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={formData.destructionSupervisor}
                  onChange={(e) => handleInputChange("destructionSupervisor", e.target.value)}
                  placeholder="Enter supervisor name"
                  className={`w-full h-9 pl-10 pr-4 border rounded-lg text-sm focus:outline-none focus:ring-1 transition-colors ${
                    errors.destructionSupervisor
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
                  }`}
                />
              </div>
              {errors.destructionSupervisor && (
                <p className="text-xs text-red-600 mt-1">{errors.destructionSupervisor}</p>
              )}
              <p className="text-xs text-slate-500 mt-1.5">
                Required for compliance: 2-person verification
              </p>
            </div>
          </div>

          {/* Right Column - Evidence Upload */}
          <div className="space-y-5">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-200">
              <FileText className="h-4 w-4 text-slate-600" />
              {destructionType === "Damaged" ? "Destruction Evidence" : "Additional Information"}
            </h3>

            {destructionType === "Damaged" ? (
              <>
                {/* File Upload */}
                <div>
                  <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
                    Evidence Photos <span className="text-red-500">*</span>
                  </label>

              {/* Upload Area */}
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="evidence-upload"
                  disabled={isUploading}
                />
                <label
                  htmlFor="evidence-upload"
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    isUploading
                      ? "border-slate-200 bg-slate-50 cursor-not-allowed"
                      : errors.evidenceFile
                      ? "border-red-300 bg-red-50 hover:bg-red-100"
                      : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                  }`}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center justify-center w-full px-6">
                      <Upload className="h-8 w-8 mb-3 text-emerald-500 animate-pulse" />
                      <p className="text-sm text-slate-600 font-medium mb-2">
                        Uploading... {uploadProgress}%
                      </p>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-300 ease-out"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-3 pb-4">
                      <Upload
                        className={`h-8 w-8 mb-2 ${
                          errors.evidenceFile ? "text-red-400" : "text-slate-400"
                        }`}
                      />
                      <p className="mb-1 text-sm text-slate-600 font-medium">
                        Click to upload evidence photos
                      </p>
                      <p className="text-xs text-slate-500">JPG, PNG (Max 10MB each, multiple files)</p>
                    </div>
                  )}
                </label>
              </div>

              {errors.evidenceFile && (
                <p className="text-xs text-red-600 mt-1">{errors.evidenceFile}</p>
              )}

              {/* Preview Grid */}
              {formData.evidenceFiles.length > 0 && (
                <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-2">
                  {formData.evidenceFiles.map((evidence, index) => (
                    <div
                      key={evidence.id}
                      className="relative group rounded-lg overflow-hidden border-2 border-slate-200 hover:border-emerald-500 transition-all duration-200 cursor-pointer"
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <div className="aspect-square">
                        <img
                          src={evidence.preview}
                          alt={`Evidence ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile(evidence.id);
                        }}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-xs text-white font-medium truncate">
                          {evidence.file.name}
                        </p>
                        <p className="text-xs text-slate-300">
                          {(evidence.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Evidence Requirements */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-3">Photo Requirements:</h4>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Clear photo of shredded/destroyed document pieces</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Or signed destruction record form with timestamp</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Control number must be visible if possible</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Photo taken immediately after destruction</span>
                </li>
              </ul>
            </div>
          </>
            ) : (
              /* Lost Case - No Evidence Required */
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
                <h4 className="text-sm font-semibold text-amber-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Lost Controlled Copy Report
                </h4>
                <p className="text-sm text-amber-800 mb-4">
                  For lost controlled copies, evidence photos are not required. However, please ensure:
                </p>
                <ul className="space-y-2 text-sm text-amber-800">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-0.5">•</span>
                    <span>Conduct thorough search before reporting as lost</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-0.5">•</span>
                    <span>Document when and where it was last seen</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-0.5">•</span>
                    <span>Notify supervisor immediately upon discovery</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-0.5">•</span>
                    <span>Investigation may be initiated per company policy</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Viewer Modal */}
      {selectedImageIndex !== null &&
        createPortal(
          <>
            {/* Backdrop covering full viewport */}
            <div
              className="fixed inset-0 z-[9998] bg-black/90"
              onClick={() => setSelectedImageIndex(null)}
              aria-hidden="true"
            />

            {/* Foreground content */}
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 lg:p-8">
              <button
                onClick={() => setSelectedImageIndex(null)}
                className="absolute top-2 right-2 md:top-4 md:right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10"
                aria-label="Close image viewer"
              >
                <X className="h-5 w-5 md:h-6 md:w-6" />
              </button>

              <div className="relative flex items-center justify-center w-full h-full">
                <img
                  src={formData.evidenceFiles[selectedImageIndex].preview}
                  alt={`Evidence ${selectedImageIndex + 1}`}
                  className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg"
                />
                <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm px-3 py-1.5 md:px-4 md:py-2 rounded-full">
                  <p className="text-xs md:text-sm text-white font-medium">
                    {selectedImageIndex + 1} / {formData.evidenceFiles.length}
                  </p>
                </div>

                {/* Navigation buttons */}
                {formData.evidenceFiles.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageIndex((prev) =>
                          prev! > 0 ? prev! - 1 : formData.evidenceFiles.length - 1
                        );
                      }}
                      className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                      aria-label="Previous image"
                    >
                      <ArrowLeft className="h-5 w-5 md:h-6 md:w-6" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageIndex((prev) =>
                          prev! < formData.evidenceFiles.length - 1 ? prev! + 1 : 0
                        );
                      }}
                      className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                      aria-label="Next image"
                    >
                      <ArrowLeft className="h-5 w-5 md:h-6 md:w-6 rotate-180" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </>,
          window.document.body
        )}

      {/* Cancel Confirmation Modal */}
      <AlertModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelConfirm}
        type="warning"
        title="Cancel Destruction Process?"
        description="Are you sure you want to cancel? All entered information will be lost and cannot be recovered."
      />

      {/* E-Signature Modal */}
      <ESignatureModal
        isOpen={isesignModalOpen}
        onClose={() => setisesignModalOpen(false)}
        onConfirm={handleESignConfirm}
        actionTitle="Confirm Controlled Copy Destruction"
      />

      {(isLoading || isNavigating) && <FullPageLoading text="Processing..." />}
    </div>
  );
};




