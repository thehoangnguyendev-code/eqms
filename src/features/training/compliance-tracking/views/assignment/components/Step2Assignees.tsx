import React, { useMemo, useState } from "react";
import { Search, X, Building2, Briefcase } from "lucide-react";
import { IconUsers, IconCheck } from "@tabler/icons-react";
import { TabNav } from "@/components/ui/tabs/TabNav";
import { Checkbox } from "@/components/ui/checkbox/Checkbox";
import { FormSection } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge/Badge";
import { TablePagination } from "@/components/ui/table/TablePagination";
import { cn } from "@/components/ui/utils";
import type { AssignmentScope } from "../../../../types/assignment.types";
import type { EmployeeRow } from "../../../types";
import { DEPARTMENTS, BUSINESS_UNITS, SCOPE_TABS, getInitials } from "../AssignTrainingView";

export interface Step2Props {
  scopeTab: AssignmentScope;
  onScopeChange: (id: string) => void;
  employees: EmployeeRow[];
  selectedEmployeeIds: string[];
  onEmployeeToggle: (id: string) => void;
  selectedDepartments: string[];
  onDeptToggle: (dept: string) => void;
  selectedBusinessUnits: string[];
  onBusinessUnitToggle: (bu: string) => void;
  resolvedAssignees: EmployeeRow[];
  employeeSearch: string;
  onEmployeeSearchChange: (v: string) => void;
}

export const Step2Assignees: React.FC<Step2Props> = ({
  scopeTab,
  onScopeChange,
  employees,
  selectedEmployeeIds,
  onEmployeeToggle,
  selectedDepartments,
  onDeptToggle,
  selectedBusinessUnits,
  onBusinessUnitToggle,
  resolvedAssignees,
  employeeSearch,
  onEmployeeSearchChange,
}) => {
  const deptEmployeeCount = useMemo(
    () =>
      DEPARTMENTS.reduce<Record<string, number>>((acc, dept) => {
        acc[dept] = employees.filter((e) => e.department === dept).length;
        return acc;
      }, {}),
    [employees],
  );

  const buEmployeeCount = useMemo(
    () =>
      BUSINESS_UNITS.reduce<Record<string, number>>((acc, bu) => {
        acc[bu] = employees.filter(
          (e) =>
            e.businessUnit === bu ||
            (bu === "Operation Unit" && !e.businessUnit),
        ).length;
        return acc;
      }, {}),
    [employees],
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const totalPages = Math.ceil(resolvedAssignees.length / itemsPerPage);
  const currentAssignees = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return resolvedAssignees.slice(startIndex, startIndex + itemsPerPage);
  }, [resolvedAssignees, currentPage, itemsPerPage]);

  return (
    <FormSection
      title="Select Target Assignees"
      icon={<IconUsers className="h-4 w-4" />}
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Scope selector + content */}
          <div className="space-y-4 lg:col-span-3">
            <TabNav
              tabs={SCOPE_TABS}
              activeTab={scopeTab}
              onChange={onScopeChange}
              variant="pill"
              layoutId="assignmentScopeTabs"
            />

            {/* Individual */}
            {scopeTab === "individual" && (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    value={employeeSearch}
                    onChange={(e) => onEmployeeSearchChange(e.target.value)}
                    placeholder="Search…"
                    className="w-full h-9 pl-9 pr-10 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-slate-400"
                  />
                  {employeeSearch && (
                    <button
                      type="button"
                      onClick={() => onEmployeeSearchChange("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                      aria-label="Clear employee search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="border border-slate-200 rounded-xl bg-slate-50/60">
                  <div className="px-3 pt-3 pb-2">
                    <p className="text-xs font-medium text-slate-500">
                      Employee List
                    </p>
                  </div>
                  <div className="space-y-1 max-h-[360px] overflow-y-auto px-2 pb-2">
                    {employees.map((emp) => (
                      <label
                        key={emp.id}
                        className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-all"
                      >
                        <Checkbox
                          id={`emp-${emp.id}`}
                          checked={selectedEmployeeIds.includes(emp.id)}
                          onChange={() => onEmployeeToggle(emp.id)}
                        />
                        <div className="h-7 w-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-emerald-700">
                          {getInitials(emp.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center flex-wrap gap-1.5">
                            <p className="text-xs font-medium text-slate-900 truncate leading-tight">
                              {emp.name}
                            </p>
                            <Badge color="emerald" size="xs" pill>
                              {emp.employeeCode}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5 leading-tight">
                            {emp.position}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Business Unit */}
            {scopeTab === "business_unit" && (
              <div className="grid grid-cols-1 gap-3">
                {BUSINESS_UNITS.map((bu) => (
                  <button
                    key={bu}
                    onClick={() => onBusinessUnitToggle(bu)}
                    className={cn(
                      "text-left p-3 rounded-xl border-2 transition-all",
                      selectedBusinessUnits.includes(bu)
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-slate-200 bg-white hover:border-slate-300",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2
                          className={cn(
                            "h-4 w-4",
                            selectedBusinessUnits.includes(bu)
                              ? "text-emerald-600"
                              : "text-slate-400",
                          )}
                        />
                        <span className="text-xs font-medium text-slate-800 truncate">
                          {bu}
                        </span>
                      </div>
                      {selectedBusinessUnits.includes(bu) && (
                        <IconCheck className="h-4 w-4 text-emerald-500" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 ml-6">
                      {buEmployeeCount[bu] ?? 0} employees
                    </p>
                  </button>
                ))}
              </div>
            )}

            {/* Department */}
            {scopeTab === "department" && (
              <div className="grid grid-cols-1 gap-3">
                {DEPARTMENTS.map((dept) => (
                  <button
                    key={dept}
                    onClick={() => onDeptToggle(dept)}
                    className={cn(
                      "text-left p-3 rounded-xl border-2 transition-all",
                      selectedDepartments.includes(dept)
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-slate-200 bg-white hover:border-slate-300",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Briefcase
                          className={cn(
                            "h-4 w-4",
                            selectedDepartments.includes(dept)
                              ? "text-emerald-600"
                              : "text-slate-400",
                          )}
                        />
                        <span className="text-xs font-medium text-slate-800 truncate">
                          {dept}
                        </span>
                      </div>
                      {selectedDepartments.includes(dept) && (
                        <IconCheck className="h-4 w-4 text-emerald-500" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 ml-6">
                      {deptEmployeeCount[dept] ?? 0} employees
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>          {/* Right: Selected summary in a table format */}
          <div className="lg:col-span-9 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm font-semibold text-slate-700">Selected Assignees</p>
              {resolvedAssignees.length > 0 && (
                <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                  {resolvedAssignees.length} employee{resolvedAssignees.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col bg-white shadow-sm">
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-50 hover:scrollbar-thumb-slate-400 pb-1.5 transition-colors">
                <table className="w-full min-w-[700px] border-spacing-0 text-left">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="sticky top-0 z-20 bg-slate-50 py-3 px-4 text-center text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 whitespace-nowrap w-16">
                        No.
                      </th>
                      <th className="sticky top-0 z-20 bg-slate-50 py-3 px-4 text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 whitespace-nowrap w-36">
                        Employee Code
                      </th>
                      <th className="sticky top-0 z-20 bg-slate-50 py-3 px-4 text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 whitespace-nowrap">
                        Full Name
                      </th>
                      <th className="sticky top-0 z-20 bg-slate-50 py-3 px-4 text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 whitespace-nowrap w-44">
                        Position
                      </th>
                      <th className="sticky top-0 z-20 bg-slate-50 py-3 px-4 text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 whitespace-nowrap w-44">
                        Department
                      </th>
                      <th className="sticky top-0 z-20 bg-slate-50 py-3 px-4 text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 whitespace-nowrap w-44">
                        Business Unit
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {resolvedAssignees.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-0">
                          <div className="flex flex-col items-center justify-center p-6 text-center">
                            <IconUsers className="h-8 w-8 text-slate-300" />
                            <h4 className="text-sm font-semibold text-slate-900 mt-2">No assignees selected</h4>
                            <p className="text-xs text-slate-500 max-w-xs mt-1">
                              Select assignees from the scope selector on the left.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentAssignees.map((emp, idx) => {
                        const tdClass = "py-3 px-4 text-xs md:text-sm text-slate-700 border-b border-slate-200 whitespace-nowrap";
                        return (
                          <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className={cn(tdClass, "text-center font-medium text-slate-500 w-16")}>
                              {(currentPage - 1) * itemsPerPage + idx + 1}
                            </td>
                            <td className={tdClass}>
                              <span className="font-semibold text-emerald-600">
                                {emp.employeeCode}
                              </span>
                            </td>
                            <td className={tdClass}>
                              <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-[9px] font-bold text-emerald-700">
                                  {getInitials(emp.name)}
                                </div>
                                <span className="font-medium text-slate-900">
                                  {emp.name}
                                </span>
                              </div>
                            </td>
                            <td className={tdClass}>
                              {emp.position}
                            </td>
                            <td className={tdClass}>
                              {emp.department}
                            </td>
                            <td className={tdClass}>
                              {emp.businessUnit || "Operation Unit"}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {resolvedAssignees.length > 0 && (
                <TablePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={resolvedAssignees.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={setItemsPerPage}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </FormSection>
  );
};
