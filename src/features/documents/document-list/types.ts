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

export interface Document {
  id: string;
  documentId: string;
  title: string;
  type: DocumentType;
  version: string;
  status: DocumentStatus;
  effectiveDate: string;
  validUntil: string;
  author: string;
  businessUnit: string;
  department: string;
  created: string;
  openedBy: string;
  description?: string;
  hasRelatedDocuments?: boolean;
  hasCorrelatedDocuments?: boolean;
  isTemplate?: boolean;
  relatedDocuments?: RelatedDocument[];
  correlatedDocuments?: CorrelatedDocument[];
}