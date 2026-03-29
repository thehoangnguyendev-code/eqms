import React from "react";
import { Package, Code2, FileText, Info } from "lucide-react";
import { StatusBadge } from "@/components/ui";
import type { ApplicationInfo } from "../types";
import { formatDateTimeLong } from "@/utils/format";

interface ApplicationTabProps {
  data: ApplicationInfo;
}

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
    <div className="p-5 space-y-4">
      {/* Card: Application Details */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 bg-slate-50/70 border-b border-slate-200">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-100 flex-shrink-0">
            <Package className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Application Details</h3>
            <p className="text-xs text-slate-500 mt-0.5">Build & version information</p>
          </div>
        </div>
        <div className="p-5">
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
        </div>
      </div>

      {/* Card: Technology Stack */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 bg-slate-50/70 border-b border-slate-200">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-100 flex-shrink-0">
            <Code2 className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Technology Stack</h3>
            <p className="text-xs text-slate-500 mt-0.5">Frameworks and tools</p>
          </div>
        </div>
        <div className="p-5">
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
        </div>
      </div>

      {/* Card: Description */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 bg-slate-50/70 border-b border-slate-200">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-slate-100 flex-shrink-0">
            <FileText className="h-4 w-4 text-slate-600" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">Description</h3>
        </div>
        <div className="p-5">
          <p className="text-sm text-slate-700 leading-relaxed">{data.description}</p>
        </div>
      </div>

      {/* Notice */}
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




