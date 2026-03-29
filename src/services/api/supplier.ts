/**
 * Supplier Management API Service
 * EU-GMP Chapter 5 / GDP compliant supplier qualification
 *
 * Endpoint base: /api/suppliers
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * === DANH SÁCH & CRUD =========================================================
 * GET    /suppliers                        - Danh sách nhà cung cấp (filter + phân trang)
 *        Params: page, limit, search, categoryFilter, statusFilter, riskFilter,
 *                countryFilter, dateFrom, dateTo
 * GET    /suppliers/:id                    - Chi tiết 1 nhà cung cấp
 * POST   /suppliers                        - Thêm nhà cung cấp mới
 *        Body: { supplierId, name, category, country, city, contactPerson,
 *                email, phone, suppliedMaterials, responsiblePerson, qualityAgreement }
 * PUT    /suppliers/:id                    - Cập nhật thông tin NCC
 * DELETE /suppliers/:id                    - Xóa NCC (chỉ khi chưa có giao dịch)
 *
 * === METADATA & FILTERS =======================================================
 * GET    /suppliers/filters                - Lấy dữ liệu cho các dropdown bộ lọc
 *        Returns: {
 *          categories: [{label, value}],
 *          riskRatings: [{label, value}],
 *          statuses: [{label, value}]
 *        }
 *
 * === QUALIFICATION & STATUS ===================================================
 * POST   /suppliers/:id/qualify            - Chứng nhận qualified
 *        Body: { qualificationDate, qualificationReport?, validityPeriodMonths? }
 * POST   /suppliers/:id/conditionally-approve - Chấp thuận có điều kiện
 *        Body: { conditions, reviewDate }
 * POST   /suppliers/:id/suspend            - Tạm ngưng nhà cung cấp
 *        Body: { reason, suspendedDate, reviewDate? }
 * POST   /suppliers/:id/reinstate          - Khôi phục sau khi tạm ngưng
 *        Body: { reason, reinstatedBy }
 * POST   /suppliers/:id/disqualify         - Thu hồi tư cách nhà cung cấp
 *        Body: { reason, disqualifiedDate }
 * PATCH  /suppliers/:id/risk-rating        - Cập nhật mức độ rủi ro
 *        Body: { riskRating: SupplierRiskRating, justification }
 *
 * === AUDIT (KIỂM TRA CƠ SỞ) ==================================================
 * GET    /suppliers/:id/audits             - Lịch sử kiểm tra nhà cung cấp
 * POST   /suppliers/:id/audits/schedule    - Lên lịch kiểm tra
 *        Body: { auditDate, auditor, auditType: 'On-site'|'Remote'|'Documentary' }
 * POST   /suppliers/:id/audits/:auditId/record - Ghi nhận kết quả kiểm tra
 *        Body: { auditDate, result: 'Satisfactory'|'Conditional'|'Unsatisfactory',
 *                findings?, nextAuditDate, reportFile?: FormData }
 * GET    /suppliers/audit-due              - Danh sách nhà cung cấp sắp đến hạn kiểm tra
 *        Params: daysAhead (default: 60)
 *
 * === CERTIFICATES =============================================================
 * POST   /suppliers/:id/certificates/gmp   - Upload GMP Certificate
 *        Body: FormData { file, issueDate, expiryDate, issuingAuthority }
 * POST   /suppliers/:id/certificates/gdp   - Upload GDP Certificate
 *        Body: FormData { file, issueDate, expiryDate, issuingAuthority }
 * POST   /suppliers/:id/certificates/iso   - Upload ISO Certificate
 *        Body: FormData { file, standard, issueDate, expiryDate }
 * GET    /suppliers/:id/certificates       - Danh sách chứng chỉ
 * DELETE /suppliers/:id/certificates/:certId - Xóa chứng chỉ
 * GET    /suppliers/certificates-expiring  - Chứng chỉ sắp hết hạn
 *        Params: daysAhead (default: 90)
 *
 * === QUALITY AGREEMENT ========================================================
 * POST   /suppliers/:id/quality-agreement  - Upload/cập nhật Quality Agreement
 *        Body: FormData { file, signedDate, expiryDate }
 * GET    /suppliers/:id/quality-agreement  - Xem Quality Agreement hiện tại
 *
 * === SUPPLIED MATERIALS ========================================================
 * POST   /suppliers/:id/materials          - Thêm vật liệu cung cấp
 *        Body: { materialName, materialCode?, specifications? }
 * DELETE /suppliers/:id/materials/:materialId - Xóa vật liệu
 *
 * === COMPLAINT & DEVIATION ====================================================
 * GET    /suppliers/:id/complaints         - Khiếu nại liên quan đến nhà cung cấp
 * GET    /suppliers/:id/deviations         - Deviation liên quan đến nhà cung cấp
 *
 * === AUDIT ====================================================================
 * GET    /suppliers/:id/audit-trail        - Lịch sử thay đổi trong hệ thống
 *
 * === EXPORT ===================================================================
 * GET    /suppliers/export                 - Export danh sách (XLSX blob)
 * GET    /suppliers/:id/export/pdf         - Export hồ sơ nhà cung cấp (PDF)
 *
 * === STATS ====================================================================
 * GET    /suppliers/stats                  - Thống kê tổng quan
 *        Returns: { total, qualified, conditionallyApproved, underEvaluation,
 *                   suspended, high: number, critical, auditDue }
 */

import { api } from './client';
import type { Supplier, SupplierFilters } from '@/features/supplier/types';
import type { PaginatedResponse } from '@/types';

const ENDPOINT = '/suppliers';

export interface GetSuppliersParams extends Partial<SupplierFilters> {
  page?: number;
  limit?: number;
  countryFilter?: string;
}

export const supplierApi = {
  /** GET /suppliers */
  getSuppliers: async (params?: GetSuppliersParams) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '' && v !== 'All') query.set(k, String(v));
      });
    }
    const response = await api.get<PaginatedResponse<Supplier>>(`${ENDPOINT}?${query}`);
    return response.data;
  },

  /** GET /suppliers/:id */
  getSupplierById: async (id: string) => {
    const response = await api.get<Supplier>(`${ENDPOINT}/${id}`);
    return response.data;
  },

  /** POST /suppliers */
  createSupplier: async (data: Partial<Supplier>) => {
    const response = await api.post<Supplier>(ENDPOINT, data);
    return response.data;
  },

  /** PUT /suppliers/:id */
  updateSupplier: async (id: string, data: Partial<Supplier>) => {
    const response = await api.put<Supplier>(`${ENDPOINT}/${id}`, data);
    return response.data;
  },

  /** DELETE /suppliers/:id */
  deleteSupplier: async (id: string) => {
    const response = await api.delete(`${ENDPOINT}/${id}`);
    return response.data;
  },

  // ─── Qualification & Status ───────────────────────────────────────────────────

  /** POST /suppliers/:id/qualify */
  qualify: async (
    id: string,
    data: { qualificationDate: string; qualificationReport?: string; validityPeriodMonths?: number }
  ) => {
    const response = await api.post<Supplier>(`${ENDPOINT}/${id}/qualify`, data);
    return response.data;
  },

  /** POST /suppliers/:id/suspend */
  suspend: async (id: string, data: { reason: string; suspendedDate: string; reviewDate?: string }) => {
    const response = await api.post<Supplier>(`${ENDPOINT}/${id}/suspend`, data);
    return response.data;
  },

  /** POST /suppliers/:id/reinstate */
  reinstate: async (id: string, data: { reason: string }) => {
    const response = await api.post<Supplier>(`${ENDPOINT}/${id}/reinstate`, data);
    return response.data;
  },

  /** POST /suppliers/:id/disqualify */
  disqualify: async (id: string, data: { reason: string; disqualifiedDate: string }) => {
    const response = await api.post<Supplier>(`${ENDPOINT}/${id}/disqualify`, data);
    return response.data;
  },

  /** PATCH /suppliers/:id/risk-rating */
  updateRiskRating: async (
    id: string,
    data: { riskRating: Supplier['riskRating']; justification: string }
  ) => {
    const response = await api.patch<Supplier>(`${ENDPOINT}/${id}/risk-rating`, data);
    return response.data;
  },

  // ─── Audit (kiểm tra cơ sở) ──────────────────────────────────────────────────

  /** POST /suppliers/:id/audits/schedule */
  scheduleAudit: async (
    id: string,
    data: { auditDate: string; auditor: string; auditType: 'On-site' | 'Remote' | 'Documentary' }
  ) => {
    const response = await api.post<Supplier>(`${ENDPOINT}/${id}/audits/schedule`, data);
    return response.data;
  },

  /** POST /suppliers/:id/audits/:auditId/record */
  recordAuditResult: async (
    id: string,
    auditId: string,
    data: { result: 'Satisfactory' | 'Conditional' | 'Unsatisfactory'; findings?: string; nextAuditDate?: string }
  ) => {
    const response = await api.post<Supplier>(
      `${ENDPOINT}/${id}/audits/${auditId}/record`,
      data
    );
    return response.data;
  },

  /** GET /suppliers/audit-due */
  getAuditDue: async (daysAhead = 60) => {
    const response = await api.get<Supplier[]>(
      `${ENDPOINT}/audit-due?daysAhead=${daysAhead}`
    );
    return response.data;
  },

  // ─── Certificates ────────────────────────────────────────────────────────────

  /** POST /suppliers/:id/certificates/gmp */
  uploadGMPCertificate: async (
    id: string,
    file: File,
    meta: { issueDate: string; expiryDate: string; issuingAuthority: string }
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    Object.entries(meta).forEach(([k, v]) => formData.append(k, v));
    const response = await api.post<Supplier>(
      `${ENDPOINT}/${id}/certificates/gmp`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  /** POST /suppliers/:id/certificates/gdp */
  uploadGDPCertificate: async (
    id: string,
    file: File,
    meta: { issueDate: string; expiryDate: string; issuingAuthority: string }
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    Object.entries(meta).forEach(([k, v]) => formData.append(k, v));
    const response = await api.post<Supplier>(
      `${ENDPOINT}/${id}/certificates/gdp`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  // ─── Export ───────────────────────────────────────────────────────────────────

  /** GET /suppliers/export — XLSX blob */
  exportSuppliers: async (params?: GetSuppliersParams) => {
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

  /** GET /suppliers/stats */
  getStats: async () => {
    const response = await api.get<{
      total: number;
      qualified: number;
      conditionallyApproved: number;
      underEvaluation: number;
      suspended: number;
      highRisk: number;
      criticalRisk: number;
      auditDue: number;
      certificatesExpiring: number;
    }>(`${ENDPOINT}/stats`);
    return response.data;
  },
};
