import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Send,
  CheckCircle,
  XCircle,
  ChevronDown,
  Users,
} from "lucide-react";
import { IconListNumbers, IconMessage2 } from "@tabler/icons-react";
import { cn } from "@/components/ui/utils";
import { TabNav } from "@/components/ui/tabs/TabNav";
import { Button } from "@/components/ui/button/Button";
import { StatusBadge } from "@/components/ui";
import { ESignatureModal } from "@/components/ui/esign-modal/ESignatureModal";
import { AlertModal } from "@/components/ui/modal/AlertModal";
import { FullPageLoading } from "@/components/ui/loading/Loading";
import { formatDate } from "@/utils/format";
import { revisionReview } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { OriginalDocumentTab } from "@/features/documents/document-revisions/subtabs";
import type { OriginalDocumentInfo } from "@/features/documents/document-revisions/subtabs";
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

import type { DocumentType, DocumentStatus } from "@/features/documents/types";
import {
  type ReviewFlowType,
  type ReviewStatus,
  type Reviewer,
  type DocumentDetail,
  type Comment,
  MOCK_ORIGINAL_DOCUMENT,
  MOCK_REVISION,
  MOCK_COMMENTS,
} from "./mockData";

// --- Types ---
type TabType = "document" | "general" | "workingNotes" | "documentInfo" | "training" | "reviewers" | "approvers" | "signatures" | "audit";

interface RevisionReviewViewProps {
  documentId: string;
  onBack: () => void;
  currentUserId: string;
}

export const RevisionReviewView: React.FC<RevisionReviewViewProps> = ({
  documentId,
  onBack,
  currentUserId = "1",
}) => {
  const navigate = useNavigate();
  const [document, setDocument] = useState(MOCK_REVISION);
  const [comments, setComments] = useState(MOCK_COMMENTS);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [isWorkflowExpanded, setIsWorkflowExpanded] = useState(true);
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

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      author: currentReviewer?.name || "Current User",
      role: currentReviewer?.role || "Reviewer",
      date: new Date().toISOString(),
      content: newComment,
    };

    setComments([...comments, comment]);
    setNewComment("");
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
            {/* PDF Preview Section */}
            <div className="overflow-hidden px-1.5 -mx-1.5 pb-1.5 -mb-1.5">
              <DocumentTab />
            </div>

            {/* Review Workflow Info */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <button
                onClick={() => setIsWorkflowExpanded(!isWorkflowExpanded)}
                className="w-full flex items-center justify-between p-4 lg:p-6 hover:bg-slate-50 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3">
                  <h3 className="text-base lg:text-lg font-bold text-slate-900">
                    Review Workflow
                  </h3>
                  <div className="inline-flex items-center gap-1.5 lg:gap-2 px-2.5 lg:px-3 py-1 lg:py-1.5 bg-slate-50 border border-slate-200 rounded-lg w-fit">
                    {document.reviewFlowType === "sequential" ? (
                      <>
                        <IconListNumbers className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-slate-600" />
                        <span className="text-xs sm:text-sm font-medium text-slate-700">
                          Sequential Review
                        </span>
                      </>
                    ) : (
                      <>
                        <Users className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-slate-600" />
                        <span className="text-xs sm:text-sm font-medium text-slate-700">
                          Parallel Review
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-slate-400 transition-transform duration-300 ease-in-out shrink-0",
                    isWorkflowExpanded && "transform rotate-180"
                  )}
                />
              </button>

              <div
                className={cn(
                  "transition-all duration-300 ease-in-out overflow-hidden",
                  isWorkflowExpanded
                    ? "max-h-[2000px] opacity-100"
                    : "max-h-0 opacity-0"
                )}
              >
                {/* Sequential: Vertical Stepper */}
                {document.reviewFlowType === "sequential" && (
                  <div className="px-4 lg:px-6 pb-4 lg:pb-6">
                    <ul className="relative ml-2 lg:ml-4">
                      <div className="absolute left-4 lg:left-5 top-0 bottom-0 w-px bg-slate-200" />
                      {document.reviewers
                        .slice()
                        .sort((a, b) => a.order - b.order)
                        .map((reviewer) => {
                          const isCurrentUserReviewer = reviewer.id === currentUserId;
                          const isCurrent =
                            reviewer.status === "pending" &&
                            reviewer.order === document.currentReviewerIndex + 1;
                          const isBlocked =
                            reviewer.status === "pending" &&
                            reviewer.order > document.currentReviewerIndex + 1;
                          const isApproved = reviewer.status === "approved";
                          const isRejected = reviewer.status === "rejected";

                          return (
                            <li key={reviewer.id} className="relative pl-10 lg:pl-14 py-2 lg:py-3">
                              {/* Step indicator */}
                              <div
                                className={cn(
                                  "absolute left-4 lg:left-5 -translate-x-1/2 top-2 h-7 w-7 lg:h-8 lg:w-8 rounded-full flex items-center justify-center text-xs font-bold",
                                  isApproved && "bg-emerald-600 text-white",
                                  isRejected && "bg-red-600 text-white",
                                  isCurrent && "bg-blue-600 text-white",
                                  isBlocked && "bg-slate-200 text-slate-700"
                                )}
                                aria-hidden="true"
                              >
                                {isApproved && <CheckCircle className="h-3.5 w-3.5 lg:h-4 lg:w-4" />}
                                {isRejected && <XCircle className="h-3.5 w-3.5 lg:h-4 lg:w-4" />}
                                {isCurrent && reviewer.order}
                                {isBlocked && reviewer.order}
                              </div>

                              {/* Content */}
                              <div
                                className={cn(
                                  "p-3 lg:p-4 rounded-lg border transition-colors",
                                  isCurrent && "bg-emerald-50 border-emerald-200",
                                  isApproved && "bg-white border-slate-200",
                                  isRejected && "bg-white border-slate-200",
                                  isBlocked && "bg-white border-slate-200"
                                )}
                              >
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                                  <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 lg:h-10 lg:w-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-bold shrink-0">
                                      {reviewer.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="font-medium text-sm lg:text-base text-slate-900 truncate">{reviewer.name}</h4>
                                        {isCurrentUserReviewer && (
                                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg shrink-0">
                                            You
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-1.5 text-xs text-slate-500 flex-wrap">
                                        <span className="truncate">{reviewer.role}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                                        <span className="truncate">{reviewer.department}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 flex-wrap lg:shrink-0">
                                    {reviewer.reviewDate && (isApproved || isRejected) && (
                                      <span className="text-xs text-slate-500 hidden lg:inline">
                                        {formatDate(reviewer.reviewDate)}
                                      </span>
                                    )}
                                    {isApproved && (
                                      <StatusBadge status="approved" size="sm" />
                                    )}
                                    {isRejected && (
                                      <StatusBadge status="rejected" size="sm" />
                                    )}
                                    {isCurrent && (
                                      <StatusBadge status="current" size="sm" />
                                    )}
                                    {isBlocked && (
                                      <StatusBadge status="blocked" size="sm" />
                                    )}
                                  </div>
                                </div>
                                {/* Show date on narrow screens for approved/rejected */}
                                {reviewer.reviewDate && (isApproved || isRejected) && (
                                  <div className="mt-2 text-xs text-slate-500 lg:hidden">
                                    {formatDate(reviewer.reviewDate)}
                                  </div>
                                )}
                              </div>
                            </li>
                          );
                        })}
                    </ul>
                  </div>
                )}

                {/* Parallel: Grid of reviewers */}
                {document.reviewFlowType === "parallel" && (
                  <div className="px-4 lg:px-6 pb-4 lg:pb-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
                      {document.reviewers.map((reviewer) => {
                        const isCurrentUserReviewer = reviewer.id === currentUserId;
                        const isSigned = reviewer.status !== "pending";
                        return (
                          <div
                            key={reviewer.id}
                            className={cn(
                              "p-3 lg:p-4 rounded-lg border bg-white",
                              isCurrentUserReviewer && reviewer.status === "pending"
                                ? "ring-1 ring-emerald-200"
                                : "border-slate-200"
                            )}
                          >
                            <div className="flex flex-col gap-3">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="h-9 w-9 lg:h-10 lg:w-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-bold shrink-0">
                                  {reviewer.name.charAt(0)}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="font-medium text-sm lg:text-base text-slate-900 truncate">{reviewer.name}</h4>
                                    {isCurrentUserReviewer && (
                                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full shrink-0">
                                        You
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1.5 text-xs text-slate-500 flex-wrap">
                                    <span className="truncate">{reviewer.role}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                                    <span className="truncate">{reviewer.department}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                {isSigned && reviewer.reviewDate && (
                                  <div className="text-xs text-slate-500">Signed on {formatDate(reviewer.reviewDate)}</div>
                                )}
                                <div className="flex items-center gap-2 shrink-0 ml-auto">
                                  {isSigned ? (
                                    <StatusBadge status="approved" size="sm" />
                                  ) : (
                                    <StatusBadge status="blocked" size="sm" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
                <span className="text-emerald-600"><MessageSquare className="h-4 w-4" /></span>
                <h3 className="text-sm font-semibold text-slate-800">Comments & Discussion</h3>
              </div>
              <div className="p-4 md:p-6">

                {/* Comments List */}
                <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
                  {comments.length > 0 ? (
                    comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="flex gap-3 md:gap-4 p-3 md:p-4 bg-slate-50 rounded-lg"
                      >
                        <div className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-bold shrink-0">
                          {comment.author.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 md:gap-2 mb-1 flex-wrap">
                            <span className="font-medium text-sm md:text-base text-slate-900 truncate">
                              {comment.author}
                            </span>
                            <span className="text-xs text-slate-500 shrink-0">•</span>
                            <span className="text-xs text-slate-500 truncate">
                              {comment.role}
                            </span>
                            <span className="text-xs text-slate-500 shrink-0">•</span>
                            <span className="text-xs text-slate-500 shrink-0">
                              {formatDate(comment.date)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700 break-words">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 md:py-8 text-slate-500">
                      <MessageSquare className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-2 md:mb-3 text-slate-300" />
                      <p className="text-sm">
                        No comments yet. Be the first to add a comment.
                      </p>
                    </div>
                  )}
                </div>

                {/* Add Comment */}
                <div className="border-t border-slate-200 pt-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-bold shrink-0">
                      {currentReviewer?.name.charAt(0) || "U"}
                    </div>
                    <div className="flex-1 flex flex-col sm:flex-row gap-2">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        rows={3}
                        className="flex-1 px-3 md:px-4 py-2 md:py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                      />
                      <button
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 sm:self-start shrink-0"
                      >
                        <Send className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        <span className="text-sm sm:hidden">Send Comment</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
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




