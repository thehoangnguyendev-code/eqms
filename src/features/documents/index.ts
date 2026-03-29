/**
 * Documents Feature
 * 
 * Main entry point for the documents feature module.
 * This feature handles all document-related functionality including:
 * - Document listing and viewing
 * - Document creation and editing
 * - Document review and approval workflows
 * - Document revisions
 * - Controlled copies management
 * - Template library
 * - Archived documents
 */

// =============================================================================
// TYPES (explicit exports to avoid conflicts)
// =============================================================================
export type {
  DocumentType,
  DocumentStatus,
  DocumentViewType,
  TableColumn,
  Document,
  UploadedFile,
  ControlledCopyRequest,
} from './types/document.types';

export type {
  ArchivedDocument,
  RetentionStatus,
  RestoreRequest,
  AuditLogEntry,
  RetentionFilter,
} from './types/archived.types';

export type {
  ControlledCopyStatus,
  CurrentStage,
  ControlledCopy,
  DistributionLocation,
  DocumentToPrint,
} from './types/controlled-copy.types';

// =============================================================================
// SHARED COMPONENTS & LAYOUTS
// =============================================================================
export { DocumentFilters, CreateLinkModal } from './shared/components';
export { DocumentWorkflowLayout, DEFAULT_WORKFLOW_TABS } from './shared/layouts';

// Shared Tabs
export { 
  GeneralTab,
  TrainingTab, 
  SignaturesTab, 
  AuditTab,
  DocumentRelationships,
} from './shared/tabs';

// =============================================================================
// DOCUMENT LIST & VIEWS
// =============================================================================
export { DocumentsView } from './document-list/DocumentsView';
export { DetailDocumentView } from './document-detail/DetailDocumentView';

// Document Creation
export { NewDocumentView } from './document-list/document-creation/NewDocumentView';

// =============================================================================
// DOCUMENT REVISIONS
// =============================================================================
export { RevisionListView } from './document-revisions/views/RevisionListView';
export { RevisionsOwnedByMeView } from './document-revisions/views/RevisionsOwnedByMeView';
export { PendingDocumentsView } from './document-revisions/views/PendingDocumentsView';
export { DetailRevisionView } from './document-revisions/detail-revision/DetailRevisionView';
export { NewRevisionView } from './document-revisions/components/NewRevisionView';
export { RevisionWorkspaceView } from './document-revisions/components/RevisionWorkspaceView';
export { UpgradeRevisionView } from './document-revisions/components/UpgradeRevisionView';
export { RevisionReviewView } from './document-revisions/review-revision/RevisionReviewView';
export { RevisionApprovalView } from './document-revisions/approval-revision/RevisionApprovalView';

// =============================================================================
// CONTROLLED COPIES
// =============================================================================
export { ControlledCopiesView } from './controlled-copies/ControlledCopiesView';
export { ControlledCopyDetailView } from './controlled-copies/detail/ControlledCopyDetailView';
export { DestroyControlledCopyView } from './controlled-copies/components/DestroyControlledCopyView';
export { RequestControlledCopyView } from './document-revisions/views/RequestControlledCopyView';


// =============================================================================
// ARCHIVED DOCUMENTS
// =============================================================================
export { ArchivedDocumentsView } from './archived-documents/ArchivedDocumentsView';

// =============================================================================
// KNOWLEDGE BASE
// =============================================================================
export { KnowledgeView } from './knowledge';
