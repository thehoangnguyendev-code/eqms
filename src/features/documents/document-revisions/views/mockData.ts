import type { DocumentType, DocumentStatus } from "@/features/documents/types";

// --- Types ---
export interface RelatedDocument {
  id: string;
  documentNumber: string;
  documentName: string;
  revisionNumber: string;
  type: DocumentType;
  state: DocumentStatus;
}

export interface CorrelatedDocument {
  id: string;
  documentNumber: string;
  documentName: string;
  revisionNumber: string;
  type: DocumentType;
  state: DocumentStatus;
  correlationType?: string;
}

export interface Revision {
  id: string;
  documentNumber: string;
  revisionNumber: string;
  created: string;
  openedBy: string;
  revisionName: string;
  state: DocumentStatus;
  author: string;
  effectiveDate: string;
  validUntil: string;
  documentName: string;
  type: DocumentType;
  department: string;
  businessUnit: string;
  hasRelatedDocuments?: boolean;
  hasCorrelatedDocuments?: boolean;
  isTemplate?: boolean;
  relatedDocuments?: RelatedDocument[];
  correlatedDocuments?: CorrelatedDocument[];
}

// --- Mock Data ---
export const MOCK_REVISIONS: Revision[] = [
  // Pending Review items (for testing Review workflow)
  {
    id: "rev-001",
    documentNumber: "SOP.0001.01",
    revisionNumber: "2.0",
    created: "08/01/2026",
    openedBy: "John Smith",
    revisionName: "Quality Control Testing Revision",
    state: "Pending Review",
    author: "Dr. Sarah Johnson",
    effectiveDate: "20/01/2026",
    validUntil: "20/01/2027",
    documentName: "Quality Control Testing SOP",
    type: "SOP",
    department: "Quality Assurance",
    businessUnit: "Quality",
    hasRelatedDocuments: true,
    hasCorrelatedDocuments: true,
    relatedDocuments: [
      {
        id: "rel-001-1",
        documentNumber: "SOP.0001.02",
        documentName: "Quality Control Annexure",
        revisionNumber: "1.1",
        type: "SOP",
        state: "Effective",
      },
      {
        id: "rel-001-2",
        documentNumber: "FORM.0001.01",
        documentName: "QC Inspection Checklist",
        revisionNumber: "2.0",
        type: "Form",
        state: "Effective",
      },
      {
        id: "rel-001-3",
        documentNumber: "POL.0002.01",
        documentName: "Quality Assurance Policy",
        revisionNumber: "3.0",
        type: "Policy",
        state: "Approved",
      },
    ],
    correlatedDocuments: [
      {
        id: "cor-001-1",
        documentNumber: "SOP.0005.01",
        documentName: "Laboratory Safety SOP",
        revisionNumber: "1.0",
        type: "SOP",
        state: "Effective",
        correlationType: "Reference",
      },
      {
        id: "cor-001-2",
        documentNumber: "POL.0004.01",
        documentName: "Environmental Health Policy",
        revisionNumber: "2.0",
        type: "Policy",
        state: "Approved",
        correlationType: "Impact",
      },
    ],
  },
  {
    id: "rev-002",
    documentNumber: "SOP.0002.01",
    revisionNumber: "3.1",
    created: "07/01/2026",
    openedBy: "Jane Doe",
    revisionName: "Manufacturing Process Update",
    state: "Pending Review",
    author: "Michael Chen",
    effectiveDate: "25/01/2026",
    validUntil: "25/01/2027",
    documentName: "Manufacturing Process SOP",
    type: "SOP",
    department: "Production",
    businessUnit: "Operations",
    hasRelatedDocuments: true,
    relatedDocuments: [
      {
        id: "rel-002-1",
        documentNumber: "SOP.0002.02",
        documentName: "Batch Record Template",
        revisionNumber: "1.0",
        type: "Form",
        state: "Effective",
      },
      {
        id: "rel-002-2",
        documentNumber: "POL.0003.01",
        documentName: "GMP Manufacturing Policy",
        revisionNumber: "2.1",
        type: "Policy",
        state: "Effective",
      },
    ],
  },
  // Pending Approval items (for testing Approval workflow)
  {
    id: "rev-003",
    documentNumber: "POL.0001.01",
    revisionNumber: "1.5",
    created: "06/01/2026",
    openedBy: "Alice Johnson",
    revisionName: "Safety Policy Revision",
    state: "Pending Approval",
    author: "Emily Brown",
    effectiveDate: "01/02/2026",
    validUntil: "01/02/2027",
    documentName: "Workplace Safety Policy",
    type: "Policy",
    department: "Quality Assurance",
    businessUnit: "Quality",
  },
  {
    id: "rev-004",
    documentNumber: "SOP.0003.01",
    revisionNumber: "4.0",
    created: "05/01/2026",
    openedBy: "Bob Williams",
    revisionName: "Validation Protocol Update",
    state: "Pending Approval",
    author: "David Lee",
    effectiveDate: "05/02/2026",
    validUntil: "05/02/2027",
    documentName: "Equipment Validation Protocol",
    type: "Protocol",
    department: "R&D",
    businessUnit: "Research",
  },
  // Other statuses for variety
  ...Array.from({ length: 41 }, (_, i) => {
    const status = ["Draft", "Approved", "Effective", "Archive"][i % 4] as DocumentStatus;
    return {
      id: `${i + 5}`,
      documentNumber: `SOP.${String(i + 5).padStart(4, "0")}.0${(i % 3) + 1}`,
      revisionNumber: `${Math.floor(i / 3) + 1}.${i % 3}`,
      created: new Date(Date.now() - Math.random() * 10000000000).toISOString().split("T")[0],
      openedBy: ["John Smith", "Jane Doe", "Alice Johnson", "Bob Williams"][i % 4],
      revisionName: `Revision ${i + 5}`,
      state: status,
      author: ["Dr. Sarah Johnson", "Michael Chen", "Emily Brown", "David Lee"][i % 4],
      effectiveDate: new Date(Date.now() + Math.random() * 10000000000).toISOString().split("T")[0],
      validUntil: new Date(Date.now() + Math.random() * 20000000000).toISOString().split("T")[0],
      documentName: `Standard Operating Procedure ${i + 5}`,
      type: ["SOP", "Policy", "Form", "Report"][i % 4] as DocumentType,
      department: ["Quality Assurance", "Production", "R&D", "Regulatory Affairs"][i % 4],
      businessUnit: ["Quality", "Operations", "Research", "Corporate"][i % 4],
      hasRelatedDocuments: status === "Effective" && i % 3 === 0, // Some Effective revisions have related docs
      hasCorrelatedDocuments: i % 2 === 0, // Some revisions have correlated docs
      isTemplate: i % 4 === 0,
      correlatedDocuments: i % 2 === 0
        ? [
            {
              id: `cor-gen-${i}-1`,
              documentNumber: `POL.${String(i + 20).padStart(4, "0")}.01`,
              documentName: `Correlated Policy ${i + 5}`,
              revisionNumber: "1.0",
              type: ["Policy", "SOP"][i % 2] as DocumentType,
              state: ["Effective", "Approved"][i % 2] as DocumentStatus,
              correlationType: ["Reference", "Impact", "Dependency"][i % 3],
            },
          ]
        : undefined,
      relatedDocuments: status === "Effective" && i % 3 === 0
        ? [
            {
              id: `rel-gen-${i}-1`,
              documentNumber: `SOP.${String(i + 10).padStart(4, "0")}.01`,
              documentName: `Annexure for SOP ${i + 5}`,
              revisionNumber: "1.0",
              type: ["SOP", "Form"][i % 2] as DocumentType,
              state: "Effective" as DocumentStatus,
            },
            ...(i % 6 === 0
              ? [
                  {
                    id: `rel-gen-${i}-2`,
                    documentNumber: `FORM.${String(i + 10).padStart(4, "0")}.01`,
                    documentName: `Checklist for SOP ${i + 5}`,
                    revisionNumber: "2.0",
                    type: "Form" as DocumentType,
                    state: "Approved" as DocumentStatus,
                  },
                ]
              : []),
          ]
        : undefined,
    };
  }),
];

// --- Mock Data (Owned by current user) ---
export const MOCK_MY_REVISIONS: Revision[] = Array.from({ length: 18 }, (_, i) => {
  const status = ["Draft", "Pending Review", "Approved", "Effective"][i % 4] as DocumentStatus;
  return {
    id: `my-${i + 1}`,
    documentNumber: `SOP.${String(i + 1).padStart(4, "0")}.0${(i % 2) + 1}`,
    revisionNumber: `${Math.floor(i / 2) + 1}.${i % 2}`,
    created: new Date(Date.now() - Math.random() * 10000000000)
      .toISOString()
      .split("T")[0],
    openedBy: ["John Smith", "Jane Doe", "Dr. Sarah Johnson", "Michael Chen"][i % 4],
    revisionName: `My Revision ${i + 1}`,
    state: status,
    effectiveDate: new Date(Date.now() + Math.random() * 10000000000)
      .toISOString()
      .split("T")[0],
    validUntil: new Date(Date.now() + Math.random() * 20000000000)
      .toISOString()
      .split("T")[0],
    documentName: `My Document ${i + 1}`,
    type: ["SOP", "Policy", "Form", "Report"][i % 4] as DocumentType,
    department: ["Quality Assurance", "Production", "R&D"][i % 3],
    businessUnit: ["Quality", "Operations", "Research"][i % 3],
    author: ["Dr. Sarah Johnson", "Michael Chen", "Emily Davis", "Robert Brown"][i % 4],
    hasRelatedDocuments: i % 3 === 0,
    hasCorrelatedDocuments: i % 4 === 1,
    isTemplate: i % 4 === 0,
    relatedDocuments: i % 3 === 0 ? [
      { id: `rel-my-${i}-1`, documentNumber: `SOP.${String(i + 1).padStart(4, "0")}.01`, documentName: `Related Document ${i + 1}`, revisionNumber: "1.0", type: "SOP" as DocumentType, state: "Effective" as DocumentStatus },
      ...(i % 6 === 0 ? [{ id: `rel-my-${i}-2`, documentNumber: `FORM.${String(i + 1).padStart(4, "0")}.01`, documentName: `Supporting Form ${i + 1}`, revisionNumber: "2.0", type: "Form" as DocumentType, state: "Approved" as DocumentStatus }] : []),
    ] : undefined,
    correlatedDocuments: i % 4 === 1 ? [
      { id: `cor-my-${i}-1`, documentNumber: `POL.${String(i + 1).padStart(4, "0")}.01`, documentName: `Correlated Policy ${i + 1}`, revisionNumber: "1.0", type: "Policy" as DocumentType, state: "Effective" as DocumentStatus, correlationType: "Reference" },
    ] : undefined,
  };
});
