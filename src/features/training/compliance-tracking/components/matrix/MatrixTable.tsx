import React from "react";
import { Search, AlertTriangle, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import { cn } from "@/components/ui/utils";
import { ROUTES } from "@/app/routes.constants";
import type { MatrixFilters, EmployeeRow, SOPColumn } from "../../types";
import { MOCK_SOPS, getCell } from "../../mockData";
import { CELL_CONFIG } from "./constants";

interface MatrixTableProps {
  employees: EmployeeRow[];
  filters: MatrixFilters;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onCellClick: (e: React.MouseEvent, employee: EmployeeRow, sop: SOPColumn) => void;
  onEmployeeClick: (e: React.MouseEvent, employee: EmployeeRow) => void;
  onSOPHeaderClick: (e: React.MouseEvent, sop: SOPColumn) => void;
  navigateTo?: (to: string | number, options?: any, delay?: number) => void;
}

export const MatrixTable: React.FC<MatrixTableProps> = React.memo(({
  employees,
  filters,
  hasActiveFilters,
  onClearFilters,
  onCellClick,
  onEmployeeClick,
  onSOPHeaderClick,
  navigateTo,
}) => {
  return (
    <div className="border rounded-xl bg-white shadow-sm overflow-hidden flex flex-col flex-1">
      {/* Scrollable grid — max 10 rows visible, scroll when exceeding */}
      <div className="overflow-auto max-h-[340px] sm:max-h-[420px] md:max-h-[480px] relative">
        <table className="border-separate border-spacing-0">
          <MatrixHead onSOPHeaderClick={onSOPHeaderClick} />
          <MatrixBody
            employees={employees}
            filters={filters}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={onClearFilters}
            onCellClick={onCellClick}
            onEmployeeClick={onEmployeeClick}
            navigateTo={navigateTo}
          />
        </table>
      </div>

      {/* Summary bar */}
      <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3.5 border-t border-slate-200 bg-slate-50/50">
        <span className="text-[10px] sm:text-xs text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-700">{employees.length}</span> employees ×{" "}
          <span className="font-semibold text-slate-700">{MOCK_SOPS.length}</span> SOPs
        </span>
        {filters.gapAnalysis && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border bg-red-50 text-red-700 border-red-200">
            <AlertTriangle className="h-3 w-3" />
            Gap Analysis Active
          </span>
        )}
      </div>
    </div>
  );
});

// ─── Head sub-component ───────────────────────────────────────────────────────
interface MatrixHeadProps {
  onSOPHeaderClick: (e: React.MouseEvent, sop: SOPColumn) => void;
}

const MatrixHead: React.FC<MatrixHeadProps> = React.memo(({ onSOPHeaderClick }) => (
  <thead>
    <tr>
      {/* No. */}
      <th className="sticky top-0 left-0 z-30 bg-white border-b-2 border-r border-slate-200 px-1.5 sm:px-2 py-2.5 sm:py-4 min-w-[36px] sm:min-w-[52px] max-w-[36px] sm:max-w-[52px] text-center shadow-[0_2px_6px_-2px_rgba(0,0,0,0.1)]">
        <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
          No.
        </span>
      </th>

      {/* Employee */}
      <th className="sticky top-0 left-[36px] sm:left-[52px] z-30 bg-white border-b-2 border-r border-slate-200 px-2 sm:px-4 py-2.5 sm:py-4 min-w-[120px] sm:min-w-[150px] md:min-w-[180px] max-w-[120px] sm:max-w-[150px] md:max-w-[180px] shadow-[0_2px_6px_-2px_rgba(0,0,0,0.1)]">
        <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
          Employee
        </span>
      </th>

      {/* SOP columns */}
      {MOCK_SOPS.map((sop) => (
        <th
          key={sop.id}
          className="sticky top-0 z-20 bg-slate-50 border-b-2 border-r border-slate-200 px-1.5 sm:px-2 md:px-3 py-2 sm:py-3 min-w-[64px] sm:min-w-[90px] md:min-w-[130px] max-w-[64px] sm:max-w-[90px] md:max-w-[130px] cursor-pointer hover:bg-slate-100 transition-colors group/sop text-left shadow-[0_2px_6px_-2px_rgba(0,0,0,0.1)]"
          onClick={(e) => onSOPHeaderClick(e, sop)}
          title={`${sop.code}: ${sop.title}`}
        >
          <div className="flex flex-col gap-1.5 overflow-hidden">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-[10px] sm:text-[12px] font-bold text-emerald-600 leading-tight block truncate w-full">
                {sop.code}
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-slate-500 font-medium leading-snug truncate group-hover/sop:text-slate-500 transition-colors">
              {sop.title}
            </p>
          </div>
        </th>
      ))}
    </tr>
  </thead>
));

// ─── Body sub-component ───────────────────────────────────────────────────────
interface MatrixBodyProps {
  employees: EmployeeRow[];
  filters: MatrixFilters;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onCellClick: (e: React.MouseEvent, employee: EmployeeRow, sop: SOPColumn) => void;
  onEmployeeClick: (e: React.MouseEvent, employee: EmployeeRow) => void;
  navigateTo?: (path: any) => void;
}

const MatrixBody: React.FC<MatrixBodyProps> = React.memo(({
  employees,
  filters,
  hasActiveFilters,
  onClearFilters,
  onCellClick,
  onEmployeeClick,
  navigateTo,
}) => {
  if (employees.length === 0) {
    return (
      <tbody>
        <tr>
          <td colSpan={MOCK_SOPS.length + 2} className="py-20 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center">
                <Search className="h-6 w-6 text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-900">No employees found</p>
              <p className="text-xs text-slate-500">Try adjusting your filters</p>
              {hasActiveFilters && (
                <Button className="whitespace-nowrap" variant="outline" size="xs" onClick={onClearFilters}>
                  Clear filters
                </Button>
              )}
            </div>
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody>
      {employees.map((emp, index) => (
        <tr key={emp.id} className="group/row">
          {/* No. */}
          <td className="sticky left-0 z-10 bg-white border-b border-r border-slate-200 px-1.5 sm:px-2 py-1 sm:py-1.5 min-w-[36px] sm:min-w-[52px] max-w-[36px] sm:max-w-[52px] text-center group-hover/row:bg-white">
            <span className="text-xs font-medium text-slate-400">{index + 1}</span>
          </td>

          {/* Employee name */}
          <td
            className="sticky left-[36px] sm:left-[52px] z-10 bg-white border-b border-r border-slate-200 px-2 sm:px-3 py-1 sm:py-1.5 min-w-[120px] sm:min-w-[150px] md:min-w-[180px] max-w-[120px] sm:max-w-[150px] md:max-w-[180px] cursor-pointer hover:bg-slate-50 transition-colors group-hover/row:bg-white"
            onClick={(e) => onEmployeeClick(e, emp)}
          >
            <p className="text-[11px] sm:text-[13px] font-semibold text-slate-900 truncate leading-tight">
              {emp.name}
            </p>
          </td>

          {/* Status cells */}
          {MOCK_SOPS.map((sop) => {
            const cell = getCell(emp.id, sop.id);
            if (!cell) {
              return (
                <td
                  key={sop.id}
                  className="border-b border-r border-slate-200 min-w-[64px] sm:min-w-[90px] md:min-w-[130px]"
                />
              );
            }

            const cfg = CELL_CONFIG[cell.status];
            const isGapHidden = filters.gapAnalysis && cell.status === "Qualified";

            return (
              <td
                key={sop.id}
                className="border-b border-r border-slate-200 p-0 min-w-[64px] sm:min-w-[90px] md:min-w-[130px] max-w-[64px] sm:max-w-[90px] md:max-w-[130px] h-px"
              >
                <button
                  className={cn(
                    "w-full h-full flex items-center justify-center gap-2 text-base transition-all duration-100 touch-manipulation group/cell",
                    isGapHidden
                      ? "bg-white text-slate-200 cursor-default"
                      : cn(cfg.bg, cfg.hoverBg, "cursor-pointer active:scale-95"),
                    cell.status !== "NotRequired" && !isGapHidden && "hover:shadow-inner"
                  )}
                  onClick={(e) => {
                    if (cell.status === "NotRequired") {
                      if (navigateTo) {
                        navigateTo(`${ROUTES.TRAINING.ASSIGNMENT_NEW}?employeeId=${emp.id}&courseId=${sop.id}`);
                      }
                    } else if (!isGapHidden) {
                      onCellClick(e, emp, sop);
                    }
                  }}
                  title={isGapHidden ? "Qualified (hidden)" : cell.status === "NotRequired" ? `Assign training to ${emp.name} for ${sop.title}` : `${cfg.label} – ${sop.title}`}
                  aria-label={`${emp.name} - ${sop.code}: ${cfg.label}`}
                >
                  {isGapHidden ? (
                    <span className="text-slate-200 text-sm">—</span>
                  ) : cell.status === "NotRequired" ? (
                    <>
                      <cfg.Icon className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 group-hover/cell:opacity-0 transition-opacity", cfg.iconColor)} />
                      <PlusCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500 absolute opacity-0 group-hover/cell:opacity-100 transition-opacity" aria-hidden />
                    </>
                  ) : (
                    <>
                      <cfg.Icon className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0", cfg.iconColor)} />
                      <span className="hidden md:inline text-[11px] font-semibold text-slate-600 select-none">
                        {cfg.label}
                      </span>
                    </>
                  )}
                </button>
              </td>
            );
          })}
        </tr>
      ))}
    </tbody>
  );
});
