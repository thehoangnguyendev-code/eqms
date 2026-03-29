/**
 * Deviations & Non-Conformance API Service
 * EU-GMP Chapter 6 compliant deviation management
 *
 * Endpoint base: /api/deviations
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * === DANH SÁCH & CRUD =========================================================
 * GET    /deviations                       - Danh sách deviations (filter + phân trang)
 *        Params: page, limit, search, categoryFilter, severityFilter,
 *                statusFilter, dateFrom, dateTo, department, assignedTo
 * GET    /deviations/:id                   - Chi tiết 1 deviation
 * POST   /deviations                       - Tạo deviation mới
 *        Body: { title, description, category, severity, department, affectedProduct?,
 *                affectedBatch?, immediateAction?, assignedTo, investigationDeadline }
 * PUT    /deviations/:id                   - Cập nhật deviation
 * DELETE /deviations/:id                   - Xóa deviation (chỉ khi Open)
 *
 * === METADATA & FILTERS =======================================================
 * GET    /deviations/filters               - Lấy dữ liệu cho các dropdown bộ lọc
 *        Returns: {
 *          categories: [{label, value}],
 *          severities: [{label, value}],
 *          statuses:   [{label, value}],
 *          departments: [{label, value}],
 *          assignees:  [{label, value}]
 *        }
 *
 * === WORKFLOW =================================================================
 * POST   /deviations/:id/investigate       - Bắt đầu điều tra (Open → Under Investigation)
 *        Body: { assignedTo, deadline }
 * POST   /deviations/:id/submit-review     - Nộp vào Review (Under Investigation → Pending Review)
 *        Body: { rootCause, correctiveAction, preventiveAction? }
 * POST   /deviations/:id/submit-approval   - Nộp vào Approval (Pending Review → Pending Approval)
 *        Body: { reviewerId, comment? }
 * POST   /deviations/:id/approve           - Phê duyệt với e-signature (→ Closed)
 *        Body: { username, password, comment? }
 * POST   /deviations/:id/reject            - Từ chối (→ Under Investigation)
 *        Body: { reason }
 * POST   /deviations/:id/close             - Đóng deviation (nếu không cần approval)
 *        Body: { rootCause, correctiveAction, preventiveAction? }
 * POST   /deviations/:id/cancel            - Hủy deviation
 *        Body: { reason }
 * POST   /deviations/:id/reopen            - Mở lại deviation đã đóng
 *        Body: { reason }
 *
 * === LIÊN KẾT =================================================================
 * POST   /deviations/:id/link-capa         - Tạo CAPA từ deviation này
 *        Body: { capaTitle, description }
 *        Returns: { capaId }
 * GET    /deviations/:id/linked-capas      - Danh sách CAPAs liên kết với deviation
 *
 * === COMMENT & ATTACHMENT =====================================================
 * GET    /deviations/:id/comments          - Danh sách comment
 * POST   /deviations/:id/comments          - Thêm comment
 *        Body: { comment }
 * POST   /deviations/:id/attachments       - Upload file đính kèm
 *        Body: FormData { file }
 * GET    /deviations/:id/attachments       - Danh sách file đính kèm
 * DELETE /deviations/:id/attachments/:fileId - Xóa file đính kèm
 *
 * === AUDIT & SIGNATURE ========================================================
 * GET    /deviations/:id/audit-trail       - Lịch sử thay đổi của deviation
 * GET    /deviations/:id/signatures        - Danh sách e-signatures
 *
 * NOTE ON SHARED SERVICES:
 * For Comments, Attachments, E-Signatures (Approve/Reject), and detailed History,
 * it is recommended to use the Shared API:
 * - sharedApi.getComments('deviations', id)
 * - sharedApi.uploadAttachment('deviations', id, file)
 * - sharedApi.sign('deviations', id, { ... })
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * === EXPORT ===================================================================
 * GET    /deviations/export                - Export danh sách (XLSX blob)
 *        Params: categoryFilter, severityFilter, statusFilter, dateFrom, dateTo
 * GET    /deviations/:id/export/pdf        - Export 1 deviation thành PDF
 *
 * === STATS ====================================================================
 * GET    /deviations/stats                 - Thống kê tổng quan
 *        Returns: { total, open, underInvestigation, critical, major, minor, closed }
 */

import { api } from './client';
import type { Deviation, DeviationFilters } from '@/features/deviations/types';
import type { PaginatedResponse } from '@/types';

const ENDPOINT = '/deviations';

export interface GetDeviationsParams extends Partial<DeviationFilters> {
  page?: number;
  limit?: number;
  department?: string;
  assignedTo?: string;
}

export const deviationApi = {
  /** GET /deviations — paginated list with filters */
  getDeviations: async (params?: GetDeviationsParams) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '' && v !== 'All') query.set(k, String(v));
      });
    }
    const response = await api.get<PaginatedResponse<Deviation>>(`${ENDPOINT}?${query}`);
    return response.data;
  },

  /** GET /deviations/:id */
  getDeviationById: async (id: string) => {
    const response = await api.get<Deviation>(`${ENDPOINT}/${id}`);
    return response.data;
  },

  /** POST /deviations */
  createDeviation: async (data: Partial<Deviation>) => {
    const response = await api.post<Deviation>(ENDPOINT, data);
    return response.data;
  },

  /** PUT /deviations/:id */
  updateDeviation: async (id: string, data: Partial<Deviation>) => {
    const response = await api.put<Deviation>(`${ENDPOINT}/${id}`, data);
    return response.data;
  },

  /** DELETE /deviations/:id */
  deleteDeviation: async (id: string) => {
    const response = await api.delete(`${ENDPOINT}/${id}`);
    return response.data;
  },

  // ─── Workflow ────────────────────────────────────────────────────────────────

  /** POST /deviations/:id/investigate — Open → Under Investigation */
  investigate: async (id: string, data: { assignedTo: string; deadline: string }) => {
    const response = await api.post<Deviation>(`${ENDPOINT}/${id}/investigate`, data);
    return response.data;
  },

  /** POST /deviations/:id/submit-review */
  submitForReview: async (
    id: string,
    data: { rootCause: string; correctiveAction: string; preventiveAction?: string }
  ) => {
    const response = await api.post<Deviation>(`${ENDPOINT}/${id}/submit-review`, data);
    return response.data;
  },

  /** POST /deviations/:id/approve — e-signature */
  approve: async (
    id: string,
    signature: { username: string; password: string; comment?: string }
  ) => {
    const response = await api.post<Deviation>(`${ENDPOINT}/${id}/approve`, signature);
    return response.data;
  },

  /** POST /deviations/:id/reject */
  reject: async (id: string, reason: string) => {
    const response = await api.post<Deviation>(`${ENDPOINT}/${id}/reject`, { reason });
    return response.data;
  },

  /** POST /deviations/:id/close */
  close: async (
    id: string,
    data: { rootCause: string; correctiveAction: string; preventiveAction?: string }
  ) => {
    const response = await api.post<Deviation>(`${ENDPOINT}/${id}/close`, data);
    return response.data;
  },

  /** POST /deviations/:id/cancel */
  cancel: async (id: string, reason: string) => {
    const response = await api.post<Deviation>(`${ENDPOINT}/${id}/cancel`, { reason });
    return response.data;
  },

  /** POST /deviations/:id/reopen */
  reopen: async (id: string, reason: string) => {
    const response = await api.post<Deviation>(`${ENDPOINT}/${id}/reopen`, { reason });
    return response.data;
  },

  // ─── Liên kết ────────────────────────────────────────────────────────────────

  /** POST /deviations/:id/link-capa */
  linkCAPA: async (id: string, data: { capaTitle: string; description: string }) => {
    const response = await api.post<{ capaId: string }>(`${ENDPOINT}/${id}/link-capa`, data);
    return response.data;
  },

  /** GET /deviations/:id/linked-capas */
  getLinkedCAPAs: async (id: string) => {
    const response = await api.get(`${ENDPOINT}/${id}/linked-capas`);
    return response.data;
  },

  // ─── Comment & Attachment ────────────────────────────────────────────────────

  /** POST /deviations/:id/comments */
  addComment: async (id: string, comment: string) => {
    const response = await api.post(`${ENDPOINT}/${id}/comments`, { comment });
    return response.data;
  },

  /** GET /deviations/:id/comments */
  getComments: async (id: string) => {
    const response = await api.get(`${ENDPOINT}/${id}/comments`);
    return response.data;
  },

  /** POST /deviations/:id/attachments */
  uploadAttachment: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`${ENDPOINT}/${id}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /** GET /deviations/:id/attachments */
  getAttachments: async (id: string) => {
    const response = await api.get(`${ENDPOINT}/${id}/attachments`);
    return response.data;
  },

  // ─── Audit & Signature ────────────────────────────────────────────────────────

  /** GET /deviations/:id/audit-trail */
  getAuditTrail: async (id: string) => {
    const response = await api.get(`${ENDPOINT}/${id}/audit-trail`);
    return response.data;
  },

  /** GET /deviations/:id/signatures */
  getSignatures: async (id: string) => {
    const response = await api.get(`${ENDPOINT}/${id}/signatures`);
    return response.data;
  },

  // ─── Export ──────────────────────────────────────────────────────────────────

  /** GET /deviations/export — XLSX blob */
  exportDeviations: async (params?: GetDeviationsParams) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '' && v !== 'All') query.set(k, String(v));
      });
    }
    const response = await api.get<Blob>(`${ENDPOINT}/export?${query}`, { responseType: 'blob' });
    return response.data;
  },

  /** GET /deviations/:id/export/pdf */
  exportSinglePDF: async (id: string) => {
    const response = await api.get<Blob>(`${ENDPOINT}/${id}/export/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // ─── Stats ────────────────────────────────────────────────────────────────────

  /** GET /deviations/stats */
  getStats: async () => {
    const response = await api.get<{
      total: number;
      open: number;
      underInvestigation: number;
      pendingReview: number;
      pendingApproval: number;
      critical: number;
      major: number;
      minor: number;
      closed: number;
    }>(`${ENDPOINT}/stats`);
    return response.data;
  },
};
