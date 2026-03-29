import type { DocumentType, DocumentStatus } from "@/features/documents/types";
import type {
  Revision,
  RelatedDocument,
  ParentDocument,
} from "@/features/documents/shared/tabs/general-tab/subtabs";

export interface DocumentDetail {
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

// Đổi false → true để test empty state
export const USE_EMPTY_STATE = true;

// --- Mock Data for Sub-tabs ---
export const MOCK_REVISIONS: Revision[] = [
  {
    id: "1",
    revisionNumber: "REV-001",
    created: "2025-06-15",
    openedBy: "Shani Rosenbilt",
    revisionName: "Initial Release",
    state: "effective",
  },
  {
    id: "2",
    revisionNumber: "REV-002",
    created: "2025-09-20",
    openedBy: "John Smith",
    revisionName: "Updated Procedures",
    state: "effective",
  },
  {
    id: "3",
    revisionNumber: "REV-003",
    created: "2025-12-01",
    openedBy: "Mary Williams",
    revisionName: "Annual Review Update",
    state: "effective",
  },
];

export const MOCK_RELATED_DOCUMENTS: RelatedDocument[] = [
  {
    id: "1",
    documentNumber: "DOC-2024-002",
    created: "2024-01-10",
    openedBy: "John Doe",
    documentName: "Quality Control Procedures",
    state: "effective",
    documentType: "SOP",
    department: "Quality Assurance",
    authorCoAuthor: "John Doe, Jane Smith",
    effectiveDate: "2024-02-01",
    validUntil: "2025-02-01",
  },
  {
    id: "2",
    documentNumber: "DOC-2024-003",
    created: "2024-01-15",
    openedBy: "Jane Smith",
    documentName: "Manufacturing Guidelines",
    state: "approved",
    documentType: "WI",
    department: "Production",
    authorCoAuthor: "Jane Smith",
    effectiveDate: "2024-03-01",
    validUntil: "2025-03-01",
  },
];

export const MOCK_PARENT_DOCUMENT: ParentDocument = {
  id: "1",
  documentNumber: "DOC-2024-005",
  created: "2024-01-05",
  openedBy: "Alice Brown",
  documentName: "Equipment Maintenance Schedule",
  state: "effective",
  documentType: "Schedule",
  department: "Maintenance",
  authorCoAuthor: "Alice Brown",
  effectiveDate: "2024-01-15",
  validUntil: "2025-01-15",
};

// --- Mock Data ---
export const MOCK_DOCUMENT: DocumentDetail = {
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

