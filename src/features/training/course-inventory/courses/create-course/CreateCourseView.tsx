import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/app/routes.constants";
import { PageHeader } from "@/components/ui/page/PageHeader";
import { courseCreate } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { Check } from "lucide-react";
import { cn } from "@/components/ui/utils";
import { Button } from "@/components/ui/button/Button";
import { ButtonLoading, FullPageLoading } from "@/components/ui/loading/Loading";
import { AlertModal, AlertModalType } from "@/components/ui/modal/AlertModal";
import { TrainingConfig, TrainingType, TrainingFile, TrainingMethod, Recurrence } from "../../../types";
import { BasicInfoTab } from "../../shared/BasicInfoTab";
import { DocumentTab } from "../../shared/DocumentTab";
import { ConfigTab } from "../../shared/ConfigTab";

type TabType = "basic-info" | "document-training" | "training-config";

const TABS: { id: TabType; label: string }[] = [
    { id: "basic-info", label: "Basic Information" },
    { id: "document-training", label: "Training Materials" },
    { id: "training-config", label: "Assessment Config" },
];

// Workflow stepper steps
const WORKFLOW_STEPS = ["Draft", "Pending Review", "Pending Approval", "Approved", "Obsoleted"] as const;

export const CreateCourseView: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabType>("basic-info");

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<AlertModalType>("info");
    const [modalTitle, setModalTitle] = useState("");
    const [modalDescription, setModalDescription] = useState("");
    const [modalAction, setModalAction] = useState<(() => void) | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);

    // Basic Training Info
    const [courseId] = useState(() => {
        const now = new Date();
        const year = now.getFullYear();
        const seq = String(Math.floor(Math.random() * 900) + 100);
        return `TRN-${year}-${seq}`;
    });
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [trainingType, setTrainingType] = useState<TrainingType>("GMP");
    const [trainingMethod, setTrainingMethod] = useState<TrainingMethod>("Read & Understood");
    const [instructorType, setInstructorType] = useState<"internal" | "external">("internal");
    const [instructor, setInstructor] = useState("");
    const [scheduledDate, setScheduledDate] = useState("");
    const [duration, setDuration] = useState(4);
    const [location, setLocation] = useState("");
    const [capacity, setCapacity] = useState(30);

    // Linked document
    const [linkedDocumentId, setLinkedDocumentId] = useState("");
    const [linkedDocumentTitle, setLinkedDocumentTitle] = useState("");

    // Recurrence
    const [recurrence, setRecurrence] = useState<Recurrence>({ enabled: false, intervalMonths: 12, warningPeriodDays: 30 });

    // Evidence upload
    const [evidenceFiles, setEvidenceFiles] = useState<File[]>([])

    // Training Materials
    const [trainingFiles, setTrainingFiles] = useState<TrainingFile[]>([]);
    const [instruction, setInstruction] = useState("");

    // Quiz Configuration
    const [hasQuiz, setHasQuiz] = useState(false);
    const [config, setConfig] = useState<TrainingConfig>({
        trainingType: "test_certification",
        passingScore: 7,
        maxAttempts: 3,
        trainingPeriodDays: 7,
        distributionList: [],
        questions: []
    });

    const handleCancel = () => {
        setModalType("confirm");
        setModalTitle("Discard Changes?");
        setModalDescription("Are you sure you want to cancel? All unsaved changes will be lost.");
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

        if (trainingFiles.length === 0) {
            setModalType("warning");
            setModalTitle("No Training Materials");
            setModalDescription("You haven't uploaded any training materials. Do you want to continue?");
            setModalAction(() => async () => {
                await performSave();
            });
            setIsModalOpen(true);
            return;
        }

        await performSave();
    };

    const performSave = async () => {
        setIsLoading(true);
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            const courseData = {
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
                trainingFiles: trainingFiles.map(f => ({ name: f.name, size: f.size, type: f.type })),
                hasQuiz,
                config: hasQuiz ? config : undefined,
            };

            setIsLoading(false);
            setModalType("success");
            setModalTitle("Course Created Successfully");
            setModalDescription("The training course has been created and will be sent for review.");
            setModalAction(() => () => {
                navigate(-1);
            });
            setIsModalOpen(true);
        } catch (error) {
            setIsLoading(false);
            setModalType("error");
            setModalTitle("Save Failed");
            setModalDescription("An error occurred while saving the course. Please try again.");
            setModalAction(null);
            setIsModalOpen(true);
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case "basic-info":
                return (
                    <BasicInfoTab
                        courseId={courseId}
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
                return (
                    <ConfigTab
                        trainingMethod={trainingMethod}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6 w-full flex-1 flex flex-col">
            {/* Header: Title + Breadcrumb + Action Buttons */}
            <PageHeader
              title="Create New Training"
              breadcrumbItems={courseCreate(navigate)}
              actions={
                <>
                  <Button
                    variant="outline-emerald"
                    onClick={handleCancel}
                    size="sm"
                    className="whitespace-nowrap"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="outline-emerald"
                    onClick={handleSave}
                    size="sm"
                    className="whitespace-nowrap"
                    disabled={isLoading}
                  >
                    {isLoading ? <ButtonLoading text="Saving..." /> : "Save"}
                  </Button>
                </>
              }
            />

            {/* Status Workflow Stepper */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Mobile View (Compact circles) */}
                <div className="flex sm:hidden items-center justify-start gap-0 px-2 py-4 bg-slate-50/50 border-b border-slate-100 overflow-x-auto">
                    <div className="flex items-center justify-start min-w-max mx-auto">
                        {WORKFLOW_STEPS.map((step, index) => {
                            const isCompleted = false; // No steps completed yet in draft
                            const isCurrent = index === 0; // Draft is current
                            const isLast = index === WORKFLOW_STEPS.length - 1;

                            return (
                                <React.Fragment key={step}>
                                    <div className="flex flex-col items-center gap-1.5 select-none w-[80px] flex-shrink-0">
                                        <div
                                            className={cn(
                                                "relative w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold transition-all shadow-sm",
                                                isCurrent
                                                    ? step === "Obsoleted"
                                                        ? "bg-red-500 text-white"
                                                        : "bg-emerald-600 text-white ring-4 ring-emerald-100"
                                                    : isCompleted
                                                    ? "bg-emerald-600 text-white"
                                                    : "bg-slate-100 text-slate-400 border border-slate-200",
                                            )}
                                        >
                                            {isCompleted ? <Check className="h-3.5 w-3.5" /> : index + 1}
                                        </div>
                                        <span
                                            className={cn(
                                                "text-[10px] font-semibold text-center leading-tight transition-colors whitespace-normal break-words max-w-[72px] min-h-[24px]",
                                                isCurrent
                                                    ? "text-emerald-700"
                                                    : isCompleted
                                                    ? "text-emerald-700"
                                                    : "text-slate-400",
                                            )}
                                        >
                                            {step}
                                        </span>
                                    </div>
                                    {!isLast && (
                                        <div
                                            className={cn(
                                                "w-6 h-0.5 flex-shrink-0 transition-all self-start mt-3.5 rounded-full",
                                                isCompleted ? "bg-emerald-500" : "bg-slate-200",
                                            )}
                                        />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>

                {/* Desktop View (Arrow shapes) */}
                <div className="hidden sm:block overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                    <div className="flex items-stretch min-w-full">
                        {WORKFLOW_STEPS.map((step, index) => {
                            const isCompleted = false; // No steps completed yet in draft
                            const isCurrent = index === 0; // Draft is current
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
                                            isCurrent ? "bg-emerald-600" : "bg-slate-100"
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
                                        {isCompleted && <Check className="h-4 w-4 text-emerald-600 shrink-0" />}
                                        <span
                                            className={cn(
                                                "text-xs md:text-sm font-medium text-center whitespace-normal break-words",
                                                isCurrent ? "text-white" : "text-slate-400"
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
                <div className="animate-in fade-in duration-200">
                    {renderTabContent()}
                </div>
            </div>

            {/* Alert Modal */}
            <AlertModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={modalAction ? () => {
                    setIsNavigating(true);
                    setTimeout(() => {
                        modalAction();
                        setIsModalOpen(false);
                    }, 600);
                } : undefined}
                type={modalType}
                title={modalTitle}
                description={modalDescription}
                isLoading={isLoading}
                confirmText={modalType === "success" ? "OK" : modalType === "confirm" ? "Discard" : undefined}
            />

            {/* ─── Loading Overlay ──────────────────────────────────── */}
            {(isLoading || isNavigating) && <FullPageLoading text="Processing..." />}
        </div>
    );
};
