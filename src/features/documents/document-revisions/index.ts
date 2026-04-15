/**
 * Document Revisions Module
 * 
 * Contains views and components for document revision management.
 */

// List Views
export { RevisionListView } from './views/RevisionListView';
export { RevisionsOwnedByMeView } from './views/RevisionsOwnedByMeView';
export { PendingDocumentsView } from './views/PendingDocumentsView';
export { DetailRevisionView } from './detail-revision/DetailRevisionView';

// Revision Creation & Workspace
export { NewRevisionView } from './components/NewRevisionView';
export { RevisionWorkspaceView } from './components/RevisionWorkspaceView';
export { UpgradeRevisionView } from './components/UpgradeRevisionView';
export { MultiDocumentUpload } from './components/MultiDocumentUpload';

// Review & Approval
export { RevisionReviewView } from './review-revision/RevisionReviewView';
export { RevisionApprovalView } from './approval-revision/RevisionApprovalView';

// Controlled Copy
export { RequestControlledCopyView } from './views/RequestControlledCopyView';

// Tabs
export * from './revision-tabs';
export * from './subtabs';

// Local revision view types
export type { Revision, RelatedDocument, CorrelatedDocument } from './views/types';
