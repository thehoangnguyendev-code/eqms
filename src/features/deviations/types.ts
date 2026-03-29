/**
 * Deviations & Non-Conformance Types
 */

export type DeviationSeverity = "Critical" | "Major" | "Minor";

export type DeviationStatus =
  | "Open"
  | "Under Investigation"
  | "Pending Review"
  | "Pending Approval"
  | "Closed"
  | "Cancelled";

export type DeviationCategory =
  | "Product Quality"
  | "Process"
  | "Equipment"
  | "Material"
  | "Documentation"
  | "Personnel"
  | "Environmental";

export interface Deviation {
  id: string;
  deviationId: string;
  title: string;
  description: string;
  category: DeviationCategory;
  severity: DeviationSeverity;
  status: DeviationStatus;
  reportedBy: string;
  reportedDate: string;
  department: string;
  affectedProduct?: string;
  affectedBatch?: string;
  immediateAction?: string;
  rootCause?: string;
  correctiveAction?: string;
  preventiveAction?: string;
  investigationDeadline: string;
  assignedTo: string;
  reviewer?: string;
  approver?: string;
  closedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeviationFilters {
  searchQuery: string;
  categoryFilter: DeviationCategory | "All";
  severityFilter: DeviationSeverity | "All";
  statusFilter: DeviationStatus | "All";
  dateFrom: string;
  dateTo: string;
}
