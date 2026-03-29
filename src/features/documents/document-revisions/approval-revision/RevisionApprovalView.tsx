import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from '@/app/routes.constants';
import {
    MessageSquare,
    Send,
} from "lucide-react";
import { Button } from '@/components/ui/button/Button';
import { TabNav } from "@/components/ui/tabs/TabNav";
import { ESignatureModal } from '@/components/ui/esign-modal/ESignatureModal';
import { AlertModal } from '@/components/ui/modal/AlertModal';
import { FullPageLoading } from '@/components/ui/loading/Loading';
import { useToast } from '@/components/ui/toast';
import { formatDate } from '@/utils/format';
import { revisionApproval } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { OriginalDocumentTab } from "@/features/documents/document-revisions/sub-tab";
import type { OriginalDocumentInfo } from "@/features/documents/document-revisions/sub-tab";
import { DocumentWorkflowLayout, DEFAULT_WORKFLOW_TABS } from "@/features/documents/shared/layouts";
import {
    GeneralTab,
    DocumentTab,
    TrainingInformationTab,
    SignaturesTab,
    AuditTrailTab,
    WorkingNotesTab,
    InfoFromDocumentTab,
    WorkspaceReviewersTab,
    WorkspaceApproversTab,
    type GeneralTabFormData,
} from "@/features/documents/document-revisions/revision-tabs";
import type { DocumentType, DocumentStatus } from "@/features/documents/types";
import { IconMessage2 } from "@tabler/icons-react";
import {
    type ApprovalStatus,
    type Approver,
    type RevisionDetail,
    type Comment,
    MOCK_ORIGINAL_DOCUMENT,
    MOCK_REVISION,
    MOCK_COMMENTS,
} from "./mockData";

// --- Types ---
type TabType = "document" | "general" | "workingNotes" | "documentInfo" | "training" | "reviewers" | "approvers" | "signatures" | "audit";

interface RevisionApprovalViewProps {
    revisionId: string;
    onBack: () => void;
    currentUserId: string;
}

// Use shared FormData type from GeneralTab
type FormData = GeneralTabFormData;

// --- Main Component ---
export const RevisionApprovalView: React.FC<RevisionApprovalViewProps> = ({
    revisionId,
    onBack,
    currentUserId = "1",
}) => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [revision, setRevision] = useState(MOCK_REVISION);
    const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>("general");
    const [showesignModal, setshowesignModal] = useState(false);
    const [showRejectWarning, setShowRejectWarning] = useState(false);
    const [eSignAction, setESignAction] = useState<'approve' | 'reject'>('approve');
    const [isNavigating, setIsNavigating] = useState(false);

    const handleBack = () => {
        setIsNavigating(true);
        setTimeout(() => { onBack(); }, 600);
    };

    // GeneralTab state
    const [formData, setFormData] = useState<FormData>({
        title: revision.title,
        type: revision.type as DocumentType,
        author: revision.author,
        coAuthors: [],
        businessUnit: revision.businessUnit,
        department: revision.department,
        knowledgeBase: revision.knowledgeBase,
        subType: revision.subType,
        periodicReviewCycle: revision.periodicReviewCycle,
        periodicReviewNotification: revision.periodicReviewNotification,
        language: revision.language,
        reviewDate: "",
        description: revision.description,
        isTemplate: revision.isTemplate,
        titleLocalLanguage: revision.titleLocalLanguage ?? "",
    });

    // Determine if current user can approve (single approver)
    const approver = revision.approver;
    const canApprove = approver.id === currentUserId && approver.status === 'pending';

    const handleApprove = () => {
        if (!approver) return;
        setESignAction('approve');
        setshowesignModal(true);
    };

    const handleReject = () => {
        if (!approver) return;
        setESignAction('reject');
        setShowRejectWarning(true);
    };

    const handleRejectWarningConfirm = () => {
        setShowRejectWarning(false);
        setshowesignModal(true);
    };

    const handleESignConfirm = (reason: string) => {
        if (!approver) return;

        setIsSubmitting(true);
        setshowesignModal(false);

        // Simulate API call
        setTimeout(() => {
            const newStatus = eSignAction === 'approve' ? 'approved' : 'rejected';
            const updatedApprover = {
                ...approver,
                status: newStatus as ApprovalStatus,
                approvalDate: new Date().toISOString(),
                comments: reason
            };

            setRevision({
                ...revision,
                approver: updatedApprover,
                status: eSignAction === 'reject' ? "Pending Review" : "Approved",
            });

            setIsSubmitting(false);

            // Show success message and redirect Back
            const message = eSignAction === 'approve'
                ? `Revision ${revision.documentId} v${revision.version} has been approved successfully.`
                : `Revision ${revision.documentId} v${revision.version} has been rejected.`;

            showToast({
                type: eSignAction === 'approve' ? 'success' : 'warning',
                title: eSignAction === 'approve' ? 'Approved' : 'Rejected',
                message: message,
                duration: 3000
            });

            // Redirect to Pending My Approval list after 1.5 seconds
            setTimeout(() => {
                navigate(ROUTES.DOCUMENTS.REVISIONS.PENDING_APPROVAL);
            }, 1500);
        }, 1000);
    };

    const handleAddComment = () => {
        if (!newComment.trim()) return;

        const comment: Comment = {
            id: Date.now().toString(),
            author: approver?.name || "Current User",
            role: approver?.role || "Approver",
            date: new Date().toISOString(),
            content: newComment,
        };

        setComments([...comments, comment]);
        setNewComment("");
    };

    // Status workflow steps
    const statusSteps: DocumentStatus[] = ["Draft", "Pending Review", "Pending Approval", "Pending Training", "Ready for Publishing", "Effective", "Obsoleted", "Closed - Cancelled"];

    // Breadcrumbs
    const breadcrumbs = revisionApproval(navigate, onBack);

    return (
        <>
        {isNavigating && <FullPageLoading text="Loading..." />}
        <DocumentWorkflowLayout
            title="Approve Revision"
            breadcrumbs={breadcrumbs}
            onBack={handleBack}
            documentId={`${revision.documentId} v${revision.version}`}
            documentStatus={revision.status}
            statusSteps={statusSteps}
            currentStatus={revision.status}
            tabs={DEFAULT_WORKFLOW_TABS}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            headerActions={
                canApprove ? (
                    <>
                        <Button
                            onClick={handleReject}
                            variant="outline"
                            size="sm"
                            disabled={isSubmitting}
                            className="whitespace-nowrap !border-emerald-600 !text-emerald-600 hover:!bg-emerald-50 disabled:!border-slate-300 disabled:!text-slate-400 disabled:hover:!bg-transparent"
                        >
                            Reject
                        </Button>
                        <Button
                            onClick={handleApprove}
                            variant="outline"
                            size="sm"
                            disabled={isSubmitting}
                            className="whitespace-nowrap !border-emerald-600 !text-emerald-600 hover:!bg-emerald-50 disabled:!border-slate-300 disabled:!text-slate-400 disabled:hover:!bg-transparent"
                        >
                            Complete Approve
                        </Button>
                    </>
                ) : undefined
            }
            footerActions={
                <>
                    <Button
                        onClick={handleBack}
                        variant="outline"
                        size="sm"
                        className="whitespace-nowrap !border-emerald-600 !text-emerald-600 hover:!bg-emerald-50"
                    >
                        Back
                    </Button>
                    {canApprove && (
                        <>
                            <Button
                                onClick={handleReject}
                                variant="outline"
                                size="sm"
                                disabled={isSubmitting}
                                className="whitespace-nowrap !border-emerald-600 !text-emerald-600 hover:!bg-emerald-50 disabled:!border-slate-300 disabled:!text-slate-400 disabled:hover:!bg-transparent"
                            >
                                Reject
                            </Button>
                            <Button
                                onClick={handleApprove}
                                variant="outline"
                                size="sm"
                                disabled={isSubmitting}
                                className="whitespace-nowrap !border-emerald-600 !text-emerald-600 hover:!bg-emerald-50 disabled:!border-slate-300 disabled:!text-slate-400 disabled:hover:!bg-transparent"
                            >
                                Complete Approve
                            </Button>
                        </>
                    )}
                </>
            }
            afterTabContent={
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <TabNav tabs={[{ id: "originalDocument", label: "Original Document" }]} activeTab="originalDocument" onChange={() => {}} />
                    <div className="p-3 sm:p-4 md:p-6">
                        <OriginalDocumentTab document={MOCK_ORIGINAL_DOCUMENT} />
                    </div>
                </div>
            }
        >
            {activeTab === "document" && (
                <div className="space-y-6">
                    {/* PDF Preview Section - Read Only */}
                    <DocumentTab mode="view" />

                    {/* Comments Section */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 lg:p-6">
                        <h3 className="text-base lg:text-lg font-bold text-slate-900 mb-3 lg:mb-4 flex items-center gap-2">
                            <IconMessage2 className="h-4 w-4 lg:h-5 lg:w-5 text-slate-600" />
                            Comments & Discussion
                        </h3>

                        {/* Comments List */}
                        <div className="space-y-3 lg:space-y-4 mb-4 lg:mb-6">
                            {comments.length > 0 ? (
                                comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-3 lg:gap-4 p-3 lg:p-4 bg-slate-50 rounded-lg">
                                        <div className="h-9 w-9 lg:h-10 lg:w-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-bold shrink-0">
                                            {comment.author.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 lg:gap-2 mb-1 flex-wrap">
                                                <span className="font-medium text-sm lg:text-base text-slate-900 truncate">{comment.author}</span>
                                                <span className="text-xs text-slate-500 shrink-0">•</span>
                                                <span className="text-xs text-slate-500 truncate">{comment.role}</span>
                                                <span className="text-xs text-slate-500 shrink-0">•</span>
                                                <span className="text-xs text-slate-500 shrink-0">{formatDate(comment.date)}</span>
                                            </div>
                                            <p className="text-sm text-slate-700 break-words">{comment.content}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6 lg:py-8 text-slate-500">
                                    <MessageSquare className="h-10 w-10 lg:h-12 lg:w-12 mx-auto mb-2 lg:mb-3 text-slate-300" />
                                    <p className="text-sm">No comments yet. Be the first to add a comment.</p>
                                </div>
                            )}
                        </div>

                        {/* Add Comment */}
                        <div className="border-t border-slate-200 pt-4">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="h-9 w-9 lg:h-10 lg:w-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-bold shrink-0">
                                    {approver?.name.charAt(0) || "U"}
                                </div>
                                <div className="flex-1 flex flex-col sm:flex-row gap-2">
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Add a comment..."
                                        rows={3}
                                        className="flex-1 px-3 lg:px-4 py-2 lg:py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                                    />
                                    <button
                                        onClick={handleAddComment}
                                        disabled={!newComment.trim()}
                                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 sm:self-start shrink-0"
                                    >
                                        <Send className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                                        <span className="text-sm sm:hidden">Send Comment</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {activeTab === "general" && (
                <GeneralTab
                    formData={formData}
                    onFormChange={setFormData}
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
                description="When rejecting this revision at Pending Approval stage, the document will return to Pending Review status. Are you sure you want to continue?"
            />

            {/* E-Signature Modal */}
            <ESignatureModal
                isOpen={showesignModal}
                onClose={() => setshowesignModal(false)}
                onConfirm={handleESignConfirm}
                actionTitle={eSignAction === 'approve' ? 'Approve Revision' : 'Reject Revision'}
            />
        </DocumentWorkflowLayout>
        </>
    );
};




