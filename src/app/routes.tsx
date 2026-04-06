import React, { Suspense, lazy, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';

// Layout
import { MainLayout } from '@/components/layout/main-layout';

// Auth Guard
import { ProtectedRoute } from '@/middleware/ProtectedRoute';

// Auth Context
import { useAuth } from '@/contexts/AuthContext';

// Route Constants
import { ROUTES } from './routes.constants';

// Loading Component
import { Loading } from '@/components/ui/loading/Loading';

// Features - Auth (eager load for login page)
import { LoginView, ForgotPasswordView, ContactAdminView, TwoFactorView } from '@/features/auth';
import { UnderConstruction } from './UnderConstruction';

// ==================== LAZY LOADED FEATURES ====================
// Dashboard & Tasks
const DashboardView = lazy(() => import('@/features/dashboard').then(m => ({ default: m.DashboardView })));
const MyTasksView = lazy(() => import('@/features/my-tasks').then(m => ({ default: m.MyTasksView })));
const MyTeamView = lazy(() => import('@/features/my-team/MyTeamView').then(m => ({ default: m.MyTeamView })));

// Notifications
const NotificationsView = lazy(() => import('@/features/notifications').then(m => ({ default: m.NotificationsView })));

// Documents
const DetailDocumentView = lazy(() => import('@/features/documents').then(m => ({ default: m.DetailDocumentView })));
const ArchivedDocumentsView = lazy(() => import('@/features/documents/archived-documents').then(m => ({ default: m.ArchivedDocumentsView })));
const DocumentsView = lazy(() => import('@/features/documents/document-list').then(m => ({ default: m.DocumentsView })));
const NewDocumentView = lazy(() => import('@/features/documents/document-list/document-creation').then(m => ({ default: m.NewDocumentView })));
const KnowledgeView = lazy(() => import('@/features/documents/knowledge').then(m => ({ default: m.KnowledgeView })));


// Document Revisions
const DetailRevisionView = lazy(() => import('@/features/documents').then(m => ({ default: m.DetailRevisionView })));
const RevisionListView = lazy(() => import('@/features/documents/document-revisions').then(m => ({ default: m.RevisionListView })));
const NewRevisionView = lazy(() => import('@/features/documents/document-revisions').then(m => ({ default: m.NewRevisionView })));
const RevisionsOwnedByMeView = lazy(() => import('@/features/documents/document-revisions').then(m => ({ default: m.RevisionsOwnedByMeView })));
const RevisionWorkspaceView = lazy(() => import('@/features/documents/document-revisions').then(m => ({ default: m.RevisionWorkspaceView })));
const PendingDocumentsView = lazy(() => import('@/features/documents/document-revisions').then(m => ({ default: m.PendingDocumentsView })));
const RevisionReviewView = lazy(() => import('@/features/documents/document-revisions').then(m => ({ default: m.RevisionReviewView })));
const RevisionApprovalView = lazy(() => import('@/features/documents/document-revisions').then(m => ({ default: m.RevisionApprovalView })));
const UpgradeRevisionView = lazy(() => import('@/features/documents/document-revisions/components/UpgradeRevisionView').then(m => ({ default: m.UpgradeRevisionView })));

// Controlled Copies
const ControlledCopiesView = lazy(() => import('@/features/documents/controlled-copies').then(m => ({ default: m.ControlledCopiesView })));
const ControlledCopyDetailView = lazy(() => import('@/features/documents/controlled-copies').then(m => ({ default: m.ControlledCopyDetailView })));
const DestroyControlledCopyView = lazy(() => import('@/features/documents/controlled-copies').then(m => ({ default: m.DestroyControlledCopyView })));
const RequestControlledCopyView = lazy(() => import('@/features/documents/document-revisions/views/RequestControlledCopyView').then(m => ({ default: m.RequestControlledCopyView })));

// Settings
const ProfileView = lazy(() => import('@/features/settings').then(m => ({ default: m.ProfileView })));
const UserManagementView = lazy(() => import('@/features/settings').then(m => ({ default: m.UserManagementView })));
const AddUserView = lazy(() => import('@/features/settings').then(m => ({ default: m.AddUserView })));
const UserProfileView = lazy(() => import('@/features/settings').then(m => ({ default: m.UserProfileView })));
const DictionariesView = lazy(() => import('@/features/settings').then(m => ({ default: m.DictionariesView })));
const SystemInformationView = lazy(() => import('@/features/settings').then(m => ({ default: m.SystemInformationView })));
const ConfigurationView = lazy(() => import('@/features/settings').then(m => ({ default: m.ConfigurationView })));
const UserManualView = lazy(() => import('@/features/user-manual').then(m => ({ default: m.UserManualView })));
const RoleListView = lazy(() => import('@/features/settings/role-permission').then(m => ({ default: m.RoleListView })));
const RoleDetailView = lazy(() => import('@/features/settings/role-permission').then(m => ({ default: m.RoleDetailView })));

// Quality Management
// Training Management Views
const CourseListView = lazy(() => import('@/features/training/course-inventory/courses').then(m => ({ default: m.CourseListView })));
const MaterialsView = lazy(() => import('@/features/training').then(m => ({ default: m.MaterialsView })));
const MaterialDetailView = lazy(() => import('@/features/training/materials/views/material-detail/MaterialDetailView').then(m => ({ default: m.MaterialDetailView })));
const MaterialReviewView = lazy(() => import('@/features/training/materials/views/material-review/MaterialReviewView').then(m => ({ default: m.MaterialReviewView })));
const MaterialApprovalView = lazy(() => import('@/features/training/materials/views/material-approve/MaterialApprovalView').then(m => ({ default: m.MaterialApprovalView })));
const UploadMaterialView = lazy(() => import('@/features/training/materials/views/material-upload/UploadMaterialView').then(m => ({ default: m.UploadMaterialView })));
const EditMaterialView = lazy(() => import('@/features/training/materials/views/material-edit/EditMaterialView').then(m => ({ default: m.EditMaterialView })));
const MaterialNewRevisionView = lazy(() => import('@/features/training/materials/views/material-revision/NewRevisionView').then(m => ({ default: m.NewRevisionView })));
const UsageReportView = lazy(() => import('@/features/training/materials/views/material-report/UsageReportView').then(m => ({ default: m.UsageReportView })));
const TrainingMatrixView = lazy(() => import('@/features/training').then(m => ({ default: m.TrainingMatrixView })));
const CourseStatusView = lazy(() => import('@/features/training').then(m => ({ default: m.CourseStatusView })));
const AssignTrainingView = lazy(() => import('@/features/training').then(m => ({ default: m.AssignTrainingView })));
const AssignmentRulesView = lazy(() => import('@/features/training').then(m => ({ default: m.AssignmentRulesView })));
const EmployeeTrainingFilesView = lazy(() => import('@/features/training/records-archive/EmployeeTrainingFilesView').then(m => ({ default: m.EmployeeTrainingFilesView })));
const ExportRecordsView = lazy(() => import('@/features/training/records-archive/ExportRecordsView').then(m => ({ default: m.ExportRecordsView })));
const CreateCourseView = lazy(() => import('@/features/training').then(m => ({ default: m.CreateCourseView })));
const PendingReviewView = lazy(() => import('@/features/training/course-inventory/courses/pending-review/PendingReviewView').then(m => ({ default: m.PendingReviewView })));
const PendingApprovalView = lazy(() => import('@/features/training/course-inventory/courses/pending-approval/PendingApprovalView').then(m => ({ default: m.PendingApprovalView })));
const ReviewCourseView = lazy(() => import('@/features/training/course-inventory/courses/pending-review/ReviewCourseView').then(m => ({ default: m.ReviewCourseView })));
const ApproveCourseView = lazy(() => import('@/features/training/course-inventory/courses/pending-approval/ApproveCourseView').then(m => ({ default: m.ApproveCourseView })));
const ResultEntryView = lazy(() => import('@/features/training').then(m => ({ default: m.ResultEntryView })));
const CourseDetailView = lazy(() => import('@/features/training/course-inventory/courses').then(m => ({ default: m.CourseDetailView })));
const EditCourseView = lazy(() => import('@/features/training/course-inventory/courses').then(m => ({ default: m.EditCourseView })));
const CourseProgressView = lazy(() => import('@/features/training').then(m => ({ default: m.CourseProgressView })));
const MyTrainingView = lazy(() => import('@/features/training').then(m => ({ default: m.MyTrainingView })));

const DeviationsView = lazy(() => import('@/features/deviations').then(m => ({ default: m.DeviationsView })));
const CAPAView = lazy(() => import('@/features/capa').then(m => ({ default: m.CAPAView })));
const ChangeControlView = lazy(() => import('@/features/change-control').then(m => ({ default: m.ChangeControlView })));
const ComplaintsView = lazy(() => import('@/features/complaints').then(m => ({ default: m.ComplaintsView })));
const RiskManagementView = lazy(() => import('@/features/risk-management').then(m => ({ default: m.RiskManagementView })));
const EquipmentView = lazy(() => import('@/features/equipment').then(m => ({ default: m.EquipmentView })));
const SupplierView = lazy(() => import('@/features/supplier').then(m => ({ default: m.SupplierView })));
const ProductView = lazy(() => import('@/features/product').then(m => ({ default: m.ProductView })));
const RegulatoryView = lazy(() => import('@/features/regulatory').then(m => ({ default: m.RegulatoryView })));
const ReportView = lazy(() => import('@/features/report').then(m => ({ default: m.ReportView })));

// System
const AuditTrailView = lazy(() => import('@/features/audit-trail').then(m => ({ default: m.AuditTrailView })));
const PreferencesView = lazy(() => import('@/features/preferences').then(m => ({ default: m.PreferencesView })));
const HelpSupportView = lazy(() => import('@/features/help-support').then(m => ({ default: m.HelpSupportView })));

// ==================== ROUTE WRAPPERS ====================
// Reusable wrapper for extracting ID from URL params

interface RouteWrapperProps {
  render: (id: string, navigate: ReturnType<typeof useNavigate>) => React.ReactElement;
}

const RouteWrapper: React.FC<RouteWrapperProps> = ({ render }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  if (!id) {
    navigate(ROUTES.DASHBOARD);
    return null;
  }
  
  return render(id, navigate);
};

// Specific route wrappers
const DetailDocumentViewWrapper = () => (
  <RouteWrapper 
    render={(id, navigate) => (
      <Suspense fallback={<LoadingFallback />}>
        <DetailDocumentView documentId={id} onBack={() => navigate(-1)} />
      </Suspense>
    )} 
  />
);

const DetailRevisionViewWrapper = () => (
  <RouteWrapper 
    render={(id, navigate) => (
      <Suspense fallback={<LoadingFallback />}>
        <DetailRevisionView documentId={id} onBack={() => navigate(-1)} />
      </Suspense>
    )} 
  />
);

const RevisionReviewViewWrapper = () => {
  const { user } = useAuth();
  return (
    <RouteWrapper 
      render={(id, navigate) => (
        <Suspense fallback={<LoadingFallback />}>
          <RevisionReviewView documentId={id} onBack={() => navigate(-1)} currentUserId={user?.id || ''} />
        </Suspense>
      )} 
    />
  );
};

const RevisionApprovalViewWrapper = () => {
  const { user } = useAuth();
  return (
    <RouteWrapper 
      render={(id, navigate) => (
        <Suspense fallback={<LoadingFallback />}>
          <RevisionApprovalView revisionId={id} onBack={() => navigate(-1)} currentUserId={user?.id || ''} />
        </Suspense>
      )} 
    />
  );
};

const ControlledCopyDetailViewWrapper = () => (
  <RouteWrapper 
    render={(id, navigate) => (
      <Suspense fallback={<LoadingFallback />}>
        <ControlledCopyDetailView controlledCopyId={id} onBack={() => navigate(-1)} />
      </Suspense>
    )} 
  />
);

// ==================== LOADING FALLBACK ====================
const LoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Loading size="default" text="Loading..." />
  </div>
);

// ==================== MAIN ROUTES ====================

export const AppRoutes: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [pendingCredentials, setPendingCredentials] = useState<{username: string, password: string, rememberMe: boolean} | null>(null);
  
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

  const handleAccountRequest = (data: any) => {
    // TODO: Implement API call to send request to admin
  };

  return (
    <Routes>
      {/* ==================== PUBLIC ROUTES ==================== */}
      <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
      <Route path="/login" element={<LoginView onLogin={handleLogin} onForgotPassword={handleForgotPassword} onContactAdmin={handleContactAdmin} />} />
      <Route path="/login/2fa" element={<TwoFactorView onVerify={handleVerify2FA} onBackToLogin={handleBackToLogin} username={pendingCredentials?.username} />} />
      <Route path="/forgot-password" element={<ForgotPasswordView onBackToLogin={handleBackToLogin} onRequestSubmit={handlePasswordResetRequest} />} />
      <Route path="/contact-admin" element={<ContactAdminView onBackToLogin={handleBackToLogin} onRequestSubmit={handleAccountRequest} />} />
      
      {/* ==================== PROTECTED ROUTES (WITH LAYOUT) ==================== */}
      <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        
        {/* ===== DASHBOARD & TASKS ===== */}
        <Route path="dashboard" element={<Suspense fallback={<LoadingFallback />}><DashboardView /></Suspense>} />
        <Route path="my-tasks" element={<Suspense fallback={<LoadingFallback />}><MyTasksView /></Suspense>} />
        <Route path="my-team" element={<Suspense fallback={<LoadingFallback />}><MyTeamView /></Suspense>} />
        <Route path="notifications" element={<Suspense fallback={<LoadingFallback />}><NotificationsView /></Suspense>} />
        
        {/* ===== DOCUMENTS ===== */}
        <Route path="documents">
          {/* Document Lists */}
          <Route path="owned" element={<Suspense fallback={<LoadingFallback />}><DocumentsView viewType="owned-by-me" onViewDocument={(id) => navigate(ROUTES.DOCUMENTS.DETAIL(id))} /></Suspense>} />
          <Route path="all" element={<Suspense fallback={<LoadingFallback />}><DocumentsView viewType="all" onViewDocument={(id) => navigate(ROUTES.DOCUMENTS.DETAIL(id))} /></Suspense>} />
          <Route path="all/new" element={<Suspense fallback={<LoadingFallback />}><NewDocumentView /></Suspense>} />
          <Route path="archived" element={<Suspense fallback={<LoadingFallback />}><ArchivedDocumentsView /></Suspense>} />
          
          {/* Knowledge Base */}
          <Route path="knowledge" element={<Suspense fallback={<LoadingFallback />}><KnowledgeView /></Suspense>} />
          
          {/* Document Detail & Actions */}
          <Route path=":id" element={<DetailDocumentViewWrapper />} />
          
          {/* Document Revisions */}
          <Route path="revisions">
            <Route path="all" element={<Suspense fallback={<LoadingFallback />}><RevisionListView /></Suspense>} />
            <Route path="owned" element={<Suspense fallback={<LoadingFallback />}><RevisionsOwnedByMeView /></Suspense>} />
            <Route path=":id" element={<DetailRevisionViewWrapper />} />
            <Route path="pending-review" element={<Suspense fallback={<LoadingFallback />}><PendingDocumentsView viewType="review" onViewDocument={(id) => navigate(ROUTES.DOCUMENTS.REVISIONS.DETAIL(id))} /></Suspense>} />
            <Route path="pending-approval" element={<Suspense fallback={<LoadingFallback />}><PendingDocumentsView viewType="approval" onViewDocument={(id) => navigate(ROUTES.DOCUMENTS.REVISIONS.DETAIL(id))} /></Suspense>} />
            <Route path="new" element={<Suspense fallback={<LoadingFallback />}><NewRevisionView /></Suspense>} />
            <Route path="new-multi" element={<Suspense fallback={<LoadingFallback />}><NewRevisionView /></Suspense>} />
            <Route path="new-standalone" element={<Suspense fallback={<LoadingFallback />}><UpgradeRevisionView /></Suspense>} />
            <Route path="workspace" element={<Suspense fallback={<LoadingFallback />}><RevisionWorkspaceView /></Suspense>} />
            <Route path="review/:id" element={<RevisionReviewViewWrapper />} />
            <Route path="approval/:id" element={<RevisionApprovalViewWrapper />} />
            <Route path="*" element={<Suspense fallback={<LoadingFallback />}><DocumentsView viewType="all" onViewDocument={(id) => navigate(ROUTES.DOCUMENTS.REVISIONS.DETAIL(id))} /></Suspense>} />
          </Route>
          
          {/* Controlled Copies */}
          <Route path="controlled-copies">
            <Route index element={<Navigate to={ROUTES.DOCUMENTS.CONTROLLED_COPIES.ALL} replace />} />
            <Route path="all" element={<Suspense fallback={<LoadingFallback />}><ControlledCopiesView viewType="all" /></Suspense>} />
            <Route path="ready" element={<Suspense fallback={<LoadingFallback />}><ControlledCopiesView viewType="ready" /></Suspense>} />
            <Route path="distributed" element={<Suspense fallback={<LoadingFallback />}><ControlledCopiesView viewType="distributed" /></Suspense>} />
            <Route path=":id" element={<ControlledCopyDetailViewWrapper />} />
            <Route path=":id/destroy" element={<Suspense fallback={<LoadingFallback />}><DestroyControlledCopyView /></Suspense>} />
            <Route path="*" element={<Suspense fallback={<LoadingFallback />}><DocumentsView viewType="all" onViewDocument={(id) => navigate(ROUTES.DOCUMENTS.DETAIL(id))} /></Suspense>} />
          </Route>
          <Route path="controlled-copy/request" element={<Suspense fallback={<LoadingFallback />}><RequestControlledCopyView /></Suspense>} />
        </Route>
        
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
        </Route>
        
        {/* ===== HELP & SUPPORT ===== */}
        <Route path="help-support">
          <Route index element={<Navigate to="manual" replace />} />
          <Route path="manual" element={<Suspense fallback={<LoadingFallback />}><UserManualView /></Suspense>} />
          <Route path="contact" element={<Suspense fallback={<LoadingFallback />}><HelpSupportView /></Suspense>} />
        </Route>

        {/* ===== PREFERENCES ===== */}
        <Route path="preferences" element={<Suspense fallback={<LoadingFallback />}><PreferencesView /></Suspense>} />

        {/* ===== TRAINING MANAGEMENT ===== */}
        <Route path="training-management">
          {/* My Training */}
          <Route path="my-training" element={<Suspense fallback={<LoadingFallback />}><MyTrainingView /></Suspense>} />
          
          {/* Materials */}
          <Route path="materials">
            <Route index element={<Suspense fallback={<LoadingFallback />}><MaterialsView /></Suspense>} />
            <Route path="upload" element={<Suspense fallback={<LoadingFallback />}><UploadMaterialView /></Suspense>} />
            <Route path=":materialId" element={<Suspense fallback={<LoadingFallback />}><MaterialDetailView /></Suspense>} />
            <Route path=":materialId/edit" element={<Suspense fallback={<LoadingFallback />}><EditMaterialView /></Suspense>} />
            <Route path="review/:materialId" element={<Suspense fallback={<LoadingFallback />}><MaterialReviewView /></Suspense>} />
            <Route path="approval/:materialId" element={<Suspense fallback={<LoadingFallback />}><MaterialApprovalView /></Suspense>} />
            <Route path="new-revision/:materialId" element={<Suspense fallback={<LoadingFallback />}><MaterialNewRevisionView /></Suspense>} />
            <Route path="usage-report/:materialId" element={<Suspense fallback={<LoadingFallback />}><UsageReportView /></Suspense>} />
          </Route>
          
          {/* Course Inventory */}
          <Route path="courses-list" element={<Suspense fallback={<LoadingFallback />}><CourseListView /></Suspense>} />
          <Route path="courses/create" element={<Suspense fallback={<LoadingFallback />}><CreateCourseView /></Suspense>} />
          <Route path="pending-review" element={<Suspense fallback={<LoadingFallback />}><PendingReviewView /></Suspense>} />
          <Route path="pending-review/:courseId" element={<Suspense fallback={<LoadingFallback />}><ReviewCourseView /></Suspense>} />
          <Route path="pending-approval" element={<Suspense fallback={<LoadingFallback />}><PendingApprovalView /></Suspense>} />
          <Route path="pending-approval/:courseId" element={<Suspense fallback={<LoadingFallback />}><ApproveCourseView /></Suspense>} />
          <Route path="courses/:courseId" element={<Suspense fallback={<LoadingFallback />}><CourseDetailView /></Suspense>} />
          <Route path="courses/:courseId/edit" element={<Suspense fallback={<LoadingFallback />}><EditCourseView /></Suspense>} />
          <Route path="courses/:courseId/progress" element={<Suspense fallback={<LoadingFallback />}><CourseProgressView /></Suspense>} />
          <Route path="courses/:courseId/result-entry" element={<Suspense fallback={<LoadingFallback />}><ResultEntryView /></Suspense>} />
          
          {/* Compliance Tracking */}
          <Route path="training-matrix" element={<Suspense fallback={<LoadingFallback />}><TrainingMatrixView /></Suspense>} />
          {/* Course status + Assignment queue are combined in a single view */}
          <Route path="course-status" element={<Suspense fallback={<LoadingFallback />}><CourseStatusView /></Suspense>} />
          <Route path="assignments" element={<Suspense fallback={<LoadingFallback />}><CourseStatusView /></Suspense>} />
          <Route path="assignments/new" element={<Suspense fallback={<LoadingFallback />}><AssignTrainingView /></Suspense>} />
          <Route path="assignment-rules" element={<Suspense fallback={<LoadingFallback />}><AssignmentRulesView /></Suspense>} />
          
          {/* Records & Archive */}
          <Route path="employee-training-files" element={<Suspense fallback={<LoadingFallback />}><EmployeeTrainingFilesView /></Suspense>} />
          <Route path="export-records" element={<Suspense fallback={<LoadingFallback />}><ExportRecordsView /></Suspense>} />
          
          {/* Default redirect */}
          <Route index element={<Navigate to={ROUTES.TRAINING.COURSES_LIST} replace />} />
        </Route>
        
        {/* ===== DEVIATION & NCs ===== */}
        <Route path="deviations-ncs" element={<Suspense fallback={<LoadingFallback />}><DeviationsView /></Suspense>} />
        
        {/* ===== CAPA MANAGEMENT ===== */}
        <Route path="capa-management" element={<Suspense fallback={<LoadingFallback />}><CAPAView /></Suspense>} />
        
        {/* ===== CHANGE MANAGEMENT ===== */}
        <Route path="change-management" element={<Suspense fallback={<LoadingFallback />}><ChangeControlView /></Suspense>} />
        
        {/* ===== COMPLAINTS MANAGEMENT ===== */}
        <Route path="complaints-management" element={<Suspense fallback={<LoadingFallback />}><ComplaintsView /></Suspense>} />
        
        {/* ===== EQUIPMENT MANAGEMENT ===== */}
        <Route path="equipment-management" element={<Suspense fallback={<LoadingFallback />}><EquipmentView /></Suspense>} />
        
        {/* ===== SUPPLIER MANAGEMENT ===== */}
        <Route path="supplier-management" element={<Suspense fallback={<LoadingFallback />}><SupplierView /></Suspense>} />
        
        {/* ===== RISK MANAGEMENT ===== */}
        <Route path="risk-management" element={<Suspense fallback={<LoadingFallback />}><RiskManagementView /></Suspense>} />
        
        {/* ===== PRODUCT MANAGEMENT ===== */}
        <Route path="product-management" element={<Suspense fallback={<LoadingFallback />}><ProductView /></Suspense>} />
        
        {/* ===== REGULATORY MANAGEMENT ===== */}
        <Route path="regulatory-management" element={<Suspense fallback={<LoadingFallback />}><RegulatoryView /></Suspense>} />
        
        {/* ===== REPORT ===== */}
        <Route path="report" element={<Suspense fallback={<LoadingFallback />}><ReportView /></Suspense>} />
        
        {/* ===== AUDIT TRAIL SYSTEM ===== */}
        <Route path="audit-trail" element={<Suspense fallback={<LoadingFallback />}><AuditTrailView /></Suspense>} />
        
        {/* ===== PROFILE ===== */}
        <Route path="profile" element={<Suspense fallback={<LoadingFallback />}><ProfileView onBack={() => navigate(-1)} /></Suspense>} />
        
        {/* ===== FALLBACK ===== */}
        <Route path="*" element={<UnderConstruction />} />
      </Route>
    </Routes>
  );
};

