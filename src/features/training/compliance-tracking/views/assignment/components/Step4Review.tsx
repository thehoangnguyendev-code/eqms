import React, { useState } from "react";
import {
  Flag,
  PenTool,
  Zap,
  GraduationCap,
  Clock,
  ChevronRight,
  ShieldCheck,
  BellRing,
  UserCheck,
  Building2,
  CalendarDays,
} from "lucide-react";
import {
  IconChecklist,
  IconAdjustmentsHorizontal,
  IconUsers,
  IconCheck,
} from "@tabler/icons-react";
import { FormSection } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge/Badge";
import { cn } from "@/components/ui/utils";
import { formatDate } from "@/utils/format";
import type { AssignmentPriority } from "../../../../types/assignment.types";
import { PRIORITY_COLORS } from "../../../../types/assignment.types";
import type { EmployeeRow } from "../../../types";
import { TYPE_BADGE_COLORS, type ApprovedCourse } from "../AssignTrainingView";

export interface Step4Props {
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

export const Step4Review: React.FC<Step4Props> = ({
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
          <div className="flex items-start gap-3 p-4 md:p-5 bg-amber-50 border border-amber-200 rounded-xl">
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
            >
              <div className="space-y-5">
                {/* Course Summary Content */}
                {course ? (
                  <div className="space-y-3 lg:space-y-4">
                    {/* Course ID */}
                    <div className="flex flex-col lg:flex-row lg:items-center gap-1.5 lg:gap-2 pb-3 lg:pb-4 border-b border-slate-200">
                      <label className="text-xs sm:text-sm font-medium text-slate-700 w-full lg:w-40 flex-shrink-0">Course ID</label>
                      <p className="text-xs lg:text-sm text-slate-900 font-medium flex-1">
                        {course.trainingId}
                      </p>
                    </div>

                    {/* Course Title */}
                    <div className="flex flex-col lg:flex-row lg:items-center gap-1.5 lg:gap-2 pb-3 lg:pb-4 border-b border-slate-200">
                      <label className="text-xs sm:text-sm font-medium text-slate-700 w-full lg:w-40 flex-shrink-0">Course Title</label>
                      <p className="text-xs lg:text-sm text-slate-900 font-medium flex-1">
                        {course.title}
                      </p>
                    </div>

                    {/* Training Type */}
                    <div className="flex flex-col lg:flex-row lg:items-center gap-1.5 lg:gap-2 pb-3 lg:pb-4 border-b border-slate-200">
                      <label className="text-xs sm:text-sm font-medium text-slate-700 w-full lg:w-40 flex-shrink-0">Training Type</label>
                      <div className="flex-1">
                        <Badge
                          className={cn(
                            "text-[10px] font-bold px-2 py-0",
                            TYPE_BADGE_COLORS[course.type],
                          )}
                        >
                          {course.type}
                        </Badge>
                      </div>
                    </div>

                    {/* Training Method */}
                    <div className="flex flex-col lg:flex-row lg:items-center gap-1.5 lg:gap-2 pb-3 lg:pb-4 border-b border-slate-200">
                      <label className="text-xs sm:text-sm font-medium text-slate-700 w-full lg:w-40 flex-shrink-0">Training Method</label>
                      <p className="text-xs lg:text-sm text-slate-900 flex-1">
                        {course.trainingMethod}
                      </p>
                    </div>

                    {/* Duration */}
                    <div className="flex flex-col lg:flex-row lg:items-center gap-1.5 lg:gap-2 pb-3 lg:pb-4 border-b border-slate-200">
                      <label className="text-xs sm:text-sm font-medium text-slate-700 w-full lg:w-40 flex-shrink-0">Duration</label>
                      <p className="text-xs lg:text-sm text-slate-900 flex-1">
                        {course.duration}h
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center text-slate-400 text-sm">
                    No course selected
                  </div>
                )}

                {/* Reason for Assignment Section - Chỉnh lại style cho chuyên nghiệp hơn */}
                <div className="pt-2">
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
