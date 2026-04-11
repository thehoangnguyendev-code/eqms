/**
 * Controlled Copies Module
 * 
 * Contains views and components for controlled document copy management.
 */

// Main Views
export { ControlledCopiesView } from './ControlledCopiesView';
export { ControlledCopyDetailView } from './detail/ControlledCopyDetailView';
export { DestroyControlledCopyView } from './components/DestroyControlledCopyView';

// Components
export { DestructionTypeSelectionModal } from './components/DestructionTypeSelectionModal';

// Types
export type { ControlledCopy, ControlledCopyStatus, TableColumn } from './types';

// Detail Tabs
export * from './detail/tabs';
