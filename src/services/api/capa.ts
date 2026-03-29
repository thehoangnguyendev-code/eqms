/**
 * CAPA (Corrective and Preventive Action) API Service
 * EU-GMP / ICH Q10 compliant CAPA management
 *
 * Endpoint base: /api/capa
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * === DANH SÁCH & CRUD =========================================================
 * GET    /capa                             - Danh sách CAPAs (filter + phân trang)
 *        Params: page, limit, search, typeFilter, sourceFilter, statusFilter,
 *                dateFrom, dateTo, department, assignedTo
 * GET    /capa/:id                         - Chi tiết 1 CAPA
 * POST   /capa                             - Tạo CAPA mới
 *        Body: { title, description, type, source, department, problemStatement,
 *                assignedTo, targetCompletionDate, relatedDeviationId?,
 *                relatedAuditId?, relatedComplaintId? }
 * PUT    /capa/:id                         - Cập nhật CAPA
 * DELETE /capa/:id                         - Xóa CAPA (chỉ khi Draft)
 *
 * === METADATA & FILTERS =======================================================
 * GET    /capa/filters                     - Lấy dữ liệu cho các dropdown bộ lọc
 *        Returns: {
 *          types: [{label, value}],
 *          sources: [{label, value}],
 *          statuses: [{label, value}],
 *          departments: [{label, value}]
 *        }
 *
 * === WORKFLOW =================================================================
 * POST   /capa/:id/submit-investigation    - Bắt đầu điều tra (Open → Under Investigation)
 * POST   /capa/:id/submit-action-plan      - Nộp kế hoạch hành động (→ Action Plan Pending)
 *        Body: { correctiveAction, preventiveAction, rootCause }
 * POST   /capa/:id/start-implementation   - Bắt đầu thực hiện (→ Implementation)
 * POST   /capa/:id/submit-verification    - Nộp kết quả xác nhận (→ Verification)
 *        Body: { verificationResult }
 * POST   /capa/:id/effectiveness-check    - Đánh giá hiệu quả (→ Effectiveness Check / Closed)
 *        Body: { result: 'Effective' | 'Not Effective', comment }
 * POST   /capa/:id/approve                - Phê duyệt với e-signature
 *        Body: { username, password, comment? }
 * POST   /capa/:id/reject                 - Từ chối
 *        Body: { reason }
 * POST   /capa/:id/cancel                 - Hủy CAPA
 *        Body: { reason }
 * POST   /capa/:id/reopen                 - Mở lại CAPA đã đóng
 *        Body: { reason }
 * PATCH  /capa/:id/status                 - Cập nhật trạng thái trực tiếp (admin)
 *        Body: { status }
 *
 * === LIÊN KẾT =================================================================
 * POST   /capa/:id/link-deviation          - Liên kết với deviation
 *        Body: { deviationId }
 * POST   /capa/:id/link-audit              - Liên kết với audit finding
 *        Body: { auditId }
 * POST   /capa/:id/link-complaint          - Liên kết với complaint
 *        Body: { complaintId }
 * GET    /capa/:id/linked-records          - Tất cả records liên kết (deviation/audit/complaint)
 *
 * === COMMENT & ATTACHMENT =====================================================
 * GET    /capa/:id/comments                - Danh sách comment
 * POST   /capa/:id/comments                - Thêm comment
 *        Body: { comment }
 * POST   /capa/:id/attachments             - Upload file đính kèm
 *        Body: FormData { file }
 * GET    /capa/:id/attachments             - Danh sách file đính kèm
 * DELETE /capa/:id/attachments/:fileId     - Xóa file đính kèm
 *
 * === AUDIT & SIGNATURE ========================================================
 * GET    /capa/:id/audit-trail             - Lịch sử thay đổi
 * GET    /capa/:id/signatures              - Danh sách e-signatures
 *
 * NOTE ON SHARED SERVICES:
 * For Comments, Attachments, E-Signatures (Approve/Reject), and detailed History,
 * it is recommended to use the Shared API:
 * - sharedApi.getComments('capa', id)
 * - sharedApi.uploadAttachment('capa', id, file)
 * - sharedApi.sign('capa', id, { ... })
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * === EXPORT ===================================================================
 * GET    /capa/export                      - Export danh sách (XLSX blob)
 *        Params: typeFilter, sourceFilter, statusFilter, dateFrom, dateTo
 * GET    /capa/:id/export/pdf              - Export 1 CAPA thành PDF
 *
 * === STATS ====================================================================
 * GET    /capa/stats                       - Thống kê tổng quan
 *        Returns: { total, inProgress, dueThisMonth, closed,
 *                   corrective, preventive, effectiveRate }
 */

import { api } from './client';
import type { CAPA, CAPAFilters } from '@/features/capa/types';
import type { PaginatedResponse } from '@/types';

const ENDPOINT = '/capa';

export interface GetCapaParams extends Partial<CAPAFilters> {
  page?: number;
  limit?: number;
  department?: string;
  assignedTo?: string;
}

export const capaApi = {
  /** GET /capa — paginated list with filters */
  getCAPAs: async (params?: GetCapaParams) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '' && v !== 'All') query.set(k, String(v));
      });
    }
    const response = await api.get<PaginatedResponse<CAPA>>(`${ENDPOINT}?${query}`);
    return response.data;
  },

  /** GET /capa/:id */
  getCAPAById: async (id: string) => {
    const response = await api.get<CAPA>(`${ENDPOINT}/${id}`);
    return response.data;
  },

  /** POST /capa */
  createCAPA: async (data: Partial<CAPA>) => {
    const response = await api.post<CAPA>(ENDPOINT, data);
    return response.data;
  },

  /** PUT /capa/:id */
  updateCAPA: async (id: string, data: Partial<CAPA>) => {
    const response = await api.put<CAPA>(`${ENDPOINT}/${id}`, data);
    return response.data;
  },

  /** DELETE /capa/:id */
  deleteCAPA: async (id: string) => {
    const response = await api.delete(`${ENDPOINT}/${id}`);
    return response.data;
  },

  // ─── Workflow ─────────────────────────────────────────────────────────────────

  /** POST /capa/:id/submit-action-plan */
  submitActionPlan: async (
    id: string,
    data: { correctiveAction: string; preventiveAction?: string; rootCause?: string }
  ) => {
    const response = await api.post<CAPA>(`${ENDPOINT}/${id}/submit-action-plan`, data);
    return response.data;
  },

  /** POST /capa/:id/start-implementation */
  startImplementation: async (id: string) => {
    const response = await api.post<CAPA>(`${ENDPOINT}/${id}/start-implementation`);
    return response.data;
  },

  /** POST /capa/:id/submit-verification */
  submitVerification: async (id: string, data: { verificationResult: string }) => {
    const response = await api.post<CAPA>(`${ENDPOINT}/${id}/submit-verification`, data);
    return response.data;
  },

  /** POST /capa/:id/effectiveness-check */
  effectivenessCheck: async (
    id: string,
    data: { result: 'Effective' | 'Not Effective'; comment: string }
  ) => {
    const response = await api.post<CAPA>(`${ENDPOINT}/${id}/effectiveness-check`, data);
    return response.data;
  },

  /** POST /capa/:id/approve — e-signature */
  approve: async (
    id: string,
    signature: { username: string; password: string; comment?: string }
  ) => {
    const response = await api.post<CAPA>(`${ENDPOINT}/${id}/approve`, signature);
    return response.data;
  },

  /** POST /capa/:id/reject */
  reject: async (id: string, reason: string) => {
    const response = await api.post<CAPA>(`${ENDPOINT}/${id}/reject`, { reason });
    return response.data;
  },

  /** POST /capa/:id/cancel */
  cancel: async (id: string, reason: string) => {
    const response = await api.post<CAPA>(`${ENDPOINT}/${id}/cancel`, { reason });
    return response.data;
  },

  /** PATCH /capa/:id/status */
  updateStatus: async (id: string, status: CAPA['status']) => {
    const response = await api.patch<CAPA>(`${ENDPOINT}/${id}/status`, { status });
    return response.data;
  },

  // ─── Liên kết ─────────────────────────────────────────────────────────────────

  /** POST /capa/:id/link-deviation */
  linkDeviation: async (id: string, deviationId: string) => {
    const response = await api.post<CAPA>(`${ENDPOINT}/${id}/link-deviation`, { deviationId });
    return response.data;
  },

  /** POST /capa/:id/link-complaint */
  linkComplaint: async (id: string, complaintId: string) => {
    const response = await api.post<CAPA>(`${ENDPOINT}/${id}/link-complaint`, { complaintId });
    return response.data;
  },

  // ─── Comment & Attachment ──────────────────────────────────────────────────────

  /** POST /capa/:id/comments */
  addComment: async (id: string, comment: string) => {
    const response = await api.post(`${ENDPOINT}/${id}/comments`, { comment });
    return response.data;
  },

  /** GET /capa/:id/comments */
  getComments: async (id: string) => {
    const response = await api.get(`${ENDPOINT}/${id}/comments`);
    return response.data;
  },

  /** POST /capa/:id/attachments */
  uploadAttachment: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`${ENDPOINT}/${id}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // ─── Audit & Signature ────────────────────────────────────────────────────────

  /** GET /capa/:id/audit-trail */
  getAuditTrail: async (id: string) => {
    const response = await api.get(`${ENDPOINT}/${id}/audit-trail`);
    return response.data;
  },

  // ─── Export ───────────────────────────────────────────────────────────────────

  /** GET /capa/export — XLSX blob */
  exportCAPAs: async (params?: GetCapaParams) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '' && v !== 'All') query.set(k, String(v));
      });
    }
    const response = await api.get<Blob>(`${ENDPOINT}/export?${query}`, { responseType: 'blob' });
    return response.data;
  },

  /** GET /capa/:id/export/pdf */
  exportSinglePDF: async (id: string) => {
    const response = await api.get<Blob>(`${ENDPOINT}/${id}/export/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // ─── Stats ────────────────────────────────────────────────────────────────────

  /** GET /capa/stats */
  getStats: async () => {
    const response = await api.get<{
      total: number;
      inProgress: number;
      dueThisMonth: number;
      closed: number;
      corrective: number;
      preventive: number;
      effectiveRate: number;
    }>(`${ENDPOINT}/stats`);
    return response.data;
  },
};
