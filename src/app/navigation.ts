/**
 * Navigation Configuration
 * Defines the application navigation structure
 *
 * @module navigation
 * @description Modular navigation config organized by functional domains
 */

import {
  Bell,
  Package,
  Scale,
  ShieldCheck,
  BookText,
  GraduationCap,
  UserStar,
} from "lucide-react";

import {
  IconAlertTriangle,
  IconBrandAsana,
  IconBuildingStore,
  IconClipboardCheck,
  IconDeviceDesktopCog,
  IconDeviceLaptop,
  IconFileDescription,
  IconFilter2Search,
  IconMessageReport,
  IconReplace,
  IconSettings2,
  IconLayoutGrid,
  IconShieldExclamation,
  IconBook,
  IconUsers,
  IconChartHistogram,
  IconAdjustmentsHorizontal,
  IconMessageChatbot,
  IconAlertSquareRounded,
  IconMailForward,
  IconChartBar,
  IconLifebuoy,
  IconMessage,
} from "@tabler/icons-react";
import { NavItem } from "@/types";
import { ROUTES } from "./routes.constants";

// ============================================================================
// CORE NAVIGATION (Dashboard, Tasks, Notifications)
// ============================================================================
const CORE_NAV: NavItem[] = [
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    path: ROUTES.NOTIFICATIONS
  },
  {
    id: "dashboard",
    label: "Dashboard",
    icon: IconLayoutGrid,
    path: ROUTES.DASHBOARD,
    showDividerAfter: true,
  },
  {
    id: "my-tasks",
    label: "My Tasks",
    icon: IconBrandAsana,
    path: ROUTES.MY_TASKS,
    showDividerAfter: true,
  }
];

// ============================================================================
// DOCUMENT & TRAINING (Foundation)
// ============================================================================
const FOUNDATION_MODULES: NavItem[] = [
  {
    id: "doc-control",
    label: "Document Control",
    icon: IconFileDescription,
    children: [
      {
        id: "knowledge-base",
        label: "Knowledge Base",
        path: ROUTES.DOCUMENTS.KNOWLEDGE,
      },
      {
        id: "doc-owned-me",
        label: "Documents Owned By Me",
        path: ROUTES.DOCUMENTS.OWNED,
      },
      { id: "doc-all", label: "All Documents", path: ROUTES.DOCUMENTS.ALL },
      {
        id: "doc-revisions",
        label: "Document Revisions",
        children: [
          {
            id: "rev-owned-me",
            label: "Revisions Owned By Me",
            path: ROUTES.DOCUMENTS.REVISIONS.OWNED,
          },
          {
            id: "rev-all",
            label: "All Revisions",
            path: ROUTES.DOCUMENTS.REVISIONS.ALL,
          },
        ],
      },
      {
        id: "pending-review",
        label: "Pending My Review",
        path: ROUTES.DOCUMENTS.REVISIONS.PENDING_REVIEW,
      },
      {
        id: "pending-approval",
        label: "Pending My Approval",
        path: ROUTES.DOCUMENTS.REVISIONS.PENDING_APPROVAL,
      },
      {
        id: "controlled-copies",
        label: "Controlled Copies",
        children: [
          {
            id: "cc-all",
            label: "All Controlled Copies",
            path: ROUTES.DOCUMENTS.CONTROLLED_COPIES.ALL,
          },
          {
            id: "cc-ready",
            label: "Ready for Distribution",
            path: ROUTES.DOCUMENTS.CONTROLLED_COPIES.READY,
          },
          {
            id: "cc-distributed",
            label: "Distributed Copies",
            path: ROUTES.DOCUMENTS.CONTROLLED_COPIES.DISTRIBUTED,
          },
        ],
      },
      {
        id: "archive-documents",
        label: "Archived Documents",
        path: ROUTES.DOCUMENTS.ARCHIVED,
      },
    ],
  },
  {
    id: "training-management",
    label: "Training Management",
    icon: GraduationCap,
    children: [
      {
        id: "my-training",
        label: "My Training",
        path: ROUTES.TRAINING.MY_TRAINING,
      },
      {
        id: "training-materials",
        label: "Training Materials",
        path: ROUTES.TRAINING.MATERIALS,
      },
      {
        id: "course-inventory",
        label: "Course Inventory",
        children: [
          {
            id: "courses-list",
            label: "Courses List",
            path: ROUTES.TRAINING.COURSES_LIST,
          },
          {
            id: "training-pending-review",
            label: "Pending Review",
            path: ROUTES.TRAINING.PENDING_REVIEW,
          },
          {
            id: "training-pending-approval",
            label: "Pending Approval",
            path: ROUTES.TRAINING.PENDING_APPROVAL,
          },
        ],
      },
      {
        id: "compliance-tracking",
        label: "Compliance Tracking",
        children: [
          {
            id: "auto-assignment-rules",
            label: "Auto-Assignment Rules",
            path: ROUTES.TRAINING.ASSIGNMENT_RULES,
          },
          {
            id: "training-matrix",
            label: "Training Matrix",
            path: ROUTES.TRAINING.TRAINING_MATRIX,
          },
          {
            id: "course-status",
            label: "Course Status",
            path: ROUTES.TRAINING.COURSE_STATUS,
          },
        ],
      },
      {
        id: "records-archive",
        label: "Records & Archive",
        children: [
          {
            id: "employee-training-files",
            label: "Employee Training Files",
            path: ROUTES.TRAINING.EMPLOYEE_TRAINING_FILES,
          },
          {
            id: "export-records",
            label: "Export Records",
            path: ROUTES.TRAINING.EXPORT_RECORDS,
          },
        ],
      },
    ],
  },
];

// ============================================================================
// QUALITY PROCESSES (Deviation, CAPA, Change, Complaint, Risk)
// ============================================================================
const QUALITY_MODULES: NavItem[] = [
  {
    id: "deviation-ncs",
    label: "Deviations & NCs",
    icon: IconAlertTriangle,
    path: ROUTES.DEVIATIONS,
  },
  {
    id: "capa-management",
    label: "CAPA Management",
    icon: IconClipboardCheck,
    path: ROUTES.CAPA,
  },
  {
    id: "change-control",
    label: "Change Controls",
    icon: IconReplace,
    path: ROUTES.CHANGE_CONTROL,
  },
  {
    id: "complaints-management",
    label: "Complaints Management",
    icon: IconMessageReport,
    path: ROUTES.COMPLAINTS,
  },
  {
    id: "risk-management",
    label: "Risk Management",
    icon: IconShieldExclamation,
    path: ROUTES.RISK,
  },
];

// ============================================================================
// OPERATIONS MODULES (Equipment, Supplier, Product)
// ============================================================================
const OPERATIONS_MODULES: NavItem[] = [
  {
    id: "equipment-management",
    label: "Equipment Management",
    icon: IconDeviceLaptop,
    path: ROUTES.EQUIPMENT,
  },
  {
    id: "supplier-management",
    label: "Supplier Management",
    icon: IconBuildingStore,
    path: ROUTES.SUPPLIER,
  },
  {
    id: "product-management",
    label: "Product Management",
    icon: Package,
    path: ROUTES.PRODUCT,
  },
];

// ============================================================================
// REGULATORY TRACK
// ============================================================================
const REGULATORY_MODULE: NavItem[] = [
  {
    id: "regulatory-management",
    label: "Regulatory Management",
    icon: Scale,
    path: ROUTES.REGULATORY,
  },
];

// ============================================================================
// SYSTEM (Reports, Audit, Settings)
// ============================================================================
const SYSTEM_MODULES: NavItem[] = [
  {
    id: "report",
    label: "Reports & Analytics",
    icon: IconChartBar,
    path: ROUTES.REPORT,
  },
  {
    id: "audit-trail",
    label: "Audit Trail",
    icon: IconFilter2Search,
    showDividerAfter: true,
    path: ROUTES.AUDIT_TRAIL,
  },
  {
    id: "system-administration",
    label: "System Administration",
    icon: UserStar,
    children: [
      {
        id: "user-management",
        label: "User Management",
        icon: IconUsers,
        path: ROUTES.SETTINGS.USERS,
      },
      {
        id: "roles",
        label: "Roles & Permissions",
        icon: ShieldCheck,
        path: ROUTES.SETTINGS.ROLES,
      },
      {
        id: "config",
        label: "Configuration",
        icon: IconDeviceDesktopCog,
        path: ROUTES.SETTINGS.CONFIGURATION,
      },
      {
        id: "info-sys",
        label: "System Information",
        icon: IconAlertSquareRounded,
        path: ROUTES.SETTINGS.SYSTEM_INFO,
      },
    ],
  },
  {
    id: "settings",
    label: "Application Settings",
    icon: IconSettings2,
    children: [
      {
        id: "dictionaries",
        label: "Dictionaries",
        icon: BookText,
        path: ROUTES.SETTINGS.DICTIONARIES,
      },
      {
        id: "email-templates",
        label: "Email Templates",
        icon: IconMailForward,
        path: ROUTES.SETTINGS.EMAIL_TEMPLATES,
      },
    ],
  },
  {
    id: "help-support",
    label: "Help & Support",
    icon: IconLifebuoy,
    children: [
      {
        id: "user-manual",
        label: "User Manual",
        icon: IconBook,
        path: ROUTES.HELP_SUPPORT_MANUAL,
      },
      {
        id: "contact-support",
        label: "Contact Support",
        icon: IconMessage,
        path: ROUTES.HELP_SUPPORT_CONTACT,
      },
    ],
  },
  {
    id: "preferences",
    label: "Preferences",
    icon: IconAdjustmentsHorizontal,
    path: ROUTES.PREFERENCES,
  },
];

// ============================================================================
// MAIN CONFIGURATION
// ============================================================================
export const NAV_CONFIG: NavItem[] = [
  ...CORE_NAV,
  ...FOUNDATION_MODULES,
  ...QUALITY_MODULES,
  ...OPERATIONS_MODULES,
  ...REGULATORY_MODULE,
  ...SYSTEM_MODULES,
];

// Helper to find a node and build breadcrumbs
export const findNodeAndBreadcrumbs = (
  items: NavItem[],
  targetId: string,
  currentPath: { label: string; id: string }[] = [],
): { label: string; id: string }[] | null => {
  for (const item of items) {
    const newPath = [...currentPath, { label: item.label, id: item.id }];
    if (item.id === targetId) {
      return newPath;
    }
    if (item.children) {
      const result = findNodeAndBreadcrumbs(item.children, targetId, newPath);
      if (result) return result;
    }
  }
  return null;
};

// Helper to find nav item by path
export const findNodeByPath = (
  items: NavItem[],
  targetPath: string,
): NavItem | null => {
  for (const item of items) {
    if (item.path === targetPath) {
      return item;
    }
    if (item.children) {
      const result = findNodeByPath(item.children, targetPath);
      if (result) return result;
    }
  }
  return null;
};

// Helper to get all paths (useful for route generation)
export const getAllPaths = (items: NavItem[]): string[] => {
  const paths: string[] = [];
  const traverse = (nodes: NavItem[]) => {
    nodes.forEach((node) => {
      if (node.path) paths.push(node.path);
      if (node.children) traverse(node.children);
    });
  };
  traverse(items);
  return paths;
};
