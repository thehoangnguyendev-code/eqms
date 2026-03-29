// Audit Trail Types

export type AuditAction =
  | "Create"
  | "Update"
  | "Delete"
  | "Approve"
  | "Reject"
  | "Review"
  | "Publish"
  | "Archive"
  | "Restore"
  | "Login"
  | "Logout"
  | "Export"
  | "Download"
  | "Upload"
  | "Assign"
  | "Unassign"
  | "Enable"
  | "Disable";

export type AuditModule =
  | "Document"
  | "Revision"
  | "User"
  | "Role"
  | "CAPA"
  | "Deviation"
  | "Training"
  | "Controlled Copy"
  | "System"
  | "Settings"
  | "Report"
  | "Task"
  | "Notification";

export type AuditSeverity = "Low" | "Medium" | "High" | "Critical";

export interface AuditTrailRecord {
  id: string;
  timestamp: string;
  user: string;
  userId: string;
  module: AuditModule;
  action: AuditAction;
  entityId: string;
  entityName: string;
  description: string;
  changes?: {
    field: string;
    oldValue: string;
    newValue: string;
  }[];
  ipAddress: string;
  device?: string;
  severity: AuditSeverity;
  metadata?: Record<string, any>;
}

export interface AuditTrailFilters {
  searchQuery: string;
  module: AuditModule | "All";
  action: AuditAction | "All";
  user: string;
  dateFrom: string;
  dateTo: string;
  severity: AuditSeverity | "All";
}
