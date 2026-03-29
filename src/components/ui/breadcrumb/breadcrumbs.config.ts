import { ROUTES } from "@/app/routes.constants";
import type { BreadcrumbItem } from "./Breadcrumb";

// ============================================================================
// Helper: Dashboard root item (always the first item)
// ============================================================================
const dashboard = (_navigate?: (path: string) => void): BreadcrumbItem => ({
  label: "Dashboard",
});

// ============================================================================
// BREADCRUMB DEFINITIONS
// Organized by module. Each function returns BreadcrumbItem[].
// Use `navigate` param to make parent items clickable.
// ============================================================================

// --- Equipment ---
export const equipmentManagement = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "Equipment Management", isActive: true },
];

// --- Change Control ---
export const changeControl = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "Change Controls", isActive: true },
];

// --- Audit Trail ---
export const auditTrail = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "Audit Trail", isActive: true },
];

export const auditTrailDetail = (_navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Audit Trail" },
  { label: "Audit Trail Detail", isActive: true },
];

// --- Report ---
export const report = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "Reports & Analytics", isActive: true },
];

// --- Deviations ---
export const deviations = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "Deviations & NCs", isActive: true },
];

// --- CAPA ---
export const capa = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "CAPA Management", isActive: true },
];

// --- Complaints ---
export const complaints = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "Complaints Management", isActive: true },
];

// --- Supplier ---
export const supplier = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "Supplier Management", isActive: true },
];

// --- Product ---
export const product = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "Product Management", isActive: true },
];

// --- Regulatory ---
export const regulatory = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "Regulatory Management", isActive: true },
];

// --- Risk Management ---
export const riskManagement = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "Risk Management", isActive: true },
];

// --- User Manual ---
export const userManual = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "Help & Support" },
  { label: "User Manual", isActive: true },
];

// ============================================================================
// DOCUMENT MODULE
// ============================================================================

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

// --- Document Revisions ---
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
  documentId?: string
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

export const revisionReview = (
  _navigate?: (path: string) => void,
  _onBack?: () => void,
): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Document Control" },
  { label: "Document Revisions" },
  { label: "Pending My Review" },
  { label: "Review Revision", isActive: true },
];

export const revisionApproval = (
  _navigate?: (path: string) => void,
  _onBack?: () => void,
): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Document Control" },
  { label: "Document Revisions" },
  { label: "Pending My Approval" },
  { label: "Approve Revision", isActive: true },
];

// --- Controlled Copies ---
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

// ============================================================================
// TRAINING MODULE
// ============================================================================

export const trainingMaterials = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "Training Management" },
  { label: "Training Materials", isActive: true },
];

export const uploadMaterial = (_navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Training Management" },
  { label: "Training Materials" },
  { label: "Upload Material", isActive: true },
];

export const materialDetail = (_navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Training Management" },
  { label: "Training Materials" },
  { label: "Material Detail", isActive: true },
];

export const materialEdit = (_navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Training Management" },
  { label: "Training Materials" },
  { label: "Edit Training Material", isActive: true },
];

export const materialNewRevision = (_navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Training Management" },
  { label: "Training Materials" },
  { label: "Upgrade Revision", isActive: true },
];

export const materialUsageReport = (_navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Training Management" },
  { label: "Training Materials" },
  { label: "Usage Report", isActive: true },
];

export const materialReview = (_navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Training Management" },
  { label: "Training Materials" },
  { label: "Review Material", isActive: true },
];

export const materialApproval = (_navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Training Management" },
  { label: "Training Materials" },
  { label: "Approve Material", isActive: true },
];

export const coursesList = (_navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Training Management" },
  { label: "Course Inventory" },
  { label: "Courses List", isActive: true },
];

export const courseDetail = (_navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Training Management" },
  { label: "Course Inventory" },
  { label: "Course Detail", isActive: true },
];

export const courseEdit = (_navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Training Management" },
  { label: "Course Inventory" },
  { label: "Edit Course", isActive: true },
];

export const courseCreate = (_navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Training Management" },
  { label: "Course Inventory" },
  { label: "Create Training", isActive: true },
];

export const courseProgress = (_navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Training Management" },
  { label: "Compliance Tracking" },
  { label: "Course Status" },
  { label: "Training Progress", isActive: true },
];

export const courseResultEntry = (_navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Training Management" },
  { label: "Course Status" },
  { label: "Result Entry", isActive: true },
];

export const coursePendingApproval = (_navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Training Management" },
  { label: "Course Inventory" },
  { label: "Pending Approval", isActive: true },
];

export const coursePendingReview = (_navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Training Management" },
  { label: "Course Inventory" },
  { label: "Pending Review", isActive: true },
];

export const trainingMatrix = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "Training Management" },
  { label: "Compliance Tracking" },
  { label: "Training Matrix", isActive: true },
];

export const courseStatus = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "Training Management" },
  { label: "Compliance Tracking" },
  { label: "Course Status", isActive: true },
];

export const employeeTrainingFiles = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "Training Management" },
  { label: "Records & Archive" },
  { label: "Employee Training Files", isActive: true },
];

export const exportRecords = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "Training Management" },
  { label: "Records & Archive" },
  { label: "Export Records", isActive: true },
];

export const assignTraining = (_navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Training Management" },
  { label: "Compliance Tracking" },
  { label: "Training Matrix" },
  { label: "New Training Assignment", isActive: true },
];

export const assignmentRules = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "Training Management" },
  { label: "Compliance Tracking" },
  { label: "Auto-Assignment Rules", isActive: true },
];

export const myTraining = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "Training Management" },
  { label: "My Training", isActive: true },
];

// ============================================================================
// SETTINGS MODULE
// ============================================================================

export const userManagement = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "Settings" },
  { label: "User Management", isActive: true },
];

export const addUser = (_navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Settings" },
  { label: "User Management" },
  { label: "Add User", isActive: true },
];

export const editUser = (
  _navigate?: (path: string) => void,
  employeeId?: string
): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Settings" },
  { label: "User Management" },
  { label: employeeId || "Edit User", isActive: true },
];

export const userProfile = (
  _navigate?: (path: string) => void,
  _fullName?: string
): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Settings" },
  { label: "User Management" },
  { label: "User Profile", isActive: true },
];

export const rolePermissions = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "Settings" },
  { label: "Role & Permissions", isActive: true },
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
    { label: "Setting" },
    { label: "Role & Permissions" },
    { label: labels[mode || "view"] || roleName || "Role Details", isActive: true },
  ];
};

export const dictionaries = (
  _navigate?: (path: string) => void,
  activeTabLabel?: string
): BreadcrumbItem[] => {
  const base: BreadcrumbItem[] = [
    dashboard(_navigate),
    { label: "Setting" },
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
  { label: "Setting" },
  { label: "System Configuration", isActive: true },
];

export const systemInformation = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "Setting" },
  { label: "System Information", isActive: true },
];

// --- My Tasks ---
export const myTasks = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "My Tasks", isActive: true },
];

// --- Notifications ---
export const notifications = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "Notifications", isActive: true },
];

// ============================================================================
// CONVENIENCE: Object export for easy access
// ============================================================================

const breadcrumbs = {
  // Simple modules
  equipmentManagement,
  changeControl,
  auditTrail,
  auditTrailDetail,
  report,
  deviations,
  capa,
  complaints,
  supplier,
  product,
  regulatory,
  riskManagement,
  userManual,

  // Documents
  documentList,
  archivedDocuments,
  knowledgeBase,
  newDocument,
  documentDetail,
  revisionList,
  revisionsOwnedByMe,
  pendingDocuments,
  requestControlledCopy,
  standaloneRevision,
  revisionWorkspace,
  newRevision,
  revisionDetail,
  revisionReview,
  revisionApproval,
  controlledCopies,
  controlledCopyDetail,
  destroyControlledCopy,

  // Training
  trainingMaterials,
  uploadMaterial,
  materialDetail,
  materialEdit,
  materialNewRevision,
  materialUsageReport,
  materialReview,
  materialApproval,
  coursesList,
  courseDetail,
  courseEdit,
  courseCreate,
  courseProgress,
  courseResultEntry,
  coursePendingApproval,
  coursePendingReview,
  trainingMatrix,
  courseStatus,
  employeeTrainingFiles,
  exportRecords,
  assignTraining,
  assignmentRules,

  // My Tasks & Notifications
  myTasks,
  notifications,

  // Settings
  userManagement,
  addUser,
  editUser,
  userProfile,
  rolePermissions,
  roleDetail,
  dictionaries,
  configuration,
  systemInformation,
  preferences: (navigate?: (path: string) => void): BreadcrumbItem[] => [
    dashboard(navigate),
    { label: "Preferences", isActive: true },
  ],
  helpSupport: (navigate?: (path: string) => void): BreadcrumbItem[] => [
    dashboard(navigate),
    { label: "Help & Support" },
    { label: "Contact Support", isActive: true },
  ],
};

export default breadcrumbs;
