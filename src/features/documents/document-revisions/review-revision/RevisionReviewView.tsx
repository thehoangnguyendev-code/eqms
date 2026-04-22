import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TabNav } from "@/components/ui/tabs/TabNav";
import { Button } from "@/components/ui/button/Button";
import { ESignatureModal } from "@/components/ui/esign-modal/ESignatureModal";
import { AlertModal } from "@/components/ui/modal/AlertModal";
import { FullPageLoading } from "@/components/ui/loading/Loading";
import { revisionReview } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { OriginalDocumentTab } from "@/features/documents/document-revisions/subtabs";
import {
  DocumentWorkflowLayout,
  DEFAULT_WORKFLOW_TABS,
} from "@/features/documents/shared/layouts";
import {
  GeneralInformationTab,
  DocumentTab,
  SignaturesTab,
  AuditTrailTab,
  WorkingNotesTab,
  InfoFromDocumentTab,
  WorkspaceReviewersTab,
  WorkspaceApproversTab,
  TrainingInformationTab,
} from "@/features/documents/document-revisions/revision-tabs";

import type { DocumentStatus, ReviewStatus } from "@/features/documents/types";
import {
  MOCK_ORIGINAL_DOCUMENT,
  MOCK_REVISION,
} from "./mockData";

// --- Types ---
type TabType = "document" | "general" | "workingNotes" | "documentInfo" | "training" | "reviewers" | "approvers" | "signatures" | "audit";

interface RevisionReviewViewProps {
  documentId: string;
  onBack: () => void;
  currentUserId: string;
}

export const RevisionReviewView: React.FC<RevisionReviewViewProps> = ({
  documentId: _documentId,
  onBack,
  currentUserId = "1",
}) => {
  const navigate = useNavigate();
  const [document, setDocument] = useState(MOCK_REVISION);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [showESignModal, setShowESignModal] = useState(false);
  const [showRejectWarning, setShowRejectWarning] = useState(false);
  const [eSignAction, setESignAction] = useState<"approve" | "reject">(
    "approve"
  );
  const [isNavigating, setIsNavigating] = useState(false);

  const handleBack = () => {
    setIsNavigating(true);
    setTimeout(() => { onBack(); }, 600);
  };

  // Determine if current user can review
  const currentReviewer = document.reviewers.find(
    (r) => r.id === currentUserId
  );
  const canReview = !!(
    currentReviewer &&
    currentReviewer.status === "pending" &&
    (document.reviewFlowType === "parallel" ||
      (document.reviewFlowType === "sequential" &&
        currentReviewer.order === document.currentReviewerIndex + 1))
  );

  const handleApprove = () => {
    if (!currentReviewer) return;
    setESignAction("approve");
    setShowESignModal(true);
  };

  const handleReject = () => {
    if (!currentReviewer) return;
    setESignAction("reject");
    setShowRejectWarning(true);
  };

  const handleRejectWarningConfirm = () => {
    setShowRejectWarning(false);
    setShowESignModal(true);
  };

  const handleESignConfirm = (reason: string) => {
    if (!currentReviewer) return;

    setIsSubmitting(true);
    setShowESignModal(false);

    // Simulate API call
    setTimeout(() => {
      const newStatus = eSignAction === "approve" ? "approved" : "rejected";
      const updatedReviewers = document.reviewers.map((r) =>
        r.id === currentUserId
          ? {
            ...r,
            status: newStatus as ReviewStatus,
            reviewDate: new Date().toISOString(),
            comments: reason,
          }
          : r
      );

      let nextIndex = document.currentReviewerIndex;
      if (
        document.reviewFlowType === "sequential" &&
        eSignAction === "approve"
      ) {
        nextIndex = document.currentReviewerIndex + 1;
      }

      setDocument({
        ...document,
        reviewers: updatedReviewers,
        currentReviewerIndex: nextIndex,
        status: eSignAction === "reject" ? "Draft" : document.status,
      });

      setIsSubmitting(false);
    }, 1000);
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

  // Breadcrumbs
  const breadcrumbs = revisionReview(navigate);

  return (
    <>
      {isNavigating && <FullPageLoading text="Loading..." />}
      <DocumentWorkflowLayout
        title="Review Revision"
        breadcrumbs={breadcrumbs}
        onBack={handleBack}
        statusSteps={statusSteps}
        currentStatus={document.status}
        tabs={DEFAULT_WORKFLOW_TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        headerActions={
          canReview ? (
            <>
              <Button
                onClick={handleReject}
                variant="outline-emerald"
                size="sm"
                disabled={isSubmitting}
                className="whitespace-nowrap"
              >
                Reject
              </Button>
              <Button
                onClick={handleApprove}
                variant="outline-emerald"
                size="sm"
                disabled={isSubmitting}
                className="whitespace-nowrap"
              >
                Complete Review
              </Button>
            </>
          ) : undefined
        }
        footerActions={
          <>
            <Button
              onClick={handleBack}
              variant="outline-emerald"
              size="sm"
              className="whitespace-nowrap"
            >
              Back
            </Button>
            {canReview && (
              <>
                <Button
                  onClick={handleReject}
                  variant="outline-emerald"
                  size="sm"
                  disabled={isSubmitting}
                  className="whitespace-nowrap"
                >
                  Reject
                </Button>
                <Button
                  onClick={handleApprove}
                  variant="outline-emerald"
                  size="sm"
                  disabled={isSubmitting}
                  className="whitespace-nowrap"
                >
                  Complete Review
                </Button>
              </>
            )}
          </>
        }
        afterTabContent={
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <TabNav tabs={[{ id: "originalDocument", label: "Original Document" }]} activeTab="originalDocument" onChange={() => { }} />
            <div className="p-3 sm:p-4 md:p-6">
              <OriginalDocumentTab document={MOCK_ORIGINAL_DOCUMENT} />
            </div>
          </div>
        }
      >
        {activeTab === "document" && (
          <div className="space-y-6">
            {/* Document is submit-converted to PDF and shown in preview-only mode. */}
            <div className="overflow-hidden px-1.5 -mx-1.5 pb-1.5 -mb-1.5">
              <DocumentTab mode="view" />
            </div>
          </div>
        )}
        {activeTab === "general" && (
          <GeneralInformationTab
            document={{
              documentId: document.documentId,
              title: document.title,
              type: document.type,
              created: document.created,
              openedBy: document.openedBy,
              author: document.author,
              isTemplate: document.isTemplate,
              businessUnit: document.businessUnit,
              department: document.department,
              knowledgeBase: document.knowledgeBase,
              subType: document.subType,
              periodicReviewCycle: document.periodicReviewCycle,
              periodicReviewNotification: document.periodicReviewNotification,
              effectiveDate: document.effectiveDate,
              validUntil: document.validUntil,
              language: document.language,
              description: document.description,
              coAuthors: [],
            }}
            isReadOnly={true}
          />
        )}
        {activeTab === "workingNotes" && <WorkingNotesTab />}
        {activeTab === "documentInfo" && <InfoFromDocumentTab />}
        {activeTab === "training" && <TrainingInformationTab isReadOnly />}
        {activeTab === "reviewers" && <WorkspaceReviewersTab reviewers={[]} />}
        {activeTab === "approvers" && <WorkspaceApproversTab approvers={[]} />}
        {activeTab === "signatures" && <SignaturesTab />}
        {activeTab === "audit" && <AuditTrailTab />}

        {/* Reject Warning Modal */}
        <AlertModal
          isOpen={showRejectWarning}
          onClose={() => setShowRejectWarning(false)}
          onConfirm={handleRejectWarningConfirm}
          type="warning"
          title="Reject Revision?"
          description="When rejecting this revision at Pending Review stage, the document will return to Draft status. Are you sure you want to continue?"
        />

        {/* E-Signature Modal */}
        <ESignatureModal
          isOpen={showESignModal}
          onClose={() => setShowESignModal(false)}
          onConfirm={handleESignConfirm}
          actionTitle={
            eSignAction === "approve"
              ? "Approve Revision"
              : "Reject Revision"
          }
        />
      </DocumentWorkflowLayout>
    </>
  );
};




