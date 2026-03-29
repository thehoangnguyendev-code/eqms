/**
 * Complaints Management Types
 * EU-GMP / PQC compliant complaint handling
 */

export type ComplaintType =
  | "Product Quality"
  | "Adverse Event"
  | "Packaging"
  | "Labeling"
  | "Delivery"
  | "Counterfeit Suspicion"
  | "Stability";

export type ComplaintPriority = "Low" | "Medium" | "High" | "Critical";

export type ComplaintStatus =
  | "Received"
  | "Under Investigation"
  | "Pending Review"
  | "Root Cause Identified"
  | "CAPA Initiated"
  | "Closed"
  | "Rejected";

export type ComplaintSource =
  | "Customer"
  | "Healthcare Professional"
  | "Patient"
  | "Regulatory Authority"
  | "Distributor"
  | "Internal";

export interface Complaint {
  id: string;
  complaintId: string;
  title: string;
  description: string;
  type: ComplaintType;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  source: ComplaintSource;
  reportedBy: string;
  reportedDate: string;
  affectedProduct?: string;
  affectedBatch?: string;
  country?: string;
  investigationFindings?: string;
  rootCause?: string;
  relatedCapaId?: string;
  responseDeadline: string;
  assignedTo: string;
  reviewer?: string;
  closedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ComplaintFilters {
  searchQuery: string;
  typeFilter: ComplaintType | "All";
  priorityFilter: ComplaintPriority | "All";
  statusFilter: ComplaintStatus | "All";
  sourceFilter: ComplaintSource | "All";
  dateFrom: string;
  dateTo: string;
}
