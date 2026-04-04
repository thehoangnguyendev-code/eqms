import React from "react";
import { ControlledCopy } from "../../types";
import { formatDateNumeric, formatDateTimePartsNumeric } from "@/utils/format";

interface DocumentInformationTabProps {
  controlledCopy: ControlledCopy;
}

export const DocumentInformationTab: React.FC<DocumentInformationTabProps> = ({
  controlledCopy,
}) => {
  return (
    <div className="space-y-4 md:space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">

        {/* Document Number */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs sm:text-sm font-medium text-slate-700">
            Document Number
          </label>
          <input
            type="text"
            value={controlledCopy.documentNumber}
            readOnly
            className="w-full h-9 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-default focus:outline-none"
          />
        </div>

        {/* Created */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs sm:text-sm font-medium text-slate-700">
            Created
          </label>
          <input
            type="text"
            value={formatDateTimePartsNumeric(controlledCopy.createdDate, controlledCopy.createdTime)}
            readOnly
            className="w-full h-9 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-default focus:outline-none"
          />
        </div>

        {/* Opened by */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs sm:text-sm font-medium text-slate-700">
            Opened by
          </label>
          <input
            type="text"
            value={controlledCopy.openedBy}
            readOnly
            className="w-full h-9 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-default focus:outline-none"
          />
        </div>

        {/* Business Unit */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs sm:text-sm font-medium text-slate-700">
            Business Unit
          </label>
          <input
            type="text"
            value={controlledCopy.department || ""}
            readOnly
            className="w-full h-9 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-default focus:outline-none"
          />
        </div>

        {/* Name - Full width */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-xs sm:text-sm font-medium text-slate-700">
            Name
          </label>
          <input
            type="text"
            value={controlledCopy.name}
            readOnly
            className="w-full h-9 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-default focus:outline-none"
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
            value={(controlledCopy as any).titleLocalLanguage || ""}
            readOnly
            placeholder="—"
            className="w-full h-9 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-default"
          />
        </div>

        {/* Document */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs sm:text-sm font-medium text-slate-700">
            Document
          </label>
          <input
            type="text"
            value={controlledCopy.document}
            readOnly
            className="w-full h-9 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-default focus:outline-none"
          />
        </div>

        {/* Document Revision */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs sm:text-sm font-medium text-slate-700">
            Document Revision
          </label>
          <input
            type="text"
            value={controlledCopy.version || ""}
            readOnly
            className="w-full h-9 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-default focus:outline-none"
          />
        </div>

        {/* Valid Until */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs sm:text-sm font-medium text-slate-700">
            Valid Until
          </label>
          <input
            type="text"
            value={formatDateNumeric(controlledCopy.validUntil)}
            readOnly
            className="w-full h-9 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-default focus:outline-none"
          />
        </div>

        {/* Revision Number */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs sm:text-sm font-medium text-slate-700">
            Revision Number
          </label>
          <input
            type="text"
            value={controlledCopy.version || ""}
            readOnly
            className="w-full h-9 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-default focus:outline-none"
          />
        </div>

        {/* Copy Number */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs sm:text-sm font-medium text-slate-700">
            Copy Number
          </label>
          <div className="space-y-1.5">
            <input
              type="text"
              value={controlledCopy.copyNumber?.toString() || "1"}
              readOnly
              className="w-full h-9 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-default focus:outline-none"
            />
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              The Copy Number field represents the n'th copy of the related revision
            </p>
          </div>
        </div>

        {/* Total Copies Number */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs sm:text-sm font-medium text-slate-700">
            Total Copies Number
          </label>
          <div className="space-y-1.5">
            <input
              type="text"
              value={controlledCopy.totalCopies?.toString() || "1"}
              readOnly
              className="w-full h-9 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-default focus:outline-none"
            />
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              The Total Copies Number field represents the total number of all copies of the related revision
            </p>
          </div>
        </div>

        {/* Recall Date */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs sm:text-sm font-medium text-slate-700">
            Recall Date
          </label>
          <input
            type="text"
            value=""
            readOnly
            className="w-full h-9 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-default focus:outline-none"
          />
        </div>

        {/* Delivered By */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs sm:text-sm font-medium text-slate-700">
            Delivered By
          </label>
          <input
            type="text"
            value=""
            readOnly
            className="w-full h-9 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-default focus:outline-none"
          />
        </div>

        {/* Comments - Full width */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-xs sm:text-sm font-medium text-slate-700">
            Comments
          </label>
          <textarea
            value={controlledCopy.reason || ""}
            readOnly
            rows={3}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-default"
          />
        </div>
      </div>
    </div>
  );
};
