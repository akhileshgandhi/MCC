# Role Priority Implementation - User Role Assignment

## 📋 Overview

यह document role assignment की priority system को explain करता है। अब system में **Users List** को highest priority दी गई है।

## 🎯 Requirement

**Hindi:** एक user को सिर्फ एक role ही assign हो सकता है और यदि वो user IEPEmployeeGroup में है और यदि उस user को PD या PUM Role मिलता है तो वो as PD/PUM perform करेगा।

**English:** A user can only be assigned one role, and if that user is in IEPEmployeeGroup AND gets PD or PUM Role, then they will perform as PD/PUM.

## 🔄 Role Assignment Priority

### Priority Order:

```
1. Users SharePoint List (HIGHEST PRIORITY)
   ├── Program Director
   ├── Planning Unit Manager  
   └── IEPEmployesGroup
   
2. AD Group "MCC Employees" (DEFAULT FALLBACK)
   └── IEPEmployesGroup (read-only)
   
3. No Access (DENIED)
   └── Access Denied Message
```

## 💡 How It Works

### Scenario 1: User in Users List
```
User: John Doe
In AD Group: Yes (MCC Employees)
In Users List: Yes
Assigned Role: Program Director

✅ Result: User gets "Program Director" role
   (Users List overrides AD group membership)
```

### Scenario 2: User NOT in Users List but in AD Group
```
User: Jane Smith
In AD Group: Yes (MCC Employees)
In Users List: No

✅ Result: User gets "IEPEmployesGroup" role (default read-only)
   (AD group provides fallback access)
```

### Scenario 3: User in Neither
```
User: Guest User
In AD Group: No
In Users List: No

❌ Result: Access Denied
   (No access granted)
```

### Scenario 4: IEPEmployee Group Member with PD Role
```
User: Admin User
In AD Group: Yes (MCC Employees - IEPEmployeeGroup)
In Users List: Yes
Assigned Role: Program Director

✅ Result: User performs as "Program Director"
   (Users List role takes priority over AD group)
```

### Scenario 5: IEPEmployee Group Member with PUM Role
```
User: Department Manager
In AD Group: Yes (MCC Employees - IEPEmployeeGroup)
In Users List: Yes
Assigned Role: Planning Unit Manager
Department: Finance

✅ Result: User performs as "Planning Unit Manager" for Finance dept
   (Users List role takes priority over AD group)
```

## 🔧 Implementation Details

### File Modified:
- **CustomMetropolitanCollegeDirectory.tsx** - `getUserRole()` function

### Logic Flow:

```typescript
async getUserRole() {
  1. Get current user
  
  2. Check Users SharePoint List first
     ├── IF user found → Use assigned role (PD/PUM/IEPEmployesGroup)
     └── RETURN immediately
  
  3. IF NOT in Users List → Check AD Group
     ├── IF in "MCC Employees" → Set role as "IEPEmployesGroup"
     └── ELSE → Deny access
}
```

### Previous Logic (OLD):
```typescript
// OLD: AD group check first, then Users list
1. Check AD Group
   ├── IF in AD Group → Set IEPEmployesGroup
   └── ELSE → Check Users List
```

### New Logic (CURRENT):
```typescript
// NEW: Users List first, then AD group fallback
1. Check Users List FIRST
   ├── IF found → Use that role (PRIORITY)
   └── ELSE → Check AD Group → Set IEPEmployesGroup or Deny
```

## 🎯 Key Benefits

1. **✅ Single Role per User**: Each user has exactly one active role
2. **✅ Users List Priority**: Admins can override AD group membership
3. **✅ Flexible Assignment**: IEP employees can be elevated to PD/PUM
4. **✅ Default Fallback**: AD group provides automatic read-only access
5. **✅ Granular Control**: Admin has full control via Users list

## 📊 Example Use Cases

### Use Case 1: Promote IEP Employee to Manager
```
Situation: Jane is in IEPEmployeeGroup but needs to manage Finance dept

Solution:
1. Add Jane to Users list
2. Set Role: Planning Unit Manager
3. Set Department: Finance

Result: Jane now performs as Planning Unit Manager (not read-only)
```

### Use Case 2: Temporary Admin Access
```
Situation: John is in IEPEmployeeGroup but needs temporary admin access

Solution:
1. Add John to Users list
2. Set Role: Program Director

Result: John now has full admin access
(Remove from Users list later to revert to read-only)
```

### Use Case 3: New Employee Auto-Access
```
Situation: New employee needs basic read access

Solution:
1. Add to "MCC Employees" AD group only
2. No entry in Users list needed

Result: Auto gets "IEPEmployesGroup" (read-only)
```

## 🔍 Testing Scenarios

### Test 1: Users List Priority
```powershell
User: test@mcckc.edu
AD Group: MCC Employees (✅)
Users List: Program Director

Expected: Program Director permissions
Actual: Program Director permissions ✅
```

### Test 2: AD Fallback
```powershell
User: employee@mcckc.edu
AD Group: MCC Employees (✅)
Users List: Not present

Expected: IEPEmployesGroup (read-only)
Actual: IEPEmployesGroup (read-only) ✅
```

### Test 3: Access Denied
```powershell
User: guest@external.com
AD Group: Not a member (❌)
Users List: Not present

Expected: Access Denied
Actual: Access Denied ✅
```

## 📝 Admin Guidelines

### Adding Users with Elevated Access:

1. **Navigate to:** Site Contents → Users List
2. **Click:** New Item
3. **Fill:**
   - User: [Select person]
   - Role: [Program Director / Planning Unit Manager / IEPEmployesGroup]
   - Department: [Required for Planning Unit Manager only]
4. **Save**

### Revoking Elevated Access:

1. **Option 1:** Delete user from Users list (they revert to AD group role)
2. **Option 2:** Change their role to "IEPEmployesGroup" in Users list

## ⚠️ Important Notes

- **Role names are case-sensitive**: Use exact strings as defined
- **One role per user**: System enforces single active role
- **Users List overrides AD**: Admin has full control
- **Department required**: Only for Planning Unit Manager role
- **Changes take effect**: On next page load / login

## 🔒 Security Considerations

1. **Principle of Least Privilege**: Default role is read-only (IEPEmployesGroup)
2. **Explicit Elevation**: Admin must explicitly add users for PD/PUM roles
3. **Audit Trail**: Users list provides clear record of role assignments
4. **Revocable Access**: Easy to remove elevated permissions

## 📞 Support

For questions or issues:
1. Check user's entry in Users SharePoint list
2. Verify exact role spelling (case-sensitive)
3. Confirm AD group membership if using default access
4. Clear browser cache and re-login if changes not reflecting

---

**Last Updated:** February 3, 2026
**Implementation Status:** ✅ Complete and Tested
