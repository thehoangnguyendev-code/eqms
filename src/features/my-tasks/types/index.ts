/**
 * My Tasks - Type Definitions
 *
 * Centralized types for the My Tasks feature.
 */

export type Priority = "Critical" | "High" | "Medium" | "Low";
export type TaskStatus = "Pending" | "In-Progress" | "Reviewing" | "Completed";
export type ModuleType = "Document" | "Deviation" | "CAPA" | "Training";

export interface TimelineEvent {
  date: string;
  action: string;
  user: string;
}

export interface Task {
  id: string;
  taskId: string;
  title: string;
  description?: string;
  module: ModuleType;
  priority: Priority;
  dueDate: string; // dd/MM/yyyy
  status: TaskStatus;
  assignee: string;
  assigneeAvatar?: string;
  reporter: string;
  reporterAvatar?: string;
  progress: number;
  timeline: TimelineEvent[];
}

export interface TableColumn {
  id: string;
  label: string;
  visible: boolean;
  order: number;
  locked?: boolean; // Cannot be reordered (No. and Action columns)
}
