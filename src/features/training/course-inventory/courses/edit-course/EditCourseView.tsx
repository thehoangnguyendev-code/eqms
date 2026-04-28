import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTES } from "@/app/routes.constants";
import { PageHeader } from "@/components/ui/page/PageHeader";
import { courseEdit } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { Check } from "lucide-react";
import { cn } from "@/components/ui/utils";
import { Button } from "@/components/ui/button/Button";
import { ButtonLoading, FullPageLoading } from "@/components/ui/loading/Loading";
import { AlertModal, AlertModalType } from "@/components/ui/modal/AlertModal";
import {
  TrainingConfig,
  TrainingType,
  TrainingFile,
  TrainingMethod,
  Recurrence,
} from "../../../types";
import { BasicInfoTab } from "../../shared/BasicInfoTab";
import { DocumentTab } from "../../shared/DocumentTab";
import { ConfigTab } from "../../shared/ConfigTab";
import { MOCK_COURSES, MOCK_TRAININGS } from "../mockData";

type TabType = "basic-info" | "document-training" | "training-config";

const TABS: { id: TabType; label: string }[] = [
  { id: "basic-info", label: "Basic Information" },
  { id: "document-training", label: "Training Materials" },
  { id: "training-config", label: "Assessment Config" },
];

const WORKFLOW_STEPS = [
  "Draft",
  "Pending Review",
  "Pending Approval",
  "Approved",
  "Obsoleted",
] as const;

// Mock existing course data — in real app, fetch from API by courseId
const MOCK_COURSE_DATA = {
  id: "1",
  trainingId: "TRN-2026-001",
  title: "GMP Basic Principles",
  description:
    "This comprehensive training covers the fundamental principles of Good Manufacturing Practice (GMP) required for all personnel working in pharmaceutical manufacturing environments.",
  trainingType: "GMP" as TrainingType,
  trainingMethod: "Quiz (Paper-based/Manual)" as TrainingMethod,
  instructorType: "internal" as "internal" | "external",
  instructor: "Dr. Sarah Williams",
  scheduledDate: "2026-03-15",
  duration: 4,
  location: "Training Room A",
  capacity: 25,
  linkedDocumentId: "DOC-001",
  linkedDocumentTitle: "SOP-QA-001: Good Manufacturing Practices",
  recurrence: { enabled: true, intervalMonths: 12, warningPeriodDays: 30 } as Recurrence,
  instruction:
    "Focus on Chapter 3 (Cleaning Validation) and Appendix B (Equipment Handling). Review all SOPs referenced in Section 2.4 before the training session.",
  trainingFiles: [
    {
      id: "tf-001",
      file: null as any,
      name: "GMP_Training_Materials_2026.pdf",
      size: 2456789,
      type: "application/pdf",
      progress: 100,
      status: "success" as const,
    },
    {
      id: "tf-002",
      file: null as any,
      name: "GMP_Presentation_Slides.pptx",
      size: 8765432,
      type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      progress: 100,
      status: "success" as const,
    },
  ],
  workflowStep: 3, // Approved
};

export const EditCourseView: React.FC = () => {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const [activeTab, setActiveTab] = useState<TabType>("basic-info");

  // In real app, fetch course data by courseId
  const courseDataFromMocks = (MOCK_COURSES.find((c) => c.id === courseId) ||
    (MOCK_TRAININGS.find((t) => t.id === courseId) as any))
    || MOCK_COURSE_DATA;
  const courseData = courseDataFromMocks;

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<AlertModalType>("info");
  const [modalTitle, setModalTitle] = useState("");
  const [modalDescription, setModalDescription] = useState("");
  const [modalAction, setModalAction] = useState<(() => void) | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Basic Training Info — pre-populated from course data
  const [title, setTitle] = useState(courseData.title);
  const [description, setDescription] = useState(courseData.description);
  const [trainingType, setTrainingType] = useState<TrainingType>(courseData.trainingType);
  const [trainingMethod, setTrainingMethod] = useState<TrainingMethod>(courseData.trainingMethod);
  const [instructorType, setInstructorType] = useState<"internal" | "external">(
    courseData.instructorType
  );
  const [instructor, setInstructor] = useState(courseData.instructor);
  const [scheduledDate, setScheduledDate] = useState(courseData.scheduledDate);
  const [duration, setDuration] = useState(courseData.duration);
  const [location, setLocation] = useState(courseData.location);
  const [capacity, setCapacity] = useState(courseData.capacity);

  // Linked document
  const [linkedDocumentId, setLinkedDocumentId] = useState(courseData.linkedDocumentId);
  const [linkedDocumentTitle, setLinkedDocumentTitle] = useState(courseData.linkedDocumentTitle);

  // Recurrence
  const [recurrence, setRecurrence] = useState<Recurrence>(
    courseData.recurrence || { enabled: false, intervalMonths: 0, warningPeriodDays: 30 }
  );

  // Evidence upload
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);

  // Training Materials — pre-populated
  const [trainingFiles, setTrainingFiles] = useState<TrainingFile[]>(courseData.trainingFiles || []);
  const [instruction, setInstruction] = useState(courseData.instruction);

  // Quiz Configuration
  const [hasQuiz, setHasQuiz] = useState(false);
  const [config, setConfig] = useState<TrainingConfig>({
    trainingType: "test_certification",
    passingScore: 7,
    maxAttempts: 3,
    trainingPeriodDays: 7,
    distributionList: [],
    questions: [],
  });

  const handleCancel = () => {
    setModalType("confirm");
    setModalTitle("Discard Changes?");
    setModalDescription(
      "Are you sure you want to cancel? All unsaved changes will be lost."
    );
    setModalAction(() => () => {
      navigate(-1);
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    // Validation
    if (!title.trim()) {
      setModalType("error");
      setModalTitle("Validation Error");
      setModalDescription("Please enter training title.");
      setModalAction(null);
      setIsModalOpen(true);
      return;
    }

    if (!instructor.trim()) {
      setModalType("error");
      setModalTitle("Validation Error");
      setModalDescription("Please enter instructor name.");
      setModalAction(null);
      setIsModalOpen(true);
      return;
    }

    if (!scheduledDate) {
      setModalType("error");
      setModalTitle("Validation Error");
      setModalDescription("Please select scheduled date.");
      setModalAction(null);
      setIsModalOpen(true);
      return;
    }

    if (!location.trim()) {
      setModalType("error");
      setModalTitle("Validation Error");
      setModalDescription("Please enter training location.");
      setModalAction(null);
      setIsModalOpen(true);
      return;
    }

    await performSave();
  };

  const performSave = async () => {
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const updatedCourse = {
        id: courseId,
        title,
        description,
        trainingType,
        trainingMethod,
        instructorType,
        instructor,
        scheduledDate,
        duration,
        location,
        capacity,
        linkedDocumentId,
        linkedDocumentTitle,
        recurrence,
        trainingFiles: trainingFiles.map((f) => ({
          name: f.name,
          size: f.size,
          type: f.type,
        })),
        instruction,
        hasQuiz,
        config: hasQuiz ? config : undefined,
      };

      setIsLoading(false);
      setModalType("success");
      setModalTitle("Course Updated Successfully");
      setModalDescription(
        "The training course has been updated. Changes will be reflected immediately."
      );
      setModalAction(() => () => {
        navigate(-1);
      });
      setIsModalOpen(true);
    } catch (error) {
      setIsLoading(false);
      setModalType("error");
      setModalTitle("Save Failed");
      setModalDescription(
        "An error occurred while saving the course. Please try again."
      );
      setModalAction(null);
      setIsModalOpen(true);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "basic-info":
        return (
          <BasicInfoTab
            courseId={courseData.trainingId}
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            trainingType={trainingType}
            setTrainingType={setTrainingType}
            trainingMethod={trainingMethod}
            setTrainingMethod={setTrainingMethod}
            instructorType={instructorType}
            setInstructorType={setInstructorType}
            instructor={instructor}
            setInstructor={setInstructor}
            scheduledDate={scheduledDate}
            setScheduledDate={setScheduledDate}
            duration={duration}
            setDuration={setDuration}
            location={location}
            setLocation={setLocation}
            capacity={capacity}
            setCapacity={setCapacity}
            recurrence={recurrence}
            setRecurrence={setRecurrence}
            linkedDocumentId={linkedDocumentId}
            setLinkedDocumentId={setLinkedDocumentId}
            linkedDocumentTitle={linkedDocumentTitle}
            setLinkedDocumentTitle={setLinkedDocumentTitle}
            evidenceFiles={evidenceFiles}
            setEvidenceFiles={setEvidenceFiles}
          />
        );
      case "document-training":
        return (
          <DocumentTab
            trainingFiles={trainingFiles}
            setTrainingFiles={setTrainingFiles}
            instruction={instruction}
            setInstruction={setInstruction}
          />
        );
      case "training-config":
        return <ConfigTab trainingMethod={trainingMethod} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 w-full flex-1 flex flex-col">
      {/* Header */}
      <PageHeader
        title="Edit Course"
        breadcrumbItems={courseEdit(navigate)}
        actions={
          <>
            <Button variant="outline-emerald" onClick={handleCancel} size="sm" className="whitespace-nowrap">
              Cancel
            </Button>
            <Button
              variant="outline-emerald"
              onClick={handleSave}
              size="sm"
              className="whitespace-nowrap"
              disabled={isLoading}
            >
              {isLoading ? <ButtonLoading text="Saving..." /> : "Save Changes"}
            </Button>
          </>
        }
      />

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 md:p-5 flex items-start gap-3">
        <div>
          <p className="text-sm font-medium text-blue-800">
            Editing: {courseData.trainingId} — {courseData.title}
          </p>
          <p className="text-xs text-blue-600 mt-0.5">
            Changes will create a new revision. The course will need re-approval if the training method or assessment config is modified.
          </p>
        </div>
      </div>

      {/* Status Workflow Stepper */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
          <div className="flex items-stretch min-w-full">
            {WORKFLOW_STEPS.map((step, index) => {
              const isCompleted = index < courseData.workflowStep;
              const isCurrent = index === courseData.workflowStep;
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
                          : "bg-slate-100"
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
                            : "text-slate-400"
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
                      : "border-b-transparent text-slate-600 hover:text-emerald-600 hover:bg-slate-50"
                  )}
                >
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in duration-200">{renderTabContent()}</div>
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={
          modalAction
            ? () => {
              setIsNavigating(true);
              setTimeout(() => {
                modalAction();
                setIsModalOpen(false);
              }, 600);
            }
            : undefined
        }
        type={modalType}
        title={modalTitle}
        description={modalDescription}
        isLoading={isLoading}
        confirmText={
          modalType === "success"
            ? "OK"
            : modalType === "confirm"
              ? "Discard"
              : undefined
        }
      />

      {/* ─── Loading Overlay ──────────────────────────────────── */}
      {(isLoading || isNavigating) && <FullPageLoading text="Processing..." />}
    </div>
  );
};
