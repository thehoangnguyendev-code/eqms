/**
 * Supplier Management Types
 * EU-GMP Chapter 5 / GDP compliant supplier qualification
 */

export type SupplierCategory =
  | "API Manufacturer"
  | "Excipient Supplier"
  | "Packaging Material"
  | "Contract Manufacturer"
  | "Laboratory Service"
  | "Equipment Vendor"
  | "Logistics Provider";

export type SupplierStatus =
  | "Qualified"
  | "Conditionally Approved"
  | "Under Evaluation"
  | "Audit Scheduled"
  | "Suspended"
  | "Disqualified"
  | "New";

export type SupplierRiskRating = "Low" | "Medium" | "High" | "Critical";

export interface Supplier {
  id: string;
  supplierId: string;
  name: string;
  category: SupplierCategory;
  status: SupplierStatus;
  riskRating: SupplierRiskRating;
  country: string;
  city: string;
  contactPerson: string;
  email: string;
  phone: string;
  qualificationDate?: string;
  lastAuditDate?: string;
  nextAuditDate?: string;
  suppliedMaterials: string[];
  gmpCertificate?: string;
  gdpCertificate?: string;
  qualityAgreement: boolean;
  responsiblePerson: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierFilters {
  searchQuery: string;
  categoryFilter: SupplierCategory | "All";
  statusFilter: SupplierStatus | "All";
  riskFilter: SupplierRiskRating | "All";
  dateFrom: string;
  dateTo: string;
}
