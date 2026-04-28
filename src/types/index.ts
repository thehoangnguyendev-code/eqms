/**
 * Shared TypeScript Types
 * Common types used across the application
 */

// ============ App Types ============
export * from './app';
export * from './roles';
import { UserRole } from './roles';

// ============ Document Types ============
import type { DocumentStatus } from '@/features/documents/types';
export type { DocumentStatus };

export interface Document {
  id: string;
  code: string;
  title: string;
  version: string;
  status: DocumentStatus;
  owner: string;
  lastModified: string;
  createdAt?: string;
  description?: string;
  attachments?: Attachment[];
}

export interface DocumentFilter {
  status?: DocumentStatus;
  search?: string;
  owner?: string;
  dateFrom?: string;
  dateTo?: string;
}

// ============ Task Types ============
export interface Task {
  id: string;
  taskId: string;
  title: string;
  description?: string;
  module: ModuleType;
  priority: Priority;
  dueDate: string;
  status: TaskStatus;
  assignee: string;
  assigneeAvatar?: string;
  reporter: string;
  reporterAvatar?: string;
  progress: number;
  timeline: TimelineEvent[];
  createdAt?: string;
  updatedAt?: string;
}

export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';
export type TaskStatus = 'Pending' | 'In-Progress' | 'Reviewing' | 'Completed';
export type ModuleType = 'DMS' | 'Deviation' | 'CAPA' | 'Training' | 'Change Control' | 'Complaints';

export interface TaskFilter {
  module?: string;
  priority?: string;
  status?: string;
  assignee?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
}

export interface TimelineEvent {
  date: string;
  action: string;
  user: string;
}

// ============ Auth Types ============
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department?: string;
  avatar?: string;
  permissions?: string[];
  createdAt?: string;
}


export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  expiresIn: number;
}

// ============ Common Types ============
export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  code: string;
  details?: any;
}

export interface SelectOption {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  disabled?: boolean;
}

// ============ Audit Trail Types ============
export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  userId: string;
  userName: string;
  timestamp: string;
  changes?: AuditChange[];
  ipAddress?: string;
}

export interface AuditChange {
  field: string;
  oldValue: any;
  newValue: any;
}

// ============ Notification Types ============
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

// ============ Form Types ============
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea' | 'file';
  required?: boolean;
  placeholder?: string;
  defaultValue?: any;
  options?: SelectOption[];
  validation?: ValidationRule[];
}

export interface ValidationRule {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern';
  value?: any;
  message: string;
}

// ============ Settings Types ============
export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: NotificationSettings;
  display: DisplaySettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  taskReminders: boolean;
  documentUpdates: boolean;
}

export interface DisplaySettings {
  itemsPerPage: number;
  dateFormat: string;
  timeFormat: '12h' | '24h';
}
