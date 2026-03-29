import React, { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTES } from "@/app/routes.constants";
import { XCircle, Check } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb/Breadcrumb";
import { coursePendingReview } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { Button } from "@/components/ui/button/Button";
import { ESignatureModal } from "@/components/ui/esign-modal";
import { FullPageLoading } from "@/components/ui/loading/Loading";
import { cn } from "@/components/ui/utils";
import { TabNav } from "@/components/ui/tabs/TabNav";
import type { TabItem } from "@/components/ui/tabs/TabNav";
import { CourseApproval } from "../../../types";
import { MOCK_APPROVAL_DETAILS } from "../mockData";
import { BasicInfoTab } from "../../shared/BasicInfoTab";
import { DocumentTab } from "../../shared/DocumentTab";
import { ConfigTab } from "../../shared/ConfigTab";

type TabType = "basic-info" | "document-training" | "training-config";

const TABS: TabItem[] = [
  { id: "basic-info", label: "Basic Information" },
  { id: "document-training", label: "Training Materials" },
  { id: "training-config", label: "Assessment Config" },
];

const WORKFLOW_STEPS = [
  "Draft",
  "Pending Review",
  "Pending Approval",
  "Approved",
  "Obsoleted",
] as const;
type WorkflowStep = (typeof WORKFLOW_STEPS)[number];

export const ReviewCourseView: React.FC = () => {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleNavigateBack = () => {
    setIsNavigating(true);
    setTimeout(() => navigate(-1), 600);
  };

  const [activeTab, setActiveTab] = useState<TabType>("basic-info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showesignModal, setShowesignModal] = useState(false);
  const [eSignAction, setESignAction] = useState<
    "complete-review" | "reject" | null
  >(null);

  const original = MOCK_APPROVAL_DETAILS.find((a) => a.courseId === courseId);

  // Local status override to reflect stepper advancement after action
  const [localStatus, setLocalStatus] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>("");

  if (!original) {
    return (
      <div className="space-y-6 w-full flex-1 flex flex-col">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNavigateBack}
            className="gap-2"
          >
            Back
          </Button>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-lg font-medium text-slate-900">Course not found</p>
          <p className="text-sm text-slate-500 mt-1">
            The requested course does not exist.
          </p>
        </div>
      </div>
    );
  }

  const approval = {
    ...original,
    approvalStatus: localStatus ?? original.approvalStatus,
  };
  const effectiveStatus = approval.approvalStatus;
  const isRejected = effectiveStatus === "Rejected";
  const currentStepIndex = isRejected
    ? -1
    : WORKFLOW_STEPS.indexOf(effectiveStatus as WorkflowStep);

  const canAct = effectiveStatus === "Pending Review";

  const handleCompleteReview = () => {
    setESignAction("complete-review");
    setShowesignModal(true);
  };

  const handleReject = () => {
    setESignAction("reject");
    setShowesignModal(true);
  };

  const handleESignConfirm = (reason: string) => {
    setIsSubmitting(true);
    setShowesignModal(false);

    setTimeout(() => {
      if (eSignAction === "complete-review") {
        setLocalStatus("Pending Approval");
      } else {
        setRejectionReason(reason);
        setLocalStatus("Rejected");
      }
      setIsSubmitting(false);
      setESignAction(null);
    }, 500);
  };

  const trainingFiles = approval.trainingFiles || [];

  const renderTabContent = () => {
    switch (activeTab) {
      case "basic-info":
        return (
          <BasicInfoTab
            readOnly
            courseId={approval.trainingId}
            title={approval.courseTitle}
            description={approval.description || ""}
            trainingType={(approval.trainingType as any) || "GMP"}
            trainingMethod={
              (approval.trainingMethod as any) || "Read & Understood"
            }
            instructorType={approval.instructorType || "internal"}
            instructor={approval.instructor || ""}
            scheduledDate={approval.scheduledDate || ""}
            duration={approval.duration || 0}
            location={approval.location || ""}
            capacity={approval.capacity || 0}
            recurrence={
              approval.recurrence || { enabled: false, intervalMonths: 0, warningPeriodDays: 0 }
            }
            linkedDocumentId={approval.relatedDocumentId || ""}
            linkedDocumentTitle={approval.relatedDocument || ""}
            evidenceFiles={[]}
          />
        );
      case "document-training":
        return (
          <DocumentTab
            readOnly
            trainingFiles={trainingFiles}
            instruction={approval.instruction || ""}
          />
        );
      case "training-config":
        return (
          <ConfigTab
            readOnly
            trainingMethod={
              (approval.trainingMethod as any) || "Read & Understood"
            }
            examTemplateName={approval.examTemplate}
            answerKeyName={approval.answerKey}
            passingGradeType={approval.passingGradeType}
            passingScore={approval.passScore}
            maxAttempts={approval.maxAttempts}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 w-full flex-1 flex flex-col">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3 lg:gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg md:text-xl lg:text-2xl font-bold tracking-tight text-slate-900">
              Pending Review
            </h1>
            <Breadcrumb items={coursePendingReview(navigate)} />
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline-emerald"
              size="sm"
              onClick={handleNavigateBack}
              className="whitespace-nowrap"
            >
              Cancel
            </Button>
            {canAct && (
              <>
                <Button
                  size="sm"
                  variant="outline-emerald"
                  onClick={handleReject}
                  disabled={isSubmitting}
                  className="whitespace-nowrap"
                >
                  <span className="hidden sm:inline">
                    {isSubmitting ? "Processing..." : "Reject"}
                  </span>
                  <span className="sm:hidden">
                    {isSubmitting ? "..." : "Reject"}
                  </span>
                </Button>
                <Button
                  size="sm"
                  variant="outline-emerald"
                  onClick={handleCompleteReview}
                  disabled={isSubmitting}
                  className="whitespace-nowrap gap-1.5"
                >
                  <span className="hidden sm:inline">
                    {isSubmitting ? "Processing..." : "Complete Review"}
                  </span>
                  <span className="sm:hidden">
                    {isSubmitting ? "..." : "Review"}
                  </span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Workflow Stepper */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
          <div className="flex items-stretch min-w-full">
            {WORKFLOW_STEPS.map((step, index) => {
              const isCompleted = !isRejected && index < currentStepIndex;
              const isCurrent = !isRejected && index === currentStepIndex;
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
                      isRejected
                        ? "bg-slate-100"
                        : isCompleted
                          ? "bg-emerald-100"
                          : isCurrent
                            ? "bg-emerald-600"
                            : "bg-slate-100",
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
                    {!isRejected && isCompleted && (
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    )}
                    <span
                      className={cn(
                        "text-xs md:text-sm font-medium text-center",
                        !isRejected && isCurrent
                          ? "text-white"
                          : !isRejected && isCompleted
                            ? "text-slate-700"
                            : "text-slate-400",
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
        {isRejected && (
          <div className="flex items-start gap-3 px-5 py-3.5 bg-red-50 border-t border-red-200">
            <XCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-800">
                Course Rejected
              </p>
              {rejectionReason && (
                <p className="text-xs text-red-700 mt-0.5 leading-relaxed">
                  {rejectionReason}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tab Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <TabNav tabs={TABS} activeTab={activeTab} onChange={(id) => setActiveTab(id as TabType)} />
        <div className="animate-in fade-in duration-200">
          {renderTabContent()}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center gap-2 md:gap-3 flex-wrap">
        <Button
          variant="outline-emerald"
          size="sm"
          onClick={handleNavigateBack}
          className="whitespace-nowrap"
        >
          Cancel
        </Button>
        {canAct && (
          <>
            <Button
              size="sm"
              variant="outline-emerald"
              onClick={handleReject}
              disabled={isSubmitting}
              className="whitespace-nowrap"
            >
              {isSubmitting ? "Processing..." : "Reject"}
            </Button>
            <Button
              size="sm"
              variant="outline-emerald"
              onClick={handleCompleteReview}
              disabled={isSubmitting}
              className="whitespace-nowrap gap-1.5"
            >
              {isSubmitting ? "Processing..." : "Complete Review"}
            </Button>
          </>
        )}
      </div>

      {/* E-Signature Modal */}
      <ESignatureModal
        isOpen={showesignModal}
        onClose={() => {
          setShowesignModal(false);
          setESignAction(null);
        }}
        onConfirm={handleESignConfirm}
        actionTitle={
          eSignAction === "complete-review"
            ? "Confirm Content Review"
            : "Reject Course"
        }
      />

      {/* ─── Loading Overlay ──────────────────────────────────── */}
      {(isSubmitting || isNavigating) && (
        <FullPageLoading text="Processing..." />
      )}
    </div>
  );
};



