import React from "react";

interface InfoFromDocumentTabProps {
  documentCode?: string;
  documentName?: string;
  documentCreated?: string;
  documentType?: string;
  documentVersion?: string;
  documentStatus?: string;
  documentAuthor?: string;
  reasonForChange?: string;
}

export const InfoFromDocumentTab: React.FC<InfoFromDocumentTabProps> = ({
  documentCode,
  documentName,
  documentCreated,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Document Name — full width */}
      <div className="sm:col-span-2 flex flex-col gap-1.5">
        <label className="block text-xs sm:text-sm font-medium text-slate-700">Document Name</label>
        <input
          type="text"
          value={documentName ?? ""}
          readOnly
          placeholder="—"
          className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none cursor-default placeholder:text-slate-400"
        />
      </div>
      {/* Document Number + Document Created — same row */}
      <div className="flex flex-col gap-1.5">
        <label className="block text-xs sm:text-sm font-medium text-slate-700">Document Number</label>
        <input
          type="text"
          value={documentCode ?? ""}
          readOnly
          placeholder="—"
          className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none cursor-default placeholder:text-slate-400"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="block text-xs sm:text-sm font-medium text-slate-700">Document Created</label>
        <input
          type="text"
          value={documentCreated ?? ""}
          readOnly
          placeholder="—"
          className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none cursor-default placeholder:text-slate-400"
        />
      </div>
    </div>
  );
};
