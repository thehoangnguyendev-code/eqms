import type { BreadcrumbItem } from "../Breadcrumb";
import { dashboard } from "./shared";

export const documentList = (
  navigate?: (path: string) => void,
  activeTab?: string
): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "Document Control" },
  { label: activeTab === "owned" ? "Documents Owned By Me" : "All Documents", isActive: true },
];

export const archivedDocuments = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "Document Control" },
  { label: "Archived Documents", isActive: true },
];

export const knowledgeBase = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "Document Control" },
  { label: "Knowledge Base", isActive: true },
];

export const newDocument = (_navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Document Control" },
  { label: "All Documents" },
  { label: "New Document", isActive: true },
];

export const documentDetail = (
  navigate?: (path: string) => void,
  options?: { fromArchive?: boolean }
): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "Document Control" },
  { label: options?.fromArchive ? "Archived Documents" : "All Documents" },
  { label: "Document Details", isActive: true },
];

export const revisionList = (_navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Document Control" },
  { label: "Document Revisions" },
  { label: "All Revisions", isActive: true },
];

export const revisionsOwnedByMe = (_navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Document Control" },
  { label: "Document Revisions" },
  { label: "Revisions Owned By Me", isActive: true },
];

export const pendingDocuments = (
  _navigate?: (path: string) => void,
  activeTab?: string
): BreadcrumbItem[] => {
  const tabLabels: Record<string, string> = {
    "pending-review": "Pending My Review",
    "pending-approval": "Pending My Approval",
  };
  return [
    dashboard(_navigate),
    { label: "Document Control" },
    { label: "Document Revisions" },
    { label: tabLabels[activeTab || ""] || "Pending Documents", isActive: true },
  ];
};

export const requestControlledCopy = (
  _navigate?: (path: string) => void,
  _documentId?: string
): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Document Control" },
  { label: "Document Revisions" },
  { label: "Request Controlled Copy", isActive: true },
];

export const standaloneRevision = (_navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Document Control" },
  { label: "All Documents" },
  { label: "Upgrade Revision", isActive: true },
];

export const revisionWorkspace = (_navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Document Control" },
  { label: "All Revisions" },
  { label: "Revision Workspace", isActive: true },
];

export const newRevision = (_navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Document Control" },
  { label: "Document Revisions" },
  { label: "All Revisions" },
  { label: "Impact Analysis", isActive: true },
];

export const revisionDetail = (_navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Document Control" },
  { label: "Document Revisions" },
  { label: "All Revisions" },
  { label: "Revision Details", isActive: true },
];

export const revisionReview = (_navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Document Control" },
  { label: "Document Revisions" },
  { label: "Pending My Review" },
  { label: "Review Revision", isActive: true },
];

export const revisionApproval = (_navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Document Control" },
  { label: "Document Revisions" },
  { label: "Pending My Approval" },
  { label: "Approve Revision", isActive: true },
];

export const controlledCopies = (
  _navigate?: (path: string) => void,
  activeTab?: string
): BreadcrumbItem[] => {
  const tabLabels: Record<string, string> = {
    all: "All Controlled Copies",
    ready: "Ready for Distribution",
    distributed: "Distributed Copies",
  };
  return [
    dashboard(_navigate),
    { label: "Document Control" },
    { label: "Controlled Copies" },
    { label: tabLabels[activeTab || "all"] || "All Controlled Copies", isActive: true },
  ];
};

export const controlledCopyDetail = (_navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Document Control" },
  { label: "Controlled Copies" },
  { label: "All Controlled Copies" },
  { label: "Controlled Copy Details", isActive: true },
];

export const destroyControlledCopy = (
  _navigate?: (path: string) => void,
  reportType?: string
): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Controlled Copies" },
  { label: reportType ? `Report ${reportType}` : "Destroy Report", isActive: true },
];
