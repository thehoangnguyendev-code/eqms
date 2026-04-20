import { CheckCircle2, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from '@/components/ui/button/Button';
import { TaskStatusBadge, PriorityBadge, ModuleBadge } from '@/components/ui/badge';
import { cn } from '@/components/ui/utils';
import { useTableDragScroll } from "@/hooks";
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
  sortConfig?: { key: string; direction: "asc" | "desc" };
  onSort?: (key: string) => void;
}> = ({ tasks, onTaskClick, startIndex, sortConfig, onSort }) => {
  const { scrollerRef, isDragging, dragEvents } = useTableDragScroll();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: diagonalStripesStyle }} />
      <div
        ref={scrollerRef}
        className={cn(
          "flex-1 overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-50 hover:scrollbar-thumb-slate-400",
          isDragging ? "cursor-grabbing select-none" : "cursor-grab"
        )}
        {...dragEvents}
      >
        <table className="w-full min-w-max border-separate border-spacing-0 text-left">
          <thead>
            <tr>
              <th className="sticky top-0 z-20 bg-slate-50 py-2.5 px-2 md:py-3.5 md:px-4 text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 whitespace-nowrap w-16 text-center">
                No.
              </th>
              {[
                { id: "taskId", label: "Task ID", sortable: true },
                { id: "title", label: "Task Name", sortable: true },
                { id: "module", label: "Module", sortable: true },
                { id: "assignee", label: "Assignee", sortable: true },
                { id: "reporter", label: "Reporter", sortable: true },
                { id: "daysLeft", label: "Days Left", sortable: false },
                { id: "status", label: "Status", sortable: true },
                { id: "progress", label: "Progress", sortable: true },
                { id: "dueDate", label: "Due Date", sortable: true },
                { id: "priority", label: "Priority", sortable: true },
              ].map((col) => {
                const isSorted = sortConfig?.key === col.id;
                const canSort = col.sortable && onSort;
                return (
                  <th
                    key={col.id}
                    onClick={canSort ? () => onSort(col.id) : undefined}
                    className={cn(
                      "sticky top-0 z-20 bg-slate-50 py-2.5 px-2 md:py-3.5 md:px-4 text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 whitespace-nowrap transition-colors",
                      canSort && "cursor-pointer hover:bg-slate-100 hover:text-slate-700 group"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2 w-full">
                      <span className="truncate">{col.label}</span>
                      {canSort && (
                        <div className="flex flex-col text-slate-500 flex-shrink-0 group-hover:text-slate-700 transition-colors">
                          <ChevronUp className={cn("h-3 w-3 -mb-0.5", isSorted && sortConfig?.direction === 'asc' ? "text-emerald-600" : "")} />
                          <ChevronDown className={cn("h-3 w-3", isSorted && sortConfig?.direction === 'desc' ? "text-emerald-600" : "")} />
                        </div>
                      )}
                    </div>
                  </th>
                );
              })}
              <th className="sticky top-0 right-0 z-30 bg-slate-50 py-2.5 px-2 md:py-3.5 md:px-4 text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center whitespace-nowrap border-b-2 border-slate-200 before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-slate-200 after:absolute after:inset-y-0 after:left-full after:w-[50vw] after:bg-slate-50 shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.05)]">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {tasks.map((task, idx) => {
              const remainingDays = calculateDaysLeft(task.dueDate);
              const progressPercentage = task.progress || 0;
              const tdClass = "py-2.5 px-2 md:py-3 md:px-4 text-xs md:text-sm text-slate-700 border-b border-slate-200 whitespace-nowrap";

              return (
                <tr
                  key={task.id}
                  className={cn(
                    "hover:bg-slate-50/80 transition-colors group relative",
                    task.status === "Completed" && "completed-row"
                  )}
                >
                  <td className={cn(tdClass, "text-center text-slate-500")}>
                    {startIndex + idx}
                  </td>

                  <td
                    className={cn(tdClass, "cursor-pointer")}
                    onClick={() => onTaskClick(task)}
                  >
                    <span className="font-medium text-emerald-600 hover:underline">
                      {task.taskId}
                    </span>
                  </td>

                  <td className={cn(tdClass, "font-medium text-slate-900")}>
                    {task.title}
                  </td>

                  <td className={tdClass}>
                    <ModuleBadge module={task.module as any} />
                  </td>

                  <td className={tdClass}>
                    <span className="text-slate-700" title={task.assignee}>
                      {task.assignee}
                    </span>
                  </td>

                  <td className={tdClass}>
                    <span className="text-slate-700" title={task.reporter}>
                      {task.reporter}
                    </span>
                  </td>

                  <td className={tdClass}>
                    <span
                      className={cn(
                        "font-medium",
                        remainingDays < 0 ? "text-rose-600" : "text-slate-700"
                      )}
                    >
                      {remainingDays < 0
                        ? `${Math.abs(remainingDays)} overdue`
                        : `${remainingDays} days`}
                    </span>
                  </td>

                  <td className={tdClass}>
                    <TaskStatusBadge status={task.status as any} />
                  </td>

                  <td className={tdClass}>
                    <div className="flex items-center gap-2">
                      <div className="w-16 md:w-20 bg-slate-100 rounded-full h-1.5 md:h-2 overflow-hidden">
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
                      <span className="text-[10px] md:text-xs font-medium text-slate-600 w-8">
                        {progressPercentage}%
                      </span>
                      {task.status === "Completed" && (
                        <IconCircleCheckFilled className="h-3.5 w-3.5 md:h-4 md:w-4 text-emerald-600" />
                      )}
                    </div>
                  </td>

                  <td className={tdClass}>
                    <span className="text-slate-700">{formatDateUS(task.dueDate)}</span>
                  </td>

                  <td className={tdClass}>
                    <PriorityBadge priority={task.priority as any} />
                  </td>

                  <td
                    onClick={(e) => e.stopPropagation()}
                    className={cn(
                      "sticky right-0 z-10 bg-white border-b border-slate-200 py-2.5 px-2 md:py-3 md:px-4 text-center whitespace-nowrap before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-slate-200 after:absolute after:inset-y-0 after:left-full after:w-[50vw] after:bg-inherit shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.05)] group-hover:bg-slate-50 transition-colors",
                      task.status === "Completed" && "completed-row-cell"
                    )}
                  >
                    {task.status === "Completed" ? (
                      <div className="inline-flex items-center rounded-lg border border-emerald-600 gap-1.5 px-2 py-1 text-emerald-600 text-[10px] md:text-xs font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
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
                        className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm h-7 md:h-8"
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



