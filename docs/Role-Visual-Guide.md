# Role-Based Access Control - Visual Guide

## Role Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                    IEP Portal Users                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ├─────────────────────────────────────┐
                            │                                     │
                ┌───────────▼──────────┐              ┌──────────▼───────────┐
                │  IEPEmployesGroup    │              │  Planning Unit Mgr   │
                │   (Read-Only)        │              │  (Dept-Specific)     │
                └──────────────────────┘              └──────────────────────┘
                │                                     │
                │ • View IEPs                         │ • View All IEPs
                │ • View Archived                     │ • Create (Own Dept)
                │ • Download Files                    │ • Edit (Own Dept)
                │ • Export Data                       │ • Delete (Own Dept)
                │                                     │ • View Archived
                │ ✗ No Create                         │
                │ ✗ No Edit                           │ ✗ No Settings
                │ ✗ No Delete                         │ ✗ No Dashboard
                │ ✗ No Settings                       │
                │ ✗ No Dashboard                      │
                └──────────────────────┘              └──────────────────────┘
                            │                                     │
                            └─────────────┬───────────────────────┘
                                          │
                                ┌─────────▼──────────┐
                                │  Program Director  │
                                │   (Full Access)    │
                                └────────────────────┘
                                │
                                │ • View All IEPs
                                │ • Create (All Depts)
                                │ • Edit (All IEPs)
                                │ • Delete (All IEPs)
                                │ • View Archived
                                │ • Full Settings Access
                                │ • Dashboard Analytics
                                │ • User Management
                                │ • System Configuration
                                └────────────────────┘
```

## Navigation Comparison

### IEPEmployesGroup Navigation
```
┌──────────────┐
│    Menu      │ ← Toggle Sidebar
├──────────────┤
│    IEPs      │ ← Read-Only
├──────────────┤
│   Archive    │ ← Read-Only
└──────────────┘
```

### Planning Unit Manager Navigation
```
┌──────────────┐
│    Menu      │ ← Toggle Sidebar
├──────────────┤
│    IEPs      │ ← Can Edit Own Dept
├──────────────┤
│   Archive    │ ← Read-Only
└──────────────┘
```

### Program Director Navigation
```
┌──────────────┐
│    Menu      │ ← Toggle Sidebar
├──────────────┤
│  Dashboard   │ ← Analytics
├──────────────┤
│    IEPs      │ ← Full Access
├──────────────┤
│   Archive    │ ← Read-Only
├──────────────┤
│   Settings   │ ← Configuration
└──────────────┘
```

## Button Visibility Matrix

### IEP List View

| User Role | Add IEP Button | Edit Button | Delete Button | View Button | Export Button |
|-----------|:--------------:|:-----------:|:-------------:|:-----------:|:-------------:|
| IEPEmployesGroup | ❌ | ❌ | ❌ | ✅ | ✅ |
| Planning Unit Manager | ✅ (Own Dept) | ✅ (Own Dept) | ✅ (Own Dept) | ✅ | ✅ |
| Program Director | ✅ (All) | ✅ (All) | ✅ (All) | ✅ | ✅ |

### IEP Detail View

| User Role | Edit Button | Edit Header Button | Back Button | Discussion |
|-----------|:-----------:|:------------------:|:-----------:|:----------:|
| IEPEmployesGroup | ❌ | ❌ | ✅ | ✅ View Only |
| Planning Unit Manager | ✅ (Own Dept) | ❌ | ✅ | ✅ Full |
| Program Director | ✅ (All) | ✅ | ✅ | ✅ Full |

## Permission Decision Tree

```
User attempts to Edit IEP
         │
         ├──→ Is user "IEPEmployesGroup"?
         │         │
         │         └──→ YES → ❌ DENY
         │         │
         │         └──→ NO → Continue
         │
         ├──→ Is user "Program Director"?
         │         │
         │         └──→ YES → ✅ ALLOW
         │         │
         │         └──→ NO → Continue
         │
         └──→ Is user "Planning Unit Manager"?
                   │
                   └──→ Does IEP.DepartmentId == User.DepartmentId?
                             │
                             ├──→ YES → ✅ ALLOW
                             │
                             └──→ NO → ❌ DENY
```

## Settings Access Flow

```
User clicks Settings
         │
         ├──→ Is user "Program Director"?
         │         │
         │         ├──→ YES → ✅ Show Settings Icon
         │         │           └──→ Access Granted
         │         │
         │         └──→ NO → ❌ Hide Settings Icon
         │                   └──→ Access Denied
         │
         └──→ Settings in Profile Dropdown
                   │
                   └──→ Only rendered if userRole == "Program Director"
```

## Data Access Patterns

### Read Access (View IEPs)
```
┌─────────────────────────┐
│   All Users             │
│   ✅ IEPEmployesGroup   │
│   ✅ Planning Unit Mgr  │
│   ✅ Program Director   │
└─────────────────────────┘
         │
         ▼
   Fetch All IEPs
         │
         ▼
   Display in List
```

### Write Access (Create/Edit IEP)
```
┌─────────────────────────┐
│   User Action           │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Check canEditIEP()      │
└─────────────────────────┘
         │
         ├──→ IEPEmployesGroup → ❌ Return FALSE
         │
         ├──→ Program Director → ✅ Return TRUE
         │
         └──→ Planning Unit Mgr
                   │
                   └──→ Check Department Match
                             │
                             ├──→ Match → ✅ Return TRUE
                             │
                             └──→ No Match → ❌ Return FALSE
```

## SharePoint Users List Structure

```
Users List
├── User (Person/Group field)
│   └── Single user selection
│
├── Role (Choice field)
│   ├── "Program Director"
│   ├── "Planning Unit Manager"
│   └── "IEPEmployesGroup"
│
└── Departments (Lookup field)
    ├── Required for: "Planning Unit Manager"
    └── Optional for: Others
```

## User Journey Examples

### Example 1: IEP Employee (Read-Only)
```
1. User logs in
2. System checks Users list → Role = "IEPEmployesGroup"
3. Navigation shows: Menu, IEPs, Archive (no Settings, no Dashboard)
4. User navigates to IEPs
5. Sees list of all IEPs (no Add button)
6. Clicks to view IEP detail (no Edit button)
7. Can export/download data
8. Cannot modify anything
```

### Example 2: Planning Unit Manager (Finance Dept)
```
1. User logs in
2. System checks Users list → Role = "Planning Unit Manager", Dept = "Finance"
3. Navigation shows: Menu, IEPs, Archive
4. User navigates to IEPs
5. Sees "Add New IEP" button
6. Creates new IEP → Department auto-set to "Finance" (locked)
7. Can edit Finance dept IEPs (Edit button visible)
8. Cannot edit IEPs from HR dept (Edit button hidden)
9. Delete works only for Finance dept IEPs
```

### Example 3: Program Director
```
1. User logs in
2. System checks Users list → Role = "Program Director"
3. Navigation shows: Menu, Dashboard, IEPs, Archive, Settings
4. Has full access to Dashboard analytics
5. Can create IEPs for any department
6. Can edit any IEP (Edit button always visible)
7. Can delete any IEP
8. Can access Settings to manage users, departments, etc.
9. Can edit system configuration and header text
```

## Key Code Locations

### Permission Checks
- `ScorecardContent.tsx` - Lines 274-296
  - `isProgramDirector`
  - `isPlanningUnitManager`
  - `isIEPEmployee`
  - `canEditDepartment()`
  - `canEditIEP()`

### Navigation Control
- `IconNavigation.tsx` - Lines 38-159
  - Role-based switch statement
  - Conditional icon rendering

### Role Types
- `src/types/roles.ts`
  - Type definitions
  - Permission mappings
  - Helper functions

### Role Assignment
- `AddEditForm.tsx` - Lines 283-299
  - Role dropdown with 3 options
  - Department requirement logic

## Testing Scenarios

| Scenario | IEPEmployesGroup | Planning Unit Mgr | Program Director |
|----------|:----------------:|:-----------------:|:----------------:|
| View IEPs from all depts | ✅ | ✅ | ✅ |
| Create IEP for Finance | ❌ | ✅ (if assigned to Finance) | ✅ |
| Edit IEP from HR | ❌ | ❌ (if not assigned to HR) | ✅ |
| Delete any IEP | ❌ | ❌ (only own dept) | ✅ |
| Access Settings | ❌ | ❌ | ✅ |
| View Dashboard | ❌ | ❌ | ✅ |
| Export/Download | ✅ | ✅ | ✅ |
| View Archived IEPs | ✅ | ✅ | ✅ |

---

**Legend:**
- ✅ = Allowed/Visible
- ❌ = Denied/Hidden
- (condition) = Conditional access based on specific criteria
