/**
 * New Document Tabs
 * 
 * Tab components for new document creation workflow.
 * Specific tabs are defined here, shared tabs are re-exported from shared/tabs.
 */

// Document-specific tabs (kept separate due to different functionality)
export { DocumentTab, type UploadedFile } from './document-tab/DocumentTab';
export { FilePreview } from './document-tab/FilePreview';

// Re-export shared tabs for convenience
export { 
  GeneralTab,
  TrainingTab, 
  SignaturesTab, 
  AuditTab,
  // GeneralTab subtabs components
  DocumentRelationships,
  type ParentDocument,
  type RelatedDocument,
} from '@/features/documents/shared/tabs';

