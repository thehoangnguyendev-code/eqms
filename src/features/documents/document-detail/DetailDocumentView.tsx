import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { cn } from "@/components/ui/utils";
import { TabNav } from "@/components/ui/tabs/TabNav";
import {
  GeneralInformationTab,
  TrainingInformationTab,
  DocumentTab,
  SignaturesTab,
  AuditTrailTab,
} from "./tabs";
import { Button } from "@/components/ui/button/Button";
import { FullPageLoading } from "@/components/ui/loading/Loading";
import { Breadcrumb } from "@/components/ui/breadcrumb/Breadcrumb";
import { documentDetail } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { useNavigateWithLoading } from "@/hooks";

import {
  DocumentRevisionsTab,
  ControlledCopiesTab,
  RelatedDocumentsTab,
  CorrelatedDocumentsTab,
} from "@/features/documents/shared/tabs/general-tab/subtabs";
import type {
  Revision,
  Reviewer,
  Approver,
  RelatedDocument,
  ParentDocument,
} from "@/features/documents/shared/tabs/general-tab/subtabs";
import type { DocumentType, DocumentStatus } from "@/features/documents/types";
import {
  type DocumentDetail,
  USE_EMPTY_STATE,
  MOCK_REVISIONS,
  MOCK_RELATED_DOCUMENTS,
  MOCK_PARENT_DOCUMENT,
  MOCK_DOCUMENT,
} from "./mockData";
import { ReadOnlyReviewersTable } from "./components/ReadOnlyReviewersTable";
import { ReadOnlyApproversTable } from "./components/ReadOnlyApproversTable";

// --- Types ---
type TabType = "general" | "training" | "document" | "signatures" | "audit";
type SubTabType =
  | "revisions"
  | "reviewers"
  | "approvers"
  | "controlledCopies"
  | "relatedDocuments"
  | "correlatedDocuments";

interface DetailDocumentViewProps {
  documentId: string;
  onBack: () => void;
  initialTab?: TabType;
  initialStatus?: DocumentStatus;
}

export const DetailDocumentView: React.FC<DetailDocumentViewProps> = ({
  documentId,
  onBack,
  initialTab = "general",
  initialStatus,
}) => {
  const location = useLocation();
  const { navigateTo, isNavigating } = useNavigateWithLoading();
  const state = location.state as {
    initialStatus?: DocumentStatus;
    fromArchive?: boolean;
  };

  // In real app, fetch document by documentId
  // Override status if coming from archive
  const document = {
    ...MOCK_DOCUMENT,
    status: initialStatus || state?.initialStatus || MOCK_DOCUMENT.status,
  };
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  // Sub-tab state (for active documents)
  const [activeSubTab, setActiveSubTab] = useState<SubTabType>("revisions");
  const [reviewers, setReviewers] = useState<Reviewer[]>(
    USE_EMPTY_STATE
      ? []
      : document.reviewers.map((name, i) => ({
          id: String(i + 1),
          name,
          username: name.toLowerCase().replace(" ", "."),
          role: "Reviewer",
          email: `${name.toLowerCase().replace(" ", ".")}@company.com`,
          department: document.department,
          order: i + 1,
        })),
  );
  const [approvers, setApprovers] = useState<Approver[]>(
    USE_EMPTY_STATE
      ? []
      : document.approvers.map((name, i) => ({
          id: String(i + 1),
          name,
          username: name.toLowerCase().replace(" ", "."),
          role: "Approver",
          email: `${name.toLowerCase().replace(" ", ".")}@company.com`,
          department: document.department,
        })),
  );
  const [relatedDocuments, setRelatedDocuments] = useState<RelatedDocument[]>(
    USE_EMPTY_STATE ? [] : MOCK_RELATED_DOCUMENTS,
  );
  const [parentDocument, setParentDocument] = useState<ParentDocument | null>(
    USE_EMPTY_STATE ? null : MOCK_PARENT_DOCUMENT,
  );

  // Document status workflow steps
  const statusSteps: DocumentStatus[] = [
    "Draft",
    "Active",
    "Obsoleted",
    "Closed - Cancelled",
  ];
  const currentStepIndex =
    statusSteps.indexOf(document.status) !== -1
      ? statusSteps.indexOf(document.status)
      : statusSteps.indexOf("Active"); // Fallback for mock if mismatched

  const handleShare = () => {
    console.log("Share document:", documentId);
    // TODO: Implement share functionality
  };

  const handleViewHistory = () => {
    console.log("View history:", documentId);
    // TODO: Implement view history functionality
  };

  const tabs = [
    { id: "general" as TabType, label: "General Information" },
    { id: "training" as TabType, label: "Training Information" },
    { id: "document" as TabType, label: "Document" },
    { id: "signatures" as TabType, label: "Signatures" },
    { id: "audit" as TabType, label: "Audit Trail" },
  ];

  const subTabs = [
    { id: "revisions" as SubTabType, label: "Document Revisions" },
    { id: "reviewers" as SubTabType, label: "Reviewers" },
    { id: "approvers" as SubTabType, label: "Approvers" },
    { id: "controlledCopies" as SubTabType, label: "Controlled Copies" },
    { id: "relatedDocuments" as SubTabType, label: "Related Documents" },
    { id: "correlatedDocuments" as SubTabType, label: "Correlated Documents" },
  ];

  return (
    <div className="space-y-6 w-full">
      {/* Header: Title + Breadcrumb + Actions */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-row flex-wrap items-end justify-between gap-3 md:gap-4">
          <div className="min-w-[200px] flex-1">
            <h1 className="text-lg md:text-xl lg:text-2xl font-bold tracking-tight text-slate-900">
              Document Details
            </h1>
            <Breadcrumb
              items={documentDetail(navigateTo, {
                fromArchive: state?.fromArchive,
              })}
            />
          </div>
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <Button
              onClick={() => {
                onBack();
              }}
              size="sm"
              variant="outline-emerald"
              className="whitespace-nowrap"
            >
              Back
            </Button>
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
                        ? "polygon(0% 0%, calc(100% - 20px) 0%, 100% 50%, calc(100% - 20px) 100%, 0% 100%)" // Đầu nhọn, đuôi phẳng
                        : isLast
                          ? "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 20px 50%)" // Đầu phẳng, đuôi cắt chữ V
                          : "polygon(0% 0%, calc(100% - 20px) 0%, 100% 50%, calc(100% - 20px) 100%, 0% 100%, 20px 50%)", // Đầu nhọn, đuôi cắt chữ V
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
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <TabNav tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as TabType)} />

        {/* Tab Content */}
        <div className="p-3 sm:p-4 md:p-6">
          {activeTab === "general" && (
            <GeneralInformationTab document={document} />
          )}
          {activeTab === "training" && <TrainingInformationTab />}
          {activeTab === "document" && <DocumentTab />}
          {activeTab === "signatures" && <SignaturesTab />}
          {activeTab === "audit" && <AuditTrailTab />}
        </div>
      </div>
      {/* Footer Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        <Button
          onClick={() => {
            onBack();
          }}
          size="sm"
          variant="outline-emerald"
          className="whitespace-nowrap"
        >
          Back
        </Button>
      </div>

      {/* Sub-tabs (separate card, shown on General tab) */}
      {activeTab === "general" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <TabNav tabs={subTabs} activeTab={activeSubTab} onChange={(id) => setActiveSubTab(id as SubTabType)} />

          <div className="p-3 sm:p-4 md:p-6">
            {activeSubTab === "revisions" && (
              <DocumentRevisionsTab
                revisions={USE_EMPTY_STATE ? [] : MOCK_REVISIONS}
              />
            )}
            {activeSubTab === "reviewers" && (
              <ReadOnlyReviewersTable reviewers={reviewers} />
            )}
            {activeSubTab === "approvers" && (
              <ReadOnlyApproversTable approvers={approvers} />
            )}
            {activeSubTab === "controlledCopies" && (
              <ControlledCopiesTab copies={USE_EMPTY_STATE ? [] : undefined} />
            )}
            {activeSubTab === "relatedDocuments" && (
              <RelatedDocumentsTab
                relatedDocuments={relatedDocuments}
                onRelatedDocumentsChange={setRelatedDocuments}
              />
            )}
            {activeSubTab === "correlatedDocuments" && (
              <CorrelatedDocumentsTab
                parentDocument={parentDocument}
                onParentDocumentChange={setParentDocument}
              />
            )}
          </div>
        </div>
      )}
      {isNavigating && <FullPageLoading text="Loading..." />}
    </div>
  );
};

