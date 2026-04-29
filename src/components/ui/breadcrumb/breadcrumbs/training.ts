import type { BreadcrumbItem } from "../Breadcrumb";
import { dashboard } from "./shared";

export const trainingMaterials = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "Training Management" },
  { label: "Training Materials", isActive: true },
];

export const uploadMaterial = (_navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Training Management" },
  { label: "Training Materials" },
  { label: "Upload Material", isActive: true },
];

export const materialDetail = (_navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Training Management" },
  { label: "Training Materials" },
  { label: "Material Detail", isActive: true },
];

export const materialEdit = (_navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Training Management" },
  { label: "Training Materials" },
  { label: "Edit Training Material", isActive: true },
];

export const materialNewRevision = (_navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Training Management" },
  { label: "Training Materials" },
  { label: "Upgrade Revision", isActive: true },
];

export const materialUsageReport = (_navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Training Management" },
  { label: "Training Materials" },
  { label: "Usage Report", isActive: true },
];

export const materialReview = (_navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Training Management" },
  { label: "Training Materials" },
  { label: "Review Material", isActive: true },
];

export const materialApproval = (_navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Training Management" },
  { label: "Training Materials" },
  { label: "Approve Material", isActive: true },
];

export const coursesList = (_navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Training Management" },
  { label: "Course Inventory" },
  { label: "Courses List", isActive: true },
];

export const courseDetail = (_navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Training Management" },
  { label: "Course Inventory" },
  { label: "Course Detail", isActive: true },
];

export const courseDetailFromAssignment = (_navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Training Management" },
  { label: "Compliance Tracking" },
  { label: "Training Matrix" },
  { label: "New Training Assignment", onClick: () => _navigate?.(ROUTES.TRAINING.ASSIGNMENT_NEW) },
  { label: "Course Detail", isActive: true },
];

export const courseEdit = (_navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Training Management" },
  { label: "Course Inventory" },
  { label: "Edit Course", isActive: true },
];

export const courseCreate = (_navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Training Management" },
  { label: "Course Inventory" },
  { label: "Create Training", isActive: true },
];

export const courseProgress = (_navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Training Management" },
  { label: "Compliance Tracking" },
  { label: "Course Status" },
  { label: "Training Progress", isActive: true },
];

export const courseResultEntry = (_navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Training Management" },
  { label: "Course Status" },
  { label: "Result Entry", isActive: true },
];

export const coursePendingApproval = (_navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Training Management" },
  { label: "Course Inventory" },
  { label: "Pending Approval", isActive: true },
];

export const coursePendingReview = (_navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Training Management" },
  { label: "Course Inventory" },
  { label: "Pending Review", isActive: true },
];

export const trainingMatrix = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "Training Management" },
  { label: "Compliance Tracking" },
  { label: "Training Matrix", isActive: true },
];

export const courseStatus = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "Training Management" },
  { label: "Compliance Tracking" },
  { label: "Course Status", isActive: true },
];

export const employeeTrainingFiles = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "Training Management" },
  { label: "Records & Archive" },
  { label: "Employee Training Files", isActive: true },
];

import { ROUTES } from "@/app/routes.constants";

export const exportRecords = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "Training Management" },
  { label: "Records & Archive" },
  { label: "Export Records", isActive: true },
];

export const employeeDossier = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "Training Management" },
  { label: "Records & Archive" },
  { label: "Employee Training Files", onClick: () => navigate?.(ROUTES.TRAINING.EMPLOYEE_TRAINING_FILES) },
  { label: "Employee Dossier", isActive: true },
];

export const assignTraining = (_navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(_navigate),
  { label: "Training Management" },
  { label: "Compliance Tracking" },
  { label: "Training Matrix" },
  { label: "New Training Assignment", isActive: true },
];

export const assignmentRules = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "Training Management" },
  { label: "Compliance Tracking" },
  { label: "Auto-Assignment Rules", isActive: true },
];

export const myTraining = (navigate?: (path: string) => void): BreadcrumbItem[] => [
  dashboard(navigate),
  { label: "Training Management" },
  { label: "My Training", isActive: true },
];
