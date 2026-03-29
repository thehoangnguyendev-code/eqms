/**
 * Product Management Types
 * EU-GMP compliant product lifecycle management
 */

export type ProductType =
  | "Drug Substance"
  | "Drug Product"
  | "Intermediate"
  | "Finished Product"
  | "Biological Product"
  | "Medical Device";

export type ProductStatus =
  | "Development"
  | "Registered"
  | "Commercially Available"
  | "Under Variation"
  | "Withdrawn"
  | "Discontinued"
  | "Recall";

export type DosageForm =
  | "Tablet"
  | "Capsule"
  | "Injection"
  | "Syrup"
  | "Cream"
  | "Ointment"
  | "Suspension"
  | "Powder"
  | "Other";

export interface Product {
  id: string;
  productId: string;
  name: string;
  description: string;
  type: ProductType;
  status: ProductStatus;
  dosageForm: DosageForm;
  strength: string;
  activeIngredient: string;
  manufacturer: string;
  maNumber?: string; // Marketing Authorization Number
  shelfLife: string;
  storageConditions: string;
  markets: string[];
  batchSize?: string;
  responsiblePerson: string;
  lastReviewDate?: string;
  nextReviewDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  searchQuery: string;
  typeFilter: ProductType | "All";
  statusFilter: ProductStatus | "All";
  dosageFilter: DosageForm | "All";
  dateFrom: string;
  dateTo: string;
}
