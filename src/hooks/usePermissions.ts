/**
 * usePermissions Hook
 * Handles Role-Based Access Control (RBAC) on the Front-end
 */

import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

export type Action = 'create' | 'read' | 'update' | 'delete' | 'approve' | 'reject' | 'export' | 'admin';
export type Module = 
  | 'documents' | 'deviations' | 'capa' | 'complaints' 
  | 'equipment' | 'supplier' | 'training' | 'settings';

export function usePermissions() {
  const { user } = useAuth();

  const permissions = useMemo(() => {
    if (!user) return [];
    return user.permissions || [];
  }, [user]);

  /**
   * Check if user has a specific permission string
   * Example: hasPermission('deviations:approve')
   */
  const hasPermission = (permission: string): boolean => {
    if ((user?.role as UserRole) === 'SuperAdmin') return true;
    return permissions.includes(permission);
  };

  /**
   * Semantic check for actions on modules
   * Example: can('approve', 'deviations')
   */
  const can = (action: Action, module: Module): boolean => {
    // Admin bypass
    if ((user?.role as UserRole) === 'SuperAdmin') return true;

    // Standard permission naming convention: "module:action"
    const permissionKey = `${module}:${action}`;
    
    // Core Logic
    switch (action) {
      case 'admin':
        return (user?.role as UserRole) === 'Admin' || (user?.role as UserRole) === 'SuperAdmin';
      case 'approve':
      case 'reject':
        // Only specific roles can approve in most GMP systems
        return ((user?.role as UserRole) === 'QA' || (user?.role as UserRole) === 'Manager') && hasPermission(permissionKey);
      default:
        return hasPermission(permissionKey);
    }
  };

  return {
    user,
    role: user?.role,
    permissions,
    hasPermission,
    can,
    isAdmin: (user?.role as UserRole) === 'Admin' || (user?.role as UserRole) === 'SuperAdmin',
    isQA: (user?.role as UserRole) === 'QA',
  };
}
