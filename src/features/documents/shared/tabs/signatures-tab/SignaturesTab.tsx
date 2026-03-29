import React from "react";

interface SignatureRecord {
  actionBy: string;
  actionByName: string;
  actionOn: string;
  actionOnValue: string;
}

const mockSignatures: SignatureRecord[] = [
  {
    actionBy: "Submitted By",
    actionByName: "Gilad Kigel",
    actionOn: "Submitted On (Date - Time)",
    actionOnValue: "2025-12-12 07:46:36",
  },
  {
    actionBy: "Rejected By",
    actionByName: "",
    actionOn: "Rejected On (Date - Time)",
    actionOnValue: "",
  },
  {
    actionBy: "Reviewed By",
    actionByName: "Jane Smith",
    actionOn: "Reviewed On (Date - Time)",
    actionOnValue: "2025-12-11 16:30:45",
  },
  {
    actionBy: "Approved By",
    actionByName: "John Doe",
    actionOn: "Approved On (Date - Time)",
    actionOnValue: "2025-12-12 09:15:20",
  },
  {
    actionBy: "Published By",
    actionByName: "Gilad Kigel",
    actionOn: "Published On (Date - Time)",
    actionOnValue: "2025-12-12 07:47:19",
  },
];

const READ_ONLY_CLASS =
  "w-full h-9 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-default";

export const SignaturesTab: React.FC = () => {
  return (
    <div className="space-y-4 md:space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {mockSignatures.map((record, index) => (
          <React.Fragment key={index}>
            {/* Action By */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs sm:text-sm font-medium text-slate-700">
                {record.actionBy}
              </label>
              <input
                type="text"
                value={record.actionByName}
                readOnly
                placeholder="—"
                className={READ_ONLY_CLASS}
              />
            </div>

            {/* Action On */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs sm:text-sm font-medium text-slate-700">
                {record.actionOn}
              </label>
              <input
                type="text"
                value={record.actionOnValue}
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
