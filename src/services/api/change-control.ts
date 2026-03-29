/**
 * Change Control API Service
 * EU-GMP Chapter 13 compliant change management
 *
 * Endpoint base: /api/change-control
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * === DANH SÁCH & CRUD =========================================================
 * GET    /change-control                   - Danh sách change controls (filter + phân trang)
 *        Params: page, limit, search, typeFilter, impactFilter, statusFilter,
 *                dateFrom, dateTo, department, assignedTo
 * GET    /change-control/:id               - Chi tiết 1 change control
 * POST   /change-control                   - Tạo change mới
 *        Body: { title, description, type, impact, department, reason,
 *                proposedChange, affectedSystems?, assignedTo, targetDate }
 * PUT    /change-control/:id               - Cập nhật Change Control
 * DELETE /change-control/:id               - Xóa record (chỉ khi Draft)
 *
 * === METADATA & FILTERS =======================================================
 * GET    /change-control/filters           - Lấy dữ liệu cho các dropdown bộ lọc
 *        Returns: {
 *          types: [{label, value}],
 *          priorities: [{label, value}],
 *          statuses: [{label, value}],
 *          impactLevels: [{label, value}]
 *        }
 *
 * === WORKFLOW =================================================================
 * POST   /change-control/:id/submit        - Nộp để đánh giá tác động (Draft → Submitted)
 * POST   /change-control/:id/impact-assess - Hoàn thành Impact Assessment (→ Pending Approval)
 *        Body: { riskAssessment, regulatoryImpact, affectedSystems }
 * POST   /change-control/:id/approve       - Phê duyệt với e-signature (→ Approved)
 *        Body: { username, password, comment? }
 * POST   /change-control/:id/reject        - Từ chối
 *        Body: { reason }
 * POST   /change-control/:id/implement     - Bắt đầu thực hiện (Approved → Implementation)
 *        Body: { implementationNote, plannedDate }
 * POST   /change-control/:id/verify        - Xác nhận thực hiện (Implementation → Verification)
 *        Body: { verificationResult, verifiedBy }
 * POST   /change-control/:id/close         - Đóng change control (Verification → Closed)
 *        Body: { actualCompletionDate, closureNote }
 * POST   /change-control/:id/cancel        - Hủy
 *        Body: { reason }
 * POST   /change-control/:id/reopen        - Mở lại
 *        Body: { reason }
 *
 * === REGULATORY IMPACT ========================================================
 * POST   /change-control/:id/regulatory-notification - Thông báo cho cơ quan quản lý
 *        Body: { authority, notificationType, submissionDate }
 *
 * === COMMENT & ATTACHMENT =====================================================
 * GET    /change-control/:id/comments      - Danh sách comment
 * POST   /change-control/:id/comments      - Thêm comment
 *        Body: { comment }
 * POST   /change-control/:id/attachments   - Upload file đính kèm
 *        Body: FormData { file }
 * GET    /change-control/:id/attachments   - Danh sách file đính kèm
 *
 * === AUDIT & SIGNATURE ========================================================
 * GET    /change-control/:id/audit-trail   - Lịch sử thay đổi
 * GET    /change-control/:id/signatures    - Danh sách e-signatures
 *
 * === EXPORT ===================================================================
 * GET    /change-control/export            - Export danh sách (XLSX blob)
 * GET    /change-control/:id/export/pdf    - Export 1 change control thành PDF
 *
 * === STATS ====================================================================
 * GET    /change-control/stats             - Thống kê tổng quan
 *        Returns: { total, draft, inProgress, pendingApproval, approved,
 *                   highImpact, closed }
 */

import { api } from './client';
import type { ChangeControl, ChangeControlFilters } from '@/features/change-control/types';
import type { PaginatedResponse } from '@/types';

const ENDPOINT = '/change-control';

export interface GetChangeControlParams extends Partial<ChangeControlFilters> {
  page?: number;
  limit?: number;
  department?: string;
  assignedTo?: string;
}

export const changeControlApi = {
  /** GET /change-control */
  getChanges: async (params?: GetChangeControlParams) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '' && v !== 'All') query.set(k, String(v));
      });
    }
    const response = await api.get<PaginatedResponse<ChangeControl>>(`${ENDPOINT}?${query}`);
    return response.data;
  },

  /** GET /change-control/:id */
  getChangeById: async (id: string) => {
    const response = await api.get<ChangeControl>(`${ENDPOINT}/${id}`);
    return response.data;
  },

  /** POST /change-control */
  createChange: async (data: Partial<ChangeControl>) => {
    const response = await api.post<ChangeControl>(ENDPOINT, data);
    return response.data;
  },

  /** PUT /change-control/:id */
  updateChange: async (id: string, data: Partial<ChangeControl>) => {
    const response = await api.put<ChangeControl>(`${ENDPOINT}/${id}`, data);
    return response.data;
  },

  /** DELETE /change-control/:id */
  deleteChange: async (id: string) => {
    const response = await api.delete(`${ENDPOINT}/${id}`);
    return response.data;
  },

  // ─── Workflow ─────────────────────────────────────────────────────────────────

  /** POST /change-control/:id/submit */
  submit: async (id: string) => {
    const response = await api.post<ChangeControl>(`${ENDPOINT}/${id}/submit`);
    return response.data;
  },

  /** POST /change-control/:id/impact-assess */
  completeImpactAssessment: async (
    id: string,
    data: { riskAssessment: string; regulatoryImpact?: string; affectedSystems?: string[] }
  ) => {
    const response = await api.post<ChangeControl>(`${ENDPOINT}/${id}/impact-assess`, data);
    return response.data;
  },

  /** POST /change-control/:id/approve — e-signature */
  approve: async (
    id: string,
    signature: { username: string; password: string; comment?: string }
  ) => {
    const response = await api.post<ChangeControl>(`${ENDPOINT}/${id}/approve`, signature);
    return response.data;
  },

  /** POST /change-control/:id/reject */
  reject: async (id: string, reason: string) => {
    const response = await api.post<ChangeControl>(`${ENDPOINT}/${id}/reject`, { reason });
    return response.data;
  },

  /** POST /change-control/:id/implement */
  implement: async (id: string, data: { implementationNote: string; plannedDate?: string }) => {
    const response = await api.post<ChangeControl>(`${ENDPOINT}/${id}/implement`, data);
    return response.data;
  },

  /** POST /change-control/:id/verify */
  verify: async (id: string, data: { verificationResult: string; verifiedBy: string }) => {
    const response = await api.post<ChangeControl>(`${ENDPOINT}/${id}/verify`, data);
    return response.data;
  },

  /** POST /change-control/:id/close */
  close: async (
    id: string,
    data: { actualCompletionDate: string; closureNote?: string }
  ) => {
    const response = await api.post<ChangeControl>(`${ENDPOINT}/${id}/close`, data);
    return response.data;
  },

  /** POST /change-control/:id/cancel */
  cancel: async (id: string, reason: string) => {
    const response = await api.post<ChangeControl>(`${ENDPOINT}/${id}/cancel`, { reason });
    return response.data;
  },

  // ─── Comment & Attachment ──────────────────────────────────────────────────────

  /** POST /change-control/:id/comments */
  addComment: async (id: string, comment: string) => {
    const response = await api.post(`${ENDPOINT}/${id}/comments`, { comment });
    return response.data;
  },

  /** POST /change-control/:id/attachments */
  uploadAttachment: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`${ENDPOINT}/${id}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // ─── Export ───────────────────────────────────────────────────────────────────

  /** GET /change-control/export — XLSX blob */
  exportChanges: async (params?: GetChangeControlParams) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '' && v !== 'All') query.set(k, String(v));
      });
    }
    const response = await api.get<Blob>(`${ENDPOINT}/export?${query}`, { responseType: 'blob' });
    return response.data;
  },

  // ─── Stats ────────────────────────────────────────────────────────────────────

  /** GET /change-control/stats */
  getStats: async () => {
    const response = await api.get<{
      total: number;
      draft: number;
      inProgress: number;
      pendingApproval: number;
      approved: number;
      highImpact: number;
      closed: number;
    }>(`${ENDPOINT}/stats`);
    return response.data;
  },
};
