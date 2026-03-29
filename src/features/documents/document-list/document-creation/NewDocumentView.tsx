import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/app/routes.constants";
import { Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import { cn } from "@/components/ui/utils";
import { TabNav } from "@/components/ui/tabs/TabNav";
import { AlertModal } from "@/components/ui/modal/AlertModal";
import { FullPageLoading } from "@/components/ui/loading/Loading";
import { FormModal } from "@/components/ui/modal/FormModal";
import { ESignatureModal } from "@/components/ui/esign-modal/ESignatureModal";
import { UploadRevisionModal } from "./modals/UploadRevisionModal";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/toast";
import { useNavigateWithLoading } from "@/hooks";
import {
  TrainingTab,
  SignaturesTab,
  AuditTab,
} from "@/features/documents/shared/tabs";
import {
  DocumentRevisionsTab,
  ReviewersTab,
  ApproversTab,
  ControlledCopiesTab,
  RelatedDocumentsTab,
  CorrelatedDocumentsTab,
  DocumentRelationships,
  type ParentDocument,
  type RelatedDocument,
  type Revision,
} from "@/features/documents/shared/tabs/general-tab/subtabs";
import {
  GeneralTab,
  DocumentTab,
  type UploadedFile,
} from "@/features/documents/document-list/document-creation/new-tabs";
import type { DocumentType, DocumentStatus } from "@/features/documents/types";
import { Breadcrumb } from "@/components/ui/breadcrumb/Breadcrumb";
import { newDocument } from "@/components/ui/breadcrumb/breadcrumbs.config";

// --- Types ---
type TabType = "general" | "training" | "document" | "signatures" | "audit";
type SubTabId =
  | "revisions"
  | "reviewers"
  | "approvers"
  | "copies"
  | "related"
  | "correlated";
type ReviewFlowType = "sequential" | "parallel";

interface Reviewer {
  id: string;
  name: string;
  role: string;
  email: string;
  department: string;
  order: number;
}

interface Approver {
  id: string;
  name: string;
  role: string;
  email: string;
  department: string;
}

export const NewDocumentView: React.FC = () => {
  const { navigateTo, isNavigating } = useNavigateWithLoading();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [isSaving, setIsSaving] = useState(false);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [validationModalMessage, setValidationModalMessage] =
    useState<React.ReactNode>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelActivitySummary, setCancelActivitySummary] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isObsoleteModalOpen, setIsObsoleteModalOpen] = useState(false);
  const [isUploadRevisionModalOpen, setIsUploadRevisionModalOpen] =
    useState(false);
  const [isSaved, setIsSaved] = useState(false); // Track if document has been saved
  const [isRevisionUploaded, setIsRevisionUploaded] = useState(false); // Track if revision was uploaded
  const [uploadedRevisionFile, setUploadedRevisionFile] = useState<File | null>(
    null,
  ); // Store uploaded revision file
  const [documentStatus, setDocumentStatus] = useState<DocumentStatus>("Draft"); // Track current document status

  // Subtab states
  const [activeSubtab, setActiveSubtab] = useState<SubTabId>("revisions");
  const [isReviewerModalOpen, setIsReviewerModalOpen] = useState(false);
  const [isApproverModalOpen, setIsApproverModalOpen] = useState(false);
  const [isRelatedModalOpen, setIsRelatedModalOpen] = useState(false);
  const [isCorrelatedModalOpen, setIsCorrelatedModalOpen] = useState(false);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [reviewFlowType, setReviewFlowType] =
    useState<ReviewFlowType>("parallel");
  // Initial mock data for testing
  const [relationshipDocs, setRelationshipDocs] = useState<RelatedDocument[]>([
    {
      id: "1",
      documentNumber: "DOC-2024-002",
      created: "2024-01-10",
      openedBy: "John Doe",
      documentName: "Quality Control Procedures",
      state: "effective",
      documentType: "SOP",
      department: "Quality Assurance",
      authorCoAuthor: "John Doe, Jane Smith",
      effectiveDate: "2024-02-01",
      validUntil: "2025-02-01",
    },
    {
      id: "2",
      documentNumber: "DOC-2024-003",
      created: "2024-01-15",
      openedBy: "Jane Smith",
      documentName: "Manufacturing Guidelines",
      state: "approved",
      documentType: "WI",
      department: "Production",
      authorCoAuthor: "Jane Smith",
      effectiveDate: "2024-03-01",
      validUntil: "2025-03-01",
    },
  ]);

  // Auto-generated fields
  const [documentNumber, setDocumentNumber] = useState<string>("");
  const [createdDateTime, setCreatedDateTime] = useState<string>("");

  // Set openedBy immediately with current user fullname
  const [openedBy] = useState<string>(
    user ? `${user.firstName} ${user.lastName}`.trim() : "Current User",
  );

  // Reviewers and Approvers state
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [approvers, setApprovers] = useState<Approver[]>([]);

  // File state
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Document Relationships state
  // Initial mock data for testing
  const [parentDocument, setParentDocument] = useState<ParentDocument | null>({
    id: "1",
    documentNumber: "DOC-2024-005",
    created: "2024-01-05",
    openedBy: "Alice Brown",
    documentName: "Equipment Maintenance Schedule",
    state: "effective",
    documentType: "Schedule",
    department: "Maintenance",
    authorCoAuthor: "Alice Brown",
    effectiveDate: "2024-01-15",
    validUntil: "2025-01-15",
  });
  const [suggestedDocumentCode, setSuggestedDocumentCode] =
    useState<string>("");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    type: "" as DocumentType,
    author: "",
    coAuthors: [] as (string | number)[],
    businessUnit: "",
    department: "",
    knowledgeBase: "",
    subType: "",
    periodicReviewCycle: 0,
    periodicReviewNotification: 0,
    language: "English",
    reviewDate: "",
    description: "",
    isTemplate: false,
    titleLocalLanguage: "",
  });

  // Calculate current step index based on document status
  // Document starts in Draft and requires workflow completion to move to Active
  const currentStepIndex = useMemo(() => {
    const statusSteps: DocumentStatus[] = [
      "Draft",
      "Active",
      "Obsoleted",
      "Closed - Cancelled",
    ];
    return statusSteps.indexOf(documentStatus);
  }, [documentStatus]);

  const missingRequiredFields = useMemo(() => {
    const missing: string[] = [];
    if (!formData.title.trim()) missing.push("Document Name");
    if (!String(formData.type || "").trim()) missing.push("Document Type");
    if (!formData.author || formData.author.length === 0)
      missing.push("Authors");
    if (!formData.businessUnit.trim()) missing.push("Business Unit");
    if (!formData.description.trim()) missing.push("Description");
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
  }, [
    formData.title,
    formData.type,
    formData.author,
    formData.businessUnit,
    formData.description,
    formData.periodicReviewCycle,
    formData.periodicReviewNotification,
  ]);

  const handleCancel = () => {
    setIsCancelModalOpen(true);
  };

  const handleCancelConfirm = () => {
    // Close modal first
    setIsCancelModalOpen(false);
    setIsSaving(true);

    setTimeout(() => {
      // Update document status to Closed - Cancelled
      setDocumentStatus("Closed - Cancelled");

      // Show toast notification
      showToast({
        type: "success",
        title: "Document Cancelled",
        message: "The document has been moved to Closed - Cancelled status.",
        duration: 3000,
      });

      // Reset activity summary for next use
      setCancelActivitySummary("");
      setIsSaving(false);
    }, 600);
  };

  const handleSaveDraft = () => {
    setShowSaveModal(true);
  };

  const handleConfirmSave = async () => {
    setShowSaveModal(false);
    setIsSaving(true);
    try {
      // Simulate API call with 3 second loading
      await new Promise((resolve) => setTimeout(resolve, 3000));

      if (!isSaved) {
        // First save (Next Step): Generate auto fields
        const now = new Date();
        const docNum = `DOC-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
        const created = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

        setDocumentNumber(docNum);
        setCreatedDateTime(created);
        // openedBy is already set from user context on component mount
        setIsSaved(true);
      } else {
        // Second save: keep document in Draft status
        // Document remains in Draft until it goes through review/approval workflow
      }

      setIsSaving(false);
      setShowSaveModal(false);
    } catch (error) {
      console.error("Error saving document:", error);
      setIsSaving(false);
    }
  };

  const handleObsolete = (reason: string) => {
    // TODO: Integrate with API - save obsolete reason
    setDocumentStatus("Obsoleted");
  };

  const handleBackToList = () => {
    navigateTo(ROUTES.DOCUMENTS.ALL);
  };

  const handleUploadRevision = (
    file: File,
    note: string,
    useTemplate: boolean,
  ) => {
    // Generate new revision
    const now = new Date();
    const revisionNumber = `0.0.1`; // Always 0.0.1 for new document
    const created = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

    const newRevision: Revision = {
      id: `rev-${Date.now()}`,
      revisionNumber,
      created,
      openedBy: user?.username || "Unknown User",
      revisionName: note || file.name,
      state: "draft",
    };

    // Keep only the latest revision for new document
    setRevisions([newRevision]);

    // Move document to Active status
    setDocumentStatus("Active");

    // Mark revision as uploaded (locks fields, hides upload button & file preview)
    setIsRevisionUploaded(true);

    // Store uploaded file for preview in workspace
    setUploadedRevisionFile(file);

    // Close modal
    setIsUploadRevisionModalOpen(false);
  };

  // Status workflow steps - simplified for new document creation
  const statusSteps: DocumentStatus[] = [
    "Draft",
    "Active",
    "Obsoleted",
    "Closed - Cancelled",
  ];
  // currentStepIndex is now calculated in useMemo above based on documentStatus

  const tabs = [
    { id: "general" as TabType, label: "General Information" },
    { id: "training" as TabType, label: "Training Information" },
    { id: "document" as TabType, label: "Document" },
    ...(isSaved ? [{ id: "signatures" as TabType, label: "Signatures" }] : []),
    { id: "audit" as TabType, label: "Audit Trail" },
  ];

  return (
    <div className="space-y-6 w-full">
      {(isSaving || isNavigating) && <FullPageLoading text={isSaving ? "Processing..." : "Loading..."} />}
      {/* Header: Title + Breadcrumb + Actions */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 lg:gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg md:text-xl lg:text-2xl font-bold tracking-tight text-slate-900">
              New Document
            </h1>
            <Breadcrumb items={newDocument(navigateTo)} />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            {documentStatus === "Closed - Cancelled" ? (
              <Button
                onClick={handleBackToList}
                variant="outline-emerald"
                size="sm"
                className="whitespace-nowrap"
              >
                Back to List
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleCancel}
                  variant="outline-emerald"
                  size="sm"
                  className="whitespace-nowrap"
                  disabled={documentStatus === "Obsoleted"}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveDraft}
                  disabled={
                    documentStatus === "Obsoleted" ||
                    isSaving ||
                    missingRequiredFields.length > 0 ||
                    (isSaved &&
                      (reviewers.length === 0 || approvers.length === 0))
                  }
                  variant="outline-emerald"
                  size="sm"
                  className="whitespace-nowrap"
                >
                  {isSaving
                    ? isSaved
                      ? "Saving..."
                      : "Processing..."
                    : isSaved
                      ? "Save"
                      : "Next Step"}
                </Button>
              </>
            )}
          </div>
        </div>
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

              // Special case: When status is "Obsoleted", show "Closed - Cancelled" as skipped (striped)
              const isObsoletedStatus = documentStatus === "Obsoleted";
              const isClosedCancelledStep = step === "Closed - Cancelled";
              const isSkippedForObsoleted =
                isObsoletedStatus && isClosedCancelledStep;

              // For Obsoleted status: Draft and Active are considered completed
              const showAsCompletedForObsoleted =
                isObsoletedStatus && (step === "Draft" || step === "Active");

              // Special case: When status is "Closed - Cancelled", show Active and Obsoleted as skipped (striped)
              const isCancelledStatus = documentStatus === "Closed - Cancelled";
              const isSkippedForCancelled =
                isCancelledStatus &&
                (step === "Active" || step === "Obsoleted");

              // For Cancelled status: Draft is considered completed
              const showAsCompletedForCancelled =
                isCancelledStatus && step === "Draft";

              // Combine skip conditions
              const isSkipped = isSkippedForObsoleted || isSkippedForCancelled;

              // Combine completed conditions
              const showAsCompleted =
                showAsCompletedForObsoleted || showAsCompletedForCancelled;

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
                      isSkipped
                        ? "" // Will use striped pattern
                        : isCompleted || showAsCompleted
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
                      ...(isSkipped
                        ? {
                            background:
                              "repeating-linear-gradient(135deg, #e2e8f0, #e2e8f0 8px, #f1f5f9 8px, #f1f5f9 16px)",
                          }
                        : {}),
                    }}
                  />

                  {/* Content */}
                  <div className="relative z-10 flex items-center gap-2 px-6">
                    {(isCompleted || showAsCompleted) && !isSkipped && (
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    )}
                    <span
                      className={cn(
                        "text-xs md:text-sm font-medium text-center",
                        isSkipped
                          ? "text-slate-400"
                          : isCurrent
                            ? "text-white"
                            : isCompleted || showAsCompleted
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
      </div>
      {/* Warning Banner - Show when saved but missing reviewers or approvers */}
      {isSaved &&
        (reviewers.length === 0 || approvers.length === 0) &&
        documentStatus !== "Obsoleted" &&
        documentStatus !== "Closed - Cancelled" && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-center">
            <p className="text-sm font-medium text-red-700">
              Please add at least one reviewer and one approver in order to
              upload revisions.
            </p>
          </div>
        )}
      {/* Tab Navigation */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <TabNav tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as TabType)} />

        {/* Tab Content */}
        <div className="p-3 sm:p-4 md:p-6">
          {activeTab === "general" && (
            <GeneralTab
              formData={formData}
              onFormChange={setFormData}
              hideTemplateCheckbox={true}
              suggestedDocumentCode={suggestedDocumentCode}
              documentNumber={documentNumber}
              createdDateTime={createdDateTime}
              openedBy={openedBy}
              isObsoleted={
                documentStatus === "Obsoleted" ||
                documentStatus === "Closed - Cancelled"
              }
              readOnlyReviewDate={true}
              lockedAfterSave={isSaved}
              lockAllEditableFields={isRevisionUploaded}
            />
          )}

          {activeTab === "training" && (
            <TrainingTab
              isReadOnly={
                documentStatus === "Obsoleted" ||
                documentStatus === "Closed - Cancelled" ||
                isRevisionUploaded
              }
            />
          )}

          {activeTab === "document" && (
            <DocumentTab
              uploadedFiles={uploadedFiles}
              onFilesChange={setUploadedFiles}
              selectedFile={selectedFile}
              onSelectFile={setSelectedFile}
              maxFiles={1}
              isObsoleted={
                documentStatus === "Obsoleted" ||
                documentStatus === "Closed - Cancelled"
              }
              parentDocument={parentDocument}
              onParentDocumentChange={setParentDocument}
              relatedDocuments={relationshipDocs}
              onRelatedDocumentsChange={setRelationshipDocs}
              documentType={formData.type}
              onSuggestedCodeChange={setSuggestedDocumentCode}
              hideUpload={!isSaved || isRevisionUploaded}
            />
          )}

          {activeTab === "signatures" && <SignaturesTab />}

          {activeTab === "audit" && <AuditTab />}
        </div>
      </div>

      {/* Action Buttons - Outside tabs */}
      <div className="">
        <div className="bg-slate-50/50">
          <div className="flex flex-wrap items-center gap-3">
            {/* Back to List button - shown when obsoleted */}
            {documentStatus === "Obsoleted" && (
              <Button
                onClick={handleBackToList}
                variant="outline-emerald"
                size="sm"
                className="whitespace-nowrap"
              >
                Back to List
              </Button>
            )}

            {/* Cancel button - only show after Next Step (isSaved = true) and not obsoleted/cancelled */}
            {isSaved &&
              documentStatus !== "Obsoleted" &&
              documentStatus !== "Closed - Cancelled" && (
                <Button
                  onClick={handleCancel}
                  variant="outline-emerald"
                  size="sm"
                  className="whitespace-nowrap"
                >
                  Cancel
                </Button>
              )}

            {/* Back to List button - shown when cancelled */}
            {documentStatus === "Closed - Cancelled" && (
              <Button
                onClick={handleBackToList}
                variant="outline-emerald"
                size="sm"
                className="whitespace-nowrap"
              >
                Back to List
              </Button>
            )}

            {/* Save/Next Step button - only show when not cancelled */}
            {documentStatus !== "Closed - Cancelled" && !isSaved && (
              <Button
                onClick={handleCancel}
                variant="outline-emerald"
                size="sm"
                className="whitespace-nowrap"
                disabled={documentStatus === "Obsoleted"}
              >
                Cancel
              </Button>
            )}
            {documentStatus !== "Closed - Cancelled" && (
              <Button
                onClick={handleSaveDraft}
                disabled={
                  documentStatus === "Obsoleted" ||
                  missingRequiredFields.length > 0 ||
                  (isSaved &&
                    (reviewers.length === 0 || approvers.length === 0)) ||
                  isSaving
                }
                variant="outline-emerald"
                size="sm"
                className="whitespace-nowrap"
              >
                {isSaving
                  ? isSaved
                    ? "Saving..."
                    : "Processing..."
                  : isSaved
                    ? "Save"
                    : "Next Step"}
              </Button>
            )}

            {/* Obsolete button - only show when document is Active */}
            {documentStatus === "Active" && (
              <Button
                onClick={() => setIsObsoleteModalOpen(true)}
                variant="outline-emerald"
                size="sm"
                className="whitespace-nowrap"
              >
                Obsolete
              </Button>
            )}

            {/* Divider - only show when saved and not obsoleted or cancelled */}
            {isSaved &&
              documentStatus !== "Obsoleted" &&
              documentStatus !== "Closed - Cancelled" && (
                <div className=" w-px h-8 bg-slate-500 mx-1" />
              )}

            {/* Other action buttons - only show after saved and not obsoleted or cancelled */}
            {isSaved &&
              documentStatus !== "Obsoleted" &&
              documentStatus !== "Closed - Cancelled" && (
                <>
                  {/* Upload Revision button - only show when reviewers and approvers are added and revision not yet uploaded */}
                  {reviewers.length > 0 &&
                    approvers.length > 0 &&
                    !isRevisionUploaded && (
                      <Button
                        onClick={() => setIsUploadRevisionModalOpen(true)}
                        variant="outline-emerald"
                        size="sm"
                        className="whitespace-nowrap"
                      >
                        Upload Revision
                      </Button>
                    )}
                  <Button
                    onClick={() => {
                      setActiveSubtab("related");
                      setIsRelatedModalOpen(true);
                    }}
                    variant="outline-emerald"
                    size="sm"
                    className="whitespace-nowrap"
                  >
                    Select Related Documents
                    {relationshipDocs.length > 0 && (
                      <span className="ml-2 text-xs opacity-70">
                        ({relationshipDocs.length})
                      </span>
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setActiveSubtab("correlated");
                      setIsCorrelatedModalOpen(true);
                    }}
                    variant="outline-emerald"
                    size="sm"
                    className="whitespace-nowrap"
                  >
                    Select Correlated Documents
                    {parentDocument && (
                      <span className="ml-2 text-xs opacity-70">(1)</span>
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setActiveSubtab("reviewers");
                      setIsReviewerModalOpen(true);
                    }}
                    variant="outline-emerald"
                    size="sm"
                    className="whitespace-nowrap"
                  >
                    Reviewers
                  </Button>
                  <Button
                    onClick={() => {
                      setActiveSubtab("approvers");
                      setIsApproverModalOpen(true);
                    }}
                    variant="outline-emerald"
                    size="sm"
                    className="whitespace-nowrap"
                  >
                    Approvers
                  </Button>
                </>
              )}
          </div>
        </div>
      </div>

      {/* Subtabs Card - Only show after saved */}
      {isSaved && (
        <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
          {/* Subtab Navigation */}
          <div className="border-b border-slate-200 bg-white">
            <div className="flex overflow-x-auto">
              {[
                { id: "revisions" as SubTabId, label: "Document Revisions" },
                { id: "reviewers" as SubTabId, label: "Reviewers" },
                { id: "approvers" as SubTabId, label: "Approvers" },
                { id: "copies" as SubTabId, label: "Controlled Copies" },
                { id: "related" as SubTabId, label: "Related Documents" },
                { id: "correlated" as SubTabId, label: "Correlated Documents" },
              ].map((subtab) => (
                <button
                  key={subtab.id}
                  onClick={() => setActiveSubtab(subtab.id)}
                  className={cn(
                    "flex items-center gap-1.5 md:gap-2 px-2.5 md:px-6 py-3 md:py-2.5 text-xs md:text-sm font-medium transition-colors whitespace-nowrap border-b-2 border-r border-slate-200 last:border-r-0",
                    activeSubtab === subtab.id
                      ? "border-b-emerald-600 text-emerald-600"
                      : "border-b-transparent text-slate-600 hover:text-slate-900 hover:border-slate-200",
                  )}
                >
                  {subtab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subtab Content */}
          <div className="p-4 md:p-6">
            {activeSubtab === "revisions" && (
              <DocumentRevisionsTab
                revisions={revisions}
                documentAuthor={formData.author}
                documentStatus={documentStatus}
                documentCreated={createdDateTime}
                revisionFile={uploadedRevisionFile}
              />
            )}
            {activeSubtab === "reviewers" && (
              <ReviewersTab
                reviewers={reviewers}
                onReviewersChange={setReviewers}
                reviewFlowType={reviewFlowType}
                onReviewFlowTypeChange={setReviewFlowType}
                isModalOpen={isReviewerModalOpen}
                onModalClose={() => setIsReviewerModalOpen(false)}
              />
            )}
            {activeSubtab === "approvers" && (
              <ApproversTab
                approvers={approvers}
                onApproversChange={setApprovers}
                isModalOpen={isApproverModalOpen}
                onModalClose={() => setIsApproverModalOpen(false)}
              />
            )}
            {activeSubtab === "copies" && <ControlledCopiesTab />}
            {activeSubtab === "related" && (
              <RelatedDocumentsTab
                relatedDocuments={relationshipDocs}
                onRelatedDocumentsChange={setRelationshipDocs}
              />
            )}
            {activeSubtab === "correlated" && (
              <CorrelatedDocumentsTab
                parentDocument={parentDocument}
                onParentDocumentChange={setParentDocument}
              />
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <DocumentRelationships
        parentDocument={parentDocument}
        onParentDocumentChange={setParentDocument}
        relatedDocuments={relationshipDocs}
        onRelatedDocumentsChange={setRelationshipDocs}
        documentType={formData.type}
        isRelatedModalOpen={isRelatedModalOpen}
        onRelatedModalClose={() => setIsRelatedModalOpen(false)}
        isCorrelatedModalOpen={isCorrelatedModalOpen}
        onCorrelatedModalClose={() => setIsCorrelatedModalOpen(false)}
      />

      <UploadRevisionModal
        isOpen={isUploadRevisionModalOpen}
        onClose={() => setIsUploadRevisionModalOpen(false)}
        onConfirm={handleUploadRevision}
        documentName={formData.title || "Untitled Document"}
        revisionNumber={`${revisions.length}.0.${revisions.length + 1}`}
      />

      <ESignatureModal
        isOpen={isObsoleteModalOpen}
        onClose={() => setIsObsoleteModalOpen(false)}
        onConfirm={(reason) => {
          setIsObsoleteModalOpen(false);
          handleObsolete(reason);
        }}
        actionTitle="Obsolete Document"
      />
      <FormModal
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
          setCancelActivitySummary("");
        }}
        onConfirm={handleCancelConfirm}
        title="Cancel Document Creation"
        description={
          <div className="text-xs bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-amber-800">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600 inline shrink-0" />{" "}
              <span className="font-semibold">Note:</span> The document will be
              moved to <strong>Closed - Cancelled</strong> status.
            </p>
          </div>
        }
        confirmText="Yes, Cancel"
        cancelText="No, Continue"
        confirmDisabled={!cancelActivitySummary.trim()}
        showCancel={true}
        size="lg"
      >
        <div className="space-y-2">
          <label
            htmlFor="activity-summary"
            className="text-xs sm:text-sm font-medium text-slate-700 block"
          >
            Activity Summary <span className="text-red-500">*</span>
          </label>
          <textarea
            id="activity-summary"
            value={cancelActivitySummary}
            onChange={(e) => setCancelActivitySummary(e.target.value)}
            placeholder="Please provide a reason for cancelling this document..."
            rows={4}
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-slate-400 text-sm resize-none"
          />
          {!cancelActivitySummary.trim() && (
            <p className="text-xs text-slate-500">
              Activity Summary is required to cancel the document.
            </p>
          )}
        </div>
      </FormModal>

      <AlertModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onConfirm={handleConfirmSave}
        type="confirm"
        title={isSaved ? "Save Document?" : "Save & Proceed to Next Step?"}
        description={
          <div className="space-y-3">
            <p>
              {isSaved
                ? "Are you sure you want to save this document?"
                : "This will create the document and generate Document Number. You can then add Reviewers and Approvers."}
            </p>
          </div>
        }
        confirmText={isSaved ? "Save" : "Save & Next"}
        cancelText="Cancel"
        showCancel={true}
      />
    </div>
  );
};



