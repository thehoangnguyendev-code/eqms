// Shared types for subtabs

// Document Revisions
export interface Revision {
    id: string;
    revisionNumber: string;
    created: string;
    openedBy: string;
    revisionName: string;
    state: "draft" | "pendingReview" | "approved" | "effective" | "obsolete";
}

// Document Relationships
export interface ParentDocument {
    id: string;
    documentNumber: string;
    created: string;
    openedBy: string;
    documentName: string;
    state: "draft" | "pendingReview" | "approved" | "effective" | "obsolete";
    documentType: string;
    department: string;
    authorCoAuthor: string;
    effectiveDate: string;
    validUntil: string;
}

export interface RelatedDocument {
    id: string;
    documentNumber: string;
    created: string;
    openedBy: string;
    documentName: string;
    state: "draft" | "pendingReview" | "approved" | "effective" | "obsolete";
    documentType: string;
    department: string;
    authorCoAuthor: string;
    effectiveDate: string;
    validUntil: string;
}

// Reviewers & Approvers
export interface Reviewer {
    id: string;
    name: string;
    role: string;
    email: string;
    department: string;
    order: number;
}

export interface Approver {
    id: string;
    name: string;
    role: string;
    email: string;
    department: string;
}

export type ReviewFlowType = 'sequential' | 'parallel';

// Controlled Copies
export interface ControlledCopy {
    id: string;
    controlledCopiesName: string;
    copyNumber: string;
    created: string;
    state: "draft" | "pendingReview" | "approved" | "effective" | "obsolete";
    openedBy: string;
    validUntil: string;
    documentRevision: string;
    documentNumber: string;
}

// Knowledge Base
export interface Knowledge {
    id: string;
    title: string;
    category: string;
    tags: string[];
    dateAdded: string;
}
