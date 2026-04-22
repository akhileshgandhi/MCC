/**
 * Role Management System for IEP Portal
 * 
 * This file defines the three user roles and their permissions across the portal.
 * 
 * ROLES:
 * 
 * 1. IEPEmployesGroup (Read-Only Access)
 *    - Can view all IEPs and Archived IEPs
 *    - Can download files
 *    - Cannot create, edit, or delete any content
 *    - No access to Settings
 *    - No department restrictions (can view all)
 * 
 * 2. Planning Unit Manager (Department-Specific Access)
 *    - Can view all IEPs and Archived IEPs
 *    - Can create, edit, and delete IEPs ONLY for their assigned department
 *    - Cannot edit IEPs from other departments
 *    - No access to Settings
 *    - Department is required when creating user with this role
 * 
 * 3. Program Director (Full Access)
 *    - Can view, create, edit, and delete all IEPs across all departments
 *    - Full access to Settings (manage users, departments, alignments, etc.)
 *    - Can access Dashboard with analytics
 *    - No department restrictions
 * 
 * SHAREPOINT GROUPS MAPPING:
 * - IEPEmployesGroup → 'IEPEmployesGroup' role
 * - PlaningUnitManagerGroup → 'Planning Unit Manager' role
 * - Program Director → 'Program Director' role
 */

export type UserRole = 'IEPEmployesGroup' | 'Planning Unit Manager' | 'Program Director';

export const USER_ROLES = {
  IEP_EMPLOYEE: 'IEPEmployesGroup' as UserRole,
  PLANNING_UNIT_MANAGER: 'Planning Unit Manager' as UserRole,
  PROGRAM_DIRECTOR: 'Program Director' as UserRole,
} as const;

export interface RolePermissions {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canAccessSettings: boolean;
  canAccessDashboard: boolean;
  departmentRestricted: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  'IEPEmployesGroup': {
    canView: true,
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canAccessSettings: false,
    canAccessDashboard: false,
    departmentRestricted: false,
  },
  'Planning Unit Manager': {
    canView: true,
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canAccessSettings: false,
    canAccessDashboard: false,
    departmentRestricted: true, // Can only edit their own department
  },
  'Program Director': {
    canView: true,
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canAccessSettings: true,
    canAccessDashboard: true,
    departmentRestricted: false,
  },
};

/**
 * Check if a user can edit content based on their role and department
 */
export const canUserEdit = (
  userRole: UserRole | null,
  userDepartmentId: number | null,
  contentDepartmentId: number | null
): boolean => {
  if (!userRole) return false;

  const permissions = ROLE_PERMISSIONS[userRole];
  
  if (!permissions.canEdit) return false;
  
  if (!permissions.departmentRestricted) return true;
  
  // For department-restricted roles, check department match
  return userDepartmentId !== null && 
         contentDepartmentId !== null && 
         Number(userDepartmentId) === Number(contentDepartmentId);
};
