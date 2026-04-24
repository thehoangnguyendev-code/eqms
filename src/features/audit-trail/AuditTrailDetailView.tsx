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
  User,
  Monitor,
  Hash,
  Tag,
  ArrowRight,
} from "lucide-react";
import { IconExchange, IconReportAnalytics } from "@tabler/icons-react";
import { PageHeader } from "@/components/ui/page/PageHeader";
import { auditTrailDetail } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { Button } from "@/components/ui/button/Button";
import { FullPageLoading } from "@/components/ui/loading/Loading";
import { cn } from "@/components/ui/utils";
import { FormSection } from "@/components/ui/form";
import { Badge, type BadgeColor } from "@/components/ui/badge/Badge";
import { formatDateTime } from "@/utils/format";
import { AuditExportModal } from "./components/AuditExportModal";
import type { AuditTrailRecord } from "./types";

/* ------------------------------------------------------------------ */
/*  InfoRow — label/value layout                                       */
/* ------------------------------------------------------------------ */

const InfoRow: React.FC<{
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  last?: boolean;
}> = ({ label, value, icon, last }) => (
  <div
    className={cn(
      "flex flex-col lg:flex-row lg:items-center gap-1.5 lg:gap-3",
      !last && "pb-3 lg:pb-4 border-b border-slate-100"
    )}
  >
    <label className="text-xs sm:text-sm font-medium text-slate-500 w-full lg:w-44 flex-shrink-0 flex items-center gap-2">
      {icon && (
        <span className="text-slate-400" aria-hidden="true">
          {icon}
        </span>
      )}
      {label}
    </label>
    <div className="text-xs lg:text-sm text-slate-900 flex-1 font-medium">
      {value}
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Badge color mapping                                                */
/* ------------------------------------------------------------------ */

/**
 * @FRS FRS-AUD-003: Action type color mapping for audit trail
 * @mục_đích Map audit action types to standardized Badge colors
 */
const getActionBadgeColor = (action: string): BadgeColor => {
  switch (action.toLowerCase()) {
    case "create":
    case "approve":
    case "publish":
    case "enable":
      return "emerald";
    case "update":
    case "review":
    case "assign":
      return "blue";
    case "delete":
    case "reject":
    case "disable":
      return "red";
    case "archive":
    case "restore":
      return "amber";
    default:
      return "slate";
  }
};

const getSeverityColor = (severity: string): BadgeColor => {
  const map: Record<string, BadgeColor> = {
    Low: "slate",
    Medium: "blue",
    High: "amber",
    Critical: "red",
  };
  return map[severity] || "slate";
};

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case "Critical":
      return <X className="h-3 w-3" />;
    case "High":
    case "Medium":
      return <AlertCircle className="h-3 w-3" />;
    default:
      return <Check className="h-3 w-3" />;
  }
};

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

interface AuditTrailDetailViewProps {
  record: AuditTrailRecord;
  onBack: () => void;
}

export const AuditTrailDetailView: React.FC<AuditTrailDetailViewProps> = ({
  record,
  onBack,
}) => {
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
            <Button
              onClick={handleBack}
              size="sm"
              variant="outline-emerald"
              className="whitespace-nowrap gap-2"
            >
              Back
            </Button>
            <Button
              onClick={() => setIsExportModalOpen(true)}
              size="sm"
              variant="outline"
              className="whitespace-nowrap gap-2"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Export
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 lg:gap-6">
        {/* ===== Left Column ===== */}
        <div className="xl:col-span-8 space-y-5">
          {/* General Information */}
          <FormSection
            title="General Information"
            icon={<Info className="h-4 w-4" />}
          >
            <div className="space-y-3 lg:space-y-4">
              <InfoRow
                label="Audit ID"
                icon={<Hash className="h-3.5 w-3.5" />}
                value={
                  <span className="font-semibold text-slate-900 font-mono text-xs">
                    {record.id}
                  </span>
                }
              />
              <InfoRow
                label="Timestamp"
                icon={<Calendar className="h-3.5 w-3.5" />}
                value={formatDateTime(record.timestamp)}
              />
              <InfoRow
                label="User"
                icon={<User className="h-3.5 w-3.5" />}
                value={
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-slate-900">
                      {record.user}
                    </span>
                    <span className="text-[11px] text-slate-400 font-normal font-mono">
                      {record.userId}
                    </span>
                  </div>
                }
              />
              <InfoRow
                label="IP Address"
                icon={<Globe className="h-3.5 w-3.5" />}
                value={
                  <span className="font-mono text-xs">{record.ipAddress}</span>
                }
              />
              <InfoRow
                label="Device"
                icon={<Monitor className="h-3.5 w-3.5" />}
                value={
                  record.device || (
                    <span className="text-slate-400 italic">Not recorded</span>
                  )
                }
              />
              <InfoRow
                label="Severity"
                icon={<AlertCircle className="h-3.5 w-3.5" />}
                value={
                  <Badge
                    color={getSeverityColor(record.severity)}
                    size="sm"
                    icon={getSeverityIcon(record.severity)}
                  >
                    {record.severity}
                  </Badge>
                }
                last
              />
            </div>
          </FormSection>

          {/* Action Details */}
          <FormSection
            title="Action Details"
            icon={<Activity className="h-4 w-4" />}
          >
            <div className="space-y-3 lg:space-y-4">
              <InfoRow
                label="Module"
                icon={<FileText className="h-3.5 w-3.5" />}
                value={
                  <Badge color="slate" size="sm">
                    {record.module}
                  </Badge>
                }
              />
              <InfoRow
                label="Action"
                icon={<Tag className="h-3.5 w-3.5" />}
                value={
                  <Badge
                    color={getActionBadgeColor(record.action)}
                    size="sm"
                  >
                    {record.action}
                  </Badge>
                }
              />
              <InfoRow
                label="Entity ID"
                icon={<Hash className="h-3.5 w-3.5" />}
                value={
                  <span className="font-mono text-xs">{record.entityId}</span>
                }
              />
              <InfoRow
                label="Entity Name"
                value={
                  <span className="font-semibold">{record.entityName}</span>
                }
              />
              <InfoRow
                label="Description"
                value={
                  <p className="text-slate-600 leading-relaxed font-normal">
                    {record.description}
                  </p>
                }
                last
              />
            </div>
          </FormSection>

          {/* Changes Table */}
          {record.changes && record.changes.length > 0 && (
            <FormSection
              title={`Changes Made (${record.changes.length})`}
              icon={<IconExchange className="h-4 w-4" />}
            >
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 -mx-5 -mb-5 rounded-b-xl">
                <table className="w-full min-w-[620px]">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 md:py-3 md:px-4 text-left text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap w-1/4">
                        Field
                      </th>
                      <th className="py-2.5 px-3 md:py-3 md:px-4 text-left text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap w-1/3">
                        Old Value
                      </th>
                      <th className="py-2.5 px-3 md:py-3 md:px-4 text-left text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <ArrowRight className="h-3 w-3 text-emerald-500" aria-hidden="true" />
                          New Value
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {record.changes.map((change, index) => (
                      <tr
                        key={`${change.field}-${index}`}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="py-2.5 px-3 md:py-3 md:px-4 text-xs md:text-sm font-semibold text-slate-800 whitespace-nowrap">
                          {change.field}
                        </td>
                        <td className="py-2.5 px-3 md:py-3 md:px-4 text-xs md:text-sm whitespace-nowrap">
                          {change.oldValue ? (
                            <span className="text-slate-500 line-through decoration-slate-300">
                              {change.oldValue}
                            </span>
                          ) : (
                            <span className="text-slate-300 italic text-xs">
                              —
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 md:py-3 md:px-4 text-xs md:text-sm whitespace-nowrap">
                          {change.newValue ? (
                            <span className="text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded">
                              {change.newValue}
                            </span>
                          ) : (
                            <span className="text-slate-300 italic text-xs">
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </FormSection>
          )}
        </div>

        {/* ===== Right Column ===== */}
        <div className="xl:col-span-4 space-y-5">
          {/* Metadata */}
          {record.metadata && Object.keys(record.metadata).length > 0 && (
            <FormSection
              title="Additional Metadata"
              icon={<Database className="h-4 w-4" />}
            >
              <div className="space-y-3 lg:space-y-4">
                {Object.entries(record.metadata).map(
                  ([key, value], i, arr) => (
                    <InfoRow
                      key={key}
                      label={key.replace(/([A-Z])/g, " $1").trim()}
                      value={
                        typeof value === "object" ? (
                          <pre className="text-xs font-mono bg-slate-50 rounded-lg p-2 overflow-x-auto whitespace-pre-wrap break-words">
                            {JSON.stringify(value, null, 2)}
                          </pre>
                        ) : (
                          String(value)
                        )
                      }
                      last={i === arr.length - 1}
                    />
                  )
                )}
              </div>
            </FormSection>
          )}

          {/* Summary Card */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200/70 rounded-xl p-4 md:p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-emerald-900 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-100">
                <IconReportAnalytics className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              </span>
              Record Summary
            </h3>
            <div className="space-y-3 text-sm text-emerald-800">
              <p className="leading-relaxed">
                <span className="font-semibold">{record.user}</span> performed a{" "}
                <Badge color={getActionBadgeColor(record.action)} size="xs">
                  {record.action}
                </Badge>{" "}
                action on the{" "}
                <span className="font-semibold">{record.module}</span> module.
              </p>
              {record.changes && record.changes.length > 0 && (
                <p className="flex items-center gap-2">
                  <IconExchange className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" aria-hidden="true" />
                  <span>
                    Modified{" "}
                    <span className="font-semibold" style={{ fontVariantNumeric: "tabular-nums" }}>
                      {record.changes.length}
                    </span>{" "}
                    field{record.changes.length !== 1 ? "s" : ""}
                  </span>
                </p>
              )}
              <div className="pt-2 mt-2 border-t border-emerald-200/50 space-y-2">
                <p className="flex items-center gap-2 text-emerald-700">
                  <Calendar className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                  <span className="text-xs">{formatDateTime(record.timestamp)}</span>
                </p>
                <p className="flex items-center gap-2 text-emerald-700">
                  <Globe className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                  <span className="text-xs font-mono">{record.ipAddress}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AuditExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        record={record}
      />
      {isNavigating && <FullPageLoading text="Loading…" />}
    </div>
  );
};
