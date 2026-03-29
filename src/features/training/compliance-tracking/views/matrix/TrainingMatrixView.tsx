import React, { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Download, AlertTriangle, ArrowRight } from "lucide-react";
import { IconPlus } from "@tabler/icons-react";
import { PageHeader } from "@/components/ui/page/PageHeader";
import { trainingMatrix } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { Button } from "@/components/ui/button/Button";
import { FullPageLoading } from "@/components/ui/loading";
import { cn } from "@/components/ui/utils";
import { useNavigateWithLoading } from "@/hooks";
import { ROUTES } from "@/app/routes.constants";

import type { MatrixFilters, CellStatus, TrainingCell, SOPColumn, EmployeeRow } from "../../types";
import { MOCK_EMPLOYEES, MOCK_SOPS, MOCK_CELLS, getCell } from "../../mockData";
import {
  FilterBar,
  MatrixTable,
  CellDetailDrawer,
  HeaderActionDrawer,
  CELL_CONFIG,
} from "../../components/matrix";

// ─── Main Component ──────────────────────────────────────────────────
export const TrainingMatrixView: React.FC = () => {
  const { navigateTo, isNavigating } = useNavigateWithLoading();

  const handleAssignTraining = () => {
    navigateTo(ROUTES.TRAINING.ASSIGNMENT_NEW);
  };

  // ── State ─────────────────────────────────────────────────────────
  const [filters, setFilters] = useState<MatrixFilters>({
    searchQuery: "",
    department: "All",
    jobTitle: "All",
    status: "All",
    gapAnalysis: false,
  });

  const [showFilters, setShowFilters] = useState(false);

  const [activeCellDrawer, setActiveCellDrawer] = useState<{
    cell: TrainingCell;
    employee: EmployeeRow;
    sop: SOPColumn;
  } | null>(null);

  const [headerDrawer, setHeaderDrawer] = useState<{
    type: "employee" | "sop";
    data: EmployeeRow | SOPColumn;
  } | null>(null);

  // ── Derived data ───────────────────────────────────────────────────
  const filteredEmployees = useMemo(() => {
    const q = filters.searchQuery.toLowerCase();
    const { department, jobTitle, status } = filters;

    return MOCK_EMPLOYEES.filter((emp) => {
      const matchesSearch =
        !q ||
        emp.name.toLowerCase().includes(q) ||
        emp.employeeCode.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q) ||
        emp.jobTitle.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      const matchesDept = department === "All" || emp.department === department;
      if (!matchesDept) return false;

      const matchesJob = jobTitle === "All" || emp.jobTitle === jobTitle;
      if (!matchesJob) return false;

      if (status !== "All") {
        const hasMatchingCell = MOCK_SOPS.some((sop) => {
          const cell = getCell(emp.id, sop.id);
          return cell && cell.status === status;
        });
        if (!hasMatchingCell) return false;
      }

      return true;
    });
  }, [filters]);

  const hasActiveFilters = useMemo(() =>
    filters.searchQuery !== "" ||
    filters.department !== "All" ||
    filters.jobTitle !== "All" ||
    filters.status !== "All",
    [filters]
  );

  const heroBannerStats = useMemo(() => {
    const hasNewEmp = filteredEmployees.some((emp) => emp.id === "EMP-NEW");
    if (!hasNewEmp) return null;

    const newEmpMissingCount = MOCK_SOPS.reduce((count, sop) => {
      const cell = getCell("EMP-NEW", sop.id);
      if (cell && (cell.status === "Required" || cell.status === "InProgress")) return count + 1;
      return count;
    }, 0);

    if (newEmpMissingCount === 0) return null;

    return { hasNewEmp, newEmpMissingCount };
  }, [filteredEmployees]);

  const legendItems = useMemo(() => (
    (Object.entries(CELL_CONFIG) as [CellStatus, (typeof CELL_CONFIG)[CellStatus]][]).map(
      ([status, cfg]) => (
        <span
          key={status}
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border",
            cfg.bg,
            cfg.border
          )}
        >
          <cfg.Icon className={cn("h-3 w-3 shrink-0", cfg.iconColor)} />
          <span className={cn(cfg.iconColor)}>{cfg.label}</span>
        </span>
      )
    )
  ), []);

  // ── Handlers ───────────────────────────────────────────────────────
  const handleCellClick = useCallback(
    (e: React.MouseEvent, employee: EmployeeRow, sop: SOPColumn) => {
      e.stopPropagation();
      const cell = getCell(employee.id, sop.id);
      if (!cell || cell.status === "NotRequired") return;

      if (cell.status === "Required") {
        // Automatically open New Assignment modal/page for Required cells
        navigateTo(`${ROUTES.TRAINING.ASSIGNMENT_NEW}?employeeId=${employee.id}&courseId=${sop.id}`);
        return;
      }

      setActiveCellDrawer({ cell, employee, sop });
      setHeaderDrawer(null);
    },
    [navigateTo]
  );

  const handleEmployeeClick = useCallback(
    (e: React.MouseEvent, employee: EmployeeRow) => {
      e.stopPropagation();
      setHeaderDrawer({ type: "employee", data: employee });
      setActiveCellDrawer(null);
    },
    []
  );

  const handleSOPHeaderClick = useCallback(
    (e: React.MouseEvent, sop: SOPColumn) => {
      e.stopPropagation();
      setHeaderDrawer({ type: "sop", data: sop });
      setActiveCellDrawer(null);
    },
    []
  );

  const handleToggleFilters = useCallback(() => {
    setShowFilters((v) => !v);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      searchQuery: "",
      department: "All",
      jobTitle: "All",
      status: "All",
    }));
  }, []);

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 w-full flex-1 flex flex-col">
      {/* Page header */}
      <PageHeader
        title="Training Matrix"
        breadcrumbItems={trainingMatrix(navigateTo)}
        actions={
          <>
            <Button
              onClick={() => console.log("Export")}
              variant="outline"
              size="sm"
              className="whitespace-nowrap gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              onClick={handleAssignTraining}
              size="sm"
              className="whitespace-nowrap gap-2"
            >
              <IconPlus className="h-4 w-4" />
              Assign Training
            </Button>
          </>
        }
      />

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onChange={setFilters}
        showFilters={showFilters}
        onToggleFilters={handleToggleFilters}
      />

      {/* New Employee Hero Banner */}
      {heroBannerStats && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-start sm:items-center gap-4">
            <div>
              <h3 className="text-sm font-bold text-red-800">
                New Employee Missing Training
              </h3>
              <p className="text-xs text-red-600 mt-0.5 max-w-xl leading-relaxed">
                <span className="font-semibold">Alex Turner</span> (QA Specialist) was recently added to the system and has {heroBannerStats.newEmpMissingCount} missing mandatory course{heroBannerStats.newEmpMissingCount !== 1 ? "s" : ""}. Click their red cells or start an assignment now.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => {
              navigateTo(`${ROUTES.TRAINING.ASSIGNMENT_NEW}?employeeId=EMP-NEW`);
            }}
            className="shrink-0 bg-red-600 hover:bg-red-700 text-white shadow-sm gap-2"
          >
            Assign Training Now
          </Button>
        </div>
      )}

      {/* Color Legend */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-2.5 flex items-center gap-3 flex-wrap">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap shrink-0">
          Legend
        </span>
        <div className="w-px h-3.5 bg-slate-200 shrink-0" />
        <div className="flex items-center gap-2 flex-wrap">
          {legendItems}
        </div>
      </div>

      {/* Matrix Table */}
      <MatrixTable
        employees={filteredEmployees}
        filters={filters}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
        onCellClick={handleCellClick}
        onEmployeeClick={handleEmployeeClick}
        onSOPHeaderClick={handleSOPHeaderClick}
        navigateTo={navigateTo}
      />

      {/* Cell detail drawer */}
      {activeCellDrawer && (
        <CellDetailDrawer
          cell={activeCellDrawer.cell}
          employee={activeCellDrawer.employee}
          sop={activeCellDrawer.sop}
          onClose={() => setActiveCellDrawer(null)}
        />
      )}

      {/* Header action drawer */}
      {headerDrawer && (
        <HeaderActionDrawer
          type={headerDrawer.type}
          data={headerDrawer.data}
          onClose={() => setHeaderDrawer(null)}
        />
      )}

      {isNavigating && <FullPageLoading text="Loading..." />}
    </div>
  );
};

