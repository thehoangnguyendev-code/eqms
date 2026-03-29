import { TableColumn } from "./types";

// Routes
export const USER_MANAGEMENT_ROUTES = {
  LIST: "/settings/users",
  ADD: "/settings/users/add",
  EDIT: (userId: string) => `/settings/users/edit/${userId}`,
  PROFILE: (userId: string) => `/settings/users/profile/${userId}`,
} as const;

// Business Units and their Departments mapping
export const BUSINESS_UNIT_DEPARTMENTS: { [key: string]: string[] } = {
  "Corporate": ["IT Department", "Human Resources", "Finance", "Legal"],
  "Operations": ["Production", "Warehouse", "Logistics", "Maintenance"],
  "Quality": ["Quality Assurance", "Quality Control", "Regulatory Affairs"],
  "Research": ["R&D", "Laboratory", "Clinical Research"],
};

// Default table columns configuration
export const DEFAULT_COLUMNS: TableColumn[] = [
  { id: "no", label: "No.", visible: true, order: 0, locked: true },
  { id: "employeeCode", label: "Employee Code", visible: true, order: 1, locked: true },
  { id: "fullName", label: "Full Name", visible: true, order: 2, locked: true },
  { id: "username", label: "Username", visible: true, order: 3 },
  { id: "email", label: "Email", visible: true, order: 4 },
  { id: "phone", label: "Phone", visible: true, order: 5 },
  { id: "role", label: "Role", visible: true, order: 6 },
  { id: "businessUnit", label: "Business Unit", visible: true, order: 7 },
  { id: "department", label: "Department", visible: true, order: 8 },
  { id: "status", label: "Status", visible: true, order: 9, locked: true },
  { id: "suspendedUntil", label: "Suspended Until", visible: true, order: 10, locked: true },
  { id: "terminationDate", label: "Termination Date", visible: true, order: 11, locked: true },
  { id: "lastLogin", label: "Last Login", visible: true, order: 12 },
  { id: "createdDate", label: "Created Date", visible: true, order: 13 },
];

// Role color mapping
export const getRoleColor = (role: string) => {
  switch (role) {
    case "Admin":
      return "bg-red-50 text-red-700 border-red-200";
    case "QA Manager":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "Document Owner":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "Reviewer":
      return "bg-cyan-50 text-cyan-700 border-cyan-200";
    case "Approver":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Viewer":
      return "bg-slate-50 text-slate-700 border-slate-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
};
