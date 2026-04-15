import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  X,
  ArrowDownAZ,
  ArrowDownZA,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page/PageHeader";
import { myTasks } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import { DateRangePicker } from "@/components/ui/datetime-picker/DateRangePicker";
import { TablePagination } from "@/components/ui/table/TablePagination";
import { TableEmptyState } from "@/components/ui/table/TableEmptyState";
import { SectionLoading } from "@/components/ui/loading/Loading";
import type { Task } from "./types";
import { MOCK_TASKS } from "./mockData";
import { TaskTable, TaskDetailDrawer } from "./components";

function parseDueDate(ddmmyyyy: string): number {
  const parts = ddmmyyyy.split("/");
  if (parts.length !== 3) return 0;
  const [day, month, year] = parts.map(Number);
  if (!day || !month || !year) return 0;
  return new Date(year, month - 1, day).getTime();
}

const MODULE_OPTIONS = [
  { label: "All Modules", value: "All Modules" },
  { label: "Document Control", value: "Document" },
  { label: "Deviation Management", value: "Deviation" },
  { label: "CAPA", value: "CAPA" },
  { label: "Training Management", value: "Training" },
];

const PRIORITY_OPTIONS = [
  { label: "All Priorities", value: "All Priorities" },
  { label: "Critical", value: "Critical" },
  { label: "High", value: "High" },
  { label: "Medium", value: "Medium" },
  { label: "Low", value: "Low" },
];

const STATUS_OPTIONS = [
  { label: "All Statuses", value: "All Statuses" },
  { label: "Pending", value: "Pending" },
  { label: "In Progress", value: "In-Progress" },
  { label: "Reviewing", value: "Reviewing" },
  { label: "Completed", value: "Completed" },
];

const ASSIGNEE_OPTIONS = [
  { label: "All Assignees", value: "All Assignees" },
  { label: "Dr. A. Smith (QA)", value: "Dr. A. Smith" },
  { label: "J. Doe (QC)", value: "J. Doe" },
  { label: "QC Lab Team", value: "QC Lab" },
  { label: "Engineering", value: "Engineering" },
  { label: "Warehousing", value: "Warehousing" },
  { label: "QA Risk", value: "QA Risk" },
];

const REPORTER_OPTIONS = [
  { label: "All Reporters", value: "All Reporters" },
  { label: "System", value: "System" },
  { label: "John Smith", value: "John Smith" },
  { label: "W. House", value: "W. House" },
  { label: "HR Training", value: "HR Training" },
  { label: "QA Lead", value: "QA Lead" },
  { label: "V. Validation", value: "V. Validation" },
  { label: "Fac. Manager", value: "Fac. Manager" },
  { label: "QC Lead", value: "QC Lead" },
  { label: "Auditor Ext", value: "Auditor Ext" },
  { label: "Supply Chain", value: "Supply Chain" },
  { label: "Microbio QA", value: "Microbio QA" },
  { label: "EM Lead", value: "EM Lead" },
];

export const MyTasksView: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState("All Modules");
  const [priorityFilter, setPriorityFilter] = useState("All Priorities");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [fromDateFilter, setFromDateFilter] = useState("");
  const [toDateFilter, setToDateFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("All Assignees");
  const [reporterFilter, setReporterFilter] = useState("All Reporters");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "dueDate",
    direction: "desc",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setModuleFilter("All Modules");
    setPriorityFilter("All Priorities");
    setStatusFilter("All Statuses");
    setFromDateFilter("");
    setToDateFilter("");
    setAssigneeFilter("All Assignees");
    setReporterFilter("All Reporters");
  }, []);

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  };

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    setCurrentPage(1);
    return () => clearTimeout(timer);
  }, [
    searchQuery,
    moduleFilter,
    priorityFilter,
    statusFilter,
    fromDateFilter,
    toDateFilter,
    assigneeFilter,
    reporterFilter,
  ]);

  const filteredData = useMemo(() => {
    let data = [...MOCK_TASKS];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (t) =>
          t.taskId.toLowerCase().includes(q) ||
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
      );
    }
    if (moduleFilter !== "All Modules") {
      data = data.filter((t) => t.module === moduleFilter);
    }
    if (priorityFilter !== "All Priorities") {
      data = data.filter((t) => t.priority === priorityFilter);
    }
    if (statusFilter !== "All Statuses") {
      data = data.filter((t) => t.status === statusFilter);
    }
    if (assigneeFilter !== "All Assignees") {
      data = data.filter((t) => t.assignee === assigneeFilter);
    }
    if (reporterFilter !== "All Reporters") {
      data = data.filter((t) => t.reporter === reporterFilter);
    }

    if (fromDateFilter) {
      const fromTime = parseDueDate(fromDateFilter);
      data = data.filter((t) => parseDueDate(t.dueDate) >= fromTime);
    }
    if (toDateFilter) {
      const toTime = parseDueDate(toDateFilter);
      data = data.filter((t) => parseDueDate(t.dueDate) <= toTime);
    }

    data.sort((a, b) => {
      const key = sortConfig.key as keyof Task;
      let valA: any = a[key] || "";
      let valB: any = b[key] || "";

      if (key === "dueDate") {
        valA = parseDueDate(valA);
        valB = parseDueDate(valB);
      } else if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return data;
  }, [
    searchQuery,
    moduleFilter,
    priorityFilter,
    statusFilter,
    fromDateFilter,
    toDateFilter,
    assigneeFilter,
    reporterFilter,
    sortConfig,
  ]);

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  return (
    <div className="flex flex-col h-full gap-4 md:gap-6">
      <PageHeader
        title="My Tasks"
        breadcrumbItems={myTasks(navigate)}
      />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm w-full overflow-hidden flex flex-col flex-1 min-h-0">
        <div className="p-4 md:p-5 flex flex-col">
          <div className="px-1.5 -mx-1.5 pb-1.5 -mb-1.5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div className="w-full">
                      <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block transition-colors">
                        Search
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors">
                          <Search className="h-4 w-4 text-slate-400 transition-colors" />
                        </div>
                        <input
                          type="text"
                          placeholder="Search tasks..."
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                          }}
                          className="block w-full pl-10 pr-10 h-9 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all placeholder:text-slate-400"
                        />
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="w-full">
                      <Select
                        label="Module"
                        value={moduleFilter}
                        onChange={(val) => {
                          setModuleFilter(val as string);
                          setCurrentPage(1);
                        }}
                        options={MODULE_OPTIONS}
                      />
                    </div>

                    <div className="w-full">
                      <Select
                        label="Priority"
                        value={priorityFilter}
                        onChange={(val) => {
                          setPriorityFilter(val as string);
                          setCurrentPage(1);
                        }}
                        options={PRIORITY_OPTIONS}
                      />
                    </div>

                    <div className="w-full">
                      <Select
                        label="Status"
                        value={statusFilter}
                        onChange={(val) => {
                          setStatusFilter(val as string);
                          setCurrentPage(1);
                        }}
                        options={STATUS_OPTIONS}
                      />
                    </div>

                    <div className="w-full">
                      <Select
                        label="Assignee"
                        value={assigneeFilter}
                        onChange={(val) => {
                          setAssigneeFilter(val as string);
                          setCurrentPage(1);
                        }}
                        options={ASSIGNEE_OPTIONS}
                      />
                    </div>

                    <div className="w-full">
                      <Select
                        label="Reporter"
                        value={reporterFilter}
                        onChange={(val) => {
                          setReporterFilter(val as string);
                          setCurrentPage(1);
                        }}
                        options={REPORTER_OPTIONS}
                      />
                    </div>

                    <div className="w-full">
                      <DateRangePicker
                        label="Due Date Range"
                        startDate={fromDateFilter}
                        endDate={toDateFilter}
                        onStartDateChange={(val) => {
                          setFromDateFilter(val);
                          setCurrentPage(1);
                        }}
                        onEndDateChange={(val) => {
                          setToDateFilter(val);
                          setCurrentPage(1);
                        }}
                        placeholder="Select date range"
                      />
                    </div>

                    <div className="flex items-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearFilters}
                        className="h-9 px-4 gap-2 font-medium transition-all duration-200 hover:bg-red-600 hover:text-white hover:border-red-600 whitespace-nowrap"
                      >
                        Clear Filters
                      </Button>
                    </div>
            </div>
          </div>
        </div>

        <div className="px-4 md:px-5 pb-4 md:pb-5 flex-1 flex flex-col relative min-h-0">
          {isLoading ? (
            <SectionLoading text="Loading tasks..." minHeight="400px" />
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col flex-1 bg-white transition-all duration-300 min-h-0">
              {paginatedData.length > 0 ? (
                <>
                  <TaskTable
                    tasks={paginatedData}
                    onTaskClick={setSelectedTask}
                    startIndex={(currentPage - 1) * itemsPerPage + 1}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                  />
                  <TablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={setItemsPerPage}
                  />
                </>
              ) : (
                <TableEmptyState
                  title="No Tasks Found"
                  description="We couldn’t find any tasks matching your filters. Try adjusting your search criteria or clear filters."
                  actionLabel="Clear Filters"
                  onAction={handleClearFilters}
                />
              )}
            </div>
          )}
        </div>
      </div>

      <TaskDetailDrawer task={selectedTask} onClose={() => setSelectedTask(null)} />
    </div>
  );
};
