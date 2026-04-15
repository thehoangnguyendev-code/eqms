import type { DocumentType, DocumentStatus } from "@/features/documents/types";
import type { OriginalDocumentInfo } from "@/features/documents/document-revisions/subtabs";

// --- Types ---
export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface Approver {
  id: string;
  name: string;
  role: string;
  email: string;
  department: string;
  status: ApprovalStatus;
  approvalDate?: string;
  comments?: string;
}

export interface RevisionDetail {
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
  approver: Approver;
  validUntil: string;
  openedBy: string;
  owner: string;
  reviewers: string[];
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

export interface Comment {
  id: string;
  author: string;
  role: string;
  date: string;
  content: string;
}

export const MOCK_ORIGINAL_DOCUMENT: OriginalDocumentInfo = {
  documentNumber: "SOP-QA-001",
  created: "2025-06-15 09:00:00",
  openedBy: "System Admin",
  documentName: "Standard Operating Procedure for Quality Control Testing",
  state: "Active",
  author: "John Smith",
  validUntil: "2027-02-01",
};

export const MOCK_REVISION: RevisionDetail = {
  id: "1",
  documentId: "SOP-QA-001",
  title:
    "Standard Operating Procedure for Quality Control Testing - Revision 3.0",
  type: "SOP",
  version: "3.0",
  status: "Pending Approval",
  effectiveDate: "2026-02-01",
  author: "John Smith",
  department: "Quality Assurance",
  created: "2026-01-05 10:30:00",
  description:
    "This revision updates the quality control testing procedures to comply with new regulatory requirements.",
  documentType: "Revision",
  previousVersion: "2.0",
  approver: {
    id: "1",
    name: "Nguyen Van A",
    role: "Department Head",
    email: "a.nguyen@example.com",
    department: "Quality Assurance",
    status: "pending",
  },
  validUntil: "2027-02-01",
  openedBy: "System Admin",
  owner: "John Smith",
  reviewers: ["Nguyen Van A", "Tran Thi B"],
  lastModified: "2026-01-05 10:30:00",
  lastModifiedBy: "John Smith",
  isTemplate: false,
  titleLocalLanguage: "",
  businessUnit: "Manufacturing",
  knowledgeBase: "Quality Management",
  subType: "Testing",
  periodicReviewCycle: 12,
  periodicReviewNotification: 30,
  language: "English",
};

export const MOCK_COMMENTS: Comment[] = [
  {
    id: "1",
    author: "Reviewer 1",
    role: "QA Specialist",
    date: "2026-01-05 14:30:00",
    content:
      "The revision addresses all regulatory changes. Approved for final approval.",
  },
  {
    id: "2",
    author: "Reviewer 2",
    role: "Lab Manager",
    date: "2026-01-05 16:45:00",
    content: "All updates are documented clearly. Ready for approval.",
  },
];
