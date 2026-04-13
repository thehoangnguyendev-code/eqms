/**
 * Training Matrix Mock Data
 * Generates realistic Employee × SOP/Material training matrix data
 */

import type {
  SOPColumn,
  EmployeeRow,
  TrainingCell,
  CellStatus,
  MatrixKPI,
} from "./types";
import { CourseComplianceRecord } from "../types";
import { AutoAssignmentRule } from "../types/assignment.types";

// ─── SOP / Training Material Columns ────────────────────────────────
export const MOCK_SOPS: SOPColumn[] = [
  { id: "SOP-001", code: "SOP-001", title: "GMP Basic Training", category: "GMP", version: "v3.0", effectiveDate: "15/01/2025" },
  { id: "SOP-002", code: "SOP-002", title: "Cleanroom Operations", category: "Technical", version: "v2.1", effectiveDate: "01/03/2025" },
  { id: "SOP-003", code: "SOP-003", title: "Workplace Safety & HSE", category: "Safety", version: "v4.0", effectiveDate: "10/02/2025" },
  { id: "SOP-004", code: "SOP-004", title: "ISO 9001 Internal Auditor", category: "Compliance", version: "v1.2", effectiveDate: "20/11/2024" },
  { id: "SOP-005", code: "SOP-005", title: "SOP Documentation & Control", category: "GMP", version: "v2.0", effectiveDate: "01/04/2025" },
  { id: "SOP-006", code: "SOP-006", title: "HPLC Operations", category: "Technical", version: "v3.1", effectiveDate: "20/01/2025" },
  { id: "SOP-007", code: "SOP-007", title: "Validation IQ/OQ/PQ", category: "Technical", version: "v2.0", effectiveDate: "15/05/2025" },
  { id: "SOP-008", code: "SOP-008", title: "Risk Assessment & FMEA", category: "Compliance", version: "v1.5", effectiveDate: "01/12/2024" },
  { id: "SOP-009", code: "SOP-009", title: "Chemical Safety", category: "Safety", version: "v3.2", effectiveDate: "01/06/2025" },
  { id: "SOP-010", code: "SOP-010", title: "Data Integrity (ALCOA+)", category: "Compliance", version: "v2.0", effectiveDate: "15/03/2025" },
  { id: "SOP-011", code: "SOP-011", title: "Deviation & CAPA", category: "GMP", version: "v2.3", effectiveDate: "20/02/2025" },
  { id: "SOP-012", code: "SOP-012", title: "Change Control Process", category: "GMP", version: "v1.1", effectiveDate: "10/04/2025" },
  { id: "SOP-013", code: "SOP-013", title: "Sampling Procedures", category: "Technical", version: "v2.0", effectiveDate: "05/01/2025" },
  { id: "SOP-014", code: "SOP-014", title: "Equipment Calibration", category: "Technical", version: "v3.0", effectiveDate: "01/07/2025" },
  { id: "SOP-015", code: "SOP-015", title: "Batch Record Review", category: "GMP", version: "v1.8", effectiveDate: "20/05/2025" },
  { id: "TRN-2026-001", code: "TRN-2026-001", title: "GMP Basic Principles (V2.0)", category: "GMP", version: "v2.0", effectiveDate: "15/03/2026" },
  { id: "TRN-2026-003", code: "TRN-2026-003", title: "Emergency Response Procedures", category: "Safety", version: "v1.0", effectiveDate: "20/01/2026" },
];

// ─── Employee Rows ──────────────────────────────────────────────────
export const MOCK_EMPLOYEES: EmployeeRow[] = [
  { id: "EMP-005", name: "David Brown", employeeCode: "ENG-005", email: "david.brown@eqms.com", department: "Engineering", businessUnit: "Pharma Manufacturing", jobTitle: "Validation Engineer", hireDate: "01/03/2026" },
  { id: "EMP-001", name: "John Smith", employeeCode: "QA-001", email: "john.smith@eqms.com", department: "Quality Assurance", businessUnit: "Pharma Manufacturing", jobTitle: "QA Manager", hireDate: "15/03/2019" },
  { id: "EMP-002", name: "Sarah Johnson", employeeCode: "QC-002", email: "sarah.johnson@eqms.com", department: "Quality Control", businessUnit: "Pharma Manufacturing", jobTitle: "QC Analyst", hireDate: "01/06/2020" },
  { id: "EMP-003", name: "Michael Chen", employeeCode: "PRD-003", email: "michael.chen@eqms.com", department: "Production", businessUnit: "Logistics & Supply", jobTitle: "Production Operator", hireDate: "10/01/2021" },
  { id: "EMP-004", name: "Emma Wilson", employeeCode: "DOC-004", email: "emma.wilson@eqms.com", department: "Documentation", businessUnit: "Corporate", jobTitle: "Document Controller", hireDate: "20/08/2022" },
  { id: "EMP-006", name: "David Park", employeeCode: "QC-003", email: "david.park@ntp.com", department: "Quality Control", businessUnit: "Quality Unit", jobTitle: "Lab Technician", hireDate: "10/04/2020" },
  { id: "EMP-007", name: "Sarah Kim", employeeCode: "PRD-001", email: "sarah.kim@ntp.com", department: "Production", businessUnit: "Operation Unit", jobTitle: "Production Operator", hireDate: "20/07/2021" },
  { id: "EMP-008", name: "Michael Brown", employeeCode: "PRD-002", email: "michael.brown@ntp.com", department: "Production", businessUnit: "Operation Unit", jobTitle: "Production Operator", hireDate: "15/01/2022" },
  { id: "EMP-009", name: "Emily Davis", employeeCode: "PRD-003", email: "emily.davis@ntp.com", department: "Production", businessUnit: "Operation Unit", jobTitle: "Production Supervisor", hireDate: "05/09/2019" },
  { id: "EMP-010", name: "Kevin Wilson", employeeCode: "PRD-004", email: "kevin.wilson@ntp.com", department: "Production", businessUnit: "Operation Unit", jobTitle: "Production Operator", hireDate: "12/03/2023" },
  { id: "EMP-011", name: "Jennifer Lee", employeeCode: "ENG-001", email: "jennifer.lee@ntp.com", department: "Engineering", businessUnit: "Operation Unit", jobTitle: "Validation Engineer", hireDate: "01/11/2020" },
  { id: "EMP-012", name: "Thomas Wright", employeeCode: "ENG-002", email: "thomas.wright@ntp.com", department: "Engineering", businessUnit: "Operation Unit", jobTitle: "Validation Engineer", hireDate: "10/05/2021" },
  { id: "EMP-013", name: "Jessica Martinez", employeeCode: "ENG-003", email: "jessica.martinez@ntp.com", department: "Engineering", businessUnit: "Operation Unit", jobTitle: "Engineering Manager", hireDate: "15/08/2018" },
  { id: "EMP-014", name: "Daniel Taylor", employeeCode: "DOC-001", email: "daniel.taylor@ntp.com", department: "Documentation", businessUnit: "Operation Unit", jobTitle: "Document Controller", hireDate: "01/02/2022" },
  { id: "EMP-015", name: "Amanda Garcia", employeeCode: "DOC-002", email: "amanda.garcia@ntp.com", department: "Documentation", businessUnit: "Operation Unit", jobTitle: "Document Controller", hireDate: "20/06/2023" },
  { id: "EMP-016", name: "Chris Anderson", employeeCode: "HSE-001", email: "chris.anderson@ntp.com", department: "HSE", businessUnit: "Operation Unit", jobTitle: "HSE Coordinator", hireDate: "05/10/2020" },
  { id: "EMP-017", name: "Patricia White", employeeCode: "HSE-002", email: "patricia.white@ntp.com", department: "HSE", businessUnit: "Operation Unit", jobTitle: "HSE Specialist", hireDate: "15/12/2021" },
  { id: "EMP-018", name: "Steven Harris", employeeCode: "SC-001", email: "steven.harris@ntp.com", department: "Supply Chain", businessUnit: "Operation Unit", jobTitle: "Warehouse Operator", hireDate: "10/04/2022" },
  { id: "EMP-019", name: "Nancy Clark", employeeCode: "SC-002", email: "nancy.clark@ntp.com", department: "Supply Chain", businessUnit: "Operation Unit", jobTitle: "Warehouse Operator", hireDate: "20/07/2023" },
  { id: "EMP-020", name: "Richard Moore", employeeCode: "QC-004", email: "richard.moore@ntp.com", department: "Quality Control", businessUnit: "Quality Unit", jobTitle: "QC Analyst", hireDate: "15/02/2020" },
];

// ─── Helper: random date in range ───────────────────────────────────
const parseDMY = (d: string): Date => {
  const m = d.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
  return new Date(d);
};

const randomDate = (start: string, end: string): string => {
  const s = parseDMY(start).getTime();
  const e = parseDMY(end).getTime();
  const d = new Date(s + Math.random() * (e - s));
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
};

// ─── Generate Training Cells ────────────────────────────────────────
// Deterministic-ish generation based on employee/SOP combination
const generateCell = (emp: EmployeeRow, sop: SOPColumn): TrainingCell => {
  // Determine if this SOP is required for this employee's role
  const requiredMap: Record<string, string[]> = {
    "QA Manager":          ["SOP-001","SOP-004","SOP-005","SOP-010","SOP-011","SOP-008","SOP-012","SOP-015"],
    "QA Specialist":       ["SOP-001","SOP-004","SOP-005","SOP-010","SOP-011","SOP-008"],
    "QC Analyst":          ["SOP-001","SOP-006","SOP-009","SOP-010","SOP-005","SOP-013"],
    "Lab Technician":      ["SOP-001","SOP-006","SOP-009","SOP-010","SOP-014"],
    "Production Operator": ["SOP-001","SOP-002","SOP-003","SOP-005"],
    "Production Supervisor":["SOP-001","SOP-002","SOP-003","SOP-005","SOP-011","SOP-012"],
    "Validation Engineer": ["SOP-001","SOP-007","SOP-008","SOP-010","SOP-012"],
    "Engineering Manager": ["SOP-001","SOP-007","SOP-008","SOP-010","SOP-011","SOP-012"],
    "Document Controller": ["SOP-001","SOP-005","SOP-010","SOP-012"],
    "HSE Coordinator":     ["SOP-001","SOP-003","SOP-009","SOP-008"],
    "HSE Specialist":      ["SOP-001","SOP-003","SOP-009","SOP-008"],
    "Warehouse Operator":  ["SOP-001","SOP-003","SOP-005"],
  };

  const requiredSops = requiredMap[emp.jobTitle] || ["SOP-001"];
  const isRequired = requiredSops.includes(sop.id);

  if (!isRequired) {
    return {
      employeeId: emp.id,
      sopId: sop.id,
      status: "NotRequired",
      lastTrainedDate: null,
      expiryDate: null,
      score: null,
      attempts: 0,
    };
  }

  // Deterministic status based on hash of ids
  const hash = (emp.id + sop.id).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const statusSeed = hash % 100;

  let status: CellStatus;
  let lastTrainedDate: string | null = null;
  let expiryDate: string | null = null;
  let score: number | null = null;
  let attempts = 0;

  // New employee logic: New employees always have "Required"
  if (emp.id === "EMP-NEW") {
    return {
      employeeId: emp.id,
      sopId: sop.id,
      status: "Required",
      lastTrainedDate: null,
      expiryDate: null,
      score: null,
      attempts: 0,
    };
  }

  if (statusSeed < 55) {
    // 55% Qualified
    status = "Qualified";
    lastTrainedDate = randomDate("01/01/2025", "31/12/2025");
    expiryDate = randomDate("01/06/2026", "01/06/2027");
    score = 75 + (hash % 26); // 75-100
    attempts = 1 + (hash % 2);
  } else if (statusSeed < 75) {
    // 20% InProgress
    status = "InProgress";
    lastTrainedDate = null;
    expiryDate = null;
    score = null;
    attempts = 0;
  } else {
    // 25% Required
    status = "Required";
    lastTrainedDate = null;
    expiryDate = null;
    score = null;
    attempts = 0;
  }

  return {
    employeeId: emp.id,
    sopId: sop.id,
    status,
    lastTrainedDate,
    expiryDate,
    score,
    attempts,
  };
};

// Build flat cell map: key = "EMP-001|SOP-001"
export const MOCK_CELLS: Map<string, TrainingCell> = new Map();

MOCK_EMPLOYEES.forEach((emp) => {
  MOCK_SOPS.forEach((sop) => {
    const cell = generateCell(emp, sop);
    MOCK_CELLS.set(`${emp.id}|${sop.id}`, cell);
  });
});

// Helper to get a cell
export const getCell = (employeeId: string, sopId: string): TrainingCell | undefined =>
  MOCK_CELLS.get(`${employeeId}|${sopId}`);

// ─── Compute KPIs ───────────────────────────────────────────────────
export const computeKPIs = (
  employees: EmployeeRow[],
  sops: SOPColumn[],
  cells: Map<string, TrainingCell>
): MatrixKPI => {
  let totalRequired = 0;
  let qualified = 0;
  let overdue = 0;
  let expiring = 0;

  employees.forEach((emp) => {
    sops.forEach((sop) => {
      const cell = cells.get(`${emp.id}|${sop.id}`);
      if (!cell || cell.status === "NotRequired") return;
      totalRequired++;
      if (cell.status === "Qualified") qualified++;
      if (cell.status === "Required") overdue++;
      if (cell.status === "InProgress") expiring++;
    });
  });

  return {
    complianceRate: totalRequired > 0 ? Math.round((qualified / totalRequired) * 100) : 0,
    totalOverdue: overdue,
    expiringSoon: expiring,
    daysUntilNextAudit: 42, // static for demo
  };
};

// ─── Filter Options ─────────────────────────────────────────────────
export const DEPARTMENT_OPTIONS = [
  { label: "All Departments", value: "All" },
  { label: "Quality Assurance", value: "Quality Assurance" },
  { label: "Quality Control", value: "Quality Control" },
  { label: "Production", value: "Production" },
  { label: "Engineering", value: "Engineering" },
  { label: "Documentation", value: "Documentation" },
  { label: "HSE", value: "HSE" },
  { label: "Supply Chain", value: "Supply Chain" },
];

export const JOB_TITLE_OPTIONS = [
  { label: "All Job Titles", value: "All" },
  { label: "QA Manager", value: "QA Manager" },
  { label: "QA Specialist", value: "QA Specialist" },
  { label: "QC Analyst", value: "QC Analyst" },
  { label: "Lab Technician", value: "Lab Technician" },
  { label: "Production Operator", value: "Production Operator" },
  { label: "Production Supervisor", value: "Production Supervisor" },
  { label: "Validation Engineer", value: "Validation Engineer" },
  { label: "Engineering Manager", value: "Engineering Manager" },
  { label: "Document Controller", value: "Document Controller" },
  { label: "HSE Coordinator", value: "HSE Coordinator" },
  { label: "HSE Specialist", value: "HSE Specialist" },
  { label: "Warehouse Operator", value: "Warehouse Operator" },
];

export const STATUS_OPTIONS = [
  { label: "All Statuses", value: "All" },
  { label: "Qualified", value: "Qualified" },
  { label: "In Progress", value: "InProgress" },
  { label: "Required", value: "Required" },
  { label: "Not Required", value: "NotRequired" },
];
// ─── Course Status ────────────────────────────────────────────────────────────

// TODO: Replace with API call: GET /api/training/courses/status
export const MOCK_COURSE_STATUS: CourseComplianceRecord[] = [
  {
    id: "1",
    courseId: "TRN-2026-001",
    courseTitle: "GMP Basic Principles",
    description: "Fundamental principles of Good Manufacturing Practice for all personnel.",
    courseType: "GMP",
    totalAssigned: 50,
    completed: 45,
    inProgress: 3,
    notStarted: 2,
    overdue: 0,
    averageScore: 88,
    department: "All Departments",
  },
  {
    id: "2",
    courseId: "TRN-2026-002",
    courseTitle: "Cleanroom Qualification",
    description: "Training on cleanroom classification and gowning procedures.",
    courseType: "Technical",
    totalAssigned: 25,
    completed: 20,
    inProgress: 4,
    notStarted: 1,
    overdue: 0,
    averageScore: 92,
    department: "Quality Assurance",
  },
  {
    id: "3",
    courseId: "TRN-2026-003",
    courseTitle: "HPLC Operation Advanced",
    description: "Advanced techniques for HPLC operation and troubleshooting.",
    courseType: "Technical",
    totalAssigned: 15,
    completed: 12,
    inProgress: 2,
    notStarted: 0,
    overdue: 1,
    averageScore: 85,
    department: "QC Lab",
  },
  {
    id: "4",
    courseId: "TRN-2026-004",
    courseTitle: "ISO 9001:2015 Requirements",
    description: "Understanding ISO 9001 quality management system requirements.",
    courseType: "Compliance",
    totalAssigned: 40,
    completed: 30,
    inProgress: 8,
    notStarted: 2,
    overdue: 0,
    averageScore: 79,
    department: "All Departments",
  },
  {
    id: "5",
    courseId: "TRN-2026-005",
    courseTitle: "SOP Review & Update Procedures",
    description: "Training on proper SOP review and revision processes.",
    courseType: "SOP",
    totalAssigned: 30,
    completed: 18,
    inProgress: 5,
    notStarted: 2,
    overdue: 5,
    averageScore: 81,
    department: "Documentation",
  },
  {
    id: "6",
    courseId: "TRN-2026-006",
    courseTitle: "Data Integrity & ALCOA+",
    description: "Data integrity principles and ALCOA+ requirements for GxP systems.",
    courseType: "Compliance",
    totalAssigned: 50,
    completed: 50,
    inProgress: 0,
    notStarted: 0,
    overdue: 0,
    averageScore: 94,
    department: "Quality Assurance",
  },
  {
    id: "7",
    courseId: "TRN-2026-007",
    courseTitle: "Validation Master Plan Review",
    description: "Master plan for facility, equipment, and process validation.",
    courseType: "Technical",
    totalAssigned: 12,
    completed: 12,
    inProgress: 0,
    notStarted: 0,
    overdue: 0,
    averageScore: 90,
    department: "Engineering",
  },
  {
    id: "8",
    courseId: "TRN-2026-008",
    courseTitle: "Fire Safety & Evacuation",
    description: "Standard procedures for fire safety and emergency evacuation.",
    courseType: "Safety",
    totalAssigned: 100,
    completed: 98,
    inProgress: 2,
    notStarted: 0,
    overdue: 0,
    averageScore: 85,
    department: "All Departments",
  },
];

import { CourseProgressInfo, EmployeeProgress } from "../types";

// ─── Course Progress Mock Data ────────────────────────────────────────────────
export const MOCK_PROGRESS_INFO: CourseProgressInfo = {
  id: "1",
  trainingId: "TRN-2026-001",
  title: "GMP Basic Principles",
  totalEnrolled: 25,
  completed: 15,
  inProgress: 5,
  notStarted: 3,
  overdue: 2,
  passRate: 87,
  averageScore: 8.2,
  passingScore: 7,
  passingGradeType: "score_10",
  dueDate: "2026-04-15",
};

export const MOCK_EMPLOYEE_PROGRESS: EmployeeProgress[] = [
  { userId: "EMP-1001", name: "Nguyen Van An", email: "an.nguyen@company.com", department: "QA", businessUnit: "Quality Unit", jobTitle: "QA Specialist", enrollmentStatus: "Completed", resultStatus: "Pass", score: 9, completedAt: "2026-02-10", examDate: "2026-02-10", attempts: 1 },
  { userId: "EMP-1002", name: "Tran Thi Binh", email: "binh.tran@company.com", department: "QC Lab", businessUnit: "Quality Unit", jobTitle: "Lab Technician", enrollmentStatus: "Completed", resultStatus: "Pass", score: 8, completedAt: "2026-02-11", examDate: "2026-02-11", attempts: 1 },
  { userId: "EMP-1003", name: "Le Van Cuong", email: "cuong.le@company.com", department: "Production", businessUnit: "Operation Unit", jobTitle: "Production Manager", enrollmentStatus: "Completed", resultStatus: "Fail", score: 5, completedAt: "2026-02-12", examDate: "2026-02-12", attempts: 2 },
  { userId: "EMP-1004", name: "Pham Thi Dung", email: "dung.pham@company.com", department: "QA", businessUnit: "Quality Unit", jobTitle: "QA Specialist", enrollmentStatus: "Completed", resultStatus: "Pass", score: 10, completedAt: "2026-02-09", examDate: "2026-02-09", attempts: 1 },
  { userId: "EMP-1005", name: "Hoang Van Em", email: "em.hoang@company.com", department: "R&D", businessUnit: "Operation Unit", jobTitle: "R&D Scientist", enrollmentStatus: "In-Progress", resultStatus: "Pending", score: null, completedAt: null, examDate: null, attempts: 0 },
  { userId: "EMP-1006", name: "Vo Thi Phuong", email: "phuong.vo@company.com", department: "Production", businessUnit: "Operation Unit", jobTitle: "Production Supervisor", enrollmentStatus: "Completed", resultStatus: "Pass", score: 7, completedAt: "2026-02-13", someOtherField: null, attempts: 2 } as any,
  { userId: "EMP-1007", name: "Dang Van Gia", email: "gia.dang@company.com", department: "QC Lab", businessUnit: "Quality Unit", jobTitle: "Senior Analyst", enrollmentStatus: "Overdue", resultStatus: "Pending", score: null, completedAt: null, examDate: null, attempts: 0 },
  { userId: "EMP-1008", name: "Bui Thi Hanh", email: "hanh.bui@company.com", department: "Engineering", businessUnit: "Operation Unit", jobTitle: "Senior Engineer", enrollmentStatus: "Not Started", resultStatus: "N/A", score: null, completedAt: null, examDate: null, attempts: 0 },
  { userId: "EMP-1009", name: "Ngo Van Ich", email: "ich.ngo@company.com", department: "Warehouse", businessUnit: "Operation Unit", jobTitle: "Warehouse Supervisor", enrollmentStatus: "Completed", resultStatus: "Pass", score: 8, completedAt: "2026-02-14", examDate: "2026-02-14", attempts: 1 },
  { userId: "EMP-1010", name: "Trinh Thi Kim", email: "kim.trinh@company.com", department: "QA", businessUnit: "Quality Unit", jobTitle: "QA Manager", enrollmentStatus: "Completed", resultStatus: "Pass", score: 9, completedAt: "2026-02-08", examDate: "2026-02-08", attempts: 1 },
  { userId: "EMP-1011", name: "Do Van Lam", email: "lam.do@company.com", department: "Production", businessUnit: "Operation Unit", jobTitle: "Operator", enrollmentStatus: "In-Progress", resultStatus: "Pending", score: null, completedAt: null, examDate: null, attempts: 0 },
  { userId: "EMP-1012", name: "Ly Thi Mai", email: "mai.ly@company.com", department: "R&D", businessUnit: "Operation Unit", jobTitle: "Research Associate", enrollmentStatus: "Completed", resultStatus: "Pass", score: 8, completedAt: "2026-02-15", examDate: "2026-02-15", attempts: 1 },
  { userId: "EMP-1013", name: "Truong Van Nam", email: "nam.truong@company.com", department: "Engineering", businessUnit: "Operation Unit", jobTitle: "Maintenance Technician", enrollmentStatus: "Not Started", resultStatus: "N/A", score: null, completedAt: null, examDate: null, attempts: 0 },
  { userId: "EMP-1014", name: "Huynh Thi Oanh", email: "oanh.huynh@company.com", department: "QC Lab", businessUnit: "Quality Unit", jobTitle: "Lab Supervisor", enrollmentStatus: "Completed", resultStatus: "Pass", score: 9, completedAt: "2026-02-10", examDate: "2026-02-10", attempts: 1 },
  { userId: "EMP-1015", name: "Phan Van Phuc", email: "phuc.phan@company.com", department: "Warehouse", businessUnit: "Operation Unit", jobTitle: "Logistics Coordinator", enrollmentStatus: "In-Progress", resultStatus: "Pending", score: null, completedAt: null, examDate: null, attempts: 0 },
  { userId: "EMP-1016", name: "Duong Thi Quynh", email: "quynh.duong@company.com", department: "QA", businessUnit: "Quality Unit", jobTitle: "Document Controller", enrollmentStatus: "Completed", resultStatus: "Pass", score: 8, completedAt: "2026-02-12", examDate: "2026-02-12", attempts: 1 },
  { userId: "EMP-1017", name: "Cao Van Rang", email: "rang.cao@company.com", department: "Production", businessUnit: "Operation Unit", jobTitle: "Operator", enrollmentStatus: "Overdue", resultStatus: "Pending", score: null, completedAt: null, examDate: null, attempts: 0 },
  { userId: "EMP-1018", name: "Ta Thi Son", email: "son.ta@company.com", department: "Engineering", businessUnit: "Operation Unit", jobTitle: "Calibration Technician", enrollmentStatus: "Completed", resultStatus: "Pass", score: 7, completedAt: "2026-02-16", examDate: "2026-02-16", attempts: 3 },
  { userId: "EMP-1019", name: "Mai Van Tuan", email: "tuan.mai@company.com", department: "QC Lab", businessUnit: "Quality Unit", jobTitle: "Microbiologist", enrollmentStatus: "In-Progress", resultStatus: "Pending", score: null, completedAt: null, examDate: null, attempts: 0 },
  { userId: "EMP-1020", name: "Luu Thi Uyen", email: "uyen.luu@company.com", department: "QA", businessUnit: "Quality Unit", jobTitle: "QA Specialist", enrollmentStatus: "Completed", resultStatus: "Pass", score: 10, completedAt: "2026-02-09", examDate: "2026-02-09", attempts: 1 },
  { userId: "EMP-1021", name: "Dinh Van Vinh", email: "vinh.dinh@company.com", department: "Production", businessUnit: "Operation Unit", jobTitle: "Shift Leader", enrollmentStatus: "Completed", resultStatus: "Pass", score: 8, completedAt: "2026-02-17", examDate: "2026-02-17", attempts: 1 },
  { userId: "EMP-1022", name: "Ha Thi Xuan", email: "xuan.ha@company.com", department: "R&D", businessUnit: "Operation Unit", jobTitle: "Formulation Scientist", enrollmentStatus: "Not Started", resultStatus: "N/A", score: null, completedAt: null, examDate: null, attempts: 0 },
  { userId: "EMP-1023", name: "Tong Van Yen", email: "yen.tong@company.com", department: "Warehouse", businessUnit: "Operation Unit", jobTitle: "Receiving Inspector", enrollmentStatus: "In-Progress", resultStatus: "Pending", score: null, completedAt: null, examDate: null, attempts: 0 },
  { userId: "EMP-1024", name: "Chu Thi Zen", email: "zen.chu@company.com", department: "Engineering", businessUnit: "Operation Unit", jobTitle: "Process Engineer", enrollmentStatus: "Completed", resultStatus: "Pass", score: 9, completedAt: "2026-02-18", examDate: "2026-02-18", attempts: 1 },
  { userId: "EMP-1025", name: "Lam Van Anh", email: "anh.lam@company.com", department: "QA", businessUnit: "Quality Unit", jobTitle: "Validation Specialist", enrollmentStatus: "Exempt", resultStatus: "N/A", score: null, completedAt: null, examDate: null, attempts: 0 },
];

export const MOCK_AUTO_RULES: AutoAssignmentRule[] = [
  {
    ruleId: "ARU-001",
    name: "New Hire Orientation",
    description: "Assign basic GMP and Safety training to all new employees.",
    trigger: "new_employee",
    triggerConditions: {},
    courseFilter: { mandatory: true },
    targetScope: "individual",
    priority: "High",
    deadlineDays: 14,
    requiresESign: true,
    trainingBeforeAuthorized: true,
    notifyManager: true,
    reminderDays: [3, 7],
    isActive: true,
    createdBy: "EMP-001",
    createdAt: "2025-01-01T00:00:00Z",
    approvedBy: "EMP-001",
    approvedAt: "2025-01-05T00:00:00Z",
    triggerCount: 12,
  },
  {
    ruleId: "ARU-002",
    name: "Annual GMP Refresher",
    description: "Annual retraining for all staff on GMP principles.",
    trigger: "recurrence",
    triggerConditions: {},
    courseFilter: { categories: ["GMP"] },
    targetScope: "business_unit",
    priority: "Medium",
    deadlineDays: 30,
    requiresESign: false,
    trainingBeforeAuthorized: false,
    notifyManager: true,
    reminderDays: [7, 14],
    isActive: true,
    createdBy: "EMP-003",
    createdAt: "2025-01-10T00:00:00Z",
    approvedBy: "EMP-001",
    approvedAt: "2025-01-12T00:00:00Z",
    triggerCount: 150,
  },
  {
    ruleId: "ARU-003",
    name: "SOP Revision Training",
    description: "Assign retraining when document revision occurs.",
    trigger: "doc_revision",
    triggerConditions: {},
    courseFilter: { categories: ["SOP"] },
    targetScope: "department",
    priority: "High",
    deadlineDays: 14,
    requiresESign: true,
    trainingBeforeAuthorized: true,
    notifyManager: false,
    reminderDays: [3],
    isActive: false,
    createdBy: "EMP-001",
    createdAt: "2025-02-01T00:00:00Z",
    triggerCount: 0,
  },
  {
    ruleId: "ARU-004",
    name: "Audit Finding Response",
    description: "Assign immediate safety protocol refresher following external audit notes.",
    trigger: "audit_finding",
    triggerConditions: {},
    courseFilter: { categories: ["Safety"] },
    targetScope: "department",
    priority: "Critical",
    deadlineDays: 7,
    requiresESign: true,
    trainingBeforeAuthorized: false,
    notifyManager: true,
    reminderDays: [2, 5],
    isActive: true,
    createdBy: "EMP-001",
    createdAt: "2025-03-01T00:00:00Z",
    approvedBy: "EMP-001",
    approvedAt: "2025-03-02T00:00:00Z",
    triggerCount: 3,
  },
  {
    ruleId: "ARU-005",
    name: "New Regulatory Guidelines (EU-GMP)",
    description: "Mandatory training on the latest EU-GMP Annex 1 update.",
    trigger: "regulatory_update",
    triggerConditions: { departments: ["Quality Assurance", "Production"] },
    courseFilter: { categories: ["GMP", "Compliance"] },
    targetScope: "department",
    priority: "High",
    deadlineDays: 30,
    requiresESign: true,
    trainingBeforeAuthorized: true,
    notifyManager: true,
    reminderDays: [10, 20],
    isActive: true,
    createdBy: "EMP-003",
    createdAt: "2025-03-10T00:00:00Z",
    approvedBy: "EMP-001",
    approvedAt: "2025-03-12T00:00:00Z",
    triggerCount: 0,
  },
  {
    ruleId: "ARU-006",
    name: "Process Change: Packaging Line",
    description: "Training required for the new automated packaging line deployment.",
    trigger: "process_change",
    triggerConditions: { departments: ["Production", "Engineering"] },
    courseFilter: { specificCourseIds: ["TRN-PKG-01"] },
    targetScope: "department",
    priority: "High",
    deadlineDays: 14,
    requiresESign: true,
    trainingBeforeAuthorized: true,
    notifyManager: false,
    reminderDays: [3, 7],
    isActive: false,
    createdBy: "EMP-011",
    createdAt: "2025-03-15T00:00:00Z",
    triggerCount: 0,
  }
];

export const MOCK_COURSE_ASSIGNMENTS: Record<string, string[]> = {
  "course-1": ["qa"],
  "course-2": ["safety"],
  "course-3": ["qc", "production"],
  "course-4": ["qa", "qc", "production"],
  "TRN-2026-001": ["Quality Assurance", "Quality Control", "Production"],
  "TRN-2026-003": ["HSE", "Engineering"],
};
