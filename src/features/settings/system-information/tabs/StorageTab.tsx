import React from "react";
import { HardDrive, FileText, Upload, Clock, Info } from "lucide-react";
import type { StorageInfo } from "../types";
import { formatDateTime } from "@/utils/format";

interface StorageTabProps {
  data: StorageInfo;
}

const SettingsCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  noPadding?: boolean;
}> = ({ title, icon, children, noPadding = false }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
      <span className="text-emerald-600">{icon}</span>
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
    </div>
    <div className={noPadding ? "" : "p-5"}>{children}</div>
  </div>
);

export const StorageTab: React.FC<StorageTabProps> = ({ data }) => {
  const getUsageColor = (percent: number) => {
    if (percent >= 80) return "bg-red-600";
    if (percent >= 60) return "bg-amber-500";
    return "bg-emerald-600";
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "PDF":
        return "bg-red-100 text-red-700 border-red-200";
      case "DOCX":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "XLSX":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "Images":
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="p-5 space-y-4">
      {/* Card: Storage Overview */}
      <SettingsCard title="Storage Overview" icon={<HardDrive className="h-4 w-4" />}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <p className="text-xs font-medium text-slate-500 mb-1">Provider</p>
              <p className="text-sm font-bold text-slate-900">{data.provider}</p>
            </div>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <p className="text-xs font-medium text-slate-500 mb-1">Total Storage</p>
              <p className="text-sm font-bold text-slate-900">{data.totalStorage}</p>
            </div>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <p className="text-xs font-medium text-slate-500 mb-1">Used Storage</p>
              <p className="text-sm font-bold text-slate-900">{data.usedStorage}</p>
            </div>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <p className="text-xs font-medium text-slate-500 mb-1">Total Files</p>
              <p className="text-sm font-bold text-slate-900">{data.documentsCount.toLocaleString()}</p>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-600">Storage Usage</span>
              <span className="text-xs font-bold text-slate-700">{data.usagePercent}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-300 ${getUsageColor(data.usagePercent)}`}
                style={{ width: `${data.usagePercent}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {data.usagePercent >= 80 && "⚠️ Storage is running low. Consider cleanup or expansion."}
              {data.usagePercent >= 60 && data.usagePercent < 80 && "⚠️ Moderate storage usage"}
              {data.usagePercent < 60 && "✓ Storage usage is within normal range"}
            </p>
          </div>
        </div>
      </SettingsCard>

      {/* Card: File Type Breakdown */}
      <SettingsCard title="File Type Breakdown" icon={<FileText className="h-4 w-4" />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.fileTypeBreakdown.map((item) => (
            <div key={item.type} className="bg-slate-50 border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getTypeColor(item.type)}`}>
                  {item.type}
                </span>
                <span className="text-xs font-bold text-slate-500">{item.percentage}%</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Files</span>
                  <span className="text-sm font-semibold text-slate-900">{item.count.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Size</span>
                  <span className="text-sm font-semibold text-slate-900">{item.size}</span>
                </div>
              </div>
              <div className="mt-3 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div className="h-1.5 rounded-full bg-emerald-500 transition-all duration-300" style={{ width: `${item.percentage}%` }} />
              </div>
            </div>
          ))}
        </div>
      </SettingsCard>

      {/* Card: Recent Uploads */}
      <SettingsCard title="Recent Uploads" icon={<Upload className="h-4 w-4" />} noPadding>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-2.5 px-3 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">File Name</th>
                <th className="py-2.5 px-3 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Uploaded By</th>
                <th className="py-2.5 px-3 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Date</th>
                <th className="py-2.5 px-3 sm:py-3.5 sm:px-4 text-right text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Size</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {data.recentUploads.map((upload, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2 px-3 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-slate-900 font-medium">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 flex-shrink-0" />
                      <span className="truncate max-w-[150px] sm:max-w-[200px]">{upload.fileName}</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-slate-600 hidden sm:table-cell">{upload.uploadedBy}</td>
                  <td className="py-2 px-3 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-slate-600 hidden md:table-cell">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400" />
                      {formatDateTime(upload.uploadedAt)}
                    </div>
                  </td>
                  <td className="py-2 px-3 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-slate-700 font-medium text-right">{upload.size}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SettingsCard>

      {/* Notice Strip */}
      <div className="flex gap-3 px-4 py-3.5 bg-blue-50 border border-blue-200 rounded-xl">
        <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-blue-900 mb-0.5">Storage Management</p>
          <p className="text-xs text-blue-700">Storage is managed by {data.provider}. Total documents: <span className="font-semibold">{data.documentsCount.toLocaleString()}</span>. Contact your administrator to request additional storage or configure retention policies.</p>
        </div>
      </div>
    </div>
  );
};
