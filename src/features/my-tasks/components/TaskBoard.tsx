import React from "react";
import { AlertCircle, Calendar, Flag, GripHorizontal, MoreHorizontal, Plus } from "lucide-react";
import { cn } from "@/components/ui/utils";
import { ModuleBadge } from "@/components/ui/badge";
import type { Task, TaskStatus } from "../types";
import { isOverdue, calculateDaysLeft } from "../utils";

// ─── Avatar helpers ──────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  "bg-violet-500", "bg-sky-500", "bg-emerald-500",
  "bg-amber-500", "bg-rose-500", "bg-indigo-500",
];
const avatarColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};
const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

// ─── Column config ───────────────────────────────────────────────────────────
interface ColumnDef {
  id: TaskStatus;
  label: string;
  headerBg: string;
  panelBg: string;
  headerText: string;
  dotColor: string;
  countBg: string;
  countText: string;
}

const COLUMNS: ColumnDef[] = [
  {
    id: "Pending",
    label: "Not Started",
    headerBg: "bg-slate-50",
    panelBg: "bg-slate-50",
    headerText: "text-slate-700",
    dotColor: "bg-slate-400",
    countBg: "bg-white",
    countText: "text-slate-600",
  },
  {
    id: "In-Progress",
    label: "In Progress",
    headerBg: "bg-amber-100",
    panelBg: "bg-amber-50",
    headerText: "text-amber-700",
    dotColor: "bg-amber-500",
    countBg: "bg-white/90",
    countText: "text-amber-700",
  },
  {
    id: "Reviewing",
    label: "In Review",
    headerBg: "bg-violet-100",
    panelBg: "bg-violet-50",
    headerText: "text-violet-700",
    dotColor: "bg-violet-500",
    countBg: "bg-white/90",
    countText: "text-violet-700",
  },
  {
    id: "Completed",
    label: "Completed",
    headerBg: "bg-emerald-100",
    panelBg: "bg-emerald-50",
    headerText: "text-emerald-700",
    dotColor: "bg-emerald-500",
    countBg: "bg-white/90",
    countText: "text-emerald-700",
  },
];

const PRIORITY_STYLES: Record<string, string> = {
  Critical: "text-rose-600",
  High: "text-rose-600",
  Medium: "text-amber-600",
  Low: "text-slate-500",
};

function parseDueDate(ddmmyyyy: string): Date | null {
  const parts = ddmmyyyy.split("/");
  if (parts.length !== 3) return null;
  const [day, month, year] = parts.map(Number);
  if (!day || !month || !year) return null;
  return new Date(year, month - 1, day);
}

function getDueLabel(dueDate: string): string {
  const date = parseDueDate(dueDate);
  if (!date) return "N/A";
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

// ─── Task Card ────────────────────────────────────────────────────────────────
const TaskCard: React.FC<{ task: Task; onClick: (t: Task) => void }> = ({ task, onClick }) => {
  const overdue = isOverdue(task.dueDate) && task.status !== "Completed";
  const daysLeft = calculateDaysLeft(task.dueDate);
  const priorityClass = PRIORITY_STYLES[task.priority] || "text-slate-500";
  const assigneeInitial = getInitials(task.assignee);
  const reporterInitial = getInitials(task.reporter);

  return (
    <button
      type="button"
      onClick={() => onClick(task)}
      className="w-full text-left bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-200 p-3.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className={cn("inline-flex items-center gap-1 text-[11px] font-semibold", priorityClass)}>
          <Flag className="w-3 h-3" />
          <span>{task.priority}</span>
        </div>
        <MoreHorizontal className="w-3.5 h-3.5 text-slate-400" />
      </div>

      <p className="text-[15px] font-medium text-slate-800 leading-snug mb-3 line-clamp-2">
        {task.title}
      </p>

      <div className="mb-3">
        <ModuleBadge module={task.module as any} />
      </div>

      <div className="flex items-center justify-between mb-3 text-slate-400">
        <GripHorizontal className="w-4 h-4" />
        <span className="text-[11px] font-medium">{task.taskId}</span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <div className={cn("w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold", avatarColor(task.assignee))}>
            {assigneeInitial}
          </div>
          <div className="w-5 h-5 rounded-full flex items-center justify-center bg-slate-200 text-[9px] font-bold text-slate-600">
            {reporterInitial}
          </div>
        </div>

        <div className={cn(
          "flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold border shrink-0",
          overdue
            ? "bg-rose-50 text-rose-600 border-rose-200"
            : daysLeft <= 3
              ? "bg-amber-50 text-amber-700 border-amber-200"
              : "bg-slate-50 text-slate-600 border-slate-200"
        )}>
          {overdue ? <AlertCircle className="w-2.5 h-2.5" /> : <Calendar className="w-2.5 h-2.5" />}
          <span>
            {overdue
              ? `${Math.abs(daysLeft)}d late`
              : daysLeft === 0
                ? "Today"
                : getDueLabel(task.dueDate)
            }
          </span>
        </div>
      </div>
    </button>
  );
};

// ─── Column ───────────────────────────────────────────────────────────────────
const BoardColumn: React.FC<{
  col: ColumnDef;
  tasks: Task[];
  onTaskClick: (t: Task) => void;
}> = ({ col, tasks, onTaskClick }) => (
  <div className={cn("flex flex-col w-full min-w-[280px] flex-1 basis-0 rounded-2xl border border-slate-200 overflow-hidden", col.panelBg)}>
    <div className={cn("px-3.5 py-2.5 flex items-center justify-between", col.headerBg)}>
      <div className="flex items-center gap-1.5 min-w-0">
        <div className={cn("w-2 h-2 rounded-full", col.dotColor)} />
        <span className={cn("text-[14px] font-semibold", col.headerText)}>{col.label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={cn("text-[12px] font-semibold px-1.5 py-0.5 rounded-md", col.countBg, col.countText)}>{tasks.length}</span>
        <button type="button" className={cn("inline-flex items-center justify-center w-5 h-5 rounded hover:bg-black/5", col.headerText)}>
          <Plus className="w-3.5 h-3.5" />
        </button>
        <button type="button" className={cn("inline-flex items-center justify-center w-5 h-5 rounded hover:bg-black/5", col.headerText)}>
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 max-h-[calc(100vh-320px)] custom-scrollbar">
      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-slate-400">
          <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center mb-2">
            <span className="text-lg">·</span>
          </div>
          <p className="text-[12px] font-medium">No tasks</p>
        </div>
      ) : (
        tasks.map((task) => (
          <TaskCard key={task.id + task.taskId} task={task} onClick={onTaskClick} />
        ))
      )}
    </div>
  </div>
);

// ─── Main Board ───────────────────────────────────────────────────────────────
export const TaskBoard: React.FC<{
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}> = ({ tasks, onTaskClick }) => {
  const grouped = (status: TaskStatus) => tasks.filter((t) => t.status === status);

  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-slate-300 hover:scrollbar-thumb-slate-400">
      <div className="flex min-w-[1168px] gap-4">
        {COLUMNS.map((col) => (
          <BoardColumn
            key={col.id}
            col={col}
            tasks={grouped(col.id)}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>
    </div>
  );
};
