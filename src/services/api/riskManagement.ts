/**
 * Risk Management API Service
 * ICH Q9 (Quality Risk Management) / EU-GMP Annex 20 / ISO 31000 compliant
 *
 * Endpoint base: /api/risks
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * === DANH SÁCH & CRUD =========================================================
 * GET    /risks                            - Danh sách rủi ro (filter + phân trang)
 *        Params: page, limit, search, categoryFilter, levelFilter, statusFilter,
 *                assessmentMethod, dateFrom, dateTo, department, assignedTo
 * GET    /risks/:id                        - Chi tiết 1 rủi ro
 * POST   /risks                            - Tạo rủi ro mới
 *        Body: { title, description, category, assessmentMethod, probability,
 *                severity, detectability, identifiedBy, department,
 *                assignedTo, reviewDate }
 *        Server tự tính: rpn = probability × severity × detectability
 *                         level = 'Very Low'|'Low'|'Medium'|'High'|'Very High' theo RPN
 * PUT    /risks/:id                        - Cập nhật đánh giá rủi ro
 * DELETE /risks/:id                        - Xóa rủi ro
 *
 * === METADATA & FILTERS =======================================================
 * GET    /risks/filters                    - Lấy dữ liệu cho các dropdown bộ lọc
 *        Returns: {
 *          categories: [{label, value}],
 *          riskLevels: [{label, value}],
 *          statuses: [{label, value}],
 *          departments: [{label, value}]
 *        }
 *
 * === WORKFLOW =================================================================
 * PATCH  /risks/:id/rpn                   - Cập nhật thông số RPN (P/S/D)
 *        Body: { probability, severity, detectability }
 *        Server tự tính lại: rpn, level
 * POST   /risks/:id/assess                 - Bắt đầu đánh giá (→ Under Assessment)
 *        Body: { assessorId, assessmentDate }
 * POST   /risks/:id/plan-mitigation        - Lên kế hoạch giảm thiểu (→ Mitigation Planned)
 *        Body: { mitigationPlan, targetRpn?, targetLevel? }
 * POST   /risks/:id/mitigate               - Thực hiện giảm thiểu (→ Mitigated)
 *        Body: { mitigationPlan, residualRisk: RiskLevel, mitigatedBy }
 * POST   /risks/:id/accept                 - Chấp nhận rủi ro tồn dư (→ Accepted)
 *        Body: { residualRisk, justification, acceptedBy, approvalSignature }
 * POST   /risks/:id/escalate               - Escalate lên cấp cao hơn (→ Escalated)
 *        Body: { escalatedTo, reason }
 * POST   /risks/:id/close                  - Đóng rủi ro (→ Closed)
 *        Body: { closureNote }
 * POST   /risks/:id/reopen                 - Mở lại rủi ro
 *        Body: { reason }
 * POST   /risks/:id/review                 - Periodic review (giữ nguyên status, cập nhật reviewDate)
 *        Body: { reviewNote, nextReviewDate }
 *
 * === LIÊN KẾT =================================================================
 * POST   /risks/:id/link-deviation         - Liên kết với deviation
 *        Body: { deviationId }
 * POST   /risks/:id/link-capa              - Liên kết với CAPA
 *        Body: { capaId }
 * GET    /risks/:id/linked-records         - Tất cả records liên kết
 *
 * === COMMENT & ATTACHMENT =====================================================
 * GET    /risks/:id/comments               - Danh sách comment
 * POST   /risks/:id/comments               - Thêm comment
 *        Body: { comment }
 * POST   /risks/:id/attachments            - Upload file đính kèm (FMEA, FTA, v.v.)
 *        Body: FormData { file, docType? }
 * GET    /risks/:id/attachments            - Danh sách file đính kèm
 *
 * === AUDIT ====================================================================
 * GET    /risks/:id/audit-trail            - Lịch sử thay đổi của rủi ro
 *
 * === EXPORT ===================================================================
 * GET    /risks/export                     - Export danh sách (XLSX blob)
 *        Params: categoryFilter, levelFilter, statusFilter, dateFrom, dateTo
 * GET    /risks/:id/export/pdf             - Export 1 risk assessment thành PDF
 * GET    /risks/export/risk-matrix         - Export Risk Matrix Chart (PNG/PDF blob)
 *
 * === STATS ====================================================================
 * GET    /risks/stats                      - Thống kê tổng quan
 *        Returns: { total, identified, underAssessment, mitigated,
 *                   accepted, veryHigh, high, medium, low, veryLow }
 * GET    /risks/matrix-data                - Dữ liệu để render Risk Matrix
 *        Returns: [{ level, count, risks[] }]
 */

import { api } from './client';
import type { Risk, RiskFilters } from '@/features/risk-management/types';
import type { PaginatedResponse } from '@/types';

const ENDPOINT = '/risks';

export interface GetRisksParams extends Partial<RiskFilters> {
  page?: number;
  limit?: number;
  department?: string;
  assignedTo?: string;
  assessmentMethod?: string;
}

export const riskApi = {
  /** GET /risks */
  getRisks: async (params?: GetRisksParams) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '' && v !== 'All') query.set(k, String(v));
      });
    }
    const response = await api.get<PaginatedResponse<Risk>>(`${ENDPOINT}?${query}`);
    return response.data;
  },

  /** GET /risks/:id */
  getRiskById: async (id: string) => {
    const response = await api.get<Risk>(`${ENDPOINT}/${id}`);
    return response.data;
  },

  /** POST /risks */
  createRisk: async (data: Partial<Risk>) => {
    const response = await api.post<Risk>(ENDPOINT, data);
    return response.data;
  },

  /** PUT /risks/:id */
  updateRisk: async (id: string, data: Partial<Risk>) => {
    const response = await api.put<Risk>(`${ENDPOINT}/${id}`, data);
    return response.data;
  },

  /** DELETE /risks/:id */
  deleteRisk: async (id: string) => {
    const response = await api.delete(`${ENDPOINT}/${id}`);
    return response.data;
  },

  // ─── Workflow ─────────────────────────────────────────────────────────────────

  /** PATCH /risks/:id/rpn — cập nhật P/S/D, server tự tính RPN và level */
  updateRPN: async (
    id: string,
    data: { probability: number; severity: number; detectability: number }
  ) => {
    const response = await api.patch<Risk>(`${ENDPOINT}/${id}/rpn`, data);
    return response.data;
  },

  /** POST /risks/:id/plan-mitigation */
  planMitigation: async (id: string, data: { mitigationPlan: string; targetRpn?: number }) => {
    const response = await api.post<Risk>(`${ENDPOINT}/${id}/plan-mitigation`, data);
    return response.data;
  },

  /** POST /risks/:id/mitigate */
  mitigate: async (
    id: string,
    data: { mitigationPlan: string; residualRisk: Risk['level']; mitigatedBy: string }
  ) => {
    const response = await api.post<Risk>(`${ENDPOINT}/${id}/mitigate`, data);
    return response.data;
  },

  /** POST /risks/:id/accept */
  accept: async (
    id: string,
    data: { residualRisk: Risk['level']; justification: string; acceptedBy: string }
  ) => {
    const response = await api.post<Risk>(`${ENDPOINT}/${id}/accept`, data);
    return response.data;
  },

  /** POST /risks/:id/escalate */
  escalate: async (id: string, data: { escalatedTo: string; reason: string }) => {
    const response = await api.post<Risk>(`${ENDPOINT}/${id}/escalate`, data);
    return response.data;
  },

  /** POST /risks/:id/close */
  close: async (id: string, data: { closureNote: string }) => {
    const response = await api.post<Risk>(`${ENDPOINT}/${id}/close`, data);
    return response.data;
  },

  /** POST /risks/:id/review */
  review: async (id: string, data: { reviewNote: string; nextReviewDate: string }) => {
    const response = await api.post<Risk>(`${ENDPOINT}/${id}/review`, data);
    return response.data;
  },

  // ─── Comment ──────────────────────────────────────────────────────────────────

  /** POST /risks/:id/comments */
  addComment: async (id: string, comment: string) => {
    const response = await api.post(`${ENDPOINT}/${id}/comments`, { comment });
    return response.data;
  },

  // ─── Export ───────────────────────────────────────────────────────────────────

  /** GET /risks/export — XLSX blob */
  exportRisks: async (params?: GetRisksParams) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '' && v !== 'All') query.set(k, String(v));
      });
    }
    const response = await api.get<Blob>(`${ENDPOINT}/export?${query}`, { responseType: 'blob' });
    return response.data;
  },

  // ─── Stats & Matrix ───────────────────────────────────────────────────────────

  /** GET /risks/stats */
  getStats: async () => {
    const response = await api.get<{
      total: number;
      identified: number;
      underAssessment: number;
      mitigated: number;
      accepted: number;
      veryHigh: number;
      high: number;
      medium: number;
      low: number;
    }>(`${ENDPOINT}/stats`);
    return response.data;
  },

  /** GET /risks/matrix-data — dữ liệu để render Risk Matrix */
  getMatrixData: async () => {
    const response = await api.get<any[]>(`${ENDPOINT}/matrix-data`);
    return response.data;
  },
};
