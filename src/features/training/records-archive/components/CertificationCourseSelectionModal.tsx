import React, { useState } from "react";
import { CheckCircle2, AlertCircle, FileText, Award, ArrowRight } from "lucide-react";
import { FormModal } from "@/components/ui/modal/FormModal";
import { Badge } from "@/components/ui/badge/Badge";
import { cn } from "@/components/ui/utils";
import type { EmployeeTrainingFile, CompletedCourseRecord } from "../../types";

import { Checkbox } from "@/components/ui/checkbox/Checkbox";

interface CertificationCourseSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: EmployeeTrainingFile;
  onSelectCourse: (course: CompletedCourseRecord) => void;
}

export const CertificationCourseSelectionModal: React.FC<CertificationCourseSelectionModalProps> = ({
  isOpen,
  onClose,
  employee,
  onSelectCourse,
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const completedCourses = employee.completedCourses || [];

  const handleConfirm = () => {
    const selected = completedCourses.find(c => c.id === selectedCourseId);
    if (selected) {
      onSelectCourse(selected);
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Course for Certification"
      description={
        <p className="text-xs text-slate-500">
          Pick a completed and fully signed course for <span className="font-bold text-slate-700">{employee.employeeName}</span> to generate the formal certificate.
        </p>
      }
      size="lg"
      confirmText="Continue to Preview"
      confirmDisabled={!selectedCourseId}
      onConfirm={handleConfirm}
    >
      <div className="space-y-1 min-h-[300px] max-h-[450px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        {completedCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <FileText className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-700">No completed courses found</p>
            <p className="text-xs text-slate-500 mt-1">This employee does not have any recorded training completions yet.</p>
          </div>
        ) : (
          completedCourses.map((course) => {
            const isEligible = course.status === "Pass" && course.pendingSignaturesCount === 0;
            const isSelected = selectedCourseId === course.id;

            return (
              <div
                key={course.id}
                onClick={() => {
                  if (!isEligible) return;
                  setSelectedCourseId(isSelected ? null : course.id);
                }}
                className={cn(
                  "flex items-center gap-4 p-4 md:p-5 rounded-xl border transition-all cursor-pointer relative",
                  isSelected
                    ? "border-emerald-500 bg-emerald-50/50 shadow-sm"
                    : isEligible
                      ? "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300"
                      : "border-slate-100 bg-slate-50/50 opacity-60 cursor-not-allowed"
                )}
              >
                {/* Selection Checkbox */}
                <div className="flex-shrink-0">
                  <Checkbox
                    checked={isSelected}
                    disabled={!isEligible}
                    onChange={() => isEligible && setSelectedCourseId(isSelected ? null : course.id)}
                  />
                </div>

                {/* Course Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs md:text-sm font-medium text-slate-900 whitespace-nowrap">{course.courseCode}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] md:text-xs text-slate-500 mt-0.5">{course.version}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 font-medium truncate">
                    <span>{course.courseTitle}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <span>Completed: {course.completionDate}</span>
                  </div>
                </div>

                {/* Badge/Selection State */}
                <div className="flex flex-col items-end gap-1.5 ml-2">
                  {course.status === "Pass" ? (
                    course.pendingSignaturesCount === 0 ? (
                      isSelected ? (
                        <div className="flex items-center gap-1 text-emerald-600 font-bold text-[10px] tracking-wider">
                          Selected
                        </div>
                      ) : (
                        <Badge color="emerald" size="xs">Eligible</Badge>
                      )
                    ) : (
                      <div className="flex items-center gap-1 text-amber-600 font-bold text-[10px]">
                        <AlertCircle className="h-3 w-3" />
                        {course.pendingSignaturesCount} sign pending
                      </div>
                    )
                  ) : (
                    <Badge color="red" size="xs">Failed</Badge>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </FormModal>
  );
};
