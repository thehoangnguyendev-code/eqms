import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  GraduationCap,
  Building2,
} from "lucide-react";
import {
  IconAdjustmentsHorizontal,
  IconBuilding,
  IconCheck,
  IconChecklist,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";
import { ROUTES } from "@/app/routes.constants";
import { PageHeader } from "@/components/ui/page/PageHeader";
import { Button } from "@/components/ui/button/Button";
import type { TabItem } from "@/components/ui/tabs/TabNav";
import { ESignatureModal } from "@/components/ui/esign-modal/ESignatureModal";
import { AlertModal } from "@/components/ui/modal";
import { FullPageLoading } from "@/components/ui/loading";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/components/ui/utils";
import { useNavigateWithLoading } from "@/hooks";
import breadcrumbs from "@/components/ui/breadcrumb/breadcrumbs.config";
import {
  PRIORITY_DEADLINE_DAYS,
  type AssignmentPriority,
  type AssignmentScope,
} from "../../../types/assignment.types";
import { complianceTrackingRepository } from "../../repository";
import type { EmployeeRow } from "../../types";

import { Step1CourseSelect } from "./components/Step1CourseSelect";
import { Step2Assignees } from "./components/Step2Assignees";
import { Step3Config } from "./components/Step3Config";
import { Step4Review } from "./components/Step4Review";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ApprovedCourse {
  id: string;
  trainingId: string;
  title: string;
  description?: string;
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
export const APPROVED_COURSES: ApprovedCourse[] = [
  {
    id: "1",
    trainingId: "TRN-2026-001",
    title: "GMP Basic Training",
    description: "Introduction to Good Manufacturing Practices (GMP) and fundamental compliance principles.",
    type: "GMP",
    trainingMethod: "Quiz (Paper-based/Manual)",
    duration: 4,
    passScore: 80,
    mandatory: true,
    linkedDocumentTitle: "TM-VID-001",
    instructor: "Dr. Sarah Williams",
  },
  {
    id: "2",
    trainingId: "TRN-2026-002",
    title: "Cleanroom Operations",
    description: "Procedures and guidelines for operating safely within a certified cleanroom environment.",
    type: "Technical",
    trainingMethod: "Hands-on/OJT",
    duration: 8,
    passScore: 75,
    mandatory: true,
    linkedDocumentTitle: "TM-PDF-002",
    instructor: "Jennifer Lee",
  },
  {
    id: "3",
    trainingId: "TRN-2026-003",
    title: "Workplace Safety & HSE",
    description: "General safety protocols, emergency responses, and hazard management.",
    type: "Safety",
    trainingMethod: "Read & Understood",
    duration: 2,
    passScore: 80,
    mandatory: true,
    linkedDocumentTitle: "TM-PDF-003",
    instructor: "Chris Anderson",
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
    linkedDocumentTitle: "TM-IMG-004",
    instructor: "External Trainer",
  },
  {
    id: "5",
    trainingId: "TRN-2026-005",
    title: "SOP Documentation & Control",
    type: "GMP",
    trainingMethod: "Read & Understood",
    duration: 4,
    passScore: 80,
    mandatory: true,
    linkedDocumentTitle: "TM-VID-005",
    instructor: "Maria Lopez",
  },
  {
    id: "6",
    trainingId: "TRN-2026-006",
    title: "HPLC Operations",
    type: "Technical",
    trainingMethod: "Hands-on/OJT",
    duration: 8,
    passScore: 80,
    mandatory: true,
    linkedDocumentTitle: "TM-DOC-006",
    instructor: "Robert Johnson",
  },
  {
    id: "7",
    trainingId: "TRN-2026-007",
    title: "Validation IQ/OQ/PQ",
    type: "Technical",
    trainingMethod: "Quiz (Paper-based/Manual)",
    duration: 4,
    passScore: 75,
    mandatory: false,
    linkedDocumentTitle: "TM-PDF-007",
    instructor: "Dr. Anna Smith",
  },
  {
    id: "8",
    trainingId: "TRN-2026-008",
    title: "Risk Assessment & FMEA",
    type: "Compliance",
    trainingMethod: "Read & Understood",
    duration: 3,
    passScore: 80,
    mandatory: true,
    linkedDocumentTitle: "TM-DOC-008",
    instructor: "Dr. Anna Smith",
  },
  {
    id: "9",
    trainingId: "TRN-2026-009",
    title: "Chemical Safety",
    type: "Safety",
    trainingMethod: "Read & Understood",
    duration: 2,
    passScore: 80,
    mandatory: true,
    linkedDocumentTitle: "TM-VID-009",
    instructor: "HSE Dept.",
  },
  {
    id: "10",
    trainingId: "TRN-2026-010",
    title: "Data Integrity (ALCOA+)",
    type: "Compliance",
    trainingMethod: "Quiz (Paper-based/Manual)",
    duration: 4,
    passScore: 90,
    mandatory: true,
    linkedDocumentTitle: "TM-PDF-010",
    instructor: "QA Dept.",
  },
  {
    id: "11",
    trainingId: "TRN-2026-011",
    title: "Deviation & CAPA",
    type: "GMP",
    trainingMethod: "Read & Understood",
    duration: 4,
    passScore: 85,
    mandatory: true,
    linkedDocumentTitle: "TM-DOC-011",
    instructor: "QA Dept.",
  },
  {
    id: "12",
    trainingId: "TRN-2026-012",
    title: "Change Control Process",
    type: "GMP",
    trainingMethod: "Read & Understood",
    duration: 4,
    passScore: 80,
    mandatory: true,
    linkedDocumentTitle: "TM-PDF-012",
    instructor: "QA Dept.",
  },
  {
    id: "13",
    trainingId: "SOP-013",
    title: "Sampling Procedures",
    type: "Technical",
    trainingMethod: "Hands-on/OJT",
    duration: 2,
    passScore: 80,
    mandatory: true,
    linkedDocumentTitle: "TM-PDF-013",
    instructor: "QC Dept.",
  },
  {
    id: "14",
    trainingId: "SOP-014",
    title: "Equipment Calibration",
    type: "Technical",
    trainingMethod: "Hands-on/OJT",
    duration: 4,
    passScore: 80,
    mandatory: true,
    linkedDocumentTitle: "TM-DOC-014",
    instructor: "Engineering Dept.",
  },
  {
    id: "15",
    trainingId: "SOP-015",
    title: "Batch Record Review",
    type: "GMP",
    trainingMethod: "Read & Understood",
    duration: 6,
    passScore: 85,
    mandatory: true,
    linkedDocumentTitle: "TM-PDF-015",
    instructor: "QA Dept.",
  },
];

export const BUSINESS_UNITS = ["Quality Unit", "Operation Unit", "Support Unit"];
export const DEPARTMENTS = [
  "Quality Assurance",
  "Quality Control",
  "Production",
  "Engineering",
  "Documentation",
  "HSE",
  "Supply Chain",
];
export const JOB_TITLES = [
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
export const CATEGORY_OPTIONS = [
  { label: "All Categories", value: "All" },
  { label: "GMP", value: "GMP" },
  { label: "Safety", value: "Safety" },
  { label: "Technical", value: "Technical" },
  { label: "Compliance", value: "Compliance" },
];
export const METHOD_OPTIONS = [
  { label: "All Methods", value: "All" },
  { label: "Read & Understood", value: "Read & Understood" },
  { label: "Quiz (Paper-based/Manual)", value: "Quiz (Paper-based/Manual)" },
  { label: "Hands-on/OJT", value: "Hands-on/OJT" },
];
export const TYPE_BADGE_COLORS: Record<string, string> = {
  GMP: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Safety: "bg-amber-50 text-amber-700 border-amber-200",
  Technical: "bg-blue-50 text-blue-700 border-blue-200",
  Compliance: "bg-purple-50 text-purple-700 border-purple-200",
};

export const SCOPE_TABS: TabItem[] = [
  { id: "business_unit", label: "Business Unit", icon: IconBuilding },
  { id: "department", label: "Department", icon: Building2 },
  { id: "individual", label: "Individual", icon: IconUser },
];

export const PRIORITY_OPTIONS = [
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

export const getInitials = (name: string) =>
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
    {/* Mobile View (Compact circles) */}
    <div className="flex sm:hidden items-center justify-start gap-0 px-2 py-4 bg-slate-50/50 border-b border-slate-100 overflow-x-auto">
      <div className="flex items-center justify-start min-w-max mx-auto">
        {STEP_LABELS.map((label, i) => {
          const step = (i + 1) as WizardStep;
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;
          const isLast = i === STEP_LABELS.length - 1;

          return (
            <React.Fragment key={step}>
              <div 
                className="flex flex-col items-center gap-1.5 cursor-pointer w-[80px] flex-shrink-0"
                onClick={() => onStepChange(step)}
              >
                <div className={cn(
                  "relative w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold transition-all shadow-sm",
                  isCompleted ? "bg-emerald-600 text-white" :
                    isCurrent ? "bg-emerald-600 text-white ring-4 ring-emerald-100" :
                      "bg-slate-100 text-slate-400 border border-slate-200"
                )}>
                  {isCompleted ? <IconCheck className="h-3.5 w-3.5" /> : step}
                </div>
                <span className={cn(
                  "text-[10px] font-semibold text-center leading-tight transition-colors",
                  isCurrent ? "text-emerald-700" : isCompleted ? "text-emerald-700" : "text-slate-400"
                )}>
                  {label.split(" ").pop()}
                </span>
              </div>
              {!isLast && (
                <div className={cn(
                  "w-6 h-0.5 flex-shrink-0 transition-all self-start mt-3.5 rounded-full",
                  isCompleted ? "bg-emerald-500" : "bg-slate-200"
                )} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>

    {/* Desktop View (Arrow shapes) */}
    <div className="hidden sm:block overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
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
                    "h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold border leading-none",
                    isCurrent
                      ? "bg-white text-emerald-600 border-white"
                      : isCompleted
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-slate-200 text-slate-500 border-slate-300",
                  )}
                >
                  {isCompleted ? <IconCheck className="h-4 w-4" /> : step}
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
  const [selectedCourseId, setSelectedCourseId] = useState<string>(() => {
    return prefilledCourseId || sessionStorage.getItem("assignment_selectedCourseId") || "";
  });

  useEffect(() => {
    if (selectedCourseId) {
      sessionStorage.setItem("assignment_selectedCourseId", selectedCourseId);
    } else {
      sessionStorage.removeItem("assignment_selectedCourseId");
    }
  }, [selectedCourseId]);
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
        e.position.toLowerCase().includes(q) ||
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
    sessionStorage.removeItem("assignment_selectedCourseId");
    navigateTo(ROUTES.TRAINING.TRAINING_MATRIX);
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
      sessionStorage.removeItem("assignment_selectedCourseId");
      showToast({
        type: "success",
        title: "Assignment Created",
        message: `Training assigned to ${totalAssignees} employee${totalAssignees !== 1 ? "s" : ""}. Notifications sent.`,
        duration: 4000,
      });
      navigateTo(ROUTES.TRAINING.TRAINING_MATRIX);
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

