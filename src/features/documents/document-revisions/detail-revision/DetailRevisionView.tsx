import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Check,
} from "lucide-react";
import { cn } from "@/components/ui/utils";
import { TabNav } from "@/components/ui/tabs/TabNav";
import {
  GeneralInformationTab,
  WorkingNotesTab,
  InfoFromDocumentTab,
  TrainingInformationTab,
  ReviewersTab,
  ApproversTab,
  DocumentTab,
  SignaturesTab,
  AuditTrailTab,
} from "./tabs";
import { Button } from "@/components/ui/button/Button";
import { Breadcrumb } from "@/components/ui/breadcrumb/Breadcrumb";
import { revisionDetail } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { ROUTES } from "@/app/routes.constants";
import { FullPageLoading } from "@/components/ui/loading/Loading";
import { useNavigateWithLoading } from "@/hooks";
import { OriginalDocumentTab } from "@/features/documents/document-revisions/sub-tab";
import type { OriginalDocumentInfo } from "@/features/documents/document-revisions/sub-tab";

import type { DocumentType, DocumentStatus } from "@/features/documents/types";
import {
  type RevisionDetail,
  MOCK_ORIGINAL_DOCUMENT,
  MOCK_REVISION,
} from "./mockData";

// --- Types ---
type TabType = "general" | "workingNotes" | "infoFromDocument" | "training" | "reviewers" | "approvers" | "document" | "signatures" | "audit";

interface DetailRevisionViewProps {
  documentId: string;
  onBack: () => void;
  initialTab?: TabType;
  initialStatus?: DocumentStatus;
}

// Revision status workflow steps
const REVISION_STATUS_STEPS: DocumentStatus[] = [
  "Draft",
  "Pending Review",
  "Pending Approval",
  "Pending Training",
  "Ready for Publishing",
  "Effective",
  "Obsoleted",
  "Closed - Cancelled",
];

export const DetailRevisionView: React.FC<DetailRevisionViewProps> = ({
  documentId,
  onBack,
  initialTab = "general",
  initialStatus,
}) => {
  const location = useLocation();
  const { navigateTo, isNavigating } = useNavigateWithLoading();
  const state = location.state as { initialStatus?: DocumentStatus };

  // In real app, fetch revision by documentId
  const document = {
    ...MOCK_REVISION,
    status: initialStatus || state?.initialStatus || MOCK_REVISION.status,
  };
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  const handleBack = () => {
    onBack();
  };

  const handleRequestControlledCopy = () => {
    navigateTo(ROUTES.DOCUMENTS.CONTROLLED_COPIES.REQUEST, {
      state: {
        documentId: document.documentId,
        documentTitle: document.title,
        documentVersion: document.version,
        relatedDocuments: [],
      },
    });
  };

  const currentStepIndex = REVISION_STATUS_STEPS.indexOf(document.status) !== -1
    ? REVISION_STATUS_STEPS.indexOf(document.status)
    : REVISION_STATUS_STEPS.indexOf("Effective");

  const tabs = [
    { id: "general" as TabType, label: "General Information" },
    { id: "workingNotes" as TabType, label: "Working Notes" },
    { id: "infoFromDocument" as TabType, label: "Information from Document" },
    { id: "training" as TabType, label: "Training Information" },
    { id: "reviewers" as TabType, label: "Reviewers" },
    { id: "approvers" as TabType, label: "Approvers" },
    { id: "document" as TabType, label: "Document" },
    { id: "signatures" as TabType, label: "Signatures" },
    { id: "audit" as TabType, label: "Audit Trail" },
  ];

  return (
    <div className="space-y-6 w-full">
      {isNavigating && <FullPageLoading text="Loading..." />}
      {/* Header: Title + Breadcrumb + Actions */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-row flex-wrap items-end justify-between gap-3 md:gap-4">
          <div className="min-w-[200px] flex-1">
            <h1 className="text-lg md:text-xl lg:text-2xl font-bold tracking-tight text-slate-900">
              Revision Details
            </h1>
            <Breadcrumb items={revisionDetail(navigateTo)} />
          </div>
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <Button
              onClick={handleBack}
              size="sm"
              variant="outline-emerald"
              className="whitespace-nowrap gap-2"
            >
              Back
            </Button>
            {document.status === "Effective" && (
              <Button
                size="sm"
                variant="outline-emerald"
                className="whitespace-nowrap gap-2"
                onClick={handleRequestControlledCopy}
              >
                Request Controlled Copy
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Status Stepper */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
          <div className="flex items-stretch min-w-full">
            {REVISION_STATUS_STEPS.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isFirst = index === 0;
              const isLast = index === REVISION_STATUS_STEPS.length - 1;

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
                          : "text-slate-400"
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

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <TabNav tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as TabType)} />

        {/* Tab Content */}
        <div className="p-3 sm:p-4 md:p-6">
          {activeTab === "general" && (
            <GeneralInformationTab document={document} />
          )}
          {activeTab === "workingNotes" && <WorkingNotesTab />}
          {activeTab === "infoFromDocument" && <InfoFromDocumentTab />}
          {activeTab === "training" && <TrainingInformationTab />}
          {activeTab === "reviewers" && (
            <ReviewersTab reviewers={document.reviewers.map((name, i) => ({ id: String(i), name }))} />
          )}
          {activeTab === "approvers" && (
            <ApproversTab approvers={document.approvers.map((name, i) => ({ id: String(i), name }))} />
          )}
          {activeTab === "document" && <DocumentTab />}
          {activeTab === "signatures" && <SignaturesTab />}
          {activeTab === "audit" && <AuditTrailTab />}
        </div>
      </div>

      {/* Button below the card — standalone */}
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <Button
              onClick={handleBack}
              size="sm"
              variant="outline-emerald"
              className="whitespace-nowrap gap-2"
            >
              Back
            </Button>
            {document.status === "Effective" && (
              <Button
                size="sm"
                variant="outline-emerald"
                className="whitespace-nowrap gap-2"
                onClick={handleRequestControlledCopy}
              >
                Request Controlled Copy
              </Button>
            )}
          </div>

      {/* Sub-tab: Original Document */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <TabNav tabs={[{ id: "originalDocument", label: "Original Document" }]} activeTab="originalDocument" onChange={() => {}} />
        <div className="p-3 sm:p-4 md:p-6">
          <OriginalDocumentTab document={MOCK_ORIGINAL_DOCUMENT} />
        </div>
      </div>
    </div>
  );
};
