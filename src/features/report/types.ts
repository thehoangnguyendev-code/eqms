import React from 'react';

// --- Types ---
export type ReportType =
  | 'Document'
  | 'Training'
  | 'Deviation'
  | 'CAPA'
  | 'Change Control'
  | 'Complaint'
  | 'Audit'
  | 'Compliance'
  | 'Supplier'
  | 'Risk Management'
  | 'Equipment'
  | 'All';

export type ReportFormat = 'PDF' | 'Excel' | 'CSV';
export type ReportPeriod = 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly' | 'Custom';
export type TabView = 'templates' | 'history' | 'scheduled' | 'compliance';
export type ReportStatus = 'Completed' | 'In Progress' | 'Failed';
export type ScheduleStatus = 'Active' | 'Paused' | 'Expired';

/** A customizable field a user can toggle on/off for a report template */
export interface ReportField {
  id: string;
  label: string;
  description?: string;
  defaultEnabled: boolean;
  /** Grouping category for the field */
  group?: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  type: ReportType;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  regulatoryRef?: string;
  /** Fields users can toggle to customize report content */
  fields?: ReportField[];
}

export interface ReportHistory {
  id: string;
  reportName: string;
  type: ReportType;
  format: ReportFormat;
  generatedDate: string;
  generatedBy: string;
  period: string;
  status: ReportStatus;
  fileSize: string;
}

export interface ScheduledReport {
  id: string;
  reportName: string;
  type: ReportType;
  schedule: string;
  nextRun: string;
  recipients: string[];
  status: ScheduleStatus;
  lastRun: string;
}

// --- Helpers ---
export const getTypeColor = (type: ReportType): string => {
  const colors: Record<string, string> = {
    Document: 'bg-blue-50 text-blue-700 border-blue-200',
    Training: 'bg-purple-50 text-purple-700 border-purple-200',
    Deviation: 'bg-red-50 text-red-700 border-red-200',
    CAPA: 'bg-amber-50 text-amber-700 border-amber-200',
    'Change Control': 'bg-cyan-50 text-cyan-700 border-cyan-200',
    Complaint: 'bg-orange-50 text-orange-700 border-orange-200',
    Audit: 'bg-slate-50 text-slate-700 border-slate-200',
    Compliance: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Supplier: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Risk Management': 'bg-rose-50 text-rose-700 border-rose-200',
    Equipment: 'bg-teal-50 text-teal-700 border-teal-200',
  };
  return colors[type] || 'bg-slate-50 text-slate-700 border-slate-200';
};
