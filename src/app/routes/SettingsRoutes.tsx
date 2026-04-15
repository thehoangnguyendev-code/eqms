import React, { Suspense, lazy } from 'react';
import { Route, Navigate } from 'react-router-dom';
import { NavigateFunction } from 'react-router-dom';
import { LoadingFallback } from './LoadingFallback';

// ==================== LAZY LOADED ====================
const ProfileView = lazy(() => import('@/features/settings').then(m => ({ default: m.ProfileView })));
const UserManagementView = lazy(() => import('@/features/settings').then(m => ({ default: m.UserManagementView })));
const AddUserView = lazy(() => import('@/features/settings').then(m => ({ default: m.AddUserView })));
const UserProfileView = lazy(() => import('@/features/settings').then(m => ({ default: m.UserProfileView })));
const DictionariesView = lazy(() => import('@/features/settings').then(m => ({ default: m.DictionariesView })));
const SystemInformationView = lazy(() => import('@/features/settings').then(m => ({ default: m.SystemInformationView })));
const ConfigurationView = lazy(() => import('@/features/settings').then(m => ({ default: m.ConfigurationView })));
const EmailTemplatesView = lazy(() => import('@/features/settings').then(m => ({ default: m.EmailTemplatesView })));
const EmailTemplateCreateView = lazy(() => import('@/features/settings').then(m => ({ default: m.EmailTemplateCreateView })));
const EmailTemplateEditView = lazy(() => import('@/features/settings').then(m => ({ default: m.EmailTemplateEditView })));
const EmailTemplatePreviewView = lazy(() => import('@/features/settings').then(m => ({ default: m.EmailTemplatePreviewView })));
const UserManualView = lazy(() => import('@/features/user-manual').then(m => ({ default: m.UserManualView })));
const RoleListView = lazy(() => import('@/features/settings/role-permission').then(m => ({ default: m.RoleListView })));
const RoleDetailView = lazy(() => import('@/features/settings/role-permission').then(m => ({ default: m.RoleDetailView })));
const HelpSupportView = lazy(() => import('@/features/help-support').then(m => ({ default: m.HelpSupportView })));
const PreferencesView = lazy(() => import('@/features/preferences').then(m => ({ default: m.PreferencesView })));

// ==================== SETTINGS ROUTES ====================
export function settingsRoutes(navigate: NavigateFunction) {
  return (
    <>
      {/* ===== SETTINGS ===== */}
      <Route path="settings">
        <Route path="users">
          <Route index element={<Suspense fallback={<LoadingFallback />}><UserManagementView /></Suspense>} />
          <Route path="add" element={<Suspense fallback={<LoadingFallback />}><AddUserView /></Suspense>} />
          <Route path="profile/:userId" element={<Suspense fallback={<LoadingFallback />}><UserProfileView /></Suspense>} />
        </Route>
        <Route path="roles">
          <Route index element={<Suspense fallback={<LoadingFallback />}><RoleListView /></Suspense>} />
          <Route path="new" element={<Suspense fallback={<LoadingFallback />}><RoleDetailView /></Suspense>} />
          <Route path=":id/edit" element={<Suspense fallback={<LoadingFallback />}><RoleDetailView /></Suspense>} />
          <Route path=":id" element={<Suspense fallback={<LoadingFallback />}><RoleDetailView /></Suspense>} />
        </Route>
        <Route path="dictionaries" element={<Suspense fallback={<LoadingFallback />}><DictionariesView /></Suspense>} />
        <Route path="configuration" element={<Suspense fallback={<LoadingFallback />}><ConfigurationView /></Suspense>} />
        <Route path="system-info" element={<Suspense fallback={<LoadingFallback />}><SystemInformationView /></Suspense>} />
        <Route path="email-templates">
          <Route index element={<Suspense fallback={<LoadingFallback />}><EmailTemplatesView /></Suspense>} />
          <Route path="new" element={<Suspense fallback={<LoadingFallback />}><EmailTemplateCreateView /></Suspense>} />
          <Route path="edit/:id" element={<Suspense fallback={<LoadingFallback />}><EmailTemplateEditView /></Suspense>} />
          <Route path="preview" element={<Suspense fallback={<LoadingFallback />}><EmailTemplatePreviewView /></Suspense>} />
        </Route>
      </Route>

      {/* ===== HELP & SUPPORT ===== */}
      <Route path="help-support">
        <Route index element={<Navigate to="manual" replace />} />
        <Route path="manual" element={<Suspense fallback={<LoadingFallback />}><UserManualView /></Suspense>} />
        <Route path="contact" element={<Suspense fallback={<LoadingFallback />}><HelpSupportView /></Suspense>} />
      </Route>

      {/* ===== PREFERENCES ===== */}
      <Route path="preferences" element={<Suspense fallback={<LoadingFallback />}><PreferencesView /></Suspense>} />

      {/* ===== PROFILE ===== */}
      <Route path="profile" element={<Suspense fallback={<LoadingFallback />}><ProfileView onBack={() => navigate(-1)} /></Suspense>} />
    </>
  );
}
