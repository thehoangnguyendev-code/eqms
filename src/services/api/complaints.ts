/**
 * Complaints Management API Service
 * EU-GMP Chapter 8 / PQC compliant complaint handling
 *
 * Endpoint base: /api/complaints
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * === DANH SÁCH & CRUD =========================================================
 * GET    /complaints                       - Danh sách complaints (filter + phân trang)
 *        Params: page, limit, search, typeFilter, priorityFilter, statusFilter,
 *                sourceFilter, dateFrom, dateTo, assignedTo
 * GET    /complaints/:id                   - Chi tiết 1 complaint
 * POST   /complaints                       - Tạo complaint mới
 *        Body: { title, description, type, priority, source, reportedBy,
 *                affectedProduct?, affectedBatch?, country?,
 *                assignedTo, responseDeadline }
 * PUT    /complaints/:id                   - Cập nhật complaint
 * DELETE /complaints/:id                   - Xóa complaint (chỉ khi Open)
 *
 * === METADATA & FILTERS =======================================================
 * GET    /complaints/filters               - Lấy dữ liệu cho các dropdown bộ lọc
 *        Returns: {
 *          types: [{label, value}],
 *          priorities: [{label, value}],
 *          statuses: [{label, value}],
 *          productFamilies: [{label, value}]
 *        }
 *
 * === WORKFLOW =================================================================
 * POST   /complaints/:id/investigate       - Bắt đầu điều tra (Received → Under Investigation)
 *        Body: { assignedTo, findings? }
 * POST   /complaints/:id/submit-review     - Nộp vào Review (→ Pending Review)
 *        Body: { investigationFindings, rootCause }
 * POST   /complaints/:id/identify-root-cause - Xác định nguyên nhân gốc rễ (→ Root Cause Identified)
 *        Body: { rootCause }
 * POST   /complaints/:id/initiate-capa     - Tạo CAPA từ complaint (→ CAPA Initiated)
 *        Body: { capaTitle, description }
 *        Returns: { capaId }
 * POST   /complaints/:id/close             - Đóng complaint
 *        Body: { rootCause, resolution, closedBy }
 * POST   /complaints/:id/reject            - Từ chối complaint
 *        Body: { reason }
 * POST   /complaints/:id/reopen            - Mở lại complaint
 *        Body: { reason }
 * POST   /complaints/:id/escalate          - Escalate lên cấp cao hơn
 *        Body: { escalatedTo, reason }
 *
 * === LIÊN KẾT =================================================================
 * GET    /complaints/:id/linked-capa       - CAPA được tạo từ complaint này
 * POST   /complaints/:id/link-capa         - Liên kết với CAPA có sẵn
 *        Body: { capaId }
 *
 * === REGULATORY NOTIFICATION ==================================================
 * POST   /complaints/:id/notify-authority  - Gửi thông báo cho cơ quan quản lý
 *        Body: { authority, notificationDate, rationale }
 *
 * === COMMENT & ATTACHMENT =====================================================
 * GET    /complaints/:id/comments          - Danh sách comment
 * POST   /complaints/:id/comments          - Thêm comment
 *        Body: { comment }
 * POST   /complaints/:id/attachments       - Upload file đính kèm
 *        Body: FormData { file }
 * GET    /complaints/:id/attachments       - Danh sách file đính kèm
 * DELETE /complaints/:id/attachments/:fileId - Xóa file đính kèm
 *
 * === AUDIT & SIGNATURE ========================================================
 * GET    /complaints/:id/audit-trail       - Lịch sử thay đổi
 * GET    /complaints/:id/signatures        - Danh sách e-signatures
 *
 * === EXPORT ===================================================================
 * GET    /complaints/export                - Export danh sách (XLSX blob)
 *        Params: typeFilter, priorityFilter, statusFilter, sourceFilter, dateFrom, dateTo
 * GET    /complaints/:id/export/pdf        - Export 1 complaint thành PDF
 *
 * === STATS ====================================================================
 * GET    /complaints/stats                 - Thống kê tổng quan
 *        Returns: { total, received, underInvestigation, critical,
 *                   high, pendingResponse, closed }
 */

import { api } from './client';
import type { Complaint, ComplaintFilters } from '@/features/complaints/types';
import type { PaginatedResponse } from '@/types';

const ENDPOINT = '/complaints';

export interface GetComplaintsParams extends Partial<ComplaintFilters> {
  page?: number;
  limit?: number;
  assignedTo?: string;
}

export const complaintApi = {
  /** GET /complaints — paginated list with filters */
  getComplaints: async (params?: GetComplaintsParams) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '' && v !== 'All') query.set(k, String(v));
      });
    }
    const response = await api.get<PaginatedResponse<Complaint>>(`${ENDPOINT}?${query}`);
    return response.data;
  },

  /** GET /complaints/:id */
  getComplaintById: async (id: string) => {
    const response = await api.get<Complaint>(`${ENDPOINT}/${id}`);
    return response.data;
  },

  /** POST /complaints */
  createComplaint: async (data: Partial<Complaint>) => {
    const response = await api.post<Complaint>(ENDPOINT, data);
    return response.data;
  },

  /** PUT /complaints/:id */
  updateComplaint: async (id: string, data: Partial<Complaint>) => {
    const response = await api.put<Complaint>(`${ENDPOINT}/${id}`, data);
    return response.data;
  },

  /** DELETE /complaints/:id */
  deleteComplaint: async (id: string) => {
    const response = await api.delete(`${ENDPOINT}/${id}`);
    return response.data;
  },

  // ─── Workflow ─────────────────────────────────────────────────────────────────

  /** POST /complaints/:id/investigate */
  investigate: async (id: string, data: { assignedTo: string; findings?: string }) => {
    const response = await api.post<Complaint>(`${ENDPOINT}/${id}/investigate`, data);
    return response.data;
  },

  /** POST /complaints/:id/identify-root-cause */
  identifyRootCause: async (id: string, data: { rootCause: string }) => {
    const response = await api.post<Complaint>(`${ENDPOINT}/${id}/identify-root-cause`, data);
    return response.data;
  },

  /** POST /complaints/:id/initiate-capa */
  initiateCAPA: async (id: string, data: { capaTitle: string; description: string }) => {
    const response = await api.post<{ capaId: string }>(`${ENDPOINT}/${id}/initiate-capa`, data);
    return response.data;
  },

  /** POST /complaints/:id/close */
  close: async (id: string, data: { rootCause: string; resolution: string }) => {
    const response = await api.post<Complaint>(`${ENDPOINT}/${id}/close`, data);
    return response.data;
  },

  /** POST /complaints/:id/reject */
  reject: async (id: string, reason: string) => {
    const response = await api.post<Complaint>(`${ENDPOINT}/${id}/reject`, { reason });
    return response.data;
  },

  /** POST /complaints/:id/escalate */
  escalate: async (id: string, data: { escalatedTo: string; reason: string }) => {
    const response = await api.post<Complaint>(`${ENDPOINT}/${id}/escalate`, data);
    return response.data;
  },

  /** POST /complaints/:id/notify-authority */
  notifyAuthority: async (
    id: string,
    data: { authority: string; notificationDate: string; rationale: string }
  ) => {
    const response = await api.post(`${ENDPOINT}/${id}/notify-authority`, data);
    return response.data;
  },

  // ─── Comment & Attachment ──────────────────────────────────────────────────────

  /** POST /complaints/:id/comments */
  addComment: async (id: string, comment: string) => {
    const response = await api.post(`${ENDPOINT}/${id}/comments`, { comment });
    return response.data;
  },

  /** POST /complaints/:id/attachments */
  uploadAttachment: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`${ENDPOINT}/${id}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // ─── Export ───────────────────────────────────────────────────────────────────

  /** GET /complaints/export — XLSX blob */
  exportComplaints: async (params?: GetComplaintsParams) => {
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

  /** GET /complaints/stats */
  getStats: async () => {
    const response = await api.get<{
      total: number;
      received: number;
      underInvestigation: number;
      critical: number;
      high: number;
      pendingResponse: number;
      closed: number;
    }>(`${ENDPOINT}/stats`);
    return response.data;
  },
};
