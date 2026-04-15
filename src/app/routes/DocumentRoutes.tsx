import React, { Suspense, lazy } from 'react';
import { Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { NavigateFunction } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '../routes.constants';
import { LoadingFallback } from './LoadingFallback';

// ==================== LAZY LOADED ====================
const DetailDocumentView = lazy(() => import('@/features/documents').then(m => ({ default: m.DetailDocumentView })));
const ArchivedDocumentsView = lazy(() => import('@/features/documents/archived-documents').then(m => ({ default: m.ArchivedDocumentsView })));
const DocumentsView = lazy(() => import('@/features/documents/document-list').then(m => ({ default: m.DocumentsView })));
const NewDocumentView = lazy(() => import('@/features/documents/document-list/document-creation').then(m => ({ default: m.NewDocumentView })));
const KnowledgeView = lazy(() => import('@/features/documents/knowledge').then(m => ({ default: m.KnowledgeView })));
const DetailRevisionView = lazy(() => import('@/features/documents').then(m => ({ default: m.DetailRevisionView })));
const RevisionListView = lazy(() => import('@/features/documents/document-revisions').then(m => ({ default: m.RevisionListView })));
const NewRevisionView = lazy(() => import('@/features/documents/document-revisions').then(m => ({ default: m.NewRevisionView })));
const RevisionsOwnedByMeView = lazy(() => import('@/features/documents/document-revisions').then(m => ({ default: m.RevisionsOwnedByMeView })));
const RevisionWorkspaceView = lazy(() => import('@/features/documents/document-revisions').then(m => ({ default: m.RevisionWorkspaceView })));
const PendingDocumentsView = lazy(() => import('@/features/documents/document-revisions').then(m => ({ default: m.PendingDocumentsView })));
const RevisionReviewView = lazy(() => import('@/features/documents/document-revisions').then(m => ({ default: m.RevisionReviewView })));
const RevisionApprovalView = lazy(() => import('@/features/documents/document-revisions').then(m => ({ default: m.RevisionApprovalView })));
const UpgradeRevisionView = lazy(() => import('@/features/documents/document-revisions/components/UpgradeRevisionView').then(m => ({ default: m.UpgradeRevisionView })));
const ControlledCopiesView = lazy(() => import('@/features/documents/controlled-copies').then(m => ({ default: m.ControlledCopiesView })));
const ControlledCopyDetailView = lazy(() => import('@/features/documents/controlled-copies').then(m => ({ default: m.ControlledCopyDetailView })));
const DestroyControlledCopyView = lazy(() => import('@/features/documents/controlled-copies').then(m => ({ default: m.DestroyControlledCopyView })));
const RequestControlledCopyView = lazy(() => import('@/features/documents/document-revisions/views/RequestControlledCopyView').then(m => ({ default: m.RequestControlledCopyView })));

// ==================== ROUTE WRAPPER ====================
interface RouteWrapperProps {
  render: (id: string, navigate: NavigateFunction) => React.ReactElement;
}

const RouteWrapper: React.FC<RouteWrapperProps> = ({ render }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  if (!id) return <Navigate to={ROUTES.DASHBOARD} replace />;
  return render(id, navigate);
};

// ==================== DETAIL WRAPPERS ====================
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

// ==================== DOCUMENT ROUTES ====================
export function documentRoutes(navigate: NavigateFunction) {
  return (
    <Route path="documents">
      {/* Document Lists */}
      <Route path="owned" element={<Suspense fallback={<LoadingFallback />}><DocumentsView viewType="owned-by-me" onViewDocument={(id) => navigate(ROUTES.DOCUMENTS.DETAIL(id))} /></Suspense>} />
      <Route path="all" element={<Suspense fallback={<LoadingFallback />}><DocumentsView viewType="all" onViewDocument={(id) => navigate(ROUTES.DOCUMENTS.DETAIL(id))} /></Suspense>} />
      <Route path="all/new" element={<Suspense fallback={<LoadingFallback />}><NewDocumentView /></Suspense>} />
      <Route path="archived" element={<Suspense fallback={<LoadingFallback />}><ArchivedDocumentsView /></Suspense>} />

      {/* Knowledge Base */}
      <Route path="knowledge" element={<Suspense fallback={<LoadingFallback />}><KnowledgeView /></Suspense>} />

      {/* Document Detail */}
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
  );
}
