import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTES } from "@/app/routes.constants";
import {
  Check,
} from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb/Breadcrumb";
import { courseDetail } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { FullPageLoading } from "@/components/ui/loading/Loading";
import { Button } from "@/components/ui/button/Button";
import { cn } from "@/components/ui/utils";
import { getStatusColorClass } from "@/utils/status";
import {
  TrainingStatus,
} from "../../types";
import { BasicInfoTab } from "../shared/BasicInfoTab";
import { DocumentTab } from "../shared/DocumentTab";
import { ConfigTab } from "../shared/ConfigTab";
import { MOCK_COURSES } from "./mockData";

// Tab types
type TabType = "basic-info" | "document-training" | "training-config";

const TABS: { id: TabType; label: string }[] = [
  { id: "basic-info", label: "Basic Information" },
  { id: "document-training", label: "Training Materials" },
  { id: "training-config", label: "Assessment Config" },
];

// Workflow stepper steps
const WORKFLOW_STEPS = [
  "Draft",
  "Pending Review",
  "Pending Approval",
  "Effective",
  "Obsoleted",
] as const;

const getWorkflowStepForStatus = (status: TrainingStatus) => {
  // Mapping training status to workflow step
  switch (status) {
    case "Draft":
      return 0;
    case "Pending Review":
      return 1;
    case "Pending Approval":
      return 2;
    case "Effective":
      return 3;
    case "Obsoleted":
      return 4;
    default:
      return 0;
  }
};

export const CourseDetailView: React.FC = () => {
  const navigate = useNavigate();
  const { courseId = "" } = useParams<{ courseId: string }>();
  const [activeTab, setActiveTab] = useState<TabType>("basic-info");
  const [isNavigating, setIsNavigating] = useState(false);

  const handleNavigate = (path: string | number) => {
    setIsNavigating(true);
    setTimeout(() => navigate(path as any), 600);
  };

  // Find course by ID
  const course = MOCK_COURSES.find((c) => c.id === courseId);

  if (!course) {
    return (
      <div className="space-y-6 w-full flex-1 flex flex-col">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNavigate(-1)}
            className="gap-2"
          >
            Back
          </Button>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-lg font-medium text-slate-900">Course not found</p>
          <p className="text-sm text-slate-500 mt-1">
            The requested training course does not exist.
          </p>
        </div>
      </div>
    );
  }

  const currentStepIndex = getWorkflowStepForStatus(course.status);

  const renderTabContent = () => {
    switch (activeTab) {
      case "basic-info":
        return (
          <BasicInfoTab
            readOnly
            courseId={course.trainingId}
            title={course.title}
            description={course.description || ""}
            trainingType={course.type}
            trainingMethod={course.trainingMethod}
            instructorType={course.instructorType}
            instructor={course.instructor}
            scheduledDate={course.scheduledDate}
            duration={course.duration}
            location={course.location}
            capacity={course.capacity}
            recurrence={
              course.recurrence || { enabled: false, intervalMonths: 0, warningPeriodDays: 30 }
            }
            linkedDocumentId={course.linkedDocumentId}
            linkedDocumentTitle={course.linkedDocumentTitle}
            evidenceFiles={[]}
          />
        );
      case "document-training":
        return (
          <DocumentTab
            readOnly
            trainingFiles={course.trainingFiles}
            instruction={course.instruction}
          />
        );
      case "training-config":
        return (
          <ConfigTab
            readOnly
            trainingMethod={course.trainingMethod}
            examTemplateName={course.examTemplate}
            answerKeyName={course.answerKey}
            passingGradeType={course.passingGradeType}
            passingScore={course.passScore}
            maxAttempts={course.maxAttempts}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 w-full flex-1 flex flex-col">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3 lg:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg md:text-xl lg:text-2xl font-bold tracking-tight text-slate-900">
            Course Detail
          </h1>
          <Breadcrumb items={courseDetail(navigate)} />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          <Button
            variant="outline-emerald"
            size="sm"
            onClick={() => handleNavigate(-1)}
            className="whitespace-nowrap"
          >
            Back
          </Button>
          <Button
            variant="outline-emerald"
            size="sm"
            onClick={() => handleNavigate(ROUTES.TRAINING.COURSE_EDIT(courseId))}
            className="whitespace-nowrap"
          >
            Edit Course
          </Button>
          <Button
            variant="outline-emerald"
            size="sm"
            onClick={() => handleNavigate(ROUTES.TRAINING.COURSE_PROGRESS(courseId))}
            className="whitespace-nowrap"
          >
            View Progress
          </Button>
          {course.trainingMethod === "Quiz (Paper-based/Manual)" && (
            <Button
              variant="outline-emerald"
              size="sm"
              onClick={() =>
                handleNavigate(ROUTES.TRAINING.COURSE_RESULT_ENTRY(courseId))
              }
              className="whitespace-nowrap"
            >
              Result Entry
            </Button>
          )}
        </div>
      </div>

      {/* Status Workflow Stepper */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
          <div className="flex items-stretch min-w-full">
            {WORKFLOW_STEPS.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isFirst = index === 0;
              const isLast = index === WORKFLOW_STEPS.length - 1;
              return (
                <div
                  key={step}
                  className="relative flex-1 flex items-center justify-center min-w-[140px]"
                  style={{ minHeight: "56px" }}
                >
                  <div
                    className={cn(
                      "absolute inset-0 transition-all",
                      isCompleted
                        ? "bg-emerald-100"
                        : isCurrent
                          ? "bg-emerald-600"
                          : "bg-slate-100",
                    )}
                    style={{
                      clipPath: isFirst
                        ? "polygon(0% 0%, calc(100% - 20px) 0%, 100% 50%, calc(100% - 20px) 100%, 0% 100%)"
                        : isLast
                          ? "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 20px 50%)"
                          : "polygon(0% 0%, calc(100% - 20px) 0%, 100% 50%, calc(100% - 20px) 100%, 0% 100%, 20px 50%)",
                    }}
                  />
                  <div className="relative z-10 flex items-center gap-2 px-6">
                    {isCompleted && (
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    )}
                    <span
                      className={cn(
                        "text-xs md:text-sm font-medium text-center whitespace-nowrap",
                        isCurrent
                          ? "text-white"
                          : isCompleted
                            ? "text-slate-700"
                            : "text-slate-400",
                      )}
                    >
                      {step}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Course Summary Card */}
      <div className="bg-white p-4 lg:p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs text-slate-500">{course.trainingId}</span>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
              getStatusColorClass(course.status),
            )}
          >
            {course.status}
          </span>
          {course.mandatory && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
              Mandatory
            </span>
          )}
        </div>
        <h2 className="text-base lg:text-lg font-semibold text-slate-900 mt-1">
          {course.title}
        </h2>
      </div>

      {/* Tab Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-slate-200">
          <div className="flex overflow-x-auto">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 sm:px-4 md:px-6 py-2.5 text-xs sm:text-sm font-medium whitespace-nowrap border-b-2 transition-colors border-r border-slate-200 last:border-r-0",
                    isActive
                      ? "border-b-emerald-600 text-emerald-700 bg-emerald-50/50"
                      : "border-b-transparent text-slate-600 hover:text-emerald-600 hover:bg-slate-50",
                  )}
                >
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in duration-200">
          {renderTabContent()}
        </div>
      </div>

      {/* Footer Action Buttons */}
      <div className="flex items-center gap-2 md:gap-3 flex-wrap">
        <Button
          variant="outline-emerald"
          size="sm"
          onClick={() => handleNavigate(ROUTES.TRAINING.COURSES_LIST)}
          className="whitespace-nowrap"
        >
          Back
        </Button>
        <Button
          variant="outline-emerald"
          size="sm"
          onClick={() => handleNavigate(ROUTES.TRAINING.COURSE_EDIT(courseId))}
          className="whitespace-nowrap"
        >
          Edit Course
        </Button>
        <Button
          variant="outline-emerald"
          size="sm"
          onClick={() => handleNavigate(ROUTES.TRAINING.COURSE_PROGRESS(courseId))}
          className="whitespace-nowrap"
        >
          View Progress
        </Button>
        {course.trainingMethod === "Quiz (Paper-based/Manual)" && (
          <Button
            variant="outline-emerald"
            size="sm"
            onClick={() =>
              handleNavigate(ROUTES.TRAINING.COURSE_RESULT_ENTRY(courseId))
            }
            className="whitespace-nowrap"
          >
            Result Entry
          </Button>
        )}
      </div>

      {/* ─── Loading Overlay ──────────────────────────────────── */}
      {isNavigating && <FullPageLoading text="Loading..." />}
    </div>
  );
};
