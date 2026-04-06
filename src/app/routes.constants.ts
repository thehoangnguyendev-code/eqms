/**
 * Application Route Constants
 * Centralized route definitions for type-safe navigation
 */

export const ROUTES = {
  // Auth
  LOGIN: '/login',
  TWO_FACTOR: '/login/2fa',
  FORGOT_PASSWORD: '/forgot-password',
  CONTACT_ADMIN: '/contact-admin',

  // Dashboard
  DASHBOARD: '/dashboard',

  // My Tasks
  MY_TASKS: '/my-tasks',

  // My Team
  MY_TEAM: '/my-team',

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
  },

  // User Manual
  USER_MANUAL: '/user-manual',

  // Preferences
  PREFERENCES: '/preferences',

  // Help & Support
  HELP_SUPPORT: '/help-support',

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
 * approval, new, add, upload, workspace, etc.). When the user navigates away
 * from such a screen via the sidebar, a leave-confirmation modal is shown.
 * Derived from ROUTES above.
 */
export const TRANSACTIONAL_PATH_PREFIXES: readonly string[] = [
  // Documents
  '/documents/all/new',
  '/documents/revisions/new',
  '/documents/revisions/new-multi',
  '/documents/revisions/new-standalone',
  '/documents/revisions/workspace',
  '/documents/revisions/review/',
  '/documents/revisions/approval/',
  '/documents/controlled-copies/', // detail, destroy
  // Training – Course Inventory
  '/training-management/courses/create',
  '/training-management/courses/', // detail, edit, progress, result-entry
  '/training-management/pending-review/', // review/:id
  '/training-management/pending-approval/', // approve/:id
  '/training-management/assignments/new',
  // Training – Materials
  '/training-management/materials/upload',
  '/training-management/materials/review/',
  '/training-management/materials/approval/',
  '/training-management/materials/new-revision/',
  '/training-management/materials/', // detail, edit, usage-report,
  // Settings
  '/settings/users/add',
  '/settings/users/edit/',
  '/settings/users/profile/',
  '/settings/roles/new',
  '/settings/roles/', // :id, :id/edit
] as const;

/**
 * Returns true if the given path is a transactional screen (create/edit/review/approval/etc.).
 * Used by Sidebar to show leave confirmation when navigating away.
 */
export function isTransactionalRoute(pathname: string): boolean {
  const path = pathname.replace(/\?.*$/, '').replace(/\/$/, '') || '/';
  return TRANSACTIONAL_PATH_PREFIXES.some((prefix) => path.startsWith(prefix));
}
