import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  AlertTriangle,
  BookOpen,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Lock,
  AlertCircle,
  Link2,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import { cn } from "@/components/ui/utils";
import { InlineLoading } from "@/components/ui/loading/Loading";
import { IconCheck, IconCircleCheck } from "@tabler/icons-react";

// ─── Types ───────────────────────────────────────────────────────────
export interface ObsoleteMaterial {
  id: string;
  materialId: string;
  title: string;
  version: string;
  type: string;
  linkedCourses: string[];
}

export interface ObsoleteResult {
  justificationCode: string;
  justificationNote: string;
  replacedByCode: string; // empty if N/A
}

export interface MarkObsoleteModalProps {
  isOpen: boolean;
  material: ObsoleteMaterial | null;
  onClose: () => void;
  onConfirm: (result: ObsoleteResult) => void;
}

// ─── Mock linked course details ───────────────────────────────────────
type CourseStatus = "Active" | "In Progress" | "Completed" | "Cancelled";

interface LinkedCourseDetail {
  courseId: string;
  title: string;
  department: string;
  status: CourseStatus;
  learnersEnrolled: number;
}

const MOCK_COURSE_DETAILS: Record<string, LinkedCourseDetail> = {
  "TRN-2026-001": { courseId: "TRN-2026-001", title: "New Employee GMP Onboarding", department: "Quality Assurance", status: "Completed", learnersEnrolled: 24 },
  "TRN-2026-002": { courseId: "TRN-2026-002", title: "Cleanroom Certification - Level 1", department: "Production", status: "In Progress", learnersEnrolled: 18 },
  "TRN-2026-003": { courseId: "TRN-2026-003", title: "Engineering Equipment Safety", department: "Engineering", status: "In Progress", learnersEnrolled: 22 },
  "TRN-2026-004": { courseId: "TRN-2026-004", title: "Annual GMP Refresher Q1", department: "Production", status: "Active", learnersEnrolled: 38 },
  "TRN-2026-005": { courseId: "TRN-2026-005", title: "Sterile Manufacturing Basics", department: "Production", status: "Active", learnersEnrolled: 25 },
  "TRN-2026-006": { courseId: "TRN-2026-006", title: "ISO 9001 Internal Auditor Training", department: "Quality Assurance", status: "Active", learnersEnrolled: 16 },
  "TRN-2026-007": { courseId: "TRN-2026-007", title: "Site-wide Safety Awareness 2026", department: "HSE", status: "Completed", learnersEnrolled: 120 },
  "TRN-2026-008": { courseId: "TRN-2026-008", title: "QA Team Competency Training", department: "Quality Assurance", status: "Completed", learnersEnrolled: 12 },
  "TRN-2026-009": { courseId: "TRN-2026-009", title: "Emergency Response Procedures", department: "HSE", status: "In Progress", learnersEnrolled: 45 },
  "TRN-2026-010": { courseId: "TRN-2026-010", title: "SOP Documentation Workshop", department: "Quality Control", status: "Active", learnersEnrolled: 20 },
  "TRN-2026-011": { courseId: "TRN-2026-011", title: "Chemical Safety for Lab Teams", department: "HSE", status: "In Progress", learnersEnrolled: 18 },
  "TRN-2026-012": { courseId: "TRN-2026-012", title: "Chemical Safety Training 2026", department: "HSE", status: "Active", learnersEnrolled: 30 },
  "TRN-2026-013": { courseId: "TRN-2026-013", title: "Hazardous Materials Handling", department: "HSE", status: "Completed", learnersEnrolled: 20 },
  "TRN-2026-014": { courseId: "TRN-2026-014", title: "HPLC Operations Training", department: "Quality Control", status: "Active", learnersEnrolled: 10 },
  "TRN-2026-015": { courseId: "TRN-2026-015", title: "Water System Qualification Training", department: "Engineering", status: "Active", learnersEnrolled: 8 },
};

const ACTIVE_STATUSES: CourseStatus[] = ["Active", "In Progress"];

const JUSTIFICATION_OPTIONS = [
  { value: "replaced_new_version", label: "Replaced by a newer version" },
  { value: "equipment_decommissioned", label: "Equipment has been decommissioned / retired" },
  { value: "process_no_longer_applicable", label: "Process / procedure no longer applicable" },
  { value: "regulatory_change", label: "Superseded by regulatory / policy change" },
  { value: "content_inaccurate", label: "Content found to be inaccurate or outdated" },
  { value: "other", label: "Other reason" },
];

const getCourseStatusConfig = (status: CourseStatus) => {
  switch (status) {
    case "Active":
      return { classes: "bg-blue-50 text-blue-700 border-blue-200", icon: <Activity className="h-3 w-3" /> };
    case "In Progress":
      return { classes: "bg-amber-50 text-amber-700 border-amber-200", icon: <Clock className="h-3 w-3" /> };
    case "Completed":
      return { classes: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <IconCheck className="h-3 w-3" /> };
    case "Cancelled":
      return { classes: "bg-red-50 text-red-700 border-red-200", icon: <XCircle className="h-3 w-3" /> };
  }
};

// ─── Step Indicator ──────────────────────────────────────────────────
const STEPS = [
  { label: "Impact Analysis", short: "Impact" },
  { label: "Justification", short: "Reason" },
  { label: "E-Signature", short: "Sign" },
];

// ─── Main Component ──────────────────────────────────────────────────
export const MarkObsoleteModal: React.FC<MarkObsoleteModalProps> = ({
  isOpen,
  material,
  onClose,
  onConfirm,
}) => {
  const [step, setStep] = useState(0);

  // Step 2 state
  const [justificationCode, setJustificationCode] = useState("");
  const [justificationNote, setJustificationNote] = useState("");
  const [replacedByCode, setReplacedByCode] = useState("");

  // Step 3 state
  const [password, setPassword] = useState("");
  const [signReason, setSignReason] = useState("");
  const [signError, setSignError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setJustificationCode("");
      setJustificationNote("");
      setReplacedByCode("");
      setPassword("");
      setSignReason("");
      setSignError("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen || !material) return null;

  // Compute linked course details
  const linkedDetails: LinkedCourseDetail[] = material.linkedCourses
    .map((id) => MOCK_COURSE_DETAILS[id])
    .filter(Boolean);

  const activeCourses = linkedDetails.filter((c) => ACTIVE_STATUSES.includes(c.status));
  const completedCourses = linkedDetails.filter((c) => !ACTIVE_STATUSES.includes(c.status));
  const totalAffectedLearners = activeCourses.reduce((s, c) => s + c.learnersEnrolled, 0);
  const hasActiveCourses = activeCourses.length > 0;
  const isReplacedByVersion = justificationCode === "replaced_new_version";

  // ── Step 2 validation
  const step2Valid =
    !!justificationCode &&
    (justificationCode !== "other" || justificationNote.trim().length > 0) &&
    (!isReplacedByVersion || replacedByCode.trim().length > 0);

  // ── Step 3 submit
  const handleESign = () => {
    if (!password.trim()) { setSignError("Password is required."); return; }
    if (!signReason.trim()) { setSignError("Reason is required for audit trail."); return; }
    setSignError("");
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onConfirm({
        justificationCode,
        justificationNote,
        replacedByCode: isReplacedByVersion ? replacedByCode.trim() : "",
      });
    }, 1000);
  };

  const handleClose = () => {
    if (!isSubmitting) onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* ── Header ───────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-3 px-6 py-5 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-slate-900">Mark as Obsolete</h2>
              <p className="text-xs text-slate-500 mt-0.5 truncate">
                {material.materialId} · {material.title} · v{material.version}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-shrink-0 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        {/* ── Step Indicator ────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-0 px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
          {STEPS.map((s, i) => {
            const isDone = i < step;
            const isCurrent = i === step;
            return (
              <React.Fragment key={s.label}>
                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    {isCurrent && (
                      <span className="absolute inset-0 rounded-full bg-red-400 opacity-75 animate-ping" />
                    )}
                    <div className={cn(
                      "relative w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all shadow-sm",
                      isDone ? "bg-emerald-600 text-white" :
                      isCurrent ? "bg-red-600 text-white ring-4 ring-red-100 scale-110" :
                      "bg-slate-100 text-slate-400 border border-slate-200"
                    )}>
                      {isDone ? <IconCheck className="h-5 w-5" /> : i + 1}
                    </div>
                  </div>
                  <span className={cn(
                    "text-xs font-semibold text-center leading-tight transition-colors",
                    isCurrent ? "text-red-700" : isDone ? "text-emerald-700" : "text-slate-400"
                  )}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn(
                    "flex-1 mx-3 h-0.5 transition-all max-w-[60px] mb-6 rounded-full",
                    isDone ? "bg-emerald-500" : "bg-slate-200"
                  )} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* ── Body ─────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* ── STEP 1: Impact Analysis ──────────────────────────── */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-red-600" />
                  Impact Analysis
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  The system has scanned all training courses currently using this material.
                </p>
              </div>

              {/* Warning banner – only if active courses exist */}
              {hasActiveCourses && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-800">
                      High Impact — {activeCourses.length} active course{activeCourses.length > 1 ? "s" : ""} will be affected
                    </p>
                    <p className="text-xs text-red-700 mt-1">
                      This material is currently used in{" "}
                      <span className="font-bold">{activeCourses.length}</span> active / in-progress course{activeCourses.length > 1 ? "s" : ""} with a total of{" "}
                      <span className="font-bold">{totalAffectedLearners}</span> enrolled learner{totalAffectedLearners !== 1 ? "s" : ""}.
                      Marking it as obsolete will disrupt these courses — coordinators will need to update or replace the material.
                    </p>
                  </div>
                </div>
              )}

              {/* No courses — safe */}
              {linkedDetails.length === 0 && (
                <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-800">No active courses affected</p>
                    <p className="text-xs text-emerald-700 mt-1">
                      This material is not linked to any active or in-progress courses. It is safe to mark as obsolete.
                    </p>
                  </div>
                </div>
              )}

              {/* Only completed courses */}
              {linkedDetails.length > 0 && !hasActiveCourses && (
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">Low impact — all linked courses are completed</p>
                    <p className="text-xs text-amber-700 mt-1">
                      This material was used in {linkedDetails.length} course{linkedDetails.length > 1 ? "s" : ""}, all of which are completed. No active learners will be disrupted.
                    </p>
                  </div>
                </div>
              )}

              {/* Active courses list */}
              {activeCourses.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Active / In-Progress Courses ({activeCourses.length})
                  </p>
                  <div className="border border-red-200 rounded-xl overflow-hidden divide-y divide-red-100">
                    {activeCourses.map((course) => {
                      const cfg = getCourseStatusConfig(course.status);
                      return (
                        <div key={course.courseId} className="flex items-center gap-3 px-4 py-3 bg-red-50/30">
                          <BookOpen className="h-4 w-4 text-red-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{course.title}</p>
                            <p className="text-xs text-slate-500">{course.courseId} · {course.department}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs text-slate-600">{course.learnersEnrolled} learners</span>
                            <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border", cfg.classes)}>
                              {cfg.icon} {course.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Completed courses list (collapsed style) */}
              {completedCourses.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Completed / Historical Courses ({completedCourses.length})
                  </p>
                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                    {completedCourses.map((course) => {
                      const cfg = getCourseStatusConfig(course.status);
                      return (
                        <div key={course.courseId} className="flex items-center gap-3 px-4 py-3 bg-slate-50/30">
                          <BookOpen className="h-4 w-4 text-slate-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 truncate">{course.title}</p>
                            <p className="text-xs text-slate-400">{course.courseId} · {course.department}</p>
                          </div>
                          <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0", cfg.classes)}>
                            {cfg.icon} {course.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {linkedDetails.length === 0 && (
                <p className="text-xs text-slate-400 italic text-center py-4">
                  This material has no linked courses in the system.
                </p>
              )}
            </div>
          )}

          {/* ── STEP 2: Justification ─────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  Justification
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  You must provide a reason before proceeding. This will be recorded in the audit trail.
                </p>
              </div>

              {/* Reason select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Select Reason <span className="text-red-500">*</span>
                </label>
                <Select
                  value={justificationCode}
                  onChange={(val) => {
                    setJustificationCode(val);
                    if (val !== "replaced_new_version") setReplacedByCode("");
                  }}
                  options={JUSTIFICATION_OPTIONS}
                  placeholder="Choose a reason..."
                />
              </div>

              {/* Replaced-by code – only visible when "replaced_new_version" selected */}
              {isReplacedByVersion && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    New Version Material Code <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={replacedByCode}
                      onChange={(e) => setReplacedByCode(e.target.value)}
                      placeholder="e.g. TM-PDF-003 v2.0"
                      className="w-full h-9 pl-10 pr-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-sm placeholder:text-slate-400"
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    A link to this replacement will be shown on the obsoleted material's profile.
                  </p>
                </div>
              )}

              {/* Optional additional notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Additional Notes
                  {justificationCode === "other" && <span className="text-red-500 ml-1">*</span>}
                </label>
                <textarea
                  value={justificationNote}
                  onChange={(e) => setJustificationNote(e.target.value)}
                  rows={3}
                  placeholder="Provide any additional context or notes about this decision..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm placeholder:text-slate-400 resize-none"
                />
              </div>
            </div>
          )}

          {/* ── STEP 3: E-Signature ───────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-slate-600" />
                  Electronic Signature
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Your signature is required to authorize this irreversible action. This confirms your identity and intent.
                </p>
              </div>

              {/* Summary before signing */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Action Summary</p>
                <div className="space-y-1.5 text-sm">
                  <div className="flex gap-2">
                    <span className="text-slate-500 flex-shrink-0 w-24">Material:</span>
                    <span className="font-medium text-slate-900">{material.materialId} · v{material.version}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-slate-500 flex-shrink-0 w-24">Action:</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                      <XCircle className="h-3 w-3" /> Mark as Obsolete
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-slate-500 flex-shrink-0 w-24">Reason:</span>
                    <span className="font-medium text-slate-900">
                      {JUSTIFICATION_OPTIONS.find((o) => o.value === justificationCode)?.label}
                    </span>
                  </div>
                  {isReplacedByVersion && replacedByCode && (
                    <div className="flex gap-2">
                      <span className="text-slate-500 flex-shrink-0 w-24">Replaced by:</span>
                      <span className="font-medium text-emerald-700 flex items-center gap-1">
                        <Link2 className="h-3.5 w-3.5" /> {replacedByCode}
                      </span>
                    </div>
                  )}
                  {hasActiveCourses && (
                    <div className="flex gap-2">
                      <span className="text-slate-500 flex-shrink-0 w-24">Impact:</span>
                      <span className="font-medium text-red-700">
                        {activeCourses.length} active course{activeCourses.length > 1 ? "s" : ""} · {totalAffectedLearners} learners
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {signError && (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <p className="text-xs text-red-700">{signError}</p>
                </div>
              )}

              {/* Credentials */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-medium text-slate-700">
                    Username <span className="text-xs text-slate-400 font-normal">(auto-filled from session)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value="Dr. A. Smith"
                      disabled
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-medium text-slate-700">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setSignError(""); }}
                    placeholder="Enter your password to confirm"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                    autoComplete="current-password"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-medium text-slate-700">
                    Reason for Change <span className="text-red-500">*</span>
                    <span className="text-slate-400 font-normal ml-1">(Audit Trail)</span>
                  </label>
                  <textarea
                    value={signReason}
                    onChange={(e) => { setSignReason(e.target.value); setSignError(""); }}
                    rows={2}
                    placeholder="Briefly state why you are authorizing this action..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm min-h-[80px]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ───────────────────────────────────────────── */}
        <div className={cn(
          "flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-200 flex-shrink-0",
          step === 0 && hasActiveCourses && "border-t"
        )}>
          {/* Cancel / Back */}
          {step === 0 ? (
            <Button variant="outline" size="sm" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setStep((s) => s - 1)} disabled={isSubmitting} className="gap-1.5">
              Back
            </Button>
          )}

          {/* Next / Confirm */}
          <div className="flex items-center gap-2">
            {step < 2 ? (
              <Button
                size="sm"
                variant={step === 0 ? (hasActiveCourses ? "default" : "default") : "default"}
                onClick={() => setStep((s) => s + 1)}
                disabled={step === 1 && !step2Valid}
                className={cn("gap-1.5", step === 0 && hasActiveCourses
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : ""
                )}
              >
                {step === 0 ? (hasActiveCourses ? "I Understand, Continue" : "Continue") : "Next"}
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleESign}
                disabled={isSubmitting}
                className="gap-2 bg-red-600 hover:bg-red-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <InlineLoading size="xs" color="#ffffff" />
                    <span className="ml-2">Processing...</span>
                  </>
                ) : (
                  <>
                    Confirm & Sign
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
