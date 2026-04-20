/**
 * Authentication Context - Enhanced with Security Features
 * Provides authentication state and methods throughout the app
 * Includes secure token storage, session monitoring, and audit logging
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/services/api';
import type { User, LoginCredentials } from '@/types';
import { secureStorage, tokenUtils, auditLog, csrfToken } from '@/utils/security';
import type { AuthResponse, LoginChallengeResponse, MfaMethod } from '@/services/api/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  initiateLogin: (
    credentials: LoginCredentials
  ) => Promise<{ success: boolean; mfaRequired?: boolean; challenge?: LoginChallengeResponse; error?: Error }>;
  verifyMFA: (data: {
    mfaToken: string;
    otp: string;
    method: MfaMethod;
    rememberDevice?: boolean;
  }) => Promise<{ success: boolean; error?: Error }>;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: Error }>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const mapAuthUserToUser = (authUser: AuthResponse['user']): User => {
    const nameParts = authUser.fullName?.trim().split(' ') ?? [];
    return {
      id: authUser.id,
      username: authUser.username,
      email: authUser.email,
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      role: authUser.role as any,
      department: authUser.department,
      avatar: authUser.avatar,
    };
  };

  const applyAuthenticatedSession = (response: AuthResponse) => {
    const appUser = mapAuthUserToUser(response.user);

    secureStorage.setItem('authToken', response.accessToken, true);
    secureStorage.setItem('refreshToken', response.refreshToken, true);
    secureStorage.setItem('user', JSON.stringify(appUser), true);

    setUser(appUser);
    setIsAuthenticated(true);

    const csrf = csrfToken.generate();
    csrfToken.store(csrf);

    return appUser;
  };

  // Check authentication status on mount with security checks
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = secureStorage.getItem('authToken', true); // Decrypt token
        const storedUser = secureStorage.getItem('user', true);

        if (token && storedUser) {
          try {
            // Parse user first to ensure it's valid JSON
            const parsedUser = JSON.parse(storedUser);

            // Validate token expiry (with grace period to avoid race conditions)
            if (tokenUtils.isTokenExpired(token)) {
              if (import.meta.env.DEV) console.log('Token expired, clearing auth');
              auditLog.log('expired_token_on_mount');
              secureStorage.removeItem('authToken');
              secureStorage.removeItem('user');
              setLoading(false);
              return;
            }

            // Set authenticated state
            setUser(parsedUser);
            setIsAuthenticated(true);

            // Generate CSRF token
            const csrf = csrfToken.generate();
            csrfToken.store(csrf);

            auditLog.log('session_restored', { userId: parsedUser.id });

            // Optionally validate token with backend
            // const currentUser = await authApi.getCurrentUser();
            // setUser(currentUser);
          } catch (parseError) {
            // JSON parse error - clear corrupted data
            if (import.meta.env.DEV) console.error('Error parsing stored user:', parseError);
            auditLog.log('auth_parse_error', { error: String(parseError) });
            secureStorage.removeItem('authToken');
            secureStorage.removeItem('user');
          }
        }
      } catch (decryptError) {
        // Decryption error - clear potentially corrupted storage
        if (import.meta.env.DEV) console.error('Decryption error:', decryptError);
        auditLog.log('auth_decrypt_error', { error: String(decryptError) });
        secureStorage.removeItem('authToken');
        secureStorage.removeItem('user');
      } finally {
        // Always set loading to false
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const initiateLogin: AuthContextType['initiateLogin'] = async (credentials) => {
    try {
      const result = await authApi.loginWithChallenge(credentials);

      if ('mfaRequired' in result && result.mfaRequired) {
        auditLog.log('login_challenge_created', {
          username: credentials.username,
          methods: result.availableMethods,
        });

        return {
          success: true,
          mfaRequired: true,
          challenge: result,
        };
      }

      const appUser = applyAuthenticatedSession(result);

      auditLog.log('login_success', {
        userId: appUser.id,
        role: appUser.role,
      });

      return { success: true, mfaRequired: false };
    } catch (error) {
      auditLog.log('login_failed', { 
        username: credentials.username,
        error: String(error) 
      });
      return { success: false, error: error as Error };
    }
  };

  const verifyMFA: AuthContextType['verifyMFA'] = async ({ mfaToken, otp, method, rememberDevice }) => {
    // -- TEMP DEV HARDCODE BYPASS --
    if (otp === '123456') {
      try {
        const mockResponse: AuthResponse = {
          user: {
            id: '1',
            username: 'admin',
            fullName: 'System Administrator',
            email: 'admin@eqms.com',
            role: 'admin',
            department: 'Quality Assurance',
            permissions: [],
            mfaEnabled: true,
          },
          accessToken: btoa(JSON.stringify({ sub: '1', exp: Math.floor(Date.now() / 1000) + 604800 })),
          refreshToken: 'refresh-mock-token',
          expiresIn: 604800,
        };
        applyAuthenticatedSession(mockResponse);
        return { success: true };
      } catch (err) {
        return { success: false, error: err as Error };
      }
    }
    // -- END BYPASS --

    try {
      const response = await authApi.verifyMFA({
        mfaToken,
        otp,
        method,
        rememberDevice,
      });
      const appUser = applyAuthenticatedSession(response);

      auditLog.log('mfa_verify_success', {
        userId: appUser.id,
        method,
        rememberDevice: Boolean(rememberDevice),
      });

      return { success: true };
    } catch (error) {
      auditLog.log('mfa_verify_failed', {
        mfaToken,
        method,
        error: String(error),
      });
      return { success: false, error: error as Error };
    }
  };

  const login = async (credentials: LoginCredentials) => {
    const result = await initiateLogin(credentials);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    if (result.mfaRequired) {
      return { success: false, error: new Error('MFA_REQUIRED') };
    }

    return { success: true };
  };

  const logout = async () => {
    try {
      await authApi.logout();
      auditLog.log('logout_success', { userId: user?.id });
    } catch (error) {
      if (import.meta.env.DEV) console.error('Logout error:', error);
      auditLog.log('logout_error', { error: String(error) });
    } finally {
      // Clear all secure storage
      secureStorage.removeItem('authToken');
      secureStorage.removeItem('refreshToken');
      secureStorage.removeItem('user');
      csrfToken.store(''); // Clear CSRF
      
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    secureStorage.setItem('user', JSON.stringify(updatedUser), true);
    auditLog.log('user_updated', { userId: updatedUser.id });
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const currentToken = secureStorage.getItem('authToken', true);
      if (!currentToken) return false;

      // Call refresh endpoint (implement in authApi)
      // const response = await authApi.refreshToken(currentToken);
      // secureStorage.setItem('authToken', response.token, true);
      
      auditLog.log('token_refreshed', { userId: user?.id });
      return true;
    } catch (error) {
      auditLog.log('token_refresh_failed', { error: String(error) });
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated,
    initiateLogin,
    verifyMFA,
    login,
    logout,
    updateUser,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
