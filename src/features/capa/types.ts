/**
 * CAPA (Corrective and Preventive Action) Types
 */

export type CAPAType = "Corrective" | "Preventive" | "Both";

export type CAPAStatus =
  | "Open"
  | "Under Investigation"
  | "Action Plan Pending"
  | "Implementation"
  | "Verification"
  | "Effectiveness Check"
  | "Closed"
  | "Cancelled";

export type CAPASource =
  | "Deviation"
  | "Audit Finding"
  | "Customer Complaint"
  | "Internal Review"
  | "Risk Assessment"
  | "Regulatory Inspection"
  | "Self-Identified";

export interface CAPA {
  id: string;
  capaId: string;
  title: string;
  description: string;
  type: CAPAType;
  source: CAPASource;
  status: CAPAStatus;
  initiatedBy: string;
  initiatedDate: string;
  department: string;
  relatedDeviationId?: string;
  relatedAuditId?: string;
  relatedComplaintId?: string;
  problemStatement: string;
  rootCause?: string;
  correctiveAction?: string;
  preventiveAction?: string;
  targetCompletionDate: string;
  actualCompletionDate?: string;
  assignedTo: string;
  reviewer?: string;
  approver?: string;
  effectivenessCheckDate?: string;
  effectivenessResult?: "Effective" | "Not Effective" | "Pending";
  createdAt: string;
  updatedAt: string;
}

export interface CAPAFilters {
  searchQuery: string;
  typeFilter: CAPAType | "All";
  sourceFilter: CAPASource | "All";
  statusFilter: CAPAStatus | "All";
  dateFrom: string;
  dateTo: string;
}
