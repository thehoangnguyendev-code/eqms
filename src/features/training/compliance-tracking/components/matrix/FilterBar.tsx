import React from "react";
import { Search, SlidersHorizontal, ToggleLeft, ToggleRight, X } from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import { cn } from "@/components/ui/utils";
import type { MatrixFilters, CellStatus } from "../../types";
import {
  DEPARTMENT_OPTIONS,
  JOB_TITLE_OPTIONS,
  STATUS_OPTIONS,
} from "../../mockData";

interface FilterBarProps {
  filters: MatrixFilters;
  onChange: (filters: MatrixFilters) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = React.memo(({
  filters,
  onChange,
  showFilters,
  onToggleFilters,
}) => {
  const set = (patch: Partial<MatrixFilters>) =>
    onChange({ ...filters, ...patch });

  const hasActiveFilters =
    filters.searchQuery !== "" ||
    filters.department !== "All" ||
    filters.jobTitle !== "All" ||
    filters.status !== "All";

  const activeCount = [
    filters.department !== "All",
    filters.jobTitle !== "All",
    filters.status !== "All",
  ].filter(Boolean).length;

  const clearAll = () =>
    onChange({
      ...filters,
      searchQuery: "",
      department: "All",
      jobTitle: "All",
      status: "All",
    });

  return (
    <div className="bg-white p-4 lg:p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
      {/* Row 1: Search + action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
        {/* Search */}
        <div className="flex-1 w-full sm:max-w-md">
          <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search employee, department, job title..."
              value={filters.searchQuery}
              onChange={(e) => set({ searchQuery: e.target.value })}
              className="w-full h-9 pl-10 pr-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm placeholder:text-slate-400 transition-colors"
            />
          </div>
        </div>

        {/* Filter toggle + Gap Analysis */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            className="gap-2"
            onClick={onToggleFilters}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 inline-flex items-center justify-center h-5 w-5 rounded-full bg-white/20 text-[10px] font-bold">
                {activeCount}
              </span>
            )}
          </Button>

          <button
            onClick={() => set({ gapAnalysis: !filters.gapAnalysis })}
            className={cn(
              "inline-flex items-center gap-2 h-9 px-3 rounded-lg border text-sm font-medium transition-all",
              filters.gapAnalysis
                ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            )}
          >
            {filters.gapAnalysis ? (
              <ToggleRight className="h-4 w-4 text-red-500" />
            ) : (
              <ToggleLeft className="h-4 w-4 text-slate-400" />
            )}
            Gap Analysis
          </button>
        </div>
      </div>

      {/* Row 2: Expanded filter selects */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-2 border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
          <Select
            label="Department"
            value={filters.department}
            onChange={(val) => set({ department: val })}
            options={DEPARTMENT_OPTIONS}
          />
          <Select
            label="Job Title"
            value={filters.jobTitle}
            onChange={(val) => set({ jobTitle: val })}
            options={JOB_TITLE_OPTIONS}
          />
          <Select
            label="Status"
            value={filters.status}
            onChange={(val) => set({ status: val as CellStatus | "All" })}
            options={STATUS_OPTIONS}
          />
        </div>
      )}

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          {filters.department !== "All" && (
            <FilterChip
              label={`Dept: ${filters.department}`}
              onRemove={() => set({ department: "All" })}
            />
          )}
          {filters.jobTitle !== "All" && (
            <FilterChip
              label={`Job: ${filters.jobTitle}`}
              onRemove={() => set({ jobTitle: "All" })}
            />
          )}
          {filters.status !== "All" && (
            <FilterChip
              label={`Status: ${filters.status}`}
              onRemove={() => set({ status: "All" })}
            />
          )}
          <Button variant="outline" size="xs" onClick={clearAll}>
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
});

// ─── Internal helper ──────────────────────────────────────────────────────────
const FilterChip: React.FC<{ label: string; onRemove: () => void }> = ({
  label,
  onRemove,
}) => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-50 text-slate-700 border-slate-200">
    {label}
    <button
      onClick={onRemove}
      className="hover:text-red-500 transition-colors"
      aria-label="Remove filter"
    >
      <X className="h-3 w-3" />
    </button>
  </span>
);
