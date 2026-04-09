// Email Templates Constants

import { TableColumn, EmailVariable, EmailTemplateType } from "./types";

// Routes
export const EMAIL_TEMPLATES_ROUTES = {
  LIST: "/settings/email-templates",
  CREATE: "/settings/email-templates/create",
  EDIT: (id: string) => `/settings/email-templates/edit/${id}`,
  PREVIEW: (id: string) => `/settings/email-templates/preview/${id}`,
} as const;

// Email Template Types Configuration
export const EMAIL_TEMPLATE_TYPES: Record<EmailTemplateType, { label: string; description: string; icon: string }> = {
  "password-reset": {
    label: "Password Reset",
    description: "Email sent when users request password reset",
    icon: "🔐"
  },
  "user-welcome": {
    label: "User Welcome",
    description: "Welcome email sent to new users",
    icon: "👋"
  },
  "account-activation": {
    label: "Account Activation",
    description: "Email sent to activate new user accounts",
    icon: "✅"
  },
  "document-review": {
    label: "Document Review",
    description: "Notification for document review requests",
    icon: "📄"
  },
  "document-approval": {
    label: "Document Approval",
    description: "Notification for document approval requests",
    icon: "👍"
  },
  "training-notification": {
    label: "Training Notification",
    description: "Notifications related to training assignments",
    icon: "🎓"
  },
  "audit-notification": {
    label: "Audit Notification",
    description: "Notifications for audit activities",
    icon: "🔍"
  },
  "complaint-notification": {
    label: "Complaint Notification",
    description: "Notifications for complaint submissions",
    icon: "📢"
  },
  "deviation-notification": {
    label: "Deviation Notification",
    description: "Notifications for deviation reports",
    icon: "⚠️"
  },
  "change-control-notification": {
    label: "Change Control Notification",
    description: "Notifications for change control processes",
    icon: "🔄"
  },
  "supplier-notification": {
    label: "Supplier Notification",
    description: "Notifications related to supplier activities",
    icon: "🏢"
  },
  "equipment-maintenance": {
    label: "Equipment Maintenance",
    description: "Notifications for equipment maintenance",
    icon: "🔧"
  },
  "report-generation": {
    label: "Report Generation",
    description: "Notifications when reports are generated",
    icon: "📊"
  },
  "system-maintenance": {
    label: "System Maintenance",
    description: "System maintenance notifications",
    icon: "⚙️"
  },
  "custom": {
    label: "Custom Template",
    description: "Custom email template for specific needs",
    icon: "✨"
  }
};

// Available Variables for Email Templates
export const EMAIL_VARIABLES: EmailVariable[] = [
  // User Variables
  { key: "userName", label: "User Name", description: "Full name of the recipient", example: "John Doe", category: "user" },
  { key: "userEmail", label: "User Email", description: "Email address of the recipient", example: "john.doe@company.com", category: "user" },
  { key: "userRole", label: "User Role", description: "Role of the recipient user", example: "QA Manager", category: "user" },
  { key: "userDepartment", label: "User Department", description: "Department of the recipient", example: "Quality Assurance", category: "user" },
  { key: "employeeCode", label: "Employee Code", description: "Employee code of the recipient", example: "EMP001", category: "user" },

  // System Variables
  { key: "systemName", label: "System Name", description: "Name of the EQMS system", example: "Zenith Quality EQMS", category: "system" },
  { key: "companyName", label: "Company Name", description: "Company name", example: "Zenith Quality Solutions", category: "system" },
  { key: "currentDate", label: "Current Date", description: "Current date in readable format", example: "January 15, 2024", category: "date" },
  { key: "currentTime", label: "Current Time", description: "Current time", example: "14:30:00", category: "date" },

  // URL Variables
  { key: "loginUrl", label: "Login URL", description: "URL to login page", example: "https://eqms.company.com/login", category: "url" },
  { key: "resetPasswordUrl", label: "Reset Password URL", description: "URL for password reset", example: "https://eqms.company.com/reset-password?token=abc123", category: "url" },
  { key: "dashboardUrl", label: "Dashboard URL", description: "URL to user dashboard", example: "https://eqms.company.com/dashboard", category: "url" },
  { key: "profileUrl", label: "Profile URL", description: "URL to user profile", example: "https://eqms.company.com/profile", category: "url" },

  // Document Variables
  { key: "documentTitle", label: "Document Title", description: "Title of the document", example: "SOP-001: Quality Management", category: "document" },
  { key: "documentNumber", label: "Document Number", description: "Document number/code", example: "DOC-2024-001", category: "document" },
  { key: "documentVersion", label: "Document Version", description: "Current version of document", example: "1.2", category: "document" },
  { key: "documentUrl", label: "Document URL", description: "URL to view the document", example: "https://eqms.company.com/documents/view/123", category: "document" },
  { key: "reviewDueDate", label: "Review Due Date", description: "Due date for document review", example: "February 28, 2024", category: "date" },
  { key: "approvalDueDate", label: "Approval Due Date", description: "Due date for document approval", example: "March 15, 2024", category: "date" },

  // Training Variables
  { key: "trainingTitle", label: "Training Title", description: "Title of the training", example: "GMP Training Module 1", category: "document" },
  { key: "trainingDueDate", label: "Training Due Date", description: "Due date for training completion", example: "March 30, 2024", category: "date" },
  { key: "trainingUrl", label: "Training URL", description: "URL to access training", example: "https://eqms.company.com/training/456", category: "url" },

  // Audit Variables
  { key: "auditTitle", label: "Audit Title", description: "Title of the audit", example: "Annual Quality Audit 2024", category: "document" },
  { key: "auditDate", label: "Audit Date", description: "Date of the audit", example: "April 10, 2024", category: "date" },
  { key: "auditUrl", label: "Audit URL", description: "URL to audit details", example: "https://eqms.company.com/audits/view/789", category: "url" },

  // Custom Variables (can be extended)
  { key: "customField1", label: "Custom Field 1", description: "Custom variable for specific needs", example: "Custom Value", category: "custom" },
  { key: "customField2", label: "Custom Field 2", description: "Custom variable for specific needs", example: "Custom Value", category: "custom" },
];

// Default table columns configuration
export const DEFAULT_COLUMNS: TableColumn[] = [
  { id: "no", label: "No.", visible: true, order: 0, locked: true },
  { id: "name", label: "Template Name", visible: true, order: 1, locked: true },
  { id: "type", label: "Type", visible: true, order: 2 },
  { id: "subject", label: "Subject", visible: true, order: 3 },
  { id: "status", label: "Status", visible: true, order: 4, locked: true },
  { id: "usageCount", label: "Usage Count", visible: true, order: 5 },
  { id: "lastUsed", label: "Last Used", visible: true, order: 6 },
  { id: "updatedDate", label: "Updated Date", visible: true, order: 7 },
  { id: "createdBy", label: "Created By", visible: true, order: 8 },
];



// File upload configuration for logos
export const LOGO_UPLOAD_CONFIG = {
  maxSize: 2 * 1024 * 1024, // 2MB
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml'],
  maxWidth: 800,
  maxHeight: 600
};