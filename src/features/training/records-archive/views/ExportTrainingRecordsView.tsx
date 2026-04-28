import React, { useState } from "react";
import { FullPageLoading } from "@/components/ui/loading/Loading";
import {
  Download,
  FileText,
  Calendar,
  Users,
  Settings,
  ShieldCheck,
  History,
  AlertCircle,
  FileArchive
} from "lucide-react";
import { PageHeader } from "@/components/ui/page/PageHeader";
import { exportRecords } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { useNavigateWithLoading } from "@/hooks";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import { DateTimePicker } from "@/components/ui/datetime-picker/DateTimePicker";
import { Checkbox } from "@/components/ui/checkbox/Checkbox";
import { formatDateUS } from "@/utils/format";
import { FormSection } from "@/components/ui/form";
import { ESignatureModal } from "@/components/ui/esign-modal/ESignatureModal";

interface ExportConfig {
  reportType: string;
  dateFrom: string;
  dateTo: string;
  department: string;
  includeScores: boolean;
  includeAttendance: boolean;
  includeCertificates: boolean;
  format: string;
  exportReason: string;
  // EU-GMP Compliance Options
  watermarkType: "None" | "Uncontrolled" | "For Audit Only" | "Confidential";
  includeAuditTrail: boolean;
  includeHistoricalRecords: boolean;
  exceptionsOnly: boolean;
  outputStructure: "single_pdf" | "zip_dossiers";
}

export const ExportTrainingRecordsView: React.FC = () => {
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
    exportReason: "",
    watermarkType: "None",
    includeAuditTrail: false,
    includeHistoricalRecords: true,
    exceptionsOnly: false,
    outputStructure: "single_pdf",
  });

  const [isESignOpen, setIsESignOpen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

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
    { label: "PDF Document (.pdf)", value: "pdf" },
    { label: "Excel Spreadsheet (.xlsx)", value: "excel" },
    { label: "CSV File (.csv)", value: "csv" },
  ];

  const watermarkOptions = [
    { label: "None (Clean)", value: "None" },
    { label: "UNCONTROLLED COPY", value: "Uncontrolled" },
    { label: "FOR AUDIT ONLY", value: "For Audit Only" },
    { label: "STRICTLY CONFIDENTIAL", value: "Confidential" },
  ];

  const outputStructureOptions = [
    { label: "Single Combined File", value: "single_pdf" },
    { label: "Individual Files (ZIP Archive)", value: "zip_dossiers" },
  ];

  const handleExport = () => {
    setIsESignOpen(true);
  };

  const onConfirmExport = (reason: string) => {
    // Implement actual export logic with the provided e-sign reason
    console.log("Confirmed Export with E-Signature:", { ...config, eSignReason: reason });
    setIsESignOpen(false);
    // Add success notification logic here
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      if (config.exportReason.trim()) handleExport();
    }
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
        disableAnimation
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
            <div>
              <Select
                label="Output Structure"
                value={config.outputStructure}
                onChange={(val) => setConfig((prev) => ({ ...prev, outputStructure: val as any }))}
                options={outputStructureOptions}
                disabled={config.format !== "pdf"}
              />
            </div>
          </div>

          {/* Row 4: Document Control */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Select
                label="Document Watermark"
                value={config.watermarkType}
                onChange={(val) => setConfig((prev) => ({ ...prev, watermarkType: val as any }))}
                options={watermarkOptions}
                disabled={config.format !== "pdf"}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-200 my-6"></div>

          {/* Include Options & Compliance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-400" /> Content Selection
              </h3>
              <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
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
                  label="Include Training Certificates"
                  checked={config.includeCertificates}
                  onChange={(checked) =>
                    setConfig((prev) => ({ ...prev, includeCertificates: checked }))
                  }
                  disabled={config.format !== "pdf"}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" /> EU-GMP Compliance Options
              </h3>
              <div className="space-y-3 bg-emerald-50/30 p-4 rounded-xl border border-emerald-100/50">
                <Checkbox
                  id="includeAuditTrail"
                  label="Include Data Change History (Audit Trail)"
                  checked={config.includeAuditTrail}
                  onChange={(checked) =>
                    setConfig((prev) => ({ ...prev, includeAuditTrail: checked }))
                  }
                />
                <Checkbox
                  id="includeHistoricalRecords"
                  label="Include Historical Retraining Records"
                  checked={config.includeHistoricalRecords}
                  onChange={(checked) =>
                    setConfig((prev) => ({ ...prev, includeHistoricalRecords: checked }))
                  }
                />
                <Checkbox
                  id="exceptionsOnly"
                  label="Compliance Gaps Only (Exception Report)"
                  checked={config.exceptionsOnly}
                  onChange={(checked) =>
                    setConfig((prev) => ({ ...prev, exceptionsOnly: checked }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Reason for Export */}
          <div className="flex flex-col gap-2 pt-2">
            <label className="text-xs sm:text-sm font-medium text-slate-700">
              Reason for Export <span className="text-red-500">*</span>
            </label>
            <textarea
              value={config.exportReason}
              onChange={(e) => setConfig((prev) => ({ ...prev, exportReason: e.target.value }))}
              onKeyDown={handleKeyDown}
              placeholder="Please provide the specific reason for exporting these GxP records (e.g., Audit preparation, Periodic review)... (Ctrl+Enter to export)"
              rows={3}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-slate-400 transition-all"
            />
            <p className="text-[10px] text-slate-400">This action will be logged in the system audit trail for compliance.</p>
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
              {reportTypeOptions.find((opt) => opt.value === config.reportType)?.label || 'Báo cáo'}
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
            <span className="font-medium text-slate-900 uppercase">
              {config.format} {config.outputStructure === 'zip_dossiers' ? '(ZIP)' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span className="text-slate-600">GxP Control:</span>
            <span className="font-medium text-emerald-600">
              {config.watermarkType !== 'None' ? config.watermarkType : 'Standard'}
            </span>
          </div>
          {config.includeAuditTrail && (
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-blue-500" />
              <span className="text-slate-600">Audit Trail:</span>
              <span className="font-medium text-slate-900">Included</span>
            </div>
          )}
          {config.exceptionsOnly && (
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-slate-600">Scope:</span>
              <span className="font-medium text-red-600">Gaps Only</span>
            </div>
          )}
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
          disabled={!config.exportReason.trim()}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-slate-300 border-none shadow-md shadow-emerald-200/50"
        >
          <ShieldCheck className="h-4 w-4" />
          Sign and Generate Export
        </Button>
      </div>

      <ESignatureModal
        isOpen={isESignOpen}
        onClose={() => setIsESignOpen(false)}
        onConfirm={onConfirmExport}
        actionTitle="Authorize GxP Data Export"
        documentDetails={{
          title: reportTypeOptions.find(o => o.value === config.reportType)?.label || 'Báo cáo đào tạo',
          code: `EXPORT-${config.format.toUpperCase()}`,
          revision: config.department
        }}
      />

      {/* ─── Loading Overlays ─────────────────────────────────── */}
      {(isNavigating || initialLoading) && <FullPageLoading text={initialLoading ? "Preparing Export Module..." : "Loading..."} />}
    </div>
  );
};
