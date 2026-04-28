import React, { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTES } from "@/app/routes.constants";
import {
  Check,
  X,
  Eye,
  Download,
  ArrowLeft,
  Calendar,
  User,
  Building2,
  Tag,
  Hash,
  FileStack,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Send,
  RotateCcw,
  Link2,
  ExternalLink,
  Activity,
  Info,
  GitBranch,
} from "lucide-react";
import { IconChecks } from "@tabler/icons-react";
import { cn } from "@/components/ui/utils";
import { FormSection } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page/PageHeader";

import { materialDetail } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { Button } from "@/components/ui/button/Button";
import { AlertModal, AlertModalType } from "@/components/ui/modal/AlertModal";
import { ESignatureModal } from "@/components/ui/esign-modal";
import { FullPageLoading } from "@/components/ui/loading/Loading";
import { getFileIconSrc } from "@/utils/fileIcons";
import { formatDateUS } from "@/utils/format";
import { type TrainingMaterialWorkflow as TrainingMaterial, WORKFLOW_STEPS } from "@/features/training/materials/types";
import { MOCK_MATERIAL_REVIEW } from "../../mockData";

const MOCK_MATERIAL: TrainingMaterial = MOCK_MATERIAL_REVIEW;

// ─── Activity log mock ─────────────────────────────────────────
interface ActivityEntry {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  comment?: string;
  icon: React.ReactNode;
  color: string;
}

const generateActivityLog = (material: TrainingMaterial): ActivityEntry[] => {
  const logs: ActivityEntry[] = [
    {
      id: "1",
      action: "Material Created",
      user: material.uploadedBy,
      timestamp: material.uploadedAt,
      comment: "Initial upload of training material.",
      icon: <FileStack className="h-4 w-4" />,
      color: "bg-blue-100 text-blue-600",
    },
  ];

  if (material.status === "Pending Review" || material.status === "Pending Approval" || material.status === "Effective" || material.status === "Obsoleted") {
    logs.push({
      id: "2",
      action: "Submitted for Review",
      user: material.uploadedBy,
      timestamp: material.uploadedAt,
      comment: "Material submitted for review by assigned reviewer.",
      icon: <Send className="h-4 w-4" />,
      color: "bg-amber-100 text-amber-600",
    });
  }

  if (material.reviewedAt) {
    logs.push({
      id: "3",
      action: "Review Completed",
      user: material.reviewer,
      timestamp: material.reviewedAt,
      comment: material.reviewComment || "Reviewed and approved.",
      icon: <CheckCircle className="h-4 w-4" />,
      color: "bg-emerald-100 text-emerald-600",
    });
  }

  if (material.approvedAt) {
    logs.push({
      id: "4",
      action: "Effective",
      user: material.approver,
      timestamp: material.approvedAt,
      comment: material.approvalComment || "Approved for use in training courses, now Effective.",
      icon: <IconChecks className="h-4 w-4" />,
      color: "bg-emerald-100 text-emerald-600",
    });
  }

  return logs.reverse(); // Newest first
};


// ─── Component ─────────────────────────────────────────────────────
export const MaterialDetailView: React.FC = () => {
  const navigate = useNavigate();
  const { materialId } = useParams<{ materialId: string }>();

  // In real app, fetch from API. For now, use mock
  const [material, setMaterial] = useState<TrainingMaterial>(MOCK_MATERIAL);
  const currentStepIndex = WORKFLOW_STEPS.indexOf(material.status);
  const activityLog = useMemo(() => generateActivityLog(material), [material]);

  // Determine user role (simulated)
  const isReviewer = true; // Current user is the assigned reviewer
  const isApprover = true; // Current user is the assigned approver
  const canReview = material.status === "Pending Review" && isReviewer;
  const canApprove = material.status === "Pending Approval" && isApprover;

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<AlertModalType>("info");
  const [modalTitle, setModalTitle] = useState("");
  const [modalDescription, setModalDescription] = useState("");
  const [modalAction, setModalAction] = useState<(() => void) | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // E-Sign modal
  const [showesignModal, setShowesignModal] = useState(false);
  const [eSignAction, setESignAction] = useState<"review-approve" | "review-reject" | "approve" | "reject" | "obsolete" | null>(null);

  // Review/Reject comment
  const [reviewComment, setReviewComment] = useState("");

  // ─── E-Sign Actions ────────────────────────────────────────────
  const handleReviewApprove = () => {
    setESignAction("review-approve");
    setShowesignModal(true);
  };

  const handleReviewReject = () => {
    setESignAction("review-reject");
    setShowesignModal(true);
  };

  const handleApprove = () => {
    setESignAction("approve");
    setShowesignModal(true);
  };

  const handleReject = () => {
    setESignAction("reject");
    setShowesignModal(true);
  };

  const handleMarkObsolete = () => {
    setESignAction("obsolete");
    setShowesignModal(true);
  };

  const getESignTitle = () => {
    switch (eSignAction) {
      case "review-approve": return "Review & Approve Material";
      case "review-reject": return "Reject Material (Review)";
      case "approve": return "Effective Material";
      case "reject": return "Reject Material (Approval)";
      case "obsolete": return "Mark Material as Obsolete";
      default: return "";
    }
  };

  const handleESignConfirm = (reason: string) => {
    setShowesignModal(false);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      switch (eSignAction) {
        case "review-approve":
          setMaterial((prev) => ({
            ...prev,
            status: "Pending Approval",
            reviewedAt: new Date().toISOString().split("T")[0],
            reviewComment: reason,
          }));
          setModalType("success");
          setModalTitle("Review Completed");
          setModalDescription("Material has been reviewed and is now in Pending Approval state, awaiting approver action.");
          setModalAction(null);
          break;

        case "review-reject":
          setMaterial((prev) => ({
            ...prev,
            status: "Draft",
            reviewComment: reason,
          }));
          setModalType("success");
          setModalTitle("Material Returned");
          setModalDescription("Material has been returned to draft. The author will be notified to make changes.");
          setModalAction(() => () => navigate(-1));
          break;

        case "approve":
          setMaterial((prev) => ({
            ...prev,
            status: "Effective",
            approvedAt: new Date().toISOString().split("T")[0],
            approvalComment: reason,
          }));
          setModalType("success");
          setModalTitle("Material Effective");
          setModalDescription("Training material has been approved and is now Effective for use in courses.");
          setModalAction(null);
          break;

        case "reject":
          setMaterial((prev) => ({
            ...prev,
            status: "Draft",
            approvalComment: reason,
          }));
          setModalType("success");
          setModalTitle("Material Rejected");
          setModalDescription("Material has been rejected and returned to draft. The author will be notified.");
          setModalAction(() => () => navigate(-1));
          break;

        case "obsolete":
          setMaterial((prev) => ({
            ...prev,
            status: "Obsoleted",
          }));
          setModalType("success");
          setModalTitle("Material Obsoleted");
          setModalDescription("Material has been marked as Obsoleted and will no longer be available for new courses.");
          setModalAction(null);
          break;
      }

      setESignAction(null);
      setIsModalOpen(true);
    }, 1000);
  };

  return (
    <div className="space-y-6 w-full flex-1 flex flex-col">
      {/* ─── Header ─────────────────────────────────────────────── */}
      <PageHeader
        title="Material Detail"
        breadcrumbItems={materialDetail(navigate)}
        actions={
          <>
            <Button
              variant="outline-emerald"
              size="sm"
              className="whitespace-nowrap"
              onClick={() => { setIsNavigating(true); setTimeout(() => navigate(-1), 600); }}
            >
              Back
            </Button>
            {/* Review actions */}
            {canReview && (
              <>
                <Button
                  size="sm"
                  variant="outline-emerald"
                  className="whitespace-nowrap"
                  onClick={handleReviewReject}
                >
                  Reject
                </Button>
                <Button variant="outline-emerald" size="sm" className="whitespace-nowrap" onClick={handleReviewApprove}>
                  Review
                </Button>
              </>
            )}
            {/* Approve actions (after review) */}
            {canApprove && (
              <>
                <Button
                  size="sm"
                  variant="outline-emerald"
                  className="whitespace-nowrap"
                  onClick={handleReject}
                >
                  Reject
                </Button>
                <Button variant="outline-emerald" size="sm" className="whitespace-nowrap" onClick={handleApprove}>
                  Effective
                </Button>
              </>
            )}
            {/* Obsolete action */}
            {material.status === "Effective" && (
              <Button
                size="sm"
                variant="outline-emerald"
                className="whitespace-nowrap"
                onClick={handleMarkObsolete}
              >
                <XCircle className="h-4 w-4" />
                Mark Obsoleted
              </Button>
            )}
          </>
        }
      />

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

      {/* ─── Content Grid ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 lg:gap-6">
        {/* Left: Material Info */}
        <div className="xl:col-span-7 space-y-5">
          {/* Material Information Card */}
          <FormSection title="Material Information" icon={<Info className="h-4 w-4" />}>
            {/* File preview card */}
            <div className="flex items-center gap-3 sm:gap-4 p-4 md:p-5 bg-slate-50/80 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:border-emerald-200 transition-colors">
                {material.externalUrl ? (
                  <Link2 className="h-5 w-5 text-emerald-600" />
                ) : (
                  <img
                    src={getFileIconSrc(
                      material.type === "PDF" ? "file.pdf" :
                        material.type === "Video" ? "file.mp4" :
                          material.type === "Image" ? "file.jpg" :
                            "file.docx"
                    )}
                    alt="file icon"
                    className="h-5 w-5 sm:h-6 sm:w-6 object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm sm:text-base font-bold text-slate-900 truncate" title={material.title}>
                      {material.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] sm:text-xs text-slate-500 font-medium">
                        {material.externalUrl ? "External Link" : `${material.fileSize} · ${material.type}`}
                      </span>
                      {!material.externalUrl && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block" />
                          <span className="text-[10px] sm:text-xs text-slate-500 hidden sm:block">
                            Uploaded {formatDateUS(material.uploadedAt)}
                          </span>
                        </>
                      )}
                    </div>
                    {material.externalUrl && (
                      <a
                        href={material.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-1 text-[10px] sm:text-xs text-emerald-600 hover:text-emerald-700 hover:underline font-bold"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Open Link
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="xs" className="h-7 sm:h-8 px-2 sm:px-3 gap-1.5 text-[10px] sm:text-xs font-bold border-slate-200 bg-white">
                      <Eye className="h-3.5 w-3.5" />
                      Preview
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <Hash className="h-3.5 w-3.5" /> Material Code
                </div>
                <p className="text-sm font-semibold text-emerald-700">{material.materialId}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <Tag className="h-3.5 w-3.5" /> Version
                </div>
                <p className="text-sm font-semibold text-slate-900">{material.version}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <Building2 className="h-3.5 w-3.5" /> Department
                </div>
                <p className="text-sm font-semibold text-slate-900">{material.department}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <User className="h-3.5 w-3.5" /> Uploaded By
                </div>
                <p className="text-sm font-semibold text-slate-900">{material.uploadedBy}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <Calendar className="h-3.5 w-3.5" /> Upload Date
                </div>
                <p className="text-sm font-semibold text-slate-900">{formatDateUS(material.uploadedAt)}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <FileStack className="h-3.5 w-3.5" /> File Type
                </div>
                <p className="text-sm font-semibold text-slate-900">{material.type}</p>
              </div>
            </div>

            {/* Description */}
            <div className="pt-2 border-t border-slate-100 mt-5">
              <p className="text-xs text-slate-500 font-medium mb-1.5">Description</p>
              <p className="text-sm text-slate-700 leading-relaxed">{material.description}</p>
            </div>
          </FormSection>

          {/* Workflow Assignment Card */}
          <FormSection title="Workflow Assignment" icon={<GitBranch className="h-4 w-4" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Reviewer */}
              <div className="p-4 md:p-5 rounded-lg border border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <Eye className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Reviewer</p>
                    <p className="text-sm font-semibold text-slate-900">{material.reviewer}</p>
                  </div>
                </div>
                {material.reviewedAt ? (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Reviewed on {formatDateUS(material.reviewedAt)}
                  </div>
                ) : material.status === "Pending Review" ? (
                  <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
                    <Clock className="h-3.5 w-3.5" />
                    Awaiting review
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <Clock className="h-3.5 w-3.5" />
                    Not started
                  </div>
                )}
              </div>

              {/* Approver */}
              <div className="p-4 md:p-5 rounded-lg border border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <IconChecks className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Approver</p>
                    <p className="text-sm font-semibold text-slate-900">{material.approver}</p>
                  </div>
                </div>
                {material.approvedAt ? (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Effective on {formatDateUS(material.approvedAt)}
                  </div>
                ) : material.reviewedAt ? (
                  <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
                    <Clock className="h-3.5 w-3.5" />
                    Awaiting approval
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <Clock className="h-3.5 w-3.5" />
                    Pending review first
                  </div>
                )}
              </div>
            </div>
          </FormSection>
        </div>

        {/* Right: Activity Log */}
        <div className="xl:col-span-5">
          <FormSection title="Activity Log" icon={<Activity className="h-4 w-4" />}>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-6 bottom-6 w-px bg-slate-200" />

              <div className="space-y-5">
                {activityLog.map((entry) => (
                  <div key={entry.id} className="relative flex gap-4">
                    <div className={cn(
                      "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center z-10",
                      entry.color
                    )}>
                      {entry.icon}
                    </div>
                    <div className="flex-1 min-w-0 pb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-slate-900">{entry.action}</p>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        by <span className="font-medium text-slate-700">{entry.user}</span> · {formatDateUS(entry.timestamp)}
                      </p>
                      {entry.comment && (
                        <p className="text-xs text-slate-600 mt-1.5 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                          {entry.comment}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {canReview && (
              <div className="mt-5 pt-5 border-t border-slate-200">
                <label className="text-xs sm:text-sm font-medium text-slate-700 mb-2 block">
                  Review Comment
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Add a comment for review..."
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm placeholder:text-slate-400 resize-none"
                />
              </div>
            )}
          </FormSection>
        </div>
      </div>

      {/* ─── Alert Modal ────────────────────────────────────────── */}
      <AlertModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={modalAction ? () => { setIsModalOpen(false); setIsNavigating(true); setTimeout(() => modalAction(), 600); } : undefined}
        type={modalType}
        title={modalTitle}
        description={modalDescription}
        isLoading={isLoading}
        confirmText="OK"
      />

      {/* ─── E-Signature Modal ──────────────────────────────────── */}
      <ESignatureModal
        isOpen={showesignModal}
        onClose={() => { setShowesignModal(false); setESignAction(null); }}
        onConfirm={handleESignConfirm}
        actionTitle={getESignTitle()}
      />

      {(isLoading || isNavigating) && <FullPageLoading text="Processing..." />}
    </div>
  );
};



