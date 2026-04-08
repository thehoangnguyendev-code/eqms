// Email Templates Type Definitions

export type EmailTemplateType =
  | "password-reset"
  | "user-welcome"
  | "account-activation"
  | "document-review"
  | "document-approval"
  | "training-notification"
  | "audit-notification"
  | "complaint-notification"
  | "deviation-notification"
  | "change-control-notification"
  | "supplier-notification"
  | "equipment-maintenance"
  | "report-generation"
  | "system-maintenance"
  | "custom";

export type EmailTemplateStatus = "Active" | "Inactive" | "Draft";

export interface EmailVariable {
  key: string;
  label: string;
  description: string;
  example: string;
  category: "user" | "system" | "document" | "url" | "date" | "custom";
}

export interface EmailTemplate {
  id: string;
  name: string;
  type: EmailTemplateType;
  subject: string;
  content: string; // HTML content from CKEditor
  status: EmailTemplateStatus;
  variables: string[]; // Array of variable keys used in template
  logoUrl?: string;
  logoFileName?: string;
  createdBy: string;
  createdDate: string;
  updatedBy?: string;
  updatedDate?: string;
  lastUsed?: string;
  usageCount: number;
  description?: string;
}

/** Payload for creating/updating email template */
export interface EmailTemplatePayload {
  name: string;
  type: EmailTemplateType;
  subject: string;
  content: string;
  status: EmailTemplateStatus;
  variables: string[];
  logoUrl?: string;
  logoFileName?: string;
  description?: string;
}

/** Table column configuration for email templates */
export interface TableColumn {
  id: string;
  label: string;
  visible: boolean;
  order: number;
  locked?: boolean;
}