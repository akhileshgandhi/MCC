# Role Management System - Implementation Guide

## Overview
This document describes the three-tier role-based access control (RBAC) system implemented across the IEP Portal.

## Roles and Permissions

### 1. IEPEmployesGroup (Read-Only Access)
**SharePoint Group:** `IEPEmployesGroup`

**Permissions:**
- ✅ View all IEPs across all departments
- ✅ View Archived IEPs
- ✅ Download files and export data
- ✅ View IEP details and performance metrics
- ❌ Cannot create new IEPs
- ❌ Cannot edit existing IEPs
- ❌ Cannot delete IEPs
- ❌ No access to Settings/Configuration
- ❌ No access to Dashboard analytics

**Navigation Available:**
- IEPs (Read-Only)
- Archived IEPs (Read-Only)

**Use Case:** Regular employees who need to view and reference IEPs but should not modify any content.

---

### 2. Planning Unit Manager (Department-Specific Access)
**SharePoint Group:** `PlaningUnitManagerGroup`

**Permissions:**
- ✅ View all IEPs across all departments
- ✅ View Archived IEPs
- ✅ Create new IEPs for their assigned department
- ✅ Edit IEPs belonging to their assigned department
- ✅ Delete IEPs belonging to their assigned department
- ✅ Download files and export data
- ❌ Cannot edit IEPs from other departments
- ❌ No access to Settings/Configuration
- ❌ No access to Dashboard analytics

**Navigation Available:**
- IEPs (Department-Restricted Edit)
- Archived IEPs (Read-Only)

**Department Assignment:** Required - Must be assigned to a specific department in the Users list.

**Use Case:** Department managers who manage IEPs for their specific planning unit.

---

### 3. Program Director (Full Access)
**SharePoint Group:** `Program Director`

**Permissions:**
- ✅ View all IEPs across all departments
- ✅ View Archived IEPs
- ✅ Create new IEPs for any department
- ✅ Edit any IEP across all departments
- ✅ Delete any IEP across all departments
- ✅ Full access to Settings/Configuration
- ✅ Access to Dashboard analytics
- ✅ Manage users and their roles
- ✅ Manage departments, alignments, and system settings

**Navigation Available:**
- Dashboard (Analytics)
- IEPs (Full Access)
- Archived IEPs (Read-Only)
- Settings (Full Configuration)

**Department Assignment:** Not required - Has access to all departments.

**Use Case:** System administrators and program directors who oversee the entire IEP system.

---

## Implementation Details

### Files Modified

1. **IconNavigation.tsx**
   - Added `IEPEmployesGroup` case with read-only navigation
   - Shows only IEPs and Archived IEPs (no Settings, no Dashboard)

2. **ScorecardContent.tsx**
   - Updated `canEditDepartment()` and `canEditIEP()` functions
   - Added `isIEPEmployee` check
   - Hidden "Add New IEP" button for IEPEmployesGroup
   - Hidden Edit button in IEP detail view for IEPEmployesGroup

3. **IEPDetailsView.tsx**
   - Hidden "Edit Header" button for non-Program Directors
   - Allows viewing and downloading for all roles

4. **IEPTable.tsx**
   - Edit/Delete buttons automatically hidden via `canEditIEP` check
   - View and Export functions available to all roles

5. **AddEditForm.tsx**
   - Added "IEP Employee (Read Only)" option to Role dropdown
   - Updated validation: Department not required for IEPEmployesGroup
   - Department required only for Planning Unit Manager

6. **IEPSidebarForm.tsx**
   - Updated `isDepartmentEditable` logic
   - Only Program Directors can change department assignments

7. **CustomMetropolitanCollegeDirectory.tsx**
   - Settings menu in profile dropdown already protected (Program Director only)

### Type Definitions

Created `src/types/roles.ts` with:
- `UserRole` type definition
- `USER_ROLES` constants
- `RolePermissions` interface
- `ROLE_PERMISSIONS` mapping
- `canUserEdit()` helper function

---

## SharePoint Setup

### Role Assignment Priority System

**CRITICAL:** The system follows a priority-based role assignment:

1. **Users List (Highest Priority)**
   - If a user exists in the Users SharePoint list, their assigned role takes precedence
   - This applies even if the user is a member of the IEPEmployeeGroup AD group
   - A user in IEPEmployeeGroup AD who is assigned PD or PUM in Users list will perform as PD/PUM

2. **AD Group (Default Fallback)**
   - If a user is NOT in the Users list but IS a member of "MCC Employees" AD group
   - They automatically get "IEPEmployesGroup" role (read-only access)

3. **Access Denied**
   - If a user is neither in Users list nor in the AD group
   - Access is denied with appropriate error message

**Key Rule:** Each user can only have **ONE active role** at a time.

---

### Users List Configuration

The `Users` SharePoint list should have:

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| User | Person | Yes | The SharePoint user |
| Role | Choice | Yes | Options: "Program Director", "Planning Unit Manager", "IEPEmployesGroup" |
| Departments | Lookup | Conditional | Required for "Planning Unit Manager" only |

### Adding Users

1. **For IEP Employees (Read-Only):**
   ```
   - User: [Select user]
   - Role: IEPEmployesGroup
   - Department: [Leave empty or select any - not enforced]
   ```

2. **For Planning Unit Managers:**
   ```
   - User: [Select user]
   - Role: Planning Unit Manager
   - Department: [Required - Select specific department]
   ```

3. **For Program Directors:**
   ```
   - User: [Select user]
   - Role: Program Director
   - Department: [Leave empty - has access to all]
   ```

---

## Permission Logic Flow

### View Access
```typescript
All roles → Can view all IEPs
```

### Create Access
```typescript
IEPEmployesGroup → ❌ No
Planning Unit Manager → ✅ Yes (own department only)
Program Director → ✅ Yes (all departments)
```

### Edit Access
```typescript
IEPEmployesGroup → ❌ No
Planning Unit Manager → ✅ Yes if (IEP.DepartmentId === User.DepartmentId)
Program Director → ✅ Yes (all IEPs)
```

### Delete Access
```typescript
Same as Edit Access
```

### Settings Access
```typescript
IEPEmployesGroup → ❌ No
Planning Unit Manager → ❌ No
Program Director → ✅ Yes
```

---

## Testing Checklist

### For IEPEmployesGroup:
- [ ] Can view IEPs list
- [ ] Can view IEP details
- [ ] Can view Archived IEPs
- [ ] Can export/download data
- [ ] Cannot see "Add New IEP" button
- [ ] Cannot see Edit buttons in IEP table
- [ ] Cannot see Delete buttons in IEP table
- [ ] Cannot see Edit button in IEP detail view
- [ ] Cannot access Settings from IconNavigation
- [ ] Cannot access Dashboard from IconNavigation
- [ ] Cannot access Settings from profile dropdown

### For Planning Unit Manager:
- [ ] Can view all IEPs
- [ ] Can create new IEPs for assigned department
- [ ] Can edit IEPs from assigned department
- [ ] Cannot edit IEPs from other departments
- [ ] Can delete IEPs from assigned department
- [ ] Cannot delete IEPs from other departments
- [ ] Can view Archived IEPs
- [ ] Cannot access Settings
- [ ] Cannot access Dashboard
- [ ] Department is pre-selected and locked when creating IEPs

### For Program Director:
- [ ] Can view all IEPs
- [ ] Can create IEPs for any department
- [ ] Can edit any IEP
- [ ] Can delete any IEP
- [ ] Can access Dashboard
- [ ] Can access Settings
- [ ] Can manage users and roles
- [ ] Can edit system configuration
- [ ] Can edit header text in IEP details

---

## Troubleshooting

### User sees "Access Denied" message
**Cause:** User is not in the Users list
**Solution:** Add the user to the Users list with appropriate role

### Planning Unit Manager can't edit their own department's IEPs
**Cause:** User's department not set in Users list
**Solution:** Ensure the user has a Department assigned in the Users list

### IEP Employee sees edit buttons
**Cause:** Role not properly set or cached
**Solution:** 
1. Verify role in Users list is exactly "IEPEmployesGroup"
2. Clear browser cache
3. Log out and log back in

### Program Director can't access Settings
**Cause:** Role string mismatch
**Solution:** Ensure role is exactly "Program Director" (case-sensitive)

---

## Migration Notes

If upgrading from a system without roles:

1. **Backup** the Users list
2. Add all existing users with "Program Director" role initially
3. Identify Planning Unit Managers and update their roles + assign departments
4. Identify read-only users and set their role to "IEPEmployesGroup"
5. Test each role thoroughly before going live

---

## Future Enhancements

Potential improvements:
- Add audit logging for role-based actions
- Implement row-level security in SharePoint
- Add role-based email notifications
- Create role-specific dashboards
- Add department hierarchy support for Planning Unit Managers

---

## Support

For issues or questions:
1. Check this documentation
2. Review the Troubleshooting section
3. Contact the system administrator
4. Verify SharePoint permissions and group memberships
