import React, { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTES } from "@/app/routes.constants";
import { FullPageLoading } from "@/components/ui/loading/Loading";
import {
  ArrowLeft,
  GraduationCap,
  Users,
  TrendingUp,
  Calendar,
  BarChart3,
  CheckCircle,
  Check,
  Clock,
  XCircle,
  Search,
  X,
  Download,
  FileText,
  Video,
  FileImage,
  GitBranch,
  Building2,
  Award,
  Activity,
  Eye,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page/PageHeader";
import { materialUsageReport } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { Button } from "@/components/ui/button/Button";
import { StatusBadge, type StatusType } from "@/components/ui/badge";
import { formatDateUS } from "@/utils/format";
import { Select } from "@/components/ui/select/Select";
import { cn } from "@/components/ui/utils";
import {
  MOCK_USAGE_REPORT_MATERIAL_INFO,
  MOCK_USAGE_REPORT_COURSES,
  getFallbackUsageReportCourses,
  type UsageCourseRecord,
  type UsageReportMaterialType,
  type UsageReportCourseStatus,
} from "./usageReportMockData";

// ─── Helpers ────────────────────────────────────────────────────────

const getTypeIcon = (type: UsageReportMaterialType) => {
  switch (type) {
    case "Video": return <Video className="h-5 w-5 text-purple-600" />;
    case "PDF": return <FileText className="h-5 w-5 text-red-600" />;
    case "Image": return <FileImage className="h-5 w-5 text-blue-600" />;
    default: return <GraduationCap className="h-5 w-5 text-slate-600" />;
  }
};

const getCourseStatusConfig = (status: UsageReportCourseStatus): { label: string; type: StatusType } => {
  switch (status) {
    case "Active":
      return { label: "Active", type: "current" };
    case "In Progress":
      return { label: "In Progress", type: "inProgress" };
    case "Completed":
      return { label: "Completed", type: "completed" };
    case "Cancelled":
      return { label: "Cancelled", type: "cancelled" };
  }
};

// ─── Component ──────────────────────────────────────────────────────
export const UsageReportView: React.FC = () => {
  const { materialId } = useParams<{ materialId: string }>();
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleNavigate = (path: string) => {
    setIsNavigating(true);
    setTimeout(() => navigate(path), 600);
  };

  const material = MOCK_USAGE_REPORT_MATERIAL_INFO[materialId ?? ""] ?? null;
  const allRecords: UsageCourseRecord[] = materialId
    ? (MOCK_USAGE_REPORT_COURSES[materialId] ?? getFallbackUsageReportCourses(materialId))
    : [];

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");

  const statusOptions = [
    { label: "All Statuses", value: "All" },
    { label: "Active", value: "Active" },
    { label: "In Progress", value: "In Progress" },
    { label: "Completed", value: "Completed" },
    { label: "Cancelled", value: "Cancelled" },
  ];

  const departmentOptions = useMemo(() => {
    const depts = [...new Set(allRecords.map((r) => r.department))].sort();
    return [{ label: "All Departments", value: "All" }, ...depts.map((d) => ({ label: d, value: d }))];
  }, [allRecords]);

  const filteredRecords = useMemo(() => {
    return allRecords.filter((r) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        r.courseId.toLowerCase().includes(q) ||
        r.courseName.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q) ||
        r.instructor.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "All" || r.courseStatus === statusFilter;
      const matchesDept = departmentFilter === "All" || r.department === departmentFilter;
      return matchesSearch && matchesStatus && matchesDept;
    });
  }, [allRecords, searchQuery, statusFilter, departmentFilter]);

  // Summary stats
  const stats = useMemo(() => {
    const totalCourses = allRecords.length;
    const totalLearners = allRecords.reduce((s, r) => s + r.learnersEnrolled, 0);
    const totalCompleted = allRecords.reduce((s, r) => s + r.learnersCompleted, 0);
    const completionRate = totalLearners > 0 ? Math.round((totalCompleted / totalLearners) * 100) : 0;
    const activeCourses = allRecords.filter((r) => r.courseStatus === "Active" || r.courseStatus === "In Progress").length;
    const currentVersionCourses = allRecords.filter((r) => r.isCurrentVersion).length;
    const departments = new Set(allRecords.map((r) => r.department)).size;
    const versionsUsed = new Set(allRecords.map((r) => r.materialVersion)).size;
    return { totalCourses, totalLearners, totalCompleted, completionRate, activeCourses, currentVersionCourses, departments, versionsUsed };
  }, [allRecords]);

  // Version breakdown
  const versionBreakdown = useMemo(() => {
    const map: Record<string, { count: number; learners: number; completed: number }> = {};
    allRecords.forEach((r) => {
      if (!map[r.materialVersion]) map[r.materialVersion] = { count: 0, learners: 0, completed: 0 };
      map[r.materialVersion].count++;
      map[r.materialVersion].learners += r.learnersEnrolled;
      map[r.materialVersion].completed += r.learnersCompleted;
    });
    return Object.entries(map)
      .map(([version, d]) => ({ version, ...d, rate: d.learners > 0 ? Math.round((d.completed / d.learners) * 100) : 0 }))
      .sort((a, b) => b.version.localeCompare(a.version, undefined, { numeric: true }));
  }, [allRecords]);

  // Department breakdown
  const deptBreakdown = useMemo(() => {
    const map: Record<string, { count: number; learners: number }> = {};
    allRecords.forEach((r) => {
      if (!map[r.department]) map[r.department] = { count: 0, learners: 0 };
      map[r.department].count++;
      map[r.department].learners += r.learnersEnrolled;
    });
    return Object.entries(map)
      .map(([dept, d]) => ({ dept, ...d }))
      .sort((a, b) => b.count - a.count);
  }, [allRecords]);

  const maxDeptCount = deptBreakdown[0]?.count ?? 1;

  if (!material) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <BarChart3 className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">Material Not Found</h2>
        <Button variant="outline-emerald" size="sm" onClick={() => handleNavigate(ROUTES.TRAINING.MATERIALS)} className="whitespace-nowrap gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Materials
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full flex-1 flex flex-col">
      {/* ─── Header ──────────────────────────────────────────────── */}
      <PageHeader
        title="Usage Report"
        breadcrumbItems={materialUsageReport(navigate)}
        actions={
          <>

            <Button variant="outline-emerald" size="sm" onClick={() => handleNavigate(ROUTES.TRAINING.MATERIALS)} className="whitespace-nowrap gap-2">
              Back
            </Button>
            <Button variant="outline" size="sm" onClick={() => console.log("Export report")} className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </>
        }
      />

      {/* ─── Material Info Card ───────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 md:p-5">
          <div className="w-12 h-12 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center flex-shrink-0">
            {getTypeIcon(material.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200 flex-shrink-0">
                {material.materialId}
              </span>
              <h2 className="text-base font-semibold text-slate-900 truncate">{material.title}</h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 flex-shrink-0">
                v{material.currentVersion} (current)
              </span>
            </div>
            <div className="flex items-center gap-4 mt-1 flex-wrap text-xs text-slate-500">
              <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> {material.department}</span>
              <span className="flex items-center gap-1"><GitBranch className="h-3.5 w-3.5" /> {material.allVersions.length} versions published</span>
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Uploaded {formatDateUS(material.uploadedAt)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleNavigate(ROUTES.TRAINING.MATERIAL_DETAIL(materialId ?? ""))}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Eye className="h-3.5 w-3.5" />
              View Detail
            </button>
          </div>
        </div>
      </div>

      {/* ─── Summary Stats ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-3 lg:gap-4">
        <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Courses</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalCourses}</p>
              <p className="text-xs text-slate-400 mt-0.5">{stats.activeCourses} currently active</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Learners</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalLearners.toLocaleString()}</p>
              <p className="text-xs text-slate-400 mt-0.5">{stats.totalCompleted.toLocaleString()} completed</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Completion Rate</p>
              <p className={cn("text-2xl font-bold", stats.completionRate >= 80 ? "text-emerald-700" : stats.completionRate >= 60 ? "text-amber-700" : "text-red-700")}>
                {stats.completionRate}%
              </p>
              <p className="text-xs text-slate-400 mt-0.5">across all courses</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
              <GitBranch className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Versions Used</p>
              <p className="text-2xl font-bold text-slate-900">{stats.versionsUsed}</p>
              <p className="text-xs text-slate-400 mt-0.5">{stats.departments} departments</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Charts Row ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 lg:gap-5">
        {/* Version Breakdown */}
        <div className="xl:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-purple-600" />
              <h3 className="text-sm font-semibold text-slate-800">Usage by Version</h3>
            </div>
            <span className="text-xs text-slate-500">{versionBreakdown.length} version{versionBreakdown.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="p-4 md:p-5 space-y-4">
            {versionBreakdown.map(({ version, count, learners, completed, rate }) => {
              const isCurrent = version === material.currentVersion;
              const pct = Math.round((count / stats.totalCourses) * 100);
              return (
                <div key={version} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border flex-shrink-0",
                        isCurrent ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-slate-100 text-slate-700 border-slate-200"
                      )}>
                        v{version}
                      </span>
                      {isCurrent && <span className="text-xs text-emerald-600 font-medium">(current)</span>}
                    </div>
                    <div className="flex items-center gap-3 text-xs flex-shrink-0">
                      <span className="text-slate-500"><span className="font-semibold text-slate-700">{count}</span> courses</span>
                      <span className="text-slate-500"><span className="font-semibold text-slate-700">{learners}</span> learners</span>
                      <span className={cn("font-semibold", rate >= 80 ? "text-emerald-600" : rate >= 60 ? "text-amber-600" : "text-red-600")}>
                        {rate}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500", isCurrent ? "bg-emerald-500" : "bg-slate-400")}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Department Breakdown */}
        <div className="xl:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-slate-800">Usage by Department</h3>
            </div>
          </div>
          <div className="p-4 md:p-5 space-y-3">
            {deptBreakdown.map(({ dept, count, learners }) => {
              const pct = Math.round((count / maxDeptCount) * 100);
              return (
                <div key={dept} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 truncate mr-2">{dept}</span>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-slate-500"><span className="font-semibold text-slate-700">{count}</span> courses</span>
                      <span className="text-slate-500"><span className="font-semibold text-slate-700">{learners}</span> learners</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-blue-400 transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Insights */}
        <div className="xl:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-600" />
              <h3 className="text-sm font-semibold text-slate-800">Insights</h3>
            </div>
          </div>
          <div className="p-4 md:p-5 space-y-3">
            <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
              <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-emerald-800">High Completion</p>
                <p className="text-xs text-emerald-700 mt-0.5">
                  {stats.completionRate}% of enrolled learners finished courses using this material.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <Activity className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-blue-800">Currently Active</p>
                <p className="text-xs text-blue-700 mt-0.5">
                  {stats.activeCourses} course{stats.activeCourses !== 1 ? "s are" : " is"} actively using this material right now.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
              <GitBranch className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-purple-800">Version Adoption</p>
                <p className="text-xs text-purple-700 mt-0.5">
                  {stats.currentVersionCourses} of {stats.totalCourses} courses use the latest v{material.currentVersion}.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <Building2 className="h-4 w-4 text-slate-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-800">Wide Reach</p>
                <p className="text-xs text-slate-600 mt-0.5">
                  Used across {stats.departments} department{stats.departments !== 1 ? "s" : ""} with {stats.totalLearners.toLocaleString()} total learners.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Course History Table ─────────────────────────────────── */}
      <div className="border rounded-xl bg-white shadow-sm overflow-hidden flex flex-col">
        {/* Table header with filters */}
        <div className="p-4 md:p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Course History</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                All courses that have used <span className="font-medium text-slate-700">{material.materialId}</span> · {filteredRecords.length} of {allRecords.length} records
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            {/* Search */}
            <div>
              <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search course ID, name, instructor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-10 pr-10 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm placeholder:text-slate-400 transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <Select
              label="Status"
              value={statusFilter}
              onChange={(v) => setStatusFilter(v as string)}
              options={statusOptions}
              placeholder="All Statuses"
            />
            <Select
              label="Department"
              value={departmentFilter}
              onChange={(v) => setDepartmentFilter(v as string)}
              options={departmentOptions}
              placeholder="All Departments"
            />
          </div>
        </div>

        {/* Table Container */}
        <div className="px-4 md:px-5 pb-4 md:pb-5 flex-1 flex flex-col relative">
          <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] md:min-w-[1120px] lg:min-w-[1280px] xl:min-w-[1420px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap w-10 sm:w-12">No.</th>
                    <th className="py-3 px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Course ID</th>
                    <th className="py-3 px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Course Name</th>
                    <th className="py-3 px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Department</th>
                    <th className="py-3 px-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Version Used</th>
                    <th className="py-3 px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Instructor</th>
                    <th className="py-3 px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Period</th>
                    <th className="py-3 px-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Learners</th>
                    <th className="py-3 px-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Completion</th>
                    <th className="py-3 px-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center">
                            <BarChart3 className="h-6 w-6 text-slate-300" />
                          </div>
                          <p className="text-sm font-medium text-slate-900">No records found</p>
                          <p className="text-xs text-slate-500">Try adjusting your filters.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record, index) => {
                      const completionRate = record.learnersEnrolled > 0
                        ? Math.round((record.learnersCompleted / record.learnersEnrolled) * 100)
                        : 0;
                      const statusConfig = getCourseStatusConfig(record.courseStatus);
                      return (
                        <tr key={record.courseId} className="hover:bg-slate-50/80 transition-colors">
                          {/* No */}
                          <td className="py-3 px-4 text-xs sm:text-sm text-center text-slate-500 font-medium">{index + 1}</td>
                          {/* Course ID */}
                          <td className="py-3 px-4 text-xs sm:text-sm whitespace-nowrap">
                            <span className="font-medium text-emerald-700">{record.courseId}</span>
                          </td>
                          {/* Course Name */}
                          <td className="py-3 px-4 text-xs sm:text-sm whitespace-nowrap">
                            <p className="font-medium text-slate-900">{record.courseName}</p>
                          </td>
                          {/* Department */}
                          <td className="py-3 px-4 text-xs sm:text-sm whitespace-nowrap text-slate-700">{record.department}</td>
                          {/* Version Used */}
                          <td className="py-3 px-4 text-xs sm:text-sm text-center whitespace-nowrap">
                            <span className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border",
                              record.isCurrentVersion
                                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            )}>
                              v{record.materialVersion}
                              {record.isCurrentVersion && <Check className="h-3 w-3 text-emerald-600" />}
                            </span>
                          </td>
                          {/* Instructor */}
                          <td className="py-3 px-4 text-xs sm:text-sm whitespace-nowrap text-slate-700">{record.instructor}</td>
                          {/* Period */}
                          <td className="py-3 px-4 text-xs sm:text-sm whitespace-nowrap">
                            <div className="text-slate-700">{formatDateUS(record.startDate)}</div>
                            {record.endDate ? (
                              <div className="text-xs text-slate-500">→ {formatDateUS(record.endDate)}</div>
                            ) : (
                              <div className="text-xs text-blue-500 font-medium">Ongoing</div>
                            )}
                          </td>
                          {/* Learners */}
                          <td className="py-3 px-4 text-xs sm:text-sm text-center whitespace-nowrap">
                            <span className="font-semibold text-slate-900">{record.learnersCompleted}</span>
                            <span className="text-slate-400 text-xs"> / {record.learnersEnrolled}</span>
                          </td>
                          {/* Completion Rate */}
                          <td className="py-3 px-4 text-xs sm:text-sm text-center whitespace-nowrap">
                            <div className="flex flex-col items-center gap-1">
                              <span className={cn(
                                "text-sm font-bold",
                                completionRate === 100 ? "text-emerald-600" :
                                  completionRate >= 70 ? "text-emerald-600" :
                                    completionRate >= 40 ? "text-amber-600" : "text-slate-500"
                              )}>
                                {completionRate}%
                              </span>
                              <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className={cn(
                                    "h-full rounded-full transition-all",
                                    completionRate === 100 ? "bg-emerald-500" :
                                      completionRate >= 70 ? "bg-emerald-400" :
                                        completionRate >= 40 ? "bg-amber-400" : "bg-slate-400"
                                  )}
                                  style={{ width: `${completionRate}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          {/* Status */}
                          <td className="py-3 px-4 text-xs sm:text-sm text-center whitespace-nowrap">
                            <StatusBadge
                              status={statusConfig.type}
                              label={statusConfig.label}
                              size="sm"
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer summary */}
            {filteredRecords.length > 0 && (
              <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between flex-wrap gap-2">
                <p className="text-xs text-slate-500">
                  Showing <span className="font-semibold text-slate-700">{filteredRecords.length}</span> record{filteredRecords.length !== 1 ? "s" : ""}
                  {filteredRecords.length !== allRecords.length && <> of <span className="font-semibold text-slate-700">{allRecords.length}</span></>}
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>Total learners in view: <span className="font-semibold text-slate-700">{filteredRecords.reduce((s, r) => s + r.learnersEnrolled, 0).toLocaleString()}</span></span>
                  <span>Avg. completion: <span className={cn(
                    "font-semibold",
                    (() => {
                      const total = filteredRecords.reduce((s, r) => s + r.learnersEnrolled, 0);
                      const done = filteredRecords.reduce((s, r) => s + r.learnersCompleted, 0);
                      const rate = total > 0 ? Math.round((done / total) * 100) : 0;
                      return rate >= 70 ? "text-emerald-700" : rate >= 40 ? "text-amber-700" : "text-slate-700";
                    })()
                  )}>
                    {(() => {
                      const total = filteredRecords.reduce((s, r) => s + r.learnersEnrolled, 0);
                      const done = filteredRecords.reduce((s, r) => s + r.learnersCompleted, 0);
                      return total > 0 ? `${Math.round((done / total) * 100)}%` : "—";
                    })()}
                  </span></span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Loading Overlay ──────────────────────────────────── */}
      {isNavigating && <FullPageLoading text="Loading..." />}
    </div>
  );
};
