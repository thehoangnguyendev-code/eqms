import type { DocumentType, DocumentStatus } from "@/features/documents/types";
import type { OriginalDocumentInfo } from "@/features/documents/document-revisions/sub-tab";

// --- Types ---
export type ReviewFlowType = "sequential" | "parallel";
export type ReviewStatus = "pending" | "approved" | "rejected" | "completed";

export interface Reviewer {
  id: string;
  name: string;
  role: string;
  email: string;
  department: string;
  order: number;
  status: ReviewStatus;
  reviewDate?: string;
  comments?: string;
}

export interface DocumentDetail {
  id: string;
  documentId: string;
  title: string;
  type: DocumentType;
  version: string;
  status: DocumentStatus;
  effectiveDate: string;
  author: string;
  department: string;
  created: string;
  description: string;
  documentType: "Document" | "Revision";
  previousVersion?: string;
  reviewFlowType: ReviewFlowType;
  reviewers: Reviewer[];
  currentReviewerIndex: number;
  validUntil: string;
  openedBy: string;
  owner: string;
  approvers: string[];
  lastModified: string;
  lastModifiedBy: string;
  isTemplate: boolean;
  titleLocalLanguage?: string;
  businessUnit: string;
  knowledgeBase: string;
  subType: string;
  periodicReviewCycle: number;
  periodicReviewNotification: number;
  language: string;
}

export interface Comment {
  id: string;
  author: string;
  role: string;
  date: string;
  content: string;
}

export const MOCK_ORIGINAL_DOCUMENT: OriginalDocumentInfo = {
  documentNumber: "SOP.0001.01",
  created: "2025-06-15 09:00:00",
  openedBy: "John Smith",
  documentName: "Standard Operating Procedure for Quality Control Testing",
  state: "Active",
  author: "John Smith",
  validUntil: "2027-06-15",
};

export const MOCK_REVISION: DocumentDetail = {
  id: "1",
  documentId: "SOP.0001.02",
  title: "Standard Operating Procedure for Quality Control Testing",
  type: "SOP",
  version: "2.0",
  status: "Pending Review",
  effectiveDate: "2026-02-01",
  author: "John Smith",
  department: "Quality Assurance",
  created: "2026-01-05 10:30:00",
  description: "Updated testing procedures for new HPLC equipment.",
  documentType: "Revision",
  previousVersion: "1.0",
  reviewFlowType: "sequential",
  reviewers: [
    {
      id: "1",
      name: "Nguyen Van A",
      role: "QA Manager",
      email: "a.nguyen@example.com",
      department: "Quality Assurance",
      order: 1,
      status: "pending",
    },
    {
      id: "2",
      name: "Tran Thi B",
      role: "Director",
      email: "b.tran@example.com",
      department: "Board of Directors",
      order: 2,
      status: "pending",
    },
    {
      id: "3",
      name: "Le Van C",
      role: "Production Manager",
      email: "c.le@example.com",
      department: "Production",
      order: 3,
      status: "pending",
    },
  ],
  currentReviewerIndex: 0,
  validUntil: "2028-02-01",
  openedBy: "Nguyen Van A",
  owner: "John Smith",
  approvers: ["David Miller"],
  lastModified: "2026-01-05",
  lastModifiedBy: "John Smith",
  isTemplate: false,
  titleLocalLanguage: "",
  businessUnit: "Operation Unit",
  knowledgeBase: "Quality Assurance",
  subType: "-- None --",
  periodicReviewCycle: 24,
  periodicReviewNotification: 14,
  language: "English",
};

export const MOCK_COMMENTS: Comment[] = [
  {
    id: "1",
    author: "John Smith",
    role: "QA Manager",
    date: "2026-01-05 14:30:00",
    content:
      "Added new section 4.5 covering the new chromatograph calibration.",
  },
];
