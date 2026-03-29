/**
 * Notifications API Service
 * In-app notification management for EQMS
 *
 * Endpoint base: /api/notifications
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * === DANH SÁCH & ĐỌC =========================================================
 * GET    /notifications                    - Danh sách thông báo của người dùng hiện tại
 *        Params: page, limit, isRead: boolean|undefined, type, priority, dateFrom, dateTo
 *        Returns: PaginatedResponse<Notification>
 * GET    /notifications/unread-count       - Số thông báo chưa đọc (dùng cho badge)
 *        Returns: { count: number }
 * GET    /notifications/:id                - Chi tiết 1 thông báo (tự động đánh dấu đã đọc)
 *
 * === ĐÁNH DẤU ĐÃ ĐỌC =========================================================
 * PUT    /notifications/:id/read           - Đánh dấu 1 thông báo đã đọc
 * PUT    /notifications/read-all           - Đánh dấu TẤT CẢ là đã đọc
 * PUT    /notifications/read               - Đánh dấu nhóm đã đọc
 *        Body: { ids: string[] }
 *
 * === METADATA & FILTERS =======================================================
 * GET    /notifications/filters            - Lấy dữ liệu cho các bộ lọc thông báo
 *        Returns: {
 *          types: [{label, value}],
 *          priorities: [{label, value}]
 *        }
 *
 * === XÓA =====================================================================
 * DELETE /notifications/:id                - Xóa 1 thông báo
 * DELETE /notifications                    - Xóa nhiều thông báo
 *        Body: { ids: string[] }
 * DELETE /notifications/clear-all          - Xóa toàn bộ thông báo đã đọc
 *
 * === NOTIFICATION PREFERENCES =================================================
 * GET    /notifications/preferences        - Lấy cài đặt thông báo của user hiện tại
 *        Returns: { email: boolean, inApp: boolean, types: Record<NotificationType, boolean> }
 * PUT    /notifications/preferences        - Cập nhật cài đặt thông báo
 *        Body: { email?, inApp?, pushEnabled?, types?: Record<NotificationType, boolean> }
 *
 * === PUSH / WEBSOCKET =========================================================
 * POST   /notifications/push/register      - Đăng ký Push Notification token
 *        Body: { token, platform: 'web'|'ios'|'android' }
 * DELETE /notifications/push/unregister    - Hủy đăng ký Push Notification token
 *        Body: { token }
 * GET    /notifications/ws-token           - Lấy token để kết nối WebSocket notification
 *        Returns: { token, wsUrl }
 *
 * === LOẠI THÔNG BÁO (server tự tạo) ==========================================
 * Mỗi event sau sẽ tự động sinh notification phía server:
 * - TASK_ASSIGNED          : Được giao task mới
 * - TASK_DUE_SOON          : Task sắp đến hạn (24h, 48h trước)
 * - TASK_OVERDUE           : Task đã quá hạn
 * - DEVIATION_ASSIGNED     : Được giao điều tra deviation
 * - CAPA_ASSIGNED          : Được giao thực hiện CAPA
 * - DOCUMENT_FOR_REVIEW    : Có tài liệu cần review/approve
 * - DOCUMENT_APPROVED      : Tài liệu được phê duyệt
 * - DOCUMENT_REJECTED      : Tài liệu bị từ chối
 * - COMPLAINT_ESCALATED    : Complaint bị escalate
 * - CALIBRATION_DUE        : Thiết bị sắp hết hạn hiệu chuẩn
 * - TRAINING_OVERDUE       : Training quá hạn
 * - SUPPLIER_AUDIT_DUE     : Nhà cung cấp sắp đến hạn kiểm tra
 * - REGULATORY_DEADLINE    : Deadline nộp hồ sơ regulatory
 * - RISK_ESCALATED         : Rủi ro bị escalate lên level cao
 * - SYSTEM                 : Thông báo hệ thống (maintenance, update)
 */

import { api } from './client';
import type { PaginatedResponse } from '@/types';

const ENDPOINT = '/notifications';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  priority: 'Low' | 'Normal' | 'High' | 'Critical';
  relatedModule?: string;
  relatedEntityId?: string;
  relatedEntityUrl?: string;
  createdAt: string;
  readAt?: string;
}

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: string;
  priority?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const notificationApi = {
  /** GET /notifications — paginated list cho user hiện tại */
  getNotifications: async (params?: GetNotificationsParams) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') query.set(k, String(v));
      });
    }
    const response = await api.get<PaginatedResponse<Notification>>(`${ENDPOINT}?${query}`);
    return response.data;
  },

  /** GET /notifications/unread-count — dùng để hiển thị badge số thông báo */
  getUnreadCount: async () => {
    const response = await api.get<{ count: number }>(`${ENDPOINT}/unread-count`);
    return response.data;
  },

  /** GET /notifications/:id */
  getNotificationById: async (id: string) => {
    const response = await api.get<Notification>(`${ENDPOINT}/${id}`);
    return response.data;
  },

  // ─── Đọc ──────────────────────────────────────────────────────────────────────

  /** PUT /notifications/:id/read */
  markAsRead: async (id: string) => {
    const response = await api.put<Notification>(`${ENDPOINT}/${id}/read`);
    return response.data;
  },

  /** PUT /notifications/read-all */
  markAllAsRead: async () => {
    const response = await api.put(`${ENDPOINT}/read-all`);
    return response.data;
  },

  /** PUT /notifications/read — đánh dấu nhóm */
  markGroupAsRead: async (ids: string[]) => {
    const response = await api.put(`${ENDPOINT}/read`, { ids });
    return response.data;
  },

  // ─── Xóa ──────────────────────────────────────────────────────────────────────

  /** DELETE /notifications/:id */
  deleteNotification: async (id: string) => {
    const response = await api.delete(`${ENDPOINT}/${id}`);
    return response.data;
  },

  /** DELETE /notifications — xóa nhiều */
  deleteNotifications: async (ids: string[]) => {
    const response = await api.delete(ENDPOINT, { data: { ids } });
    return response.data;
  },

  /** DELETE /notifications/clear-all — xóa toàn bộ đã đọc */
  clearAllRead: async () => {
    const response = await api.delete(`${ENDPOINT}/clear-all`);
    return response.data;
  },

  // ─── Preferences ──────────────────────────────────────────────────────────────

  /** GET /notifications/preferences */
  getPreferences: async () => {
    const response = await api.get<{
      email: boolean;
      inApp: boolean;
      pushEnabled: boolean;
      byType: Record<string, boolean>;
    }>(`${ENDPOINT}/preferences`);
    return response.data;
  },

  /** PUT /notifications/preferences */
  updatePreferences: async (prefs: {
    email?: boolean;
    inApp?: boolean;
    pushEnabled?: boolean;
    byType?: Record<string, boolean>;
  }) => {
    const response = await api.put(`${ENDPOINT}/preferences`, prefs);
    return response.data;
  },
};
