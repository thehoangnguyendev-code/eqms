import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  AlertTriangle,
  BookOpen,
  CheckCircle,
  Clock,
  Activity,
  Lock,
  AlertCircle,
  Link2,
  ShieldAlert,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import { cn } from "@/components/ui/utils";
import { InlineLoading } from "@/components/ui/loading/Loading";
import { IconCheck } from "@tabler/icons-react";

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
      return { classes: "bg-red-50 text-red-700 border-red-200", icon: <AlertTriangle className="h-3 w-3" /> };
  }
};

const STEPS = [
  { label: "Impact Analysis", short: "Impact" },
  { label: "Justification", short: "Reason" },
  { label: "E-Signature", short: "Sign" },
];

export const MarkObsoleteModal: React.FC<MarkObsoleteModalProps> = ({
  isOpen,
  material,
  onClose,
  onConfirm,
}) => {
  const [step, setStep] = useState(0);

  const [justificationCode, setJustificationCode] = useState("");
  const [justificationNote, setJustificationNote] = useState("");
  const [replacedByCode, setReplacedByCode] = useState("");

  const [password, setPassword] = useState("");
  const [signReason, setSignReason] = useState("");
  const [signError, setSignError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const linkedDetails: LinkedCourseDetail[] = (material?.linkedCourses || [])
    .map((id) => MOCK_COURSE_DETAILS[id])
    .filter(Boolean);

  const activeCourses = linkedDetails.filter((c) => ACTIVE_STATUSES.includes(c.status));
  const completedCourses = linkedDetails.filter((c) => !ACTIVE_STATUSES.includes(c.status));
  const totalAffectedLearners = activeCourses.reduce((s, c) => s + c.learnersEnrolled, 0);
  const hasActiveCourses = activeCourses.length > 0;
  const isReplacedByVersion = justificationCode === "replaced_new_version";

  const step2Valid =
    !!justificationCode &&
    (justificationCode !== "other" || justificationNote.trim().length > 0) &&
    (!isReplacedByVersion || replacedByCode.trim().length > 0);

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

  const portalContent = createPortal(
    <AnimatePresence mode="wait">
      {isOpen && material && (
        <motion.div
          key="mark-obsolete-modal-wrapper"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden"
        >
          {/* Backdrop */}
          <motion.div
            key="mark-obsolete-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={handleClose}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            key="mark-obsolete-modal-content"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 350,
              duration: 0.3
            }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl border border-slate-200 overflow-hidden relative z-10 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 px-6 py-5 border-b border-slate-200 shrink-0 bg-white min-h-[64px]">
              <div className="min-w-0">
                <h2 className="text-base font-bold text-slate-900">Mark as Obsolete</h2>
                <p className="text-xs text-slate-500 mt-0.5 truncate leading-tight">
                  {material.materialId} · {material.title} · v{material.version}
                </p>
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

            {/* Indicator */}
            <div className="flex items-center justify-center gap-0 px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
              {STEPS.map((s, i) => {
                const isDone = i < step;
                const isCurrent = i === step;
                return (
                  <React.Fragment key={s.label}>
                    <div className="flex flex-col items-center gap-2">
                        <div className={cn(
                          "relative w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all shadow-sm",
                          isDone ? "bg-emerald-600 text-white" :
                          isCurrent ? "bg-red-600 text-white ring-4 ring-red-100" :
                          "bg-slate-100 text-slate-400 border border-slate-200"
                        )}>
                          {isDone ? <IconCheck className="h-4 w-4" /> : i + 1}
                        </div>
                      <span className={cn(
                        "text-[10px] font-semibold text-center leading-tight transition-colors",
                        isCurrent ? "text-red-700" : isDone ? "text-emerald-700" : "text-slate-400"
                      )}>
                        {s.short}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={cn(
                        "flex-1 mx-2 h-0.5 transition-all max-w-[40px] mb-4 rounded-full",
                        isDone ? "bg-emerald-500" : "bg-slate-200"
                      )} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              {step === 0 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-red-600" />
                      Impact Analysis
                    </h3>
                  </div>

                  {hasActiveCourses && (
                    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-red-800">
                          {activeCourses.length} active course{activeCourses.length > 1 ? "s" : ""} will be affected
                        </p>
                        <p className="text-xs text-red-700 mt-1 leading-relaxed">
                          This material is used in {activeCourses.length} active courses with {totalAffectedLearners} learners. Marking as obsolete will disrupt these courses.
                        </p>
                      </div>
                    </div>
                  )}

                  {!linkedDetails.length && (
                    <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm font-medium text-emerald-800 italic">No active courses affected. Safe to proceed.</p>
                    </div>
                  )}

                  {activeCourses.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Courses</p>
                      <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100">
                        {activeCourses.map((c) => {
                          const cfg = getCourseStatusConfig(c.status);
                          return (
                            <div key={c.courseId} className="flex items-center gap-3 px-4 py-3 bg-white">
                              <BookOpen className="h-4 w-4 text-slate-300" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">{c.title}</p>
                                <p className="text-[10px] text-slate-400">{c.courseId} · {c.department}</p>
                              </div>
                              <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border", cfg?.classes)}>
                                {c.status}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      Justification
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <Select
                      label={<>Reason <span className="text-red-500">*</span></>}
                      value={justificationCode}
                      onChange={(val) => {
                        setJustificationCode(val);
                        if (val !== "replaced_new_version") setReplacedByCode("");
                      }}
                      options={JUSTIFICATION_OPTIONS}
                      placeholder="Choose a reason..."
                    />

                    {isReplacedByVersion && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">New Version Material ID <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={replacedByCode}
                          onChange={(e) => setReplacedByCode(e.target.value)}
                          placeholder="e.g. TRN-TM-001 v2.0"
                          className="w-full h-10 px-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
                        />
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Notes {justificationCode === "other" && "*"}</label>
                      <textarea
                        value={justificationNote}
                        onChange={(e) => setJustificationNote(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Confirmation Summary</p>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Material:</span>
                        <span className="font-bold text-slate-900">{material.materialId} v{material.version}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Reason:</span>
                        <span className="font-bold text-slate-900">{JUSTIFICATION_OPTIONS.find(o => o.value === justificationCode)?.label}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Password <span className="text-red-500">*</span></label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setSignError(""); }}
                        className="w-full h-10 px-4 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500"
                        autoComplete="current-password"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Regulatory Reason <span className="text-red-500">*</span></label>
                      <textarea
                        value={signReason}
                        onChange={(e) => { setSignReason(e.target.value); setSignError(""); }}
                        rows={2}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none"
                      />
                    </div>
                    {signError && <p className="text-xs text-red-600 font-medium">{signError}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={step === 0 ? handleClose : () => setStep(s => s - 1)}
                disabled={isSubmitting}
              >
                {step === 0 ? "Cancel" : "Back"}
              </Button>
              <Button
                size="sm"
                onClick={step < 2 ? () => setStep(s => s + 1) : handleESign}
                disabled={(step === 1 && !step2Valid) || isSubmitting}
                className={cn(
                  step === 2 || (step === 0 && hasActiveCourses) ? "bg-red-600 hover:bg-red-700 text-white border-red-600" : ""
                )}
              >
                {isSubmitting ? <InlineLoading size="xs" color="white" /> : (step === 2 ? "Confirm & Sign" : "Continue")}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );

  return portalContent;
};
