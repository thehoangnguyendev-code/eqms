/**
 * Training Material Types
 *
 * Single source of truth for all Training Material related types.
 * Import from here instead of re-declaring in each view file.
 */

// ─── Status / File Type ───────────────────────────────────────────────────────
export type MaterialStatus =
  | "Draft"
  | "Pending Review"
  | "Pending Approval"
  | "Effective"
  | "Obsoleted";

export type MaterialFileType = "Video" | "PDF" | "Image" | "Document";

// ─── Core Entity (used by list view) ─────────────────────────────────────────
export interface TrainingMaterial {
  id: string;
  materialId: string;
  title: string;
  description: string;
  type: MaterialFileType;
  version: string;
  department: string;
  status: MaterialStatus;
  uploadedAt: string;
  uploadedBy: string;
  fileSize: string;
  fileSizeBytes: number;
  usageCount: number;
  linkedCourses: string[];
  versionHistory?: MaterialVersionEntry[];
}

// ─── Extended Entity (workflow views: Review / Detail / Approval) ─────────────
export interface TrainingMaterialDetail extends TrainingMaterial {
  reviewer: string;
  approver: string;
  reviewedAt?: string;
  approvedAt?: string;
  reviewComment?: string;
  approvalComment?: string;
  externalUrl?: string;
}

/**
 * Workflow-only shape — used by Review / Detail / Approval views.
 * Omits list-only fields (fileSizeBytes, usageCount, linkedCourses).
 * Ready for API mapping: corresponds to a GET /materials/:id response.
 */
export interface TrainingMaterialWorkflow {
  id: string;
  materialId: string;
  title: string;
  description: string;
  type: MaterialFileType;
  version: string;
  department: string;
  status: MaterialStatus;
  uploadedAt: string;
  uploadedBy: string;
  fileSize: string;
  reviewer: string;
  approver: string;
  reviewedAt?: string;
  approvedAt?: string;
  reviewComment?: string;
  approvalComment?: string;
  externalUrl?: string;
}

// ─── Filter State ─────────────────────────────────────────────────────────────
export interface MaterialFilters {
  searchQuery: string;
  typeFilter: string;
  departmentFilter: string;
  statusFilter: string;
  uploadedByFilter: string;
  dateFrom: string;
  dateTo: string;
}

// ─── Workflow Steps ───────────────────────────────────────────────────────────
export const WORKFLOW_STEPS: MaterialStatus[] = [
  "Draft",
  "Pending Review",
  "Pending Approval",
  "Effective",
  "Obsoleted",
];

// ─── Version History (Traceability) ───────────────────────────────────────────────────
export interface MaterialVersionEntry {
  version: string;
  status: MaterialStatus;
  // Creation
  uploadedBy: string;
  uploadedAt: string;
  // Review
  reviewedBy?: string;
  reviewedAt?: string;
  reviewComment?: string;
  // Approval
  approvedBy?: string;
  approvedAt?: string;
  approvalComment?: string;
  // Content
  revisionNotes?: string;
  fileSize?: string;
  fileUrl?: string;
}
