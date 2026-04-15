import type { DocumentType, DocumentStatus } from "@/features/documents/types";

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