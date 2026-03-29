/**
 * Dictionaries Types
 *
 * Single source of truth for all dictionary/lookup-table entity types.
 */
import type { ElementType } from 'react';

// ─── Navigation ───────────────────────────────────────────────────────────────
export type DictionaryType =
  | "document-types"
  | "departments"
  | "storage-locations"
  | "retention-policies";

export interface Dictionary {
  id: DictionaryType;
  label: string;
  icon: ElementType;
}

// ─── Department ──────────────────────────────────────────────────────────────
export type BusinessUnit = "Operation Unit" | "Quality Unit";

export interface DepartmentItem {
  id: string;
  name: string;
  abbreviation: string;
  businessUnit: BusinessUnit;
  description?: string;
  isActive: boolean;
  createdDate: string;
  modifiedDate: string;
}

// ─── Document Type ───────────────────────────────────────────────────────────
export interface DocumentTypeItem {
  id: string;
  name: string;
  description?: string;
  shortCode: string;
  currentSequence: number;
  isActive: boolean;
  createdDate: string;
  modifiedDate: string;
}

// ─── Retention Policy ────────────────────────────────────────────────────────
export interface RetentionPolicyItem {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdDate: string;
  modifiedDate: string;
}

// ─── Storage Location ────────────────────────────────────────────────────────
export interface StorageLocationItem {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdDate: string;
  modifiedDate: string;
}
