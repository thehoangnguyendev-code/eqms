import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from '@/app/routes.constants';
import { Button } from '@/components/ui/button/Button';
import { TabNav } from "@/components/ui/tabs/TabNav";
import { ESignatureModal } from '@/components/ui/esign-modal/ESignatureModal';
import { AlertModal } from '@/components/ui/modal/AlertModal';
import { FullPageLoading } from '@/components/ui/loading/Loading';
import { useToast } from '@/components/ui/toast';
import { revisionApproval } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { OriginalDocumentTab } from "@/features/documents/document-revisions/subtabs";
import type { OriginalDocumentInfo } from "@/features/documents/document-revisions/subtabs";
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
import {
    type ApprovalStatus,
    MOCK_ORIGINAL_DOCUMENT,
    MOCK_REVISION,
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

    // Status workflow steps
    const statusSteps: DocumentStatus[] = ["Draft", "Pending Review", "Pending Approval", "Pending Training", "Ready for Publishing", "Effective", "Obsoleted", "Closed - Cancelled"];

    // Breadcrumbs
    const breadcrumbs = revisionApproval(navigate);

    return (
        <>
            {isNavigating && <FullPageLoading text="Loading..." />}
            <DocumentWorkflowLayout
                title="Approve Revision"
                breadcrumbs={breadcrumbs}
                onBack={handleBack}
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
                                Complete Approve
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
                        {canApprove && (
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
                                    Complete Approve
                                </Button>
                            </>
                        )}
                    </>
                }
                afterTabContent={
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <TabNav tabs={[{ id: "originalDocument", label: "Original Document" }]} activeTab="originalDocument" onChange={() => { }} />
                        <div className="p-4 md:p-5">
                            <OriginalDocumentTab document={MOCK_ORIGINAL_DOCUMENT} />
                        </div>
                    </div>
                }
            >
                {activeTab === "document" && (
                    <div className="space-y-6">
                        {/* PDF Preview Section - Read Only */}
                        <DocumentTab mode="view" />
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




