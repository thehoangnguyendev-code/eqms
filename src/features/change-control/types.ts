/**
 * Change Control Types
 * EU-GMP compliant change management
 */

export type ChangeType =
  | "Process Change"
  | "Equipment Change"
  | "Material Change"
  | "Specification Change"
  | "Facility Change"
  | "Cleaning Procedure"
  | "Analytical Method";

export type ChangeImpact = "Low" | "Medium" | "High";

export type ChangeStatus =
  | "Draft"
  | "Submitted"
  | "Impact Assessment"
  | "Pending Approval"
  | "Approved"
  | "Implementation"
  | "Verification"
  | "Closed"
  | "Rejected";

export interface ChangeControl {
  id: string;
  changeId: string;
  title: string;
  description: string;
  type: ChangeType;
  impact: ChangeImpact;
  status: ChangeStatus;
  initiatedBy: string;
  initiatedDate: string;
  department: string;
  reason: string;
  proposedChange: string;
  affectedSystems?: string[];
  riskAssessment?: string;
  regulatoryImpact?: string;
  targetDate: string;
  actualCompletionDate?: string;
  assignedTo: string;
  reviewer?: string;
  approver?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChangeControlFilters {
  searchQuery: string;
  typeFilter: ChangeType | "All";
  impactFilter: ChangeImpact | "All";
  statusFilter: ChangeStatus | "All";
  dateFrom: string;
  dateTo: string;
}
