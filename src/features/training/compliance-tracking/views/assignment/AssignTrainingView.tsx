import React, { useState, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  X,
  GraduationCap,
  Building2,
  Briefcase,
  UserCheck,
  AlertTriangle,
  Bell,
  BellRing,
  CalendarDays,
  Flag,
  PenTool,
  ShieldCheck,
  Zap,
  Clock,
  ChevronRight,
} from "lucide-react";
import {
  IconAdjustmentsHorizontal,
  IconBuilding,
  IconCheck,
  IconChecklist,
  IconClock,
  IconInfoCircle,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";
import { ROUTES } from "@/app/routes.constants";
import { PageHeader } from "@/components/ui/page/PageHeader";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import { Checkbox } from "@/components/ui/checkbox/Checkbox";
import { DateTimePicker } from "@/components/ui/datetime-picker/DateTimePicker";
import { DateRangePicker } from "@/components/ui/datetime-picker/DateRangePicker";
import { TabNav } from "@/components/ui/tabs/TabNav";
import type { TabItem } from "@/components/ui/tabs/TabNav";
import { ESignatureModal } from "@/components/ui/esign-modal/ESignatureModal";
import { AlertModal } from "@/components/ui/modal";
import { FullPageLoading } from "@/components/ui/loading";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/components/ui/utils";
import { Badge } from "@/components/ui/badge/Badge";
import { FormSection } from "@/components/ui/form";
import { useNavigateWithLoading } from "@/hooks";
import breadcrumbs from "@/components/ui/breadcrumb/breadcrumbs.config";
import { formatDate } from "@/utils/format";
import {
  PRIORITY_DEADLINE_DAYS,
  PRIORITY_COLORS,
  type AssignmentPriority,
  type AssignmentScope,
} from "../../../types/assignment.types";
import { complianceTrackingRepository } from "../../repository";
import type { EmployeeRow } from "../../types";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ApprovedCourse {
  id: string;
  trainingId: string;
  title: string;
  type: string;
  trainingMethod: string;
  duration: number;
  passScore: number;
  mandatory: boolean;
  linkedDocumentTitle?: string;
  instructor: string;
}

type WizardStep = 1 | 2 | 3 | 4;

const STEP_LABELS = [
  "Select Course",
  "Select Assignees",
  "Configure",
  "Review & Submit",
];
const STEP_ICONS = [
  GraduationCap,
  IconUsers,
  IconAdjustmentsHorizontal,
  IconChecklist,
];

// ─── Approved courses (filter from mock) ─────────────────────────────────────
const APPROVED_COURSES: ApprovedCourse[] = [
  {
    id: "1",
    trainingId: "TRN-2026-001",
    title: "GMP Basic Principles",
    type: "GMP",
    trainingMethod: "Quiz (Paper-based/Manual)",
    duration: 4,
    passScore: 80,
    mandatory: true,
    linkedDocumentTitle: "SOP-QA-001",
    instructor: "Dr. Sarah Williams",
  },
  {
    id: "2",
    trainingId: "TRN-2026-002",
    title: "Cleanroom Qualification",
    type: "Technical",
    trainingMethod: "Hands-on/OJT",
    duration: 8,
    passScore: 75,
    mandatory: true,
    linkedDocumentTitle: "SOP-002",
    instructor: "Jennifer Lee",
  },
  {
    id: "3",
    trainingId: "TRN-2026-003",
    title: "Data Integrity (ALCOA+)",
    type: "Compliance",
    trainingMethod: "Read & Understood",
    duration: 2,
    passScore: 90,
    mandatory: true,
    linkedDocumentTitle: "SOP-010",
    instructor: "Dr. Anna Smith",
  },
  {
    id: "4",
    trainingId: "TRN-2026-004",
    title: "ISO 9001 Internal Auditor",
    type: "Compliance",
    trainingMethod: "Quiz (Paper-based/Manual)",
    duration: 16,
    passScore: 70,
    mandatory: false,
    instructor: "External Trainer",
  },
  {
    id: "5",
    trainingId: "TRN-2026-005",
    title: "HPLC Operations",
    type: "Technical",
    trainingMethod: "Hands-on/OJT",
    duration: 8,
    passScore: 80,
    mandatory: true,
    instructor: "Robert Johnson",
  },
  {
    id: "6",
    trainingId: "TRN-2026-006",
    title: "Workplace Safety & HSE",
    type: "Safety",
    trainingMethod: "Read & Understood",
    duration: 2,
    passScore: 80,
    mandatory: true,
    instructor: "Chris Anderson",
  },
  {
    id: "7",
    trainingId: "TRN-2026-007",
    title: "Risk Assessment & FMEA",
    type: "Compliance",
    trainingMethod: "Quiz (Paper-based/Manual)",
    duration: 4,
    passScore: 75,
    mandatory: false,
    instructor: "Dr. Anna Smith",
  },
  {
    id: "8",
    trainingId: "TRN-2026-008",
    title: "Deviation & CAPA Handling",
    type: "GMP",
    trainingMethod: "Read & Understood",
    duration: 3,
    passScore: 80,
    mandatory: true,
    instructor: "Maria Lopez",
  },
];

const BUSINESS_UNITS = ["Quality Unit", "Operation Unit", "Support Unit"];
const DEPARTMENTS = [
  "Quality Assurance",
  "Quality Control",
  "Production",
  "Engineering",
  "Documentation",
  "HSE",
  "Supply Chain",
];
const JOB_TITLES = [
  "QA Manager",
  "QA Specialist",
  "QC Analyst",
  "Lab Technician",
  "Production Operator",
  "Production Supervisor",
  "Validation Engineer",
  "Engineering Manager",
  "Document Controller",
  "HSE Coordinator",
  "HSE Specialist",
  "Warehouse Operator",
];
const CATEGORY_OPTIONS = [
  { label: "All Categories", value: "All" },
  { label: "GMP", value: "GMP" },
  { label: "Safety", value: "Safety" },
  { label: "Technical", value: "Technical" },
  { label: "Compliance", value: "Compliance" },
];
const METHOD_OPTIONS = [
  { label: "All Methods", value: "All" },
  { label: "Read & Understood", value: "Read & Understood" },
  { label: "Quiz (Paper-based/Manual)", value: "Quiz (Paper-based/Manual)" },
  { label: "Hands-on/OJT", value: "Hands-on/OJT" },
];
const TYPE_BADGE_COLORS: Record<string, string> = {
  GMP: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Safety: "bg-amber-50 text-amber-700 border-amber-200",
  Technical: "bg-blue-50 text-blue-700 border-blue-200",
  Compliance: "bg-purple-50 text-purple-700 border-purple-200",
};

const SCOPE_TABS: TabItem[] = [
  { id: "business_unit", label: "Business Unit", icon: IconBuilding },
  { id: "department", label: "Department", icon: Building2 },
  { id: "individual", label: "Individual", icon: IconUser },
];

const PRIORITY_OPTIONS = [
  { label: "🔴 Critical (≤7 days)", value: "Critical" },
  { label: "🟠 High (≤14 days)", value: "High" },
  { label: "🟡 Medium (≤30 days)", value: "Medium" },
  { label: "⚪ Low (≤60 days)", value: "Low" },
];

// ─── Helper ───────────────────────────────────────────────────────────────────
const addDays = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

// ─── Step indicator ───────────────────────────────────────────────────────────
const StepIndicator: React.FC<{
  currentStep: WizardStep;
  onStepChange: (step: WizardStep) => void;
}> = ({ currentStep, onStepChange }) => (
  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
      <div className="flex items-stretch min-w-full">
        {STEP_LABELS.map((label, i) => {
          const step = (i + 1) as WizardStep;
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;
          const isFirst = i === 0;
          const isLast = i === STEP_LABELS.length - 1;

          return (
            <button
              key={step}
              type="button"
              onClick={() => onStepChange(step)}
              className="relative flex-1 flex items-center justify-center min-w-[160px] cursor-pointer focus:outline-none group"
              style={{ minHeight: "56px" }}
            >
              {/* Arrow Shape Background */}
              <div
                className={cn(
                  "absolute inset-0 transition-all",
                  isCompleted
                    ? "bg-emerald-100"
                    : isCurrent
                      ? "bg-emerald-600"
                      : "bg-slate-100",
                  !isCurrent && !isCompleted && "group-hover:bg-slate-200",
                )}
                style={{
                  clipPath: isFirst
                    ? "polygon(0% 0%, calc(100% - 20px) 0%, 100% 50%, calc(100% - 20px) 100%, 0% 100%)"
                    : isLast
                      ? "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 20px 50%)"
                      : "polygon(0% 0%, calc(100% - 20px) 0%, 100% 50%, calc(100% - 20px) 100%, 0% 100%, 20px 50%)",
                }}
              />

              {/* Content */}
              <div className="relative z-10 flex items-center gap-2 px-6">
                <div
                  className={cn(
                    "h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold border leading-none pt-[1.5px]",
                    isCurrent
                      ? "bg-white text-emerald-600 border-white"
                      : isCompleted
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-slate-200 text-slate-500 border-slate-300",
                  )}
                >
                  {isCompleted ? <IconCheck className="h-3 w-3" /> : step}
                </div>
                <span
                  className={cn(
                    "text-xs sm:text-sm font-medium transition-colors duration-200 whitespace-nowrap",
                    isCurrent
                      ? "text-white"
                      : isCompleted
                        ? "text-slate-700"
                        : "text-slate-400",
                  )}
                >
                  {label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export const AssignTrainingView: React.FC = () => {
  const { navigateTo, isNavigating } = useNavigateWithLoading();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const employees = complianceTrackingRepository.getMatrixEmployees();
  const cells = complianceTrackingRepository.getCells();

  const prefilledCourseId = searchParams.get("courseId") ?? "";
  const prefilledEmployeeId = searchParams.get("employeeId") ?? "";

  // ── Wizard state ─────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState<WizardStep>(
    prefilledCourseId && prefilledEmployeeId ? 3 : prefilledCourseId ? 2 : 1,
  );
  const [showESign, setShowESign] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleStepChange = (step: WizardStep) => {
    setCurrentStep(step);
  };

  // ── Step 1: Course selection ──────────────────────────────────────
  const [selectedCourseId, setSelectedCourseId] =
    useState<string>(prefilledCourseId);
  const [courseSearch, setCourseSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [methodFilter, setMethodFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [reasonForAssignment, setReasonForAssignment] = useState("");

  // ── Step 2: Assignees ─────────────────────────────────────────────
  const [scopeTab, setScopeTab] = useState<AssignmentScope>(
    prefilledEmployeeId ? "individual" : "business_unit",
  );
  const [selectedBusinessUnits, setSelectedBusinessUnits] = useState<string[]>(
    [],
  );
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>(
    prefilledEmployeeId ? [prefilledEmployeeId] : [],
  );
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [employeeSearch, setEmployeeSearch] = useState("");

  // ── Step 3: Config ────────────────────────────────────────────────
  const [priority, setPriority] = useState<AssignmentPriority>("Medium");
  const [deadlineDate, setDeadlineDate] = useState(
    addDays(PRIORITY_DEADLINE_DAYS["Medium"]),
  );
  const [trainingBeforeAuthorized, setTrainingBeforeAuthorized] =
    useState(false);
  const [requiresESign, setRequiresESign] = useState(false);
  const [isCrossTraining, setIsCrossTraining] = useState(false);
  const [reminders, setReminders] = useState<number[]>([7]);

  // ── Derived data ──────────────────────────────────────────────────
  const selectedCourse = useMemo(
    () =>
      APPROVED_COURSES.find(
        (c) =>
          c.id === selectedCourseId ||
          c.trainingId === selectedCourseId ||
          c.linkedDocumentTitle === selectedCourseId,
      ) ?? null,
    [selectedCourseId],
  );

  const filteredCourses = useMemo(() => {
    return APPROVED_COURSES.filter((c) => {
      const matchesSearch =
        !courseSearch ||
        c.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
        c.trainingId.toLowerCase().includes(courseSearch.toLowerCase());
      const matchesCat = categoryFilter === "All" || c.type === categoryFilter;
      const matchesMethod =
        methodFilter === "All" || c.trainingMethod === methodFilter;

      let matchesDate = true;
      if (dateFrom || dateTo) {
        const d = new Date(2026, 2, 25); // Mocked date for all in this view for now
        if (dateFrom)
          matchesDate =
            matchesDate &&
            d >= new Date(dateFrom.split("/").reverse().join("-"));
        if (dateTo)
          matchesDate =
            matchesDate && d <= new Date(dateTo.split("/").reverse().join("-"));
      }

      return matchesSearch && matchesCat && matchesMethod && matchesDate;
    });
  }, [courseSearch, categoryFilter, methodFilter, dateFrom, dateTo]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      const q = employeeSearch.toLowerCase();
      return (
        !q ||
        e.name.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q) ||
        e.jobTitle.toLowerCase().includes(q) ||
        e.employeeCode.toLowerCase().includes(q)
      );
    });
  }, [employeeSearch]);

  const resolvedAssignees = useMemo((): EmployeeRow[] => {
    if (scopeTab === "individual")
      return employees.filter((e) => selectedEmployeeIds.includes(e.id));
    if (scopeTab === "department")
      return employees.filter((e) =>
        selectedDepartments.includes(e.department),
      );
    if (scopeTab === "business_unit")
      return employees.filter((e) =>
        selectedBusinessUnits.includes(e.businessUnit || "Operation Unit"),
      );
    return [];
  }, [
    scopeTab,
    selectedEmployeeIds,
    selectedDepartments,
    selectedBusinessUnits,
  ]);

  const totalAssignees = resolvedAssignees.length;

  // ── Validation ────────────────────────────────────────────────────
  const step1Valid = !!selectedCourseId;
  const step2Valid = totalAssignees > 0;
  const step3Valid = !!deadlineDate;
  const step4Valid = reasonForAssignment.trim().length >= 10;
  const needsESign = priority === "Critical" || requiresESign;

  // ── Handlers ──────────────────────────────────────────────────────
  const handlePriorityChange = useCallback((val: string) => {
    const p = val as AssignmentPriority;
    setPriority(p);
    setDeadlineDate(addDays(PRIORITY_DEADLINE_DAYS[p]));
  }, []);

  const handleReminderToggle = (days: number) => {
    setReminders((prev) =>
      prev.includes(days) ? prev.filter((d) => d !== days) : [...prev, days],
    );
  };

  const handleBusinessUnitToggle = (bu: string) => {
    setSelectedBusinessUnits((prev) =>
      prev.includes(bu) ? prev.filter((b) => b !== bu) : [...prev, bu],
    );
  };

  const handleDeptToggle = (dept: string) => {
    setSelectedDepartments((prev) =>
      prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept],
    );
  };

  const handleEmployeeToggle = (id: string) => {
    setSelectedEmployeeIds((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id],
    );
  };

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep((currentStep + 1) as WizardStep);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((currentStep - 1) as WizardStep);
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const confirmLeave = () => {
    setShowCancelModal(false);
    navigateTo(-1);
  };

  const handleSubmit = () => {
    // Always require e-signature before submitting
    setShowESign(true);
  };

  const doSubmit = (_reason?: string) => {
    setIsSubmitting(true);
    setTimeout(() => {
      // If this assignment was launched from the matrix (employee + course prefilled),
      // immediately reflect a Pending status in the matrix cell so users see
      // "Đã giao bài, đang chờ kết quả".
      if (prefilledEmployeeId && prefilledCourseId) {
        const key = `${prefilledEmployeeId}|${prefilledCourseId}`;
        const existing = cells.get(key);
        if (existing) {
          cells.set(key, {
            ...existing,
            status: "InProgress",
          });
        }
      }

      setIsSubmitting(false);
      showToast({
        type: "success",
        title: "Assignment Created",
        message: `Training assigned to ${totalAssignees} employee${totalAssignees !== 1 ? "s" : ""}. Notifications sent.`,
        duration: 4000,
      });
      navigateTo(ROUTES.TRAINING.ASSIGNMENTS);
    }, 800);
  };

  // ── Target summary string ─────────────────────────────────────────
  const targetSummary = useMemo(() => {
    if (scopeTab === "individual")
      return `${totalAssignees} employee${totalAssignees !== 1 ? "s" : ""} selected`;
    if (scopeTab === "department")
      return selectedDepartments.length > 0
        ? `${selectedDepartments.join(", ")} (${totalAssignees} employees)`
        : "No departments selected";
    if (scopeTab === "business_unit")
      return selectedBusinessUnits.length > 0
        ? `${selectedBusinessUnits.join(", ")} (${totalAssignees} employees)`
        : "No business units selected";
    return "No assignees selected";
  }, [scopeTab, totalAssignees, selectedDepartments, selectedBusinessUnits]);

  // ────────────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 w-full flex-1 flex flex-col">
      {/* Page Header with action buttons */}
      <PageHeader
        title="New Training Assignment"
        breadcrumbItems={breadcrumbs.assignTraining(navigateTo)}
        actions={
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <Button variant="outline-emerald" size="sm" onClick={handleCancel}>
              Cancel
            </Button>

            {currentStep > 1 && (
              <Button variant="outline-emerald" size="sm" onClick={handleBack}>
                Previous
              </Button>
            )}
            {currentStep < 4 ? (
              <Button
                variant="outline-emerald"
                size="sm"
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !step1Valid) ||
                  (currentStep === 2 && !step2Valid) ||
                  (currentStep === 3 && !step3Valid)
                }
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                size="sm"
                variant="outline-emerald"
                disabled={isSubmitting || !step4Valid}
              >
                {isSubmitting ? "Submitting…" : "Sign & Submit"}
              </Button>
            )}
          </div>
        }
      />

      {/* Step indicator */}
      <StepIndicator
        currentStep={currentStep}
        onStepChange={handleStepChange}
      />

      {/* Step content */}
      <div className="flex-1 w-full animate-in fade-in duration-300">
        {currentStep === 1 && (
          <Step1CourseSelect
            courses={filteredCourses}
            selectedCourseId={selectedCourseId}
            onSelectCourse={setSelectedCourseId}
            courseSearch={courseSearch}
            onSearchChange={setCourseSearch}
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
            methodFilter={methodFilter}
            onMethodChange={setMethodFilter}
            dateFrom={dateFrom}
            onDateFromChange={setDateFrom}
            dateTo={dateTo}
            onDateToChange={setDateTo}
            selectedCourse={selectedCourse}
            navigateTo={navigateTo}
          />
        )}
        {currentStep === 2 && (
          <Step2Assignees
            scopeTab={scopeTab}
            onScopeChange={(id) => setScopeTab(id as AssignmentScope)}
            employees={filteredEmployees}
            selectedEmployeeIds={selectedEmployeeIds}
            onEmployeeToggle={handleEmployeeToggle}
            selectedDepartments={selectedDepartments}
            onDeptToggle={handleDeptToggle}
            selectedBusinessUnits={selectedBusinessUnits}
            onBusinessUnitToggle={handleBusinessUnitToggle}
            resolvedAssignees={resolvedAssignees}
            employeeSearch={employeeSearch}
            onEmployeeSearchChange={setEmployeeSearch}
          />
        )}
        {currentStep === 3 && (
          <Step3Config
            priority={priority}
            onPriorityChange={handlePriorityChange}
            deadlineDate={deadlineDate}
            onDeadlineChange={setDeadlineDate}
            trainingBeforeAuthorized={trainingBeforeAuthorized}
            onToggleBeforeAuth={() => setTrainingBeforeAuthorized((v) => !v)}
            requiresESign={requiresESign}
            onToggleESign={() => setRequiresESign((v) => !v)}
            isCrossTraining={isCrossTraining}
            onToggleCrossTraining={() => setIsCrossTraining((v) => !v)}
            reminders={reminders}
            onReminderToggle={handleReminderToggle}
          />
        )}
        {currentStep === 4 && (
          <Step4Review
            course={selectedCourse}
            reasonForAssignment={reasonForAssignment}
            onReasonChange={setReasonForAssignment}
            targetSummary={targetSummary}
            resolvedAssignees={resolvedAssignees}
            priority={priority}
            deadlineDate={deadlineDate}
            trainingBeforeAuthorized={trainingBeforeAuthorized}
            requiresESign={requiresESign}
            isCrossTraining={isCrossTraining}
            reminders={reminders}
            needsESign={needsESign}
          />
        )}
      </div>
      {/* Footer Action Button */}

      {/* E-Signature Modal */}
      <ESignatureModal
        isOpen={showESign}
        onClose={() => setShowESign(false)}
        onConfirm={(reason) => {
          setShowESign(false);
          doSubmit(reason);
        }}
        actionTitle="Authorize Training Assignment"
      />

      {/* Cancel confirmation modal */}
      <AlertModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={confirmLeave}
        type="warning"
        title="Discard assignment?"
        description="Are you sure you want to leave? Your progress will not be saved."
        cancelText="Cancel"
        confirmText="OK"
      />

      {isNavigating && <FullPageLoading text="Loading..." />}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// STEP 1 — Course Selection
// ══════════════════════════════════════════════════════════════════════════════
interface Step1Props {
  courses: ApprovedCourse[];
  selectedCourseId: string | null;
  onSelectCourse: (id: string) => void;
  courseSearch: string;
  onSearchChange: (v: string) => void;
  categoryFilter: string;
  onCategoryChange: (v: string) => void;
  methodFilter: string;
  onMethodChange: (v: string) => void;
  dateFrom: string;
  onDateFromChange: (v: string) => void;
  dateTo: string;
  onDateToChange: (v: string) => void;
  selectedCourse: ApprovedCourse | null;
  navigateTo: (path: any) => void;
}

const Step1CourseSelect: React.FC<Step1Props> = ({
  courses,
  selectedCourseId,
  onSelectCourse,
  courseSearch,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  methodFilter,
  onMethodChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  selectedCourse,
  navigateTo,
}) => (
  <FormSection
    title="Choose Training Course"
    icon={<GraduationCap className="h-4 w-4" />}
  >
    <div className="space-y-4">
      {/* Course picker */}
      <div className="space-y-4">
        {/* Filters with adaptive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-3 items-end">
          <div className="flex flex-col">
            <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                value={courseSearch}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search courses…"
                className="w-full h-9 pl-9 pr-10 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-slate-400"
              />
              {courseSearch && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          <Select
            label="Category"
            value={categoryFilter}
            onChange={onCategoryChange}
            options={CATEGORY_OPTIONS}
          />
          <Select
            label="Method"
            value={methodFilter}
            onChange={onMethodChange}
            options={METHOD_OPTIONS}
          />
          <DateRangePicker
            label="Scheduled Date Range"
            startDate={dateFrom}
            onStartDateChange={onDateFromChange}
            endDate={dateTo}
            onEndDateChange={onDateToChange}
            placeholder="Filter by date…"
          />
        </div>

        {/* Course list */}
        {/* Course list table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap w-4"></th>
                  <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap w-12">
                    No.
                  </th>
                  <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap w-32">
                    Course ID
                  </th>
                  <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    Course Title
                  </th>
                  <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap w-28">
                    Type
                  </th>
                  <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap w-40">
                    Method
                  </th>
                  <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap w-24">
                    Duration
                  </th>
                  <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap w-28">
                    Pass Score
                  </th>
                  <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap w-28">
                    Status
                  </th>
                  <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap w-32">
                    Instructor
                  </th>
                  <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap w-40">
                    Scheduled Date
                  </th>
                  <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap text-center sticky right-0 bg-slate-50 z-[1] before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-200 shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.05)]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {courses.length === 0 && (
                  <tr>
                    <td
                      colSpan={12}
                      className="py-16 text-center text-slate-400"
                    >
                      <GraduationCap className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                      <p className="text-sm font-medium text-slate-500">
                        No effective courses found
                      </p>
                    </td>
                  </tr>
                )}
                {courses.map((c, idx) => (
                  <tr
                    key={c.id}
                    onClick={() => onSelectCourse(c.id)}
                    className={cn(
                      "hover:bg-slate-50 transition-colors cursor-pointer group",
                      selectedCourseId === c.id && "bg-emerald-50/50",
                    )}
                  >
                    <td className="py-2.5 px-2 md:py-3 md:px-4 text-center">
                      <div className="flex justify-center">
                        <Checkbox
                          checked={selectedCourseId === c.id}
                          onChange={() => onSelectCourse(c.id)}
                        />
                      </div>
                    </td>
                    <td className="py-2.5 px-2 md:py-3 md:px-4 text-xs md:text-sm text-center font-medium text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-2 md:py-3 md:px-4 text-xs md:text-sm whitespace-nowrap">
                      <span className="font-medium text-emerald-600">
                        {c.trainingId}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 md:py-3 md:px-4 text-xs md:text-sm">
                      <div className="flex items-start gap-1.5 sm:gap-2.5">
                        <GraduationCap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-slate-900 line-clamp-1">
                            {c.title}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                      <Badge color="blue" size="sm" pill>
                        {c.type}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-2 md:py-3 md:px-4 text-xs md:text-sm whitespace-nowrap font-medium text-slate-700">
                      {c.trainingMethod}
                    </td>
                    <td className="py-2.5 px-2 md:py-3 md:px-4 text-xs md:text-sm whitespace-nowrap text-center">
                      <div className="inline-flex items-center gap-1 sm:gap-1.5 text-slate-600">
                        <IconClock className="h-3.5 w-3.5 text-slate-400" />
                        <span>{c.duration}h</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 md:py-3 md:px-4 text-xs md:text-sm whitespace-nowrap text-center font-medium text-emerald-600">
                      {c.passScore}%
                    </td>
                    <td className="py-2.5 px-2 md:py-3 md:px-4 text-xs md:text-sm whitespace-nowrap">
                      <Badge color="emerald" size="sm" pill>
                        Effective
                      </Badge>
                    </td>
                    <td className="py-2.5 px-2 md:py-3 md:px-4 text-xs md:text-sm whitespace-nowrap text-slate-600">
                      {c.instructor}
                    </td>
                    <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-600">
                      25/03/2026
                    </td>
                    <td
                      onClick={(e) => e.stopPropagation()}
                      className="p-0 text-center sticky right-0 bg-white group-hover:bg-slate-50 transition-colors z-[2] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-200 shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.05)] w-12"
                    >
                      <Button
                        variant="ghost"
                        size="xs"
                        className="h-9 w-full p-0 bg-transparent text-emerald-600 hover:bg-emerald-50 shadow-none transition-all flex items-center justify-center rounded-none"
                        onClick={() =>
                          navigateTo(ROUTES.TRAINING.COURSE_DETAIL(c.id))
                        }
                        title="View Detail"
                      >
                        <IconInfoCircle
                          className="h-4 w-4 sm:h-6 sm:w-6"
                          strokeWidth={2}
                        />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </FormSection>
);

// ══════════════════════════════════════════════════════════════════════════════
// STEP 2 — Assignees
// ══════════════════════════════════════════════════════════════════════════════
interface Step2Props {
  scopeTab: AssignmentScope;
  onScopeChange: (id: string) => void;
  employees: EmployeeRow[];
  selectedEmployeeIds: string[];
  onEmployeeToggle: (id: string) => void;
  selectedDepartments: string[];
  onDeptToggle: (dept: string) => void;
  selectedBusinessUnits: string[];
  onBusinessUnitToggle: (bu: string) => void;
  resolvedAssignees: EmployeeRow[];
  employeeSearch: string;
  onEmployeeSearchChange: (v: string) => void;
}

const Step2Assignees: React.FC<Step2Props> = ({
  scopeTab,
  onScopeChange,
  employees,
  selectedEmployeeIds,
  onEmployeeToggle,
  selectedDepartments,
  onDeptToggle,
  selectedBusinessUnits,
  onBusinessUnitToggle,
  resolvedAssignees,
  employeeSearch,
  onEmployeeSearchChange,
}) => {
  const deptEmployeeCount = useMemo(
    () =>
      DEPARTMENTS.reduce<Record<string, number>>((acc, dept) => {
        acc[dept] = employees.filter((e) => e.department === dept).length;
        return acc;
      }, {}),
    [],
  );

  const buEmployeeCount = useMemo(
    () =>
      BUSINESS_UNITS.reduce<Record<string, number>>((acc, bu) => {
        acc[bu] = employees.filter(
          (e) =>
            e.businessUnit === bu ||
            (bu === "Operation Unit" && !e.businessUnit),
        ).length;
        return acc;
      }, {}),
    [],
  );

  return (
    <FormSection
      title="Select Target Assignees"
      icon={<IconUsers className="h-4 w-4" />}
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Scope selector + content */}
          <div className="space-y-4 lg:col-span-8">
            <TabNav
              tabs={SCOPE_TABS}
              activeTab={scopeTab}
              onChange={onScopeChange}
              variant="pill"
              layoutId="assignmentScopeTabs"
            />

            {/* Individual */}
            {scopeTab === "individual" && (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    value={employeeSearch}
                    onChange={(e) => onEmployeeSearchChange(e.target.value)}
                    placeholder="Search by name, department, code…"
                    className="w-full h-9 pl-9 pr-10 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-slate-400"
                  />
                  {employeeSearch && (
                    <button
                      type="button"
                      onClick={() => onEmployeeSearchChange("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                      aria-label="Clear employee search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="border border-slate-200 rounded-xl bg-slate-50/60">
                  <div className="px-3 pt-3 pb-2">
                    <p className="text-xs font-medium text-slate-500">
                      Employee List
                    </p>
                  </div>
                  <div className="space-y-1 max-h-[360px] overflow-y-auto px-3 pb-3">
                    {employees.map((emp) => (
                      <label
                        key={emp.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-all"
                      >
                        <Checkbox
                          id={`emp-${emp.id}`}
                          checked={selectedEmployeeIds.includes(emp.id)}
                          onChange={() => onEmployeeToggle(emp.id)}
                        />
                        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-xs font-bold text-emerald-700">
                          {getInitials(emp.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-slate-900 truncate leading-tight">
                              {emp.name}
                            </p>
                            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex-shrink-0 border border-emerald-200">
                              {emp.employeeCode}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 truncate">
                            {emp.jobTitle} · {emp.department}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Business Unit */}
            {scopeTab === "business_unit" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BUSINESS_UNITS.map((bu) => (
                  <button
                    key={bu}
                    onClick={() => onBusinessUnitToggle(bu)}
                    className={cn(
                      "text-left p-4 rounded-xl border-2 transition-all",
                      selectedBusinessUnits.includes(bu)
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-slate-200 bg-white hover:border-slate-300",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2
                          className={cn(
                            "h-4 w-4",
                            selectedBusinessUnits.includes(bu)
                              ? "text-emerald-600"
                              : "text-slate-400",
                          )}
                        />
                        <span className="text-sm font-medium text-slate-800">
                          {bu}
                        </span>
                      </div>
                      {selectedBusinessUnits.includes(bu) && (
                        <IconCheck className="h-4 w-4 text-emerald-500" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 ml-6">
                      {buEmployeeCount[bu] ?? 0} employees
                    </p>
                  </button>
                ))}
              </div>
            )}

            {/* Department */}
            {scopeTab === "department" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DEPARTMENTS.map((dept) => (
                  <button
                    key={dept}
                    onClick={() => onDeptToggle(dept)}
                    className={cn(
                      "text-left p-4 rounded-xl border-2 transition-all",
                      selectedDepartments.includes(dept)
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-slate-200 bg-white hover:border-slate-300",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Briefcase
                          className={cn(
                            "h-4 w-4",
                            selectedDepartments.includes(dept)
                              ? "text-emerald-600"
                              : "text-slate-400",
                          )}
                        />
                        <span className="text-sm font-medium text-slate-800">
                          {dept}
                        </span>
                      </div>
                      {selectedDepartments.includes(dept) && (
                        <IconCheck className="h-4 w-4 text-emerald-500" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 ml-6">
                      {deptEmployeeCount[dept] ?? 0} employees
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Selected summary */}
          <div className="lg:col-span-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 lg:sticky lg:top-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">Selected</p>
                {resolvedAssignees.length > 0 && (
                  <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                    {resolvedAssignees.length} employee
                    {resolvedAssignees.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              {resolvedAssignees.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4 text-center">
                  No assignees selected yet
                </p>
              ) : (
                <div className="space-y-1 max-h-[300px] overflow-y-auto">
                  {resolvedAssignees.slice(0, 12).map((e, index) => (
                    <div
                      key={e.id}
                      className="flex items-center gap-2.5 py-1.5 border-b border-slate-100 last:border-0 group"
                    >
                      <div className="h-7 w-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-emerald-700">
                        {getInitials(e.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-medium text-slate-800 truncate leading-tight">
                            {e.name}
                          </p>
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded flex-shrink-0">
                            {e.employeeCode}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          {e.jobTitle} · {e.department}
                        </p>
                      </div>
                    </div>
                  ))}
                  {resolvedAssignees.length > 12 && (
                    <p className="text-xs text-slate-400 pl-2">
                      +{resolvedAssignees.length - 12} more…
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </FormSection>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// STEP 3 — Configuration
// ══════════════════════════════════════════════════════════════════════════════
interface Step3Props {
  priority: AssignmentPriority;
  onPriorityChange: (v: string) => void;
  deadlineDate: string;
  onDeadlineChange: (v: string) => void;
  trainingBeforeAuthorized: boolean;
  onToggleBeforeAuth: () => void;
  requiresESign: boolean;
  onToggleESign: () => void;
  isCrossTraining: boolean;
  onToggleCrossTraining: () => void;
  reminders: number[];
  onReminderToggle: (days: number) => void;
}

const Step3Config: React.FC<Step3Props> = ({
  priority,
  onPriorityChange,
  deadlineDate,
  onDeadlineChange,
  trainingBeforeAuthorized,
  onToggleBeforeAuth,
  requiresESign,
  onToggleESign,
  isCrossTraining,
  onToggleCrossTraining,
  reminders,
  onReminderToggle,
}) => (
  <FormSection
    title="Assignment Configuration"
    icon={<IconAdjustmentsHorizontal className="h-4 w-4" />}
  >
    <div className="space-y-6">
      {priority === "Critical" && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              Critical Priority Selected
            </p>
            <p className="text-sm text-red-600">
              An e-signature will be required at submission to authorize this
              assignment (EU-GMP Annex 11).
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FormSection
          title="Schedules & Priority"
          icon={<CalendarDays className="h-4 w-4" />}
        >
          <div className="space-y-4">
            <div>
              <Select
                label="Priority"
                value={priority}
                onChange={onPriorityChange}
                options={PRIORITY_OPTIONS}
              />
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 flex items-center gap-1">
                Recommended deadline: within {PRIORITY_DEADLINE_DAYS[priority]}{" "}
                days from today
              </p>
            </div>

            <div>
              <DateTimePicker
                label="Deadline Date"
                value={deadlineDate}
                onChange={onDeadlineChange}
                placeholder="Select deadline…"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                <Bell className="h-4 w-4 inline mr-1 text-slate-400" />
                Reminders Before Deadline
              </label>
              <div className="mt-2 flex flex-col gap-2">
                {[
                  { days: 1, label: "1 day" },
                  { days: 3, label: "3 days" },
                  { days: 7, label: "1 week" },
                  { days: 14, label: "2 weeks" },
                  { days: 30, label: "1 month" },
                  { days: 60, label: "2 months" },
                ].map(({ days, label }) => (
                  <label
                    key={days}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Checkbox
                      id={`reminder-${days}`}
                      checked={reminders.includes(days)}
                      onChange={() => onReminderToggle(days)}
                    />
                    <span className="text-sm text-slate-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </FormSection>

        <FormSection
          title="Compliance Controls"
          icon={<ShieldCheck className="h-4 w-4" />}
        >
          <div className="space-y-4">
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
              {/* Training Before Authorized */}
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <button
                    onClick={onToggleBeforeAuth}
                    role="switch"
                    aria-checked={trainingBeforeAuthorized}
                    className={cn(
                      "relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 mt-0.5",
                      trainingBeforeAuthorized
                        ? "bg-emerald-600"
                        : "bg-slate-200",
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200",
                        trainingBeforeAuthorized
                          ? "translate-x-4"
                          : "translate-x-0",
                      )}
                    />
                  </button>
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      Training Before Authorized
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Block system tasks until training is completed{" "}
                      <span className="text-emerald-600 font-medium">
                        (EU-GMP Chapter 2.8)
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Require E-Sign */}
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <button
                    onClick={onToggleESign}
                    role="switch"
                    aria-checked={requiresESign}
                    className={cn(
                      "relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 mt-0.5",
                      requiresESign ? "bg-emerald-600" : "bg-slate-200",
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200",
                        requiresESign ? "translate-x-4" : "translate-x-0",
                      )}
                    />
                  </button>
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      Require E-Signature on Completion
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Trainees must e-sign when marking training complete{" "}
                      <span className="text-emerald-600 font-medium">
                        (Annex 11)
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Cross-training */}
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <button
                    onClick={onToggleCrossTraining}
                    role="switch"
                    aria-checked={isCrossTraining}
                    className={cn(
                      "relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 mt-0.5",
                      isCrossTraining ? "bg-emerald-600" : "bg-slate-200",
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200",
                        isCrossTraining ? "translate-x-4" : "translate-x-0",
                      )}
                    />
                  </button>
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      Cross-Training Assignment
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Does not count toward mandatory compliance rate — for
                      skills versatility only
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FormSection>
      </div>
    </div>
  </FormSection>
);

// ══════════════════════════════════════════════════════════════════════════════
// STEP 4 — Review & Submit
// ══════════════════════════════════════════════════════════════════════════════
interface Step4Props {
  course: ApprovedCourse | null;
  reasonForAssignment: string;
  targetSummary: string;
  resolvedAssignees: EmployeeRow[];
  priority: AssignmentPriority;
  deadlineDate: string;
  trainingBeforeAuthorized: boolean;
  requiresESign: boolean;
  isCrossTraining: boolean;
  reminders: number[];
  needsESign: boolean;
  onReasonChange: (v: string) => void;
}

const Step4Review: React.FC<Step4Props> = ({
  course,
  reasonForAssignment,
  targetSummary,
  resolvedAssignees,
  priority,
  deadlineDate,
  trainingBeforeAuthorized,
  requiresESign,
  isCrossTraining,
  reminders,
  needsESign,
  onReasonChange,
}) => {
  const [showAllAssignees, setShowAllAssignees] = useState(false);
  const displayAssignees = showAllAssignees
    ? resolvedAssignees
    : resolvedAssignees.slice(0, 5);

  return (
    <FormSection
      title="Review Assignment"
      icon={<IconChecklist className="h-4 w-4" />}
    >
      <div className="space-y-5">
        {needsESign && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-sm text-amber-800">
              <span className="font-semibold">E-Signature required</span> — You
              will be prompted to enter your credentials to authorize this
              assignment (Annex 11 / EU-GMP).
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column: Course + Assignees */}
          <div className="space-y-6">
            <FormSection
              title="Course Information"
              icon={<GraduationCap className="h-4 w-4" />}
              headerRight={
                course?.type && (
                  <Badge
                    className={cn(
                      "text-[10px] font-bold px-2 py-0 border-emerald-200 bg-emerald-50 text-emerald-700",
                      TYPE_BADGE_COLORS[course.type],
                    )}
                  >
                    {course.type}
                  </Badge>
                )
              }
            >
              <div className="p-5 space-y-5">
                {/* Course Summary Content */}
                {course ? (
                  <div className="flex items-start gap-4">
                    {/* Course Icon/Thumbnail */}
                    <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <GraduationCap className="h-6 w-6 text-emerald-600" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-base font-bold text-slate-900 leading-tight">
                          {course.title}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          {course.trainingId}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {course.duration}h
                          duration
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <IconAdjustmentsHorizontal className="h-3 w-3" />{" "}
                          {course.trainingMethod}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center text-slate-400 text-sm">
                    No course selected
                  </div>
                )}

                {/* Reason for Assignment Section - Chỉnh lại style cho chuyên nghiệp hơn */}
                <div className="pt-4 border-t border-slate-100">
                  <label className="flex items-center justify-between mb-2">
                    <label className="text-xs sm:text-sm font-medium text-slate-700">
                      Reason for Assignment{" "}
                      <span className="text-rose-500">*</span>
                    </label>
                    <span
                      className={cn(
                        "text-[10px] font-medium px-1.5 py-0.5 rounded",
                        reasonForAssignment.trim().length < 10
                          ? "bg-rose-50 text-rose-600"
                          : "bg-emerald-50 text-emerald-600",
                      )}
                    >
                      {reasonForAssignment.length} / 10 min chars
                    </span>
                  </label>

                  <textarea
                    value={reasonForAssignment}
                    onChange={(e) => onReasonChange(e.target.value)}
                    placeholder="e.g., Annual GMP Refresher, New SOP Revision, or Corrective Action (CAPA)..."
                    rows={3}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/30 transition-all placeholder:text-slate-400"
                  />
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 flex items-center gap-1">
                    Note: This justification will be recorded in the audit trail
                    for compliance verification.
                  </p>
                </div>
              </div>
            </FormSection>

            <FormSection
              title="Target Assignees"
              icon={<IconUsers className="h-4 w-4" />}
              headerRight={
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full shadow-sm">
                  {resolvedAssignees.length} Employee
                  {resolvedAssignees.length !== 1 ? "s" : ""}
                </span>
              }
            >
              {/* Scope Summary Line */}
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <p className="text-xs font-medium text-slate-600">
                  Scope: <span className="text-slate-900">{targetSummary}</span>
                </p>
              </div>

              {/* Scrollable List Area */}
              <div className="border border-slate-100 rounded-lg bg-slate-50/30 overflow-hidden">
                <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-100">
                  {displayAssignees.map((e, index) => (
                    <div
                      key={e.id}
                      className="flex items-center gap-3 p-3 hover:bg-white transition-colors group"
                    >
                      {/* 1. Số thứ tự (No.) */}
                      <span className="text-[12px] text-slate-600 w-5 flex-shrink-0 text-center">
                        {String(index + 1).padStart(2)}
                      </span>

                      {/* 3. Employee Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-800 truncate leading-tight">
                            {e.name}
                          </p>
                          {/* Employee Code Badge */}
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded flex-shrink-0">
                            {e.employeeCode}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">
                          {e.jobTitle}{" "}
                          <span className="text-slate-300 mx-1">•</span>{" "}
                          {e.department}
                        </p>
                      </div>

                      {/* 4. Status Icon (Optional - indicates ready for assignment) */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <IconCheck className="h-4 w-4 text-emerald-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Toggle Button */}
              {resolvedAssignees.length > 5 && (
                <div className="mt-3 text-center">
                  <button
                    onClick={() => setShowAllAssignees((v) => !v)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors py-1 px-3 rounded-full hover:bg-emerald-50"
                  >
                    {showAllAssignees ? (
                      <>
                        Show less <ChevronRight className="h-3 w-3 rotate-90" />
                      </>
                    ) : (
                      <>
                        Show all {resolvedAssignees.length} employees{" "}
                        <ChevronRight className="h-3 w-3" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </FormSection>
          </div>

          {/* Right column: Config + Assigned by */}
          <div className="space-y-6">
            <FormSection
              title="Assignment Configuration"
              icon={<IconAdjustmentsHorizontal className="h-4 w-4" />}
            >
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                {/* Row 1: Priority & Deadline */}
                <div className="grid grid-cols-2 divide-x divide-slate-100">
                  <div className="p-4 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-50 text-slate-500">
                      <Flag className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-slate-700">
                        Priority
                      </p>
                      <div className="mt-1">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border",
                            PRIORITY_COLORS[priority],
                          )}
                        >
                          {priority}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-50 text-slate-500">
                      <CalendarDays className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-slate-700">
                        Deadline
                      </p>
                      <p className="text-sm font-semibold text-slate-700 mt-0.5">
                        {deadlineDate ? formatDate(deadlineDate) : "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Row 2: Compliance with Checkboxes */}
                <div className="p-4 space-y-3">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight mb-2">
                    Compliance & Controls
                  </p>

                  {[
                    {
                      label: "Block tasks until completed",
                      val: trainingBeforeAuthorized,
                      icon: ShieldCheck,
                    },
                    {
                      label: "Require E-Signature on Completion",
                      val: requiresESign,
                      icon: PenTool,
                    },
                    {
                      label: "Cross-training (Non-mandatory)",
                      val: isCrossTraining,
                      icon: Zap,
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5 text-xs md:text-sm text-slate-600">
                        <item.icon
                          className={cn(
                            "h-4 w-4",
                            item.val ? "text-emerald-500" : "text-slate-300",
                          )}
                        />
                        <span>{item.label}</span>
                      </div>
                      {/* Read-only Checkbox UI */}
                      <div
                        className={cn(
                          "h-5 w-5 rounded border flex items-center justify-center transition-colors",
                          item.val
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "bg-slate-50 border-slate-200 text-transparent",
                        )}
                      >
                        <IconCheck className="h-3.5 w-3.5 stroke-[3]" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Row 3: Reminders */}
                <div className="p-4 bg-emerald-50/20">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-white text-emerald-600 shadow-sm border border-emerald-100">
                      <BellRing className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-emerald-600 uppercase font-semibold tracking-normal">
                        System Reminders
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {reminders.length > 0 ? (
                          reminders.map((d) => (
                            <span
                              key={d}
                              className="inline-flex items-center px-2 py-0.5 rounded bg-white border border-emerald-200 text-[11px] font-medium text-emerald-700 shadow-sm"
                            >
                              {d} days before
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            No reminders
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FormSection>

            <FormSection
              title="Authorization Details"
              icon={<UserCheck className="h-4 w-4" />}
              headerRight={
                <Badge
                  color="emerald"
                  variant="soft"
                  className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px] px-1.5 py-0"
                >
                  Verified
                </Badge>
              }
            >
              <div className="flex items-center gap-4">
                {/* Avatar with Status Ring */}
                <div className="relative">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-base shadow-inner border-2 border-white ring-2 ring-emerald-50">
                    AS
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
                    <IconCheck className="h-2.5 w-2.5 text-white" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      Dr. Anna Smith
                    </p>
                    <span className="text-[10px] font-medium text-slate-400">
                      ID: MGR-088
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Quality Assurance Manager
                  </p>

                  {/* Timestamp with Icon */}
                  <div className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-50">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="text-[11px] font-medium">
                        {new Date().toLocaleString("vi-VN")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Building2 className="h-3.5 w-3.5" />
                      <span className="text-[11px] font-medium uppercase">
                        Quality Unit
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Disclaimer for GMP */}
              <div className="mt-6 pt-4 border-t border-slate-100 italic">
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  This assignment will be electronically signed and timestamped
                  upon submission in accordance with EU-GMP Annex 11.
                </p>
              </div>
            </FormSection>
          </div>
        </div>
      </div>
    </FormSection>
  );
};
