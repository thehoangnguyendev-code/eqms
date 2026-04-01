import { useState, useMemo, useEffect } from "react";
import { useToast } from "@/components/ui/toast";
import { BUSINESS_UNIT_DEPARTMENTS } from "../constants";
import { MOCK_USERS } from "../mockData";
import { generatePassword } from "../utils";
import type { User, UserRole, UserStatus, TableColumn } from "../types";
import { useTableFilter } from "@/hooks";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const parseDMY = (s: string): Date | null => {
  const p = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return p ? new Date(parseInt(p[3]), parseInt(p[2]) - 1, parseInt(p[1])) : null;
};

const inDateRange = (
  value: string | undefined,
  from: string,
  to: string
): boolean => {
  if (!from && !to) return true;
  if (!value) return false;
  const d = new Date(value);
  const f = from ? parseDMY(from) : null;
  const t = to ? parseDMY(to) : null;
  if (f && d < f) return false;
  if (t) { t.setHours(23, 59, 59); if (d > t) return false; }
  return true;
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useUserList() {
  const { showToast } = useToast();

  // === Data ===
  // TODO: Replace with React Query when integrating API:
  //   const { data: users = [], isLoading, refetch } = useQuery({
  //     queryKey: ["users"],
  //     queryFn: () => userApi.getUsers(),
  //   });
  const [users, setUsers] = useState<User[]>([...MOCK_USERS]);

  // === Filters ===
  const [showTerminated, setShowTerminated] = useState(false);
  const [roleFilter, setRoleFilter] = useState<UserRole | "All">("All");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "All">("All");
  const [businessUnitFilter, setBusinessUnitFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [suspendFrom, setSuspendFrom] = useState("");
  const [suspendTo, setSuspendTo] = useState("");
  const [terminateFrom, setTerminateFrom] = useState("");
  const [terminateTo, setTerminateTo] = useState("");

  // === Sorting ===
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: "asc" | "desc" }>({
    key: "employeeCode",
    direction: "asc",
  });

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // === Use shared Table Filter hook ===
  const {
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    filteredItems: filteredUsers,
    resetFilter: resetTableFilter,
  } = useTableFilter(users, {
    filterFn: (user, q) => {
      // 1. Terminated Check
      if (!showTerminated && user.status === "Terminated") return false;

      // 2. Text Search
      const matchesSearch =
        !q ||
        user.fullName.toLowerCase().includes(q) ||
        user.username.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.employeeCode.toLowerCase().includes(q);

      // 3. Other Filters
      const matchesRole = roleFilter === "All" || user.role === roleFilter;
      const matchesStatus = statusFilter === "All" || user.status === statusFilter;
      const matchesBU = businessUnitFilter === "All" || user.businessUnit === businessUnitFilter;
      const matchesDept = departmentFilter === "All" || user.department === departmentFilter;
      const matchesDate = inDateRange(user.createdDate, dateFrom, dateTo);
      const matchesSuspend = inDateRange(user.suspendedUntil, suspendFrom, suspendTo);
      const matchesTerminate = inDateRange(user.terminationDate, terminateFrom, terminateTo);

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus &&
        matchesBU &&
        matchesDept &&
        matchesDate &&
        matchesSuspend &&
        matchesTerminate
      );
    }
  });

  const sortedUsers = useMemo(() => {
    if (!sortConfig.key) return filteredUsers;

    return [...filteredUsers].sort((a, b) => {
      let aVal: any = (a as any)[sortConfig.key!];
      let bVal: any = (b as any)[sortConfig.key!];

      if (["createdDate", "suspendedUntil", "terminationDate"].includes(sortConfig.key!)) {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredUsers, sortConfig]);

  const currentUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedUsers.slice(start, start + itemsPerPage);
  }, [sortedUsers, currentPage, itemsPerPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;

  // Manual reset of page when custom filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    showTerminated, roleFilter, statusFilter, businessUnitFilter,
    departmentFilter, dateFrom, dateTo, suspendFrom, suspendTo,
    terminateFrom, terminateTo, setCurrentPage
  ]);

  // === Derived ===
  const terminatedCount = useMemo(
    () => users.filter((u) => u.status === "Terminated").length,
    [users]
  );

  const availableDepartments = useMemo(() => {
    if (businessUnitFilter === "All") {
      const depts = new Set(users.map((u) => u.department));
      return ["All", ...Array.from(depts)];
    }
    return ["All", ...(BUSINESS_UNIT_DEPARTMENTS[businessUnitFilter] || [])];
  }, [businessUnitFilter, users]);

  // === Actions ===
  // Each action shows toast feedback. Replace the setUsers mutation with the
  // corresponding userApi call + refetch() when the API is ready.

  const deleteUser = (userId: string, userName: string, reason: string) => {
    // TODO: await userApi.deleteUser(userId, { reason }); refetch();
    console.log(`Deleting user ${userName} (${userId}) with reason: ${reason}`);
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    showToast({ type: "success", title: "User Deleted", message: `${userName} has been successfully deleted` });
  };

  const suspendUser = (
    userId: string,
    userName: string,
    reason: string,
    suspendedUntil: string
  ) => {
    // TODO: await userApi.suspendUser(userId, { reason, suspendedUntil }); refetch();
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, status: "Suspended" as const, suspendReason: reason, suspendedUntil: suspendedUntil || undefined }
          : u
      )
    );
    showToast({ type: "warning", title: "User Suspended", message: `${userName} has been suspended.` });
  };

  const terminateUser = (
    userId: string,
    userName: string,
    reason: string,
    terminationDate: string
  ) => {
    // TODO: await userApi.terminateUser(userId, { reason, terminationDate }); refetch();
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, status: "Terminated" as const, terminationReason: reason, terminationDate }
          : u
      )
    );
    showToast({ type: "error", title: "Employee Terminated", message: `${userName} has been terminated.` });
  };

  const reinstateUser = (userId: string, userName: string) => {
    // TODO: await userApi.reinstateUser(userId); refetch();
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              status: "Active" as const,
              suspendReason: undefined,
              suspendedUntil: undefined,
              terminationReason: undefined,
              terminationDate: undefined,
            }
          : u
      )
    );
    showToast({ type: "success", title: "User Reinstated", message: `${userName} has been reinstated as Active.` });
  };

  const exportToExcel = (columns: TableColumn[]) => {
    const visibleCols = columns.filter((c) => c.visible);
    const headers = visibleCols.map((c) => c.label).join("\t");
    const rows = filteredUsers.map((user) =>
      visibleCols
        .map((col) => String(user[col.id as keyof User] ?? ""))
        .join("\t")
    ).join("\n");

    const blob = new Blob([`${headers}\n${rows}`], { type: "text/tab-separated-values" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `users_export_${new Date().toISOString().split("T")[0]}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast({ type: "success", title: "Export Successful", message: `Exported ${filteredUsers.length} users to Excel` });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setRoleFilter("All");
    setStatusFilter("All");
    setBusinessUnitFilter("All");
    setDepartmentFilter("All");
    setDateFrom(""); setDateTo("");
    setSuspendFrom(""); setSuspendTo("");
    setTerminateFrom(""); setTerminateTo("");
    resetTableFilter();
  };

  // generatePassword kept here so the view doesn't need to import utils
  const generateResetPassword = generatePassword;

  return {
    // Data
    users,
    filteredUsers,
    currentUsers,
    totalPages,
    startIndex,
    terminatedCount,
    availableDepartments,
    // Filters
    showTerminated, setShowTerminated,
    searchQuery, setSearchQuery,
    roleFilter, setRoleFilter,
    statusFilter, setStatusFilter,
    businessUnitFilter, setBusinessUnitFilter,
    departmentFilter, setDepartmentFilter,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    suspendFrom, setSuspendFrom,
    suspendTo, setSuspendTo,
    terminateFrom, setTerminateFrom,
    terminateTo, setTerminateTo,
    // Pagination
    currentPage, setCurrentPage,
    itemsPerPage, setItemsPerPage,
    // Actions
    deleteUser,
    suspendUser,
    terminateUser,
    reinstateUser,
    exportToExcel,
    clearFilters,
    generateResetPassword,
    // Sorting
    sortConfig,
    handleSort,
  };
}
