// User Management Type Definitions

export type UserRole = "SuperAdmin" | "Admin" | "QA" | "QA Manager" | "Manager" | "Document Owner" | "Reviewer" | "Approver" | "Viewer";
export type UserStatus = "Active" | "Inactive" | "Pending" | "Suspended" | "Terminated";

export interface TableColumn {
  id: string;
  label: string;
  visible: boolean;
  order: number;
  locked?: boolean;
}

export type UserGender = "Male" | "Female" | "Other";
export type EmploymentType = "Full-time" | "Part-time" | "Contract" | "Intern";

export interface Certification {
  id: string;
  name: string;
  issuingOrg: string;
  issueDate?: string;
  expiryDate?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  fileObjectUrl?: string;
}

export interface EducationItem {
  id: string;
  degree: string;
  fieldOfStudy: string;
  institution: string;
  graduationYear: string;
  gpa: string;
}

export interface User {
  id: string;
  employeeCode: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  role: UserRole;
  businessUnit: string;
  department: string;
  status: UserStatus;
  lastLogin: string;
  createdDate: string;
  firstName?: string;
  lastName?: string;
  permissions: string[];
  // Extended profile fields
  position?: string;
  dateOfBirth?: string;
  gender?: UserGender;
  nationality?: string;
  address?: string;
  employmentType?: EmploymentType;
  startDate?: string;
  managerName?: string;
  language?: string;
  idNumber?: string;
  // Education & Qualifications
  degree?: string;
  fieldOfStudy?: string;
  institution?: string;
  graduationYear?: string;
  gpa?: string;
  educationList?: EducationItem[];
  professionalLevel?: string;
  areaOfExpertise?: string;
  yearsOfExperience?: string;
  previousEmployer?: string;
  certifications?: Certification[];
  // Employment status tracking
  suspendReason?: string;
  suspendedUntil?: string;
  terminationReason?: string;
  terminationDate?: string;
}

/** Payload for creating a new user (all User fields except server-generated ones) */
export type CreateUserPayload = Omit<User, "id" | "lastLogin" | "createdDate">;

/** Backward-compatible alias */
export type NewUser = CreateUserPayload;

// --- API Payload Types ---

export interface SuspendUserPayload {
  reason: string;
  suspendedUntil?: string;
}

export interface TerminateUserPayload {
  reason: string;
  terminationDate: string;
}

export interface ResetPasswordPayload {
  newPassword: string;
}

// --- Filter Types ---

export interface UserFilters {
  search: string;
  role: UserRole | "All";
  status: UserStatus | "All";
  businessUnit: string;
  department: string;
  dateFrom: string;
  dateTo: string;
  suspendFrom: string;
  suspendTo: string;
  terminateFrom: string;
  terminateTo: string;
}

