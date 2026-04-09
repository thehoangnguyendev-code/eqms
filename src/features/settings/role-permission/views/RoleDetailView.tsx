import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTES } from "@/app/routes.constants";
import {
  Search,
  Lock,
  ChevronDown,
  ChevronUp,
  Filter,
  Package,
  Scale,
  FileBarChart,
  ShieldCheck,
  Info,
} from "lucide-react";
import {
  IconFileDescription,
  IconPresentationAnalytics,
  IconAlertTriangle,
  IconReplace,
  IconClipboardCheck,
  IconFilter2Search,
  IconSettings2,
  IconAlertSquareRounded,
  IconBuildingStore,
  IconDeviceLaptop,
  IconShield,
  IconMessageReport,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button/Button";
import { Checkbox } from "@/components/ui/checkbox/Checkbox";
import { AlertModal } from "@/components/ui/modal/AlertModal";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/components/ui/utils";
import { Role, PermissionGroup } from "../types";
import { PERMISSION_GROUPS, isALCOAPlusRequired } from "../constants";
import { MOCK_ROLES } from "../mockData";
import { PageHeader } from "@/components/ui/page/PageHeader";
import { roleDetail } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { FullPageLoading } from "@/components/ui/loading/Loading";

const FormSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ title, icon, children, className }) => (
  <div className={cn("bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden", className)}>
    <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
      <span className="text-emerald-600">{icon}</span>
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

export const RoleDetailView: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { id } = useParams<{ id: string }>();

  const isNewRole = window.location.pathname.endsWith("/new");
  const isEditMode = window.location.pathname.includes("/edit");
  const isViewMode = !isNewRole && !isEditMode;

  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [roleType] = useState<"system" | "custom">("custom");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(PERMISSION_GROUPS.map((g) => g.id))
  );
  const [permissionSearch, setPermissionSearch] = useState("");
  const [actionFilters, setActionFilters] = useState<Set<string>>(new Set());
  const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState(false);
  const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false);
  const [nameError, setNameError] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);

  // Load role data
  useEffect(() => {
    if (!isNewRole && id) {
      const role = MOCK_ROLES.find((r) => r.id === id);
      if (role) {
        setRoleName(role.name);
        setRoleDescription(role.description);
        setSelectedPermissions(role.permissions);
      }
    }
  }, [id, isNewRole]);

  const validateName = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return "Role name is required";
    }
    if (trimmed.length < 3) {
      return "Role name must be at least 3 characters";
    }
    return "";
  };

  const handleNameChange = (value: string) => {
    setRoleName(value);
    setHasUnsavedChanges(true);
    const error = validateName(value);
    setNameError(error);
  };

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions((prev) => {
      const hasPermission = prev.includes(permissionId);
      if (hasPermission) {
        return prev.filter((p) => p !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
    setHasUnsavedChanges(true);
  };

  const handleSelectAll = (group: PermissionGroup, checked: boolean) => {
    const groupPermissionIds = group.permissions.map((p) => p.id);
    setSelectedPermissions((prev) => {
      let newPermissions = [...prev];

      if (checked) {
        groupPermissionIds.forEach((id) => {
          if (!newPermissions.includes(id)) {
            newPermissions.push(id);
          }
        });
      } else {
        newPermissions = newPermissions.filter((p) => !groupPermissionIds.includes(p));
      }

      return newPermissions;
    });
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    const error = validateName(roleName);
    if (error) {
      setNameError(error);
      showToast({
        type: "error",
        title: "Validation Error",
        message: error,
      });
      return;
    }

    showToast({
      type: "success",
      title: isNewRole ? "Role Created" : "Role Updated",
      message: `${roleName.trim()} has been ${isNewRole ? "created" : "updated"}`,
    });

    setHasUnsavedChanges(false);
    setIsNavigating(true);
    setTimeout(() => navigate(ROUTES.SETTINGS.ROLES), 600);
  };

  const handleDiscard = () => {
    setIsNavigating(true);
    setTimeout(() => navigate(ROUTES.SETTINGS.ROLES), 600);
  };

  const getGroupPermissionCount = (group: PermissionGroup) => {
    const selected = group.permissions.filter((p) => selectedPermissions.includes(p.id)).length;
    return { selected, total: group.permissions.length };
  };

  const getTotalPermissionCount = () => {
    const total = PERMISSION_GROUPS.reduce((sum, g) => sum + g.permissions.length, 0);
    return { selected: selectedPermissions.length, total };
  };

  const permissionCount = getTotalPermissionCount();

  const getModuleIcon = (moduleId: string) => {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      documents: IconFileDescription,
      training: IconPresentationAnalytics,
      capa: IconClipboardCheck,
      change_control: IconReplace,
      deviations: IconAlertTriangle,
      complaints: IconMessageReport,
      risk_management: IconAlertSquareRounded,
      equipment: IconDeviceLaptop,
      supplier_quality: IconBuildingStore,
      product: Package,
      regulatory: Scale,
      reports: FileBarChart,
      audit_trail: IconFilter2Search,
      settings: IconSettings2,
    };
    return iconMap[moduleId] || IconShield;
  };

  const ACTIONS = [
    "view",
    "create",
    "edit",
    "delete",
    "approve",
    "review",
    "archive",
    "export",
    "assign",
    "close",
  ];

  const ACTION_LABELS: Record<string, string> = {
    view: "View",
    create: "Create",
    edit: "Edit",
    delete: "Delete",
    approve: "Approve",
    review: "Review",
    archive: "Archive",
    export: "Export",
    assign: "Assign",
    close: "Close",
  };

  const toggleActionFilter = (action: string) => {
    setActionFilters((prev) => {
      const next = new Set(prev);
      if (next.has(action)) next.delete(action);
      else next.add(action);
      return next;
    });
  };

  const clearPermissionFilters = () => {
    setPermissionSearch("");
    setActionFilters(new Set());
  };

  const expandAll = () => setExpandedGroups(new Set(PERMISSION_GROUPS.map((g) => g.id)));
  const collapseAll = () => setExpandedGroups(new Set());
  const areAllExpanded = expandedGroups.size === PERMISSION_GROUPS.length;

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  const getFilteredPermissionCounts = () => {
    const allPermissions = PERMISSION_GROUPS.flatMap((g) => g.permissions);
    let filtered = allPermissions;

    if (permissionSearch.trim()) {
      filtered = filtered.filter((p) =>
        p.label.toLowerCase().includes(permissionSearch.toLowerCase())
      );
    }

    if (actionFilters.size > 0) {
      filtered = filtered.filter((p) => {
        const action = p.id.split(".").pop();
        return action && actionFilters.has(action);
      });
    }

    return {
      total: allPermissions.length,
      filtered: filtered.length,
      selected: selectedPermissions.length,
    };
  };

  const permissionCounts = getFilteredPermissionCounts();

  return (
    <div className="space-y-6 w-full flex-1 flex flex-col">
      {/* Header */}
      <PageHeader
        title={isNewRole ? "New Role" : isEditMode ? "Edit Role" : "Role Details"}
        breadcrumbItems={roleDetail(navigate, isNewRole ? "new" : isEditMode ? "edit" : "view")}
        actions={
          isViewMode ? (
            <>
              <Button variant="outline-emerald" size="sm" onClick={() => { setIsNavigating(true); setTimeout(() => navigate(ROUTES.SETTINGS.ROLES), 600); }} className="whitespace-nowrap">
                Back
              </Button>
              <Button variant="outline-emerald" size="sm" onClick={() => { setIsNavigating(true); setTimeout(() => navigate(ROUTES.SETTINGS.ROLES_EDIT(id!)), 600); }} className="whitespace-nowrap">
                Edit Role
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline-emerald" size="sm" onClick={() => setIsDiscardConfirmOpen(true)} className="whitespace-nowrap">
                Cancel
              </Button>
              <Button variant="outline-emerald" size="sm" onClick={() => setIsSaveConfirmOpen(true)} disabled={!hasUnsavedChanges || !!nameError} className="whitespace-nowrap gap-2">
                {isNewRole ? "Create Role" : "Save Changes"}
              </Button>
            </>
          )
        }
      />

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">

        {/* Left: Role Information */}
        <div className="lg:col-span-4">
          <FormSection title="Role Information" icon={<Info className="h-4 w-4" />}>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
                  Role Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={roleName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Enter role name"
                  disabled={isViewMode}
                  className={cn(
                    "block w-full h-9 px-3 border rounded-lg bg-white focus:outline-none focus:ring-1 text-sm transition-all placeholder:text-slate-400",
                    nameError
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-slate-200 focus:ring-emerald-500 focus:border-emerald-500",
                    isViewMode && "bg-slate-100 text-slate-600 cursor-not-allowed"
                  )}
                />
                {nameError && <p className="text-xs text-red-600 mt-1">{nameError}</p>}
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">Description</label>
                <textarea
                  rows={4}
                  value={roleDescription}
                  onChange={(e) => {
                    setRoleDescription(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="Enter role description"
                  disabled={isViewMode}
                  className={cn(
                    "block w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all placeholder:text-slate-400 resize-none",
                    isViewMode && "bg-slate-100 text-slate-600 cursor-not-allowed"
                  )}
                />
              </div>
              {/* Summary */}
              <div className="pt-3 border-t border-slate-100">
                <p className="text-xs font-medium text-slate-500 mb-2">Permissions Summary</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${permissionCount.total > 0 ? Math.round((permissionCount.selected / permissionCount.total) * 100) : 0}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 shrink-0">
                    {permissionCount.selected} / {permissionCount.total}
                  </span>
                </div>
              </div>
            </div>
          </FormSection>
        </div>

        {/* Right: Permission Section */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[520px] lg:h-[calc(100vh-280px)]">
        {/* Header */}
        <div className="flex items-center justify-between gap-2.5 px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="text-emerald-600"><ShieldCheck className="h-4 w-4" /></span>
            <h3 className="text-sm font-semibold text-slate-800">Permissions</h3>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-slate-100 text-slate-700">
              {permissionCount.selected} selected
            </span>
            <span className="text-slate-400">/</span>
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">
              {permissionCount.total} total
            </span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-col gap-3 shrink-0">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={permissionSearch}
                onChange={(e) => setPermissionSearch(e.target.value)}
                placeholder="Search permissions..."
                className="w-full h-9 pl-9 pr-4 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={areAllExpanded ? collapseAll : expandAll}
              className="h-9 px-3 text-xs md:text-sm bg-white min-w-[120px]"
            >
              {areAllExpanded ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5 mr-1.5" /> Collapse All
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5 mr-1.5" /> Expand All
                </>
              )}
            </Button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <Filter className="h-3.5 w-3.5" />
              Action:
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {ACTIONS.map((action) => (
                <Button
                  key={action}
                  variant="outline"
                  size="xs"
                  onClick={() => toggleActionFilter(action)}
                  className={cn(
                    "h-7 px-2 text-xs",
                    actionFilters.has(action)
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                      : "hover:bg-slate-50"
                  )}
                >
                  {ACTION_LABELS[action] || action}
                </Button>
              ))}
            </div>
            {(permissionSearch.trim() || actionFilters.size > 0) && (
              <Button
                variant="destructive"
                size="xs"
                onClick={clearPermissionFilters}
                className="h-7 px-2 text-xs"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Permission Count Display */}
        {(permissionSearch.trim() || actionFilters.size > 0) && (
          <div className="px-6 py-3 bg-blue-50 border-b border-blue-200 shrink-0">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-blue-700">
                Showing <span className="font-semibold">{permissionCounts.filtered}</span> of{" "}
                <span className="font-semibold">{permissionCounts.total}</span> permissions
              </span>
              {permissionCounts.selected > 0 && (
                <>
                  <span className="text-blue-400">•</span>
                  <span className="text-blue-700">
                    <span className="font-semibold">{permissionCounts.selected}</span> selected
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Content List */}
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="min-h-full">
            {PERMISSION_GROUPS.map((group) => {
              const visiblePermissions = group.permissions.filter((permission) => {
                const matchesSearch =
                  !permissionSearch ||
                  permission.label.toLowerCase().includes(permissionSearch.toLowerCase()) ||
                  permission.description.toLowerCase().includes(permissionSearch.toLowerCase());
                const matchesAction =
                  actionFilters.size === 0 || actionFilters.has(permission.action);
                return matchesSearch && matchesAction;
              });

              if (visiblePermissions.length === 0) return null;

              const groupCount = getGroupPermissionCount(group);
              const isAllSelected = groupCount.selected === groupCount.total;
              const isExpanded = expandedGroups.has(group.id);
              const ModuleIcon = getModuleIcon(group.id);

              return (
                <div
                  key={group.id}
                  className="border-b border-slate-100 last:border-0 border-l-[3px] border-l-transparent hover:border-l-emerald-500 transition-all"
                >
                  {/* Group Header */}
                  <div
                    onClick={() => toggleGroup(group.id)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between px-4 md:px-6 py-1 cursor-pointer hover:bg-slate-50 transition-colors select-none group/header gap-3"
                  >
                    <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                      <ModuleIcon className={cn(
                        "h-5 w-5 shrink-0 transition-colors",
                        isAllSelected
                          ? "text-emerald-600"
                          : "text-slate-500 group-hover/header:text-emerald-600"
                      )} />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm md:text-sm text-slate-900 flex items-center gap-2 truncate">
                          {group.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {group.permissions.length} permissions available
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 md:gap-6">
                      <div
                        className="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-xs font-medium text-slate-600">Enable All</span>
                        <Checkbox
                          id={`group-${group.id}`}
                          checked={isAllSelected}
                          onChange={(checked) => handleSelectAll(group, checked)}
                          disabled={isViewMode}
                        />
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-slate-400 shrink-0" />
                      )}
                    </div>
                  </div>

                  {/* Permissions List */}
                  {isExpanded && (
                    <div className="bg-slate-50/50">
                      {visiblePermissions.map((permission, index) => {
                        const isChecked = selectedPermissions.includes(permission.id);
                        return (
                          <div
                            key={permission.id}
                            className="flex items-start sm:items-center justify-between px-4 md:px-6 py-3 pl-[1rem] md:pl-[1.5rem] hover:bg-slate-50 transition-colors border-t border-slate-100 first:border-0 group/item gap-2"
                          >
                            <div className="flex items-start sm:items-center gap-2 md:gap-3 flex-1 pr-3 md:pr-6 min-w-0">
                              <span className="text-xs text-slate-400 font-medium min-w-[1.5rem] shrink-0 pt-0.5 sm:pt-0">
                                {index + 1}.
                              </span>
                              <div
                                className="flex-1 cursor-pointer select-none min-w-0"
                                onClick={() => handlePermissionToggle(permission.id)}
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                  <span
                                    className={cn(
                                      "text-sm font-medium transition-colors break-words",
                                      isChecked
                                        ? "text-slate-900"
                                        : "text-slate-600 group-hover/item:text-slate-900"
                                    )}
                                  >
                                    {permission.label}
                                  </span>
                                  {isALCOAPlusRequired(permission.id) && (
                                    <div
                                      title="Audit Trail Required"
                                      className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-100 w-fit"
                                    >
                                      <IconFilter2Search className="h-3 w-3" />
                                      <span className="sm:inline">Audit</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center shrink-0">
                              <Checkbox
                                id={permission.id}
                                checked={isChecked}
                                onChange={() => handlePermissionToggle(permission.id)}
                                disabled={isViewMode}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* end two-column grid */}
      </div>

      {/* Discard Changes Confirm */}
      <AlertModal
        isOpen={isDiscardConfirmOpen}
        onClose={() => setIsDiscardConfirmOpen(false)}
        onConfirm={() => {
          handleDiscard();
          setIsDiscardConfirmOpen(false);
        }}
        type="warning"
        title="Discard Changes"
        confirmText="Discard"
        showCancel
        description={
          <div className="text-sm text-slate-600">
            Are you sure you want to discard all changes? This action cannot be undone.
          </div>
        }
      />

      {/* Save Changes Confirm */}
      <AlertModal
        isOpen={isSaveConfirmOpen}
        onClose={() => setIsSaveConfirmOpen(false)}
        onConfirm={() => {
          handleSave();
          setIsSaveConfirmOpen(false);
        }}
        type="info"
        title={isNewRole ? "Create Role" : "Save Changes"}
        confirmText={isNewRole ? "Create" : "Save Changes"}
        showCancel
        description={
          <div className="text-sm text-slate-600">
            {isNewRole
              ? `Are you sure you want to create role "${roleName.trim()}"?`
              : `Are you sure you want to save the changes made to "${roleName}"?`}
          </div>
        }
      />

      {isNavigating && <FullPageLoading text="Loading..." />}
    </div>
  );
};
