/**
 * Dashboard API Service
 * Executive KPI dashboard and real-time monitoring for EQMS
 *
 * Endpoint base: /api/dashboard
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * === MAIN DASHBOARD OVERVIEW ==================================================
 * GET    /dashboard/stats                  - KPI stats cards tổng quan
 *        Params: dateFrom?, dateTo?
 *        Returns: {
 *          openDeviations: { count, critical, trend },
 *          openCAPAs: { count, overdue, trend },
 *          pendingDocuments: { count, overdueApprovals },
 *          openComplaints: { count, critical },
 *          trainingCompliance: { rate, overdue },
 *          calibrationDue: { count, overdue },
 *          supplierIssues: { suspended, auditDue },
 *          openRisks: { count, high, veryHigh }
 *        }
 * GET    /dashboard/overview               - Số liệu tổng quan (Stats Cards)
 *
 * === RECENT ACTIVITIES =========================================================
 * GET    /dashboard/recent-activity        - Hoạt động gần đây (với filter module)
 *        Params: limit (default: 20), module?
 *        Returns: [{ id, timestamp, module, action, entityId, entityName,
 *                    user, description, severity }]
 *
 * === METADATA & FILTERS =======================================================
 * GET    /dashboard/filters                - Lấy dữ liệu cho các dropdown bộ lọc dashboard
 *        Returns: {
 *          timeRanges: [{label, value}],
 *          modules: [{label, value}],
 *          sites: [{label, value}]
 *        }
 *
 * === TASKS & DEADLINES ========================================================
 * GET    /dashboard/my-tasks               - Tasks được giao cho user hiện tại
 *        Params: limit (default: 10), status?
 *        Returns: [{ id, type, title, dueDate, priority, status, module, entityId }]
 *        Includes: documents to review, CAPAs to implement, trainings overdue, etc.
 *
 * GET    /dashboard/my-pending-approvals   - Danh sách cần phê duyệt của user hiện tại
 *        Returns: [{ module, entityId, entityTitle, requestedBy, requestedAt, dueDate }]
 *
 * === UPCOMING DEADLINES ========================================================
 * GET    /dashboard/deadlines              - Các deadline sắp tới (cross-module)
 *        Params: days (default: 14)
 *        Returns: [{ module, entityId, entityTitle, dueDate, daysLeft,
 *                    status, assignedTo, priority }]
 *        Sources: CAPA target dates, Deviation investigation deadlines,
 *                 Equipment calibration/maintenance, Supplier audit,
 *                 Training due dates, Regulatory submission deadlines
 *
 * === MODULE SUMMARIES =========================================================
 * GET    /dashboard/module-summary         - Tóm tắt trạng thái từng module
 *        Returns: {
 *          documents: { total, pending, effective },
 *          deviations: { open, critical, closedThisMonth },
 *          capa: { total, overdue, effectivenessRate },
 *          complaints: { open, responseTimeAvg },
 *          changeControl: { pending, approved },
 *          equipment: { total, calibrationDue },
 *          supplier: { qualified, suspended },
 *          training: { complianceRate, overdue },
 *          risks: { high, veryHigh, mitigated }
 *        }
 *
 * === QUALITY METRICS ==========================================================
 * GET    /dashboard/quality-index          - Quality Performance Index (QPI)
 *        Returns: { overall, byDimension: { compliance, quality, risk, productivity } }
 *
 * GET    /dashboard/trends                 - Xu hướng KPIs theo thời gian (chart data)
 *        Params: metric: 'deviations'|'capa'|'complaints'|'training',
 *                period: 'monthly'|'quarterly', months (default: 12)
 *        Returns: [{ label, value, trend }]
 *
 * === ALERTS & ESCALATIONS =====================================================
 * GET    /dashboard/alerts                 - Cảnh báo hệ thống (critical items cần xử lý ngay)
 *        Returns: [{ id, severity: 'Critical'|'High', module, message, entityId, entityUrl }]
 *
 * === WIDGETS (Caching) ========================================================
 * GET    /dashboard/widgets/:widgetId/refresh - Làm mới cache 1 widget
 *        Available widgetId: stats | activity | deadlines | alerts | quality-index
 */

import { api } from './client';

const ENDPOINT = '/dashboard';

export const dashboardApi = {
  /** GET /dashboard/stats — KPI stats cards tổng quan */
  getStats: async (params?: { dateFrom?: string; dateTo?: string }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => { if (v) query.set(k, v); });
    }
    const response = await api.get<any>(`${ENDPOINT}/stats?${query}`);
    return response.data;
  },

  /** GET /dashboard/recent-activity */
  getRecentActivity: async (params?: { limit?: number; module?: string }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) query.set(k, String(v));
      });
    }
    const response = await api.get<any[]>(`${ENDPOINT}/recent-activity?${query}`);
    return response.data;
  },

  /** GET /dashboard/my-tasks */
  getMyTasks: async (params?: { limit?: number; status?: string }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) query.set(k, String(v));
      });
    }
    const response = await api.get<any[]>(`${ENDPOINT}/my-tasks?${query}`);
    return response.data;
  },

  /** GET /dashboard/my-pending-approvals */
  getMyPendingApprovals: async () => {
    const response = await api.get<any[]>(`${ENDPOINT}/my-pending-approvals`);
    return response.data;
  },

  /** GET /dashboard/deadlines — cross-module deadlines sắp tới */
  getUpcomingDeadlines: async (days = 14) => {
    const response = await api.get<any[]>(`${ENDPOINT}/deadlines?days=${days}`);
    return response.data;
  },

  /** GET /dashboard/module-summary */
  getModuleSummary: async () => {
    const response = await api.get<any>(`${ENDPOINT}/module-summary`);
    return response.data;
  },

  /** GET /dashboard/quality-index */
  getQualityIndex: async () => {
    const response = await api.get<{
      overall: number;
      byDimension: {
        compliance: number;
        quality: number;
        risk: number;
        productivity: number;
      };
    }>(`${ENDPOINT}/quality-index`);
    return response.data;
  },

  /** GET /dashboard/trends */
  getTrends: async (params: {
    metric: 'deviations' | 'capa' | 'complaints' | 'training';
    period?: 'monthly' | 'quarterly';
    months?: number;
  }) => {
    const query = new URLSearchParams({
      metric: params.metric,
      ...(params.period && { period: params.period }),
      ...(params.months && { months: String(params.months) }),
    });
    const response = await api.get<{ label: string; value: number; trend: number }[]>(
      `${ENDPOINT}/trends?${query}`
    );
    return response.data;
  },

  /** GET /dashboard/alerts */
  getAlerts: async () => {
    const response = await api.get<
      {
        id: string;
        severity: 'Critical' | 'High';
        module: string;
        message: string;
        entityId: string;
        entityUrl?: string;
      }[]
    >(`${ENDPOINT}/alerts`);
    return response.data;
  },
};
