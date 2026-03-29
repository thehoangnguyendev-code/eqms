/**
 * Search & Pagination API Service
 * Global search, advanced filter, and record count utilities for EQMS
 *
 * Endpoint base: /api/search
 *                /api/count
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * === GLOBAL SEARCH (TÌM KIẾM TOÀN HỆ THỐNG) ==================================
 * GET    /search                           - Tìm kiếm toàn EQMS (full-text search)
 *        Params: q (query string, bắt buộc),
 *                modules: string (comma-separated, mặc định tất cả),
 *                limit (default: 10 per module, max 50),
 *                highlight: boolean (có highlight từ khóa trong kết quả)
 *        Returns: {
 *          took: number (ms),
 *          total: number (tổng tất cả kết quả),
 *          results: {
 *            documents: SearchHit[], deviations: SearchHit[],
 *            capa: SearchHit[], complaints: SearchHit[],
 *            risks: SearchHit[], changeControl: SearchHit[],
 *            equipment: SearchHit[], supplier: SearchHit[],
 *            regulatory: SearchHit[], products: SearchHit[]
 *          }
 *        }
 *        SearchHit{ id, module, title, description?, status?, matchedFields[], score, url }
 *        Note: Sử dụng Elasticsearch/Meilisearch hoặc PostgreSQL full-text search
 *
 * GET    /search/suggestions               - Autocomplete / gợi ý tìm kiếm khi user gõ
 *        Params: q (tối thiểu 2 ký tự), modules?, limit (default: 8)
 *        Returns: [{ text, module, entityId, type }]
 *
 * GET    /search/recent                    - Lịch sử tìm kiếm gần đây của user hiện tại
 *        Params: limit (default: 10)
 * DELETE /search/recent                    - Xóa lịch sử tìm kiếm
 *
 * POST   /search/saved                     - Lưu 1 bộ filter để dùng lại
 *        Body: { name, module, filters: Record<string, any> }
 * GET    /search/saved                     - Danh sách filter đã lưu của user
 * DELETE /search/saved/:id                 - Xóa filter đã lưu
 *
 * === MODULE-LEVEL SEARCH (TÌM KIẾM TRONG MODULE) =============================
 * GET    /search/:module                   - Tìm kiếm trong 1 module cụ thể
 *        Params: q, page, limit, sort, order: 'asc'|'desc'
 *        Module values: 'documents'|'deviations'|'capa'|'complaints'|
 *                       'change-control'|'risks'|'equipment'|'supplier'|
 *                       'training'|'regulatory'|'products'
 *        Returns: PaginatedResponse<SearchHit> (có thể dùng cho autocomplete)
 *
 * === PAGINATION UTILITIES =====================================================
 * Lưu ý: Mọi danh sách API trong EQMS đều hỗ trợ các params phân trang sau:
 *
 *   page     : Trang hiện tại (bắt đầu từ 1, default: 1)
 *   limit    : Số records mỗi trang (default: 10, max: 100)
 *   sort     : Field để sort (vd: 'createdAt', 'status', 'severity')
 *   order    : Chiều sort ('asc' | 'desc', default: 'desc')
 *   cursor   : (Optional) Cursor-based pagination cho performance cao với dataset lớn
 *
 * Response format chuẩn (PaginatedResponse<T>):
 *   {
 *     data: T[],
 *     pagination: {
 *       total: number,      ← Tổng số records thỏa filter
 *       page: number,       ← Trang hiện tại
 *       limit: number,      ← Records/trang
 *       totalPages: number, ← Tổng số trang
 *       hasNextPage: boolean,
 *       hasPrevPage: boolean,
 *       nextCursor?: string ← Chỉ khi dùng cursor pagination
 *     }
 *   }
 *
 * === COUNT ENDPOINTS (ĐẾM SỐ LƯỢNG) ==========================================
 * GET    /count/:module                    - Đếm records thỏa điều kiện filter (KHÔNG load data)
 *        Params: (tương tự filter params của module đó)
 *        Returns: { count: number }
 *        Ví dụ: GET /count/deviations?statusFilter=Open → { count: 12 }
 *        Dùng cho: hiển thị số trên badge, stats card, sidebar counter.
 *
 * GET    /count/all                        - Đếm tất cả records active theo từng module
 *        Returns: {
 *          documents: { total, pendingReview, pendingApproval },
 *          deviations: { total, open, critical },
 *          capa: { total, inProgress, overdue },
 *          complaints: { total, open, critical },
 *          changeControl: { pending, pendingApproval },
 *          equipment: { total, calibrationDue, maintenanceDue },
 *          supplier: { total, suspended, auditDue },
 *          training: { overdue, complianceRate },
 *          risks: { total, high, veryHigh },
 *          tasks: { myPending, myOverdue }
 *        }
 *        Note: Endpoint này dùng cho dashboard badges và sidebar counters.
 *              Nên cache kết quả 60 giây phía server.
 *
 * GET    /count/my-actions                 - Số lượng action đang chờ của user hiện tại
 *        Returns: {
 *          pendingApprovals: number,   ← documents/deviations/capa cần approve
 *          pendingReviews: number,     ← cần review
 *          myTasks: number,            ← tasks được giao
 *          overdueTasks: number,       ← tasks quá hạn
 *          notifications: number       ← thông báo chưa đọc
 *        }
 *        Note: Dùng cho Header badge và dashboard. Poll interval: 30 giây.
 *
 * === SORTING OPTIONS ===========================================================
 * Các field sort phổ biến theo module:
 *
 * documents:       createdAt, updatedAt, title, status, type, effectiveDate
 * deviations:      reportedDate, investigationDeadline, severity, status, category
 * capa:            initiatedDate, targetCompletionDate, status, type, source
 * complaints:      reportedDate, responseDeadline, priority, status, type
 * change-control:  submittedDate, targetDate, impact, status, type
 * equipment:       nextCalibrationDate, nextMaintenanceDate, status, type
 * supplier:        nextAuditDate, riskRating, status, category
 * training:        dueDate, completionDate, status, courseTitle
 * risks:           rpn, level, reviewDate, status, category
 * regulatory:      submissionDate, targetDate, authority, status, type
 * tasks:           dueDate, priority, status, createdAt
 * audit-trail:     timestamp (default), module, action, severity
 */

import { api } from './client';
import type { PaginatedResponse } from '@/types';

export interface SearchHit {
  id: string;
  module: string;
  title: string;
  description?: string;
  status?: string;
  matchedFields: string[];
  score: number;
  url: string;
  createdAt: string;
  highlight?: Record<string, string[]>;
}

export interface GlobalSearchResult {
  took: number; // milliseconds
  total: number;
  results: {
    documents?: SearchHit[];
    deviations?: SearchHit[];
    capa?: SearchHit[];
    complaints?: SearchHit[];
    risks?: SearchHit[];
    changeControl?: SearchHit[];
    equipment?: SearchHit[];
    supplier?: SearchHit[];
    regulatory?: SearchHit[];
    products?: SearchHit[];
  };
}

export interface AllModuleCounts {
  documents: { total: number; pendingReview: number; pendingApproval: number };
  deviations: { total: number; open: number; critical: number };
  capa: { total: number; inProgress: number; overdue: number };
  complaints: { total: number; open: number; critical: number };
  changeControl: { pending: number; pendingApproval: number };
  equipment: { total: number; calibrationDue: number; maintenanceDue: number };
  supplier: { total: number; suspended: number; auditDue: number };
  training: { overdue: number; complianceRate: number };
  risks: { total: number; high: number; veryHigh: number };
  tasks: { myPending: number; myOverdue: number };
}

export interface MyActionCounts {
  pendingApprovals: number;
  pendingReviews: number;
  myTasks: number;
  overdueTasks: number;
  notifications: number;
}

// ─── Supported sort orders ────────────────────────────────────────────────────

export type SortOrder = 'asc' | 'desc';

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: SortOrder;
  cursor?: string;
}

// ─── searchApi ────────────────────────────────────────────────────────────────

export const searchApi = {
  // ---------- GLOBAL SEARCH ----------------------------------------------------

  /**
   * Tìm kiếm toàn hệ thống EQMS.
   * @example searchApi.global({ q: 'batch record', modules: ['documents', 'deviations'] })
   * @example searchApi.global({ q: 'paracetamol', highlight: true })
   */
  global: async (params: {
    q: string;
    modules?: string[];
    limit?: number;
    highlight?: boolean;
  }) => {
    const query = new URLSearchParams({ q: params.q });
    if (params.modules?.length) query.set('modules', params.modules.join(','));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.highlight) query.set('highlight', 'true');
    const response = await api.get<GlobalSearchResult>(`/search?${query}`);
    return response.data;
  },

  /**
   * Autocomplete gợi ý khi user gõ (debounce ~300ms ở client trước khi gọi).
   * @example searchApi.suggestions({ q: 'DEV-20' })
   */
  suggestions: async (params: { q: string; modules?: string[]; limit?: number }) => {
    const query = new URLSearchParams({ q: params.q });
    if (params.modules?.length) query.set('modules', params.modules.join(','));
    if (params.limit) query.set('limit', String(params.limit));
    const response = await api.get<{ text: string; module: string; entityId: string; type: string }[]>(
      `/search/suggestions?${query}`
    );
    return response.data;
  },

  /**
   * Tìm kiếm trong 1 module cụ thể với phân trang theo chuẩn.
   * @example searchApi.inModule('deviations', { q: 'temperature', page: 1, sort: 'severity', order: 'desc' })
   */
  inModule: async (
    module: string,
    params: { q: string } & PaginationParams
  ) => {
    const query = new URLSearchParams({ q: params.q });
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.sort) query.set('sort', params.sort);
    if (params.order) query.set('order', params.order);
    const response = await api.get<PaginatedResponse<SearchHit>>(
      `/search/${module}?${query}`
    );
    return response.data;
  },

  /**
   * Lịch sử tìm kiếm của user hiện tại.
   */
  getRecentSearches: async (limit = 10) => {
    const response = await api.get<{ query: string; searchedAt: string; resultCount?: number }[]>(
      `/search/recent?limit=${limit}`
    );
    return response.data;
  },

  clearRecentSearches: async () => {
    const response = await api.delete('/search/recent');
    return response.data;
  },

  /**
   * Lưu bộ filter để dùng lại.
   * @example searchApi.saveFilter({ name: 'Critical Deviations', module: 'deviations', filters: { severityFilter: 'Critical', statusFilter: 'Open' } })
   */
  saveFilter: async (data: { name: string; module: string; filters: Record<string, any> }) => {
    const response = await api.post('/search/saved', data);
    return response.data;
  },

  getSavedFilters: async () => {
    const response = await api.get<{ id: string; name: string; module: string; filters: Record<string, any> }[]>(
      '/search/saved'
    );
    return response.data;
  },

  deleteSavedFilter: async (id: string) => {
    const response = await api.delete(`/search/saved/${id}`);
    return response.data;
  },
};

// ─── countApi ─────────────────────────────────────────────────────────────────

export const countApi = {
  /**
   * Đếm records trong 1 module theo filter — KHÔNG load data, chỉ trả về số lượng.
   * Nhẹ hơn nhiều so với gọi list API với limit=0.
   *
   * @example countApi.module('deviations', { statusFilter: 'Open' })
   * @example countApi.module('capa', { typeFilter: 'Corrective' })
   */
  module: async (module: string, filters?: Record<string, string | number>) => {
    const query = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== '' && v !== 'All') query.set(k, String(v));
      });
    }
    const response = await api.get<{ count: number }>(`/count/${module}?${query}`);
    return response.data.count;
  },

  /**
   * Lấy số lượng tất cả module cùng 1 lúc — dùng cho dashboard badges và sidebar.
   * Server nên cache kết quả này 60 giây.
   *
   * @example const counts = await countApi.all()
   * // counts.deviations.open → 12
   * // counts.tasks.myOverdue → 3
   */
  all: async () => {
    const response = await api.get<AllModuleCounts>('/count/all');
    return response.data;
  },

  /**
   * Số lượng các hành động đang chờ của user hiện tại.
   * Dùng cho Header notification badge và dashboard.
   * Nên poll mỗi 30 giây để cập nhật real-time.
   *
   * @example const counts = await countApi.myActions()
   * // counts.pendingApprovals → 2 (documents cần approve)
   * // counts.notifications   → 5
   */
  myActions: async () => {
    const response = await api.get<MyActionCounts>('/count/my-actions');
    return response.data;
  },
};
