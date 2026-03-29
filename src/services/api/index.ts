/**
 * API Services Index
 * ─────────────────────────────────────────────────────────────────────────────
 * Single entry-point for all EQMS API calls.
 *
 * Usage:
 *   import { deviationApi, capaApi } from '@/services/api';
 * ─────────────────────────────────────────────────────────────────────────────
 */

// Core
export { api, uploadFile } from './client';
export { authApi } from './auth';

// Document & Task Management
export { documentApi } from './documents';
export { taskApi } from './tasks';

// Quality Events
export { deviationApi } from './deviations';
export { capaApi } from './capa';
export { complaintApi } from './complaints';

// Change & Risk Management
export { changeControlApi } from './change-control';
export { riskApi } from './risk-management';

// Operations
export { equipmentApi } from './equipment';
export { supplierApi } from './supplier';
export { trainingApi } from './training';
export { productApi } from './product';

// Regulatory & Compliance
export { regulatoryApi } from './regulatory';
export { auditTrailApi } from './audit-trail';

// Platform
export { notificationApi } from './notifications';
export { reportApi } from './report';
export { dashboardApi } from './dashboard';
export { settingsApi } from './settings';
export { sharedApi } from './shared';
export { searchApi, countApi } from './search';
export { metadataApi } from './metadata';

// Param/filter types for each API module
export type { GetUsersParams } from './settings';
export type { GetDeviationsParams } from './deviations';
export type { GetCapaParams } from './capa';
export type { GetComplaintsParams } from './complaints';
export type { GetChangeControlParams } from './change-control';
export type { GetEquipmentParams } from './equipment';
export type { GetSuppliersParams } from './supplier';
export type { GetRisksParams } from './risk-management';
export type { GetAuditTrailParams } from './audit-trail';
export type { GetRegulatoryParams } from './regulatory';
export type { GetProductsParams } from './product';
export type { Notification } from './notifications';

// Re-export shared types for convenience
export type * from '@/types';
