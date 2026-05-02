/**
 * Compliance Tracking Types
 * Shared types for Training Matrix grid, Gap Analysis, and Employee Compliance
 *
 * Designed to support:
 * - FDA 21 CFR 211.25 (Personnel Qualifications)
 * - FDA 21 CFR 820.25 (QSR Training)
 * - EU GMP Chapter 2 (Personnel)
 * - ICH Q10 (Pharmaceutical Quality System)
 */

// ─── Cell Status (color logic) ───────────────────────────────────────
export type CellStatus =
  | "NotRequired"     // Gray   ⚪ — Không thuộc diện phải học
  | "Required"        // Red    ❌ — Thuộc diện phải học nhưng chưa Assign/chưa có điểm
  | "InProgress"      // Yellow ⏳ — Đã tạo Assignment nhưng chưa nhập điểm
  | "Qualified";      // Green  ✅ — Đã có điểm đạt/vượt qua

// ─── SOP / Training Material Column ─────────────────────────────────
export interface SOPColumn {
  id: string;
  code: string;       // e.g. "SOP-001"
  title: string;      // e.g. "GMP Basic Training"
  category: string;   // e.g. "GMP", "Safety", "Technical"
  version: string;    // e.g. "v2.1"
  effectiveDate: string;
  materialId: string;
  materialName: string;
}

// ─── Employee Row ────────────────────────────────────────────────────
export interface EmployeeRow {
  id: string;
  name: string;
  employeeCode: string;
  email: string;
  department: string;
  businessUnit?: string;
  position: string;
  hireDate: string;
}

// ─── Training Cell (intersection of Employee × SOP) ─────────────────
export interface TrainingCell {
  employeeId: string;
  sopId: string;
  status: CellStatus;
  lastTrainedDate: string | null;
  expiryDate: string | null;
  score: number | null;       // 0-100 or null
  attempts: number;
}

// ─── KPI Summary ─────────────────────────────────────────────────────
export interface MatrixKPI {
  complianceRate: number;     // 0-100%
  totalOverdue: number;
  expiringSoon: number;
  daysUntilNextAudit: number;
}

// ─── Filter state ────────────────────────────────────────────────────
export interface MatrixFilters {
  searchQuery: string;
  department: string;
  position: string;
  status: CellStatus | "All";
  gapAnalysis: boolean;       // hide "Qualified" cells
}
