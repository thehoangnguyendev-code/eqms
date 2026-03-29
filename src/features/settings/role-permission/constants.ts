import { Role, PermissionGroup, Permission } from "./types";

// GxP-compliant permission groups
export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: "documents",
    name: "Document Management",
    description: "Document lifecycle, version control, and distribution",
    order: 1,
    permissions: [
      { id: "doc_view", module: "documents", action: "view", label: "View Documents", description: "Access and read approved documents", requiresAudit: false },
      { id: "doc_create", module: "documents", action: "create", label: "Create Documents", description: "Create new documents and drafts", requiresAudit: true },
      { id: "doc_edit", module: "documents", action: "edit", label: "Edit Documents", description: "Modify document content and metadata", requiresAudit: true },
      { id: "doc_review", module: "documents", action: "review", label: "Review Documents", description: "Participate in document review workflows", requiresAudit: true },
      { id: "doc_approve", module: "documents", action: "approve", label: "Approve Documents", description: "Final approval authority for documents", requiresAudit: true },
      { id: "doc_print", module: "documents", action: "export", label: "Print/Controlled Copy", description: "Generate controlled copies", requiresAudit: true },
      { id: "doc_archive", module: "documents", action: "archive", label: "Archive Documents", description: " retire and archive obsolete documents", requiresAudit: true },
      { id: "doc_delete", module: "documents", action: "delete", label: "Delete Documents", description: "Permanently remove documents (Admin only)", requiresAudit: true },
    ],
  },
  {
    id: "change_control",
    name: "Change Controls",
    description: "Change request initiation, impact assessment, and implementation",
    order: 2,
    permissions: [
      { id: "cc_view", module: "change_control", action: "view", label: "View Changes", description: "View change requests and logs", requiresAudit: false },
      { id: "cc_create", module: "change_control", action: "create", label: "Initiate Change", description: "Create new change requests (CR)", requiresAudit: true },
      { id: "cc_edit", module: "change_control", action: "edit", label: "Edit Change Request", description: "Modify CR details and plans", requiresAudit: true },
      { id: "cc_review", module: "change_control", action: "review", label: "Impact Assessment", description: "Perform impact assessment review", requiresAudit: true },
      { id: "cc_approve", module: "change_control", action: "approve", label: "Approve Changes", description: "Authorize change implementation", requiresAudit: true },
      { id: "cc_close", module: "change_control", action: "close", label: "Close Change Request", description: "Verify effectiveness and close CR", requiresAudit: true },
    ],
  },
  {
    id: "capa",
    name: "CAPA Management",
    description: "Corrective and Preventive Actions tracking",
    order: 3,
    permissions: [
      { id: "capa_view", module: "capa", action: "view", label: "View CAPA", description: "View CAPA records", requiresAudit: false },
      { id: "capa_create", module: "capa", action: "create", label: "Initiate CAPA", description: "Create new CAPA records", requiresAudit: true },
      { id: "capa_edit", module: "capa", action: "edit", label: "Edit CAPA", description: "Update CAPA investigation and plans", requiresAudit: true },
      { id: "capa_review", module: "capa", action: "review", label: "Review CAPA", description: "Review investigation results", requiresAudit: true },
      { id: "capa_approve", module: "capa", action: "approve", label: "Approve CAPA Plan", description: "Approve action plan implementation", requiresAudit: true },
      { id: "capa_close", module: "capa", action: "close", label: "Effectiveness Check", description: "Verify effectiveness and close CAPA", requiresAudit: true },
    ],
  },
  {
    id: "deviations",
    name: "Deviation & NCs",
    description: "Deviation reporting and investigation",
    order: 4,
    permissions: [
      { id: "dev_view", module: "deviations", action: "view", label: "View Deviations", description: "Access deviation records", requiresAudit: false },
      { id: "dev_create", module: "deviations", action: "create", label: "Report Deviation", description: "Log new deviation events", requiresAudit: true },
      { id: "dev_edit", module: "deviations", action: "edit", label: "Investigate Deviation", description: "Document root cause analysis", requiresAudit: true },
      { id: "dev_approve", module: "deviations", action: "approve", label: "Approve Deviation", description: "Approve disposition and closure", requiresAudit: true },
    ],
  },
  {
    id: "complaints",
    name: "Complaints Management",
    description: "Customer complaints handling and resolution",
    order: 5,
    permissions: [
      { id: "complaint_view", module: "complaints", action: "view", label: "View Complaints", description: "Access complaint records", requiresAudit: false },
      { id: "complaint_create", module: "complaints", action: "create", label: "Log Complaint", description: "Register new customer complaints", requiresAudit: true },
      { id: "complaint_edit", module: "complaints", action: "edit", label: "Investigate Complaint", description: "Document investigation and actions", requiresAudit: true },
      { id: "complaint_approve", module: "complaints", action: "approve", label: "Approve Resolution", description: "Approve complaint resolution", requiresAudit: true },
      { id: "complaint_close", module: "complaints", action: "close", label: "Close Complaint", description: "Verify and close complaint", requiresAudit: true },
    ],
  },
  {
    id: "training",
    name: "Training Management",
    description: "Training courses, materials, result entry, compliance tracking and records",
    order: 6,
    permissions: [
      // ── General ──────────────────────────────────────────────────
      { id: "train_view", module: "training", action: "view", label: "View My Training", description: "View personal training assignments and status", requiresAudit: false },
      { id: "train_manage_view", module: "training", action: "view", label: "View All Training", description: "View organization-wide training records and matrix", requiresAudit: false },
      { id: "train_assign", module: "training", action: "assign", label: "Assign Training", description: "Assign training courses to users or roles", requiresAudit: true },
      // ── Course Inventory ─────────────────────────────────────────
      { id: "train_course_create", module: "training", action: "create", label: "Create Courses", description: "Create new training courses and configure assessments", requiresAudit: true },
      { id: "train_course_edit", module: "training", action: "edit", label: "Edit Courses", description: "Update course content, settings and enrolled participants", requiresAudit: true },
      { id: "train_course_delete", module: "training", action: "delete", label: "Delete Courses", description: "Permanently remove training courses", requiresAudit: true },
      { id: "train_course_review", module: "training", action: "review", label: "Review Courses", description: "Review submitted courses in the Pending Review queue", requiresAudit: true },
      { id: "train_course_approve", module: "training", action: "approve", label: "Approve Courses", description: "Approve courses from the Pending Approval queue", requiresAudit: true },
      { id: "train_result_entry", module: "training", action: "create", label: "Enter Training Results", description: "Record scores and evidence for quiz/paper-based courses", requiresAudit: true },
      // ── Training Materials ───────────────────────────────────────
      { id: "train_mat_view", module: "training", action: "view", label: "View Training Materials", description: "Browse and view the training materials library", requiresAudit: false },
      { id: "train_mat_upload", module: "training", action: "create", label: "Upload Training Materials", description: "Upload new training files (PDF, Video, Image, Document)", requiresAudit: true },
      { id: "train_mat_edit", module: "training", action: "edit", label: "Edit Training Materials", description: "Update material metadata and create new revisions", requiresAudit: true },
      { id: "train_mat_delete", module: "training", action: "delete", label: "Delete Training Materials", description: "Remove training materials from the library", requiresAudit: true },
      { id: "train_mat_review", module: "training", action: "review", label: "Review & Approve Materials", description: "Review and approve training materials in the workflow", requiresAudit: true },
      { id: "train_mat_obsolete", module: "training", action: "archive", label: "Mark Materials Obsolete", description: "Mark training materials as obsolete with impact analysis", requiresAudit: true },
      // ── Compliance Tracking & Records ────────────────────────────
      { id: "train_matrix_view", module: "training", action: "view", label: "View Training Matrix", description: "View compliance tracking matrix for all users", requiresAudit: false },
      { id: "train_compliance_view", module: "training", action: "view", label: "View Course Status", description: "View course completion status and compliance reports", requiresAudit: false },
      { id: "train_records_export", module: "training", action: "export", label: "Export Training Records", description: "Export employee training files and compliance data", requiresAudit: true },
    ],
  },
  {
    id: "risk_management",
    name: "Risk Management",
    description: "Risk assessment, FMEA, and mitigation",
    order: 7,
    permissions: [
      { id: "risk_view", module: "risk_management", action: "view", label: "View Risk Registry", description: "View risk assessments", requiresAudit: false },
      { id: "risk_create", module: "risk_management", action: "create", label: "Create Assessment", description: "Initiate new risk assessment", requiresAudit: true },
      { id: "risk_edit", module: "risk_management", action: "edit", label: "Update Risk", description: "Modify risk scores and mitigation", requiresAudit: true },
      { id: "risk_approve", module: "risk_management", action: "approve", label: "Approve Risk Assessment", description: "Approve risk levels", requiresAudit: true },
    ],
  },
  {
    id: "equipment",
    name: "Equipment Management",
    description: "Equipment tracking, calibration, and maintenance",
    order: 8,
    permissions: [
      { id: "equip_view", module: "equipment", action: "view", label: "View Equipment", description: "Access equipment records and logs", requiresAudit: false },
      { id: "equip_create", module: "equipment", action: "create", label: "Register Equipment", description: "Add new equipment to system", requiresAudit: true },
      { id: "equip_edit", module: "equipment", action: "edit", label: "Update Equipment", description: "Modify equipment details and status", requiresAudit: true },
      { id: "equip_calibrate", module: "equipment", action: "review", label: "Calibration Records", description: "Log calibration and maintenance", requiresAudit: true },
      { id: "equip_approve", module: "equipment", action: "approve", label: "Approve Equipment", description: "Approve equipment qualification", requiresAudit: true },
    ],
  },
  {
    id: "supplier_quality",
    name: "Supplier Management",
    description: "Supplier qualification, audits, and scorecards",
    order: 9,
    permissions: [
      { id: "supp_view", module: "supplier_quality", action: "view", label: "View Suppliers", description: "View approved supplier list", requiresAudit: false },
      { id: "supp_create", module: "supplier_quality", action: "create", label: "Onboard Supplier", description: "Add new supplier for qualification", requiresAudit: true },
      { id: "supp_audit", module: "supplier_quality", action: "review", label: "Perform Audit", description: "Log supplier audit results", requiresAudit: true },
      { id: "supp_approve", module: "supplier_quality", action: "approve", label: "Approve Supplier", description: "Approve supplier status", requiresAudit: true },
    ],
  },
  {
    id: "product",
    name: "Product Management",
    description: "Product specifications, lifecycle, and compliance",
    order: 10,
    permissions: [
      { id: "prod_view", module: "product", action: "view", label: "View Products", description: "Access product catalog and specs", requiresAudit: false },
      { id: "prod_create", module: "product", action: "create", label: "Create Product", description: "Register new products and formulations", requiresAudit: true },
      { id: "prod_edit", module: "product", action: "edit", label: "Update Product", description: "Modify product specifications", requiresAudit: true },
      { id: "prod_approve", module: "product", action: "approve", label: "Approve Product", description: "Approve product for production", requiresAudit: true },
    ],
  },
  {
    id: "regulatory",
    name: "Regulatory Management",
    description: "Regulatory compliance, submissions, and registrations",
    order: 11,
    permissions: [
      { id: "reg_view", module: "regulatory", action: "view", label: "View Submissions", description: "Access regulatory submission records", requiresAudit: false },
      { id: "reg_create", module: "regulatory", action: "create", label: "Create Submission", description: "Prepare regulatory submissions", requiresAudit: true },
      { id: "reg_edit", module: "regulatory", action: "edit", label: "Update Submission", description: "Modify submission documents", requiresAudit: true },
      { id: "reg_approve", module: "regulatory", action: "approve", label: "Approve Submission", description: "Approve regulatory submissions", requiresAudit: true },
      { id: "reg_export", module: "regulatory", action: "export", label: "Export Reports", description: "Export regulatory reports", requiresAudit: true },
    ],
  },
  {
    id: "reports",
    name: "Reports & Analytics",
    description: "Business intelligence, KPIs, and compliance reports",
    order: 12,
    permissions: [
      { id: "report_view", module: "reports", action: "view", label: "View Reports", description: "Access standard reports and dashboards", requiresAudit: false },
      { id: "report_create", module: "reports", action: "create", label: "Create Reports", description: "Build custom reports and queries", requiresAudit: false },
      { id: "report_export", module: "reports", action: "export", label: "Export Reports", description: "Export reports to PDF/Excel", requiresAudit: true },
    ],
  },
  {
    id: "audit_trail",
    name: "Audit Trail System",
    description: "System audit logs, compliance reporting, and e-signatures",
    order: 13,
    permissions: [
      { id: "audit_view", module: "audit_trail", action: "view", label: "View Audit Logs", description: "Access comprehensive audit trail", requiresAudit: false },
      { id: "audit_export", module: "audit_trail", action: "export", label: "Export Audit Logs", description: "Export logs for regulatory inspection", requiresAudit: true },
    ],
  },
  {
    id: "settings",
    name: "System Settings",
    description: "General configuration, user management, roles, and parameters",
    order: 14,
    permissions: [
      { id: "settings_view", module: "settings", action: "view", label: "View Configuration", description: "View system settings", requiresAudit: false },
      { id: "settings_edit", module: "settings", action: "edit", label: "Edit Configuration", description: "Modify system parameters", requiresAudit: true },
      { id: "user_view", module: "settings", action: "view", label: "View Users", description: "View user directory", requiresAudit: false },
      { id: "user_create", module: "settings", action: "create", label: "Create Users", description: "Provision new user accounts", requiresAudit: true },
      { id: "user_edit", module: "settings", action: "edit", label: "Edit Users", description: "Update user profiles and roles", requiresAudit: true },
      { id: "user_reset", module: "settings", action: "edit", label: "Reset Password", description: "Trigger password reset for users", requiresAudit: true },
      { id: "role_manage", module: "settings", action: "edit", label: "Manage Roles", description: "Create and modify system roles", requiresAudit: true },
    ],
  },
];

// ALCOA+ compliance helper
export const isALCOAPlusRequired = (permissionId: string): boolean => {
  for (const group of PERMISSION_GROUPS) {
    const permission = group.permissions.find(p => p.id === permissionId);
    if (permission) {
      return permission.requiresAudit;
    }
  }
  return false;
};
