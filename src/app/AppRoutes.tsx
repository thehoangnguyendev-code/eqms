import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

// Layout
import { MainLayout } from '@/components/layout/main-layout';

// Auth Guard
import { ProtectedRoute } from '@/middleware/ProtectedRoute';

// Auth Context
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/services/api';
import type { LoginChallengeResponse } from '@/services/api/auth';

// Route Constants
import { ROUTES } from './routes.constants';

// Features - Auth (eager load for login page)
import { LoginView, ForgotPasswordView, TwoFactorView } from '@/features/auth';
import { UnderConstruction } from './UnderConstruction';

// Loading & Domain Routes
import { LoadingFallback } from './routes/LoadingFallback';
import { documentRoutes } from './routes/DocumentRoutes';
import { trainingRoutes } from './routes/TrainingRoutes';
import { settingsRoutes } from './routes/SettingsRoutes';
import { qualityRoutes } from './routes/QualityRoutes';

// ==================== CORE VIEWS ====================
const DashboardView = lazy(() => import('@/features/dashboard').then(m => ({ default: m.DashboardView })));
const MyTasksView = lazy(() => import('@/features/my-tasks').then(m => ({ default: m.MyTasksView })));
const MyTeamView = lazy(() => import('@/features/my-team/MyTeamView').then(m => ({ default: m.MyTeamView })));
const NotificationsView = lazy(() => import('@/features/notifications').then(m => ({ default: m.NotificationsView })));

// ==================== MAIN ROUTES ====================

export const AppRoutes: React.FC = () => {
  const MFA_CHALLENGE_STORAGE_KEY = 'pending_mfa_challenge';

  const persistChallenge = (challenge: LoginChallengeResponse) => {
    sessionStorage.setItem(
      MFA_CHALLENGE_STORAGE_KEY,
      JSON.stringify({
        challenge,
        persistedAt: Date.now(),
      })
    );
  };

  const clearPersistedChallenge = () => {
    sessionStorage.removeItem(MFA_CHALLENGE_STORAGE_KEY);
  };

  const navigate = useNavigate();
  const { initiateLogin, verifyMFA } = useAuth();
  const [pendingChallenge, setPendingChallenge] = useState<LoginChallengeResponse | null>(null);
  const [isChallengeHydrated, setIsChallengeHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(MFA_CHALLENGE_STORAGE_KEY);
      if (!raw) {
        setIsChallengeHydrated(true);
        return;
      }

      const parsed = JSON.parse(raw) as {
        challenge?: LoginChallengeResponse;
        persistedAt?: number;
      };

      if (!parsed.challenge || typeof parsed.persistedAt !== 'number') {
        clearPersistedChallenge();
        setIsChallengeHydrated(true);
        return;
      }

      const ageSeconds = Math.floor((Date.now() - parsed.persistedAt) / 1000);
      const isExpired = ageSeconds >= parsed.challenge.expiresIn;
      if (isExpired) {
        clearPersistedChallenge();
        setIsChallengeHydrated(true);
        return;
      }

      setPendingChallenge(parsed.challenge);
    } catch {
      clearPersistedChallenge();
    } finally {
      setIsChallengeHydrated(true);
    }
  }, []);

  const handleLogin = async (
    username: string,
    password: string,
    rememberMe: boolean
  ): Promise<{ success: boolean; error?: string }> => {
    const result = await initiateLogin({ username, password });

    if (!result.success) {
      return {
        success: false,
        error: result.error?.message || 'Unable to sign in. Please try again.',
      };
    }

    if (result.mfaRequired && result.challenge) {
      setPendingChallenge(result.challenge);
      persistChallenge(result.challenge);
      navigate(ROUTES.TWO_FACTOR);
      return { success: true };
    }

    navigate(ROUTES.DASHBOARD);
    return { success: true };
  };

  const handleVerify2FA = async ({
    code,
    method,
    rememberDevice,
  }: {
    code: string;
    method: 'email' | 'app';
    rememberDevice: boolean;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!pendingChallenge?.mfaToken) {
      navigate(ROUTES.LOGIN);
      return {
        success: false,
        error: 'Login session has expired. Please sign in again.',
      };
    }

    const result = await verifyMFA({
      mfaToken: pendingChallenge.mfaToken,
      otp: code,
      method,
      rememberDevice,
    });

    if (result.success) {
      setPendingChallenge(null);
      clearPersistedChallenge();
      navigate(ROUTES.DASHBOARD);
      return { success: true };
    }

    return {
      success: false,
      error: result.error?.message || 'Verification failed. Please try again.',
    };
  };

  const handleResend2FA = async (): Promise<{ success: boolean; error?: string }> => {
    if (!pendingChallenge?.mfaToken) {
      return {
        success: false,
        error: 'Login session has expired. Please sign in again.',
      };
    }

    try {
      await authApi.sendEmailOtp({ mfaToken: pendingChallenge.mfaToken });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unable to resend code right now.',
      };
    }
  };

  const handleForgotPassword = () => {
    navigate(ROUTES.FORGOT_PASSWORD);
  };

  const handleBackToLogin = () => {
    setPendingChallenge(null);
    clearPersistedChallenge();
    navigate(ROUTES.LOGIN);
  };

  const handlePasswordResetRequest = (email: string, reason: string) => {
    // TODO: Implement API call to send request to admin
  };

  return (
    <Routes>
      {/* ==================== PUBLIC ROUTES ==================== */}
      <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
      <Route path={ROUTES.LOGIN} element={<LoginView onLogin={handleLogin} onForgotPassword={handleForgotPassword} />} />
      <Route
        path={ROUTES.TWO_FACTOR}
        element={
          !isChallengeHydrated ? (
            <LoadingFallback />
          ) : pendingChallenge ? (
            <TwoFactorView
              onVerify={handleVerify2FA}
              onResend={handleResend2FA}
              onBackToLogin={handleBackToLogin}
              username={pendingChallenge.username}
              email={pendingChallenge.maskedEmail}
              availableMethods={pendingChallenge.availableMethods}
            />
          ) : (
            <Navigate to={ROUTES.LOGIN} replace />
          )
        }
      />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordView onBackToLogin={handleBackToLogin} onRequestSubmit={handlePasswordResetRequest} />} />

      {/* ==================== PROTECTED ROUTES (WITH LAYOUT) ==================== */}
      <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>

        {/* ===== CORE ===== */}
        <Route path="dashboard" element={<Suspense fallback={<LoadingFallback />}><DashboardView /></Suspense>} />
        <Route path="my-tasks" element={<Suspense fallback={<LoadingFallback />}><MyTasksView /></Suspense>} />
        <Route path="my-team" element={<Suspense fallback={<LoadingFallback />}><MyTeamView /></Suspense>} />
        <Route path="notifications" element={<Suspense fallback={<LoadingFallback />}><NotificationsView /></Suspense>} />

        {/* ===== DOMAIN MODULES ===== */}
        {documentRoutes(navigate)}
        {trainingRoutes()}
        {settingsRoutes(navigate)}
        {qualityRoutes()}

        {/* ===== FALLBACK ===== */}
        <Route path="*" element={<UnderConstruction />} />
      </Route>
    </Routes>
  );
};

