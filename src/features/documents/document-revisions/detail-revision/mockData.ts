import type { DocumentType, DocumentStatus } from "@/features/documents/types";
import type { OriginalDocumentInfo } from "@/features/documents/document-revisions/subtabs";

export interface RevisionDetail {
  id: string;
  documentId: string;
  title: string;
  type: DocumentType;
  version: string;
  status: DocumentStatus;
  effectiveDate: string;
  validUntil: string;
  author: string;
  department: string;
  created: string;
  openedBy: string;
  description: string;
  owner: string;
  reviewers: string[];
  approvers: string[];
  coAuthors: string[];
  lastModified: string;
  lastModifiedBy: string;
  isTemplate: boolean;
  titleLocalLanguage: string;
  businessUnit: string;
  knowledgeBase: string;
  subType: string;
  periodicReviewCycle: number;
  periodicReviewNotification: number;
  language: string;
}

export const MOCK_ORIGINAL_DOCUMENT: OriginalDocumentInfo = {
  documentNumber: "WIN_00001",
  created: "2025-12-20 15:49:07",
  openedBy: "Shani Rosenbilt",
  documentName: "Test",
  state: "Active",
  author: "Shani Rosenbilt",
  validUntil: "2027-12-21",
};

export const MOCK_REVISION: RevisionDetail = {
  id: "1",
  documentId: "WIN_00001",
  title: "Test",
  type: "SOP",
  version: "3.0",
  status: "Effective",
  effectiveDate: "2025-12-21",
  validUntil: "2027-12-21",
  author: "Shani Rosenbilt",
  department: "Human Resources & Administrator",
  created: "2025-12-20 15:49:07",
  openedBy: "Shani Rosenbilt",
  description: "Test",
  owner: "Shani Rosenbilt",
  reviewers: ["John Smith", "Mary Williams", "Robert Brown"],
  approvers: ["David Miller", "Jennifer Davis"],
  coAuthors: [],
  lastModified: "2023-12-15",
  lastModifiedBy: "Dr. Sarah Johnson",
  isTemplate: false,
  titleLocalLanguage: "",
  businessUnit: "Operation Unit",
  knowledgeBase: "Human Resources & Administrator",
  subType: "-- None --",
  periodicReviewCycle: 24,
  periodicReviewNotification: 14,
  language: "English",
};
