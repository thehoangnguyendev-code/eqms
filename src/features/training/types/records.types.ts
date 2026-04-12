/**
 * Records & Archive Types
 *
 * Types for the Records Archive feature (Employee Training Files, Export Records).
 * Import from here instead of re-declaring in each view file.
 */

export interface OJTRecord {
  id: string;
  taskName: string;
  trainerName: string;
  dateCompleted: string;
  status: 'Completed' | 'Pending' | 'In-Progress';
  assessmentScore?: number;
  comments?: string;
  esignReason?: string;
}

export interface TaskAuthorization {
  id: string;
  taskTitle: string;
  authorizedDate: string;
  expiryDate?: string;
  status: 'Active' | 'Expired' | 'Suspended';
  signedBy: string;
}

// ─── Employee Training File ───────────────────────────────────────────────────
export interface EmployeeTrainingFile {
  id: string;
  employeeId: string;
  employeeName: string;
  jobPosition: string;
  department: string;
  businessUnit: string; // Added
  email: string; // Added
  totalCoursesRequired: number;
  coursesCompleted: number;
  coursesInProgress: number;
  coursesOverdue: number;
  coursesObsolete: number; // Added for versioning support
  lastTrainingDate: string;
  nextDeadline?: string; // Added to prioritise overdue/obsolete
  averageScore: number;
  ojtRecords?: OJTRecord[];
  authorizations?: TaskAuthorization[];
  isNewHire?: boolean; // For hero banner logic
}

// ─── Filter State ─────────────────────────────────────────────────────────────
export interface EmployeeFilters {
  searchQuery: string;
  departmentFilter: string;
  positionFilter: string;
  complianceStatus: 'All' | 'Fully Compliant' | 'Has Gaps' | 'Has Obsolete Records';
}
