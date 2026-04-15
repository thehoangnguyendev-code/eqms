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
export { DocumentsView, NewDocumentView } from './document-list';
export { DetailDocumentView } from './document-detail/DetailDocumentView';

// =============================================================================
// DOCUMENT REVISIONS
// =============================================================================
export {
  RevisionListView,
  RevisionsOwnedByMeView,
  PendingDocumentsView,
  DetailRevisionView,
  NewRevisionView,
  RevisionWorkspaceView,
  UpgradeRevisionView,
  RevisionReviewView,
  RevisionApprovalView,
} from './document-revisions';

// =============================================================================
// CONTROLLED COPIES
// =============================================================================
export { ControlledCopiesView, ControlledCopyDetailView, DestroyControlledCopyView } from './controlled-copies';
export { RequestControlledCopyView } from './document-revisions';


// =============================================================================
// ARCHIVED DOCUMENTS
// =============================================================================
export { ArchivedDocumentsView } from './archived-documents';

// =============================================================================
// KNOWLEDGE BASE
// =============================================================================
export { KnowledgeView } from './knowledge';
