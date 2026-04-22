// import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
// import AddEditForm from './forms/AddEditForm';
// import UsersTable from './DataTable/UsersTable';
// import OrgGoalsTable from './DataTable/OrgGoalsTable';
// import HlcCriteriaTable from './DataTable/HlcCriteriaTable';
// import SharedServicesTable from './DataTable/SharedServicesTable';
// import SidebarMenu from './SidebarMenu';
// import TableHeader from './TableHeader';
// import DepartmentsTable from './DataTable/DepartmentsTable';
// import DefinitionsDataTable from './DataTable/DefinitionsDataTable';
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import Swal from 'sweetalert2';
// import "./DataTable/Settings.scss";
// import SubdepartmentsTable from './DataTable/SubdepartmentsTable';
// import SubSubdepartmentsTable from './DataTable/SubSubdepartmentsTable';
// import GlobalGoalsTable from './DataTable/GlobalGoalsTable';
// import { Edit2, Trash2 } from 'lucide-react';
// import { getADGroupMembers } from '../../../APIsServices/GraphService';

// const SettingsContent = ({ sp, graph }: any) => {
//   // ────────────────────── State ──────────────────────
//   const [activeMenu, setActiveMenu] = useState('users');
//   const [showForm, setShowForm] = useState(false);
//   const [editingId, setEditingId] = useState<number | null>(null);
//   const [formData, setFormData] = useState<Record<string, any>>({});
//   const [currentForm, setCurrentForm] = useState('');
//   const [fields, setFields] = useState<any[]>([]);

//   // ────────────────────── Data ──────────────────────
//   const [departments, setDepartments] = useState<any[]>([]);
//   const [orgGoals, setOrgGoals] = useState<any[]>([]);
//   const [hlcCriteria, setHlcCriteria] = useState<any[]>([]);
//   const [users, setUsers] = useState<any[]>([]);
//   const [sharedServices, setSharedServices] = useState<any[]>([]);
//   const [tags, setTags] = useState<any[]>([]);
//   const [definitions, setDefinitions] = useState<any[]>([]);
//   const [globalGoals, setGlobalGoals] = useState<any[]>([]);
//   const [siteUsers, setSiteUsers] = useState<{ id: number; title: string }[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [subdepartments, setSubDepartments] = useState<any[]>([]);
//   const [subsubdepartments, setSubSubDepartments] = useState<any[]>([]);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   // const [Tags, setTags] = useState([]); // new master tag state
//   // ────────────────────── Memoized list config ──────────────────────
//   const listConfig = useMemo(() => ({
//     departments: {
//       listName: 'Departments',
//       fields: ['Id', 'DepartmentName', 'HeadOfDepartment/Title', 'HeadOfDepartment/Id', 'DepartmentShortName', 'Vision', 'Mission'],
//       expand: ['HeadOfDepartment'],
//       map: (item: any) => ({
//         Id: item.Id,
//         DepartmentName: item.DepartmentName,
//         HeadOfDepartment: item.HeadOfDepartment?.Title || '',
//         HeadOfDepartmentId: item.HeadOfDepartment?.Id || null,
//         DepartmentShortName: item.DepartmentShortName,
//         Vision: item.Vision || '',
//         Mission: item.Mission || '',
//       })
//     },
//     subdepartments: {
//       listName: 'SubDepartments',
//       fields: [
//         'Id',
//         'SubDepartmentName',
//         'Remark',
//         'Departments/Id',
//         'Departments/DepartmentName',
//         'Departments/DepartmentShortName'
//       ],
//       expand: ['Departments'],
//       map: (item: any) => ({
//         Id: item.Id,
//         SubDepartmentName: item.SubDepartmentName || '',
//         Remark: item.Remark || '',
//         DepartmentId: item.Departments?.Id || null,
//         DepartmentName: item.Departments?.DepartmentName || '',
//         DepartmentShortName: item.Departments?.DepartmentShortName || ''
//       })
//     },
//     subsubdepartments: {
//       listName: 'SubSubDepartments',
//       fields: [
//         'Id',
//         'SubSubDepartmentName',
//         'Remark',
//         'SubDepartments/Id',
//         'SubDepartments/SubDepartmentName'
//       ],
//       expand: ['SubDepartments'],
//       map: (item: any) => ({
//         Id: item.Id,
//         SubSubDepartmentName: item.SubSubDepartmentName || '',
//         Remark: item.Remark || '',
//         SubDepartmentId: item.SubDepartments?.Id || null,
//         SubDepartmentName: item.SubDepartments?.SubDepartmentName || '',
//       })
//     },
//     orgGoalAlignment: {
//       listName: 'OrganizationGoalAlignment',
//       fields: ['Id', 'OrganizationalGoalAlignment', 'Value', 'Tag'],
//       map: (item: any) => ({
//         Id: item.Id,
//         OrganizationalGoalAlignment: item.OrganizationalGoalAlignment,
//         Value: item.Value || '',
//         Tag: item.Tag || ''
//       })
//     },
//     hlcCriteria: {
//       listName: 'HLCAlignment',
//       fields: ['Id', 'HLCAlignment', 'Description'],
//       map: (item: any) => ({
//         Id: item.Id,
//         HLCAlignment: item.HLCAlignment,
//         Description: item.Description || ''
//       })
//     },
//     users: {
//       listName: 'Users',
//       fields: [
//         'Id',
//         'User/Title',
//         'User/Id',
//         'User/EMail',
//         'Role',
//         'Departments/Id',
//         'Departments/DepartmentName'
//       ],
//       expand: ['User', 'Departments'],
//       map: (item: any) => ({
//         Id: item.Id,
//         UserName: item.User?.Title || '',
//         UserEmail: item.User?.EMail || '',
//         UserId: item.User?.Id || null,
//         Role: item.Role || '',
//         DepartmentsId: item.Departments?.Id || null,   // ← CONSISTENT KEY
//         DepartmentName: item.Departments?.DepartmentName || ''
//       })
//     },
//     sharedServices: {
//       listName: 'SharedServiceCampusGoalAlignment',
//       fields: ['Id', "ThreeYRSharedService", 'Departments/Id', 'Departments/DepartmentName'],
//       expand: ['Departments'],
//       map: (item: any) => ({
//         Id: item.Id,
//         ThreeYRSharedService: item.ThreeYRSharedService || '',
//         DepartmentsId: item.Departments?.Id || null,
//         DepartmentName: item.Departments?.DepartmentName || ''
//       })
//     },
//     // New masterTag config (simple list with Title)
//     Tag: {
//       listName: 'Tags',
//       fields: ['Id', 'Tag'],
//       map: (item) => ({
//         Id: item.Id,
//         Tag: item.Tag || ''
//       })
//     },
//     definitions: {
//       listName: 'Definitions',
//       fields: ['Id', 'Term', 'Definition', 'Section'],
//       map: (item: any) => ({
//         Id: item.Id,
//         Term: item.Term || '',
//         Definition: item.Definition || '',
//         Section: item.Section || ''
//       })
//     },
//     globalGoals: {
//       listName: 'OrganizationalGoals',
//       fields: ['Id', 'ScorecardName', 'Year', 'GlobalGoal', 'Mission'],
//       map: (item: any) => ({
//         Id: item.Id,
//         ScorecardName: item.ScorecardName || '',
//         Year: item.Year || '',
//         GlobalGoal: item.GlobalGoal || '',
//         Mission: item.Mission || ''
//       })
//     }
//   }), []);

//   const menuLabels = useMemo(() => ({
//     users: 'Users',
//     subdepartments: 'SubDepartments',
//     subsubdepartments: 'SubSubDepartments',
//     departments: 'Departments',
//     orgGoalAlignment: 'Organizational Goal Alignment',
//     hlcCriteria: 'HLC Criteria',
//     sharedServices: 'Shared Service/Campus Goals',
//     tags: 'Tags',
//     definitions: 'Definitions',
//     globalGoals: 'Global Goals'
//   }), []);

//   const dataSetters = useMemo(() => ({
//     departments: setDepartments,
//     subdepartments: setSubDepartments,
//     subsubdepartments: setSubSubDepartments,
//     orgGoalAlignment: setOrgGoals,
//     hlcCriteria: setHlcCriteria,
//     users: setUsers,
//     sharedServices: setSharedServices,
//     tags: setTags,
//     definitions: setDefinitions,
//     globalGoals: setGlobalGoals
//   }), []);

//   const originalDataRef = useRef<Record<string, any>>({});

//   // ────────────────────── Load all data + site users ──────────────────────
//   useEffect(() => {
//     let isMounted = true;

//     const fetchAll = async () => {
//       if (!sp || !sp.web) return;

//       setLoading(true);

//       try {
//         const keys = [
//           "departments",
//           "subdepartments",
//           "subsubdepartments",
//           "orgGoalAlignment",
//           "hlcCriteria",
//           "users",
//           "sharedServices",
//           "tags",
//           "definitions",
//           "globalGoals"
//         ];

//         const listResults = await Promise.all(
//           keys.map(async (key) => {
//             let res = [];
//             try {
//               switch (key) {
//                 case "departments":
//                   res = await sp.web.lists
//                     .getByTitle("Departments")
//                     .items.select(
//                       "Id",
//                       "DepartmentName",
//                       "HeadOfDepartment/Title",
//                       "HeadOfDepartment/Id",
//                       "DepartmentShortName",
//                       "Vision",
//                       "Mission"
//                     ).orderBy("DepartmentName", true)
//                     .expand("HeadOfDepartment")();
//                   res = res.map((item) => ({
//                     Id: item.Id,
//                     DepartmentName: item.DepartmentName,
//                     HeadOfDepartment: item.HeadOfDepartment?.Title || "",
//                     HeadOfDepartmentId: item.HeadOfDepartment?.Id || null,
//                     DepartmentShortName: item.DepartmentShortName,
//                     Vision: item.Vision || "",
//                     Mission: item.Mission || "",
//                   }));
//                   break;

//                 case "subdepartments":
//                   res = await sp.web.lists
//                     .getByTitle("SubDepartments")
//                     .items.select(
//                       "Id",
//                       "SubDepartmentName",
//                       "Remark",
//                       "Departments/Id",
//                       "Departments/DepartmentName",
//                       "Departments/DepartmentShortName"
//                     ).orderBy("SubDepartmentName", true)
//                     .expand("Departments")();
//                   res = res.map((item) => ({
//                     Id: item.Id,
//                     SubDepartmentName: item.SubDepartmentName || "",
//                     Remark: item.Remark || "",
//                     DepartmentId: item.Departments?.Id || null,
//                     DepartmentName: item.Departments?.DepartmentName || "",
//                     DepartmentShortName: item.Departments?.DepartmentShortName || ""
//                   }));
//                   break;

//                 case "subsubdepartments":
//                   res = await sp.web.lists
//                     .getByTitle("SubSubDepartments")
//                     .items.select(
//                       "Id",
//                       "SubSubDepartmentName",
//                       "Remark",
//                       "SubDepartments/Id",
//                       "SubDepartments/SubDepartmentName"
//                     ).orderBy("SubDepartments/SubDepartmentName", true)
//                     .expand("SubDepartments")();
//                   res = res.map((item) => ({
//                     Id: item.Id,
//                     SubSubDepartmentName: item.SubSubDepartmentName || "",
//                     Remark: item.Remark || "",
//                     SubDepartmentId: item.SubDepartments?.Id || null,
//                     SubDepartmentName: item.SubDepartments?.SubDepartmentName || "",
//                   }));
//                   break;

//                 case "orgGoalAlignment":
//                   res = await sp.web.lists
//                     .getByTitle("OrganizationGoalAlignment")
//                     .items.select("Id", "OrganizationalGoalAlignment", "Value", "Tag").orderBy("OrganizationalGoalAlignment", true)();
//                   res = res.map((item) => ({
//                     Id: item.Id,
//                     OrganizationalGoalAlignment: item.OrganizationalGoalAlignment,
//                     Value: item.Value || "",
//                     Tag: item.Tag || "",
//                   }));
//                   break;

//                 case "hlcCriteria":
//                   res = await sp.web.lists
//                     .getByTitle("HLCAlignment")
//                     .items.select("Id", "HLCAlignment", "Description").orderBy("Id", true)();
//                   res = res.map((item) => ({
//                     Id: item.Id,
//                     HLCAlignment: item.HLCAlignment,
//                     Description: item.Description || "",
//                   }));
//                   break;

//                 case "users":
//                   res = await sp.web.lists
//                     .getByTitle("Users")
//                     .items.select(
//                       "Id",
//                       "User/Title",
//                       "User/Id",
//                       "User/EMail",
//                       "Role",
//                       "Departments/Id",
//                       "Departments/DepartmentName"
//                     ).orderBy("User/Title", true)
//                     .expand("User", "Departments")();

//                   res = res.map((item) => ({
//                     Id: item.Id,
//                     UserName: item.User?.Title || "",
//                     UserEmail: item.User?.EMail || "",
//                     UserId: item.User?.Id || null,
//                     Role: item.Role || "",
//                     DepartmentsId: item.Departments?.Id || null,   // ← CONSISTENT
//                     DepartmentName: item.Departments?.DepartmentName || "",
//                   }));

//                   console.log(res, 'resuser>>');


//                   break;

//                 case "sharedServices":
//                   res = await sp.web.lists
//                     .getByTitle("SharedServiceCampusGoalAlignment")
//                     .items.select(
//                       "Id",
//                       "ThreeYRSharedService",
//                       "Departments/Id",
//                       "Departments/DepartmentName"
//                     )
//                     .expand("Departments")();
//                   res = res.map((item) => ({
//                     Id: item.Id,
//                     ThreeYRSharedService: item.ThreeYRSharedService || "",
//                     DepartmentsId: item.Departments?.Id || null,
//                     DepartmentName: item.Departments?.DepartmentName || "",
//                   }));
//                   break;

//                 case "tags":
//                   // Simple MasterTag list with Title
//                   res = await sp.web.lists
//                     .getByTitle("Tags")
//                     .items.select("Id", "Tag")();
//                   res = res.map((item) => ({
//                     Id: item.Id,
//                     Tag: item.Tag || ''
//                   }));
//                   break;

//                 case "definitions":
//                   res = await sp.web.lists
//                     .getByTitle("Definitions")
//                     .items.select("Id", "Term", "Definition", "Section")();
//                   res = res.map((item) => ({
//                     Id: item.Id,
//                     Term: item.Term || '',
//                     Definition: item.Definition || '',
//                     Section: item.Section || ''
//                   }));
//                   break;

//                 case "globalGoals":
//                   res = await sp.web.lists
//                     .getByTitle("OrganizationalGoals")
//                     .items.select("Id", "ScorecardName", "Year", "GlobalGoal", "Mission")
//                     .orderBy("Year", false)();
//                   res = res.map((item) => ({
//                     Id: item.Id,
//                     ScorecardName: item.ScorecardName || '',
//                     Year: item.Year || '',
//                     GlobalGoal: item.GlobalGoal || '',
//                     Mission: item.Mission || ''
//                   }));
//                   break;
//               }

//               return { key, data: res };
//             } catch (err) {
//               console.error(`Error loading ${key}:`, err);
//               return { key, data: [] };
//             }
//           })
//         );

//         if (!isMounted) return;

//         const updates: any = {};
//         listResults.forEach(({ key, data }) => (updates[key] = data));

//         const userList = updates.users || [];

//         const siteUsers = await sp.web.siteUsers();
//         const onlyUsers = siteUsers.filter((u: any) => u.PrincipalType === 1);
//         const formattedUsers = onlyUsers.map((u: any) => ({
//           id: u.Id,
//           title: u.Title,
//           email: u.EMail
//         }));

//         // Get MCC Employees AD group members
//         let mccEmployees: any[] = [];
//         if (graph) {
//           try {
//             mccEmployees = await getADGroupMembers(graph, 'MCC Employees');
//             console.log('MCC Employees from AD group:', mccEmployees);
//           } catch (error) {
//             console.error('Error fetching MCC Employees group:', error);
//           }
//         }

//         // Merge site users with MCC Employees group members (avoiding duplicates by email and title)
//         const allUsers = [...formattedUsers];
//         mccEmployees.forEach((mccUser: any) => {
//           // Check for duplicates by email (primary check) or by name (secondary check)
//           const existsByEmail = allUsers.some(u => 
//             u.email?.toLowerCase().trim() === mccUser.email?.toLowerCase().trim()
//           );
          
//           const existsByName = allUsers.some(u => 
//             u.title?.toLowerCase().trim() === mccUser.title?.toLowerCase().trim()
//           );
          
//           // Only add if user doesn't exist by either email or name
//           if (!existsByEmail && !existsByName && mccUser.email && mccUser.title) {
//             // Add MCC employee with a synthetic ID (using a prefix to avoid conflicts)
//             allUsers.push({
//               id: `mcc_${mccUser.id}`,
//               title: mccUser.title,
//               email: mccUser.email
//             });
//             console.log(`Added MCC Employee: ${mccUser.title} (${mccUser.email})`);
//           } else {
//             console.log(`Skipped duplicate user: ${mccUser.title} (${mccUser.email})`);
//           }
//         });

//         setSiteUsers(allUsers);
//         setDepartments(updates.departments || []);
//         setSubDepartments(updates.subdepartments || []);
//         setSubSubDepartments(updates.subsubdepartments || []);
//         setOrgGoals(updates.orgGoalAlignment || []);
//         setHlcCriteria(updates.hlcCriteria || []);
//         setUsers(userList);
//         setSharedServices(updates.sharedServices || []);
//         setTags(updates.tags || []);
//         setDefinitions(updates.definitions || []);
//         setGlobalGoals(updates.globalGoals || []);
//       } catch (err) {
//         console.error("Fetch error:", err);
//         if (isMounted) toast.error("Failed to load data from SharePoint.");
//       } finally {
//         if (isMounted) setLoading(false);
//       }
//     };

//     fetchAll();

//     return () => {
//       isMounted = false;
//     };
//   }, [sp]);

//   // ────────────────────── Load form fields ──────────────────────
//   useEffect(() => {
//     let isMounted = true;

//     const loadFields = async () => {
//       if (!currentForm || !listConfig[currentForm]) {
//         if (isMounted) setFields([]);
//         return;
//       }

//       const listName = listConfig[currentForm].listName;

//       try {
//         const res = await sp.web.lists
//           .getByTitle(listName)
//           .fields.filter(
//             "Hidden eq false and ReadOnlyField eq false and " +
//             "InternalName ne 'ContentType' and InternalName ne 'Attachments'"
//           )();

//         const dynamicFields = res
//           .map((f: any) => {
//             const field: any = {
//               name: f.InternalName,
//               label: f.Title || f.InternalName,
//               type: 'text',
//             };

//             switch (f.TypeAsString) {
//               case 'Note': field.type = 'textarea'; break;
//               case 'Choice': field.type = 'select'; field.options = f.Choices || []; break;
//               case 'MultiChoice': field.type = 'multiselect'; field.options = f.Choices || []; break;
//               case 'User': field.type = 'user'; break;
//               case 'UserMulti': field.type = 'usermulti'; break;
//               case 'Lookup':
//                 field.type = 'lookup';
//                 const listId = f.LookupList ? f.LookupList.replace(/[{}]/g, '') : null;
//                 if (listId) field.lookupList = listId;
//                 break;
//               case 'LookupMulti':
//                 field.type = 'lookupmulti';
//                 const listIdMulti = f.LookupList ? f.LookupList.replace(/[{}]/g, '') : null;
//                 if (listIdMulti) field.lookupList = listIdMulti;
//                 break;
//             }

//             return field;
//           })
//           .filter(
//             (f: any) =>
//               f.name !== 'ID' &&
//               f.name !== 'Id' &&
//               f.name !== 'ContentType' &&
//               f.name !== 'Attachments' &&
//               f.name !== 'Title' &&
//               !f.name.startsWith('_')
//           );

//         if (isMounted) setFields(dynamicFields);
//       } catch (err) {
//         console.error('Field load error:', err);
//         if (isMounted) setFields([]);
//       }
//     };

//     if (currentForm && sp) loadFields();

//     return () => { isMounted = false; };
//   }, [currentForm, sp, listConfig]);

//   // ────────────────────── Refresh data callback ──────────────────────
//   const refreshData = useCallback(async (menu: string) => {
//     const cfg = listConfig[menu];
//     if (!cfg) return;

//     try {
//       const res = await sp.web.lists
//         .getByTitle(cfg.listName)
//         .items.select(...cfg.fields)
//         .expand(...(cfg.expand || []))();

//       dataSetters[menu]?.(res.map(cfg.map));
//     } catch (err) {
//       console.error('Refresh error:', err);
//     }
//   }, [sp, listConfig, dataSetters]);

//   // ────────────────────── CRUD Handlers ──────────────────────
//   const handleAdd = useCallback(() => {
//     setCurrentForm(activeMenu);
//     setShowForm(true);
//     setEditingId(null);
//     setFormData({});
//     originalDataRef.current = {};
//   }, [activeMenu]);

//   const handleEdit = useCallback((item: any) => {
//     setCurrentForm(activeMenu);
//     setShowForm(true);
//     setEditingId(item.Id);
//     setFormData({ ...item });
//     originalDataRef.current = { ...item };
//   }, [activeMenu]);

//   const handleDelete = useCallback(async (id: number) => {
//     const confirmResult = await Swal.fire({
//       title: 'Are you sure?',
//       text: 'Do you want to delete this item?',
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonColor: '#d33',
//       cancelButtonColor: '#3085d6',
//       confirmButtonText: 'Yes, delete it!',
//     });

//     if (!confirmResult.isConfirmed) return;

//     const cfg = listConfig[activeMenu];

//     try {
//       await sp.web.lists.getByTitle(cfg.listName).items.getById(id).delete();
//       toast.success('Record deleted successfully.');
//       refreshData(activeMenu);
//     } catch (err: any) {
//       toast.error('Delete failed: ' + err.message);
//     }
//   }, [activeMenu, sp, listConfig, refreshData]);

//   // ─── Add user to SharePoint site group ─────────────────────
//   const addUserToSiteGroup = async (userEmail: string, role: string): Promise<number> => {
//     try {
//       let groupName = '';
      
//       switch (role) {
//         case 'Program Director':
//           groupName = 'Program Director';
//           break;
//         case 'Planning Unit Manager':
//           // Check if the group exists, if not use a fallback
//           groupName = 'Planning Unit Manager'; // Try this first
//           break;
//         default:
//           throw new Error(`No group mapping found for role: ${role}`);
//       }

//       console.log(`Adding user ${userEmail} to group ${groupName}`);
      
//       // First, try to ensure the user exists in site users
//       let userId: number;
      
//       try {
//         // Try to get user by email first
//         const existingUser = await sp.web.siteUsers.getByEmail(userEmail)();
//         userId = existingUser.Id;
//         console.log(`User ${userEmail} already exists with ID: ${userId}`);
//       } catch (userError: any) {
//         console.log(`User not found in site users, trying to add: ${userEmail}`);
        
//         try {
//           // Try to ensure user exists in site users by adding them
//           const addedUser = await sp.web.ensureUser(userEmail);
//           userId = addedUser.data.Id;
//           console.log(`User ${userEmail} added to site users with ID: ${userId}`);
//         } catch (ensureError: any) {
//           console.error('Failed to ensure user exists:', ensureError);
//           throw new Error(`Cannot add user ${userEmail} to SharePoint. User might not exist in AD or email format is incorrect.`);
//         }
//       }
      
//       // Now try to add user to the specific group
//       try {
//         await sp.web.siteGroups.getByName(groupName).users.add(userEmail);
//         console.log(`User ${userEmail} successfully added to group ${groupName}`);
//       } catch (groupError: any) {
//         console.log(`Group error for ${groupName}:`, groupError.message);
        
//         // Try alternative group names or create fallback
//         if (role === 'Planning Unit Manager') {
//           const alternativeGroups = ['PlaningUnitManagerGroup', 'Planning Unit Managers', 'Members'];
          
//           for (const altGroup of alternativeGroups) {
//             try {
//               console.log(`Trying alternative group: ${altGroup}`);
//               await sp.web.siteGroups.getByName(altGroup).users.add(userEmail);
//               console.log(`User ${userEmail} successfully added to alternative group ${altGroup}`);
//               break;
//             } catch (altError: any) {
//               console.log(`Alternative group ${altGroup} also failed:`, altError.message);
//               continue;
//             }
//           }
//         } else {
//           // For Program Director, if the specific group doesn't exist, try Members group
//           try {
//             console.log('Trying Members group as fallback');
//             await sp.web.siteGroups.getByName('Members').users.add(userEmail);
//             console.log(`User ${userEmail} added to Members group as fallback`);
//           } catch (fallbackError: any) {
//             console.log('Members group fallback also failed:', fallbackError.message);
//             // Just continue with the user ID we have
//           }
//         }
//       }
      
//       return userId;
      
//     } catch (error: any) {
//       console.error(`Error in addUserToSiteGroup:`, error);
//       throw error;
//     }
//   };

//   // ────────────────────────────────────────────────────────────────────────
//   //  Helper – returns only changed fields (for PATCH)
//   // ────────────────────────────────────────────────────────────────────────
//   const changedFields = useCallback((): Record<string, any> => {
//     const diff: Record<string, any> = {};
//     Object.keys(formData).forEach(k => {
//       if (JSON.stringify(formData[k]) !== JSON.stringify(originalDataRef.current[k])) {
//         diff[k] = formData[k];
//       }
//     });
//     return diff;
//   }, [formData]);

//   // ────────────────────────────────────────────────────────────────────────
//   //  Payload builders
//   // ────────────────────────────────────────────────────────────────────────
//   const buildDepartmentsPayload = useCallback((): any => {
//     if (editingId) {
//       const diff = changedFields();
//       if ('HeadOfDepartment' in diff || 'HeadOfDepartmentId' in diff) {
//         if (diff.HeadOfDepartmentId != null) {
//           diff.HeadOfDepartmentId = Number(diff.HeadOfDepartmentId);
//         }
//         delete diff.HeadOfDepartment;
//       }
//       // Remove email fields that are only for internal use
//       delete diff.HeadOfDepartmentIdEmail;
//       return diff;
//     } else {
//       const payload: any = { ...formData };
//       delete payload.HeadOfDepartment;
//       delete payload.HeadOfDepartmentIdEmail; // Remove email field
//       delete payload.Id;
//       if (payload.HeadOfDepartmentId != null) {
//         payload.HeadOfDepartmentId = Number(payload.HeadOfDepartmentId);
//       }
//       return payload;
//     }
//   }, [editingId, formData, changedFields]);

//   const buildSubdepartmentsPayload = useCallback((): any => {
//     if (editingId) {
//       const diff = changedFields();
//       if ('DepartmentId' in diff || 'departmentId' in diff || 'Departments' in diff) {
//         const deptId = diff.DepartmentId || diff.departmentId;
//         diff.DepartmentsId = deptId ? Number(deptId) : null;
//         delete diff.DepartmentId;
//         delete diff.departmentId;
//         delete diff.Departments;
//         delete diff.DepartmentShortName;
//       }
//       return diff;
//     } else {
//       const payload: any = { ...formData };
//       delete payload.Id;
//       delete payload.DepartmentShortName;
//       if (payload.DepartmentId != null) {
//         payload.DepartmentsId = Number(payload.DepartmentId);
//         delete payload.DepartmentId;
//       }
//       return payload;
//     }
//   }, [editingId, formData, changedFields]);

//   const buildSubSubdepartmentsPayload = useCallback((): any => {
//     if (editingId) {
//       const diff = changedFields();
//       if ('SubDepartmentId' in diff || 'subdepartmentId' in diff || 'SubDepartments' in diff) {
//         const subdeptId = diff.SubDepartmentId || diff.subdepartmentId;
//         diff.SubDepartmentsId = subdeptId ? Number(subdeptId) : null;
//         delete diff.SubDepartmentId;
//         delete diff.subsubdepartmentId;
//         delete diff.SubDepartments;
//       }
//       return diff;
//     } else {
//       const payload: any = { ...formData };
//       delete payload.Id;
//       if (payload.SubDepartmentId != null) {
//         payload.SubDepartmentsId = Number(payload.SubDepartmentId);
//         delete payload.SubDepartmentId;
//       }
//       return payload;
//     }
//   }, [editingId, formData, changedFields]);

//   const buildOrgGoalAlignmentPayload = useCallback((): any => {
//     if (editingId) {
//       return changedFields();
//     } else {
//       const payload = { ...formData };
//       delete payload.Id;
//       return payload;
//     }
//   }, [editingId, formData, changedFields]);

//   const buildHLCAlignmentPayload = useCallback((): any => {
//     if (editingId) {
//       return changedFields();
//     } else {
//       const payload = { ...formData };
//       delete payload.Id;
//       return payload;
//     }
//   }, [editingId, formData, changedFields]);

//   const buildUsersPayload = useCallback((): any => {
//     if (editingId) {
//       const diff = changedFields();
//       if ('UserName' in diff || 'UserId' in diff || 'userId' in diff ||
//         'UserEmail' in diff || 'user' in diff || 'User' in diff) {
//         const uid = diff.userId || diff.UserId;
//         if (uid != null) {
//           diff.UserId = Number(uid);
//         }
//         delete diff.userId;
//         delete diff.user;
//         delete diff.User;
//         delete diff.UserName;
//         delete diff.UserEmail;
//       }
//       // Remove email fields that are only for internal use
//       delete diff.UserIdEmail;

//       if ('DepartmentsId' in diff || 'departmentId' in diff ||
//         'DepartmentName' in diff || 'department' in diff || 'Department' in diff) {
//         const deptId = diff.DepartmentsId || diff.departmentId;
//         if (deptId != null) {
//           diff.DepartmentsId = Number(deptId);
//         }
//         delete diff.departmentId;
//         delete diff.department;
//         delete diff.Department;
//         delete diff.DepartmentName;
//       }

//       return diff;
//     } else {
//       const payload: any = { ...formData };
//       delete payload.Id;
//       delete payload.UserIdEmail; // Remove email field

//       const uid = payload.userId || payload.UserId;
//       if (uid != null) {
//         payload.UserId = Number(uid);
//       }
//       delete payload.userId;
//       delete payload.user;
//       delete payload.User;
//       delete payload.UserName;
//       delete payload.UserEmail;

//       const deptId = payload.DepartmentsId || payload.departmentId;
//       if (deptId != null) {
//         payload.DepartmentsId = Number(deptId);
//       }
//       delete payload.departmentId;
//       delete payload.department;
//       delete payload.Department;
//       delete payload.DepartmentName;

//       return payload;
//     }
//   }, [editingId, formData, changedFields]);

//   const buildSharedServicePayload = useCallback((): any => {
//     if (editingId) {
//       const diff = changedFields();
//       if ('DepartmentsId' in diff || 'departmentId' in diff || 'department' in diff || 'DepartmentName' in diff) {
//         const deptId = diff.DepartmentsId || diff.departmentId;
//         if (deptId != null) {
//           diff.DepartmentsId = Number(deptId);
//         }
//         delete diff.departmentId;
//         delete diff.department;
//         delete diff.DepartmentName;
//       }
//       return diff;
//     } else {
//       const payload: any = { ...formData };
//       delete payload.Id;

//       const deptId = payload.DepartmentsId || payload.departmentId;
//       if (deptId != null) {
//         payload.DepartmentsId = Number(deptId);
//       }
//       delete payload.departmentId;
//       delete payload.department;
//       delete payload.DepartmentName;

//       return payload;
//     }
//   }, [editingId, formData, changedFields]);


//   const buildTagPayload = useCallback((): any => {
//     if (editingId) {
//       return changedFields();
//     } else {
//       const payload = { ...formData };
//       delete payload.Id;
//       return payload;
//     }
//   }, [editingId, formData, changedFields]);

//   const buildDefinitionsPayload = useCallback((): any => {
//     if (editingId) {
//       return changedFields();
//     } else {
//       const payload = { ...formData };
//       delete payload.Id;
//       return payload;
//     }
//   }, [editingId, formData, changedFields]);

//   const buildGlobalGoalsPayload = useCallback((): any => {
//     // Global Goals can only be updated, not created
//     if (editingId) {
//       const diff = changedFields();
//       console.log('Original data:', originalDataRef.current);
//       console.log('Form data:', formData);
//       console.log('Changed fields (diff):', diff);

//       // ScorecardName and Year are managed by MS Flow, never update them
//       delete diff.ScorecardName;
//       delete diff.Year;
//       delete diff.Mission;
//       delete diff.Id;

//       console.log('Final payload after cleanup:', diff);
//       return diff;
//     }
//     // Creating new Global Goals is not allowed, return null to skip save
//     return null;
//   }, [editingId, formData, changedFields]);

//   const getPayloadForList = useCallback((list: string): any => {
//     switch (list) {
//       case 'Departments': return buildDepartmentsPayload();
//       case 'SubDepartments': return buildSubdepartmentsPayload();
//       case 'SubSubDepartments': return buildSubSubdepartmentsPayload();
//       case 'OrganizationGoalAlignment': return buildOrgGoalAlignmentPayload();
//       case 'HLCAlignment': return buildHLCAlignmentPayload();
//       case 'Users': return buildUsersPayload();
//       case 'SharedServiceCampusGoalAlignment': return buildSharedServicePayload();
//       case 'Tags': return buildTagPayload();
//       case 'Definitions': return buildDefinitionsPayload();
//       case 'OrganizationalGoals': return buildGlobalGoalsPayload();
//       default:
//         throw new Error(`No payload builder for list "${list}"`);
//     }
//   }, [
//     buildDepartmentsPayload,
//     buildSubdepartmentsPayload,
//     buildSubSubdepartmentsPayload,
//     buildOrgGoalAlignmentPayload,
//     buildHLCAlignmentPayload,
//     buildUsersPayload,
//     buildSharedServicePayload,
//     buildTagPayload,
//     buildDefinitionsPayload,
//     buildGlobalGoalsPayload
//   ]);

//   const handleSave = useCallback(async () => {
//     if (isSubmitting) return;
//     setIsSubmitting(true);

//     const CustomLists = [
//       { key: 'departments', label: 'Departments' },
//       { key: 'subdepartments', label: 'SubDepartments' },
//       { key: 'subsubdepartments', label: 'SubSubDepartments' },
//       { key: 'users', label: 'Users' },
//       { key: 'orgGoalAlignment', label: 'OrganizationGoalAlignment' },
//       { key: 'hlcCriteria', label: 'HLCAlignment' },
//       { key: 'sharedServices', label: 'SharedServiceCampusGoalAlignment' },
//       { key: 'Tags', label: 'Tags' },
//       { key: 'definitions', label: 'Definitions' },
//       { key: 'globalGoals', label: 'OrganizationalGoals' }
//     ];

//     const a = CustomLists.find(x => x.key === currentForm);
//     if (!a) {
//       toast.error('Invalid form configuration');
//       setIsSubmitting(false);
//       return;
//     }

//     const cfg = a.label;
//     const list = sp.web.lists.getByTitle(cfg);

//     try {
//       // Handle MCC employees for users form
//       if (currentForm === 'users' && formData.UserId && String(formData.UserId).startsWith('mcc_')) {
//         console.log('Processing MCC employee...', formData);
        
//         if (!formData.UserIdEmail) {
//           toast.error('Email not found for selected user.');
//           setIsSubmitting(false);
//           return;
//         }
        
//         // Add user to appropriate SharePoint site group and get real SharePoint ID
//         try {
//           const realUserId = await addUserToSiteGroup(formData.UserIdEmail, formData.Role);
//           // Update formData with the real SharePoint user ID
//           formData.UserId = realUserId;
//           console.log('Updated UserId to real SharePoint ID:', realUserId);
//         } catch (groupError: any) {
//           console.error('Failed to add user to site group:', groupError);
//           toast.error('Failed to add user to SharePoint group: ' + (groupError.message || groupError));
//           setIsSubmitting(false);
//           return;
//         }
//       }

//       // Handle MCC employees for departments form (Head of Department)
//       if (currentForm === 'departments' && formData.HeadOfDepartmentId && String(formData.HeadOfDepartmentId).startsWith('mcc_')) {
//         console.log('Processing MCC employee for Head of Department...', formData);
        
//         if (!formData.HeadOfDepartmentIdEmail) {
//           toast.error('Email not found for selected Head of Department.');
//           setIsSubmitting(false);
//           return;
//         }
        
//         // For Head of Department, add them to Program Director group (you can modify this based on your requirements)
//         try {
//           const realUserId = await addUserToSiteGroup(formData.HeadOfDepartmentIdEmail, 'Program Director');
//           formData.HeadOfDepartmentId = realUserId;
//           console.log('Updated HeadOfDepartmentId to real SharePoint ID:', realUserId);
//         } catch (groupError: any) {
//           console.error('Failed to process Head of Department:', groupError);
//           toast.error('Failed to process Head of Department: ' + (groupError.message || groupError));
//           setIsSubmitting(false);
//           return;
//         }
//       }

//       const payload = getPayloadForList(cfg);
//       console.log('Payload being sent:', payload);

//       // Skip save if payload is null (e.g., globalGoals create attempt)
//       if (payload === null) {
//         toast.info('No changes to save or operation not allowed.');
//         setShowForm(false);
//         setFormData({});
//         setEditingId(null);
//         setIsSubmitting(false);
//         return;
//       }

//       // Check if payload is empty object (no actual changes)
//       if (Object.keys(payload).length === 0) {
//         toast.info('No changes detected to save.');
//         setShowForm(false);
//         setFormData({});
//         setEditingId(null);
//         setIsSubmitting(false);
//         return;
//       }

//       // VALIDATION: Check for duplicate user in Users list
//       if (currentForm === 'users') {
//         // Check if user already exists (for both add and edit scenarios)
//         const existingUsers = await list.items
//           .select('ID', 'User/Id', 'User/Title')
//           .expand('User')
//           .filter(`User/Id eq ${formData.UserId}`)();
        
//         // For new user: check if any record exists
//         // For editing: check if any OTHER record exists with same user
//         const duplicateExists = editingId 
//           ? existingUsers.some((u: any) => u.ID !== editingId)
//           : existingUsers.length > 0;
        
//         if (duplicateExists) {
//           toast.error('This user already exists in the Users list. Each user can only be assigned one role so edit user.');
//           setIsSubmitting(false);
//           return;
//         }
//       }

//       if (editingId) {
//         await list.items.getById(editingId).update(payload);
//         toast.success('Record updated successfully.');
//       } else {
//         await list.items.add(payload);
//         toast.success('Record added successfully.');
//       }

//       setShowForm(false);
//       setFormData({});
//       setEditingId(null);
//       originalDataRef.current = {};
//       refreshData(currentForm);

//     } catch (err: any) {
//       console.error('Save error:', err);
//       toast.error('Save failed: ' + (err.message || err));
//     } finally {
//       setIsSubmitting(false);
//     }
//   }, [currentForm, editingId, sp, getPayloadForList, refreshData, isSubmitting]);

//   // ────────────────────── Render table ──────────────────────
//   const renderTable = useCallback(() => {
//     if (loading) return <div className="p-4 text-center">Loading data...</div>;

//     switch (activeMenu) {
//       case 'departments':
//         return (
//           <DepartmentsTable
//             departments={departments}
//             siteUsers={siteUsers}
//             onEdit={handleEdit}
//             onDelete={handleDelete}
//           />
//         );
//       case 'subdepartments':
//         return (
//           <SubdepartmentsTable
//             subdepartments={subdepartments}
//             departments={departments}
//             onEdit={handleEdit}
//             onDelete={handleDelete}
//           />
//         );
//       case 'subsubdepartments':
//         return (
//           <SubSubdepartmentsTable
//             subsubdepartments={subsubdepartments}
//             subdepartments={subdepartments}
//             onEdit={handleEdit}
//             onDelete={handleDelete}
//           />
//         );
//       case 'users':
//         return <UsersTable users={users} onEdit={handleEdit} onDelete={handleDelete} />;
//       case 'orgGoalAlignment':
//         return <OrgGoalsTable orgGoals={orgGoals} onEdit={handleEdit} onDelete={handleDelete} />;
//       case 'hlcCriteria':
//         return <HlcCriteriaTable hlcCriteria={hlcCriteria} onEdit={handleEdit} onDelete={handleDelete} />;
//       case 'sharedServices':
//         return (
//           <SharedServicesTable
//             sharedServices={sharedServices}
//             departments={departments}
//             onEdit={handleEdit}
//             onDelete={handleDelete}
//           />
//         );
//       case 'tags':
//         return (
//           <div className="table-responsive">
//             <table className="table table-bordered">
//               <thead className="table-light">
//                 <tr>
//                   <th style={{ fontSize: '12px' }}>Tag</th>
//                   <th style={{ fontSize: '12px' }}>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {tags.map(tag => (
//                   <tr key={tag.Id}>
//                     <td style={{ whiteSpace: 'nowrap', fontSize: '12px' }}>{tag.Tag}</td>
//                     <td>
//                       <div className="d-flex gap-2">
//                         <button type="button" className="btn btn-link text-primary p-0" onClick={(e) => { e.preventDefault(); handleEdit(tag) }}>
//                           <Edit2 size={16} />
//                         </button>
//                         <button type="button" className="btn btn-link text-danger p-0" onClick={(e) => { e.preventDefault(); handleDelete(tag.Id) }}>
//                           <Trash2 size={16} />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//                 {tags.length === 0 && (
//                   <tr><td colSpan={2} className="text-center text-muted">No master tags configured.</td></tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         );

//       case 'definitions':
//         return (
//           <DefinitionsDataTable
//             definitions={definitions}
//             onEdit={handleEdit}
//             onDelete={handleDelete}
//           />
//         );

//       case 'globalGoals':
//         return (
//           <GlobalGoalsTable
//             data={globalGoals}
//             onEdit={handleEdit}
//             onDelete={handleDelete}
//             currentUser={null}
//           />
//         );

//       default:
//         return null;
//     }
//   }, [
//     loading,
//     activeMenu,
//     departments,
//     subdepartments,
//     subsubdepartments,
//     siteUsers,
//     users,
//     orgGoals,
//     hlcCriteria,
//     sharedServices,
//     tags,
//     definitions,
//     globalGoals,
//     handleEdit,
//     handleDelete
//   ]);

//   // ────────────────────── JSX ──────────────────────
//   return (
//     <div className="min-vh-100 bg-light position-relative">
//       <div className="container-fluid pbbbb">
//         <div className="mb-4">
//           <h4 className="fw-bold">System Settings</h4>
//           <p className="text-muted">Manage configuration from SharePoint lists</p>
//         </div>

//         <div className="row g-4">
//           <div className="col-md-3">
//             <SidebarMenu activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
//           </div>

//           <div className="col-md-9">
//             <div className="card">
//               <TableHeader
//                 title={menuLabels[activeMenu]}
//                 onAdd={handleAdd}
//                 hideAdd={activeMenu === 'globalGoals'}
//               />
//               <div className="card-body" style={{
//                 overflowY: 'auto',
//                 height: "65vh"
//               }}>{renderTable()}</div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <AddEditForm
//         show={showForm}
//         currentForm={currentForm}
//         editingId={editingId}
//         formData={formData}
//         setFormData={setFormData}
//         lookupData={{ departments, subdepartments, subsubdepartments, siteUsers }}
//         sp={sp}
//         onSave={handleSave}
//         onClose={() => {
//           setShowForm(false);
//           setFormData({});
//         }}
//         isSubmitting={isSubmitting}
//       />
//       <ToastContainer position="top-right" autoClose={3000} />
//     </div>
//   );
// };

// export default SettingsContent;

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import AddEditForm from './forms/AddEditForm';
import UsersTable from './DataTable/UsersTable';
import OrgGoalsTable from './DataTable/OrgGoalsTable';
import HlcCriteriaTable from './DataTable/HlcCriteriaTable';
import SharedServicesTable from './DataTable/SharedServicesTable';
import SidebarMenu from './SidebarMenu';
import TableHeader from './TableHeader';
import DepartmentsTable from './DataTable/DepartmentsTable';
import DefinitionsDataTable from './DataTable/DefinitionsDataTable';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import "./DataTable/Settings.scss";
import SubdepartmentsTable from './DataTable/SubdepartmentsTable';
import SubSubdepartmentsTable from './DataTable/SubSubdepartmentsTable';
import GlobalGoalsTable from './DataTable/GlobalGoalsTable';
import { Edit2, Trash2 } from 'lucide-react';
import { getADGroupMembers } from '../../../APIsServices/GraphService';
import Loader from '../../../Common/Loader';

const SettingsContent = ({ sp, graph, context }: any) => {
  // ────────────────────── State ──────────────────────
  const [activeMenu, setActiveMenu] = useState('users');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [currentForm, setCurrentForm] = useState('');
  const [fields, setFields] = useState<any[]>([]);

  // ────────────────────── Data ──────────────────────
  const [departments, setDepartments] = useState<any[]>([]);
  const [orgGoals, setOrgGoals] = useState<any[]>([]);
  const [hlcCriteria, setHlcCriteria] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [sharedServices, setSharedServices] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [definitions, setDefinitions] = useState<any[]>([]);
  const [globalGoals, setGlobalGoals] = useState<any[]>([]);
  const [siteUsers, setSiteUsers] = useState<{ id: number; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [subdepartments, setSubDepartments] = useState<any[]>([]);
  const [subsubdepartments, setSubSubDepartments] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingIEPs, setIsCreatingIEPs] = useState(false);

  // ────────────────────── Memoized list config ──────────────────────
  const listConfig = useMemo(() => ({
    departments: {
      listName: 'Departments',
      fields: ['Id', 'DepartmentName', 'HeadOfDepartment/Title', 'HeadOfDepartment/Id', 'DepartmentShortName', 'Vision', 'Mission'],
      expand: ['HeadOfDepartment'],
      map: (item: any) => ({
        Id: item.Id,
        DepartmentName: item.DepartmentName,
        HeadOfDepartment: item.HeadOfDepartment?.Title || '',
        HeadOfDepartmentId: item.HeadOfDepartment?.Id || null,
        DepartmentShortName: item.DepartmentShortName,
        Vision: item.Vision || '',
        Mission: item.Mission || '',
      })
    },
    subdepartments: {
      listName: 'SubDepartments',
      fields: [
        'Id',
        'SubDepartmentName',
        'Remark',
        'Departments/Id',
        'Departments/DepartmentName',
        'Departments/DepartmentShortName'
      ],
      expand: ['Departments'],
      map: (item: any) => ({
        Id: item.Id,
        SubDepartmentName: item.SubDepartmentName || '',
        Remark: item.Remark || '',
        DepartmentId: item.Departments?.Id || null,
        DepartmentName: item.Departments?.DepartmentName || '',
        DepartmentShortName: item.Departments?.DepartmentShortName || ''
      })
    },
    subsubdepartments: {
      listName: 'SubSubDepartments',
      fields: [
        'Id',
        'SubSubDepartmentName',
        'Remark',
        'SubDepartments/Id',
        'SubDepartments/SubDepartmentName'
      ],
      expand: ['SubDepartments'],
      map: (item: any) => ({
        Id: item.Id,
        SubSubDepartmentName: item.SubSubDepartmentName || '',
        Remark: item.Remark || '',
        SubDepartmentId: item.SubDepartments?.Id || null,
        SubDepartmentName: item.SubDepartments?.SubDepartmentName || '',
      })
    },
    orgGoalAlignment: {
      listName: 'OrganizationGoalAlignment',
      fields: ['Id', 'OrganizationalGoalAlignment', 'Value', 'Tag'],
      map: (item: any) => ({
        Id: item.Id,
        OrganizationalGoalAlignment: item.OrganizationalGoalAlignment,
        Value: item.Value || '',
        Tag: item.Tag || ''
      })
    },
    hlcCriteria: {
      listName: 'HLCAlignment',
      fields: ['Id', 'HLCAlignment', 'Description'],
      map: (item: any) => ({
        Id: item.Id,
        HLCAlignment: item.HLCAlignment,
        Description: item.Description || ''
      })
    },
    users: {
      listName: 'Users',
      fields: [
        'Id',
        'User/Title',
        'User/Id',
        'User/EMail',
        'Role',
        'Departments/Id',
        'Departments/DepartmentName'
      ],
      expand: ['User', 'Departments'],
      map: (item: any) => ({
        Id: item.Id,
        UserName: item.User?.Title || '',
        UserEmail: item.User?.EMail || '',
        UserId: item.User?.Id || null,
        Role: item.Role || '',
        DepartmentsId: item.Departments?.Id || null,
        DepartmentName: item.Departments?.DepartmentName || ''
      })
    },
    sharedServices: {
      listName: 'SharedServiceCampusGoalAlignment',
      fields: ['Id', "ThreeYRSharedService", 'Departments/Id', 'Departments/DepartmentName'],
      expand: ['Departments'],
      map: (item: any) => ({
        Id: item.Id,
        ThreeYRSharedService: item.ThreeYRSharedService || '',
        DepartmentsId: item.Departments?.Id || null,
        DepartmentName: item.Departments?.DepartmentName || ''
      })
    },
    Tag: {
      listName: 'Tags',
      fields: ['Id', 'Tag'],
      map: (item: any) => ({
        Id: item.Id,
        Tag: item.Tag || ''
      })
    },
    definitions: {
      listName: 'Definitions',
      fields: ['Id', 'Term', 'Definition', 'Section'],
      map: (item: any) => ({
        Id: item.Id,
        Term: item.Term || '',
        Definition: item.Definition || '',
        Section: item.Section || ''
      })
    },
    globalGoals: {
      listName: 'OrganizationalGoals',
      fields: ['Id', 'ScorecardName', 'Year', 'GlobalGoal', 'Mission'],
      map: (item: any) => ({
        Id: item.Id,
        ScorecardName: item.ScorecardName || '',
        Year: item.Year || '',
        GlobalGoal: item.GlobalGoal || '',
        Mission: item.Mission || ''
      })
    }
  }), []);

  const menuLabels = useMemo(() => ({
    users: 'Users',
    subdepartments: 'SubDepartments',
    subsubdepartments: 'SubSubDepartments',
    departments: 'Departments',
    orgGoalAlignment: 'Organizational Goal Alignment',
    hlcCriteria: 'HLC Criteria',
    sharedServices: 'Shared Service/Campus Goals',
    tags: 'Tags',
    definitions: 'Definitions',
    globalGoals: 'Global Goals'
  }), []);

  const dataSetters = useMemo(() => ({
    departments: setDepartments,
    subdepartments: setSubDepartments,
    subsubdepartments: setSubSubDepartments,
    orgGoalAlignment: setOrgGoals,
    hlcCriteria: setHlcCriteria,
    users: setUsers,
    sharedServices: setSharedServices,
    tags: setTags,
    definitions: setDefinitions,
    globalGoals: setGlobalGoals
  }), []);

  const originalDataRef = useRef<Record<string, any>>({});

  // ────────────────────── Load all data + site users ──────────────────────
  useEffect(() => {
    let isMounted = true;

    const fetchAll = async () => {
      if (!sp || !sp.web) return;

      setLoading(true);

      try {
        const keys = [
          "departments",
          "subdepartments",
          "subsubdepartments",
          "orgGoalAlignment",
          "hlcCriteria",
          "users",
          "sharedServices",
          "tags",
          "definitions",
          "globalGoals"
        ];

        const listResults = await Promise.all(
          keys.map(async (key) => {
            let res = [];
            try {
              switch (key) {
                case "departments":
                  res = await sp.web.lists
                    .getByTitle("Departments")
                    .items.select(
                      "Id",
                      "DepartmentName",
                      "HeadOfDepartment/Title",
                      "HeadOfDepartment/Id",
                      "DepartmentShortName",
                      "Vision",
                      "Mission"
                    ).orderBy("DepartmentName", true)
                    .expand("HeadOfDepartment")();
                  res = res.map((item: any) => ({
                    Id: item.Id,
                    DepartmentName: item.DepartmentName,
                    HeadOfDepartment: item.HeadOfDepartment?.Title || "",
                    HeadOfDepartmentId: item.HeadOfDepartment?.Id || null,
                    DepartmentShortName: item.DepartmentShortName,
                    Vision: item.Vision || "",
                    Mission: item.Mission || "",
                  }));
                  break;

                case "subdepartments":
                  res = await sp.web.lists
                    .getByTitle("SubDepartments")
                    .items.select(
                      "Id",
                      "SubDepartmentName",
                      "Remark",
                      "Departments/Id",
                      "Departments/DepartmentName",
                      "Departments/DepartmentShortName"
                    ).orderBy("SubDepartmentName", true)
                    .expand("Departments")();
                  res = res.map((item: any) => ({
                    Id: item.Id,
                    SubDepartmentName: item.SubDepartmentName || "",
                    Remark: item.Remark || "",
                    DepartmentId: item.Departments?.Id || null,
                    DepartmentName: item.Departments?.DepartmentName || "",
                    DepartmentShortName: item.Departments?.DepartmentShortName || ""
                  }));
                  break;

                case "subsubdepartments":
                  res = await sp.web.lists
                    .getByTitle("SubSubDepartments")
                    .items.select(
                      "Id",
                      "SubSubDepartmentName",
                      "Remark",
                      "SubDepartments/Id",
                      "SubDepartments/SubDepartmentName"
                    ).orderBy("SubDepartments/SubDepartmentName", true)
                    .expand("SubDepartments")();
                  res = res.map((item: any) => ({
                    Id: item.Id,
                    SubSubDepartmentName: item.SubSubDepartmentName || "",
                    Remark: item.Remark || "",
                    SubDepartmentId: item.SubDepartments?.Id || null,
                    SubDepartmentName: item.SubDepartments?.SubDepartmentName || "",
                  }));
                  break;

                case "orgGoalAlignment":
                  res = await sp.web.lists
                    .getByTitle("OrganizationGoalAlignment")
                    .items.select("Id", "OrganizationalGoalAlignment", "Value", "Tag").orderBy("OrganizationalGoalAlignment", true)();
                  res = res.map((item: any) => ({
                    Id: item.Id,
                    OrganizationalGoalAlignment: item.OrganizationalGoalAlignment,
                    Value: item.Value || "",
                    Tag: item.Tag || "",
                  }));
                  break;

                case "hlcCriteria":
                  res = await sp.web.lists
                    .getByTitle("HLCAlignment")
                    .items.select("Id", "HLCAlignment", "Description").orderBy("Id", true)();
                  res = res.map((item: any) => ({
                    Id: item.Id,
                    HLCAlignment: item.HLCAlignment,
                    Description: item.Description || "",
                  }));
                  break;

                case "users":
                  res = await sp.web.lists
                    .getByTitle("Users")
                    .items.select(
                      "Id",
                      "User/Title",
                      "User/Id",
                      "User/EMail",
                      "Role",
                      "Departments/Id",
                      "Departments/DepartmentName"
                    ).orderBy("User/Title", true)
                    .expand("User", "Departments")();

                  res = res.map((item: any) => ({
                    Id: item.Id,
                    UserName: item.User?.Title || "",
                    UserEmail: item.User?.EMail || "",
                    UserId: item.User?.Id || null,
                    Role: item.Role || "",
                    DepartmentsId: item.Departments?.Id || null,
                    DepartmentName: item.Departments?.DepartmentName || "",
                  }));

                  console.log(res, 'resuser>>');
                  break;

                case "sharedServices":
                  res = await sp.web.lists
                    .getByTitle("SharedServiceCampusGoalAlignment")
                    .items.select(
                      "Id",
                      "ThreeYRSharedService",
                      "Departments/Id",
                      "Departments/DepartmentName"
                    )
                    .expand("Departments")();
                  res = res.map((item: any) => ({
                    Id: item.Id,
                    ThreeYRSharedService: item.ThreeYRSharedService || "",
                    DepartmentsId: item.Departments?.Id || null,
                    DepartmentName: item.Departments?.DepartmentName || "",
                  }));
                  break;

                case "tags":
                  res = await sp.web.lists
                    .getByTitle("Tags")
                    .items.select("Id", "Tag")();
                  res = res.map((item: any) => ({
                    Id: item.Id,
                    Tag: item.Tag || ''
                  }));
                  break;

                case "definitions":
                  res = await sp.web.lists
                    .getByTitle("Definitions")
                    .items.select("Id", "Term", "Definition", "Section")();
                  res = res.map((item: any) => ({
                    Id: item.Id,
                    Term: item.Term || '',
                    Definition: item.Definition || '',
                    Section: item.Section || ''
                  }));
                  break;

                case "globalGoals":
                  res = await sp.web.lists
                    .getByTitle("OrganizationalGoals")
                    .items.select("Id", "ScorecardName", "Year", "GlobalGoal", "Mission")
                    .orderBy("Year", false)();
                  res = res.map((item: any) => ({
                    Id: item.Id,
                    ScorecardName: item.ScorecardName || '',
                    Year: item.Year || '',
                    GlobalGoal: item.GlobalGoal || '',
                    Mission: item.Mission || ''
                  }));
                  break;
              }

              return { key, data: res };
            } catch (err) {
              console.error(`Error loading ${key}:`, err);
              return { key, data: [] };
            }
          })
        );

        if (!isMounted) return;

        const updates: any = {};
        listResults.forEach(({ key, data }) => (updates[key] = data));

        const userList = updates.users || [];

        const siteUsersRaw = await sp.web.siteUsers();
        const onlyUsers = siteUsersRaw.filter((u: any) => u.PrincipalType === 1);
        const formattedUsers = onlyUsers.map((u: any) => ({
          id: u.Id,
          title: u.Title,
          email: u.EMail
        }));

        // Get MCC Employees AD group members
        let mccEmployees: any[] = [];
        if (graph && context) {
          try {
            // Get MSGraphClient from context for pagination support
            const graphClient = await context.msGraphClientFactory.getClient('3');
            mccEmployees = await getADGroupMembers(graph, 'MCC Employees', graphClient);
            console.log('MCC Employees from AD group:', mccEmployees);
          } catch (error) {
            console.error('Error fetching MCC Employees group:', error);
          }
        }

        // Merge site users with MCC Employees group members (avoiding duplicates by email and title)
        const allUsers = [...formattedUsers];
        mccEmployees.forEach((mccUser: any) => {
          // Check for duplicates by email (primary check) or by name (secondary check)
          const existsByEmail = allUsers.some(u =>
            u.email?.toLowerCase().trim() === mccUser.email?.toLowerCase().trim()
          );

          const existsByName = allUsers.some(u =>
            u.title?.toLowerCase().trim() === mccUser.title?.toLowerCase().trim()
          );

          // Only add if user doesn't exist by either email or name
          if (!existsByEmail && !existsByName && mccUser.email && mccUser.title) {
            // Add MCC employee with a synthetic ID (using a prefix to avoid conflicts)
            allUsers.push({
              id: `mcc_${mccUser.id}`,
              title: mccUser.title,
              email: mccUser.email
            });
            //console.log(`Added MCC Employee: ${mccUser.title} (${mccUser.email})`);
          } else {
            //console.log(`Skipped duplicate user: ${mccUser.title} (${mccUser.email})`);
          }
        });

        setSiteUsers(allUsers);
        setDepartments(updates.departments || []);
        setSubDepartments(updates.subdepartments || []);
        setSubSubDepartments(updates.subsubdepartments || []);
        setOrgGoals(updates.orgGoalAlignment || []);
        setHlcCriteria(updates.hlcCriteria || []);
        setUsers(userList);
        setSharedServices(updates.sharedServices || []);
        setTags(updates.tags || []);
        setDefinitions(updates.definitions || []);
        setGlobalGoals(updates.globalGoals || []);
      } catch (err) {
        console.error("Fetch error:", err);
        if (isMounted) toast.error("Failed to load data from SharePoint.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAll();

    return () => {
      isMounted = false;
    };
  }, [sp, graph]); // ← FIXED: added 'graph' to dependency array

  // ────────────────────── Load form fields ──────────────────────
  useEffect(() => {
    let isMounted = true;

    const loadFields = async () => {
      if (!currentForm || !listConfig[currentForm]) {
        if (isMounted) setFields([]);
        return;
      }

      const listName = listConfig[currentForm].listName;

      try {
        const res = await sp.web.lists
          .getByTitle(listName)
          .fields.filter(
            "Hidden eq false and ReadOnlyField eq false and " +
            "InternalName ne 'ContentType' and InternalName ne 'Attachments'"
          )();

        const dynamicFields = res
          .map((f: any) => {
            const field: any = {
              name: f.InternalName,
              label: f.Title || f.InternalName,
              type: 'text',
            };

            switch (f.TypeAsString) {
              case 'Note': field.type = 'textarea'; break;
              case 'Choice': field.type = 'select'; field.options = f.Choices || []; break;
              case 'MultiChoice': field.type = 'multiselect'; field.options = f.Choices || []; break;
              case 'User': field.type = 'user'; break;
              case 'UserMulti': field.type = 'usermulti'; break;
              case 'Lookup':
                field.type = 'lookup';
                const listId = f.LookupList ? f.LookupList.replace(/[{}]/g, '') : null;
                if (listId) field.lookupList = listId;
                break;
              case 'LookupMulti':
                field.type = 'lookupmulti';
                const listIdMulti = f.LookupList ? f.LookupList.replace(/[{}]/g, '') : null;
                if (listIdMulti) field.lookupList = listIdMulti;
                break;
            }

            return field;
          })
          .filter(
            (f: any) =>
              f.name !== 'ID' &&
              f.name !== 'Id' &&
              f.name !== 'ContentType' &&
              f.name !== 'Attachments' &&
              f.name !== 'Title' &&
              !f.name.startsWith('_')
          );

        if (isMounted) setFields(dynamicFields);
      } catch (err) {
        console.error('Field load error:', err);
        if (isMounted) setFields([]);
      }
    };

    if (currentForm && sp) loadFields();

    return () => { isMounted = false; };
  }, [currentForm, sp, listConfig]);

  // ────────────────────── Refresh data callback ──────────────────────
  const refreshData = useCallback(async (menu: string) => {
    const cfg = listConfig[menu];
    if (!cfg) return;

    try {
      const res = await sp.web.lists
        .getByTitle(cfg.listName)
        .items.select(...cfg.fields)
        .expand(...(cfg.expand || []))();

      dataSetters[menu]?.(res.map(cfg.map));
    } catch (err) {
      console.error('Refresh error:', err);
    }
  }, [sp, listConfig, dataSetters]);

  // ────────────────────── CRUD Handlers ──────────────────────
  // ─── Create IEP entries for GlobalGoals with dept/subdept loop ─────────────────────
  const createGlobalGoalIEPEntries = useCallback(async (globalGoalItem: any) => {
    try {
      if (!sp || !globalGoalItem || !globalGoalItem.GlobalGoal) {
        console.log('Skipping IEP creation: missing GlobalGoal value');
        return;
      }

      setIsCreatingIEPs(true);
      console.log('Creating IEP entries for GlobalGoal:', globalGoalItem.GlobalGoal);
      const iepsList = sp.web.lists.getByTitle('IEPs');

      let createdCount = 0;
      let errorCount = 0;

      // Loop through all departments
      for (const dept of departments) {
        // Loop through subdepartments of this department
        const deptSubdepartments = subdepartments.filter((sd: any) => sd.DepartmentId === dept.Id);
        
        if (deptSubdepartments.length === 0) {
          // If no subdepartments, create one IEP entry for the department alone
          try {
            const iepPayload = {
              Title: `${globalGoalItem.GlobalGoal} - ${dept.DepartmentName}`,
              OperationalGoal: globalGoalItem.GlobalGoal,
              IsGlobalGoal: true,
              DepartmentsId: dept.Id,
              OrganizationalGoalsId: globalGoalItem.Id
            };
            
            await iepsList.items.add(iepPayload);
            createdCount++;
            console.log(`✓ Created IEP for Department: ${dept.DepartmentName}`);
          } catch (err: any) {
            errorCount++;
            console.error(`✗ Failed to create IEP for ${dept.DepartmentName}:`, err.message);
          }
        } else {
          // Create IEP entry for each department-subdepartment combination
          for (const subdept of deptSubdepartments) {
            try {
              const iepPayload = {
                Title: `${globalGoalItem.GlobalGoal} - ${dept.DepartmentName} / ${subdept.SubDepartmentName}`,
                OperationalGoal: globalGoalItem.GlobalGoal,
                IsGlobalGoal: true,
                DepartmentsId: dept.Id,
                SubDepartmentsId: subdept.Id,
                OrganizationalGoalsId: globalGoalItem.Id
              };
              
              await iepsList.items.add(iepPayload);
              createdCount++;
              console.log(`✓ Created IEP for ${dept.DepartmentName} / ${subdept.SubDepartmentName}`);
            } catch (err: any) {
              errorCount++;
              console.error(`✗ Failed to create IEP for ${dept.DepartmentName} / ${subdept.SubDepartmentName}:`, err.message);
            }
          }
        }
      }

      if (createdCount > 0) {
        toast.success(`Created ${createdCount} IEP entries from Global Goal.`);
      }
      if (errorCount > 0) {
        toast.warning(`Created ${createdCount} IEP entries, but ${errorCount} failed.`);
      }

      console.log(`GlobalGoal IEP Creation Summary: ${createdCount} created, ${errorCount} failed`);
    } catch (error: any) {
      console.error('Error creating GlobalGoal IEP entries:', error);
      toast.error('Failed to create some IEP entries from Global Goal.');
    } finally {
      setIsCreatingIEPs(false);
    }
  }, [sp, departments, subdepartments]);

  const handleAdd = useCallback(() => {
    setCurrentForm(activeMenu);
    setShowForm(true);
    setEditingId(null);
    setFormData({});
    originalDataRef.current = {};
  }, [activeMenu]);

  const handleEdit = useCallback((item: any) => {
    setCurrentForm(activeMenu);
    setShowForm(true);
    setEditingId(item.Id);
    setFormData({ ...item });
    originalDataRef.current = { ...item };
  }, [activeMenu]);

  const handleDelete = useCallback(async (id: number) => {
    const confirmResult = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this item?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    });

    if (!confirmResult.isConfirmed) return;

    const cfg = listConfig[activeMenu];

    try {
      await sp.web.lists.getByTitle(cfg.listName).items.getById(id).delete();
      toast.success('Record deleted successfully.');
      refreshData(activeMenu);
    } catch (err: any) {
      toast.error('Delete failed: ' + err.message);
    }
  }, [activeMenu, sp, listConfig, refreshData]);

  // ─── Add user to SharePoint site group ─────────────────────
  const addUserToSiteGroup = async (userEmail: string, role: string): Promise<number> => {
    try {
      let groupName = '';

      switch (role) {
        case 'Program Director':
          groupName = 'Program Director';
          break;
        case 'Planning Unit Manager':
          groupName = 'Planning Unit Manager';
          break;
        default:
          throw new Error(`No group mapping found for role: ${role}`);
      }

      console.log(`Adding user ${userEmail} to group ${groupName}`);

      let userId: number;

      try {
        const existingUser = await sp.web.siteUsers.getByEmail(userEmail)();
        userId = existingUser.Id;
        console.log(`User ${userEmail} already exists with ID: ${userId}`);
      } catch (userError: any) {
        console.log(`User not found in site users, trying to add: ${userEmail}`);

        try {
          const addedUser = await sp.web.ensureUser(userEmail);
          userId = addedUser.data.Id;
          console.log(`User ${userEmail} added to site users with ID: ${userId}`);
        } catch (ensureError: any) {
          console.error('Failed to ensure user exists:', ensureError);
          throw new Error(`Cannot add user ${userEmail} to SharePoint. User might not exist in AD or email format is incorrect.`);
        }
      }

      try {
        await sp.web.siteGroups.getByName(groupName).users.add(userEmail);
        console.log(`User ${userEmail} successfully added to group ${groupName}`);
      } catch (groupError: any) {
        console.log(`Group error for ${groupName}:`, groupError.message);

        if (role === 'Planning Unit Manager') {
          const alternativeGroups = ['PlaningUnitManagerGroup', 'Planning Unit Managers', 'Members'];

          for (const altGroup of alternativeGroups) {
            try {
              console.log(`Trying alternative group: ${altGroup}`);
              await sp.web.siteGroups.getByName(altGroup).users.add(userEmail);
              console.log(`User ${userEmail} successfully added to alternative group ${altGroup}`);
              break;
            } catch (altError: any) {
              console.log(`Alternative group ${altGroup} also failed:`, altError.message);
              continue;
            }
          }
        } else {
          try {
            console.log('Trying Members group as fallback');
            await sp.web.siteGroups.getByName('Members').users.add(userEmail);
            console.log(`User ${userEmail} added to Members group as fallback`);
          } catch (fallbackError: any) {
            console.log('Members group fallback also failed:', fallbackError.message);
          }
        }
      }

      return userId;

    } catch (error: any) {
      console.error(`Error in addUserToSiteGroup:`, error);
      throw error;
    }
  };

  // ────────────────────────────────────────────────────────────────────────
  //  Helper – returns only changed fields (for PATCH)
  // ────────────────────────────────────────────────────────────────────────
  const changedFields = useCallback((): Record<string, any> => {
    const diff: Record<string, any> = {};
    Object.keys(formData).forEach(k => {
      if (JSON.stringify(formData[k]) !== JSON.stringify(originalDataRef.current[k])) {
        diff[k] = formData[k];
      }
    });
    return diff;
  }, [formData]);

  // ────────────────────────────────────────────────────────────────────────
  //  Payload builders
  // ────────────────────────────────────────────────────────────────────────
  const buildDepartmentsPayload = useCallback((): any => {
    if (editingId) {
      const diff = changedFields();
      if ('HeadOfDepartment' in diff || 'HeadOfDepartmentId' in diff) {
        if (diff.HeadOfDepartmentId != null) {
          diff.HeadOfDepartmentId = Number(diff.HeadOfDepartmentId);
        }
        delete diff.HeadOfDepartment;
      }
      delete diff.HeadOfDepartmentIdEmail;
      return diff;
    } else {
      const payload: any = { ...formData };
      delete payload.HeadOfDepartment;
      delete payload.HeadOfDepartmentIdEmail;
      delete payload.Id;
      if (payload.HeadOfDepartmentId != null) {
        payload.HeadOfDepartmentId = Number(payload.HeadOfDepartmentId);
      }
      return payload;
    }
  }, [editingId, formData, changedFields]);

  const buildSubdepartmentsPayload = useCallback((): any => {
    if (editingId) {
      const diff = changedFields();
      if ('DepartmentId' in diff || 'departmentId' in diff || 'Departments' in diff) {
        const deptId = diff.DepartmentId || diff.departmentId;
        diff.DepartmentsId = deptId ? Number(deptId) : null;
        delete diff.DepartmentId;
        delete diff.departmentId;
        delete diff.Departments;
        delete diff.DepartmentShortName;
      }
      return diff;
    } else {
      const payload: any = { ...formData };
      delete payload.Id;
      delete payload.DepartmentShortName;
      if (payload.DepartmentId != null) {
        payload.DepartmentsId = Number(payload.DepartmentId);
        delete payload.DepartmentId;
      }
      return payload;
    }
  }, [editingId, formData, changedFields]);

  const buildSubSubdepartmentsPayload = useCallback((): any => {
    if (editingId) {
      const diff = changedFields();
      if ('SubDepartmentId' in diff || 'subdepartmentId' in diff || 'SubDepartments' in diff) {
        const subdeptId = diff.SubDepartmentId || diff.subdepartmentId;
        diff.SubDepartmentsId = subdeptId ? Number(subdeptId) : null;
        delete diff.SubDepartmentId;
        delete diff.subsubdepartmentId;
        delete diff.SubDepartments;
      }
      return diff;
    } else {
      const payload: any = { ...formData };
      delete payload.Id;
      if (payload.SubDepartmentId != null) {
        payload.SubDepartmentsId = Number(payload.SubDepartmentId);
        delete payload.SubDepartmentId;
      }
      return payload;
    }
  }, [editingId, formData, changedFields]);

  const buildOrgGoalAlignmentPayload = useCallback((): any => {
    if (editingId) {
      return changedFields();
    } else {
      const payload = { ...formData };
      delete payload.Id;
      return payload;
    }
  }, [editingId, formData, changedFields]);

  const buildHLCAlignmentPayload = useCallback((): any => {
    if (editingId) {
      return changedFields();
    } else {
      const payload = { ...formData };
      delete payload.Id;
      return payload;
    }
  }, [editingId, formData, changedFields]);

  const buildUsersPayload = useCallback((): any => {
    if (editingId) {
      const diff = changedFields();
      if ('UserName' in diff || 'UserId' in diff || 'userId' in diff ||
        'UserEmail' in diff || 'user' in diff || 'User' in diff) {
        const uid = diff.userId || diff.UserId;
        if (uid != null) {
          diff.UserId = Number(uid);
        }
        delete diff.userId;
        delete diff.user;
        delete diff.User;
        delete diff.UserName;
        delete diff.UserEmail;
      }
      delete diff.UserIdEmail;

      if ('DepartmentsId' in diff || 'departmentId' in diff ||
        'DepartmentName' in diff || 'department' in diff || 'Department' in diff) {
        const deptId = diff.DepartmentsId || diff.departmentId;
        if (deptId != null) {
          diff.DepartmentsId = Number(deptId);
        }
        delete diff.departmentId;
        delete diff.department;
        delete diff.Department;
        delete diff.DepartmentName;
      }

      return diff;
    } else {
      const payload: any = { ...formData };
      delete payload.Id;
      delete payload.UserIdEmail;

      const uid = payload.userId || payload.UserId;
      if (uid != null) {
        payload.UserId = Number(uid);
      }
      delete payload.userId;
      delete payload.user;
      delete payload.User;
      delete payload.UserName;
      delete payload.UserEmail;

      const deptId = payload.DepartmentsId || payload.departmentId;
      if (deptId != null) {
        payload.DepartmentsId = Number(deptId);
      }
      delete payload.departmentId;
      delete payload.department;
      delete payload.Department;
      delete payload.DepartmentName;

      return payload;
    }
  }, [editingId, formData, changedFields]);

  const buildSharedServicePayload = useCallback((): any => {
    if (editingId) {
      const diff = changedFields();
      if ('DepartmentsId' in diff || 'departmentId' in diff || 'department' in diff || 'DepartmentName' in diff) {
        const deptId = diff.DepartmentsId || diff.departmentId;
        if (deptId != null) {
          diff.DepartmentsId = Number(deptId);
        }
        delete diff.departmentId;
        delete diff.department;
        delete diff.DepartmentName;
      }
      return diff;
    } else {
      const payload: any = { ...formData };
      delete payload.Id;

      const deptId = payload.DepartmentsId || payload.departmentId;
      if (deptId != null) {
        payload.DepartmentsId = Number(deptId);
      }
      delete payload.departmentId;
      delete payload.department;
      delete payload.DepartmentName;

      return payload;
    }
  }, [editingId, formData, changedFields]);

  const buildTagPayload = useCallback((): any => {
    if (editingId) {
      return changedFields();
    } else {
      const payload = { ...formData };
      delete payload.Id;
      return payload;
    }
  }, [editingId, formData, changedFields]);

  const buildDefinitionsPayload = useCallback((): any => {
    if (editingId) {
      return changedFields();
    } else {
      const payload = { ...formData };
      delete payload.Id;
      return payload;
    }
  }, [editingId, formData, changedFields]);

  const buildGlobalGoalsPayload = useCallback((): any => {
    if (editingId) {
      const diff = changedFields();
      console.log('Original data:', originalDataRef.current);
      console.log('Form data:', formData);
      console.log('Changed fields (diff):', diff);

      delete diff.ScorecardName;
      delete diff.Year;
      delete diff.Mission;
      delete diff.Id;

      console.log('Final payload after cleanup:', diff);
      return diff;
    }
    return null;
  }, [editingId, formData, changedFields]);

  const getPayloadForList = useCallback((list: string): any => {
    switch (list) {
      case 'Departments': return buildDepartmentsPayload();
      case 'SubDepartments': return buildSubdepartmentsPayload();
      case 'SubSubDepartments': return buildSubSubdepartmentsPayload();
      case 'OrganizationGoalAlignment': return buildOrgGoalAlignmentPayload();
      case 'HLCAlignment': return buildHLCAlignmentPayload();
      case 'Users': return buildUsersPayload();
      case 'SharedServiceCampusGoalAlignment': return buildSharedServicePayload();
      case 'Tags': return buildTagPayload();
      case 'Definitions': return buildDefinitionsPayload();
      case 'OrganizationalGoals': return buildGlobalGoalsPayload();
      default:
        throw new Error(`No payload builder for list "${list}"`);
    }
  }, [
    buildDepartmentsPayload,
    buildSubdepartmentsPayload,
    buildSubSubdepartmentsPayload,
    buildOrgGoalAlignmentPayload,
    buildHLCAlignmentPayload,
    buildUsersPayload,
    buildSharedServicePayload,
    buildTagPayload,
    buildDefinitionsPayload,
    buildGlobalGoalsPayload
  ]);

  const handleSave = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const CustomLists = [
      { key: 'departments', label: 'Departments' },
      { key: 'subdepartments', label: 'SubDepartments' },
      { key: 'subsubdepartments', label: 'SubSubDepartments' },
      { key: 'users', label: 'Users' },
      { key: 'orgGoalAlignment', label: 'OrganizationGoalAlignment' },
      { key: 'hlcCriteria', label: 'HLCAlignment' },
      { key: 'sharedServices', label: 'SharedServiceCampusGoalAlignment' },
      { key: 'Tags', label: 'Tags' },
      { key: 'definitions', label: 'Definitions' },
      { key: 'globalGoals', label: 'OrganizationalGoals' }
    ];

    const a = CustomLists.find(x => x.key === currentForm);
    if (!a) {
      toast.error('Invalid form configuration');
      setIsSubmitting(false);
      return;
    }

    const cfg = a.label;
    const list = sp.web.lists.getByTitle(cfg);

    try {
      // Handle MCC employees for users form
      if (currentForm === 'users' && formData.UserId && String(formData.UserId).startsWith('mcc_')) {
        console.log('Processing MCC employee...', formData);

        if (!formData.UserIdEmail) {
          toast.error('Email not found for selected user.');
          setIsSubmitting(false);
          return;
        }

        try {
          const realUserId = await addUserToSiteGroup(formData.UserIdEmail, formData.Role);
          formData.UserId = realUserId;
          console.log('Updated UserId to real SharePoint ID:', realUserId);
        } catch (groupError: any) {
          console.error('Failed to add user to site group:', groupError);
          toast.error('Failed to add user to SharePoint group: ' + (groupError.message || groupError));
          setIsSubmitting(false);
          return;
        }
      }

      // Handle MCC employees for departments form (Head of Department)
      if (currentForm === 'departments' && formData.HeadOfDepartmentId && String(formData.HeadOfDepartmentId).startsWith('mcc_')) {
        console.log('Processing MCC employee for Head of Department...', formData);

        if (!formData.HeadOfDepartmentIdEmail) {
          toast.error('Email not found for selected Head of Department.');
          setIsSubmitting(false);
          return;
        }

        try {
          const realUserId = await addUserToSiteGroup(formData.HeadOfDepartmentIdEmail, 'Program Director');
          formData.HeadOfDepartmentId = realUserId;
          console.log('Updated HeadOfDepartmentId to real SharePoint ID:', realUserId);
        } catch (groupError: any) {
          console.error('Failed to process Head of Department:', groupError);
          toast.error('Failed to process Head of Department: ' + (groupError.message || groupError));
          setIsSubmitting(false);
          return;
        }
      }

      const payload = getPayloadForList(cfg);
      console.log('Payload being sent:', payload);

      if (payload === null) {
        toast.info('No changes to save or operation not allowed.');
        setShowForm(false);
        setFormData({});
        setEditingId(null);
        setIsSubmitting(false);
        return;
      }

      if (Object.keys(payload).length === 0) {
        toast.info('No changes detected to save.');
        setShowForm(false);
        setFormData({});
        setEditingId(null);
        setIsSubmitting(false);
        return;
      }

      // VALIDATION: Check for duplicate user in Users list
      if (currentForm === 'users') {
        const existingUsers = await list.items
          .select('ID', 'User/Id', 'User/Title')
          .expand('User')
          .filter(`User/Id eq ${formData.UserId}`)();

        const duplicateExists = editingId
          ? existingUsers.some((u: any) => u.ID !== editingId)
          : existingUsers.length > 0;

        if (duplicateExists) {
          toast.error('This user already exists in the Users list. Each user can only be assigned one role so edit user.');
          setIsSubmitting(false);
          return;
        }
      }

      if (editingId) {
        await list.items.getById(editingId).update(payload);
        toast.success('Record updated successfully.');

        if (currentForm === 'globalGoals' && formData.GlobalGoal) {
          await createGlobalGoalIEPEntries({ ...formData, Id: editingId });
        }
      } else {
        const addResult = await list.items.add(payload);
        toast.success('Record added successfully.');
        
        // For new GlobalGoals, create IEP entries automatically
        if (currentForm === 'globalGoals' && formData.GlobalGoal) {
          console.log('New GlobalGoal created, generating IEP entries...');
          await createGlobalGoalIEPEntries({ ...formData, Id: addResult?.data?.Id });
        }
      }

      setShowForm(false);
      setFormData({});
      setEditingId(null);
      originalDataRef.current = {};
      refreshData(currentForm);

    } catch (err: any) {
      console.error('Save error:', err);
      toast.error('Save failed: ' + (err.message || err));
    } finally {
      setIsSubmitting(false);
    }
  }, [currentForm, editingId, sp, getPayloadForList, refreshData, isSubmitting, createGlobalGoalIEPEntries, formData]);

  // ────────────────────── Render table ──────────────────────
  const renderTable = useCallback(() => {
    if (loading) return <div className="p-4 text-center">Loading data...</div>;

    switch (activeMenu) {
      case 'departments':
        return (
          <DepartmentsTable
            departments={departments}
            siteUsers={siteUsers}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        );
      case 'subdepartments':
        return (
          <SubdepartmentsTable
            subdepartments={subdepartments}
            departments={departments}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        );
      case 'subsubdepartments':
        return (
          <SubSubdepartmentsTable
            subsubdepartments={subsubdepartments}
            subdepartments={subdepartments}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        );
      case 'users':
        return <UsersTable users={users} onEdit={handleEdit} onDelete={handleDelete} />;
      case 'orgGoalAlignment':
        return <OrgGoalsTable orgGoals={orgGoals} onEdit={handleEdit} onDelete={handleDelete} />;
      case 'hlcCriteria':
        return <HlcCriteriaTable hlcCriteria={hlcCriteria} onEdit={handleEdit} onDelete={handleDelete} />;
      case 'sharedServices':
        return (
          <SharedServicesTable
            sharedServices={sharedServices}
            departments={departments}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        );
      case 'tags':
        return (
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  <th style={{ fontSize: '12px' }}>Tag</th>
                  <th style={{ fontSize: '12px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tags.map(tag => (
                  <tr key={tag.Id}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '12px' }}>{tag.Tag}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <button type="button" className="btn btn-link text-primary p-0" onClick={(e) => { e.preventDefault(); handleEdit(tag) }}>
                          <Edit2 size={16} />
                        </button>
                        <button type="button" className="btn btn-link text-danger p-0" onClick={(e) => { e.preventDefault(); handleDelete(tag.Id) }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {tags.length === 0 && (
                  <tr><td colSpan={2} className="text-center text-muted">No master tags configured.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        );

      case 'definitions':
        return (
          <DefinitionsDataTable
            definitions={definitions}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        );

      case 'globalGoals':
        return (
          <GlobalGoalsTable
            data={globalGoals}
            onEdit={handleEdit}
            onDelete={handleDelete}
            currentUser={null}
          />
        );

      default:
        return null;
    }
  }, [
    loading,
    activeMenu,
    departments,
    subdepartments,
    subsubdepartments,
    siteUsers,
    users,
    orgGoals,
    hlcCriteria,
    sharedServices,
    tags,
    definitions,
    globalGoals,
    handleEdit,
    handleDelete
  ]);

  // ────────────────────── JSX ──────────────────────
  return (
    <div className="min-vh-100 bg-light position-relative">
      <div className="container-fluid pbbbb">
        <div className="mb-4">
          <h4 className="fw-bold">System Settings</h4>
          <p className="text-muted">Manage configuration from SharePoint lists</p>
        </div>

        <div className="row g-4">
          <div className="col-md-3">
            <SidebarMenu activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
          </div>

          <div className="col-md-9">
            <div className="card">
              <TableHeader
                title={menuLabels[activeMenu]}
                onAdd={handleAdd}
                hideAdd={activeMenu === 'globalGoals'}
              />
              <div className="card-body" style={{
                overflowY: 'auto',
                height: "65vh"
              }}>{renderTable()}</div>
            </div>
          </div>
        </div>
      </div>

      <AddEditForm
        show={showForm}
        currentForm={currentForm}
        editingId={editingId}
        formData={formData}
        setFormData={setFormData}
        lookupData={{ departments, subdepartments, subsubdepartments, siteUsers }}
        sp={sp}
        onSave={handleSave}
        onClose={() => {
          setShowForm(false);
          setFormData({});
        }}
        isSubmitting={isSubmitting}
      />
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Loading overlay for IEP creation */}
      {isCreatingIEPs && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <Loader size="large" color="#ffffff" text="Creating IEP entries for all departments..." />
          <div className="text-light mt-2" style={{ fontSize: '0.9rem', opacity: 0.8 }}>
            Please wait, this may take a moment
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsContent;