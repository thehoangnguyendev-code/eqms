export {
  CourseListView,
  CreateCourseView,
  PendingReviewView,
  PendingApprovalView,
  ReviewCourseView,
  ApproveCourseView,
  CourseDetailView,
  EditCourseView,
} from "./course-inventory";

// Materials
export * from "./materials";

export * from "./compliance-tracking";
export * from "./my-training";

// Records & Archive
export { EmployeeTrainingFilesView } from "./records-archive/EmployeeTrainingFilesView";
export { ExportRecordsView } from "./records-archive/ExportRecordsView";

export type {
  TrainingRecord,
  TrainingFilters,
  TrainingStatus,
  TrainingType,
  Attendee,
  AttendanceStatus,
  TrainingConfig,
  Question,
  QuestionOption,
  QuestionType,
  TrainingTestType,
  CourseApproval,
  CourseApprovalStatus,
  CourseWorkflowStatus,
} from "./types";
