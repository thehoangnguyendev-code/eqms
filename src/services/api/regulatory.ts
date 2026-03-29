/**
 * Regulatory Submissions API Service
 * EU-GMP / EMA / CTD / eCTD compliant regulatory submission tracking
 *
 * Endpoint base: /api/regulatory
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * === DANH SÁCH & CRUD =========================================================
 * GET    /regulatory                       - Danh sách submissions (filter + phân trang)
 *        Params: page, limit, search, typeFilter, authorityFilter, statusFilter,
 *                dateFrom, dateTo, assignedTo, product
 * GET    /regulatory/:id                   - Chi tiết 1 submission
 * POST   /regulatory                       - Tạo submission mới
 *        Body: { title, description, type, authority, relatedProduct?,
 *                targetDate, assignedTo, department, dossierVersion?,
 *                ctdModule? }
 * PUT    /regulatory/:id                   - Cập nhật hồ sơ
 * DELETE /regulatory/:id                   - Xóa hồ sơ (chỉ khi Draft)
 *
 * === METADATA & FILTERS =======================================================
 * GET    /regulatory/filters               - Lấy dữ liệu cho các dropdown bộ lọc
 *        Returns: {
 *          submissionTypes: [{label, value}],
 *          authorities: [{label, value}],
 *          statuses: [{label, value}],
 *          countries: [{label, value}]
 *        }
 *
 * === WORKFLOW =================================================================
 * POST   /regulatory/:id/submit            - Nộp hồ sơ lên cơ quan quản lý (Draft → Submitted)
 *        Body: { submissionDate, referenceNumber?, submissionMethod: 'eCTD'|'Paper'|'Portal' }
 * POST   /regulatory/:id/start-review      - Cơ quan bắt đầu review (→ Under Review)
 *        Body: { reviewStartDate, reviewerAssigned? }
 * POST   /regulatory/:id/receive-questions - Nhận câu hỏi từ cơ quan (→ Questions Received)
 *        Body: { questionsReceivedDate, deadline, questions: string[] }
 * POST   /regulatory/:id/submit-response   - Nộp trả lời (Questions Received → Response Submitted)
 *        Body: { responseDate, responseDocument? }
 * POST   /regulatory/:id/approve           - Ghi nhận phê duyệt (→ Approved)
 *        Body: { approvalDate, approvalNumber, expiryDate?, conditions? }
 * POST   /regulatory/:id/refuse            - Ghi nhận từ chối (→ Refused)
 *        Body: { refusalDate, refusalReason }
 * POST   /regulatory/:id/withdraw          - Rút hồ sơ (→ Withdrawn)
 *        Body: { withdrawalDate, reason }
 *
 * === LIFECYCLE RENEWAL ========================================================
 * POST   /regulatory/:id/initiate-renewal  - Khởi tạo renewal từ submission hết hạn
 *        Body: { renewalDueDate }
 *        Returns: { newSubmissionId }
 *
 * === DOSSIER & DOCUMENTS ======================================================
 * POST   /regulatory/:id/dossier/upload    - Upload file hồ sơ (CTD module, PSUR, v.v.)
 *        Body: FormData { file, moduleNumber?, documentType, version }
 * GET    /regulatory/:id/dossier           - Danh sách file hồ sơ
 * DELETE /regulatory/:id/dossier/:fileId   - Xóa file hồ sơ
 * POST   /regulatory/:id/dossier/version   - Cập nhật phiên bản dossier
 *        Body: { version, changeDescription }
 *
 * === COMMENT & ATTACHMENT =====================================================
 * GET    /regulatory/:id/comments          - Timeline trao đổi với cơ quan
 * POST   /regulatory/:id/comments          - Thêm ghi chú nội bộ
 *        Body: { comment, isInternal: boolean }
 *
 * === AUDIT & SIGNATURE ========================================================
 * GET    /regulatory/:id/audit-trail       - Lịch sử thay đổi
 *
 * === EXPORT ===================================================================
 * GET    /regulatory/export                - Export danh sách (XLSX blob)
 *        Params: typeFilter, authorityFilter, statusFilter, dateFrom, dateTo
 * GET    /regulatory/:id/export/pdf        - Export 1 submission thành PDF
 *
 * === STATS ====================================================================
 * GET    /regulatory/stats                 - Thống kê tổng quan
 *        Returns: { total, draft, submitted, underReview, questionsReceived,
 *                   approved, refused, upcomingDeadlines, renewalDue }
 */

import { api } from './client';
import type { RegulatorySubmission, RegulatoryFilters } from '@/features/regulatory/types';
import type { PaginatedResponse } from '@/types';

const ENDPOINT = '/regulatory';

export interface GetRegulatoryParams extends Partial<RegulatoryFilters> {
  page?: number;
  limit?: number;
  assignedTo?: string;
  product?: string;
}

export const regulatoryApi = {
  /** GET /regulatory */
  getSubmissions: async (params?: GetRegulatoryParams) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '' && v !== 'All') query.set(k, String(v));
      });
    }
    const response = await api.get<PaginatedResponse<RegulatorySubmission>>(`${ENDPOINT}?${query}`);
    return response.data;
  },

  /** GET /regulatory/:id */
  getSubmissionById: async (id: string) => {
    const response = await api.get<RegulatorySubmission>(`${ENDPOINT}/${id}`);
    return response.data;
  },

  /** POST /regulatory */
  createSubmission: async (data: Partial<RegulatorySubmission>) => {
    const response = await api.post<RegulatorySubmission>(ENDPOINT, data);
    return response.data;
  },

  /** PUT /regulatory/:id */
  updateSubmission: async (id: string, data: Partial<RegulatorySubmission>) => {
    const response = await api.put<RegulatorySubmission>(`${ENDPOINT}/${id}`, data);
    return response.data;
  },

  /** DELETE /regulatory/:id */
  deleteSubmission: async (id: string) => {
    const response = await api.delete(`${ENDPOINT}/${id}`);
    return response.data;
  },

  // ─── Workflow ─────────────────────────────────────────────────────────────────

  /** POST /regulatory/:id/submit */
  submit: async (
    id: string,
    data: { submissionDate: string; referenceNumber?: string; submissionMethod?: string }
  ) => {
    const response = await api.post<RegulatorySubmission>(`${ENDPOINT}/${id}/submit`, data);
    return response.data;
  },

  /** POST /regulatory/:id/receive-questions */
  receiveQuestions: async (
    id: string,
    data: { questionsReceivedDate: string; deadline: string; questions?: string[] }
  ) => {
    const response = await api.post<RegulatorySubmission>(
      `${ENDPOINT}/${id}/receive-questions`,
      data
    );
    return response.data;
  },

  /** POST /regulatory/:id/submit-response */
  submitResponse: async (id: string, data: { responseDate: string; responseDocument?: string }) => {
    const response = await api.post<RegulatorySubmission>(
      `${ENDPOINT}/${id}/submit-response`,
      data
    );
    return response.data;
  },

  /** POST /regulatory/:id/approve */
  recordApproval: async (
    id: string,
    data: { approvalDate: string; approvalNumber?: string; expiryDate?: string; conditions?: string }
  ) => {
    const response = await api.post<RegulatorySubmission>(`${ENDPOINT}/${id}/approve`, data);
    return response.data;
  },

  /** POST /regulatory/:id/refuse */
  refuse: async (id: string, data: { refusalDate: string; refusalReason: string }) => {
    const response = await api.post<RegulatorySubmission>(`${ENDPOINT}/${id}/refuse`, data);
    return response.data;
  },

  /** POST /regulatory/:id/withdraw */
  withdraw: async (id: string, data: { withdrawalDate: string; reason: string }) => {
    const response = await api.post<RegulatorySubmission>(`${ENDPOINT}/${id}/withdraw`, data);
    return response.data;
  },

  // ─── Dossier ──────────────────────────────────────────────────────────────────

  /** POST /regulatory/:id/dossier/upload */
  uploadDossierFile: async (
    id: string,
    file: File,
    meta: { documentType: string; version?: string; moduleNumber?: string }
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    Object.entries(meta).forEach(([k, v]) => { if (v) formData.append(k, v); });
    const response = await api.post(`${ENDPOINT}/${id}/dossier/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // ─── Export ───────────────────────────────────────────────────────────────────

  /** GET /regulatory/export — XLSX blob */
  exportSubmissions: async (params?: GetRegulatoryParams) => {
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

  /** GET /regulatory/stats */
  getStats: async () => {
    const response = await api.get<{
      total: number;
      draft: number;
      submitted: number;
      underReview: number;
      questionsReceived: number;
      approved: number;
      refused: number;
      upcomingDeadlines: number;
      renewalDue: number;
    }>(`${ENDPOINT}/stats`);
    return response.data;
  },
};
