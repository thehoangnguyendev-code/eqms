import React, { useMemo } from "react";
import { Search, X, Building2, Briefcase } from "lucide-react";
import { IconUsers, IconCheck } from "@tabler/icons-react";
import { TabNav } from "@/components/ui/tabs/TabNav";
import { Checkbox } from "@/components/ui/checkbox/Checkbox";
import { FormSection } from "@/components/ui/form";
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

  return (
    <FormSection
      title="Select Target Assignees"
      icon={<IconUsers className="h-4 w-4" />}
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Scope selector + content */}
          <div className="space-y-4 lg:col-span-8">
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
                    placeholder="Search by name, department, code…"
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
                  <div className="space-y-1 max-h-[360px] overflow-y-auto px-3 pb-3">
                    {employees.map((emp) => (
                      <label
                        key={emp.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-all"
                      >
                        <Checkbox
                          id={`emp-${emp.id}`}
                          checked={selectedEmployeeIds.includes(emp.id)}
                          onChange={() => onEmployeeToggle(emp.id)}
                        />
                        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-xs font-bold text-emerald-700">
                          {getInitials(emp.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-slate-900 truncate leading-tight">
                              {emp.name}
                            </p>
                            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex-shrink-0 border border-emerald-200">
                              {emp.employeeCode}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 truncate">
                            {emp.jobTitle} · {emp.department}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BUSINESS_UNITS.map((bu) => (
                  <button
                    key={bu}
                    onClick={() => onBusinessUnitToggle(bu)}
                    className={cn(
                      "text-left p-4 rounded-xl border-2 transition-all",
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
                        <span className="text-sm font-medium text-slate-800">
                          {bu}
                        </span>
                      </div>
                      {selectedBusinessUnits.includes(bu) && (
                        <IconCheck className="h-4 w-4 text-emerald-500" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 ml-6">
                      {buEmployeeCount[bu] ?? 0} employees
                    </p>
                  </button>
                ))}
              </div>
            )}

            {/* Department */}
            {scopeTab === "department" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DEPARTMENTS.map((dept) => (
                  <button
                    key={dept}
                    onClick={() => onDeptToggle(dept)}
                    className={cn(
                      "text-left p-4 rounded-xl border-2 transition-all",
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
                        <span className="text-sm font-medium text-slate-800">
                          {dept}
                        </span>
                      </div>
                      {selectedDepartments.includes(dept) && (
                        <IconCheck className="h-4 w-4 text-emerald-500" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 ml-6">
                      {deptEmployeeCount[dept] ?? 0} employees
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Selected summary */}
          <div className="lg:col-span-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 lg:sticky lg:top-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs sm:text-sm font-semibold text-slate-700">Selected</p>
                {resolvedAssignees.length > 0 && (
                  <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                    {resolvedAssignees.length} employee
                    {resolvedAssignees.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              {resolvedAssignees.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4 text-center">
                  No assignees selected yet
                </p>
              ) : (
                <div className="space-y-1 max-h-[300px] overflow-y-auto">
                  {resolvedAssignees.slice(0, 12).map((e, index) => (
                    <div
                      key={e.id}
                      className="flex items-center gap-2.5 py-1 border-b border-slate-100 last:border-0 group"
                    >
                      <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-[9px] font-bold text-emerald-700">
                        {getInitials(e.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-medium text-slate-800 truncate leading-none">
                            {e.name}
                          </p>
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded flex-shrink-0">
                            {e.employeeCode}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate">
                          {e.jobTitle} · {e.department}
                        </p>
                      </div>
                    </div>
                  ))}
                  {resolvedAssignees.length > 12 && (
                    <p className="text-xs text-slate-400 pl-2">
                      +{resolvedAssignees.length - 12} more…
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </FormSection>
  );
};
