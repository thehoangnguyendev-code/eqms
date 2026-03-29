// Role & Permission Type Definitions

export type PermissionAction = 
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "approve"
  | "archive"
  | "export"
  | "assign"
  | "close"
  | "review";

export interface Permission {
  id: string;
  module: string;
  action: PermissionAction;
  label: string;
  description: string;
  requiresAudit: boolean; // ALCOA+ compliance - track critical actions
}

export interface PermissionGroup {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  order: number;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  type: "system" | "custom";
  isActive: boolean;
  userCount: number;
  permissions: string[]; // Permission IDs
  createdDate: string;
  modifiedDate: string;
  color: string; // Badge color
}

export interface AuditLog {
  id: string;
  roleId: string;
  roleName: string;
  action: "created" | "modified" | "deleted" | "permissions_changed";
  changedBy: string;
  changedDate: string;
  changes: {
    field: string;
    oldValue: string | string[];
    newValue: string | string[];
  }[];
  reason: string;
}
