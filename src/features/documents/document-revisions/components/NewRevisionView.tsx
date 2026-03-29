import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ROUTES } from "@/app/routes.constants";
import {
  FileText,
  AlertCircle,
  AlertTriangle,
  Check,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import { cn } from "@/components/ui/utils";
import { AlertModal } from "@/components/ui/modal/AlertModal";
import { Breadcrumb } from "@/components/ui/breadcrumb/Breadcrumb";
import { newRevision } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { FullPageLoading } from "@/components/ui/loading/Loading";
import { useNavigateWithLoading } from "@/hooks";
import {
  type LinkedDocument,
  type SourceDocument,
  MOCK_SOURCE_DOCUMENT,
  MOCK_LINKED_DOCUMENTS,
} from "./mockData";

export const NewRevisionView: React.FC = () => {
  const { navigateTo, isNavigating } = useNavigateWithLoading();
  const location = useLocation();
  const state = location.state as any;
  // Preserve origin so Cancel/breadcrumb returns to the correct list
  const fromPath: string = state?.from ?? ROUTES.DOCUMENTS.REVISIONS.ALL;

  // Get sourceDocId from URL query params
  const searchParams = new URLSearchParams(location.search);
  const sourceDocId = searchParams.get("sourceDocId");

  // TODO: Fetch source document data based on sourceDocId
  // For now, using MOCK_SOURCE_DOCUMENT
  useEffect(() => {
    if (sourceDocId) {
      // TODO: Fetch document details and linked documents from API
    }
  }, [sourceDocId]);

  // State for impact decisions
  const [impactDecisions, setImpactDecisions] = useState<{
    [key: string]: boolean;
  }>(
    MOCK_LINKED_DOCUMENTS.reduce(
      (acc, doc) => {
        acc[doc.id] = false; // false = Keep current, true = Upgrade
        return acc;
      },
      {} as { [key: string]: boolean },
    ),
  );

  const [reasonForChange, setReasonForChange] = useState("");
  const [showError, setShowError] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Restore state from navigation (when coming back from Workspace)
  useEffect(() => {
    if (state?.impactDecisions) {
      setImpactDecisions(state.impactDecisions);
    }
    if (state?.reasonForChange) {
      setReasonForChange(state.reasonForChange);
    }
  }, []);

  const handleBack = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelModal(false);
    navigateTo(fromPath);
  };

  const handleToggleDecision = (docId: string) => {
    setImpactDecisions((prev) => ({
      ...prev,
      [docId]: !prev[docId],
    }));
  };

  const handleSubmit = () => {
    // Validate reason for change
    if (!reasonForChange.trim() || reasonForChange.length < 50) {
      setShowError(true);
      return;
    }

    // Navigate to workspace with all the data
    navigateTo(ROUTES.DOCUMENTS.REVISIONS.WORKSPACE, {
      state: {
        sourceDocument: MOCK_SOURCE_DOCUMENT,
        impactDecisions,
        linkedDocuments: MOCK_LINKED_DOCUMENTS,
        reasonForChange,
      },
    });
  };

  // Count upgrades
  const upgradeCount = Object.values(impactDecisions).filter((v) => v).length;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 lg:gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg md:text-xl lg:text-2xl font-bold tracking-tight text-slate-900 mb-2">
              Upgrade Revision - Impact Analysis
            </h1>
            <Breadcrumb items={newRevision(navigateTo)} />
          </div>
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <Button
              size="sm"
              variant="outline-emerald"
              onClick={() => setShowCancelModal(true)}
              className="whitespace-nowrap flex items-center gap-2"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="outline-emerald"
              onClick={handleSubmit}
              disabled={!reasonForChange.trim() || reasonForChange.length < 50}
              className="shadow-sm whitespace-nowrap"
            >
              Continue
            </Button>
          </div>
        </div>
      </div>

      {/* Source Document Info */}
      <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-white shadow-sm p-4 lg:p-6">
        <div className="flex items-start gap-3 lg:gap-4">
          <div className="flex-shrink-0 w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
            <FileText className="h-5 w-5 lg:h-6 lg:w-6 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-base lg:text-lg font-semibold text-slate-900 mb-1">
              Source Document
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mt-2 lg:mt-3">
              <div>
                <p className="text-xs text-slate-500 mb-1">Document Code</p>
                <p className="text-sm font-semibold text-slate-900">
                  {MOCK_SOURCE_DOCUMENT.code}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Document Name</p>
                <p className="text-xs sm:text-sm font-medium text-slate-700">
                  {MOCK_SOURCE_DOCUMENT.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Current Version</p>
                <p className="text-sm font-semibold text-emerald-600">
                  {MOCK_SOURCE_DOCUMENT.version}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Next Version</p>
                <p className="text-sm font-semibold text-blue-600">2.0</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 lg:p-4 flex items-start gap-2 lg:gap-3">
        <Info className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-xs lg:text-sm font-semibold text-blue-900 mb-1">
            Impact analysis of Related Documents
          </h3>
          <p className="text-xs lg:text-sm text-blue-700">
            Review all related documents (Forms, Annexes, References) and decide
            whether to keep the current version or upgrade to the new revision.
            Documents marked for upgrade will be highlighted below.
          </p>
        </div>
      </div>

      {/* Impact Analysis Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="bg-white border-b border-slate-200 px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 lg:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
            <div>
              <h2 className="text-xs sm:text-sm lg:text-base font-semibold text-slate-900">
                Related Documents ({MOCK_LINKED_DOCUMENTS.length})
              </h2>
              <p className="text-[10px] sm:text-xs lg:text-sm text-slate-500 mt-0.5 sm:mt-1">
                {upgradeCount} document(s) selected for upgrade
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] sm:text-xs lg:text-sm flex-wrap">
              <span className="text-slate-600">Legend:</span>
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100">
                <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                <span className="text-xs text-slate-700">Keep</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-100">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-xs text-emerald-700">Upgrade</span>
              </div>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider w-10 sm:w-16">
                  No.
                </th>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Revision Number
                </th>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Revision Name
                </th>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">
                  Type
                </th>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">
                  Current Version
                </th>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Next Version
                </th>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Decision
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {MOCK_LINKED_DOCUMENTS.map((doc, index) => {
                const isUpgrade = impactDecisions[doc.id];
                return (
                  <tr
                    key={doc.id}
                    className={cn(
                      "transition-all duration-200",
                      isUpgrade
                        ? "bg-emerald-50/50 hover:bg-emerald-50"
                        : "hover:bg-slate-50",
                    )}
                  >
                    <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-slate-700">
                      {index + 1}
                    </td>
                    <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm font-medium text-emerald-600">
                      {doc.code}
                    </td>
                    <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-slate-700">
                      {doc.name}
                    </td>
                    <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm hidden md:table-cell">
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border",
                          doc.type === "Form" &&
                          "bg-blue-50 text-blue-700 border-blue-200",
                          doc.type === "Annex" &&
                          "bg-purple-50 text-purple-700 border-purple-200",
                          doc.type === "Reference" &&
                          "bg-amber-50 text-amber-700 border-amber-200",
                        )}
                      >
                        {doc.type}
                      </span>
                    </td>
                    <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm font-medium text-slate-700 hidden md:table-cell">
                      {doc.currentVersion}
                    </td>
                    <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm">
                      {isUpgrade ? (
                        <span className="font-semibold text-blue-600">
                          {doc.nextVersion}
                        </span>
                      ) : (
                        <span className="font-medium text-slate-700">
                          {doc.currentVersion}
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-center">
                      <div className="flex items-center justify-center gap-1 sm:gap-3">
                        <span
                          className={cn(
                            "text-xs font-medium transition-colors",
                            isUpgrade ? "text-slate-400" : "text-slate-700",
                          )}
                        >
                          Keep
                        </span>
                        <button
                          onClick={() => handleToggleDecision(doc.id)}
                          className={cn(
                            "relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:ring-offset-2",
                            isUpgrade ? "bg-emerald-500" : "bg-slate-300",
                          )}
                          role="switch"
                          aria-checked={isUpgrade}
                        >
                          <span
                            className={cn(
                              "inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform duration-200",
                              isUpgrade
                                ? "translate-x-5 sm:translate-x-6"
                                : "translate-x-0.5 sm:translate-x-1",
                            )}
                          />
                        </button>
                        <span
                          className={cn(
                            "text-xs font-medium transition-colors",
                            isUpgrade ? "text-emerald-700" : "text-slate-400",
                          )}
                        >
                          Upgrade
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {/* Summary Footer */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 lg:p-6">
        <div>
          <h3 className="text-xs lg:text-sm font-semibold text-slate-900 mb-1.5 lg:mb-2">
            Impact Analysis Summary
          </h3>
          <div className="flex flex-wrap items-center gap-3 lg:gap-4 text-xs lg:text-sm">
            <div className="flex items-center gap-2">
              <span className="text-slate-600">Total Related Documents:</span>
              <span className="font-semibold text-slate-900">
                {MOCK_LINKED_DOCUMENTS.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-600">To be Upgraded:</span>
              <span className="font-semibold text-emerald-600">
                {upgradeCount}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-600">Keep Current:</span>
              <span className="font-semibold text-slate-600">
                {MOCK_LINKED_DOCUMENTS.length - upgradeCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Reason for Change */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4 lg:p-6">
        <div className="flex items-start gap-2 lg:gap-3 mb-3 lg:mb-4">
          <div className="flex-1">
            <label className="block text-xs lg:text-sm font-semibold text-slate-900 mb-1">
              Reason for Change <span className="text-red-500">*</span>
            </label>
            <p className="text-xs lg:text-xs text-slate-500 mb-2">
              Provide a detailed explanation for creating this revision and the
              impact on related documents.
            </p>
          </div>
        </div>
        <textarea
          value={reasonForChange}
          onChange={(e) => {
            setReasonForChange(e.target.value);
            setShowError(false);
          }}
          placeholder="e.g., Updated testing procedures to comply with new regulatory requirements. Forms FORM.0001.01 and FORM.0002.01 require updates to reflect new data fields..."
          className={cn(
            "w-full px-3 lg:px-4 py-2 lg:py-3 border rounded-lg text-xs lg:text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 resize-none",
            showError && reasonForChange.length < 50
              ? "border-red-300 bg-red-50"
              : "border-slate-200 bg-white",
          )}
          rows={4}
          maxLength={2000}
        />
        {showError && reasonForChange.length < 50 && (
          <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {!reasonForChange.trim()
              ? "Reason for change is required before submitting"
              : `Minimum 50 characters required (${reasonForChange.length}/50)`}
          </p>
        )}
        <div className="flex items-center justify-between">
          <p
            className={cn(
              "text-xs",
              reasonForChange.length < 50
                ? "text-amber-600 font-medium"
                : "text-slate-500",
            )}
          >
            {reasonForChange.length} / 2000 characters
          </p>
          <p
            className={cn(
              "text-xs",
              reasonForChange.length < 50
                ? "text-amber-600 font-medium"
                : "text-emerald-600",
            )}
          >
            {reasonForChange.length >= 50 ? (
              <>
                <Check className="h-3.5 w-3.5 inline shrink-0" /> Minimum met
              </>
            ) : (
              "Minimum 50 characters required"
            )}
          </p>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        <Button
          size="sm"
          variant="outline-emerald"
          onClick={() => setShowCancelModal(true)}
          className="whitespace-nowrap flex items-center gap-2"
        >
          Cancel
        </Button>
        <Button
          size="sm"
          variant="outline-emerald"
          onClick={handleSubmit}
          disabled={!reasonForChange.trim() || reasonForChange.length < 50}
          className="shadow-sm whitespace-nowrap"
        >
          Continue
        </Button>
      </div>

      {/* Cancel Confirmation Modal */}
      <AlertModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
        type="warning"
        title="Cancel Impact Analysis?"
        description={
          <div className="space-y-3">
            <p>Are you sure you want to cancel the current Impact Analysis?</p>
            <div className="text-xs bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-1">
              <p className="text-amber-800">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600 inline shrink-0" />{" "}
                <span className="font-semibold">Warning:</span> All unsaved
                changes will be lost.
              </p>
              {upgradeCount > 0 && (
                <p>
                  <span className="font-semibold">Pending Decisions:</span>{" "}
                  {upgradeCount} document(s) marked for upgrade
                </p>
              )}
              {reasonForChange && (
                <p>
                  <span className="font-semibold">Draft Reason:</span>{" "}
                  {reasonForChange.length} characters written
                </p>
              )}
            </div>
            <p className="text-xs text-slate-500">
              You will be redirected back to the All Documents screen.
            </p>
          </div>
        }
        confirmText="Yes, Cancel"
        cancelText="No, Stay"
        showCancel={true}
      />

      {isNavigating && <FullPageLoading text="Loading..." />}
    </div>
  );
};
