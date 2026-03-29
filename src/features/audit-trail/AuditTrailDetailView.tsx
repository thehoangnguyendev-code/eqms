import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/app/routes.constants";
import {
  User,
  Calendar,
  Globe,
  Monitor,
  Shield,
  FileText,
  AlertCircle,
  Check,
  X,
  Download,
} from "lucide-react";
import { IconReportAnalytics } from "@tabler/icons-react";
import { PageHeader } from "@/components/ui/page/PageHeader";
import { auditTrailDetail } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { Button } from "@/components/ui/button/Button";
import { cn } from "@/components/ui/utils";
import { formatDateTime } from "@/utils/format";
import type { AuditTrailRecord } from "./types";

// Info Row Component
interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, icon }) => (
  <div className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
    {icon && (
      <div className="flex items-center justify-center flex-shrink-0 w-5 h-5 text-slate-500">{icon}</div>
    )}
    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
      <span className="text-sm font-medium text-slate-700">{label}:</span>
      <span className="sm:col-span-2 text-sm text-slate-900">{value}</span>
    </div>
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
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
        colors[severity as keyof typeof colors] || colors.Low,
      )}
    >
      {icons[severity as keyof typeof icons]}
      {severity}
    </span>
  );
};

// Export Modal Component
interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: AuditTrailRecord;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, record }) => {
  if (!isOpen) return null;

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(record, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `audit-trail-${record.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
    onClose();
  };

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    console.log("PDF export not implemented yet");
    onClose();
  };

  const handleExportText = () => {
    const text = `
Audit Trail Record
==================
ID: ${record.id}
Timestamp: ${formatDateTime(record.timestamp)}
User: ${record.user} (${record.userId})
IP Address: ${record.ipAddress}
Device: ${record.device || "Not recorded"}
Module: ${record.module}
Action: ${record.action}
Entity: ${record.entityName} (${record.entityId})
Description: ${record.description}
Severity: ${record.severity}

${record.changes && record.changes.length > 0
        ? `Changes:\n${record.changes.map((c) => `- ${c.field}: "${c.oldValue}" → "${c.newValue}"`).join("\n")}`
        : ""
      }

${record.metadata && Object.keys(record.metadata).length > 0
        ? `Metadata:\n${Object.entries(record.metadata)
          .map(([k, v]) => `- ${k}: ${v}`)
          .join("\n")}`
        : ""
      }
    `.trim();
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `audit-trail-${record.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    onClose();
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative bg-white rounded-xl shadow-2xl w-full max-w-md animate-in zoom-in-95 fade-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Export Audit Record</h3>
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4 text-slate-500" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            <p className="text-sm text-slate-600 mb-4">
              Select export format for audit record <span className=" font-medium text-slate-900">{record.id}</span>
            </p>
            <div className="space-y-2">
              <button
                onClick={handleExportJSON}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors"
              >
                <FileText className="h-4 w-4 text-slate-500" />
                <div className="flex-1 text-left">
                  <div className="font-medium">Export as JSON</div>
                  <div className="text-xs text-slate-500">Structured data format</div>
                </div>
              </button>
              <button
                onClick={handleExportPDF}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors"
              >
                <FileText className="h-4 w-4 text-slate-500" />
                <div className="flex-1 text-left">
                  <div className="font-medium">Export as PDF</div>
                  <div className="text-xs text-slate-500">Printable document format</div>
                </div>
              </button>
              <button
                onClick={handleExportText}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors"
              >
                <FileText className="h-4 w-4 text-slate-500" />
                <div className="flex-1 text-left">
                  <div className="font-medium">Export as TXT</div>
                  <div className="text-xs text-slate-500">Plain text format</div>
                </div>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-200">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

// Main Component
interface AuditTrailDetailViewProps {
  record: AuditTrailRecord;
  onBack: () => void;
}

export const AuditTrailDetailView: React.FC<AuditTrailDetailViewProps> = ({
  record,
  onBack,
}) => {
  const navigate = useNavigate();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  return (
    <div className="space-y-6 w-full">
      {/* Header: Title + Breadcrumb + Actions */}
      <PageHeader
        title="Audit Trail Detail"
        breadcrumbItems={auditTrailDetail()}
        actions={
          <>
            <Button
              onClick={onBack}
              size="sm"
              variant="outline-emerald"
              className="whitespace-nowrap gap-2"
            >
              Back
            </Button>
            <Button
              onClick={() => setIsExportModalOpen(true)}
              size="sm"
              variant="default"
              className="whitespace-nowrap gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </>
        }
      />

      {/* Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 lg:gap-6">
        {/* Left Column: Main Information */}
        <div className="xl:col-span-8 space-y-5">
          {/* General Information Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900">
                General Information
              </h3>
            </div>
            <div className="p-5">
              <InfoRow
                label="Audit ID"
                value={<span className="">{record.id}</span>}
                icon={<FileText className="h-5 w-5" />}
              />
              <InfoRow
                label="Timestamp"
                value={formatDateTime(record.timestamp)}
                icon={<Calendar className="h-5 w-5" />}
              />
              <InfoRow
                label="User"
                value={
                  <div className="flex flex-col">
                    <span className="font-medium">{record.user}</span>
                    <span className="text-xs text-slate-500">
                      {record.userId}
                    </span>
                  </div>
                }
                icon={<User className="h-5 w-5" />}
              />
              <InfoRow
                label="IP Address"
                value={<span className="">{record.ipAddress}</span>}
                icon={<Globe className="h-5 w-5" />}
              />
              <InfoRow
                label="Device"
                value={
                  <span className="">
                    {record.device || "(Not recorded)"}
                  </span>
                }
                icon={<Monitor className="h-5 w-5" />}
              />
              <InfoRow
                label="Severity"
                value={getSeverityBadge(record.severity)}
                icon={<Shield className="h-5 w-5" />}
              />
            </div>
          </div>

          {/* Action Details Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900">
                Action Details
              </h3>
            </div>
            <div className="p-5">
              <InfoRow
                label="Module"
                value={
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-50 text-slate-700 border-slate-200">
                    {record.module}
                  </span>
                }
              />
              <InfoRow
                label="Action"
                value={
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                      getActionColor(record.action),
                    )}
                  >
                    {record.action}
                  </span>
                }
              />
              <InfoRow
                label="Entity ID"
                value={<span className="">{record.entityId}</span>}
              />
              <InfoRow label="Entity Name" value={record.entityName} />
              <InfoRow label="Description" value={record.description} />
            </div>
          </div>

          {/* Changes Table (if changes exist) */}
          {record.changes && record.changes.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200">
                <h3 className="text-sm font-semibold text-slate-900">
                  Changes Made
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                        Field
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                        Old Value
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                        New Value
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {record.changes.map((change, index) => (
                      <tr key={index} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 text-sm font-medium text-slate-900 whitespace-nowrap">
                          {change.field}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600 whitespace-nowrap">
                          {change.oldValue || (
                            <span className="text-slate-400 italic">
                              (empty)
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-900 whitespace-nowrap">
                          {change.newValue || (
                            <span className="text-slate-400 italic">
                              (empty)
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Metadata */}
        <div className="xl:col-span-4 space-y-5">
          {/* Metadata Card */}
          {record.metadata && Object.keys(record.metadata).length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200">
                <h3 className="text-sm font-semibold text-slate-900">
                  Additional Metadata
                </h3>
              </div>
              <div className="p-5">
                <div className="space-y-3">
                  {Object.entries(record.metadata).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex flex-col gap-1 pb-3 border-b border-slate-100 last:border-0"
                    >
                      <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                      <span className="text-sm text-slate-900">
                        {typeof value === "object"
                          ? JSON.stringify(value, null, 2)
                          : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}



          {/* Summary Card */}
          <div className="bg-gradient-to-br from-emerald-50 via-emerald-50/50 to-white rounded-xl border-2 border-emerald-200 shadow-md overflow-hidden">
            <div className="p-5">
              <h3 className="text-base font-bold text-emerald-900 mb-3 flex items-center gap-2">
                <IconReportAnalytics className="h-4 w-4" />
                Record Summary
              </h3>
              <div className="space-y-2.5 text-sm text-slate-700">
                <p className="leading-relaxed">
                  <span className="font-bold text-emerald-900">
                    {record.user}
                  </span>{" "}
                  performed a{" "}
                  <span className="font-bold text-emerald-900">
                    {record.action}
                  </span>{" "}
                  action on{" "}
                  <span className="font-bold text-emerald-900">
                    {record.module}
                  </span>{" "}
                  module.
                </p>
                {record.changes && record.changes.length > 0 && (
                  <p className="leading-relaxed">
                    This action modified{" "}
                    <span className="font-bold text-emerald-900">
                      {record.changes.length}
                    </span>{" "}
                    field{record.changes.length !== 1 ? "s" : ""}.
                  </p>
                )}
                <div className="pt-2 mt-3 border-t border-emerald-200">
                  <p className="text-xs text-slate-600 flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    {formatDateTime(record.timestamp)}
                  </p>
                  <p className="text-xs text-slate-600 flex items-center gap-2 mt-1">
                    <Globe className="h-3 w-3" />
                    {record.ipAddress}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        record={record}
      />
    </div>
  );
};
