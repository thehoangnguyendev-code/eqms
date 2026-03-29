/**
 * Metadata & Lookup API Service
 * Manages dynamic options for dropdowns, filters, and reference data.
 * Used to avoid hardcoding labels/values in the front-end.
 *
 * Endpoint base: /api/metadata
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * === MODULE METADATA (DROPDOWNS) ==============================================
 * GET    /metadata/options/:module         - Lấy tất cả options cho 1 module cụ thể
 *        Params: fields: string (comma-separated, e.g. 'category,severity,status')
 *        Returns: {
 *          category: [{ label, value, color? }],
 *          severity: [{ label, value, color? }],
 *          status:   [{ label, value, color? }],
 *          documentTypes?: [{ label, value }]
 *        }
 *        Module values: 'deviations', 'capa', 'complaints', 'documents', 'risk', etc.
 *
 * GET    /metadata/statuses/:module        - Lấy riêng danh sách trạng thái và workflow
 *        Returns: { statuses: [], transitions: [] }
 *
 * === GLOBAL LOOKUPS ==========================================================
 * GET    /metadata/departments             - Danh sách phòng ban (cho Filter)
 *        Returns: [{ id, name, code }]
 *
 * GET    /metadata/users                   - Danh sách users rút gọn (cho Filter Assigned To)
 *        Params: role?, department?, search?
 *        Returns: [{ id, fullName, role, department }]
 *
 * GET    /metadata/sites                   - Danh sách các nhà máy / chi nhánh
 *        Returns: [{ id, name, location }]
 *
 * GET    /metadata/products                - Danh sách sản phẩm (cho Filter Affected Product)
 *        Params: search?, status?
 *        Returns: [{ id, name, code, strength }]
 *
 * GET    /metadata/suppliers               - Danh sách nhà cung cấp (cho Filter)
 *        Returns: [{ id, name, category }]
 *
 * === CUSTOM FIELDS ===========================================================
 * GET    /metadata/custom-fields/:module   - Lấy cấu hình các field tùy chỉnh
 *        Returns: [{ fieldName, fieldType, options: [] }]
 */

import { api } from './client';

export interface SelectOption {
  label: string;
  value: string;
  color?: string;
  description?: string;
}

export interface ModuleMetadata {
  categories?: SelectOption[];
  severities?: SelectOption[];
  statuses?: SelectOption[];
  types?: SelectOption[];
  [key: string]: SelectOption[] | undefined;
}

export const metadataApi = {
  /**
   * Lấy tất cả các danh sách options cho dropdown bộ lọc của 1 module cụ thể.
   * Đây là API chính để đổ dữ liệu vào các Select/Multiselect filters.
   * 
   * @example metadataApi.getFilters('deviations') → calls GET /api/deviations/filters
   * @example metadataApi.getFilters('capa') → calls GET /api/capa/filters
   */
  getFilters: async (module: string) => {
    const response = await api.get<any>(`/${module}/filters`);
    return response.data;
  },

  /**
   * (Cách tiếp cận 2) Lấy metadata tập trung qua mapping.
   * @example metadataApi.getModuleOptions('deviations', 'category,severity')
   */
  getModuleOptions: async (module: string, fields?: string) => {
    const query = fields ? `?fields=${fields}` : '';
    const response = await api.get<ModuleMetadata>(`/metadata/options/${module}${query}`);
    return response.data;
  },

  /**
   * Danh sách phòng ban dùng cho các bộ lọc hoặc form.
   */
  getDepartments: async () => {
    const response = await api.get<{ id: string; name: string; code: string }[]>(
      '/metadata/departments'
    );
    return response.data;
  },

  /**
   * Danh sách người dùng rút gọn để phục vụ bộ lọc "Assigned To".
   */
  getUsersLookup: async (params?: { role?: string; department?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) query.set(k, v);
      });
    }
    const response = await api.get<{ id: string; fullName: string; role: string; department?: string }[]>(
      `/metadata/users?${query}`
    );
    return response.data;
  },

  /**
   * Danh sách sản phẩm dùng cho các bộ lọc liên quan đến chất lượng sản phẩm.
   */
  getProductsLookup: async (search?: string) => {
    const query = search ? `?search=${search}` : '';
    const response = await api.get<{ id: string; name: string; code: string }[]>(
      `/metadata/products${query}`
    );
    return response.data;
  },

  /**
   * Danh sách các nhà cung cấp.
   */
  getSuppliersLookup: async () => {
    const response = await api.get<{ id: string; name: string; category: string }[]>(
      '/metadata/suppliers'
    );
    return response.data;
  },

  /**
   * Lấy cấu hình các trường dữ liệu tùy chỉnh cho 1 module.
   */
  getCustomFields: async (module: string) => {
    const response = await api.get<any[]>(`/metadata/custom-fields/${module}`);
    return response.data;
  }
};
