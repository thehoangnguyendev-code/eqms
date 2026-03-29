// --- Types ---
export interface LinkedDocument {
  id: string;
  code: string;
  name: string;
  type: "Form" | "Annex" | "Template" | "Reference";
  currentVersion: string;
  nextVersion: string;
  status: "Active" | "Draft" | "Obsolete";
}

export interface SourceDocument {
  code: string;
  name: string;
  version: string;
  type: string;
  effectiveDate: string;
  owner: string;
}

// --- Mock Data ---
export const MOCK_SOURCE_DOCUMENT: SourceDocument = {
  code: "SOP.0001.01",
  name: "Standard Operating Procedure for Quality Control Testing",
  version: "1.0",
  type: "SOP",
  effectiveDate: "2025-01-15",
  owner: "Dr. Sarah Johnson",
};

export const MOCK_LINKED_DOCUMENTS: LinkedDocument[] = [
  {
    id: "1",
    code: "FORM.0001.01",
    name: "Quality Control Test Record Form",
    type: "Form",
    currentVersion: "1.0",
    nextVersion: "2.0",
    status: "Active",
  },
  {
    id: "2",
    code: "ANNEX.0001.01",
    name: "Calibration Certificate Template",
    type: "Annex",
    currentVersion: "1.2",
    nextVersion: "2.0",
    status: "Active",
  },
  {
    id: "3",
    code: "FORM.0002.01",
    name: "Non-Conformance Report",
    type: "Form",
    currentVersion: "1.5",
    nextVersion: "2.0",
    status: "Active",
  },
  {
    id: "4",
    code: "ANNEX.0002.01",
    name: "Equipment Maintenance Log",
    type: "Annex",
    currentVersion: "1.0",
    nextVersion: "2.0",
    status: "Active",
  },
  {
    id: "5",
    code: "REF.0001.01",
    name: "Reference Standards Documentation",
    type: "Reference",
    currentVersion: "1.1",
    nextVersion: "2.0",
    status: "Active",
  },
];
