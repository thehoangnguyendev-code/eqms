import React, { useState } from "react";
import {
  Flag,
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
import { Checkbox } from "@/components/ui/checkbox/Checkbox";
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
      <div className="space-y-6">
        {needsESign && (
          <div className="flex items-center justify-center text-center px-4 py-2 bg-amber-50/60 border border-amber-200/80 rounded-xl backdrop-blur-sm w-full">
            <p className="text-sm font-medium text-amber-800">
              <span className="font-semibold">E-Signature required</span> — You
              will be prompted to enter your credentials to authorize this
              assignment (Annex 11 / EU-GMP).
            </p>
          </div>
        )}

        {/* Row 1: Course Info, Assignment Config, Authorization Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Course Information */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <GraduationCap className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Course Information</h3>
            </div>

            <div className="space-y-4">
              {course ? (
                <div className="space-y-3.5">
                  {/* Course ID */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 pb-2.5 border-b border-slate-100/80">
                    <label className="text-xs sm:text-sm font-medium text-slate-700 w-full lg:w-40 flex-shrink-0">Course ID</label>
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 flex-1">
                      {course.trainingId}
                    </p>
                  </div>

                  {/* Course Title */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 pb-2.5 border-b border-slate-100/80">
                    <label className="text-xs sm:text-sm font-medium text-slate-700 w-full lg:w-40 flex-shrink-0">Course Title</label>
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 flex-1">
                      {course.title}
                    </p>
                  </div>

                  {/* Training Type */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 pb-2.5 border-b border-slate-100/80">
                    <label className="text-xs sm:text-sm font-medium text-slate-700 w-full lg:w-40 flex-shrink-0">Training Type</label>
                    <div className="flex-1">
                      <Badge
                        className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                          TYPE_BADGE_COLORS[course.type],
                        )}
                      >
                        {course.type}
                      </Badge>
                    </div>
                  </div>

                  {/* Training Method */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 pb-2.5 border-b border-slate-100/80">
                    <label className="text-xs sm:text-sm font-medium text-slate-700 w-full lg:w-40 flex-shrink-0">Training Method</label>
                    <p className="text-xs sm:text-sm font-medium text-slate-700 flex-1">
                      {course.trainingMethod}
                    </p>
                  </div>

                  {/* Duration */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
                    <label className="text-xs sm:text-sm font-medium text-slate-700 w-full lg:w-40 flex-shrink-0">Duration</label>
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 flex-1">
                      {course.duration}h
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center text-slate-400 text-sm">
                  No course selected
                </div>
              )}

              {/* Reason for Assignment Section */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs sm:text-sm font-medium text-slate-700 block">
                    Reason for Assignment{" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <span
                    className={cn(
                      "text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-colors",
                      reasonForAssignment.trim().length < 10
                        ? "bg-rose-50 text-rose-600 border-rose-100"
                        : "bg-emerald-50 text-emerald-600 border-emerald-100",
                    )}
                  >
                    {reasonForAssignment.length} / 10 min characters
                  </span>
                </div>

                <textarea
                  value={reasonForAssignment}
                  onChange={(e) => onReasonChange(e.target.value)}
                  placeholder="Describe the content or purpose of this training material..."
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm placeholder:text-slate-400 resize-none"
                />
                <p className="text-[11px] text-slate-400 flex items-center gap-1 leading-tight">
                  This justification will be recorded in the audit trail for compliance verification.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Assignment Configuration */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <IconAdjustmentsHorizontal className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Assignment Configuration</h3>
            </div>

            <div className="space-y-4">
              {/* Row 1: Priority & Deadline */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 flex items-start gap-3 bg-slate-50/50 border border-slate-100 rounded-xl">
                  <div className="p-2 rounded-lg bg-white text-slate-500 border border-slate-100 flex-shrink-0 shadow-sm">
                    <Flag className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-500">
                      Priority
                    </p>
                    <div className="mt-1">
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
                          PRIORITY_COLORS[priority],
                        )}
                      >
                        {priority}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 flex items-start gap-3 bg-slate-50/50 border border-slate-100 rounded-xl">
                  <div className="p-2 rounded-lg bg-white text-slate-500 border border-slate-100 flex-shrink-0 shadow-sm">
                    <CalendarDays className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-500">
                      Deadline
                    </p>
                    <p className="text-sm font-bold text-slate-800 mt-1">
                      {deadlineDate ? formatDate(deadlineDate) : "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Row 2: Compliance with Checkboxes */}
              <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl space-y-3">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">
                  Compliance & Controls
                </p>

                {[
                  {
                    label: "Block tasks until completed",
                    val: trainingBeforeAuthorized,
                  },
                  {
                    label: "Require E-Signature on Completion",
                    val: requiresESign,
                  },
                  {
                    label: "Cross-training (Non-mandatory)",
                    val: isCrossTraining,
                  },
                ].map((item, i) => (
                  <Checkbox
                    key={i}
                    checked={item.val}
                    disabled
                    label={item.label}
                    className="py-1 select-none pointer-events-none"
                  />
                ))}
              </div>

              {/* Row 3: Reminders */}
              <div className="p-4 bg-emerald-50/20 border border-emerald-100/60 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white text-emerald-600 shadow-sm border border-emerald-100 flex-shrink-0">
                    <BellRing className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-emerald-600 uppercase font-bold tracking-wider leading-none">
                      System Reminders
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {reminders.length > 0 ? (
                        reminders.map((d) => (
                          <span
                            key={d}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white border border-emerald-200 text-[11px] font-bold text-emerald-700 shadow-sm"
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
          </div>

          {/* Card 3: Authorization Details */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 space-y-4 shadow-sm md:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                  <UserCheck className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Authorization Details</h3>
              </div>
              <Badge
                color="emerald"
                variant="soft"
                className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] px-2 py-0.5 rounded-full font-bold"
              >
                Verified
              </Badge>
            </div>

            <div className="flex items-center gap-4 bg-slate-50/40 p-4 rounded-xl border border-slate-100/80">
              {/* Avatar with Status Ring */}
              <div className="relative flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-base shadow-inner border-2 border-white ring-2 ring-emerald-50">
                  AS
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center shadow-sm">
                  <IconCheck className="h-2.5 w-2.5 text-white stroke-[3]" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    Dr. Anna Smith
                  </p>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
                    ID: MGR-088
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Quality Assurance Manager
                </p>

                {/* Timestamp with Icon */}
                <div className="flex flex-wrap items-center gap-3 mt-2.5 pt-2 border-t border-slate-200/60">
                  <div className="flex items-center gap-1 text-slate-400">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="text-[11px] font-semibold text-slate-500">
                      {new Date().toLocaleString("vi-VN")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <Building2 className="h-3.5 w-3.5" />
                    <span className="text-[11px] font-semibold text-slate-500 uppercase">
                      Quality Unit
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Disclaimer for GMP */}
            <div className="pt-3 border-t border-slate-100 italic">
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 leading-normal">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500/80 flex-shrink-0" />
                This assignment will be electronically signed and timestamped upon submission in accordance with EU-GMP Annex 11.
              </p>
            </div>
          </div>
        </div>

        {/* Row 2: Target Assignees */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <IconUsers className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Target Assignees</h3>
            </div>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-sm">
              {resolvedAssignees.length} Employee{resolvedAssignees.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Scope Summary Line */}
          <div className="flex items-center gap-2 mb-3 bg-slate-50/60 p-2.5 rounded-xl border border-slate-100/80">
            <div className="h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0 animate-pulse" />
            <p className="text-xs font-medium text-slate-600">
              Scope: <span className="text-slate-900 font-semibold">{targetSummary}</span>
            </p>
          </div>

          {/* Scrollable List Area */}
          <div className="border border-slate-200/60 rounded-xl bg-slate-50/20 overflow-hidden">
            <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-100/80 custom-scrollbar">
              {displayAssignees.map((e, index) => (
                <div
                  key={e.id}
                  className="flex items-center gap-3 p-3 hover:bg-white transition-colors group"
                >
                  {/* 1. Số thứ tự (No.) */}
                  <span className="text-xs font-medium text-slate-400 w-5 flex-shrink-0 text-center">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  {/* 3. Employee Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-800 truncate leading-tight">
                        {e.name}
                      </p>
                      {/* Employee Code Badge */}
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded flex-shrink-0">
                        {e.employeeCode}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-1 font-medium">
                      {e.position}{" "}
                      <span className="text-slate-300 mx-1">•</span>{" "}
                      {e.department}
                    </p>
                  </div>

                  {/* 4. Status Icon */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <IconCheck className="h-4 w-4 text-emerald-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Toggle Button */}
          {resolvedAssignees.length > 5 && (
            <div className="pt-1 text-center">
              <button
                onClick={() => setShowAllAssignees((v) => !v)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors py-1.5 px-3.5 rounded-full hover:bg-emerald-50/80 border border-transparent hover:border-emerald-100"
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
        </div>
      </div>
    </FormSection>
  );
};
