import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/app/routes.constants";
import { Plus, Search, MoreVertical, Users, Lock, Download, ChevronUp, ChevronDown, Trash2, Edit } from "lucide-react";
import { IconEye, IconEdit, IconTrash, IconInfoCircle } from "@tabler/icons-react";
import { Button } from "@/components/ui/button/Button";
import { AlertModal } from "@/components/ui/modal/AlertModal";
import { TablePagination } from "@/components/ui/table/TablePagination";
import { TableEmptyState } from "@/components/ui/table/TableEmptyState";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/components/ui/utils";
import { FilterCard } from "@/components/ui/card/FilterCard";
import { PageHeader } from "@/components/ui/page/PageHeader";
import { Badge } from "@/components/ui/badge/Badge";
import { rolePermissions } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { Role } from "../types";
import { PERMISSION_GROUPS } from "../constants";
import { MOCK_ROLES } from "../mockData";
import { FullPageLoading } from "@/components/ui/loading/Loading";
import { usePortalDropdown, useNavigateWithLoading, useTableDragScroll, PortalDropdownPosition } from "@/hooks";

interface DropdownMenuProps {
  isOpen: boolean;
  onClose: () => void;
  position: PortalDropdownPosition;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  canDelete: boolean;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  isOpen,
  onClose,
  position,
  onView,
  onEdit,
  onDelete,
  canDelete,
}) => {
  if (!isOpen) return null;

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
            onClick={(e) => { e.stopPropagation(); onView(); onClose(); }}
            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors"
          >
            <IconInfoCircle className="h-4 w-4 text-slate-400 flex-shrink-0" />
            <span className="font-medium text-slate-600">View Role</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); onClose(); }}
            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors"
          >
            <Edit className="h-4 w-4 text-slate-400 flex-shrink-0" />
            <span className="font-medium text-slate-600">Edit Role</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); if (canDelete) { onDelete(); onClose(); } }}
            disabled={!canDelete}
            className={cn(
              "flex w-full items-center gap-2 px-3 py-2 text-xs transition-colors font-medium border-t border-slate-50 mt-1 pt-2",
              !canDelete ? "text-slate-300 cursor-not-allowed opacity-50" : "text-slate-500 hover:bg-slate-50 active:bg-slate-100"
            )}
          >
            <Trash2 className={cn("h-4 w-4 flex-shrink-0", !canDelete ? "text-slate-300" : "text-slate-500")} />
            <span>Delete Role</span>
          </button>
        </div>
      </div>
    </>,
    window.document.body
  );
};

export const RoleListView: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [roles, setRoles] = useState<Role[]>(MOCK_ROLES);

  // Calculate total permissions
  const totalPermissions = useMemo(
    () => PERMISSION_GROUPS.reduce((sum, group) => sum + group.permissions.length, 0),
    []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: "asc" | "desc" }>({
    key: "name",
    direction: "asc",
  });

  const { openId: openDropdownId, position: dropdownPosition, getRef, toggle: handleDropdownToggle, close: closeDropdown } = usePortalDropdown();

  // Sorting Handler
  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };
  const { scrollerRef, isDragging, dragEvents } = useTableDragScroll();
  const { navigateTo, isNavigating } = useNavigateWithLoading();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteRoleId, setDeleteRoleId] = useState<string>("");


  // Filtered data
  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      const matchesSearch =
        searchQuery === "" ||
        role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [roles, searchQuery]);

  const sortedRoles = useMemo(() => {
    if (!sortConfig.key) return filteredRoles;

    return [...filteredRoles].sort((a, b) => {
      let aVal: any = (a as any)[sortConfig.key!];
      let bVal: any = (b as any)[sortConfig.key!];

      if (sortConfig.key === "permissions") {
        aVal = a.permissions.length;
        bVal = b.permissions.length;
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredRoles, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRoles = useMemo(() => {
    return sortedRoles.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedRoles, startIndex, itemsPerPage]);

  // Handlers
  const handleViewRole = (id: string) => {
    navigateTo(ROUTES.SETTINGS.ROLES_DETAIL(id));
  };

  const handleEdit = (id: string) => {
    navigateTo(ROUTES.SETTINGS.ROLES_EDIT(id));
  };

  const handleCreateNew = () => {
    navigateTo(ROUTES.SETTINGS.ROLES_NEW);
  };



  const openDeleteModal = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId);
    if (!role) return;
    if (role.type === "system") {
      showToast({
        type: "error",
        title: "Protected role",
        message: "System roles cannot be deleted",
      });
      return;
    }
    setDeleteRoleId(roleId);
    setIsDeleteOpen(true);
  };

  const handleDeleteRole = () => {
    const role = roles.find((r) => r.id === deleteRoleId);
    if (!role) {
      setIsDeleteOpen(false);
      return;
    }
    if (role.type === "system") {
      setIsDeleteOpen(false);
      showToast({
        type: "error",
        title: "Protected role",
        message: "System roles cannot be deleted",
      });
      return;
    }

    const updated = roles.filter((r) => r.id !== deleteRoleId);
    setRoles(updated);
    setIsDeleteOpen(false);
    showToast({
      type: "success",
      title: "Role deleted",
      message: `${role.name} has been removed`,
    });
  };

  return (
    <div className="space-y-6 w-full flex-1 flex flex-col">
      {/* Header */}
      <PageHeader
        title="Roles & Permissions"
        breadcrumbItems={rolePermissions()}
        actions={
          <>
            <Button
              onClick={() => console.log("Export roles")}
              variant="outline"
              size="sm"
              className="whitespace-nowrap gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button size="sm" className="whitespace-nowrap gap-2" onClick={handleCreateNew}>
              <Plus className="h-4 w-4" />
              New Role
            </Button>
          </>
        }
      />

      {/* Unified Content Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm w-full overflow-hidden flex flex-col">
        {/* Filter Section */}
        <div className="p-4 md:p-5 border-b border-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {/* Search */}
            <div className="lg:col-span-2 max-w-lg">
              <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors" />
                <input
                  type="text"
                  placeholder="Search by role name, description..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="block w-full pl-10 pr-3 h-9 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="px-4 md:px-5 pb-4 md:pb-5 flex-1 flex flex-col relative">
          <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col flex-1 bg-slate-50/10 transition-all duration-300">
            {paginatedRoles.length > 0 ? (
              <>
                {/* Table */}
                <div
                  ref={scrollerRef}
                  className={cn(
                    "overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 hover:scrollbar-thumb-slate-400 scrollbar-thumb-rounded-full scrollbar-track-rounded-full transition-colors",
                    isDragging ? "cursor-grabbing select-none" : "cursor-grab"
                  )}
                  {...dragEvents}
                >
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b-2 border-slate-200 sticky top-0 z-30">
                      <tr>
                        <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                          No.
                        </th>
                        {[
                          { label: "Role Name", id: "name" },
                          { label: "Description", id: "description" },
                          { label: "Type", id: "type" },
                          { label: "Users", id: "userCount" },
                          { label: "Permissions", id: "permissions" }
                        ].map((col, idx) => {
                          const isSorted = sortConfig.key === col.id;
                          return (
                            <th
                              key={idx}
                              onClick={() => handleSort(col.id)}
                              className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition-colors group"
                            >
                              <div className="flex items-center justify-between gap-2 w-full">
                                <span className="truncate">{col.label}</span>
                                <div className="flex flex-col text-slate-400 flex-shrink-0 group-hover:text-slate-500">
                                  <ChevronUp className={cn("h-3 w-3 -mb-1", isSorted && sortConfig.direction === 'asc' ? "text-emerald-600 font-bold" : "")} />
                                  <ChevronDown className={cn("h-3 w-3", isSorted && sortConfig.direction === 'desc' ? "text-emerald-600 font-bold" : "")} />
                                </div>
                              </div>
                            </th>
                          );
                        })}
                        <th className="sticky right-0 bg-slate-50 py-2.5 px-2 sm:py-3.5 sm:px-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider z-[1] whitespace-nowrap before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-200 shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.05)]">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {paginatedRoles.map((role, index) => (
                        <tr
                          key={role.id}
                          onClick={() => handleViewRole(role.id)}
                          className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        >
                          <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-500 font-medium">
                            {startIndex + index + 1}
                          </td>
                          <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                            <span className="font-medium text-emerald-600">{role.name}</span>
                          </td>
                          <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-slate-700 max-w-md">
                            <span className="line-clamp-2">{role.description}</span>
                          </td>
                          <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                            <Badge
                              color={role.type === "custom" ? "amber" : "slate"}
                              size="sm"
                            >
                              {role.type === "system" ? "System" : "Custom"}
                            </Badge>
                          </td>
                          <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-700">
                            <div className="flex items-center gap-1.5">
                              <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400" />
                              <span className="font-medium">{role.userCount}</span>
                            </div>
                          </td>
                          <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-700">
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium">
                                {role.permissions.length}
                                <span className="text-slate-400 mx-0.5">/</span>
                                {totalPermissions}
                              </span>
                            </div>
                          </td>
                          <td
                            onClick={(e) => e.stopPropagation()}
                            className="sticky right-0 bg-white py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-center z-30 whitespace-nowrap before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-200 shadow-[-8px_0_16px_-2px_rgba(0,0,0,0.12)] group-hover:bg-slate-50"
                          >
                            <button
                              ref={getRef(role.id)}
                              onClick={(e) => handleDropdownToggle(role.id, e)}
                              className="inline-flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-lg hover:bg-slate-100 transition-colors"
                              aria-label="More actions"
                            >
                              <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-600" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <TablePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={filteredRoles.length}
                  itemsPerPage={itemsPerPage}
                  onItemsPerPageChange={setItemsPerPage}
                  showItemCount={true}
                />
              </>
            ) : (
              <TableEmptyState
                title="No roles found"
                description="Try adjusting your search criteria"
              />
            )}
          </div>
        </div>
      </div>

      {/* Dropdown Menu */}
      {openDropdownId && (
        <DropdownMenu
          isOpen={openDropdownId !== null}
          onClose={closeDropdown}
          position={dropdownPosition}
          onView={() => handleViewRole(openDropdownId!)}
          onEdit={() => handleEdit(openDropdownId!)}
          onDelete={() => openDeleteModal(openDropdownId!)}
          canDelete={roles.find(r => r.id === openDropdownId)?.type !== 'system'}
        />
      )}

      {/* Delete Role Confirm */}
      <AlertModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteRole}
        type="warning"
        title="Delete Role"
        confirmText="Delete"
        showCancel
        description={
          <div className="text-sm text-slate-600">
            Are you sure you want to delete this role? This action cannot be undone.
          </div>
        }
      />

      {isNavigating && <FullPageLoading text="Loading..." />}
    </div>
  );
};
