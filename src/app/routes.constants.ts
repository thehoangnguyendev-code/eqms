/**
 * Application Route Constants
 * Centralized route definitions for type-safe navigation
 */

export const ROUTES = {
  // Auth
  LOGIN: '/login',
  TWO_FACTOR: '/login/2fa',
  FORGOT_PASSWORD: '/forgot-password',

  // Dashboard
  DASHBOARD: '/dashboard',

  // My Tasks
  MY_TASKS: '/my-tasks',

  // Notifications
  NOTIFICATIONS: '/notifications',

  // Documents
  DOCUMENTS: {
    OWNED: '/documents/owned',
    ALL: '/documents/all',
    NEW: '/documents/all/new',
    DETAIL: (id: string) => `/documents/${id}`,
    KNOWLEDGE: '/documents/knowledge',
    ARCHIVED: '/documents/archived',

    // Templates
    TEMPLATES: '/documents/templates',
    TEMPLATES_NEW: '/documents/templates/new',
    TEMPLATE_DETAIL: (id: string) => `/documents/templates/${id}`,

    // Revisions
    REVISIONS: {
      ALL: '/documents/revisions/all',
      OWNED: '/documents/revisions/owned',
      PENDING_REVIEW: '/documents/revisions/pending-review',
      PENDING_APPROVAL: '/documents/revisions/pending-approval',
      NEW: '/documents/revisions/new',
      NEW_MULTI: (sourceDocId: string) => `/documents/revisions/new-multi?sourceDocId=${sourceDocId}`,
      NEW_STANDALONE: (sourceDocId: string) => `/documents/revisions/new-standalone?sourceDocId=${sourceDocId}`,
      STANDALONE: '/documents/revisions/standalone',
      WORKSPACE: '/documents/revisions/workspace',
      DETAIL: (id: string) => `/documents/revisions/${id}`,
      REVIEW: (id: string) => `/documents/revisions/review/${id}`,
      APPROVAL: (id: string) => `/documents/revisions/approval/${id}`,
    },

    // Controlled Copies
    CONTROLLED_COPIES: {
      ALL: '/documents/controlled-copies/all',
      READY: '/documents/controlled-copies/ready',
      DISTRIBUTED: '/documents/controlled-copies/distributed',
      DETAIL: (id: string) => `/documents/controlled-copies/${id}`,
      DESTROY: (id: string) => `/documents/controlled-copies/${id}/destroy`,
      REQUEST: '/documents/controlled-copy/request',
    },
  },

  // Training
  TRAINING: {
    BASE: '/training-management',
    // Course Inventory
    COURSES_LIST: '/training-management/courses-list',
    COURSES_CREATE: '/training-management/courses/create',
    COURSE_DETAIL: (courseId: string) => `/training-management/courses/${courseId}`,
    COURSE_EDIT: (courseId: string) => `/training-management/courses/${courseId}/edit`,
    COURSE_PROGRESS: (courseId: string) => `/training-management/courses/${courseId}/progress`,
    COURSE_RESULT_ENTRY: (courseId: string) => `/training-management/courses/${courseId}/result-entry`,
    MY_TRAINING: "/training-management/my-training",
    // Approval
    PENDING_REVIEW: '/training-management/pending-review',
    PENDING_APPROVAL: '/training-management/pending-approval',
    APPROVAL_DETAIL: (id: string) => `/training-management/pending-review/${id}`,
    APPROVE_DETAIL: (id: string) => `/training-management/pending-approval/${id}`,
    // Compliance Tracking
    TRAINING_MATRIX: '/training-management/training-matrix',
    COURSE_STATUS: '/training-management/course-status',
    // Assignment
    ASSIGNMENTS: '/training-management/assignments',
    ASSIGNMENT_NEW: '/training-management/assignments/new',
    ASSIGNMENT_RULES: '/training-management/assignment-rules',
    // Records & Archive
    EMPLOYEE_TRAINING_FILES: '/training-management/employee-training-files',
    EMPLOYEE_DOSSIER: (id: string) => `/training-management/employee-training-files/${id}`,
    EXPORT_RECORDS: '/training-management/export-records',
    // Materials
    MATERIALS: '/training-management/materials',
    MATERIAL_DETAIL: (materialId: string) => `/training-management/materials/${materialId}`,
    MATERIAL_EDIT: (materialId: string) => `/training-management/materials/${materialId}/edit`,
    MATERIAL_REVIEW: (materialId: string) => `/training-management/materials/review/${materialId}`,
    MATERIAL_APPROVAL: (materialId: string) => `/training-management/materials/approval/${materialId}`,
    MATERIAL_NEW_REVISION: (materialId: string) => `/training-management/materials/new-revision/${materialId}`,
    MATERIAL_USAGE_REPORT: (materialId: string) => `/training-management/materials/usage-report/${materialId}`,
    UPLOAD_MATERIAL: '/training-management/materials/upload',
  },

  // Deviation & NCs
  DEVIATIONS: '/deviations-ncs',

  // CAPA
  CAPA: '/capa-management',

  // Change Control
  CHANGE_CONTROL: '/change-management',

  // Complaints
  COMPLAINTS: '/complaints-management',

  // Equipment
  EQUIPMENT: '/equipment-management',

  // Supplier
  SUPPLIER: '/supplier-management',

  // Risk Management
  RISK: '/risk-management',

  // Product Management
  PRODUCT: '/product-management',

  // Regulatory Management
  REGULATORY: '/regulatory-management',

  // Report
  REPORT: '/report',

  // Audit Trail
  AUDIT_TRAIL: '/audit-trail',

  // Settings
  SETTINGS: {
    USERS: '/settings/users',
    USERS_ADD: '/settings/users/add',
    USERS_EDIT: (userId: string) => `/settings/users/edit/${userId}`,
    USERS_PROFILE: (userId: string) => `/settings/users/profile/${userId}`,
    ROLES: '/settings/roles',
    ROLES_NEW: '/settings/roles/new',
    ROLES_DETAIL: (roleId: string) => `/settings/roles/${roleId}`,
    ROLES_EDIT: (roleId: string) => `/settings/roles/${roleId}/edit`,
    DICTIONARIES: '/settings/dictionaries',
    CONFIGURATION: '/settings/configuration',
    SYSTEM_INFO: '/settings/system-info',
    EMAIL_TEMPLATES: '/settings/email-templates',
    EMAIL_TEMPLATES_NEW: '/settings/email-templates/new',
    EMAIL_TEMPLATES_EDIT: (id: string) => `/settings/email-templates/edit/${id}`,
  },

  // User Manual
  USER_MANUAL: '/user-manual',

  // Preferences
  PREFERENCES: '/preferences',

  // Help & Support
  HELP_SUPPORT: '/help-support',
  HELP_SUPPORT_MANUAL: '/help-support/manual',
  HELP_SUPPORT_CONTACT: '/help-support/contact',

  // Profile
  PROFILE: '/profile',
} as const;

/**
 * Helper to get route with parameters
 * @example getRoute(ROUTES.DOCUMENTS.DETAIL, '123') // '/documents/123'
 */
export const getRoute = (
  routeFn: string | ((param: string) => string),
  param?: string
): string => {
  if (typeof routeFn === 'function' && param) {
    return routeFn(param);
  }
  return routeFn as string;
};

export const ROUTE_NEW_REVISION_MULTI = '/documents/revisions/new-multi';
export const ROUTE_NEW_REVISION_STANDALONE = '/documents/revisions/new-standalone';

/**
 * Path prefixes that indicate a "transactional" screen (create, edit, review,
 * approval, new, add, upload, workspace, destroy, etc.). When the user navigates
 * away from such a screen via the sidebar, a leave-confirmation modal is shown.
 *
 * RULE: Only include paths that are SPECIFIC enough to never match a list/index
 * page. Prefer explicit subpaths (e.g. `/create`, `/edit`, `/destroy`) over
 * broad category prefixes that would also match list pages.
 *
 * Two matching strategies are supported (see isTransactionalRoute):
 *   prefix: []  → path.startsWith(prefix)   (e.g. fixed action paths)
 *   suffix: []  → path.endsWith(suffix)     (e.g. /:id/edit, /:id/destroy)
 */

/** Paths matched by startsWith — must never be the beginning of a list URL */
export const TRANSACTIONAL_PREFIXES: readonly string[] = [
  // ── Documents ──────────────────────────────────────────────────────────────
  '/documents/all/new',
  '/documents/revisions/new',          // /revisions/new, /new-multi, /new-standalone
  '/documents/revisions/workspace',
  '/documents/revisions/review/',      // /revisions/review/:id
  '/documents/revisions/approval/',    // /revisions/approval/:id
  '/documents/controlled-copy/request',

  // ── Training – Course Inventory ────────────────────────────────────────────
  '/training-management/courses/create',

  // ── Training – Approval ────────────────────────────────────────────────────
  // NOTE: APPROVAL_DETAIL = /pending-review/:id  (no extra subpath)
  //       → matched by suffix '/pending-review/' below is unsafe (would match list)
  //       → handled via TRANSACTIONAL_SEGMENTS instead

  // ── Training – Assignment ──────────────────────────────────────────────────
  '/training-management/assignments/new',

  // ── Training – Materials ───────────────────────────────────────────────────
  '/training-management/materials/upload',
  '/training-management/materials/review/',        // /materials/review/:id
  '/training-management/materials/approval/',      // /materials/approval/:id
  '/training-management/materials/new-revision/',  // /materials/new-revision/:id

  // ── Settings – Users ───────────────────────────────────────────────────────
  '/settings/users/add',
  '/settings/users/edit/',     // /users/edit/:id
  '/settings/users/profile/',  // /users/profile/:id

  // ── Settings – Roles ───────────────────────────────────────────────────────
  '/settings/roles/new',

  // ── Settings – Email Templates ─────────────────────────────────────────────
  '/settings/email-templates/new',
  '/settings/email-templates/edit/',  // /email-templates/edit/:id
] as const;

/**
 * Path suffixes matched by endsWith — catches /:id/edit, /:id/destroy, etc.
 * These patterns are safe because the list page never ends in these strings.
 */
export const TRANSACTIONAL_SUFFIXES: readonly string[] = [
  '/edit',           // /documents/:id/edit, /courses/:id/edit, /materials/:id/edit, /roles/:id/edit
  '/destroy',        // /controlled-copies/:id/destroy
  '/result-entry',   // /courses/:id/result-entry
  '/progress',       // /courses/:id/progress  (may have data entry)
] as const;

/**
 * Exact route segments whose presence in the path (between slashes) identifies
 * approval/review detail screens where the ID comes right after the segment.
 * e.g. /training-management/pending-review/123  →  segment "pending-review"
 *      /training-management/pending-approval/456 →  segment "pending-approval"
 */
export const TRANSACTIONAL_SEGMENTS: readonly string[] = [
  'pending-review',
  'pending-approval',
] as const;

// Keep this for backward compat — union of all three strategies
export const TRANSACTIONAL_PATH_PREFIXES: readonly string[] = [
  ...TRANSACTIONAL_PREFIXES,
] as const;

/**
 * Returns true if the given path is a transactional screen (create/edit/review/approval/etc.).
 * Used by Sidebar to show leave confirmation when navigating away.
 *
 * Uses three strategies:
 *  1. startsWith – for known fixed-prefix screens (create, new, upload, etc.)
 *  2. endsWith   – for /:id/edit, /:id/destroy, /:id/result-entry, etc.
 *  3. segments   – for /:section/:id patterns (pending-review/:id)
 */
export function isTransactionalRoute(pathname: string): boolean {
  // Normalise: strip query string and trailing slash
  const path = pathname.replace(/\?.*$/, '').replace(/\/$/, '') || '/';

  // 1. Prefix match
  if (TRANSACTIONAL_PREFIXES.some((prefix) => path.startsWith(prefix))) {
    return true;
  }

  // 2. Suffix match
  if (TRANSACTIONAL_SUFFIXES.some((suffix) => path.endsWith(suffix))) {
    return true;
  }

  // 3. Segment match: /section/:id  where section is in TRANSACTIONAL_SEGMENTS
  //    The path must have at least one more segment after the known segment (the :id)
  const parts = path.split('/').filter(Boolean);
  for (let i = 0; i < parts.length - 1; i++) {
    if (TRANSACTIONAL_SEGMENTS.includes(parts[i])) {
      return true; // parts[i+1] is the :id
    }
  }

  return false;
}
