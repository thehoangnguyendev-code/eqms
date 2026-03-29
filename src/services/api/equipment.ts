/**
 * Equipment Management API Service
 * EU-GMP Annex 15 (Qualification) / Annex 11 / ISO 9001 compliant equipment management
 *
 * Endpoint base: /api/equipment
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * === DANH SÁCH & CRUD =========================================================
 * GET    /equipment                        - Danh sách thiết bị (filter + phân trang)
 *        Params: page, limit, search, typeFilter, statusFilter, locationFilter,
 *                dateFrom, dateTo, department
 * GET    /equipment/:id                    - Chi tiết 1 thiết bị
 * POST   /equipment                        - Thêm thiết bị mới
 *        Body: { equipmentId, name, description, type, manufacturer, model,
 *                serialNumber, location, department, installationDate,
 *                responsiblePerson, sopReference? }
 * PUT    /equipment/:id                    - Cập nhật thông tin thiết bị
 * DELETE /equipment/:id                    - Xóa thiết bị
 *
 * === METADATA & FILTERS =======================================================
 * GET    /equipment/filters                - Lấy dữ liệu cho các dropdown bộ lọc
 *        Returns: {
 *          types: [{label, value}],
 *          status: [{label, value}],
 *          departments: [{label, value}],
 *          manufacturers: [{label, value}]
 *        }
 *
 * === STATUS & MAINTENANCE =====================================================
 * PATCH  /equipment/:id/status             - Cập nhật trạng thái vận hành
 *        Body: { status: EquipmentStatus }
 * POST   /equipment/:id/retire             - Cho nghỉ hưu thiết bị
 *        Body: { reason, retiredDate }
 * POST   /equipment/:id/reinstate          - Đưa thiết bị trở lại hoạt động
 *        Body: { reason }
 *
 * === CALIBRATION (HIỆU CHUẨN) =================================================
 * GET    /equipment/:id/calibrations       - Lịch sử hiệu chuẩn
 * POST   /equipment/:id/calibrations       - Ghi nhận kết quả hiệu chuẩn
 *        Body: { calibrationDate, nextCalibrationDate, result: 'Pass'|'Fail',
 *                performedBy, certificateNumber?, certificate?: FormData }
 * GET    /equipment/calibration-due        - Danh sách thiết bị sắp đến hạn hiệu chuẩn
 *        Params: daysAhead (default: 30)
 *
 * === MAINTENANCE (BẢO TRÌ) ====================================================
 * GET    /equipment/:id/maintenances       - Lịch sử bảo trì
 * POST   /equipment/:id/maintenances       - Ghi nhận kết quả bảo trì
 *        Body: { maintenanceDate, nextMaintenanceDate, description,
 *                type: 'Preventive'|'Corrective', performedBy, cost? }
 * GET    /equipment/maintenance-due        - Danh sách thiết bị sắp đến hạn bảo trì
 *        Params: daysAhead (default: 30)
 *
 * === QUALIFICATION (IQ/OQ/PQ) =================================================
 * GET    /equipment/:id/qualifications     - Lịch sử qualification
 * POST   /equipment/:id/qualify            - Ghi nhận kết quả qualification
 *        Body: { qualificationStatus: QualificationStatus, qualificationDate,
 *                nextRequalificationDate?, report?: string, performedBy }
 * GET    /equipment/qualification-due      - Danh sách thiết bị cần re-qualification
 *
 * === ATTACHMENT ===============================================================
 * POST   /equipment/:id/attachments        - Upload tài liệu (SOP, certificate, report)
 *        Body: FormData { file, documentType: 'SOP'|'Certificate'|'Report'|'Other' }
 * GET    /equipment/:id/attachments        - Danh sách tài liệu đính kèm
 * DELETE /equipment/:id/attachments/:fileId - Xóa tài liệu
 *
 * === AUDIT ====================================================================
 * GET    /equipment/:id/audit-trail        - Lịch sử thay đổi thiết bị
 *
 * === EXPORT ===================================================================
 * GET    /equipment/export                 - Export danh sách (XLSX blob)
 *        Params: typeFilter, statusFilter, locationFilter
 * GET    /equipment/calibration-report     - Report hiệu chuẩn (PDF blob)
 * GET    /equipment/maintenance-report     - Report bảo trì (PDF blob)
 *
 * === STATS ====================================================================
 * GET    /equipment/stats                  - Thống kê tổng quan
 *        Returns: { total, active, underMaintenance, calibrationDue,
 *                   qualificationDue, outOfService, fullyQualified }
 */

import { api } from './client';
import type { Equipment, EquipmentFilters } from '@/features/equipment/types';
import type { PaginatedResponse } from '@/types';

const ENDPOINT = '/equipment';

export interface GetEquipmentParams extends Partial<EquipmentFilters> {
  page?: number;
  limit?: number;
  department?: string;
}

export const equipmentApi = {
  /** GET /equipment */
  getEquipments: async (params?: GetEquipmentParams) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '' && v !== 'All') query.set(k, String(v));
      });
    }
    const response = await api.get<PaginatedResponse<Equipment>>(`${ENDPOINT}?${query}`);
    return response.data;
  },

  /** GET /equipment/:id */
  getEquipmentById: async (id: string) => {
    const response = await api.get<Equipment>(`${ENDPOINT}/${id}`);
    return response.data;
  },

  /** POST /equipment */
  createEquipment: async (data: Partial<Equipment>) => {
    const response = await api.post<Equipment>(ENDPOINT, data);
    return response.data;
  },

  /** PUT /equipment/:id */
  updateEquipment: async (id: string, data: Partial<Equipment>) => {
    const response = await api.put<Equipment>(`${ENDPOINT}/${id}`, data);
    return response.data;
  },

  /** DELETE /equipment/:id */
  deleteEquipment: async (id: string) => {
    const response = await api.delete(`${ENDPOINT}/${id}`);
    return response.data;
  },

  // ─── Status ───────────────────────────────────────────────────────────────────

  /** PATCH /equipment/:id/status */
  updateStatus: async (id: string, status: Equipment['status']) => {
    const response = await api.patch<Equipment>(`${ENDPOINT}/${id}/status`, { status });
    return response.data;
  },

  // ─── Calibration ──────────────────────────────────────────────────────────────

  /** GET /equipment/:id/calibrations */
  getCalibrationHistory: async (id: string) => {
    const response = await api.get(`${ENDPOINT}/${id}/calibrations`);
    return response.data;
  },

  /** POST /equipment/:id/calibrations */
  recordCalibration: async (
    id: string,
    data: {
      calibrationDate: string;
      nextCalibrationDate: string;
      result: 'Pass' | 'Fail';
      performedBy: string;
      certificateNumber?: string;
    }
  ) => {
    const response = await api.post<Equipment>(`${ENDPOINT}/${id}/calibrations`, data);
    return response.data;
  },

  /** GET /equipment/calibration-due */
  getCalibrationDue: async (daysAhead = 30) => {
    const response = await api.get<Equipment[]>(
      `${ENDPOINT}/calibration-due?daysAhead=${daysAhead}`
    );
    return response.data;
  },

  // ─── Maintenance ─────────────────────────────────────────────────────────────

  /** GET /equipment/:id/maintenances */
  getMaintenanceHistory: async (id: string) => {
    const response = await api.get(`${ENDPOINT}/${id}/maintenances`);
    return response.data;
  },

  /** POST /equipment/:id/maintenances */
  recordMaintenance: async (
    id: string,
    data: {
      maintenanceDate: string;
      nextMaintenanceDate: string;
      description: string;
      type: 'Preventive' | 'Corrective';
      performedBy: string;
      cost?: number;
    }
  ) => {
    const response = await api.post<Equipment>(`${ENDPOINT}/${id}/maintenances`, data);
    return response.data;
  },

  // ─── Qualification ────────────────────────────────────────────────────────────

  /** POST /equipment/:id/qualify */
  qualify: async (
    id: string,
    data: {
      qualificationStatus: Equipment['qualificationStatus'];
      qualificationDate: string;
      nextRequalificationDate?: string;
      performedBy: string;
      report?: string;
    }
  ) => {
    const response = await api.post<Equipment>(`${ENDPOINT}/${id}/qualify`, data);
    return response.data;
  },

  /** GET /equipment/qualification-due */
  getQualificationDue: async () => {
    const response = await api.get<Equipment[]>(`${ENDPOINT}/qualification-due`);
    return response.data;
  },

  // ─── Export ───────────────────────────────────────────────────────────────────

  /** GET /equipment/export — XLSX blob */
  exportEquipments: async (params?: GetEquipmentParams) => {
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

  /** GET /equipment/stats */
  getStats: async () => {
    const response = await api.get<{
      total: number;
      active: number;
      underMaintenance: number;
      calibrationDue: number;
      qualificationDue: number;
      outOfService: number;
      fullyQualified: number;
    }>(`${ENDPOINT}/stats`);
    return response.data;
  },
};
