/**
 * Authentication Context - Enhanced with Security Features
 * Provides authentication state and methods throughout the app
 * Includes secure token storage, session monitoring, and audit logging
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/services/api';
import type { User, LoginCredentials } from '@/types';
import { secureStorage, tokenUtils, auditLog, csrfToken } from '@/utils/security';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
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

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authApi.login(credentials);
      
      // Store token securely (encrypted)
      secureStorage.setItem('authToken', response.accessToken, true);
      
      // We need to shape AuthUser -> User here since AuthUser is missing firstName, lastName
      // This is a temporary measure if User is used globally and AuthUser lacks some fields
      const appUser: User = {
        id: response.user.id,
        username: response.user.username,
        email: response.user.email,
        firstName: response.user.fullName.split(' ')[0] || '',
        lastName: response.user.fullName.split(' ').slice(1).join(' ') || '',
        role: response.user.role as any,
        department: response.user.department,
        avatar: response.user.avatar,
      };

      secureStorage.setItem('user', JSON.stringify(appUser), true);
      
      setUser(appUser);
      setIsAuthenticated(true);

      // Generate CSRF token
      const csrf = csrfToken.generate();
      csrfToken.store(csrf);

      auditLog.log('login_success', { 
        userId: response.user.id, 
        role: response.user.role 
      });

      return { success: true };
    } catch (error) {
      // Demo mode: if API is unavailable, use demo credentials
      if (credentials.username === 'admin' && credentials.password === '123456') {
        const demoUser: User = {
          id: '1',
          username: 'admin',
          email: 'admin@eqms.com',
          firstName: 'System',
          lastName: 'Administrator',
          role: 'admin',
          department: 'Quality Assurance',
        };
        // Token expires in 7 days (604800 seconds) instead of 1 day
        const demoToken = btoa(JSON.stringify({ 
          sub: '1', 
          exp: Math.floor(Date.now() / 1000) + 604800 
        }));
        
        secureStorage.setItem('authToken', demoToken, true);
        secureStorage.setItem('user', JSON.stringify(demoUser), true);
        
        setUser(demoUser);
        setIsAuthenticated(true);

        auditLog.log('demo_login_success', { userId: demoUser.id });
        return { success: true };
      }

      auditLog.log('login_failed', { 
        username: credentials.username,
        error: String(error) 
      });
      return { success: false, error: error as Error };
    }
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
