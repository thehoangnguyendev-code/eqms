/**
 * Records & Archive Types
 *
 * Types for the Records Archive feature (Employee Training Files, Export Records).
 * Import from here instead of re-declaring in each view file.
 */

// ─── Employee Training File ───────────────────────────────────────────────────
export interface EmployeeTrainingFile {
  id: string;
  employeeId: string;
  employeeName: string;
  jobPosition: string;
  department: string;
  totalCoursesRequired: number;
  coursesCompleted: number;
  coursesInProgress: number;
  coursesOverdue: number;
  lastTrainingDate: string;
  averageScore: number;
}

// ─── Filter State ─────────────────────────────────────────────────────────────
export interface EmployeeFilters {
  searchQuery: string;
  departmentFilter: string;
  positionFilter: string;
}
