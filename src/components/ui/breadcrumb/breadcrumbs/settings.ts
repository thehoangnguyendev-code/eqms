import type { BreadcrumbItem } from "../Breadcrumb";
import { dashboard } from "./shared";

export const userManagement = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "System Administration" },
  { label: "User Management", isActive: true },
];

export const addUser = (_navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "System Administration" },
  { label: "User Management" },
  { label: "Add User", isActive: true },
];

export const editUser = (
  _navigate?: (path: string) => void,
  employeeId?: string
): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "System Administration" },
  { label: "User Management" },
  { label: employeeId || "Edit User", isActive: true },
];

export const userProfile = (
  _navigate?: (path: string) => void,
  _fullName?: string
): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "System Administration" },
  { label: "User Management" },
  { label: "User Profile", isActive: true },
];

export const rolePermissions = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "System Administration" },
  { label: "Roles & Permissions", isActive: true },
];

export const roleDetail = (
  _navigate?: (path: string) => void,
  mode?: "new" | "edit" | "view",
  roleName?: string
): BreadcrumbItem[] => {
  const labels: Record<string, string> = {
    new: "New Role",
    edit: "Edit Role",
    view: "Role Details",
  };
  return [
    dashboard(_navigate),
    { label: "System Administration" },
    { label: "Roles & Permissions" },
    { label: labels[mode || "view"] || roleName || "Role Details", isActive: true },
  ];
};

export const dictionaries = (
  _navigate?: (path: string) => void,
  activeTabLabel?: string
): BreadcrumbItem[] => {
  const base: BreadcrumbItem[] = [
    dashboard(_navigate),
    { label: "Configure Settings" },
  ];
  if (activeTabLabel) {
    base.push({ label: "Dictionaries" });
    base.push({ label: activeTabLabel, isActive: true });
  } else {
    base.push({ label: "Dictionaries", isActive: true });
  }
  return base;
};

export const configuration = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "Configure Settings" },
  { label: "System Configuration", isActive: true },
];

export const systemInformation = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "Configure Settings" },
  { label: "System Information", isActive: true },
];

export const emailTemplates = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "Configure Settings" },
  { label: "Email Templates", isActive: true },
];

export const emailTemplateCreate = (_navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Configure Settings" },
  { label: "Email Templates" },
  { label: "Create Template", isActive: true },
];

export const emailTemplateEdit = (
  _navigate?: (path: string) => void,
  templateName?: string
): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Configure Settings" },
  { label: "Email Templates" },
  { label: templateName || "Edit Template", isActive: true },
];

export const preferences = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "Preferences", isActive: true },
];

export const helpSupport = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "Help & Support" },
  { label: "Contact Support", isActive: true },
];
