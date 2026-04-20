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
import { secureStorage, safeRandomUUID } from '@/utils/security';

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

export type MfaMethod = 'email' | 'app';

export interface LoginChallengeResponse {
  mfaRequired: true;
  mfaToken: string;
  availableMethods: MfaMethod[];
  maskedEmail?: string;
  username?: string;
  expiresIn: number;
}

export type LoginResult = AuthResponse | LoginChallengeResponse;

const isLoginChallengeResponse = (result: LoginResult): result is LoginChallengeResponse => {
  return 'mfaRequired' in result && result.mfaRequired === true;
};

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

interface MockMfaChallenge {
  username: string;
  email: string;
  otp: string;
  availableMethods: MfaMethod[];
  expiresAt: number;
}

const MOCK_CHALLENGE_TTL_SECONDS = 300;
const MOCK_MFA_EMAIL_OTP = '123456';
const MOCK_MFA_APP_OTP = '654321';
const mockChallenges = new Map<string, MockMfaChallenge>();

const maskEmail = (email: string): string => {
  const [name, domain] = email.split('@');
  if (!name || !domain) return email;
  if (name.length <= 2) {
    return `${name[0] ?? '*'}***@${domain}`;
  }
  return `${name.slice(0, 1)}***${name.slice(-1)}@${domain}`;
};

const toMockAuthResponse = (username: string): AuthResponse => {
  const normalizedUsername = username.trim() || 'admin';
  const nowSeconds = Math.floor(Date.now() / 1000);
  const tokenPayload = {
    sub: '1',
    exp: nowSeconds + 604800,
  };

  return {
    user: {
      id: '1',
      username: normalizedUsername,
      fullName: 'System Administrator',
      email: 'admin@eqms.com',
      role: 'admin',
      department: 'Quality Assurance',
      permissions: [],
      mfaEnabled: true,
    },
    accessToken: btoa(JSON.stringify(tokenPayload)),
    refreshToken: `refresh-${safeRandomUUID()}`,
    expiresIn: 604800,
  };
};

const createMockChallenge = (username: string): LoginChallengeResponse => {
  const mfaToken = safeRandomUUID();
  const expiresAt = Date.now() + MOCK_CHALLENGE_TTL_SECONDS * 1000;
  const email = 'admin@eqms.com';

  mockChallenges.set(mfaToken, {
    username,
    email,
    otp: MOCK_MFA_EMAIL_OTP,
    availableMethods: ['email', 'app'],
    expiresAt,
  });

  return {
    mfaRequired: true,
    mfaToken,
    availableMethods: ['email', 'app'],
    maskedEmail: maskEmail(email),
    username,
    expiresIn: MOCK_CHALLENGE_TTL_SECONDS,
  };
};

const isChallengeValid = (challenge: MockMfaChallenge | undefined): challenge is MockMfaChallenge => {
  return Boolean(challenge && challenge.expiresAt > Date.now());
};

export const authApi = {
  /** POST /auth/login (front-end-first: returns auth success or MFA challenge) */
  loginWithChallenge: async (credentials: LoginCredentials): Promise<LoginResult> => {
    try {
      const response = await apiClient.post<LoginResult>('/auth/login', credentials);
      const data = response.data;

      if (isLoginChallengeResponse(data)) {
        return data;
      }

      secureStorage.setItem('authToken', data.accessToken, true);
      secureStorage.setItem('refreshToken', data.refreshToken, true);
      return data;
    } catch (error) {
      // Demo fallback to unblock UI/UX development before backend is ready.
      if (credentials.username === 'admin' && credentials.password === '123456') {
        return createMockChallenge(credentials.username);
      }
      throw error;
    }
  },

  /** POST /auth/login */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const result = await authApi.loginWithChallenge(credentials);
    if (isLoginChallengeResponse(result)) {
      throw new Error('MFA_REQUIRED');
    }
    return result;
  },

  /** POST /auth/logout */
  logout: async (): Promise<void> => {
    const refreshToken = secureStorage.getItem('refreshToken', true);
    try {
      await apiClient.post('/auth/logout', { refreshToken });
    } finally {
      secureStorage.removeItem('authToken');
      secureStorage.removeItem('refreshToken');
    }
  },

  /** POST /auth/refresh */
  refreshToken: async (): Promise<{ accessToken: string; refreshToken: string }> => {
    const refreshToken = secureStorage.getItem('refreshToken', true);
    const response = await apiClient.post<{ accessToken: string; refreshToken: string; expiresIn: number }>(
      '/auth/refresh',
      { refreshToken }
    );
    secureStorage.setItem('authToken', response.data.accessToken, true);
    secureStorage.setItem('refreshToken', response.data.refreshToken, true);
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

  /** POST /auth/mfa/send-email-otp */
  sendEmailOtp: async (data: { mfaToken: string }): Promise<{ expiresIn: number; cooldownSeconds: number }> => {
    try {
      const response = await apiClient.post<{ expiresIn: number; cooldownSeconds: number }>(
        '/auth/mfa/send-email-otp',
        data
      );
      return response.data;
    } catch {
      const challenge = mockChallenges.get(data.mfaToken);
      if (!isChallengeValid(challenge)) {
        throw new Error('MFA_CHALLENGE_EXPIRED');
      }

      challenge.otp = MOCK_MFA_EMAIL_OTP;
      mockChallenges.set(data.mfaToken, challenge);

      return {
        expiresIn: Math.max(Math.floor((challenge.expiresAt - Date.now()) / 1000), 0),
        cooldownSeconds: 60,
      };
    }
  },

  /** POST /auth/mfa/verify */
  verifyMFA: async (data: {
    mfaToken: string;
    otp: string;
    method: MfaMethod;
    rememberDevice?: boolean;
  }): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/mfa/verify', data);
      secureStorage.setItem('authToken', response.data.accessToken, true);
      secureStorage.setItem('refreshToken', response.data.refreshToken, true);
      return response.data;
    } catch {
      const challenge = mockChallenges.get(data.mfaToken);
      if (!isChallengeValid(challenge)) {
        throw new Error('MFA_CHALLENGE_EXPIRED');
      }

      const expectedOtp = data.method === 'app' ? MOCK_MFA_APP_OTP : challenge.otp;
      if (data.otp !== expectedOtp) {
        throw new Error('MFA_INVALID_CODE');
      }

      mockChallenges.delete(data.mfaToken);
      const authResponse = toMockAuthResponse(challenge.username);
      secureStorage.setItem('authToken', authResponse.accessToken, true);
      secureStorage.setItem('refreshToken', authResponse.refreshToken, true);
      return authResponse;
    }
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
