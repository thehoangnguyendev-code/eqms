/**
 * Controlled Copies Types
 * 
 * Re-export from the controlled-copies module for centralized access.
 * The actual type definitions are maintained in controlled-copies/types.ts
 * Note: TableColumn is already exported from document.types.ts
 */

import type { DocumentStatus } from './document.types';

export type {
  ControlledCopyStatus,
  CurrentStage,
  ControlledCopy,
} from '../controlled-copies/types';

// Additional types for RequestControlledCopyView
export interface DistributionLocation {
  id: string;
  code: string;
  name: string;
  department: string;
}

export interface DocumentToPrint {
  id: string;
  documentId: string;
  title: string;
  version: string;
  status: DocumentStatus;
  isParent: boolean;
}
