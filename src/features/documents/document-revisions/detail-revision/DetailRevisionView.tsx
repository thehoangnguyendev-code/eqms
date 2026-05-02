import React, { useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
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
import { PageHeader } from "@/components/ui/page/PageHeader";
import { revisionDetail } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { ROUTES } from "@/app/routes.constants";
import { FullPageLoading } from "@/components/ui/loading/Loading";
import { useNavigateWithLoading } from "@/hooks";
import { OriginalDocumentTab } from "@/features/documents/document-revisions/subtabs";
import type { OriginalDocumentInfo } from "@/features/documents/document-revisions/subtabs";

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
  const [searchParams] = useSearchParams();
  const { navigateTo, isNavigating } = useNavigateWithLoading();
  const state = location.state as { initialStatus?: DocumentStatus };
  const urlTab = searchParams.get('tab') as TabType;

  // In real app, fetch revision by documentId
  const document = {
    ...MOCK_REVISION,
    status: initialStatus || state?.initialStatus || MOCK_REVISION.status,
  };
  const [activeTab, setActiveTab] = useState<TabType>(urlTab || initialTab || "general");

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
        <PageHeader
          title="Revision Details"
          breadcrumbItems={revisionDetail(navigateTo)}
          actions={
            <>
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
            </>
          }
        />
      </div>

      {/* Status Stepper */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Mobile View (Compact circles) */}
        <div className="flex sm:hidden items-center justify-start gap-0 px-2 py-4 bg-slate-50/50 border-b border-slate-100 overflow-x-auto">
          <div className="flex items-center justify-start min-w-max mx-auto">
            {REVISION_STATUS_STEPS.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isLast = index === REVISION_STATUS_STEPS.length - 1;

              return (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center gap-1.5 select-none w-[80px] flex-shrink-0">
                    <div
                      className={cn(
                        "relative w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold transition-all shadow-sm",
                        isCompleted
                          ? "bg-emerald-600 text-white"
                          : isCurrent
                          ? "bg-emerald-600 text-white ring-4 ring-emerald-100"
                          : "bg-slate-100 text-slate-400 border border-slate-200",
                      )}
                    >
                      {isCompleted ? <Check className="h-3.5 w-3.5" /> : index + 1}
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-semibold text-center leading-tight transition-colors whitespace-normal break-words max-w-[72px] min-h-[24px]",
                        isCurrent
                          ? "text-emerald-700"
                          : isCompleted
                          ? "text-emerald-700"
                          : "text-slate-400",
                      )}
                    >
                      {step}
                    </span>
                  </div>
                  {!isLast && (
                    <div
                      className={cn(
                        "w-6 h-0.5 flex-shrink-0 transition-all self-start mt-3.5 rounded-full",
                        isCompleted ? "bg-emerald-500" : "bg-slate-200",
                      )}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Desktop View (Arrow shapes) */}
        <div className="hidden sm:block overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
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
        <div className="p-4 md:p-5">
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
        <TabNav tabs={[{ id: "originalDocument", label: "Original Document" }]} activeTab="originalDocument" onChange={() => { }} />
        <div className="p-4 md:p-5">
          <OriginalDocumentTab document={MOCK_ORIGINAL_DOCUMENT} />
        </div>
      </div>
    </div>
  );
};
