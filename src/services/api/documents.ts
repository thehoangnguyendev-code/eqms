/**
 * Document Control API Service
 * EU-GMP Chapter 4 / Annex 11 compliant document management
 *
 * Endpoint base: /api/documents
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * === DOCUMENT LIST ============================================================
 * GET    /documents                        - Danh sách tài liệu (filter + phân trang)
 *        Params: page, limit, search, status, type, owner, department, dateFrom, dateTo
 * GET    /documents/:id                    - Chi tiết 1 tài liệu
 * POST   /documents                        - Tạo tài liệu mới (Draft)
 * PUT    /documents/:id                    - Cập nhật thông tin tài liệu
 * DELETE /documents/:id                    - Xóa tài liệu (chỉ khi Draft)
 *
 * === METADATA & FILTERS =======================================================
 * GET    /documents/filters                - Lấy dữ liệu cho các dropdown bộ lọc
 *        Returns: {
 *          types: [{label, value}],
 *          categories: [{label, value}],
 *          statuses: [{label, value}],
 *          departments: [{label, value}],
 *          classifications: [{label, value}]
 *        }
 *
 * === WORKFLOW (Mô hình Review -> Approve -> Publish) =========================
 * GET    /documents/export                 - Export danh sách tài liệu (XLSX blob)
 *        Params: status, type, search
 *
 * === DOCUMENT WORKFLOW ========================================================
 * POST   /documents/:id/submit             - Nộp tài liệu vào Review (Draft → Pending Review)
 * POST   /documents/:id/review             - Xác nhận Review (Pending Review → Pending Approval)
 *        Body: { reviewerId, comment }
 * POST   /documents/:id/approve            - Phê duyệt với e-signature (Pending Approval → Approved)
 *        Body: { username, password, comment }
 * POST   /documents/:id/reject             - Từ chối phê duyệt
 *        Body: { reason }
 * POST   /documents/:id/publish            - Phát hành tài liệu (Approved → Effective)
 *        Body: { effectiveDate }
 * POST   /documents/:id/obsolete           - Hủy hiệu lực tài liệu (Effective → Obsolete)
 *        Body: { reason, obsoleteDate }
 * POST   /documents/:id/archive            - Lưu trữ tài liệu
 *        Body: { retentionPeriodYears, archiveReason }
 * POST   /documents/:id/restore            - Phục hồi từ lưu trữ (→ Effective)
 *        Body: { restoredBy, reason }
 *
 * === DOCUMENT REVISIONS =======================================================
 * GET    /documents/:id/revisions          - Lịch sử phiên bản của tài liệu
 * POST   /documents/:id/revisions          - Tạo phiên bản mới (Revision)
 *        Body: { changeDescription, revisionType: 'Major' | 'Minor' }
 * GET    /revisions                        - Danh sách tất cả revisions (filter + phân trang)
 *        Params: page, limit, status, ownedByMe, pending, dateFrom, dateTo
 * GET    /revisions/:revisionId            - Chi tiết 1 revision
 * PUT    /revisions/:revisionId            - Cập nhật nội dung revision (khi đang soạn)
 * POST   /revisions/:revisionId/submit     - Nộp revision vào Review
 * POST   /revisions/:revisionId/review     - Xác nhận review revision
 *        Body: { reviewerId, result: 'Approved' | 'RequestChanges', comment }
 * POST   /revisions/:revisionId/approve    - Phê duyệt revision với e-signature
 *        Body: { username, password, comment }
 * POST   /revisions/:revisionId/reject     - Từ chối revision
 *        Body: { reason }
 * POST   /revisions/:revisionId/upgrade    - Nâng cấp revision thành document chính thức
 * POST   /revisions/:revisionId/upload     - Upload file đính kèm vào revision
 *        Body: FormData { file, documentType }
 *
 * === CONTROLLED COPIES ========================================================
 * GET    /controlled-copies                - Danh sách controlled copies (filter + phân trang)
 *        Params: page, limit, status, department, documentId
 * GET    /controlled-copies/:id            - Chi tiết 1 controlled copy
 * POST   /controlled-copies               - Yêu cầu phát hành controlled copy
 *        Body: { documentId, requestedBy, department, location, purpose, copies }
 * POST   /controlled-copies/:id/approve    - Duyệt phát hành controlled copy
 *        Body: { username, password }
 * POST   /controlled-copies/:id/print      - Đánh dấu đã in controlled copy
 *        Body: { printedBy, printedAt }
 * POST   /controlled-copies/:id/distribute - Đánh dấu đã phân phối
 *        Body: { distributedTo, distributedAt, location }
 * POST   /controlled-copies/:id/destroy    - Hủy controlled copy (khi document obsolete)
 *        Body: { destroyedBy, destroyReason, witnessedBy }
 * POST   /controlled-copies/:id/recall     - Thu hồi controlled copy
 *        Body: { recalledBy, recallReason }
 *
 * === ARCHIVED DOCUMENTS =======================================================
 * GET    /documents/archived               - Danh sách tài liệu đã lưu trữ
 *        Params: page, limit, search, retentionStatus, dateFrom, dateTo
 * GET    /documents/archived/:id           - Chi tiết tài liệu lưu trữ
 * POST   /documents/archived/:id/restore   - Phục hồi tài liệu đã lưu trữ
 *        Body: { restoredBy, reason }
 * DELETE /documents/archived/:id           - Xóa vĩnh viễn (khi retention period kết thúc)
 *        Body: { confirmedBy, reason }
 * GET    /documents/archived/export        - Export danh sách archived (XLSX blob)
 *
 * === FILE & ATTACHMENT ========================================================
 * POST   /documents/:id/upload             - Upload file cho tài liệu
 *        Body: FormData { file }
 * GET    /documents/:id/download           - Tải file tài liệu về
 * GET    /documents/:id/preview            - Preview file tài liệu (trả về URL)
 *
 * === AUDIT & SIGNATURES =======================================================
 * GET    /documents/:id/audit-trail        - Lịch sử audit của 1 tài liệu cụ thể
 * GET    /documents/:id/signatures         - Danh sách chữ ký e-signature của tài liệu
 *
 * === STATS ====================================================================
 * GET    /documents/stats                  - Thống kê tổng quan
 *        Returns: { total, draft, pendingReview, pendingApproval, effective, obsolete }
 */

import { api, uploadFile } from './client';
import type { Document, DocumentFilter, PaginatedResponse } from '@/types';

const DOCUMENTS_ENDPOINT = '/documents';
const REVISIONS_ENDPOINT = '/revisions';
const CONTROLLED_COPIES_ENDPOINT = '/controlled-copies';

export const documentApi = {
  // ─── Document List ──────────────────────────────────────────────────────────

  /** GET /documents — paginated list with filters */
  getDocuments: async (filters?: DocumentFilter, page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.owner && { owner: filters.owner }),
    });
    const response = await api.get<PaginatedResponse<Document>>(`${DOCUMENTS_ENDPOINT}?${params}`);
    return response.data;
  },

  /** GET /documents/:id */
  getDocumentById: async (id: string) => {
    const response = await api.get<Document>(`${DOCUMENTS_ENDPOINT}/${id}`);
    return response.data;
  },

  /** POST /documents */
  createDocument: async (data: Partial<Document>) => {
    const response = await api.post<Document>(DOCUMENTS_ENDPOINT, data);
    return response.data;
  },

  /** PUT /documents/:id */
  updateDocument: async (id: string, data: Partial<Document>) => {
    const response = await api.put<Document>(`${DOCUMENTS_ENDPOINT}/${id}`, data);
    return response.data;
  },

  /** DELETE /documents/:id */
  deleteDocument: async (id: string) => {
    const response = await api.delete(`${DOCUMENTS_ENDPOINT}/${id}`);
    return response.data;
  },

  /** GET /documents/export — download XLSX blob */
  exportDocuments: async (filters?: DocumentFilter) => {
    const params = new URLSearchParams({
      ...(filters?.status && { status: filters.status }),
      ...(filters?.search && { search: filters.search }),
    });
    const response = await api.get(`${DOCUMENTS_ENDPOINT}/export?${params}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /** GET /documents/stats */
  getStats: async () => {
    const response = await api.get<{
      total: number;
      draft: number;
      pendingReview: number;
      pendingApproval: number;
      effective: number;
      obsolete: number;
    }>(`${DOCUMENTS_ENDPOINT}/stats`);
    return response.data;
  },

  // ─── Document Workflow ──────────────────────────────────────────────────────

  /** POST /documents/:id/submit — Draft → Pending Review */
  submitForReview: async (id: string) => {
    const response = await api.post<Document>(`${DOCUMENTS_ENDPOINT}/${id}/submit`);
    return response.data;
  },

  /** POST /documents/:id/review — Pending Review → Pending Approval */
  review: async (id: string, data: { result: 'Approved' | 'RequestChanges'; comment?: string }) => {
    const response = await api.post<Document>(`${DOCUMENTS_ENDPOINT}/${id}/review`, data);
    return response.data;
  },

  /** POST /documents/:id/approve — Phê duyệt với e-signature */
  approveDocument: async (
    id: string,
    signature: { username: string; password: string; comment?: string }
  ) => {
    const response = await api.post<Document>(`${DOCUMENTS_ENDPOINT}/${id}/approve`, signature);
    return response.data;
  },

  /** POST /documents/:id/reject */
  rejectDocument: async (id: string, reason: string) => {
    const response = await api.post<Document>(`${DOCUMENTS_ENDPOINT}/${id}/reject`, { reason });
    return response.data;
  },

  /** POST /documents/:id/publish — Approved → Effective */
  publishDocument: async (id: string, data: { effectiveDate: string }) => {
    const response = await api.post<Document>(`${DOCUMENTS_ENDPOINT}/${id}/publish`, data);
    return response.data;
  },

  /** POST /documents/:id/obsolete — Effective → Obsolete */
  obsoleteDocument: async (id: string, data: { reason: string; obsoleteDate: string }) => {
    const response = await api.post<Document>(`${DOCUMENTS_ENDPOINT}/${id}/obsolete`, data);
    return response.data;
  },

  /** POST /documents/:id/archive */
  archiveDocument: async (
    id: string,
    data: { retentionPeriodYears: number; archiveReason: string }
  ) => {
    const response = await api.post<Document>(`${DOCUMENTS_ENDPOINT}/${id}/archive`, data);
    return response.data;
  },

  // ─── Document Revisions ─────────────────────────────────────────────────────

  /** GET /documents/:id/revisions — version history */
  getDocumentVersions: async (id: string) => {
    const response = await api.get(`${DOCUMENTS_ENDPOINT}/${id}/revisions`);
    return response.data;
  },

  /** POST /documents/:id/revisions — tạo revision mới */
  createRevision: async (
    id: string,
    data: { changeDescription: string; revisionType: 'Major' | 'Minor' }
  ) => {
    const response = await api.post(`${DOCUMENTS_ENDPOINT}/${id}/revisions`, data);
    return response.data;
  },

  /** GET /revisions — danh sách tất cả revisions */
  getRevisions: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    ownedByMe?: boolean;
    pending?: boolean;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) query.set(k, String(v));
      });
    }
    const response = await api.get<PaginatedResponse<any>>(`${REVISIONS_ENDPOINT}?${query}`);
    return response.data;
  },

  /** GET /revisions/:revisionId */
  getRevisionById: async (revisionId: string) => {
    const response = await api.get(`${REVISIONS_ENDPOINT}/${revisionId}`);
    return response.data;
  },

  /** PUT /revisions/:revisionId */
  updateRevision: async (revisionId: string, data: Record<string, any>) => {
    const response = await api.put(`${REVISIONS_ENDPOINT}/${revisionId}`, data);
    return response.data;
  },

  /** POST /revisions/:revisionId/submit */
  submitRevision: async (revisionId: string) => {
    const response = await api.post(`${REVISIONS_ENDPOINT}/${revisionId}/submit`);
    return response.data;
  },

  /** POST /revisions/:revisionId/review */
  reviewRevision: async (
    revisionId: string,
    data: { result: 'Approved' | 'RequestChanges'; comment?: string }
  ) => {
    const response = await api.post(`${REVISIONS_ENDPOINT}/${revisionId}/review`, data);
    return response.data;
  },

  /** POST /revisions/:revisionId/approve — e-signature */
  approveRevision: async (
    revisionId: string,
    signature: { username: string; password: string; comment?: string }
  ) => {
    const response = await api.post(`${REVISIONS_ENDPOINT}/${revisionId}/approve`, signature);
    return response.data;
  },

  /** POST /revisions/:revisionId/reject */
  rejectRevision: async (revisionId: string, reason: string) => {
    const response = await api.post(`${REVISIONS_ENDPOINT}/${revisionId}/reject`, { reason });
    return response.data;
  },

  /** POST /revisions/:revisionId/upgrade — nâng lên document chính thức */
  upgradeRevision: async (revisionId: string) => {
    const response = await api.post(`${REVISIONS_ENDPOINT}/${revisionId}/upgrade`);
    return response.data;
  },

  /** POST /revisions/:revisionId/upload — upload file đính kèm */
  uploadRevisionFile: async (revisionId: string, file: File) => {
    return uploadFile(`${REVISIONS_ENDPOINT}/${revisionId}/upload`, file);
  },

  // ─── Controlled Copies ──────────────────────────────────────────────────────

  /** GET /controlled-copies — paginated list */
  getControlledCopies: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    department?: string;
    documentId?: string;
  }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') query.set(k, String(v));
      });
    }
    const response = await api.get<PaginatedResponse<any>>(
      `${CONTROLLED_COPIES_ENDPOINT}?${query}`
    );
    return response.data;
  },

  /** GET /controlled-copies/:id */
  getControlledCopyById: async (id: string) => {
    const response = await api.get(`${CONTROLLED_COPIES_ENDPOINT}/${id}`);
    return response.data;
  },

  /** POST /controlled-copies — yêu cầu phát hành */
  requestControlledCopy: async (data: {
    documentId: string;
    requestedBy: string;
    department: string;
    location: string;
    purpose: string;
    copies: number;
  }) => {
    const response = await api.post(CONTROLLED_COPIES_ENDPOINT, data);
    return response.data;
  },

  /** POST /controlled-copies/:id/approve */
  approveControlledCopy: async (
    id: string,
    signature: { username: string; password: string }
  ) => {
    const response = await api.post(`${CONTROLLED_COPIES_ENDPOINT}/${id}/approve`, signature);
    return response.data;
  },

  /** POST /controlled-copies/:id/print */
  markAsPrinted: async (id: string, data: { printedBy: string; printedAt: string }) => {
    const response = await api.post(`${CONTROLLED_COPIES_ENDPOINT}/${id}/print`, data);
    return response.data;
  },

  /** POST /controlled-copies/:id/distribute */
  distribute: async (
    id: string,
    data: { distributedTo: string; distributedAt: string; location: string }
  ) => {
    const response = await api.post(`${CONTROLLED_COPIES_ENDPOINT}/${id}/distribute`, data);
    return response.data;
  },

  /** POST /controlled-copies/:id/destroy */
  destroyControlledCopy: async (
    id: string,
    data: { destroyedBy: string; destroyReason: string; witnessedBy?: string }
  ) => {
    const response = await api.post(`${CONTROLLED_COPIES_ENDPOINT}/${id}/destroy`, data);
    return response.data;
  },

  /** POST /controlled-copies/:id/recall */
  recallControlledCopy: async (id: string, data: { recalledBy: string; recallReason: string }) => {
    const response = await api.post(`${CONTROLLED_COPIES_ENDPOINT}/${id}/recall`, data);
    return response.data;
  },

  // ─── Archived Documents ─────────────────────────────────────────────────────

  /** GET /documents/archived — danh sách tài liệu lưu trữ */
  getArchivedDocuments: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    retentionStatus?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') query.set(k, String(v));
      });
    }
    const response = await api.get<PaginatedResponse<any>>(
      `${DOCUMENTS_ENDPOINT}/archived?${query}`
    );
    return response.data;
  },

  /** POST /documents/archived/:id/restore */
  restoreArchivedDocument: async (id: string, data: { restoredBy: string; reason: string }) => {
    const response = await api.post(`${DOCUMENTS_ENDPOINT}/archived/${id}/restore`, data);
    return response.data;
  },

  /** DELETE /documents/archived/:id — xóa vĩnh viễn */
  permanentlyDeleteDocument: async (id: string, data: { confirmedBy: string; reason: string }) => {
    const response = await api.delete(`${DOCUMENTS_ENDPOINT}/archived/${id}`, { data });
    return response.data;
  },

  // ─── File & Attachment ──────────────────────────────────────────────────────

  /** POST /documents/:id/upload */
  uploadDocumentFile: async (id: string, file: File) => {
    return uploadFile(`${DOCUMENTS_ENDPOINT}/${id}/upload`, file);
  },

  /** GET /documents/:id/download — tải file về (blob) */
  downloadDocument: async (id: string) => {
    const response = await api.get<Blob>(`${DOCUMENTS_ENDPOINT}/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // ─── Audit & Signatures ─────────────────────────────────────────────────────

  /** GET /documents/:id/audit-trail */
  getDocumentAuditTrail: async (id: string, params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) query.set(k, String(v));
      });
    }
    const response = await api.get(`${DOCUMENTS_ENDPOINT}/${id}/audit-trail?${query}`);
    return response.data;
  },

  /** GET /documents/:id/signatures */
  getDocumentSignatures: async (id: string) => {
    const response = await api.get(`${DOCUMENTS_ENDPOINT}/${id}/signatures`);
    return response.data;
  },
};
