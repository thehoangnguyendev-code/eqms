import React, { useState } from "react";
import {
  Calendar,
  Globe,
  FileText,
  AlertCircle,
  Check,
  X,
  Download,
  Info,
  Activity,
  Database,
} from "lucide-react";
import { IconExchange, IconReportAnalytics } from "@tabler/icons-react";
import { PageHeader } from "@/components/ui/page/PageHeader";
import { auditTrailDetail } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { Button } from "@/components/ui/button/Button";
import { FullPageLoading } from "@/components/ui/loading/Loading";
import { cn } from "@/components/ui/utils";
import { FormSection } from "@/components/ui/form";
import { formatDateTime } from "@/utils/format";
import { AuditExportModal } from "./components/AuditExportModal";
import type { AuditTrailRecord } from "./types";

// InfoRow — label/value layout matching DestroyControlledCopyView
const InfoRow: React.FC<{ label: string; value: React.ReactNode; last?: boolean }> = ({ label, value, last }) => (
  <div className={cn("flex flex-col lg:flex-row lg:items-center gap-1.5 lg:gap-2", !last && "pb-3 lg:pb-4 border-b border-slate-200")}>
    <label className="text-xs sm:text-sm font-medium text-slate-700 w-full lg:w-40 flex-shrink-0">{label}</label>
    <div className="text-xs lg:text-sm text-slate-900 flex-1">{value}</div>
  </div>
);

// Get action badge color
const getActionColor = (action: string) => {
  switch (action.toLowerCase()) {
    case "create":
    case "approve":
    case "publish":
    case "enable":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "update":
    case "review":
    case "assign":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "delete":
    case "reject":
    case "disable":
      return "bg-red-50 text-red-700 border-red-200";
    case "archive":
    case "restore":
      return "bg-amber-50 text-amber-700 border-amber-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
};

// Get severity badge
const getSeverityBadge = (severity: string) => {
  const colors = {
    Low: "bg-slate-50 text-slate-700 border-slate-200",
    Medium: "bg-blue-50 text-blue-700 border-blue-200",
    High: "bg-amber-50 text-amber-700 border-amber-200",
    Critical: "bg-red-50 text-red-700 border-red-200",
  };
  const icons = {
    Low: <Check className="h-3.5 w-3.5" />,
    Medium: <AlertCircle className="h-3.5 w-3.5" />,
    High: <AlertCircle className="h-3.5 w-3.5" />,
    Critical: <X className="h-3.5 w-3.5" />,
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border", colors[severity as keyof typeof colors] || colors.Low)}>
      {icons[severity as keyof typeof icons]}
      {severity}
    </span>
  );
};

// Main Component
interface AuditTrailDetailViewProps {
  record: AuditTrailRecord;
  onBack: () => void;
}

export const AuditTrailDetailView: React.FC<AuditTrailDetailViewProps> = ({ record, onBack }) => {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleBack = () => {
    setIsNavigating(true);
    setTimeout(() => onBack(), 600);
  };

  return (
    <div className="space-y-6 w-full">
      <PageHeader
        title="Audit Trail Detail"
        breadcrumbItems={auditTrailDetail()}
        actions={
          <>
            <Button onClick={handleBack} size="sm" variant="outline-emerald" className="whitespace-nowrap gap-2">
              Back
            </Button>
            <Button onClick={() => setIsExportModalOpen(true)} size="sm" variant="outline" className="whitespace-nowrap gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 lg:gap-6">
        {/* Left Column */}
        <div className="xl:col-span-8 space-y-5">
          {/* General Information */}
          <FormSection title="General Information" icon={<Info className="h-4 w-4" />}>
            <div className="space-y-3 lg:space-y-4">
              <InfoRow label="Audit ID" value={<span className="font-medium">{record.id}</span>} />
              <InfoRow label="Timestamp" value={formatDateTime(record.timestamp)} />
              <InfoRow
                label="User"
                value={
                  <div className="flex flex-col">
                    <span className="font-medium">{record.user}</span>
                    <span className="text-xs text-slate-500">{record.userId}</span>
                  </div>
                }
              />
              <InfoRow label="IP Address" value={record.ipAddress} />
              <InfoRow label="Device" value={record.device || "(Not recorded)"} />
              <InfoRow label="Severity" value={getSeverityBadge(record.severity)} last />
            </div>
          </FormSection>

          {/* Action Details */}
          <FormSection title="Action Details" icon={<Activity className="h-4 w-4" />}>
            <div className="space-y-3 lg:space-y-4">
              <InfoRow
                label="Module"
                value={
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-50 text-slate-700 border-slate-200">
                    {record.module}
                  </span>
                }
              />
              <InfoRow
                label="Action"
                value={
                  <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border", getActionColor(record.action))}>
                    {record.action}
                  </span>
                }
              />
              <InfoRow label="Entity ID" value={record.entityId} />
              <InfoRow label="Entity Name" value={record.entityName} />
              <InfoRow label="Description" value={record.description} last />
            </div>
          </FormSection>

          {/* Changes Table */}
          {record.changes && record.changes.length > 0 && (
            <FormSection title="Changes Made" icon={<IconExchange className="h-4 w-4" />}>
              <div className="overflow-x-auto -mx-5 -mb-5">
                <table className="w-full min-w-[620px] md:min-w-[760px] lg:min-w-[900px]">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      {["Field", "Old Value", "New Value"].map(h => (
                        <th key={h} className="py-3 px-5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {record.changes.map((change, index) => (
                      <tr key={index} className="hover:bg-slate-50/80">
                        <td className="py-3 px-5 text-xs lg:text-sm font-medium text-slate-900 whitespace-nowrap">{change.field}</td>
                        <td className="py-3 px-5 text-xs lg:text-sm text-slate-600 whitespace-nowrap">
                          {change.oldValue || <span className="text-slate-400 italic">(empty)</span>}
                        </td>
                        <td className="py-3 px-5 text-xs lg:text-sm text-slate-900 whitespace-nowrap">
                          {change.newValue || <span className="text-slate-400 italic">(empty)</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </FormSection>
          )}
        </div>

        {/* Right Column */}
        <div className="xl:col-span-4 space-y-5">
          {/* Metadata */}
          {record.metadata && Object.keys(record.metadata).length > 0 && (
            <FormSection title="Additional Metadata" icon={<Database className="h-4 w-4" />}>
              <div className="space-y-3 lg:space-y-4">
                {Object.entries(record.metadata).map(([key, value], i, arr) => (
                  <InfoRow
                    key={key}
                    label={key.replace(/([A-Z])/g, " $1").trim()}
                    value={typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
                    last={i === arr.length - 1}
                  />
                ))}
              </div>
            </FormSection>
          )}

          {/* Summary */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 md:p-5">
            <h3 className="text-sm font-semibold text-emerald-900 mb-3 flex items-center gap-2">
              <IconReportAnalytics className="h-4 w-4" />
              Record Summary
            </h3>
            <div className="space-y-2 text-sm text-emerald-800">
              <p className="leading-relaxed">
                • <span className="font-semibold">{record.user}</span> performed a{" "}
                <span className="font-semibold">{record.action}</span> action on{" "}
                <span className="font-semibold">{record.module}</span> module.
              </p>
              {record.changes && record.changes.length > 0 && (
                <p>• This action modified <span className="font-semibold">{record.changes.length}</span> field{record.changes.length !== 1 ? "s" : ""}.</p>
              )}
              <p className="flex items-center gap-2">
                <Calendar className="h-3 w-3 flex-shrink-0" />
                {formatDateTime(record.timestamp)}
              </p>
              <p className="flex items-center gap-2">
                <Globe className="h-3 w-3 flex-shrink-0" />
                {record.ipAddress}
              </p>
            </div>
          </div>
        </div>
      </div>

      <AuditExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} record={record} />
      {isNavigating && <FullPageLoading text="Loading..." />}
    </div>
  );
};
