import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/toast";
import {
  Search,
  Plus,
  MoreVertical,
  KeyRound,
  Download,
  User as UserIcon,
  PauseCircle,
  RotateCcw,
  X,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { IconUserX } from "@tabler/icons-react";
import { PageHeader } from "@/components/ui/page/PageHeader";
import { userManagement } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { Button } from "@/components/ui/button/Button";
import { Badge } from "@/components/ui/badge/Badge";
import { Select } from "@/components/ui/select/Select";
import { DateRangePicker } from "@/components/ui/datetime-picker/DateRangePicker";
import { AlertModal } from "@/components/ui/modal/AlertModal";
import { TablePagination } from "@/components/ui/table/TablePagination";
import { TableEmptyState } from "@/components/ui/table/TableEmptyState";
import { cn } from "@/components/ui/utils";
import { ResetPasswordModal } from "../components/ResetPasswordModal";
import { SuspendModal } from "../components/SuspendModal";
import { TerminateModal } from "../components/TerminateModal";
import { ESignatureModal } from "@/components/ui/esign-modal/ESignatureModal";
import { User, UserRole, UserStatus, TableColumn } from "../types";
import { BUSINESS_UNIT_DEPARTMENTS, DEFAULT_COLUMNS, getRoleColor, USER_MANAGEMENT_ROUTES } from "../constants";
import { generatePassword } from "../utils";
import { getStatusColorClass } from "@/utils/status";
import { formatDateNumeric } from "@/utils/format";
import { FullPageLoading, SectionLoading } from "@/components/ui/loading/Loading";
import { useUserList } from "../hooks/useUserList";
import { usePortalDropdown, useNavigateWithLoading, useTableDragScroll, PortalDropdownPosition } from "@/hooks";

// --- Main Component ---

export const UserManagementView: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const {
    users,
    filteredUsers,
    currentUsers,
    totalPages,
    startIndex,
    availableDepartments,
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
    currentPage, setCurrentPage,
    itemsPerPage, setItemsPerPage,
    suspendUser,
    terminateUser,
    reinstateUser,
    exportToExcel,
    clearFilters,
  } = useUserList();

  const [columns, setColumns] = useState<TableColumn[]>([...DEFAULT_COLUMNS]);
  const { openId: openDropdownId, position: dropdownPosition, getRef, toggle: handleDropdownToggle, close: closeDropdown } = usePortalDropdown();
  const { scrollerRef, isDragging, dragEvents } = useTableDragScroll();
  const { navigateTo, isNavigating } = useNavigateWithLoading();
  const [resetPasswordModal, setResetPasswordModal] = useState({ isOpen: false, userId: "", userName: "", password: "" });
  const [suspendModal, setSuspendModal] = useState({ isOpen: false, userId: "", userName: "" });
  const [terminateModal, setTerminateModal] = useState({ isOpen: false, userId: "", userName: "" });
  const [reinstateModal, setReinstateModal] = useState({ isOpen: false, userId: "", userName: "" });
  const [isTableLoading, setIsTableLoading] = useState(false);
  const { sortConfig, handleSort } = useUserList();

  // Handle loading state on filter changes
  React.useEffect(() => {
    setIsTableLoading(true);
    const timer = setTimeout(() => setIsTableLoading(false), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, roleFilter, statusFilter, businessUnitFilter, departmentFilter, dateFrom, dateTo, suspendFrom, suspendTo, terminateFrom, terminateTo]);


  // Visible columns
  const visibleColumns = columns
    .filter((col) => col.visible)
    .sort((a, b) => a.order - b.order);

  const handleResetPassword = (user: User) => {
    setResetPasswordModal({ isOpen: true, userId: user.id, userName: user.fullName, password: generatePassword() });
    closeDropdown();
  };

  const handleSuspend = (user: User) => {
    setSuspendModal({ isOpen: true, userId: user.id, userName: user.fullName });
    closeDropdown();
  };

  const handleTerminate = (user: User) => {
    setTerminateModal({ isOpen: true, userId: user.id, userName: user.fullName });
    closeDropdown();
  };

  const handleReinstate = (user: User) => {
    setReinstateModal({ isOpen: true, userId: user.id, userName: user.fullName });
    closeDropdown();
  };

  const confirmSuspend = (reason: string, suspendedUntil: string) => {
    suspendUser(suspendModal.userId, suspendModal.userName, reason, suspendedUntil);
    setSuspendModal({ isOpen: false, userId: "", userName: "" });
  };

  const confirmTerminate = (reason: string, terminationDate: string) => {
    terminateUser(terminateModal.userId, terminateModal.userName, reason, terminationDate);
    setTerminateModal({ isOpen: false, userId: "", userName: "" });
  };

  const confirmReinstate = () => {
    reinstateUser(reinstateModal.userId, reinstateModal.userName);
    setReinstateModal({ isOpen: false, userId: "", userName: "" });
  };

  return (
    <div className="space-y-6 w-full flex-1 flex flex-col">
      {/* Header */}
      <PageHeader
        title="User Management"
        breadcrumbItems={userManagement()}
        actions={
          <>
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-2 whitespace-nowrap"
              onClick={() => exportToExcel(columns)}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              size="sm"
              className="flex items-center gap-2 whitespace-nowrap"
              onClick={() => navigateTo(USER_MANAGEMENT_ROUTES.ADD)}
            >
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </>
        }
      />

      {/* Unified Content Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm w-full overflow-hidden flex flex-col">
        {/* Filter Section */}
        <div className="p-4 md:p-5 flex flex-col">
          <div className="px-1.5 -mx-1.5 pb-1.5 -mb-1.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
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
                    placeholder="Search by name, username, email..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="block w-full pl-10 pr-10 h-9 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all placeholder:text-slate-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Role Filter */}
              <Select
                label="Role"
                value={roleFilter}
                onChange={(value) => setRoleFilter(value as UserRole | "All")}
                options={[
                  { label: "All Roles", value: "All" },
                  { label: "Admin", value: "Admin" },
                  { label: "QA Manager", value: "QA Manager" },
                  { label: "Document Owner", value: "Document Owner" },
                  { label: "Reviewer", value: "Reviewer" },
                  { label: "Approver", value: "Approver" },
                  { label: "Viewer", value: "Viewer" },
                ]}
              />

              {/* Status Filter */}
              <Select
                label="Status"
                value={statusFilter}
                onChange={(value) => setStatusFilter(value as UserStatus | "All")}
                options={[
                  { label: "All Status", value: "All" },
                  { label: "Active", value: "Active" },
                  { label: "Inactive", value: "Inactive" },
                  { label: "Pending", value: "Pending" },
                  { label: "Suspended", value: "Suspended" },
                  { label: "Terminated", value: "Terminated" },
                ]}
              />

              {/* Business Unit Filter */}
              <Select
                label="Business Unit"
                value={businessUnitFilter}
                onChange={(value) => {
                  setBusinessUnitFilter(value);
                  setDepartmentFilter("All");
                }}
                options={[
                  { label: "All Units", value: "All" },
                  ...Object.keys(BUSINESS_UNIT_DEPARTMENTS).map(bu => ({ label: bu, value: bu }))
                ]}
              />

              {/* Department Filter */}
              <Select
                label="Department"
                value={departmentFilter}
                onChange={setDepartmentFilter}
                options={availableDepartments.map((dept) => ({ label: dept, value: dept }))}
              />

              {/* Created Date Range Filter */}
              <DateRangePicker
                label="Created Date Range"
                startDate={dateFrom}
                endDate={dateTo}
                onStartDateChange={setDateFrom}
                onEndDateChange={setDateTo}
                placeholder="Select date range"
              />

              {/* Suspended Until Range Filter */}
              <DateRangePicker
                label="Suspended Until Range"
                startDate={suspendFrom}
                endDate={suspendTo}
                onStartDateChange={setSuspendFrom}
                onEndDateChange={setSuspendTo}
                placeholder="Select date range"
              />

              {/* Termination Date Range Filter */}
              <DateRangePicker
                label="Termination Date Range"
                startDate={terminateFrom}
                endDate={terminateTo}
                onStartDateChange={setTerminateFrom}
                onEndDateChange={setTerminateTo}
                placeholder="Select date range"
              />

              <div className="flex items-end pb-0.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="h-9 px-4 gap-2 font-medium transition-all duration-200 hover:bg-red-600 hover:text-white hover:border-red-600 whitespace-nowrap"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="px-4 md:px-5 pb-4 md:pb-5 flex-1 flex flex-col relative">
          {isTableLoading && (
            <div className="absolute inset-0 z-20 bg-white/40 backdrop-blur-[4px] flex items-center justify-center transition-all duration-300">
              <SectionLoading text="Searching..." minHeight="150px" />
            </div>
          )}

          <div className={cn(
            "border border-slate-200 rounded-xl overflow-hidden flex flex-col flex-1 bg-white transition-all duration-300",
            isTableLoading && "blur-[2px] opacity-80"
          )}>
            {currentUsers.length > 0 ? (
              <>
                <div
                  ref={scrollerRef}
                  className={cn(
                    "flex-1 overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-50 hover:scrollbar-thumb-slate-400",
                    isDragging ? "cursor-grabbing select-none" : "cursor-grab"
                  )}
                  {...dragEvents}
                >
                  <table className="w-full min-w-max  border-spacing-0 text-left">
                    <thead>
                      <tr>
                        {visibleColumns.map((col) => {
                          const isSorted = sortConfig.key === col.id;
                          const canSort = col.id !== "no";
                          return (
                            <th
                              key={col.id}
                              onClick={canSort ? () => handleSort(col.id) : undefined}
                              className={cn(
                                "sticky top-0 z-20 bg-slate-50 py-3 px-4 text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 whitespace-nowrap transition-colors",
                                canSort && "cursor-pointer hover:bg-slate-100 hover:text-slate-700 group"
                              )}
                            >
                              <div className="flex items-center justify-between gap-2 w-full">
                                <span className="truncate">{col.label}</span>
                                {canSort && (
                                  <div className="flex flex-col text-slate-500 flex-shrink-0 group-hover:text-slate-700 transition-colors">
                                    <ChevronUp className={cn("h-3 w-3 -mb-1", isSorted && sortConfig.direction === 'asc' ? "text-emerald-600" : "")} />
                                    <ChevronDown className={cn("h-3 w-3", isSorted && sortConfig.direction === 'desc' ? "text-emerald-600" : "")} />
                                  </div>
                                )}
                              </div>
                            </th>
                          );
                        })}
                        <th className="sticky top-0 right-0 z-30 bg-slate-50 py-3 px-4 text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 whitespace-nowrap text-center before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-slate-200 shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.05)]">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {currentUsers.map((user, index) => {
                        const tdClass = "py-3 px-4 text-xs md:text-sm text-slate-700 border-b border-slate-200 whitespace-nowrap";

                        return (
                          <tr
                            key={user.id}
                            className="hover:bg-slate-50/80 transition-colors group"
                          >
                            {visibleColumns.map((col) => (
                              <td key={col.id} className={tdClass}>
                                {col.id === "no" && (
                                  <span className="text-slate-500 font-medium">{startIndex + index + 1}</span>
                                )}
                                {col.id === "status" && (
                                  <Badge
                                    color={
                                      user.status === "Active" ? "emerald" :
                                        user.status === "Inactive" ? "slate" :
                                          user.status === "Pending" ? "amber" :
                                            user.status === "Suspended" ? "orange" :
                                              "red"
                                    }
                                    size="sm"
                                    pill
                                  >
                                    {user.status}
                                  </Badge>
                                )}
                                {col.id === "role" && (
                                  <Badge
                                    color={
                                      user.role === "Admin" ? "purple" :
                                        user.role === "QA Manager" ? "emerald" :
                                          user.role === "Approver" ? "blue" :
                                            user.role === "Reviewer" ? "cyan" :
                                              user.role === "Document Owner" ? "indigo" :
                                                "slate"
                                    }
                                    size="sm"
                                  >
                                    {user.role}
                                  </Badge>
                                )}
                                {col.id === "email" && (
                                  <div className="flex items-center gap-2 text-slate-700">
                                    {user.email}
                                  </div>
                                )}
                                {col.id === "phone" && (
                                  <div className="flex items-center gap-2 text-slate-700">
                                    {user.phone}
                                  </div>
                                )}
                                {col.id === "fullName" && (
                                  <span className="font-medium text-slate-900">{user.fullName}</span>
                                )}
                                {col.id === "employeeCode" && (
                                  <span
                                    className="font-medium text-emerald-600 cursor-pointer hover:underline"
                                    onClick={() => navigateTo(USER_MANAGEMENT_ROUTES.PROFILE(user.id))}
                                  >
                                    {user.employeeCode}
                                  </span>
                                )}
                                {col.id === "suspendedUntil" && (
                                  <span className="text-slate-700">
                                    {user.suspendedUntil ? formatDateNumeric(user.suspendedUntil) : "-"}
                                  </span>
                                )}
                                {col.id === "terminationDate" && (
                                  <span className="text-slate-700">
                                    {user.terminationDate ? formatDateNumeric(user.terminationDate) : "-"}
                                  </span>
                                )}
                                {!["status", "role", "email", "phone", "fullName", "employeeCode", "no", "suspendedUntil", "terminationDate"].includes(col.id) && (
                                  <span className="text-slate-700">{String(user[col.id as keyof User] ?? "")}</span>
                                )}
                              </td>
                            ))}
                            <td
                              onClick={(e) => e.stopPropagation()}
                              className="sticky right-0 z-10 bg-white border-b border-slate-200 py-3 px-4 text-center whitespace-nowrap before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-slate-200 shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.05)] group-hover:bg-slate-50 transition-colors"
                            >
                              <button
                                ref={getRef(user.id)}
                                onClick={(e) => handleDropdownToggle(user.id, e)}
                                className="inline-flex items-center justify-center h-7 w-7 md:h-8 md:w-8 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
                              >
                                <MoreVertical className="h-3.5 w-3.5 md:h-4 md:w-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <TablePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredUsers.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={setItemsPerPage}
                  showItemCount={true}
                />
              </>
            ) : (
              <TableEmptyState
                title="No Users Found"
                description="We couldn't find any users matching your filters. Try adjusting your search criteria or clear filters."
                actionLabel="Clear Filters"
                onAction={clearFilters}
              />
            )}
          </div>
        </div>
      </div>

      {/* Action Menu */}
      <UserActionMenu
        isOpen={openDropdownId !== null}
        onClose={closeDropdown}
        position={dropdownPosition}
        user={users.find((u) => u.id === openDropdownId)}
        onViewProfile={(id) => navigateTo(USER_MANAGEMENT_ROUTES.PROFILE(id))}
        onResetPassword={handleResetPassword}
        onSuspend={handleSuspend}
        onTerminate={handleTerminate}
        onReinstate={handleReinstate}
      />

      {/* Reset Password Modal */}
      <ResetPasswordModal
        isOpen={resetPasswordModal.isOpen}
        onClose={() => setResetPasswordModal({ isOpen: false, userId: "", userName: "", password: "" })}
        userName={resetPasswordModal.userName}
        password={resetPasswordModal.password}
        onRegeneratePassword={() => setResetPasswordModal((prev) => ({ ...prev, password: generatePassword() }))}
      />

      {/* Suspend Modal */}
      <SuspendModal
        isOpen={suspendModal.isOpen}
        onClose={() => setSuspendModal({ isOpen: false, userId: "", userName: "" })}
        onConfirm={confirmSuspend}
        userName={suspendModal.userName}
      />

      {/* Terminate Modal */}
      <TerminateModal
        isOpen={terminateModal.isOpen}
        onClose={() => setTerminateModal({ isOpen: false, userId: "", userName: "" })}
        onConfirm={confirmTerminate}
        userName={terminateModal.userName}
      />

      {/* Reinstate Modal */}
      <AlertModal
        isOpen={reinstateModal.isOpen}
        onClose={() => setReinstateModal({ isOpen: false, userId: "", userName: "" })}
        onConfirm={confirmReinstate}
        type="confirm"
        title="Reinstate User"
        description={`Are you sure you want to reinstate ${reinstateModal.userName}? Their account will be set to Active.`}
        confirmText="Yes, Reinstate"
        cancelText="Cancel"
        showCancel
      />

      {isNavigating && <FullPageLoading text="Loading..." />}
    </div>
  );
};

interface UserActionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  position: PortalDropdownPosition;
  user: User | undefined;
  onViewProfile: (id: string) => void;
  onResetPassword: (user: User) => void;
  onSuspend: (user: User) => void;
  onTerminate: (user: User) => void;
  onReinstate: (user: User) => void;
}

const UserActionMenu: React.FC<UserActionMenuProps> = ({
  isOpen,
  onClose,
  position,
  user,
  onViewProfile,
  onResetPassword,
  onSuspend,
  onTerminate,
  onReinstate,
}) => {
  if (!isOpen || !user) return null;

  const isTerminated = user.status === "Terminated";
  const isSuspended = user.status === "Suspended";

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-40 animate-in fade-in duration-150"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-hidden="true"
      />
      <div
        className="absolute z-50 min-w-[180px] rounded-lg border border-slate-200 bg-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-200"
        style={position.style}
      >
        <div className="py-1">
          <button
            onClick={() => {
              onClose();
              onViewProfile(user.id);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors"
          >
            <UserIcon className="h-4 w-4 flex-shrink-0" />
            <span className="font-medium text-slate-500">View Profile</span>
          </button>
          {!isTerminated && (
            <button
              onClick={() => {
                onClose();
                onResetPassword(user);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors"
            >
              <KeyRound className="h-4 w-4 flex-shrink-0" />
              <span className="font-medium text-slate-500">Reset Password</span>
            </button>
          )}

          {!isTerminated && !isSuspended && (
            <button
              onClick={() => {
                onClose();
                onSuspend(user);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors"
            >
              <PauseCircle className="h-4 w-4 flex-shrink-0" />
              <span className="font-medium text-slate-500">Suspend Account</span>
            </button>
          )}
          {!isTerminated && (
            <button
              onClick={() => {
                onClose();
                onTerminate(user);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors"
            >
              <IconUserX className="h-4 w-4 flex-shrink-0" />
              <span className="font-medium text-slate-500">Terminate Account</span>
            </button>
          )}
          {(isSuspended || isTerminated) && (
            <button
              onClick={() => {
                onClose();
                onReinstate(user);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors"
            >
              <RotateCcw className="h-4 w-4 flex-shrink-0" />
              <span className="font-medium text-slate-500">Reinstate User</span>
            </button>
          )}
        </div>
      </div>
    </>,
    document.body
  );
};
