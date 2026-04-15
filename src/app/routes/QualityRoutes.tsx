import React, { Suspense, lazy } from 'react';
import { Route } from 'react-router-dom';
import { LoadingFallback } from './LoadingFallback';

// ==================== LAZY LOADED ====================
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
const AuditTrailView = lazy(() => import('@/features/audit-trail').then(m => ({ default: m.AuditTrailView })));

// ==================== QUALITY & OPERATIONS ROUTES ====================
export function qualityRoutes() {
  return (
    <>
      <Route path="deviations-ncs" element={<Suspense fallback={<LoadingFallback />}><DeviationsView /></Suspense>} />
      <Route path="capa-management" element={<Suspense fallback={<LoadingFallback />}><CAPAView /></Suspense>} />
      <Route path="change-management" element={<Suspense fallback={<LoadingFallback />}><ChangeControlView /></Suspense>} />
      <Route path="complaints-management" element={<Suspense fallback={<LoadingFallback />}><ComplaintsView /></Suspense>} />
      <Route path="risk-management" element={<Suspense fallback={<LoadingFallback />}><RiskManagementView /></Suspense>} />
      <Route path="equipment-management" element={<Suspense fallback={<LoadingFallback />}><EquipmentView /></Suspense>} />
      <Route path="supplier-management" element={<Suspense fallback={<LoadingFallback />}><SupplierView /></Suspense>} />
      <Route path="product-management" element={<Suspense fallback={<LoadingFallback />}><ProductView /></Suspense>} />
      <Route path="regulatory-management" element={<Suspense fallback={<LoadingFallback />}><RegulatoryView /></Suspense>} />
      <Route path="report" element={<Suspense fallback={<LoadingFallback />}><ReportView /></Suspense>} />
      <Route path="audit-trail" element={<Suspense fallback={<LoadingFallback />}><AuditTrailView /></Suspense>} />
    </>
  );
}
