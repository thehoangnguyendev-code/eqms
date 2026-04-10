import type { BreadcrumbItem } from "../Breadcrumb";
import { dashboard } from "./shared";

export const equipmentManagement = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "Equipment Management", isActive: true },
];

export const changeControl = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "Change Controls", isActive: true },
];

export const auditTrail = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "Audit Trail", isActive: true },
];

export const auditTrailDetail = (_navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Audit Trail" },
  { label: "Audit Trail Detail", isActive: true },
];

export const report = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "Reports & Analytics", isActive: true },
];

export const deviations = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "Deviations & NCs", isActive: true },
];

export const capa = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "CAPA Management", isActive: true },
];

export const complaints = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "Complaints Management", isActive: true },
];

export const supplier = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "Supplier Management", isActive: true },
];

export const product = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "Product Management", isActive: true },
];

export const regulatory = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "Regulatory Management", isActive: true },
];

export const riskManagement = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "Risk Management", isActive: true },
];

export const userManual = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "Help & Support" },
  { label: "User Manual", isActive: true },
];

export const myTasks = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "My Tasks", isActive: true },
];

export const notifications = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "Notifications", isActive: true },
];
