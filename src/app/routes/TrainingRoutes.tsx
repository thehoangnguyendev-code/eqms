import React, { Suspense, lazy } from 'react';
import { Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../routes.constants';
import { LoadingFallback } from './LoadingFallback';

// ==================== LAZY LOADED ====================
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
const EmployeeDossierView = lazy(() => import('@/features/training/records-archive/EmployeeDossierView').then(m => ({ default: m.EmployeeDossierView })));
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

// ==================== TRAINING ROUTES ====================
export function trainingRoutes() {
  return (
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
      <Route path="course-status" element={<Suspense fallback={<LoadingFallback />}><CourseStatusView /></Suspense>} />
      <Route path="assignments" element={<Suspense fallback={<LoadingFallback />}><CourseStatusView /></Suspense>} />
      <Route path="assignments/new" element={<Suspense fallback={<LoadingFallback />}><AssignTrainingView /></Suspense>} />
      <Route path="assignment-rules" element={<Suspense fallback={<LoadingFallback />}><AssignmentRulesView /></Suspense>} />

      {/* Records & Archive */}
      <Route path="employee-training-files" element={<Suspense fallback={<LoadingFallback />}><EmployeeTrainingFilesView /></Suspense>} />
      <Route path="employee-training-files/:id" element={<Suspense fallback={<LoadingFallback />}><EmployeeDossierView /></Suspense>} />
      <Route path="export-records" element={<Suspense fallback={<LoadingFallback />}><ExportRecordsView /></Suspense>} />

      {/* Default redirect */}
      <Route index element={<Navigate to={ROUTES.TRAINING.COURSES_LIST} replace />} />
    </Route>
  );
}
