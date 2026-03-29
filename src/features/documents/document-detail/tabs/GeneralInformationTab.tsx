import React from "react";
import { Calendar, User } from "lucide-react";
import { Select } from '@/components/ui/select/Select';
import { Popover } from '@/components/ui/popover/Popover';
import { Checkbox } from '@/components/ui/checkbox/Checkbox';

interface DocumentDetail {
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
}

interface GeneralInformationTabProps {
  document: DocumentDetail;
  isReadOnly?: boolean;
}

export const GeneralInformationTab: React.FC<GeneralInformationTabProps> = ({ document, isReadOnly = false }) => {
  return (
    <div className="space-y-4 md:space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {/* Document Number (read-only, auto-generated) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs sm:text-sm font-medium text-slate-700">Document Number</label>
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

        {/* Opened by & Author - Same row with 1-1 ratio */}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {/* Opened by (read-only, auto-generated) */}
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

          {/* Author */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs sm:text-sm font-medium text-slate-700">Author<span className="text-red-500 ml-1">*</span></label>
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
          <label className="text-xs sm:text-sm font-medium text-slate-700">Business Unit<span className="text-red-500 ml-1">*</span></label>
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

        {/* Document Name - Full width */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-xs sm:text-sm font-medium text-slate-700">Document Name<span className="text-red-500 ml-1">*</span></label>
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
            value={(document as any).titleLocalLanguage || ""}
            readOnly
            placeholder="—"
            className="w-full h-9 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-default"
          />
        </div>

        {/* Is Template */}
        <div className="flex items-center gap-3">
          <label className="text-xs sm:text-sm font-medium text-slate-700">Is Template?</label>
          <Checkbox id="isTemplate" checked={document.isTemplate} disabled={true} />
        </div>

        {/* Knowledge Base */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs sm:text-sm font-medium text-slate-700">Knowledge Base</label>
          <input
            type="text"
            value={document.knowledgeBase}
            readOnly
            className="w-full h-9 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-default"
          />
        </div>

        {/* Document Type */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs sm:text-sm font-medium text-slate-700">Document Type<span className="text-red-500 ml-1">*</span></label>
          <input
            type="text"
            value={document.type}
            readOnly
            className="w-full h-9 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-default"
          />
        </div>

        {/* Sub-Type */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs sm:text-sm font-medium text-slate-700">Sub-Type</label>
          <input
            type="text"
            value={document.subType}
            readOnly
            className="w-full h-9 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-default"
          />
        </div>

        {/* Periodic Review Cycle */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs sm:text-sm font-medium text-slate-700">Periodic Review Cycle (Months)<span className="text-red-500 ml-1">*</span></label>
          <input
            type="number"
            value={document.periodicReviewCycle}
            readOnly
            className="w-full h-9 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-default"
          />
        </div>

        {/* Periodic Review Notification */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs sm:text-sm font-medium text-slate-700">Periodic Review Notification (Days)<span className="text-red-500 ml-1">*</span></label>
          <input
            type="number"
            value={document.periodicReviewNotification}
            readOnly
            className="w-full h-9 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-default"
          />
        </div>

        {/* Effective Date (read-only, auto-generated) */}
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

        {/* Valid Until (read-only, auto-generated) */}
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

        {/* Language */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs sm:text-sm font-medium text-slate-700">Language</label>
          <input
            type="text"
            value={document.language}
            readOnly
            className="w-full h-9 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-default"
          />
        </div>

        {/* Review Date - Placeholder (not in interface) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs sm:text-sm font-medium text-slate-700">Review Date</label>
          <input
            type="text"
            value=""
            readOnly
            className="w-full h-9 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-default"
            placeholder="N/A"
          />
        </div>

        {/* Description - Full width */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-xs sm:text-sm font-medium text-slate-700">Description <span className="text-red-500">*</span></label>
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

const PopoverField = ({ label, value }: { label: string; value: string }) => (
  <div className="grid grid-cols-[110px_1fr] items-center gap-3">
    <label className="text-xs text-slate-500 text-right truncate" title={label}>{label}</label>
    <input
      type="text"
      value={value}
      readOnly
      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-default h-7"
    />
  </div>
);
