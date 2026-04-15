import React, { Suspense, lazy, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

// Layout
import { MainLayout } from '@/components/layout/main-layout';

// Auth Guard
import { ProtectedRoute } from '@/middleware/ProtectedRoute';

// Auth Context
import { useAuth } from '@/contexts/AuthContext';

// Route Constants
import { ROUTES } from './routes.constants';

// Features - Auth (eager load for login page)
import { LoginView, ForgotPasswordView, ContactAdminView, TwoFactorView } from '@/features/auth';
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

interface AccountRequestPayload {
  fullName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
}

export const AppRoutes: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [pendingCredentials, setPendingCredentials] = useState<{ username: string, password: string, rememberMe: boolean } | null>(null);

  const handleLogin = async (username: string, password: string, rememberMe: boolean) => {
    // Stage 1: Store credentials and move to 2FA
    setPendingCredentials({ username, password, rememberMe });
    navigate(ROUTES.TWO_FACTOR);
  };

  const handleVerify2FA = async (code: string) => {
    if (!pendingCredentials) {
      navigate(ROUTES.LOGIN);
      return;
    }

    try {
      // Stage 2: Verification success, perform actual login
      await login({
        username: pendingCredentials.username,
        password: pendingCredentials.password
      });
      setPendingCredentials(null);
      navigate(ROUTES.DASHBOARD);
    } catch (error) {
      console.error("2FA Login failed:", error);
    }
  };

  const handleForgotPassword = () => {
    navigate(ROUTES.FORGOT_PASSWORD);
  };

  const handleBackToLogin = () => {
    navigate(ROUTES.LOGIN);
  };

  const handlePasswordResetRequest = (email: string, reason: string) => {
    // TODO: Implement API call to send request to admin
  };

  const handleContactAdmin = () => {
    navigate(ROUTES.CONTACT_ADMIN);
  };

  const handleAccountRequest = (_data: AccountRequestPayload) => {
    // TODO: Implement API call to send request to admin
  };

  return (
    <Routes>
      {/* ==================== PUBLIC ROUTES ==================== */}
      <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
      <Route path={ROUTES.LOGIN} element={<LoginView onLogin={handleLogin} onForgotPassword={handleForgotPassword} onContactAdmin={handleContactAdmin} />} />
      <Route path={ROUTES.TWO_FACTOR} element={<TwoFactorView onVerify={handleVerify2FA} onBackToLogin={handleBackToLogin} username={pendingCredentials?.username} />} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordView onBackToLogin={handleBackToLogin} onRequestSubmit={handlePasswordResetRequest} />} />
      <Route path={ROUTES.CONTACT_ADMIN} element={<ContactAdminView onBackToLogin={handleBackToLogin} onRequestSubmit={handleAccountRequest} />} />

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

