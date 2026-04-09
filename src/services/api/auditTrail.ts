/**
 * Audit Trail API Service
 * 21 CFR Part 11 / EU-GMP Annex 11 / GAMP 5 compliant audit trail
 *
 * Endpoint base: /api/audit-trail
 * ─────────────────────────────────────────────────────────────────────────────
 * QUAN TRỌNG: Audit trail là bản ghi HỆ THỐNG TỰ TẠO và BẤT BIẾN (immutable).
 * Không có API tạo, sửa, xóa record. Chỉ hỗ trợ đọc và export.
 * Mọi hành động trong hệ thống (Create/Update/Delete/Approve/Login...) đều
 * tự động sinh ra 1 audit record phía server.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * === DANH SÁCH & FILTER (READ ONLY) ==========================================
 * GET    /audit-trail                      - Danh sách audit records (filter + phân trang)
 *        Params: page, limit, search (entity/user/description),
 *                module: AuditModule | 'All',
 *                action: AuditAction | 'All',
 *                user (search by username),
 *                userId,
 *                severity: AuditSeverity | 'All',
 *                dateFrom, dateTo
 * GET    /audit-trail/:id                  - Chi tiết 1 audit record (bao gồm changes[], metadata)
 *
 * === FILTER THEO ENTITY =======================================================
 * GET    /audit-trail/entity/:module/:entityId  - Toàn bộ audit của 1 entity cụ thể
 *        Params: page, limit
 *        Ví dụ: GET /audit-trail/entity/Document/DOC-001
 *               GET /audit-trail/entity/Deviation/DEV-2024-001
 *
 * === FILTER THEO USER =========================================================
 * GET    /audit-trail/user/:userId         - Toàn bộ audit của 1 người dùng
 *        Params: page, limit, dateFrom, dateTo, module
 *
 * === FILTER THEO SESSION ======================================================
 * GET    /audit-trail/session/:sessionId   - Toàn bộ hoạt động trong 1 session login
 *
 * === EXPORT (21 CFR Part 11 compliance) =======================================
 * GET    /audit-trail/export               - Export danh sách (XLSX blob)
 *        Params: module, action, userId, severity, dateFrom, dateTo
 *        Header Content-Disposition: attachment; filename="audit-trail-YYYY-MM-DD.xlsx"
 * GET    /audit-trail/export/pdf           - Export danh sách (PDF blob)
 *        Params: module, action, userId, severity, dateFrom, dateTo
 * GET    /audit-trail/:id/export/json      - Export 1 record (JSON) — dùng cho kiểm tra cụ thể
 * GET    /audit-trail/:id/export/pdf       - Export 1 record (PDF)
 * GET    /audit-trail/:id/export/txt       - Export 1 record (TXT plain text)
 * GET    /audit-trail/:id                  - Chi tiết 1 bản ghi log
 *
 * === METADATA & FILTERS =======================================================
 * GET    /audit-trail/filters              - Lấy dữ liệu cho các dropdown bộ lọc
 *        Returns: {
 *          modules: [{label, value}],
 *          actions: [{label, value}],
 *          users: [{label, value}],
 *          severities: [{label, value}]
 *        }
 *
 * === ACCESS CONTROL ===========================================================
 * GET    /audit-trail/integrity-check      - Kiểm tra tính toàn vẹn dữ liệu (checksum)
 *        Returns: { status: 'OK'|'TAMPERED', checkedRecords, failedRecords }
 *
 * === STATS ====================================================================
 * GET    /audit-trail/stats                - Thống kê tổng quan
 *        Returns: { totalRecords, today, thisWeek, thisMonth,
 *                   byModule: Record<AuditModule, number>,
 *                   byAction: Record<AuditAction, number>,
 *                   criticalCount, highCount }
 */

import { api } from './client';
import type { AuditTrailRecord, AuditTrailFilters } from '@/features/audit-trail/types';
import type { PaginatedResponse } from '@/types';

const ENDPOINT = '/audit-trail';

export interface GetAuditTrailParams extends Partial<AuditTrailFilters> {
  page?: number;
  limit?: number;
  userId?: string;
}

export const auditTrailApi = {
  /** GET /audit-trail — paginated, filterable list (read-only) */
  getAuditTrail: async (params?: GetAuditTrailParams) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '' && v !== 'All') query.set(k, String(v));
      });
    }
    const response = await api.get<PaginatedResponse<AuditTrailRecord>>(`${ENDPOINT}?${query}`);
    return response.data;
  },

  /** GET /audit-trail/:id — chi tiết record bao gồm changes[] và metadata */
  getAuditRecordById: async (id: string) => {
    const response = await api.get<AuditTrailRecord>(`${ENDPOINT}/${id}`);
    return response.data;
  },

  /** GET /audit-trail/entity/:module/:entityId — toàn bộ lịch sử của 1 entity */
  getByEntity: async (
    module: string,
    entityId: string,
    params?: { page?: number; limit?: number }
  ) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) query.set(k, String(v));
      });
    }
    const response = await api.get<PaginatedResponse<AuditTrailRecord>>(
      `${ENDPOINT}/entity/${module}/${entityId}?${query}`
    );
    return response.data;
  },

  /** GET /audit-trail/user/:userId */
  getByUser: async (
    userId: string,
    params?: { page?: number; limit?: number; dateFrom?: string; dateTo?: string; module?: string }
  ) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') query.set(k, String(v));
      });
    }
    const response = await api.get<PaginatedResponse<AuditTrailRecord>>(
      `${ENDPOINT}/user/${userId}?${query}`
    );
    return response.data;
  },

  // ─── Export ───────────────────────────────────────────────────────────────────

  /** GET /audit-trail/export — XLSX blob */
  exportAuditTrail: async (params?: GetAuditTrailParams) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '' && v !== 'All') query.set(k, String(v));
      });
    }
    const response = await api.get<Blob>(`${ENDPOINT}/export?${query}`, { responseType: 'blob' });
    return response.data;
  },

  /** GET /audit-trail/export/pdf — PDF blob */
  exportAuditTrailPDF: async (params?: GetAuditTrailParams) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '' && v !== 'All') query.set(k, String(v));
      });
    }
    const response = await api.get<Blob>(`${ENDPOINT}/export/pdf?${query}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /** GET /audit-trail/:id/export/:format — export 1 record (json | pdf | txt) */
  exportSingleRecord: async (id: string, format: 'json' | 'pdf' | 'txt') => {
    const response = await api.get<Blob>(`${ENDPOINT}/${id}/export/${format}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // ─── Stats ────────────────────────────────────────────────────────────────────

  /** GET /audit-trail/stats */
  getStats: async () => {
    const response = await api.get<{
      totalRecords: number;
      today: number;
      thisWeek: number;
      thisMonth: number;
      criticalCount: number;
      highCount: number;
    }>(`${ENDPOINT}/stats`);
    return response.data;
  },

  /** GET /audit-trail/integrity-check */
  checkIntegrity: async () => {
    const response = await api.get<{
      status: 'OK' | 'TAMPERED';
      checkedRecords: number;
      failedRecords: number;
    }>(`${ENDPOINT}/integrity-check`);
    return response.data;
  },
};
