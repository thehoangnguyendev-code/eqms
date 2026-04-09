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
  IconUsersGroup,
  IconMailForward,
  IconChartBar,
} from "@tabler/icons-react";
import { NavItem } from "@/types";

// ============================================================================
// CORE NAVIGATION (Dashboard, Tasks, Notifications)
// ============================================================================
const CORE_NAV: NavItem[] = [
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    path: "/notifications"
  },
  {
    id: "dashboard",
    label: "Dashboard",
    icon: IconLayoutGrid,
    path: "/dashboard",
    showDividerAfter: true,
  },
  {
    id: "my-tasks",
    label: "My Tasks",
    icon: IconBrandAsana,
    path: "/my-tasks",
  },
  {
    id: "my-team",
    label: "My Team",
    icon: IconUsersGroup,
    path: "/my-team",
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
        path: "/documents/knowledge",
      },
      {
        id: "doc-owned-me",
        label: "Documents Owned By Me",
        path: "/documents/owned",
      },
      { id: "doc-all", label: "All Documents", path: "/documents/all" },
      {
        id: "doc-revisions",
        label: "Document Revisions",
        children: [
          {
            id: "rev-owned-me",
            label: "Revisions Owned By Me",
            path: "/documents/revisions/owned",
          },
          {
            id: "rev-all",
            label: "All Revisions",
            path: "/documents/revisions/all",
          },
          {
            id: "pending-review",
            label: "Pending My Review",
            path: "/documents/revisions/pending-review",
          },
          {
            id: "pending-approval",
            label: "Pending My Approval",
            path: "/documents/revisions/pending-approval",
          },
        ],
      },
      {
        id: "controlled-copies",
        label: "Controlled Copies",
        children: [
          {
            id: "cc-all",
            label: "All Controlled Copies",
            path: "/documents/controlled-copies/all",
          },
          {
            id: "cc-ready",
            label: "Ready for Distribution",
            path: "/documents/controlled-copies/ready",
          },
          {
            id: "cc-distributed",
            label: "Distributed Copies",
            path: "/documents/controlled-copies/distributed",
          },
        ],
      },
      {
        id: "archive-documents",
        label: "Archived Documents",
        path: "/documents/archived",
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
        path: "/training-management/my-training",
      },
      {
        id: "training-materials",
        label: "Training Material",
        path: "/training-management/materials",
      },
      {
        id: "course-inventory",
        label: "Course Inventory",
        children: [
          {
            id: "courses-list",
            label: "Courses List",
            path: "/training-management/courses-list",
          },
          {
            id: "training-pending-review",
            label: "Pending Review",
            path: "/training-management/pending-review",
            allowedRoles: ["admin", "manager"],
          },
          {
            id: "training-pending-approval",
            label: "Pending Approval",
            path: "/training-management/pending-approval",
            allowedRoles: ["admin", "manager"],
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
            path: "/training-management/assignment-rules",
          },
          {
            id: "training-matrix",
            label: "Training Matrix",
            path: "/training-management/training-matrix",
          },
          {
            id: "course-status",
            label: "Course Status",
            path: "/training-management/course-status",
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
            path: "/training-management/employee-training-files",
          },
          {
            id: "export-records",
            label: "Export Records",
            path: "/training-management/export-records",
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
    label: "Deviation & NCs",
    icon: IconAlertTriangle,
    path: "/deviations-ncs",
  },
  {
    id: "capa-management",
    label: "CAPA Management",
    icon: IconClipboardCheck,
    path: "/capa-management",
  },
  {
    id: "change-control",
    label: "Change Controls",
    icon: IconReplace,
    path: "/change-management",
  },
  {
    id: "complaints-management",
    label: "Complaints Management",
    icon: IconMessageReport,
    path: "/complaints-management",
  },
  {
    id: "risk-management",
    label: "Risk Management",
    icon: IconShieldExclamation,
    path: "/risk-management",
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
    path: "/equipment-management",
  },
  {
    id: "supplier-management",
    label: "Supplier Management",
    icon: IconBuildingStore,
    path: "/supplier-management",
  },
  {
    id: "product-management",
    label: "Product Management",
    icon: Package,
    path: "/product-management",
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
    path: "/regulatory-management",
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
    path: "/report",
  },
  {
    id: "audit-trail",
    label: "Audit Trail System",
    icon: IconFilter2Search,
    showDividerAfter: true,
    path: "/audit-trail",
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
        path: "/settings/users",
      },
      {
        id: "roles",
        label: "Roles & Permissions",
        icon: ShieldCheck,
        path: "/settings/roles",
      },
    ],
  },
  {
    id: "settings",
    label: "Configure Settings",
    icon: IconSettings2,
    children: [
      {
        id: "dictionaries",
        label: "Dictionaries",
        icon: BookText,
        path: "/settings/dictionaries",
      },
      {
        id: "email-templates",
        label: "Email Templates",
        icon: IconMailForward,
        path: "/settings/email-templates",
      },
      {
        id: "config",
        label: "Configuration",
        icon: IconDeviceDesktopCog,
        path: "/settings/configuration",
      },
      {
        id: "info-sys",
        label: "System Information",
        icon: IconAlertSquareRounded,
        path: "/settings/system-info",
      }
    ],
  },
  {
    id: "help-support",
    label: "Help & Support",
    icon: IconMessageChatbot,
    children: [
      {
        id: "user-manual",
        label: "User Manual",
        icon: IconBook,
        path: "/help-support/manual",
      },
      {
        id: "contact-support",
        label: "Contact Support",
        icon: IconMessageReport,
        path: "/help-support/contact",
      },
    ],
  },
  {
    id: "preferences",
    label: "Preferences",
    icon: IconAdjustmentsHorizontal,
    path: "/preferences",
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
