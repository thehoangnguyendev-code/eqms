import React from "react";

export interface GeneralInformationDocumentDetail {
  documentId: string;
  title: string;
  type: string;
  created: string;
  openedBy: string;
  author: string;
  isTemplate: boolean;
  businessUnit: string;
  department: string;
  knowledgeBase: string;
  subType: string;
  periodicReviewCycle: number;
  periodicReviewNotification: number;
  effectiveDate: string;
  validUntil: string;
  language: string;
  description: string;
  titleLocalLanguage?: string;
}

interface GeneralInformationTabProps {
  document: GeneralInformationDocumentDetail;
  isReadOnly?: boolean;
}

export const GeneralInformationTab: React.FC<GeneralInformationTabProps> = ({ document, isReadOnly = false }) => {
  return (
    <div className="space-y-4 md:space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {/* Revision Number (read-only, auto-generated) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs sm:text-sm font-medium text-slate-700">Revision Number</label>
          <input
            type="text"
            value={document.documentId}
            readOnly
            className="w-full h-9 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-default"
            placeholder="Auto-generated after save"
          />
        </div>

        {/* Created (read-only, auto-generated) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs sm:text-sm font-medium text-slate-700">Created (Date - Time)</label>
          <input
            type="text"
            value={document.created}
            readOnly
            className="w-full h-9 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-default"
            placeholder="Auto-generated after save"
          />
        </div>

        {/* Opened by & Author - Same row */}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs sm:text-sm font-medium text-slate-700">Opened by</label>
            <input
              type="text"
              value={document.openedBy}
              readOnly
              className="w-full h-9 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-default"
              placeholder="Auto-generated after save"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs sm:text-sm font-medium text-slate-700">
              Author<span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              value={document.author}
              readOnly
              className="w-full h-9 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-default"
            />
          </div>
        </div>

        {/* Business Unit */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs sm:text-sm font-medium text-slate-700">
            Business Unit<span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            value={document.businessUnit}
            readOnly
            className="w-full h-9 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-default"
          />
        </div>

        {/* Department */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs sm:text-sm font-medium text-slate-700">Department</label>
          <input
            type="text"
            value={document.department}
            readOnly
            className="w-full h-9 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-default"
          />
        </div>

        {/* Revision Name - Full width */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-xs sm:text-sm font-medium text-slate-700">
            Revision Name<span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            value={document.title}
            readOnly
            className="w-full h-9 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-default"
          />
        </div>

        {/* Title in Local Language - Full width */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-xs sm:text-sm font-medium text-slate-700">
            Title in Local Language
            <span className="text-slate-400 text-xs font-normal ml-1.5">(optional)</span>
          </label>
          <input
            type="text"
            value={document.titleLocalLanguage ?? ""}
            readOnly
            placeholder="—"
            className="w-full h-9 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-default"
          />
        </div>

        {/* Effective Date */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs sm:text-sm font-medium text-slate-700">Effective Date (dd/MM/yyyy)</label>
          <input
            type="text"
            value={document.effectiveDate}
            readOnly
            className="w-full h-9 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-default"
            placeholder="Set when approved"
          />
        </div>

        {/* Valid Until */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs sm:text-sm font-medium text-slate-700">Valid Until (dd/MM/yyyy)</label>
          <input
            type="text"
            value={document.validUntil}
            readOnly
            className="w-full h-9 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-default"
            placeholder="Set when approved"
          />
        </div>

        {/* Note - Full width */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-xs sm:text-sm font-medium text-slate-700">
            Note <span className="text-red-500">*</span>
          </label>
          <textarea
            value={document.description}
            rows={4}
            readOnly
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-default"
          />
        </div>
      </div>
    </div>
  );
};
