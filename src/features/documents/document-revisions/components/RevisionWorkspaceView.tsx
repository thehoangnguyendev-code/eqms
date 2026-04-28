import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/app/routes.constants";
import {
  Check,
  AlertCircle,
  AlertTriangle,
  Layers,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import { cn } from "@/components/ui/utils";
import { TabNav } from "@/components/ui/tabs/TabNav";
import { ESignatureModal } from "@/components/ui/esign-modal/ESignatureModal";
import { AlertModal } from "@/components/ui/modal/AlertModal";
import { FullPageLoading } from "@/components/ui/loading/Loading";

// Import all workspace tabs from revision-tabs (single source of truth)
import {
  GeneralInformationTab,
  TrainingInformationTab,
  SignaturesTab,
  AuditTrailTab,
  DocumentTab,
  WorkingNotesTab,
  InfoFromDocumentTab,
  WorkspaceReviewersTab,
  WorkspaceApproversTab,
} from "../revision-tabs";
import { StatusBadge, StatusType } from "@/components/ui/badge/Badge";
import type { DocumentType, DocumentStatus } from "@/features/documents/types";
import { PageHeader } from "@/components/ui/page/PageHeader";
import { revisionWorkspace } from "@/components/ui/breadcrumb/breadcrumbs.config";

// --- Types ---
type ReviewFlowType = "sequential" | "parallel";

interface WorkspaceReviewer {
  id: string;
  name: string;
  signedOn?: string;
}

interface WorkspaceApprover {
  id: string;
  name: string;
  signedOn?: string;
}

type TabType =
  | "general"
  | "working-notes"
  | "info-from-doc"
  | "training"
  | "reviewers"
  | "approvers"
  | "document"
  | "signatures"
  | "audit";

interface WorkspaceDocument {
  id: string;
  code: string;
  name: string;
  type: "Form" | "Annex" | "Template" | "Reference";
  currentVersion: string;
  nextVersion: string;
  isUpgraded: boolean;
  formData: {
    title: string;
    type: DocumentType;
    author: string;
    coAuthors: (string | number)[];
    businessUnit: string;
    department: string;
    knowledgeBase: string;
    subType: string;
    periodicReviewCycle: number;
    periodicReviewNotification: number;
    language: string;
    reviewDate: string;
    description: string;
    isTemplate: boolean;
    titleLocalLanguage: string;
  };
}

interface LocationState {
  sourceDocument?: {
    code: string;
    name: string;
    version: string;
    type?: string;
    author?: string;
    coAuthors?: (string | number)[];
    businessUnit?: string;
    department?: string;
    knowledgeBase?: string;
    subType?: string;
    periodicReviewCycle?: number;
    periodicReviewNotification?: number;
    language?: string;
    reviewDate?: string;
    description?: string;
    isTemplate?: boolean;
    titleLocalLanguage?: string;
  };
  impactDecisions?: { [key: string]: boolean };
  linkedDocuments?: Array<{
    id: string;
    code: string;
    name: string;
    type: "Form" | "Annex" | "Template" | "Reference";
    currentVersion: string;
    nextVersion: string;
    author?: string;
    coAuthors?: (string | number)[];
    businessUnit?: string;
    department?: string;
    knowledgeBase?: string;
    subType?: string;
    periodicReviewCycle?: number;
    periodicReviewNotification?: number;
    language?: string;
    reviewDate?: string;
    description?: string;
    isTemplate?: boolean;
    titleLocalLanguage?: string;
  }>;
  revisionReviewers?: Array<{
    id: string;
    name: string;
    signedOn?: string;
  }>;
  revisionApprovers?: Array<{
    id: string;
    name: string;
    signedOn?: string;
  }>;
  reasonForChange?: string;
  isStandalone?: boolean;
  revisionId?: string;
  revisionCreated?: string;
  revisionOpenedBy?: string;
  revisionState?: string;
  documentAuthor?: string;
  documentStatus?: string;
  documentCreated?: string;
  revisionFile?: File | null;
  documentRevisions?: Array<{
    id: string;
    revisionNumber: string;
    created: string;
    openedBy: string;
    revisionName: string;
    state: "draft" | "pendingReview" | "approved" | "effective" | "obsolete";
  }>;
  documentNumber?: string;
  relationshipDocs?: any[];
  correlatedDocuments?: any[];
  revisionNumber?: string;
}

export const RevisionWorkspaceView: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const { user } = useAuth();
  const currentUserName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : "—";

  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [currentDocIndex, setCurrentDocIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isESignOpen, setIsESignOpen] = useState(false);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [validationModalMessage, setValidationModalMessage] =
    useState<React.ReactNode>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isUploadedToOffice, setIsUploadedToOffice] = useState(false);

  // Reviewers & Approvers state (workspace-owned)
  const [workspaceReviewers, setWorkspaceReviewers] = useState<
    WorkspaceReviewer[]
  >(state?.revisionReviewers || []);
  const [workspaceApprovers, setWorkspaceApprovers] = useState<
    WorkspaceApprover[]
  >(state?.revisionApprovers || []);
  const [reviewFlowType, setReviewFlowType] =
    useState<ReviewFlowType>("parallel");

  // Initialize workspace documents from Impact Analysis decisions
  const [workspaceDocuments, setWorkspaceDocuments] = useState<
    WorkspaceDocument[]
  >([]);

  useEffect(() => {
    if (state?.sourceDocument) {
      const documents: WorkspaceDocument[] = [];

      // Switch case để xử lý standalone vs parent-child
      switch (state.isStandalone) {
        case true:
          // CASE 1: Standalone Document (1 tài liệu duy nhất)
          documents.push({
            id: `source-${state.sourceDocument.code}`,
            code: state.sourceDocument.code,
            name: state.sourceDocument.name,
            type: "Form", // Default type
            currentVersion: state.sourceDocument.version,
            nextVersion: incrementVersion(state.sourceDocument.version),
            isUpgraded: true,
            formData: {
              title: state.sourceDocument.name,
              type: (state.sourceDocument.type || "SOP") as DocumentType,
              author: state.sourceDocument.author || "",
              coAuthors: state.sourceDocument.coAuthors || [],
              businessUnit: state.sourceDocument.businessUnit || "",
              department: state.sourceDocument.department || "",
              knowledgeBase: state.sourceDocument.knowledgeBase || "",
              subType: state.sourceDocument.subType || "-- None --",
              periodicReviewCycle: state.sourceDocument.periodicReviewCycle || 24,
              periodicReviewNotification: state.sourceDocument.periodicReviewNotification || 14,
              language: state.sourceDocument.language || "English",
              reviewDate: state.sourceDocument.reviewDate || "",
              description: state.sourceDocument.description || "",
              isTemplate: state.sourceDocument.isTemplate || false,
              titleLocalLanguage: state.sourceDocument.titleLocalLanguage || "",
            },
          });
          break;

        case false:
        default:
          // CASE 2: Parent-Child Documents (nhiều tài liệu liên kết)
          // Add Source Document (always included)
          documents.push({
            id: `source-${state.sourceDocument.code}`,
            code: state.sourceDocument.code,
            name: state.sourceDocument.name,
            type: "Form", // Default type, can be adjusted
            currentVersion: state.sourceDocument.version,
            nextVersion: incrementVersion(state.sourceDocument.version),
            isUpgraded: true,
            formData: {
              title: state.sourceDocument.name,
              type: (state.sourceDocument.type || "SOP") as DocumentType,
              author: state.sourceDocument.author || "",
              coAuthors: state.sourceDocument.coAuthors || [],
              businessUnit: state.sourceDocument.businessUnit || "",
              department: state.sourceDocument.department || "",
              knowledgeBase: state.sourceDocument.knowledgeBase || "",
              subType: state.sourceDocument.subType || "-- None --",
              periodicReviewCycle: state.sourceDocument.periodicReviewCycle || 24,
              periodicReviewNotification: state.sourceDocument.periodicReviewNotification || 14,
              language: state.sourceDocument.language || "English",
              reviewDate: state.sourceDocument.reviewDate || "",
              description: state.sourceDocument.description || "",
              isTemplate: state.sourceDocument.isTemplate || false,
              titleLocalLanguage: state.sourceDocument.titleLocalLanguage || "",
            },
          });

          // Add upgraded linked documents (if any)
          if (state.linkedDocuments && state.impactDecisions) {
            const upgradedDocs = state.linkedDocuments
              .filter((doc) => state.impactDecisions![doc.id])
              .map((doc) => ({
                id: doc.id,
                code: doc.code,
                name: doc.name,
                type: doc.type,
                currentVersion: doc.currentVersion,
                nextVersion: doc.nextVersion,
                isUpgraded: true,
                formData: {
                  title: doc.name,
                  type: "SOP" as DocumentType,
                  author: doc.author || "",
                  coAuthors: doc.coAuthors || [],
                  businessUnit: doc.businessUnit || "",
                  department: doc.department || "",
                  knowledgeBase: doc.knowledgeBase || "",
                  subType: doc.subType || "-- None --",
                  periodicReviewCycle: doc.periodicReviewCycle || 24,
                  periodicReviewNotification: doc.periodicReviewNotification || 14,
                  language: doc.language || "English",
                  reviewDate: doc.reviewDate || "",
                  description: doc.description || "",
                  isTemplate: doc.isTemplate || false,
                  titleLocalLanguage: doc.titleLocalLanguage || "",
                },
              }));
            documents.push(...upgradedDocs);
          }
          break;
      }

      setWorkspaceDocuments(documents);
    }
  }, [state]);

  // Helper function to increment version
  const incrementVersion = (version: string): string => {
    const parts = version.split(".");
    if (parts.length > 0) {
      const lastPart = parseInt(parts[parts.length - 1]);
      parts[parts.length - 1] = String(lastPart + 1);
      return parts.join(".");
    }
    return version;
  };

  const currentDocument = workspaceDocuments[currentDocIndex];

  // File is already uploaded via UploadRevisionModal before navigating here
  const allFilesUploaded = !!state?.revisionFile;

  // Check if current document has all required fields
  const isCurrentDocumentValid = useMemo(() => {
    if (!currentDocument) return false;
    const formData = currentDocument.formData;

    const hasAuthor = Boolean(String(formData.author ?? "").trim());

    return !!(
      String(formData.title ?? "").trim() &&
      String(formData.type ?? "").trim() &&
      hasAuthor &&
      String(formData.businessUnit ?? "").trim() &&
      Number.isFinite(formData.periodicReviewCycle) &&
      formData.periodicReviewCycle > 0 &&
      Number.isFinite(formData.periodicReviewNotification) &&
      formData.periodicReviewNotification > 0
    );
  }, [currentDocument]);

  const missingRequiredFields = useMemo(() => {
    if (!currentDocument) return [];
    const missing: string[] = [];
    const formData = currentDocument.formData;

    const hasAuthor = Boolean(String(formData.author ?? "").trim());

    if (!String(formData.title ?? "").trim()) missing.push("Document Name");
    if (!String(formData.type ?? "").trim()) missing.push("Document Type");
    if (!hasAuthor) missing.push("Author");
    if (!String(formData.businessUnit ?? "").trim())
      missing.push("Business Unit");
    if (
      !Number.isFinite(formData.periodicReviewCycle) ||
      formData.periodicReviewCycle <= 0
    ) {
      missing.push("Periodic Review Cycle (Months)");
    }
    if (
      !Number.isFinite(formData.periodicReviewNotification) ||
      formData.periodicReviewNotification <= 0
    ) {
      missing.push("Periodic Review Notification (Days)");
    }
    return missing;
  }, [currentDocument]);

  const validateOrWarn = () => {
    if (missingRequiredFields.length === 0) return true;

    setValidationModalMessage(
      <div className="space-y-2">
        <p>
          Please fill in all required fields for{" "}
          <strong>{currentDocument?.name}</strong> before proceeding:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          {missingRequiredFields.map((field) => (
            <li key={field}>{field}</li>
          ))}
        </ul>
      </div>,
    );
    setIsValidationModalOpen(true);
    return false;
  };

  const handleBack = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelModal(false);
    setIsNavigating(true);
    setTimeout(() => {
      navigate(ROUTES.DOCUMENTS.REVISIONS.ALL);
    }, 600);
  };

  const handleBackToImpactAnalysis = () => {
    setIsNavigating(true);
    setTimeout(() => {
      // Navigate back based on document type
      if (state?.isStandalone) {
        // Standalone: Navigate back to StandaloneRevisionView
        navigate(
          `/documents/revisions/standalone?sourceDocId=${state.sourceDocument?.code}`,
          {
            state: {
              sourceDocument: state.sourceDocument,
              reasonForChange: state.reasonForChange,
            },
          },
        );
      } else {
        // Parent-Child: Navigate back to Impact Analysis
        navigate(ROUTES.DOCUMENTS.REVISIONS.NEW, {
          state: {
            sourceDocument: state?.sourceDocument,
            impactDecisions: state?.impactDecisions,
            linkedDocuments: state?.linkedDocuments,
            reasonForChange: state?.reasonForChange,
          },
        });
      }
    }, 600);
  };

  const handleFormChange = (newFormData: typeof currentDocument.formData) => {
    setWorkspaceDocuments((prev) =>
      prev.map((doc, idx) =>
        idx === currentDocIndex ? { ...doc, formData: newFormData } : doc,
      ),
    );
  };

  const handleSave = () => {
    if (!validateOrWarn()) return;
    setShowSaveModal(true);
  };

  const handleConfirmSave = async () => {
    setShowSaveModal(false);
    setIsSaving(true);
    try {
      // Simulate save operation
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // TODO: Integrate with API service

      navigate(ROUTES.DOCUMENTS.REVISIONS.ALL);
    } catch (error) {
      console.error("Error saving revision workspace:", error);
      setIsSaving(false);
    }
  };

  const handleSubmitForReview = () => {
    // Validate all documents
    for (let i = 0; i < workspaceDocuments.length; i++) {
      setCurrentDocIndex(i);
      if (!validateOrWarn()) return;
    }
    setIsESignOpen(true);
  };

  const handleESignConfirm = async (reason: string) => {
    setIsESignOpen(false);
    setIsSubmitting(true);
    try {
      // TODO: Integrate with API service
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // In a real app, this would update the backend status to 'Pending Review'
      navigate(ROUTES.DOCUMENTS.REVISIONS.ALL, {
        state: {
          from: location.pathname,
          submissionSuccess: true,
          newStatus: "Pending Review"
        }
      });
    } catch (error) {
      console.error("Error submitting revision:", error);
      setIsSubmitting(false);
    }
  };

  const handleUploadToOffice = () => {
    setIsUploadedToOffice(true);
    window.open("https://office.com", "_blank");
  };

  const handleNextDocument = () => {
    // Validate current document before moving to next
    if (!isCurrentDocumentValid) {
      setValidationModalMessage(
        <div className="space-y-2">
          <p>Please fill in all required fields before proceeding:</p>
          <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
            {missingRequiredFields.map((field) => (
              <li key={field}>{field}</li>
            ))}
          </ul>
        </div>,
      );
      setIsValidationModalOpen(true);
      return;
    }

    if (currentDocIndex < workspaceDocuments.length - 1) {
      setCurrentDocIndex((prev) => prev + 1);
      // Stay on general tab for data entry
    }
  };

  const handlePreviousDocument = () => {
    if (currentDocIndex > 0) {
      setCurrentDocIndex((prev) => prev - 1);
      // Stay on general tab for data entry
    }
  };

  // Status workflow steps
  const statusSteps: DocumentStatus[] = [
    "Draft",
    "Pending Review",
    "Pending Approval",
    "Pending Training",
    "Ready for Publishing",
    "Effective",
    "Obsoleted",
    "Closed - Cancelled",
  ];
  const currentStepIndex = 0; // Always "Draft" for new revisions

  const tabs = [
    { id: "general" as TabType, label: "General Information" },
    { id: "working-notes" as TabType, label: "Working Notes" },
    { id: "info-from-doc" as TabType, label: "Information from Document" },
    { id: "training" as TabType, label: "Training Information" },
    { id: "reviewers" as TabType, label: "Reviewers" },
    { id: "approvers" as TabType, label: "Approvers" },
    { id: "document" as TabType, label: "Document" },
    { id: "signatures" as TabType, label: "Signatures" },
    { id: "audit" as TabType, label: "Audit Trail" },
  ];

  if (workspaceDocuments.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-semibold text-slate-900">
            No Documents to Process
          </h2>
          <p className="text-slate-600">
            Please go back and complete the Impact Analysis.
          </p>
          <Button
            onClick={handleBack}
            variant="outline"
            size="sm"
            className="whitespace-nowrap !border-emerald-600 !text-emerald-600 hover:!bg-emerald-50"
          >
            Back to Revisions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {(isSaving || isSubmitting || isNavigating) && <FullPageLoading text="Processing..." />}
      {/* Header: Title + Breadcrumb + Actions */}
      <div className="flex flex-col gap-4">
        <PageHeader
          title="Revision Workspace"
          breadcrumbItems={revisionWorkspace(navigate)}
          actions={
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-start">
              <Button
                onClick={handleBack}
                variant="outline"
                size="sm"
                className="whitespace-nowrap !border-emerald-600 !text-emerald-600 hover:!bg-emerald-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || isSubmitting || !allFilesUploaded}
                variant="outline"
                size="sm"
                className="whitespace-nowrap !border-emerald-600 !text-emerald-600 hover:!bg-emerald-50 disabled:!border-slate-300 disabled:!text-slate-400 disabled:hover:!bg-transparent"
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="whitespace-nowrap !border-emerald-600 !text-emerald-600 hover:!bg-emerald-50"
                onClick={handleUploadToOffice}
              >
                {isUploadedToOffice ? "Edit File Online" : "Upload To Microsoft Office Online"}
              </Button>
              <div className="w-px h-8 bg-slate-300 mx-1" />
              <Button
                onClick={handleSubmitForReview}
                disabled={isSaving || isSubmitting}
                variant="outline"
                size="sm"
                className="whitespace-nowrap !border-emerald-600 !text-emerald-600 hover:!bg-emerald-50 disabled:!border-slate-300 disabled:!text-slate-400 disabled:hover:!bg-transparent"
              >
                {isSubmitting ? "Submitting..." : "Submit for Review"}
              </Button>
            </div>
          }
        />
      </div>

      {/* Status Stepper */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
          <div className="flex items-stretch min-w-full">
            {statusSteps.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isFirst = index === 0;
              const isLast = index === statusSteps.length - 1;

              return (
                <div
                  key={step}
                  className="relative flex-1 flex items-center justify-center min-w-[150px]"
                  style={{ minHeight: "60px" }}
                >
                  {/* Arrow Shape Background */}
                  <div
                    className={cn(
                      "absolute inset-0 transition-all",
                      isCompleted
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

                  {/* Content */}
                  <div className="relative z-10 flex items-center gap-2 px-6">
                    {isCompleted && (
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    )}
                    <span
                      className={cn(
                        "text-xs md:text-sm font-medium text-center",
                        isCurrent
                          ? "text-white"
                          : isCompleted
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

        {/* Modals */}
        <ESignatureModal
          isOpen={isESignOpen}
          onClose={() => {
            if (isSubmitting) return;
            setIsESignOpen(false);
          }}
          onConfirm={handleESignConfirm}
          actionTitle="Submit for Review"
          documentDetails={{
            code: state?.documentNumber || currentDocument?.code,
            title: currentDocument?.name,
            revision: state?.revisionNumber || "0.0.1",
          }}
          changes={[
            {
              action: "Status",
              oldValue: "Draft",
              newValue: "Pending Review",
              category: "status",
            },
          ]}
        />

        <AlertModal
          isOpen={isValidationModalOpen}
          onClose={() => setIsValidationModalOpen(false)}
          type="warning"
          title="Missing required information"
          description={validationModalMessage}
          confirmText="OK"
          showCancel={false}
        />

        {/* Cancel Confirmation Modal */}
        <AlertModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleConfirmCancel}
          type="warning"
          title="Cancel Revision Workspace?"
          description={
            <div className="space-y-3">
              <p>
                Are you sure you want to cancel and exit the Revision Workspace?
              </p>
              <div className="text-xs bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-1">
                <p className="text-amber-800">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600 inline shrink-0" />{" "}
                  <span className="font-semibold">Warning:</span> All unsaved
                  changes will be lost.
                </p>
                <p>
                  <span className="font-semibold">Documents in Progress:</span>{" "}
                  {workspaceDocuments.length} document(s)
                </p>
                {state?.reasonForChange && (
                  <p>
                    <span className="font-semibold">Draft Reason:</span>{" "}
                    {state.reasonForChange.length} characters
                  </p>
                )}
              </div>
              <p className="text-xs text-slate-500">
                You will be redirected back to the All Revisions screen.
              </p>
            </div>
          }
          confirmText="Yes, Cancel"
          cancelText="No, Stay"
          showCancel={true}
        />

        {/* Save Draft Confirmation Modal */}
        <AlertModal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          onConfirm={handleConfirmSave}
          type="confirm"
          title="Save All Documents?"
          description={
            <div className="space-y-3">
              <p>
                Are you sure you want to save all documents in the workspace as
                drafts?
              </p>
              <div className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1">
                {state?.sourceDocument && (
                  <p>
                    <span className="font-semibold">Source Document:</span>{" "}
                    {state.sourceDocument.code}
                  </p>
                )}
                <p>
                  <span className="font-semibold">Total Documents:</span>{" "}
                  {workspaceDocuments.length}
                </p>
                <p>
                  <span className="font-semibold">Current Progress:</span>{" "}
                  Document {currentDocIndex + 1} of {workspaceDocuments.length}
                </p>
              </div>
              <p className="text-xs text-slate-500">
                You can continue editing these drafts later from the All
                Revisions screen.
              </p>
            </div>
          }
          confirmText="Save All"
          cancelText="Cancel"
          showCancel={true}
        />
      </div>
      {/* Tab Navigation */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <TabNav tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as TabType)} />

        {/* Tab Content */}
        <div className="p-4 md:p-5">
          {activeTab === "document" && (
            <DocumentTab
              mode="view"
              selectedFile={state?.revisionFile ?? null}
            />
          )}

          {activeTab === "general" && currentDocument && (
            <div className="space-y-4 lg:space-y-6">
              {/* Current Document Context */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4 md:p-5">
                <div className="flex items-start justify-between gap-3 lg:gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base lg:text-lg font-semibold text-slate-900 mb-1.5 lg:mb-2">
                      Editing: {currentDocument.code}
                    </h3>
                    <p className="text-xs lg:text-sm text-slate-600 mb-1.5 lg:mb-2 truncate">
                      {currentDocument.name}
                    </p>
                    {state?.revisionFile && (
                      <div className="flex items-center gap-1.5 lg:gap-2 text-xs lg:text-sm">
                        <FileText className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-blue-600 shrink-0" />
                        <span className="text-blue-700 font-medium truncate">
                          File: {state.revisionFile.name}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs lg:text-sm text-slate-600">
                      Document
                    </div>
                    <div className="text-xl lg:text-2xl font-bold text-slate-900 whitespace-nowrap">
                      {currentDocIndex + 1} / {workspaceDocuments.length}
                    </div>
                  </div>
                </div>
              </div>

              <GeneralInformationTab
                document={{
                  documentId: state?.revisionId ?? "",
                  title: currentDocument.formData.title,
                  type: currentDocument.formData.type,
                  created: state?.revisionCreated ?? "",
                  openedBy: state?.revisionOpenedBy ?? currentUserName,
                  author: String(currentDocument.formData.author ?? ""),
                  coAuthors: currentDocument.formData.coAuthors || [],
                  isTemplate: currentDocument.formData.isTemplate,
                  businessUnit: currentDocument.formData.businessUnit,
                  department: currentDocument.formData.department,
                  knowledgeBase: currentDocument.formData.knowledgeBase,
                  subType: currentDocument.formData.subType,
                  periodicReviewCycle:
                    currentDocument.formData.periodicReviewCycle,
                  periodicReviewNotification:
                    currentDocument.formData.periodicReviewNotification,
                  effectiveDate: "",
                  validUntil: "",
                  language: currentDocument.formData.language,
                  description: currentDocument.formData.description,
                  titleLocalLanguage:
                    currentDocument.formData.titleLocalLanguage,
                }}
              />

              {/* Navigation Buttons - only show if multiple documents */}
              {workspaceDocuments.length > 1 && (
                <div className="flex items-center justify-between gap-2 pt-4 md:pt-6 border-t border-slate-200">
                  <Button
                    onClick={handlePreviousDocument}
                    disabled={currentDocIndex === 0}
                    variant="outline"
                    size="sm"
                    className="flex items-center justify-center gap-1.5 touch-manipulation"
                  >
                    <span className="text-xs md:text-sm">Previous</span>
                  </Button>

                  {/* Warning message in center */}
                  {missingRequiredFields.length > 0 && (
                    <div className="text-xs md:text-sm text-amber-600 flex items-center gap-1.5 px-2 md:px-3 py-1.5 md:py-2 bg-amber-50 rounded-lg">
                      <span className="hidden sm:inline">
                        {missingRequiredFields.length} required field(s) missing
                      </span>
                      <span className="sm:hidden">
                        {missingRequiredFields.length} missing
                      </span>
                    </div>
                  )}

                  {currentDocIndex < workspaceDocuments.length - 1 ? (
                    <Button
                      onClick={handleNextDocument}
                      variant="default"
                      size="sm"
                      className="flex items-center justify-center gap-1.5 touch-manipulation"
                    >
                      <span className="text-xs md:text-sm">Next</span>
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setActiveTab("training")}
                      variant="default"
                      size="sm"
                      disabled={!isCurrentDocumentValid}
                      className="flex items-center justify-center gap-1.5 touch-manipulation"
                    >
                      <span className="text-xs md:text-sm">Continue</span>
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "training" && <TrainingInformationTab />}

          {activeTab === "working-notes" && <WorkingNotesTab />}

          {activeTab === "info-from-doc" && (
            <InfoFromDocumentTab
              documentCode={state?.sourceDocument?.code}
              documentName={state?.sourceDocument?.name}
              documentType={state?.sourceDocument?.type}
              documentVersion={state?.sourceDocument?.version}
              documentStatus={state?.documentStatus}
              documentAuthor={state?.documentAuthor}
              documentCreated={state?.documentCreated}
              reasonForChange={state?.reasonForChange}
            />
          )}

          {activeTab === "reviewers" && (
            <WorkspaceReviewersTab reviewers={workspaceReviewers} />
          )}

          {activeTab === "approvers" && (
            <WorkspaceApproversTab approvers={workspaceApprovers} />
          )}

          {activeTab === "document" && (
            <DocumentTab
              mode="view"
              selectedFile={state?.revisionFile}
              uploadedFiles={state?.revisionFile ? [{
                id: "initial-revision",
                file: state.revisionFile,
                progress: 100,
                status: "success"
              }] : []}
            />
          )}

          {activeTab === "signatures" && <SignaturesTab />}

          {activeTab === "audit" && <AuditTrailTab />}
        </div>
      </div>

      {/* Action Buttons below tab card */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={handleBack}
          variant="outline"
          size="sm"
          className="whitespace-nowrap !border-emerald-600 !text-emerald-600 hover:!bg-emerald-50"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSaving || isSubmitting || !allFilesUploaded}
          variant="outline"
          size="sm"
          className="whitespace-nowrap !border-emerald-600 !text-emerald-600 hover:!bg-emerald-50 disabled:!border-slate-300 disabled:!text-slate-400 disabled:hover:!bg-transparent"
        >
          {isSaving ? "Saving..." : "Save"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="whitespace-nowrap !border-emerald-600 !text-emerald-600 hover:!bg-emerald-50"
          onClick={handleUploadToOffice}
        >
          {isUploadedToOffice ? "Edit File Online" : "Upload To Microsoft Office Online"}
        </Button>
        <div className="w-px h-8 bg-slate-300 mx-1" />
        <Button
          onClick={handleSubmitForReview}
          disabled={isSaving || isSubmitting}
          variant="outline"
          size="sm"
          className="whitespace-nowrap !border-emerald-600 !text-emerald-600 hover:!bg-emerald-50 disabled:!border-slate-300 disabled:!text-slate-400 disabled:hover:!bg-transparent"
        >
          {isSubmitting ? "Submitting..." : "Submit for Review"}
        </Button>
      </div>

      {/* Documents Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
          <span className="text-emerald-600">
            <Layers className="h-4 w-4" />
          </span>
          <h3 className="text-sm font-semibold text-slate-800">
            Documents in Workspace
          </h3>
        </div>
        <div className="p-4 md:p-5">
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-slate-50/10">
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-50">
              <table className="w-full border-separate border-spacing-0">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="py-3 px-4 text-left text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 w-12 whitespace-nowrap">
                      No.
                    </th>
                    <th className="py-3 px-4 text-left text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 whitespace-nowrap">
                      Document Number
                    </th>
                    <th className="py-3 px-4 text-left text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 hidden md:table-cell whitespace-nowrap">
                      Created
                    </th>
                    <th className="py-3 px-4 text-left text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 hidden md:table-cell whitespace-nowrap">
                      Opened by
                    </th>
                    <th className="py-3 px-4 text-left text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 whitespace-nowrap">
                      Document Name
                    </th>
                    <th className="py-3 px-4 text-left text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 whitespace-nowrap">
                      State
                    </th>
                    <th className="py-3 px-4 text-left text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 hidden lg:table-cell whitespace-nowrap">
                      Author
                    </th>
                    <th className="py-3 px-4 text-left text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 hidden lg:table-cell whitespace-nowrap">
                      Valid Until
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {workspaceDocuments.length > 0 ? (
                    workspaceDocuments.map((doc, index) => (
                      <tr
                        key={doc.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        <td className="py-3 px-4 text-xs md:text-sm text-slate-500 font-medium whitespace-nowrap">
                          {index + 1}
                        </td>
                        <td className="py-3 px-4 text-xs md:text-sm whitespace-nowrap">
                          <button
                            onClick={() => {
                              setIsNavigating(true);
                              setTimeout(() => navigate(ROUTES.DOCUMENTS.NEW, {
                                state: {
                                  from: location.pathname,
                                  workspaceState: state,
                                  documentData: {
                                    formData: doc.formData,
                                    status: "Active",
                                    isSaved: true,
                                    documentNumber: state?.documentNumber || doc.code,
                                    createdDateTime: state?.documentCreated || state?.revisionCreated || "",
                                    reviewers: workspaceReviewers.map(r => ({
                                      id: r.id,
                                      name: r.name,
                                      role: "",
                                      email: "",
                                      department: "",
                                      order: 0,
                                    })),
                                    approvers: workspaceApprovers.map(a => ({
                                      id: a.id,
                                      name: a.name,
                                      role: "",
                                      email: "",
                                      department: "",
                                    })),
                                    revisions: state?.documentRevisions || [],
                                    isRevisionUploaded: true,
                                    relationshipDocs: state?.relationshipDocs || [],
                                    correlatedDocuments: state?.correlatedDocuments || [],
                                    revisionFile: state?.revisionFile || null,
                                  }
                                }
                              }), 600);
                            }}
                            className="font-medium text-emerald-600 ld-600 hover:text-emerald-700 hover:underline underline-offset-4 decoration-2 transition-all cursor-pointer"
                          >
                            {doc.code}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-xs md:text-sm text-slate-600 hidden md:table-cell whitespace-nowrap">
                          {state?.documentCreated || state?.revisionCreated || "—"}
                        </td>
                        <td className="py-3 px-4 text-xs md:text-sm text-slate-600 hidden md:table-cell whitespace-nowrap">
                          {currentUserName}
                        </td>
                        <td className="py-3 px-4 text-xs md:text-sm text-slate-700 font-medium whitespace-nowrap">
                          {doc.name}
                        </td>
                        <td className="py-3 px-4 text-xs md:text-sm whitespace-nowrap">
                          <StatusBadge
                            status={(state?.documentStatus?.toLowerCase().replace(/\s+/g, '') as StatusType) || "draft"}
                            size="sm"
                          />
                        </td>
                        <td className="py-3 px-4 text-xs md:text-sm text-slate-600 hidden lg:table-cell whitespace-nowrap">
                          {state?.documentAuthor || "—"}
                        </td>
                        <td className="py-3 px-4 text-xs md:text-sm text-slate-600 hidden lg:table-cell whitespace-nowrap">
                          —
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-12 text-center bg-slate-50/50 whitespace-nowrap">
                        <p className="text-sm text-slate-500 font-medium italic">
                          No documents in workspace.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



