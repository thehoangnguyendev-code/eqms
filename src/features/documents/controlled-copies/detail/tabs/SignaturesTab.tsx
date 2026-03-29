import React from "react";
import { Popover } from "@/components/ui/popover/Popover";

interface SignatureRecord {
  actionBy: string;
  actionByName: string;
  actionOn: string;
  actionOnValue: string;
}

// Popover content for user details
const UserDetailPopoverContent: React.FC = () => {
  return (
    <div className="p-4">
      <p className="text-sm text-slate-600">User details would be displayed here</p>
    </div>
  );
};

const mockSignatures: SignatureRecord[] = [
  {
    actionBy: "Requested By",
    actionByName: "Shani Rosenblit",
    actionOn: "Requested On",
    actionOnValue: "05/12/2025 06:47:23"
  },
  {
    actionBy: "Distributed By",
    actionByName: "Shani Rosenblit",
    actionOn: "Distributed On",
    actionOnValue: "05/12/2025 06:49:38"
  },
  {
    actionBy: "Obsoleted By",
    actionByName: "",
    actionOn: "Obsoleted On",
    actionOnValue: ""
  }
];

export const SignaturesTab: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        {mockSignatures.map((record, index) => (
          <React.Fragment key={index}>
            {/* Action By Column */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs sm:text-sm font-medium text-slate-700">
                {record.actionBy}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={record.actionByName}
                  readOnly
                  className="flex-1 h-9 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-default"
                />
              </div>
            </div>

            {/* Action On Column */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs sm:text-sm font-medium text-slate-700">
                {record.actionOn}
              </label>
              <input
                type="text"
                value={record.actionOnValue}
                readOnly
                className="h-9 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-default"
              />
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
