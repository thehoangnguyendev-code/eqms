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
  { id: '6', name: 'James Smith', username: 'jsmith', role: 'Process Engineer', department: 'Engineering', email: 'j.smith@example.com' },
  { id: '7', name: 'Emma Wilson', username: 'ewilson', role: 'Safety Officer', department: 'HSE', email: 'e.wilson@example.com' },
  { id: '8', name: 'David Chen', username: 'dchen', role: 'Software Architect', department: 'Technical', email: 'd.chen@example.com' },
  { id: '9', name: 'Sarah Miller', username: 'smiller', role: 'HR Manager', department: 'Human Resources', email: 's.miller@example.com' },
  { id: '10', name: 'Robert Brown', username: 'rbrown', role: 'Operations Director', department: 'Operations', email: 'r.brown@example.com' },
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
    created: "2024-01-10",
    openedBy: "Nguyen Van A",
    department: "Quality Assurance",
    author: "Nguyen Van A",
    effectiveDate: "2024-02-01",
    validUntil: "2025-02-01",
    documentNumber: "SOP.0045",
    authorCoAuthor: "Nguyen Van A"
  },
  {
    id: "SOP.0023",
    title: "Equipment Maintenance Protocol",
    type: "SOP",
    status: "Effective",
    created: "2024-01-12",
    openedBy: "Tran Thi B",
    department: "Maintenance",
    author: "Tran Thi B",
    effectiveDate: "2024-02-15",
    validUntil: "2025-02-15",
    documentNumber: "SOP.0023",
    authorCoAuthor: "Tran Thi B"
  },
  {
    id: "WI.0112",
    title: "Calibration Work Instruction",
    type: "Work Instruction",
    status: "Effective",
    created: "2024-01-15",
    openedBy: "Le Van C",
    department: "Quality Control",
    author: "Le Van C",
    effectiveDate: "2024-03-01",
    validUntil: "2025-03-01",
    documentNumber: "WI.0112",
    authorCoAuthor: "Le Van C"
  },
  {
    id: "FORM.0089",
    title: "Inspection Checklist Template",
    type: "Form",
    status: "Effective",
    created: "2024-01-20",
    openedBy: "Pham Thi D",
    department: "Quality Assurance",
    author: "Pham Thi D",
    effectiveDate: "2024-03-10",
    validUntil: "2025-03-10",
    documentNumber: "FORM.0089",
    authorCoAuthor: "Pham Thi D"
  },
  {
    id: "SOP.0156",
    title: "Document Control Procedure",
    type: "SOP",
    status: "Effective",
    created: "2024-01-25",
    openedBy: "Hoang Van E",
    department: "Quality Assurance",
    author: "Hoang Van E",
    effectiveDate: "2024-04-01",
    validUntil: "2025-04-01",
    documentNumber: "SOP.0156",
    authorCoAuthor: "Hoang Van E"
  },
];

export const MOCK_ALL_DOCUMENTS = [
  ...MOCK_EFFECTIVE_DOCUMENTS,
  {
    id: "SOP.0067",
    title: "Training Management Procedure",
    type: "SOP",
    status: "Effective",
    created: "2024-01-28",
    openedBy: "James Smith",
    department: "Human Resources",
    author: "James Smith",
    effectiveDate: "2024-04-15",
    validUntil: "2025-04-15",
    documentNumber: "SOP.0067",
    authorCoAuthor: "James Smith"
  },
  {
    id: "WI.0234",
    title: "Sampling Work Instruction",
    type: "Work Instruction",
    status: "Effective",
    created: "2024-02-01",
    openedBy: "Emma Wilson",
    department: "Production",
    author: "Emma Wilson",
    effectiveDate: "2024-05-01",
    validUntil: "2025-05-01",
    documentNumber: "WI.0234",
    authorCoAuthor: "Emma Wilson"
  },
  {
    id: "POLICY.0012",
    title: "Quality Policy Document",
    type: "Policy",
    status: "Effective",
    created: "2024-02-05",
    openedBy: "David Chen",
    department: "Quality Assurance",
    author: "David Chen",
    effectiveDate: "2024-05-15",
    validUntil: "2025-05-15",
    documentNumber: "POLICY.0012",
    authorCoAuthor: "David Chen"
  },
  {
    id: "SOP.0099",
    title: "New Employee Onboarding SOP",
    type: "SOP",
    status: "Draft",
    created: "2024-02-10",
    openedBy: "Sarah Miller",
    department: "Human Resources",
    author: "Sarah Miller",
    effectiveDate: "—",
    validUntil: "—",
    documentNumber: "SOP.0099",
    authorCoAuthor: "Sarah Miller"
  },
  {
    id: "WI.0556",
    title: "Legacy Machine Operation WI",
    type: "Work Instruction",
    status: "Obsolete",
    created: "2023-12-01",
    openedBy: "Robert Brown",
    department: "Operations",
    author: "Robert Brown",
    effectiveDate: "2024-01-01",
    validUntil: "2024-12-31",
    documentNumber: "WI.0556",
    authorCoAuthor: "Robert Brown"
  },
  {
    id: "SOP.0342",
    title: "Internal Audit Procedure",
    type: "SOP",
    status: "PendingReview",
    created: "2024-02-15",
    openedBy: "Nguyen Van A",
    department: "Quality Assurance",
    author: "Nguyen Van A",
    effectiveDate: "—",
    validUntil: "—",
    documentNumber: "SOP.0342",
    authorCoAuthor: "Nguyen Van A"
  },
  {
    id: "FORM.0123",
    title: "Maintenance Request Form",
    type: "Form",
    status: "Approved",
    created: "2024-02-20",
    openedBy: "Tran Thi B",
    department: "Maintenance",
    author: "Tran Thi B",
    effectiveDate: "2024-03-01",
    validUntil: "2025-03-01",
    documentNumber: "FORM.0123",
    authorCoAuthor: "Tran Thi B"
  },
];
