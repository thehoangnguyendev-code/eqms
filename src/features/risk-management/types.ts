/**
 * Risk Management Types
 * ICH Q9 / EU-GMP Annex 20 compliant risk assessment
 */

export type RiskCategory =
  | "Quality"
  | "Safety"
  | "Regulatory"
  | "Environmental"
  | "Operational"
  | "Supply Chain"
  | "Data Integrity";

export type RiskLevel = "Very Low" | "Low" | "Medium" | "High" | "Very High";

export type RiskStatus =
  | "Identified"
  | "Under Assessment"
  | "Mitigation Planned"
  | "Mitigation In Progress"
  | "Mitigated"
  | "Accepted"
  | "Closed"
  | "Escalated";

export type AssessmentMethod =
  | "FMEA"
  | "HACCP"
  | "FTA"
  | "PHA"
  | "Risk Matrix"
  | "Other";

export interface Risk {
  id: string;
  riskId: string;
  title: string;
  description: string;
  category: RiskCategory;
  level: RiskLevel;
  status: RiskStatus;
  assessmentMethod: AssessmentMethod;
  probability: number; // 1-5
  severity: number; // 1-5
  detectability: number; // 1-5
  rpn: number; // Risk Priority Number = P × S × D
  identifiedBy: string;
  identifiedDate: string;
  department: string;
  mitigationPlan?: string;
  residualRisk?: RiskLevel;
  reviewDate: string;
  assignedTo: string;
  reviewer?: string;
  approver?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RiskFilters {
  searchQuery: string;
  categoryFilter: RiskCategory | "All";
  levelFilter: RiskLevel | "All";
  statusFilter: RiskStatus | "All";
  dateFrom: string;
  dateTo: string;
}
