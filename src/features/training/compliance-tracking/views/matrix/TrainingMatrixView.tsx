import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Download, AlertTriangle, ArrowRight } from "lucide-react";
import { IconPlus } from "@tabler/icons-react";
import { PageHeader } from "@/components/ui/page/PageHeader";
import { trainingMatrix } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { Button } from "@/components/ui/button/Button";
import { SectionLoading } from "@/components/ui/loading";
import { cn } from "@/components/ui/utils";
import { useNavigateWithLoading } from "@/hooks";
import { ROUTES } from "@/app/routes.constants";

import type { MatrixFilters, CellStatus, TrainingCell, SOPColumn, EmployeeRow } from "../../types";
import { complianceTrackingRepository } from "../../repository";
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
  const employees = complianceTrackingRepository.getMatrixEmployees();
  const sops = complianceTrackingRepository.getSops();
  const cells = complianceTrackingRepository.getCells();
  const getCell = complianceTrackingRepository.getCell;

  const handleAssignTraining = () => {
    navigateTo(ROUTES.TRAINING.ASSIGNMENT_NEW);
  };

  // ── State ─────────────────────────────────────────────────────────
  const [filters, setFilters] = useState<MatrixFilters>(() => {
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get("search") || "";
    return {
      searchQuery: searchParam,
      department: "All",
      jobTitle: "All",
      status: "All",
      gapAnalysis: false,
    };
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

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

    return employees.filter((emp) => {
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
        const hasMatchingCell = sops.some((sop) => {
          const cell = getCell(emp.id, sop.id);
          return cell && cell.status === status;
        });
        if (!hasMatchingCell) return false;
      }

      return true;
    });
  }, [employees, sops, filters]);

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

    const newEmpMissingCount = sops.reduce((count, sop) => {
      const cell = getCell("EMP-NEW", sop.id);
      if (cell && (cell.status === "Required" || cell.status === "InProgress")) return count + 1;
      return count;
    }, 0);

    if (newEmpMissingCount === 0) return null;

    return { hasNewEmp, newEmpMissingCount };
  }, [filteredEmployees, sops, getCell]);

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
          <span>{cfg.label}</span>
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
  if (isLoading || isNavigating) return <SectionLoading minHeight="60vh" />;

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

      {/* New Employee Hero Banner */}
      {heroBannerStats && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between mb-5 shadow-sm">
          <div className="flex items-start sm:items-center gap-4">
            <div>
              <h3 className="text-sm font-bold text-red-800">
                New Employee Missing Training
              </h3>
              <p className="text-xs text-red-600 mt-0.5 max-w-xl leading-relaxed">
                <span className="font-semibold text-red-700">Alex Turner</span> (QA Specialist) was recently added to the system and has <span className="font-bold underline">{heroBannerStats.newEmpMissingCount} missing</span> mandatory course{heroBannerStats.newEmpMissingCount !== 1 ? "s" : ""}. Click their red cells or start an assignment now.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => {
              navigateTo(`${ROUTES.TRAINING.ASSIGNMENT_NEW}?employeeId=EMP-NEW`);
            }}
            className="shrink-0 bg-red-600 hover:bg-red-700 text-white shadow-sm gap-2 group"
          >
            Assign Training Now
          </Button>
        </div>
      )}

      {/* Unified Matrix Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col flex-1 min-h-0">
        <FilterBar
          filters={filters}
          onChange={setFilters}
        />

        {/* Color Legend Bar */}
        <div className="px-5 py-2.5 bg-slate-50/50 border-b border-slate-200/60 flex items-center gap-3 flex-wrap">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap shrink-0">
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
      </div>

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

    </div>
  );
};



