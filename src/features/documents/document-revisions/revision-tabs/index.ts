/**
 * Revision Workspace Tabs
 *
 * All tab components used in RevisionWorkspaceView are exported from here.
 * Workspace-specific tabs live in this directory.
 * Shared tabs are re-exported so the workspace imports from one place.
 */

// Revision-specific DocumentTab
export { DocumentTab, type UploadedFile } from './document-tab/DocumentTab';
export { FilePreview } from './document-tab/FilePreview';

// Workspace-specific new tabs
export { WorkingNotesTab } from './working-notes-tab/WorkingNotesTab';
export { InfoFromDocumentTab } from './info-from-document-tab/InfoFromDocumentTab';
export { WorkspaceReviewersTab } from './reviewers-tab/WorkspaceReviewersTab';
export { WorkspaceApproversTab } from './approvers-tab/WorkspaceApproversTab';

// Shared tabs still available (GeneralTab / TrainingTab for backward compat if needed)
export { GeneralTab } from '@/features/documents/shared/tabs';
export type { GeneralTabFormData } from '@/features/documents/shared/tabs';

// Revision workspace-local tab implementations (identical UI to detail-revision/tabs)
export { GeneralInformationTab } from './general-information/GeneralInformationTab';
export type { GeneralInformationDocumentDetail } from './general-information/GeneralInformationTab';
export { TrainingInformationTab } from './training-information-tab/TrainingInformationTab';
export { SignaturesTab } from './signatures-tab/SignaturesTab';
export { AuditTrailTab } from './audit-trail-tab/AuditTrailTab';

