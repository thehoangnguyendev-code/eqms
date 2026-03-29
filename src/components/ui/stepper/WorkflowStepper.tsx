import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/components/ui/utils";

interface WorkflowStepperProps {
  /**
   * Ordered list of step labels. The order determines the chevron shape:
   * first, middle, and last step each get different clip-paths.
   */
  steps: string[];
  /**
   * The label of the currently active step. All steps before this are
   * considered completed; all steps after are upcoming.
   */
  currentStep: string;
  /** Additional className for the outer container */
  className?: string;
}

/**
 * WorkflowStepper — Horizontal chevron-shaped progress stepper.
 *
 * - Completed steps: light emerald background + check icon
 * - Current step: solid emerald background + white text
 * - Upcoming steps: slate background + muted text
 *
 * Horizontally scrollable on small screens.
 *
 * Usage:
 * ```tsx
 * import { WorkflowStepper } from "@/components/ui/stepper/WorkflowStepper";
 *
 * const STEPS = ["Draft", "Pending Review", "Pending Approval", "Approved", "Effective"];
 *
 * <WorkflowStepper steps={STEPS} currentStep={document.status} />
 * ```
 */
export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  steps,
  currentStep,
  className,
}) => {
  const currentIndex = steps.indexOf(currentStep);

  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden",
        className
      )}
    >
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
        <div className="flex items-stretch min-w-full">
          {steps.map((step, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isFirst = index === 0;
            const isLast = index === steps.length - 1;

            const clipPath = isFirst
              ? "polygon(0% 0%, calc(100% - 20px) 0%, 100% 50%, calc(100% - 20px) 100%, 0% 100%)"
              : isLast
              ? "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 20px 50%)"
              : "polygon(0% 0%, calc(100% - 20px) 0%, 100% 50%, calc(100% - 20px) 100%, 0% 100%, 20px 50%)";

            return (
              <div
                key={step}
                className="relative flex-1 flex items-center justify-center min-w-[140px]"
                style={{ minHeight: "56px" }}
              >
                {/* Chevron background */}
                <div
                  className={cn(
                    "absolute inset-0 transition-all",
                    isCompleted
                      ? "bg-emerald-100"
                      : isCurrent
                      ? "bg-emerald-600"
                      : "bg-slate-100"
                  )}
                  style={{ clipPath }}
                />

                {/* Step label */}
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
  );
};
