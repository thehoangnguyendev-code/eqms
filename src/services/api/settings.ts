/**
 * Settings - User Management API Service
 * EU-GMP Chapter 2 (Personnel) compliant user and role management
 *
 * Endpoint base: /api/settings/users
 *                /api/settings/roles
 *                /api/settings/departments
 *                /api/settings/system
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * === USER MANAGEMENT ==========================================================
 * GET    /settings/users                   - Danh sách người dùng (filter + phân trang)
 *        Params: page, limit, search, role, status, businessUnit, department,
 *                dateFrom, dateTo, suspendFrom, suspendTo, terminateFrom, terminateTo
 * GET    /settings/users/:id               - Chi tiết 1 người dùng
 * POST   /settings/users                   - Tạo người dùng mới
 *        Body: { username, email, fullName, role, department, businessUnit,
 *                position?, phone?, employeeId?, startDate }
 *        Returns: { user: User, password: string }  (password tự sinh)
 * PUT    /settings/users/:id               - Cập nhật thông tin người dùng
 *        Body: { fullName?, email?, phone?, role?, department?, position? }
 * DELETE /settings/users/:id               - Xóa người dùng (không hồi phục)
 *
 * === METADATA & FILTERS =======================================================
 * GET    /settings/users/filters           - Lấy dữ liệu cho các dropdown bộ lọc user
 *        Returns: {
 *          roles: [{label, value}],
 *          statuses: [{label, value}],
 *          departments: [{label, value}],
 *          businessUnits: [{label, value}]
 *        }
 *
 * === USER LIFECYCLE ===========================================================
 * POST   /settings/users/:id/suspend       - Tạm đình chỉ tài khoản
 *        Body: { suspendReason, suspendedUntil?, suspendedBy }
 * POST   /settings/users/:id/terminate     - Nghỉ việc / chấm dứt hợp đồng
 *        Body: { terminationReason, terminationDate, terminatedBy }
 * POST   /settings/users/:id/reinstate     - Khôi phục tài khoản sau đình chỉ
 *        Body: { reinstatedBy, reason? }
 * POST   /settings/users/:id/reset-password - Đặt lại mật khẩu (admn)
 *        Body: { sendEmail?: boolean }     (nếu sendEmail=false → trả về password)
 *        Returns: { password?: string }
 * POST   /settings/users/:id/force-logout  - Đăng xuất bắt buộc (thu hồi session)
 * POST   /settings/users/:id/unlock        - Mở khóa tài khoản bị khóa do nhập sai mật khẩu
 *
 * === PERMISSIONS & ROLES ======================================================
 * GET    /settings/users/:id/permissions   - Xem quyền hiện tại của người dùng
 * PUT    /settings/users/:id/role          - Thay đổi vai trò
 *        Body: { role: UserRole }
 *
 * === ROLES ====================================================================
 * GET    /settings/roles                   - Danh sách vai trò với quyền hạn
 * GET    /settings/roles/:role/permissions - Chi tiết quyền của 1 role
 * PUT    /settings/roles/:role/permissions - Cập nhật quyền (chỉ Super Admin)
 *        Body: { permissions: string[] }
 *
 * === DEPARTMENTS ==============================================================
 * GET    /settings/departments             - Danh sách phòng ban
 * POST   /settings/departments             - Thêm phòng ban
 *        Body: { name, code, parentDepartment?, manager? }
 * PUT    /settings/departments/:id         - Cập nhật phòng ban
 * DELETE /settings/departments/:id         - Xóa phòng ban
 *
 * === SYSTEM SETTINGS ==========================================================
 * GET    /settings/system                  - Cấu hình hệ thống hiện tại
 *        Returns: { companyName, logo, timezone, dateFormat, documentPrefix,
 *                   passwordPolicy, sessionTimeout, maxLoginAttempts }
 * PUT    /settings/system                  - Cập nhật cấu hình hệ thống (Admin only)
 * POST   /settings/system/logo/upload      - Upload logo công ty
 *        Body: FormData { file }
 *
 * === PASSWORD POLICY ==========================================================
 * GET    /settings/system/password-policy  - Chính sách mật khẩu hiện tại
 * PUT    /settings/system/password-policy  - Cập nhật chính sách mật khẩu
 *        Body: { minLength, requireUppercase, requireNumbers, requireSymbols,
 *                expiryDays, historyCount, maxLoginAttempts, lockoutDuration }
 *
 * === BACKUP & MAINTENANCE =====================================================
 * POST   /settings/system/backup           - Trigger backup ngay
 * GET    /settings/system/backups          - Danh sách các bản backup
 * POST   /settings/system/backup/:id/restore - Restore từ backup (cực kỳ nguy hiểm!)
 *
 * === EXPORT ===================================================================
 * GET    /settings/users/export            - Export danh sách người dùng (XLSX blob)
 *        Params: role, status, businessUnit, department, dateFrom, dateTo
 */

import { api } from './client';
import type {
  User,
  CreateUserPayload,
  SuspendUserPayload,
  TerminateUserPayload,
  ResetPasswordPayload,
} from '@/features/settings/user-management/types';
import type { PaginatedResponse } from '@/types';

const ENDPOINT = '/settings/users';

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  businessUnit?: string;
  department?: string;
  dateFrom?: string;
  dateTo?: string;
  suspendFrom?: string;
  suspendTo?: string;
  terminateFrom?: string;
  terminateTo?: string;
}

export const settingsApi = {
  // ─── User CRUD ───────────────────────────────────────────────────────────────

  /** GET /settings/users — paginated list with filters */
  getUsers: async (params?: GetUsersParams) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') query.set(k, String(v));
      });
    }
    const response = await api.get<PaginatedResponse<User>>(`${ENDPOINT}?${query}`);
    return response.data;
  },

  /** GET /settings/users/:id */
  getUserById: async (id: string) => {
    const response = await api.get<User>(`${ENDPOINT}/${id}`);
    return response.data;
  },

  /** POST /settings/users */
  createUser: async (payload: CreateUserPayload) => {
    const response = await api.post<{ user: User; password: string }>(ENDPOINT, payload);
    return response.data;
  },

  /** PUT /settings/users/:id */
  updateUser: async (id: string, payload: Partial<User>) => {
    const response = await api.put<User>(`${ENDPOINT}/${id}`, payload);
    return response.data;
  },

  /** DELETE /settings/users/:id */
  deleteUser: async (id: string) => {
    const response = await api.delete(`${ENDPOINT}/${id}`);
    return response.data;
  },

  // ─── User Lifecycle ───────────────────────────────────────────────────────────

  /** POST /settings/users/:id/suspend */
  suspendUser: async (id: string, payload: SuspendUserPayload) => {
    const response = await api.post<User>(`${ENDPOINT}/${id}/suspend`, payload);
    return response.data;
  },

  /** POST /settings/users/:id/terminate */
  terminateUser: async (id: string, payload: TerminateUserPayload) => {
    const response = await api.post<User>(`${ENDPOINT}/${id}/terminate`, payload);
    return response.data;
  },

  /** POST /settings/users/:id/reinstate */
  reinstateUser: async (id: string) => {
    const response = await api.post<User>(`${ENDPOINT}/${id}/reinstate`);
    return response.data;
  },

  /** POST /settings/users/:id/reset-password */
  resetPassword: async (id: string, payload?: ResetPasswordPayload) => {
    const response = await api.post<{ password: string }>(
      `${ENDPOINT}/${id}/reset-password`,
      payload
    );
    return response.data;
  },

  /** POST /settings/users/:id/unlock */
  unlockUser: async (id: string) => {
    const response = await api.post<User>(`${ENDPOINT}/${id}/unlock`);
    return response.data;
  },

  // ─── Roles & Permissions ──────────────────────────────────────────────────────

  /** GET /settings/roles */
  getRoles: async () => {
    const response = await api.get<{ role: string; permissions: string[]; userCount: number }[]>(
      '/settings/roles'
    );
    return response.data;
  },

  // ─── Departments ──────────────────────────────────────────────────────────────

  /** GET /settings/departments */
  getDepartments: async () => {
    const response = await api.get<{ id: string; name: string; code: string; manager?: string }[]>(
      '/settings/departments'
    );
    return response.data;
  },

  // ─── Export ───────────────────────────────────────────────────────────────────

  /** GET /settings/users/export — XLSX blob */
  exportUsers: async (params?: GetUsersParams) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') query.set(k, String(v));
      });
    }
    const response = await api.get<Blob>(`${ENDPOINT}/export?${query}`, { responseType: 'blob' });
    return response.data;
  },
};
