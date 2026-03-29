import React from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from '@/components/ui/button/Button';
import { TaskStatusBadge, PriorityBadge, ModuleBadge } from '@/components/ui/badge';
import { cn } from '@/components/ui/utils';
import { formatDateUS } from '@/utils/format';
import type { Task } from "../types";
import {
  calculateDaysLeft,
} from "../utils";
import { IconCircleCheckFilled } from "@tabler/icons-react";

// Add diagonal stripes pattern for completed tasks
const diagonalStripesStyle = `
  .completed-row {
    background-image: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      rgba(148, 163, 184, 0.08) 10px,
      rgba(148, 163, 184, 0.08) 20px
    );
  }
  .completed-row:hover {
    background-image: repeating-linear-gradient(
      45deg,
      rgba(248, 250, 252, 0.9),
      rgba(248, 250, 252, 0.9) 10px,
      rgba(148, 163, 184, 0.12) 10px,
      rgba(148, 163, 184, 0.12) 20px
    );
  }
  .completed-row-cell {
    background-image: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      rgba(148, 163, 184, 0.08) 10px,
      rgba(148, 163, 184, 0.08) 20px
    );
  }
  .completed-row:hover .completed-row-cell {
    background-image: repeating-linear-gradient(
      45deg,
      rgba(248, 250, 252, 0.9),
      rgba(248, 250, 252, 0.9) 10px,
      rgba(148, 163, 184, 0.12) 10px,
      rgba(148, 163, 184, 0.12) 20px
    );
  }
`;

export const TaskTable: React.FC<{
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  startIndex: number;
}> = ({ tasks, onTaskClick, startIndex }) => {

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: diagonalStripesStyle }} />
      <div className="overflow-x-auto flex-1">
        <table className="w-full min-w-[1200px]">
          <thead className="bg-slate-50/80 border-b-2 border-slate-200 sticky top-0 z-30">
            <tr>
              <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                No.
              </th>
              <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                Task ID
              </th>
              <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                Task Name
              </th>
              <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                Module
              </th>
              <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                Assignee
              </th>
              <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                Reporter
              </th>
              <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                Days Left
              </th>
              <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                Status
              </th>
              <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                Progress
              </th>
              <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                Due Date
              </th>
              <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                Priority
              </th>
              <th className="sticky right-0 bg-slate-50 py-2.5 px-2 sm:py-3.5 sm:px-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider z-[1] whitespace-nowrap before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-200 shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.05)]">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {tasks.map((task, idx) => {
              const remainingDays = calculateDaysLeft(task.dueDate);
              const progressPercentage = task.progress || 0;

              return (
                <tr
                  key={task.id}
                  onClick={() => onTaskClick(task)}
                  className={cn(
                    "hover:bg-slate-50/80 transition-colors group relative cursor-pointer",
                    task.status === "Completed" && "completed-row"
                  )}
                >
                  {/* No. */}
                  <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm font-medium text-slate-700 whitespace-nowrap">
                    {startIndex + idx}
                  </td>

                  {/* Task ID */}
                  <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                    <span className="font-semibold text-emerald-600">
                      {task.taskId}
                    </span>
                  </td>

                  {/* Task Name */}
                  <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">
                        {task.title}
                      </span>
                    </div>
                  </td>

                  {/* Module */}
                  <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                    <ModuleBadge module={task.module as any} />
                  </td>

                  {/* Assignee */}
                  <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm text-slate-700" title={task.assignee}>
                        {task.assignee}
                      </span>
                    </div>
                  </td>

                  {/* Reporter */}
                  <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm text-slate-700" title={task.reporter}>
                        {task.reporter}
                      </span>
                    </div>
                  </td>

                  {/* Days Left */}
                  <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                    <span
                      className={cn(
                        "text-xs sm:text-sm font-medium",
                        remainingDays < 0 ? "text-rose-600" : "text-slate-700"
                      )}
                    >
                      {remainingDays < 0
                        ? `${Math.abs(remainingDays)} overdue`
                        : `${remainingDays} days`}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                    <TaskStatusBadge status={task.status as any} />
                  </td>

                  {/* Progress */}
                  <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={cn(
                            "h-full transition-all rounded-full",
                            task.status === "Completed"
                              ? "bg-emerald-500"
                              : "bg-blue-500"
                          )}
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-600 w-8">
                        {progressPercentage}%
                      </span>
                      {task.status === "Completed" && (
                        <IconCircleCheckFilled className="h-4 w-4 text-emerald-600" />
                      )}
                    </div>
                  </td>

                  {/* Due Date */}
                  <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <span>{formatDateUS(task.dueDate)}</span>
                    </div>
                  </td>

                  {/* Priority */}
                  <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                    <PriorityBadge priority={task.priority as any} />
                  </td>

                  {/* Action (Sticky) */}
                  <td
                    onClick={(e) => e.stopPropagation()}
                    className={cn(
                      "sticky right-0 bg-white py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-center z-30 whitespace-nowrap before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-200 shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.05)] group-hover:bg-slate-50",
                      task.status === "Completed" && "completed-row-cell"
                    )}
                  >
                    {task.status === "Completed" ? (
                      <div className="inline-flex items-center rounded-lg border border-emerald-600 gap-1.5 px-1.5 py-1.5 text-emerald-600 text-xs font-medium">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Done</span>
                      </div>
                    ) : (
                      <Button
                        variant="default"
                        size="xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          onTaskClick(task);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                      >
                        Process
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};



