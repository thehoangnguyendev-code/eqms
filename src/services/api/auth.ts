/**
 * Authentication API Service
 * FDA 21 CFR Part 11 / EU-GMP Annex 11 compliant e-signature & session management
 *
 * Endpoint base: /api/auth
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * === AUTHENTICATION ===========================================================
 * POST   /auth/login                       - Đăng nhập
 *        Body: { username, password }
 *        Returns: { user: User, accessToken, refreshToken, expiresIn }
 *        Note: Nếu account bị khóa → 423 Locked. Nếu cần 2FA → 202 + { mfaRequired, mfaToken }
 *
 * POST   /auth/logout                      - Đăng xuất (thu hồi refresh token phía server)
 *        Body: { refreshToken }
 *
 * POST   /auth/refresh                     - Làm mới access token
 *        Body: { refreshToken }
 *        Returns: { accessToken, refreshToken, expiresIn }
 *
 * === MULTI-FACTOR AUTH (MFA / 2FA) ============================================
 * POST   /auth/mfa/verify                  - Xác minh OTP (sau khi login trả về 202)
 *        Body: { mfaToken, otp }
 *        Returns: { user: User, accessToken, refreshToken }
 *
 * POST   /auth/mfa/setup                   - Thiết lập MFA (TOTP / SMS)
 *        Returns: { secret, qrCodeUrl }
 *
 * POST   /auth/mfa/enable                  - Xác nhận và kích hoạt MFA
 *        Body: { otp }
 *
 * POST   /auth/mfa/disable                 - Tắt MFA
 *        Body: { password }
 *
 * === PROFILE & ACCOUNT =========================================================
 * GET    /auth/me                          - Lấy thông tin người dùng hiện tại
 *        Returns: User (với permissions)
 *
 * PUT    /auth/me/profile                  - Cập nhật profile của user hiện tại
 *        Body: { fullName?, phone?, avatar? }
 *
 * POST   /auth/me/avatar/upload            - Upload avatar
 *        Body: FormData { file }
 *
 * POST   /auth/me/change-password          - Đổi mật khẩu
 *        Body: { currentPassword, newPassword, confirmPassword }
 *        Note: Kiểm tra password history (theo Password Policy)
 *
 * === E-SIGNATURE (21 CFR Part 11) =============================================
 * POST   /auth/verify-signature            - Xác minh e-signature (dùng cho approve/reject)
 *        Body: { username, password }
 *        Returns: { valid: boolean, userId, timestamp, signatureToken }
 *        Note: signatureToken dùng kèm với action API (ví dụ: approve document)
 *              Token hết hạn sau 5 phút và chỉ dùng được 1 lần.
 *
 * === SESSION MANAGEMENT =======================================================
 * GET    /auth/sessions                    - Danh sách các sessions đang hoạt động của user
 *        Returns: [{ sessionId, device, ipAddress, lastActivity, current: boolean }]
 *
 * DELETE /auth/sessions/:sessionId         - Thu hồi 1 session cụ thể (đăng xuất thiết bị khác)
 *
 * DELETE /auth/sessions                    - Thu hồi tất cả sessions khác (ngoài session hiện tại)
 *
 * === PASSWORD RESET (Quên mật khẩu) ==========================================
 * POST   /auth/forgot-password             - Yêu cầu đặt lại mật khẩu
 *        Body: { email }
 *        Returns: 200 (không tiết lộ email tồn tại hay không)
 *
 * POST   /auth/reset-password              - Đặt lại mật khẩu với token
 *        Body: { token, newPassword, confirmPassword }
 *
 * GET    /auth/reset-password/validate-token - Kiểm tra token còn hợp lệ
 *        Params: token
 *        Returns: { valid: boolean, expiresAt? }
 *
 * === INVITATION ==============================================================
 * POST   /auth/accept-invitation           - Chấp nhận lời mời và đặt mật khẩu lần đầu
 *        Body: { invitationToken, newPassword, confirmPassword }
 *
 * === SECURITY EVENTS ==========================================================
 * Server tự ghi audit trail cho các sự kiện sau:
 * - Login thành công / thất bại
 * - Đăng xuất
 * - Thay đổi mật khẩu
 * - MFA setup/enable/disable
 * - E-signature verification
 * - Session revocation
 */

import { api as apiClient } from './client';
import { secureStorage } from '@/utils/security';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
  department?: string;
  permissions: string[];
  avatar?: string;
  requirePasswordChange?: boolean;
  mfaEnabled?: boolean;
}

export const authApi = {
  /** POST /auth/login */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    // Lưu tokens vào secure storage
    secureStorage.setItem('accessToken', response.data.accessToken);
    secureStorage.setItem('refreshToken', response.data.refreshToken);
    return response.data;
  },

  /** POST /auth/logout */
  logout: async (): Promise<void> => {
    const refreshToken = secureStorage.getItem('refreshToken');
    try {
      await apiClient.post('/auth/logout', { refreshToken });
    } finally {
      secureStorage.removeItem('accessToken');
      secureStorage.removeItem('refreshToken');
    }
  },

  /** POST /auth/refresh */
  refreshToken: async (): Promise<{ accessToken: string; refreshToken: string }> => {
    const refreshToken = secureStorage.getItem('refreshToken');
    const response = await apiClient.post<{ accessToken: string; refreshToken: string; expiresIn: number }>(
      '/auth/refresh',
      { refreshToken }
    );
    secureStorage.setItem('accessToken', response.data.accessToken);
    secureStorage.setItem('refreshToken', response.data.refreshToken);
    return response.data;
  },

  /** GET /auth/me */
  getCurrentUser: async (): Promise<AuthUser> => {
    const response = await apiClient.get<AuthUser>('/auth/me');
    return response.data;
  },

  /** PUT /auth/me/profile */
  updateProfile: async (data: { fullName?: string; phone?: string }): Promise<AuthUser> => {
    const response = await apiClient.put<AuthUser>('/auth/me/profile', data);
    return response.data;
  },

  /** POST /auth/me/change-password */
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<void> => {
    await apiClient.post('/auth/me/change-password', data);
  },

  // ─── E-Signature (21 CFR Part 11) ────────────────────────────────────────────

  /** POST /auth/verify-signature — xác minh e-signature */
  verifyESignature: async (credentials: {
    username: string;
    password: string;
  }): Promise<{ valid: boolean; signatureToken: string; timestamp: string }> => {
    const response = await apiClient.post<{
      valid: boolean;
      signatureToken: string;
      timestamp: string;
    }>('/auth/verify-signature', credentials);
    return response.data;
  },

  // ─── MFA ──────────────────────────────────────────────────────────────────────

  /** POST /auth/mfa/verify */
  verifyMFA: async (data: { mfaToken: string; otp: string }): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/mfa/verify', data);
    secureStorage.setItem('accessToken', response.data.accessToken);
    secureStorage.setItem('refreshToken', response.data.refreshToken);
    return response.data;
  },

  /** POST /auth/mfa/setup */
  setupMFA: async (): Promise<{ secret: string; qrCodeUrl: string }> => {
    const response = await apiClient.post<{ secret: string; qrCodeUrl: string }>('/auth/mfa/setup');
    return response.data;
  },

  /** POST /auth/mfa/enable */
  enableMFA: async (otp: string): Promise<void> => {
    await apiClient.post('/auth/mfa/enable', { otp });
  },

  // ─── Password Reset ───────────────────────────────────────────────────────────

  /** POST /auth/forgot-password */
  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post('/auth/forgot-password', { email });
  },

  /** POST /auth/reset-password */
  resetPassword: async (data: {
    token: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<void> => {
    await apiClient.post('/auth/reset-password', data);
  },

  // ─── Sessions ─────────────────────────────────────────────────────────────────

  /** GET /auth/sessions */
  getSessions: async (): Promise<
    {
      sessionId: string;
      device: string;
      ipAddress: string;
      lastActivity: string;
      current: boolean;
    }[]
  > => {
    const response = await apiClient.get('/auth/sessions');
    return response.data;
  },

  /** DELETE /auth/sessions — thu hồi tất cả sessions khác */
  revokeOtherSessions: async (): Promise<void> => {
    await apiClient.delete('/auth/sessions');
  },
};
