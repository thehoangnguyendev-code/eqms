/**
 * Task Management API Service
 * Workflow task management for EQMS — tracks all pending actions across modules
 *
 * Endpoint base: /api/tasks
 * ─────────────────────────────────────────────────────────────────────────────
 * Tasks là các hành động cần thực hiện được tự động tạo ra khi có workflow event:
 * - Document needs review/approval
 * - CAPA needs to be implemented/verified
 * - Deviation needs investigation
 * - Training assignment due
 * - Equipment calibration due
 * - Regulatory submission deadline
 * v.v.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * === DANH SÁCH & FILTER =======================================================
 * GET    /tasks                            - Tất cả tasks trong hệ thống (Admin view)
 *        Params: page, limit, status, type, priority, assignedTo, module,
 *                dateFrom (created), dateTo (created), dueDateFrom, dueDateTo
 *
 * GET    /tasks/my-tasks                   - Tasks được giao cho user hiện tại
 *        Params: page, limit, status: 'Pending'|'InProgress'|'Completed'|'Overdue',
 *                type, priority, module, dueDateFrom, dueDateTo
 *
 * === METADATA & FILTERS =======================================================
 * GET    /tasks/filters                    - Lấy dữ liệu cho các dropdown bộ lọc task
 *        Returns: {
 *          types: [{label, value}],
 *          priorities: [{label, value}],
 *          statuses: [{label, value}],
 *          modules: [{label, value}]
 *        }
 *
 * GET    /tasks/:id                        - Chi tiết 1 task
 *
 * === TẠO THỦ CÔNG =============================================================
 * POST   /tasks                            - Tạo task thủ công (không qua workflow)
 *        Body: { title, description, type, priority: 'Low'|'Normal'|'High'|'Critical',
 *                assignedTo: string[], dueDate, module?, relatedEntityId?,
 *                relatedEntityUrl? }
 * PUT    /tasks/:id                        - Cập nhật task
 *        Body: { title?, description?, priority?, dueDate?, assignedTo? }
 * DELETE /tasks/:id                        - Xóa task (chỉ khi Pending và tạo thủ công)
 *
 * === STATUS MANAGEMENT ========================================================
 * PATCH  /tasks/:id/status                 - Cập nhật trạng thái task
 *        Body: { status: 'InProgress'|'Completed'|'Cancelled', comment? }
 *        Note: Một số task yêu cầu e-signature khi Complete
 *              (ví dụ: CAPA Implementation Completed)
 *
 * POST   /tasks/:id/complete               - Hoàn thành task (với e-signature nếu cần)
 *        Body: { comment?, eSignature?: { username, password } }
 *
 * POST   /tasks/:id/reject                 - Từ chối task / trả lại
 *        Body: { reason }
 *
 * === REASSIGNMENT =============================================================
 * POST   /tasks/:id/reassign               - Chuyển giao task cho người khác
 *        Body: { assignedTo: string[], reason? }
 *
 * POST   /tasks/:id/extend-due             - Gia hạn deadline
 *        Body: { newDueDate, reason }
 *
 * === DELEGATION ===============================================================
 * POST   /tasks/:id/delegate               - Ủy quyền task (giữ trách nhiệm, delegate thực hiện)
 *        Body: { delegatedTo, delegationNote }
 *
 * === COMMENT ==================================================================
 * GET    /tasks/:id/comments               - Danh sách comment/ghi chú
 * POST   /tasks/:id/comments               - Thêm comment
 *        Body: { comment }
 *
 * === ATTACHMENT ===============================================================
 * POST   /tasks/:id/attachments            - Upload bằng chứng hoàn thành task
 *        Body: FormData { file }
 * GET    /tasks/:id/attachments            - Danh sách file đính kèm
 *
 * === BATCH OPERATIONS =========================================================
 * POST   /tasks/batch/complete             - Hoàn thành nhiều tasks cùng lúc
 *        Body: { ids: string[], comment? }
 * POST   /tasks/batch/reassign             - Chuyển giao nhiều tasks
 *        Body: { ids: string[], assignedTo: string[], reason? }
 *
 * === STATS & OVERVIEW =========================================================
 * GET    /tasks/stats                      - Thống kê tasks
 *        Params: assignedTo?, module?
 *        Returns: { total, pending, inProgress, completed, overdue,
 *                   byModule: Record<string, number>,
 *                   byPriority: { low, normal, high, critical } }
 *
 * GET    /tasks/overdue                    - Danh sách tasks quá hạn
 *        Params: module?, assignedTo?
 *        Returns: Task[] sorted by overdue date
 */

import { api } from './client';
import type { PaginatedResponse } from '@/types';

const ENDPOINT = '/tasks';

export interface Task {
  id: string;
  title: string;
  description?: string;
  type: string;
  priority: 'Low' | 'Normal' | 'High' | 'Critical';
  status: 'Pending' | 'InProgress' | 'Completed' | 'Cancelled' | 'Overdue';
  assignedTo: string;
  assignedToName: string;
  module?: string;
  relatedEntityId?: string;
  relatedEntityUrl?: string;
  dueDate: string;
  createdAt: string;
  completedAt?: string;
  isAutoGenerated: boolean;
  requiresESignature?: boolean;
}

export interface GetTasksParams {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  priority?: string;
  assignedTo?: string;
  module?: string;
  dateFrom?: string;
  dateTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
}

export const taskApi = {
  /** GET /tasks — all tasks (Admin) */
  getAllTasks: async (params?: GetTasksParams) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') query.set(k, String(v));
      });
    }
    const response = await api.get<PaginatedResponse<Task>>(`${ENDPOINT}?${query}`);
    return response.data;
  },

  /** GET /tasks/my-tasks — tasks của user hiện tại */
  getMyTasks: async (params?: GetTasksParams) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') query.set(k, String(v));
      });
    }
    const response = await api.get<PaginatedResponse<Task>>(`${ENDPOINT}/my-tasks?${query}`);
    return response.data;
  },

  /** GET /tasks/:id */
  getTaskById: async (id: string) => {
    const response = await api.get<Task>(`${ENDPOINT}/${id}`);
    return response.data;
  },

  /** POST /tasks — tạo task thủ công */
  createTask: async (data: {
    title: string;
    description?: string;
    type?: string;
    priority: Task['priority'];
    assignedTo: string[];
    dueDate: string;
    module?: string;
    relatedEntityId?: string;
  }) => {
    const response = await api.post<Task>(ENDPOINT, data);
    return response.data;
  },

  /** PATCH /tasks/:id/status */
  updateStatus: async (
    id: string,
    data: { status: 'InProgress' | 'Completed' | 'Cancelled'; comment?: string }
  ) => {
    const response = await api.patch<Task>(`${ENDPOINT}/${id}/status`, data);
    return response.data;
  },

  /** POST /tasks/:id/complete */
  completeTask: async (
    id: string,
    data?: { comment?: string; eSignature?: { username: string; password: string } }
  ) => {
    const response = await api.post<Task>(`${ENDPOINT}/${id}/complete`, data);
    return response.data;
  },

  /** POST /tasks/:id/reassign */
  reassignTask: async (id: string, data: { assignedTo: string[]; reason?: string }) => {
    const response = await api.post<Task>(`${ENDPOINT}/${id}/reassign`, data);
    return response.data;
  },

  /** POST /tasks/:id/extend-due */
  extendDueDate: async (id: string, data: { newDueDate: string; reason: string }) => {
    const response = await api.post<Task>(`${ENDPOINT}/${id}/extend-due`, data);
    return response.data;
  },

  /** POST /tasks/:id/comments */
  addComment: async (id: string, comment: string) => {
    const response = await api.post(`${ENDPOINT}/${id}/comments`, { comment });
    return response.data;
  },

  /** GET /tasks/:id/comments */
  getComments: async (id: string) => {
    const response = await api.get(`${ENDPOINT}/${id}/comments`);
    return response.data;
  },

  /** GET /tasks/overdue */
  getOverdueTasks: async (params?: { module?: string; assignedTo?: string }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') query.set(k, String(v));
      });
    }
    const response = await api.get<Task[]>(`${ENDPOINT}/overdue?${query}`);
    return response.data;
  },

  /** GET /tasks/stats */
  getStats: async (params?: { assignedTo?: string; module?: string }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') query.set(k, String(v));
      });
    }
    const response = await api.get<{
      total: number;
      pending: number;
      inProgress: number;
      completed: number;
      overdue: number;
    }>(`${ENDPOINT}/stats?${query}`);
    return response.data;
  },
};
