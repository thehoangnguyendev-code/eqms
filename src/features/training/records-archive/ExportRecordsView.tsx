import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FullPageLoading } from "@/components/ui/loading/Loading";
import {
  Download,
  FileText,
  Calendar,
  Users,
  Award,
  CheckCircle2,
  Settings,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page/PageHeader";
import { exportRecords } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { useNavigateWithLoading } from "@/hooks";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import { DateTimePicker } from "@/components/ui/datetime-picker/DateTimePicker";
import { Checkbox } from "@/components/ui/checkbox/Checkbox";
import { formatDateUS } from "@/utils/format";

interface ExportConfig {
  reportType: string;
  dateFrom: string;
  dateTo: string;
  department: string;
  includeScores: boolean;
  includeAttendance: boolean;
  includeCertificates: boolean;
  format: string;
}

// ─── FormSection ───────────────────────────────────────────────────
const FormSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
      <span className="text-emerald-600">{icon}</span>
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

export const ExportRecordsView: React.FC = () => {
  const { navigateTo, isNavigating } = useNavigateWithLoading();

  const [config, setConfig] = useState<ExportConfig>({
    reportType: "individual",
    dateFrom: "",
    dateTo: "",
    department: "All",
    includeScores: true,
    includeAttendance: true,
    includeCertificates: false,
    format: "pdf",
  });

  const reportTypeOptions = [
    { label: "Individual Training Record", value: "individual" },
    { label: "Department Summary", value: "department" },
    { label: "Course Completion Report", value: "course" },
    { label: "Compliance Matrix", value: "matrix" },
    { label: "Audit Trail", value: "audit" },
  ];

  const departmentOptions = [
    { label: "All Departments", value: "All" },
    { label: "Quality Assurance", value: "Quality Assurance" },
    { label: "Quality Control", value: "Quality Control" },
    { label: "Production", value: "Production" },
    { label: "Documentation", value: "Documentation" },
    { label: "Engineering", value: "Engineering" },
  ];

  const formatOptions = [
    { label: "PDF Document", value: "pdf" },
    { label: "Excel Spreadsheet", value: "excel" },
    { label: "CSV File", value: "csv" },
  ];

  const handleExport = () => {
    // Implement export logic here
  };

  return (
    <div className="space-y-6 w-full flex-1 flex flex-col">
      {/* Header: Title + Breadcrumb */}
      <PageHeader
        title="Export Training Records"
        breadcrumbItems={exportRecords(navigateTo)}
      />

      {/* Export Configuration Form */}
      <FormSection
        title="Export Configuration"
        icon={<Settings className="h-4 w-4" />}
      >

        <div className="space-y-6">
          {/* Row 1: Report Type & Department */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Select
                label="Report Type"
                value={config.reportType}
                onChange={(val) => setConfig((prev) => ({ ...prev, reportType: val }))}
                options={reportTypeOptions}
              />
            </div>

            <div>
              <Select
                label="Department"
                value={config.department}
                onChange={(val) => setConfig((prev) => ({ ...prev, department: val }))}
                options={departmentOptions}
              />
            </div>
          </div>

          {/* Row 2: Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <DateTimePicker
                label="From Date"
                value={config.dateFrom}
                onChange={(val) => setConfig((prev) => ({ ...prev, dateFrom: val }))}
                placeholder="Select start date"
              />
            </div>

            <div>
              <DateTimePicker
                label="To Date"
                value={config.dateTo}
                onChange={(val) => setConfig((prev) => ({ ...prev, dateTo: val }))}
                placeholder="Select end date"
              />
            </div>
          </div>

          {/* Row 3: Export Format */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Select
                label="Export Format"
                value={config.format}
                onChange={(val) => setConfig((prev) => ({ ...prev, format: val }))}
                options={formatOptions}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-200 my-6"></div>

          {/* Include Options */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Include in Export</h3>
            <div className="space-y-3">
              <Checkbox
                id="includeScores"
                label="Include Test Scores and Assessments"
                checked={config.includeScores}
                onChange={(checked) =>
                  setConfig((prev) => ({ ...prev, includeScores: checked }))
                }
              />
              <Checkbox
                id="includeAttendance"
                label="Include Attendance Records"
                checked={config.includeAttendance}
                onChange={(checked) =>
                  setConfig((prev) => ({ ...prev, includeAttendance: checked }))
                }
              />
              <Checkbox
                id="includeCertificates"
                label="Include Training Certificates (PDF only)"
                checked={config.includeCertificates}
                onChange={(checked) =>
                  setConfig((prev) => ({ ...prev, includeCertificates: checked }))
                }
                disabled={config.format !== "pdf"}
              />
            </div>
          </div>
      </FormSection>

      {/* Export Preview */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Export Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-slate-500" />
            <span className="text-slate-600">Report Type:</span>
            <span className="font-medium text-slate-900">
              {reportTypeOptions.find((opt) => opt.value === config.reportType)?.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-500" />
            <span className="text-slate-600">Department:</span>
            <span className="font-medium text-slate-900">{config.department}</span>
          </div>
          {config.dateFrom && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              <span className="text-slate-600">From:</span>
              <span className="font-medium text-slate-900">
                {formatDateUS(config.dateFrom)}
              </span>
            </div>
          )}
          {config.dateTo && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              <span className="text-slate-600">To:</span>
              <span className="font-medium text-slate-900">
                {formatDateUS(config.dateTo)}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4 text-slate-500" />
            <span className="text-slate-600">Format:</span>
            <span className="font-medium text-slate-900 uppercase">{config.format}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3">
        <Button
          variant="outline-emerald"
          size="sm"
          onClick={() => { navigateTo(-1); }}
          className="whitespace-nowrap"
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleExport}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Generate and Export
        </Button>
      </div>

      {/* ─── Loading Overlay ──────────────────────────────────── */}
      {isNavigating && <FullPageLoading text="Loading..." />}
    </div>
  );
};
