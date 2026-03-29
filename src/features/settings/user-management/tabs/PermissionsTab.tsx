import React from "react";
import { Shield, Lock, Users, FileBarChart } from "lucide-react";
import { IconCircleCheckFilled, IconFileDescription, IconSettings2 } from "@tabler/icons-react";
import { cn } from "@/components/ui/utils";
import { getRoleColor } from "../constants";
import type { User } from "../types";

type PermissionGroup = { category: string; icon: React.ElementType; permissions: string[] };

const ROLE_PERMISSIONS: Record<string, PermissionGroup[]> = {
  Admin: [
    { category: "User Management", icon: Users, permissions: ["View users", "Create users", "Edit users", "Delete users", "Reset passwords"] },
    { category: "Document Control", icon: IconFileDescription, permissions: ["View documents", "Create documents", "Edit documents", "Delete documents", "Approve documents", "Publish documents"] },
    { category: "System Settings", icon: IconSettings2, permissions: ["View settings", "Edit settings", "Manage roles", "View audit trail"] },
    { category: "Reports", icon: FileBarChart, permissions: ["View reports", "Export reports"] },
  ],
  "QA Manager": [
    { category: "Document Control", icon: IconFileDescription, permissions: ["View documents", "Create documents", "Edit documents", "Approve documents", "Publish documents"] },
    { category: "User Management", icon: Users, permissions: ["View users"] },
    { category: "Reports", icon: FileBarChart, permissions: ["View reports", "Export reports"] },
  ],
  "Document Owner": [
    { category: "Document Control", icon: IconFileDescription, permissions: ["View documents", "Create documents", "Edit documents"] },
    { category: "Reports", icon: FileBarChart, permissions: ["View reports"] },
  ],
  Reviewer: [
    { category: "Document Control", icon: IconFileDescription, permissions: ["View documents", "Review documents"] },
  ],
  Approver: [
    { category: "Document Control", icon: IconFileDescription, permissions: ["View documents", "Review documents", "Approve documents"] },
  ],
  Viewer: [
    { category: "Document Control", icon: IconFileDescription, permissions: ["View documents"] },
    { category: "Reports", icon: FileBarChart, permissions: ["View reports"] },
  ],
};

interface PermissionsTabProps {
  user: User;
}

export const PermissionsTab: React.FC<PermissionsTabProps> = ({ user }) => {
  const rolePermissions = ROLE_PERMISSIONS[user.role] ?? [];

  return (
    <div className="space-y-5">
      {/* Role banner */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
        <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <Shield className="h-4 w-4 text-emerald-600" />
        </div>
        <div>
          <p className="text-xs text-slate-500">Permissions inherited from role</p>
          <p className="text-sm font-bold text-slate-800">{user.role}</p>
        </div>
        <span className={cn("ml-auto inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border", getRoleColor(user.role))}>
          {user.role}
        </span>
      </div>

      {rolePermissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Lock className="h-10 w-10 text-slate-300 mb-3" />
          <p className="text-sm font-medium text-slate-500">No permissions defined for this role</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {rolePermissions.map((group) => (
            <div key={group.category} className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                <group.icon className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{group.category}</span>
              </div>
              <ul className="divide-y divide-slate-100">
                {group.permissions.map((perm) => (
                  <li key={perm} className="flex items-center gap-2.5 px-4 py-2.5">
                    <IconCircleCheckFilled className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm text-slate-700">{perm}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
