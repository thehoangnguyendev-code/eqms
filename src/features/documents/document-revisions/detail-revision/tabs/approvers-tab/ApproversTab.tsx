import React from "react";

interface Approver {
  id: string;
  name: string;
  signedOn?: string;
}

interface ApproversTabProps {
  approvers: Approver[];
}

const READ_ONLY_CLASS =
  "w-full h-9 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-default";

export const ApproversTab: React.FC<ApproversTabProps> = ({ approvers }) => {
  const rows = approvers.length > 0
    ? approvers
    : [{ id: "empty", name: "", signedOn: undefined }];

  return (
    <div className="space-y-4 md:space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {rows.map((approver, index) => (
          <React.Fragment key={approver.id}>
            {/* Approver Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs sm:text-sm font-medium text-slate-700">
                Approver {index + 1}
              </label>
              <input
                type="text"
                value={approver.name}
                readOnly
                placeholder="—"
                className={READ_ONLY_CLASS}
              />
            </div>

            {/* Signed On */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs sm:text-sm font-medium text-slate-700">
                Signed On (dd/MM/yyyy HH:mm:ss)
              </label>
              <input
                type="text"
                value={approver.signedOn || ""}
                readOnly
                placeholder="—"
                className={READ_ONLY_CLASS}
              />
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
