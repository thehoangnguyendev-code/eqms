import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Users,
  Award,
  Download,
  Eye,
  FileText,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page/PageHeader";
import { employeeTrainingFiles } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import { TablePagination } from "@/components/ui/table/TablePagination";
import { TableEmptyState } from "@/components/ui/table/TableEmptyState";
import { MoreVertical } from "lucide-react";
import { FullPageLoading } from "@/components/ui/loading";
import { useNavigateWithLoading, useTableFilter } from "@/hooks";
import type { EmployeeTrainingFile, EmployeeFilters } from "../types";
import { MOCK_EMPLOYEE_TRAINING_FILES } from "./mockData";

export const EmployeeTrainingFilesView: React.FC = () => {
  const { navigateTo, isNavigating } = useNavigateWithLoading();

  // Filters
  const [filters, setFilters] = useState<Omit<EmployeeFilters, "searchQuery">>({
    departmentFilter: "All",
    positionFilter: "All",
  });

  // Use shared Table Filter hook
  const {
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    paginatedItems: paginatedData,
    filteredItems: filteredData,
  } = useTableFilter(MOCK_EMPLOYEE_TRAINING_FILES, {
    filterFn: (employee, q) => {
      const query = q.toLowerCase();
      const matchesSearch =
        !query ||
        employee.employeeName.toLowerCase().includes(query) ||
        employee.employeeId.toLowerCase().includes(query);
      const matchesDepartment = filters.departmentFilter === "All" || employee.department === filters.departmentFilter;
      const matchesPosition = filters.positionFilter === "All" || employee.jobPosition === filters.positionFilter;

      return matchesSearch && matchesDepartment && matchesPosition;
    }
  });

  // Reset to page 1 when extra filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.departmentFilter, filters.positionFilter, setCurrentPage]);

  // Filter Options
  const departmentOptions = [
    { label: "All Departments", value: "All" },
    { label: "Quality Assurance", value: "Quality Assurance" },
    { label: "Quality Control", value: "Quality Control" },
    { label: "Production", value: "Production" },
    { label: "Documentation", value: "Documentation" },
    { label: "Engineering", value: "Engineering" },
  ];

  const positionOptions = [
    { label: "All Positions", value: "All" },
    { label: "QA Manager", value: "QA Manager" },
    { label: "QC Analyst", value: "QC Analyst" },
    { label: "Production Operator", value: "Production Operator" },
    { label: "Document Controller", value: "Document Controller" },
    { label: "Validation Engineer", value: "Validation Engineer" },
  ];

  const getCompletionRate = (employee: EmployeeTrainingFile) => {
    return Math.round((employee.coursesCompleted / employee.totalCoursesRequired) * 100);
  };

  return (
    <div className="space-y-6 w-full flex-1 flex flex-col">
      {/* Header: Title + Breadcrumb + Action Button */}
      <PageHeader
        title="Employee Training Files"
        breadcrumbItems={employeeTrainingFiles(navigateTo)}
        actions={
          <Button
            onClick={() => console.log("Export files")}
            variant="outline"
            size="sm"
            className="whitespace-nowrap gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        }
      />

      {/* Filters */}
      <div className="bg-white p-4 lg:p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-12 gap-4 items-end">
          {/* Search */}
          <div className="xl:col-span-4">
            <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by employee name or ID..."
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(e.target.value)
                }
                className="w-full h-9 pl-10 pr-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm placeholder:text-slate-400 transition-colors"
              />
            </div>
          </div>

          {/* Department */}
          <div className="xl:col-span-4">
            <Select
              label="Department"
              value={filters.departmentFilter}
              onChange={(val) =>
                setFilters((prev) => ({ ...prev, departmentFilter: val }))
              }
              options={departmentOptions}
            />
          </div>

          {/* Position */}
          <div className="xl:col-span-4">
            <Select
              label="Position"
              value={filters.positionFilter}
              onChange={(val) =>
                setFilters((prev) => ({ ...prev, positionFilter: val }))
              }
              options={positionOptions}
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-600 font-medium">
                Total Employees
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {MOCK_EMPLOYEE_TRAINING_FILES.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-600 font-medium">Fully Compliant</p>
              <p className="text-2xl font-bold text-slate-900">
                {MOCK_EMPLOYEE_TRAINING_FILES.filter((e) => e.coursesCompleted === e.totalCoursesRequired).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-slate-600 font-medium">With Overdue</p>
              <p className="text-2xl font-bold text-slate-900">
                {MOCK_EMPLOYEE_TRAINING_FILES.filter((e) => e.coursesOverdue > 0).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Award className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-slate-600 font-medium">Avg. Score</p>
              <p className="text-2xl font-bold text-slate-900">
                {Math.round(
                  MOCK_EMPLOYEE_TRAINING_FILES.reduce((sum, e) => sum + e.averageScore, 0) /
                  MOCK_EMPLOYEE_TRAINING_FILES.length
                )}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-xl bg-white shadow-sm overflow-hidden flex flex-col flex-1">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/80 border-b-2 border-slate-200 sticky top-0 z-30">
              <tr>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap w-10 sm:w-[60px]">
                  No.
                </th>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Employee Code
                </th>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Employee Name
                </th>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Position
                </th>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Department
                </th>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Required
                </th>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Completed
                </th>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Overdue
                </th>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Avg. Score
                </th>
                <th className="sticky right-0 bg-slate-50 py-2.5 px-2 sm:py-3.5 sm:px-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider z-[1] whitespace-nowrap before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-200 shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.05)]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {paginatedData.map((employee, index) => {
                const completionRate = getCompletionRate(employee);
                return (
                  <tr
                    key={employee.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() => console.log("View employee:", employee.id)}
                  >
                    <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-center whitespace-nowrap text-slate-500 font-medium">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                      <span className="font-medium text-emerald-600">
                        {employee.employeeId}
                      </span>
                    </td>
                    <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600" />
                        <span className="font-medium text-slate-900">
                          {employee.employeeName}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-700">
                      {employee.jobPosition}
                    </td>
                    <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-700">
                      {employee.department}
                    </td>
                    <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                      <span className="text-slate-900 font-medium">
                        {employee.totalCoursesRequired}
                      </span>
                    </td>
                    <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600" />
                        <span className="text-emerald-900 font-medium">
                          {employee.coursesCompleted}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <XCircle className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${employee.coursesOverdue > 0 ? 'text-red-600' : 'text-slate-400'}`} />
                        <span className={`font-medium ${employee.coursesOverdue > 0 ? 'text-red-900' : 'text-slate-500'}`}>
                          {employee.coursesOverdue}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600" />
                        <span className="text-slate-900 font-medium">
                          {employee.averageScore}%
                        </span>
                      </div>
                    </td>
                    <td
                      onClick={(e) => e.stopPropagation()}
                      className="sticky right-0 bg-white py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-center z-30 whitespace-nowrap before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-200 shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.05)] group-hover:bg-slate-50"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log("Action clicked");
                        }}
                        className="inline-flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-lg hover:bg-slate-100 transition-colors"
                        aria-label="More actions"
                      >
                        <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-600" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredData.length > 0 && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredData.length}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
            showItemCount={true}
          />
        )}

        {/* Empty State */}
        {filteredData.length === 0 && (
          <TableEmptyState
            title="No Employee Records Found"
            description="We couldn't find any employee training records matching your filters."
            actionLabel="Clear Filters"
            onAction={() => {
              setFilters({
                departmentFilter: "All",
                positionFilter: "All",
              });
              setSearchQuery("");
              setCurrentPage(1);
            }}
          />
        )}
        {isNavigating && <FullPageLoading text="Loading..." />}
      </div>
    </div>
  );
};
