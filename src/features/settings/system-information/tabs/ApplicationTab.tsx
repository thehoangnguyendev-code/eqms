import React from "react";
import { Package, Code2, FileText, Info } from "lucide-react";
import { StatusBadge } from "@/components/ui";
import type { ApplicationInfo } from "../types";
import { formatDateTimeLong } from "@/utils/format";

interface ApplicationTabProps {
  data: ApplicationInfo;
}

const SettingsCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="flex items-center gap-2.5 px-4 md:px-5 py-4 border-b border-slate-100">
      <span className="text-emerald-600">{icon}</span>
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
    </div>
    <div className="p-4 md:p-5">{children}</div>
  </div>
);

export const ApplicationTab: React.FC<ApplicationTabProps> = ({ data }) => {
  const getEnvironmentBadge = (env: string) => {
    const badges = {
      production: "effective",
      staging: "pendingApproval",
      development: "draft",
    };
    return badges[env as keyof typeof badges] || "draft";
  };

  return (
    <div className="p-4 md:p-5 space-y-4">
      {/* Card: Application Details */}
      <SettingsCard title="Application Details" icon={<Package className="h-4 w-4" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
              Application Name
            </label>
            <input
              type="text"
              value={data.name}
              readOnly
              className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 cursor-default focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
              Version
            </label>
            <input
              type="text"
              value={data.version}
              readOnly
              className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 cursor-default focus:outline-none  font-semibold"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
              Environment
            </label>
            <div className="flex items-center h-9 px-3.5 border border-slate-200 rounded-lg bg-slate-50">
              <StatusBadge status={getEnvironmentBadge(data.environment) as any} />
              <span className="ml-2 text-sm text-slate-700 font-medium capitalize">
                {data.environment}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
              Build Number
            </label>
            <input
              type="text"
              value={data.buildNumber}
              readOnly
              className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 cursor-default focus:outline-none "
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
              Build Date
            </label>
            <input
              type="text"
              value={formatDateTimeLong(data.buildDate)}
              readOnly
              className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 cursor-default focus:outline-none"
            />
          </div>
        </div>
      </SettingsCard>

      {/* Card: Technology Stack */}
      <SettingsCard title="Technology Stack" icon={<Code2 className="h-4 w-4" />}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
              Framework
            </label>
            <input
              type="text"
              value={data.frameworkVersion}
              readOnly
              className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 cursor-default focus:outline-none "
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
              TypeScript
            </label>
            <input
              type="text"
              value={data.typeScriptVersion}
              readOnly
              className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 cursor-default focus:outline-none "
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
              Build Tool
            </label>
            <input
              type="text"
              value={data.buildTool}
              readOnly
              className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 cursor-default focus:outline-none "
            />
          </div>
        </div>
      </SettingsCard>

      {/* Card: Description */}
      <SettingsCard title="Description" icon={<FileText className="h-4 w-4" />}>
        <p className="text-sm text-slate-700 leading-relaxed">{data.description}</p>
      </SettingsCard>

      <div className="flex gap-3 px-4 py-3.5 bg-blue-50 border border-blue-200 rounded-xl">
        <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-blue-900 mb-0.5">Read-only Information</p>
          <p className="text-xs text-blue-700">
            This information is automatically updated with each deployment. Reference the build number and version for support inquiries.
          </p>
        </div>
      </div>
    </div>
  );
};




