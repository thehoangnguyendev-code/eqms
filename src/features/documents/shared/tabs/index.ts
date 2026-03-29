/**
 * Shared Tabs - Document Feature
 * 
 * Common tab components used across document workflows.
 * These tabs are reused in new documents, revisions, and templates.
 */

// General Tab (shared across all document types)
export { GeneralTab, type GeneralTabFormData } from './general-tab/GeneralTab';
export * from './general-tab/subtabs';

// Training Tab
export { TrainingTab, type TrainingConfig } from './training-tab/TrainingTab';

// Signatures Tab
export { SignaturesTab } from './signatures-tab/SignaturesTab';

// Audit Tab  
export { AuditTab } from './audit-tab/AuditTab';


