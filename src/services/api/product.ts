/**
 * Product Management API Service
 * EU-GMP Chapter 6 (QC) / ICH Q8/Q9/Q10 compliant product lifecycle management
 *
 * Endpoint base: /api/products
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * === DANH SÁCH & CRUD =========================================================
 * GET    /products                         - Danh sách sản phẩm (filter + phân trang)
 *        Params: page, limit, search, typeFilter, statusFilter, dosageFormFilter,
 *                dateFrom, dateTo, therapeuticArea
 * GET    /products/:id                     - Chi tiết 1 sản phẩm
 * POST   /products                         - Tạo sản phẩm mới
 *        Body: { productCode, name, description, type, dosageForm, strength,
 *                composition, storageConditions, shelfLifeMonths,
 *                therapeuticArea?, manufacturer, marketedCountries?: string[] }
 * PUT    /products/:id                     - Cập nhật thông tin sản phẩm
 * DELETE /products/:id                     - Xóa sản phẩm
 *
 * === METADATA & FILTERS =======================================================
 * GET    /products/filters                 - Lấy dữ liệu cho các dropdown bộ lọc
 *        Returns: {
 *          dosageForms: [{label, value}],
 *          status: [{label, value}],
 *          categories: [{label, value}]
 *        }
 *
 * === LIFECYCLE MANAGEMENT =====================================================
 * POST   /products/:id/submit              - Nộp để phê duyệt (Draft → Pending Approval)
 * POST   /products/:id/approve             - Phê duyệt với e-signature (→ Approved)
 *        Body: { username, password, approvalDate }
 * POST   /products/:id/market              - Đưa sản phẩm ra thị trường (→ Marketed)
 *        Body: { marketingDate, marketedCountries: string[] }
 * POST   /products/:id/discontinue         - Ngừng sản xuất (→ Discontinued)
 *        Body: { reason, discontinueDate }
 * POST   /products/:id/obsolete            - Hủy hiệu lực (→ Obsolete)
 *        Body: { reason }
 *
 * === BATCH/LOT RECORDS ========================================================
 * GET    /products/:id/batches             - Danh sách lô sản xuất
 *        Params: page, limit, status, dateFrom, dateTo
 * POST   /products/:id/batches             - Tạo batch record mới
 *        Body: { batchNumber, manufacturingDate, expiryDate,
 *                quantity, unit, batchSize }
 * GET    /products/:id/batches/:batchId    - Chi tiết 1 batch record
 * POST   /products/:id/batches/:batchId/release  - Phát hành lô (QP release)
 *        Body: { username, password, releaseDate }
 * POST   /products/:id/batches/:batchId/reject   - Từ chối lô
 *        Body: { reason }
 *
 * === SPECIFICATIONS ============================================================
 * GET    /products/:id/specifications      - Danh sách tiêu chuẩn sản phẩm
 * POST   /products/:id/specifications      - Thêm tiêu chuẩn mới
 *        Body: { parameter, specification, method, frequency }
 * PUT    /products/:id/specifications/:specId - Cập nhật tiêu chuẩn
 *
 * === QUALITY INCIDENTS =========================================================
 * GET    /products/:id/deviations          - Deviations liên quan
 * GET    /products/:id/complaints          - Complaints liên quan
 * GET    /products/:id/capas               - CAPAs liên quan
 *
 * === REGULATORY SUBMISSIONS ===================================================
 * GET    /products/:id/submissions         - Regulatory submissions liên quan đến sản phẩm
 *
 * === ATTACHMENT ===============================================================
 * POST   /products/:id/attachments         - Upload tài liệu (SOP, spec, dossier)
 *        Body: FormData { file, documentType }
 * GET    /products/:id/attachments         - Danh sách tài liệu
 *
 * === AUDIT ====================================================================
 * GET    /products/:id/audit-trail         - Lịch sử thay đổi
 *
 * === EXPORT ===================================================================
 * GET    /products/export                  - Export danh sách (XLSX blob)
 *        Params: typeFilter, statusFilter, dosageFormFilter
 * GET    /products/:id/export/pdf          - Export hồ sơ sản phẩm (PDF)
 *
 * === STATS ====================================================================
 * GET    /products/stats                   - Thống kê tổng quan
 *        Returns: { total, draft, approved, marketed, discontinued,
 *                   activeBatches, batchesReleasedThisMonth }
 */

import { api } from './client';
import type { Product, ProductFilters } from '@/features/product/types';
import type { PaginatedResponse } from '@/types';

const ENDPOINT = '/products';

export interface GetProductsParams extends Partial<ProductFilters> {
  page?: number;
  limit?: number;
  therapeuticArea?: string;
}

export const productApi = {
  /** GET /products */
  getProducts: async (params?: GetProductsParams) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '' && v !== 'All') query.set(k, String(v));
      });
    }
    const response = await api.get<PaginatedResponse<Product>>(`${ENDPOINT}?${query}`);
    return response.data;
  },

  /** GET /products/:id */
  getProductById: async (id: string) => {
    const response = await api.get<Product>(`${ENDPOINT}/${id}`);
    return response.data;
  },

  /** POST /products */
  createProduct: async (data: Partial<Product>) => {
    const response = await api.post<Product>(ENDPOINT, data);
    return response.data;
  },

  /** PUT /products/:id */
  updateProduct: async (id: string, data: Partial<Product>) => {
    const response = await api.put<Product>(`${ENDPOINT}/${id}`, data);
    return response.data;
  },

  /** DELETE /products/:id */
  deleteProduct: async (id: string) => {
    const response = await api.delete(`${ENDPOINT}/${id}`);
    return response.data;
  },

  // ─── Lifecycle ────────────────────────────────────────────────────────────────

  /** POST /products/:id/approve — e-signature */
  approve: async (
    id: string,
    signature: { username: string; password: string; approvalDate: string }
  ) => {
    const response = await api.post<Product>(`${ENDPOINT}/${id}/approve`, signature);
    return response.data;
  },

  /** POST /products/:id/market */
  market: async (id: string, data: { marketingDate: string; marketedCountries: string[] }) => {
    const response = await api.post<Product>(`${ENDPOINT}/${id}/market`, data);
    return response.data;
  },

  /** POST /products/:id/discontinue */
  discontinue: async (id: string, data: { reason: string; discontinueDate: string }) => {
    const response = await api.post<Product>(`${ENDPOINT}/${id}/discontinue`, data);
    return response.data;
  },

  // ─── Batch Records ────────────────────────────────────────────────────────────

  /** GET /products/:id/batches */
  getBatches: async (
    id: string,
    params?: { page?: number; limit?: number; status?: string; dateFrom?: string; dateTo?: string }
  ) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') query.set(k, String(v));
      });
    }
    const response = await api.get<PaginatedResponse<any>>(`${ENDPOINT}/${id}/batches?${query}`);
    return response.data;
  },

  /** POST /products/:id/batches */
  createBatch: async (id: string, data: Record<string, any>) => {
    const response = await api.post<any>(`${ENDPOINT}/${id}/batches`, data);
    return response.data;
  },

  /** POST /products/:id/batches/:batchId/release — QP release với e-signature */
  releaseBatch: async (
    id: string,
    batchId: string,
    signature: { username: string; password: string; releaseDate: string }
  ) => {
    const response = await api.post<any>(
      `${ENDPOINT}/${id}/batches/${batchId}/release`,
      signature
    );
    return response.data;
  },

  // ─── Quality Incidents ────────────────────────────────────────────────────────

  /** GET /products/:id/deviations */
  getProductDeviations: async (id: string) => {
    const response = await api.get(`${ENDPOINT}/${id}/deviations`);
    return response.data;
  },

  /** GET /products/:id/complaints */
  getProductComplaints: async (id: string) => {
    const response = await api.get(`${ENDPOINT}/${id}/complaints`);
    return response.data;
  },

  // ─── Export ───────────────────────────────────────────────────────────────────

  /** GET /products/export — XLSX blob */
  exportProducts: async (params?: GetProductsParams) => {
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

  /** GET /products/stats */
  getStats: async () => {
    const response = await api.get<{
      total: number;
      draft: number;
      approved: number;
      marketed: number;
      discontinued: number;
      activeBatches: number;
      batchesReleasedThisMonth: number;
    }>(`${ENDPOINT}/stats`);
    return response.data;
  },
};
