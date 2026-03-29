// Shared mock data for document features

// User type for Approvers/Reviewers tabs
export interface MockUser {
  id: string;
  name: string;
  username: string;
  role: string;
  department: string;
  email: string;
}

// Mock Data for User Selection (Approvers, Reviewers)
export const MOCK_USERS: MockUser[] = [
  { id: '1', name: 'Nguyen Van A', username: 'nguyenvana', role: 'QA Manager', department: 'Quality Assurance', email: 'a.nguyen@example.com' },
  { id: '2', name: 'Tran Thi B', username: 'tranthib', role: 'Director', department: 'Board of Directors', email: 'b.tran@example.com' },
  { id: '3', name: 'Le Van C', username: 'levanc', role: 'Production Manager', department: 'Production', email: 'c.le@example.com' },
  { id: '4', name: 'Pham Thi D', username: 'phamthid', role: 'Technical Lead', department: 'Technical', email: 'd.pham@example.com' },
  { id: '5', name: 'Hoang Van E', username: 'hoangvane', role: 'Quality Control', department: 'Quality Control', email: 'e.hoang@example.com' },
];

// User options for CreateLinkModal (email-based format)
export const MOCK_USER_OPTIONS = [
  { value: "user-1", label: "John Smith - john.smith@company.com" },
  { value: "user-2", label: "Sarah Johnson - sarah.johnson@company.com" },
  { value: "user-3", label: "Michael Chen - michael.chen@company.com" },
  { value: "user-4", label: "Emma Williams - emma.williams@company.com" },
  { value: "user-5", label: "David Brown - david.brown@company.com" },
  { value: "user-6", label: "Robert Taylor - robert.taylor@company.com" },
  { value: "user-7", label: "Lisa Anderson - lisa.anderson@company.com" },
  { value: "user-8", label: "James Wilson - james.wilson@company.com" },
];

export const MOCK_DEPARTMENTS = [
  { value: "dept-1", label: "Quality Assurance" },
  { value: "dept-2", label: "Manufacturing" },
  { value: "dept-3", label: "Research & Development" },
  { value: "dept-4", label: "Regulatory Affairs" },
  { value: "dept-5", label: "Supply Chain" },
];

// --- Subtab Mock Data ---
import type {
  ControlledCopy,
  ParentDocument,
  RelatedDocument,
} from "./tabs/general-tab/subtabs/types";

export const MOCK_CONTROLLED_COPIES: ControlledCopy[] = [
  {
    id: "1",
    controlledCopiesName: "Production Floor Copy",
    copyNumber: "CC-001",
    created: "2024-01-15",
    state: "effective",
    openedBy: "John Doe",
    validUntil: "2025-01-15",
    documentRevision: "Rev 2.0",
    documentNumber: "DOC-2024-001",
  },
  {
    id: "2",
    controlledCopiesName: "Quality Control Lab",
    copyNumber: "CC-002",
    created: "2024-01-20",
    state: "effective",
    openedBy: "Jane Smith",
    validUntil: "2025-01-20",
    documentRevision: "Rev 2.0",
    documentNumber: "DOC-2024-001",
  },
  {
    id: "3",
    controlledCopiesName: "Warehouse Archive",
    copyNumber: "CC-003",
    created: "2024-02-01",
    state: "approved",
    openedBy: "Bob Johnson",
    validUntil: "2025-02-01",
    documentRevision: "Rev 2.0",
    documentNumber: "DOC-2024-001",
  },
];

export const MOCK_CORRELATED_DOCUMENTS: ParentDocument[] = [
  {
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
  },
  {
    id: "2",
    documentNumber: "DOC-2024-006",
    created: "2024-01-08",
    openedBy: "David Lee",
    documentName: "Calibration Records",
    state: "approved",
    documentType: "Record",
    department: "Quality Control",
    authorCoAuthor: "David Lee, Emily Chen",
    effectiveDate: "2024-02-01",
    validUntil: "2025-02-01",
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
  {
    id: "3",
    documentNumber: "DOC-2024-004",
    created: "2024-01-20",
    openedBy: "Bob Johnson",
    documentName: "Safety Protocol",
    state: "pendingReview",
    documentType: "Policy",
    department: "Safety",
    authorCoAuthor: "Bob Johnson, Alice Brown",
    effectiveDate: "2024-04-01",
    validUntil: "2025-04-01",
  },
];

export const MOCK_EFFECTIVE_DOCUMENTS = [
  {
    id: "SOP.0045",
    title: "Quality Control Testing Procedure",
    type: "SOP",
    status: "Effective",
  },
  {
    id: "SOP.0023",
    title: "Equipment Maintenance Protocol",
    type: "SOP",
    status: "Effective",
  },
  {
    id: "WI.0112",
    title: "Calibration Work Instruction",
    type: "Work Instruction",
    status: "Effective",
  },
  {
    id: "FORM.0089",
    title: "Inspection Checklist Template",
    type: "Form",
    status: "Effective",
  },
  {
    id: "SOP.0156",
    title: "Document Control Procedure",
    type: "SOP",
    status: "Effective",
  },
];

export const MOCK_ALL_DOCUMENTS = [
  ...MOCK_EFFECTIVE_DOCUMENTS,
  {
    id: "SOP.0067",
    title: "Training Management Procedure",
    type: "SOP",
    status: "Effective",
  },
  {
    id: "WI.0234",
    title: "Sampling Work Instruction",
    type: "Work Instruction",
    status: "Effective",
  },
  {
    id: "POLICY.0012",
    title: "Quality Policy Document",
    type: "Policy",
    status: "Effective",
  },
];

