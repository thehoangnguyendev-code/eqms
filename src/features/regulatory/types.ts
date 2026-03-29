/**
 * Regulatory Management Types
 * EU-GMP / EMA compliant regulatory submissions tracking
 */

export type SubmissionType =
  | "Marketing Authorization Application"
  | "Type IA Variation"
  | "Type IB Variation"
  | "Type II Variation"
  | "Renewal"
  | "PSUR/PBRER"
  | "GMP Certificate"
  | "Annual Report";

export type SubmissionStatus =
  | "Draft"
  | "Submitted"
  | "Under Review"
  | "Questions Received"
  | "Response Submitted"
  | "Approved"
  | "Refused"
  | "Withdrawn";

export type RegulatoryAuthority =
  | "EMA"
  | "FDA"
  | "MHRA"
  | "BfArM"
  | "ANSM"
  | "AIFA"
  | "AEMPS"
  | "National Authority";

export interface RegulatorySubmission {
  id: string;
  submissionId: string;
  title: string;
  description: string;
  type: SubmissionType;
  status: SubmissionStatus;
  authority: RegulatoryAuthority;
  relatedProduct?: string;
  submissionDate?: string;
  targetDate: string;
  approvalDate?: string;
  referenceNumber?: string;
  submittedBy: string;
  department: string;
  assignedTo: string;
  reviewer?: string;
  dossierVersion?: string;
  ctdModule?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegulatoryFilters {
  searchQuery: string;
  typeFilter: SubmissionType | "All";
  authorityFilter: RegulatoryAuthority | "All";
  statusFilter: SubmissionStatus | "All";
  dateFrom: string;
  dateTo: string;
}
