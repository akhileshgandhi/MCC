
// // // Organizational Scorecards API
// // export async function getOrganizationalScorecards(_sp) {
// //   try {
// //     const items = await _sp.web.lists.getByTitle("OrganizationalGoals").items
// //       .select("ID", "Title", "Mission", "Year","ScorecardName", "Description")
// //       .orderBy("Year", false)();

// //     return items;
// //   } catch (error) {
// //     console.error("Error fetching organizational scorecards:", error);
// //     throw error;
// //   }
// // }

// // // Departments API
// // export async function getDepartments(_sp) {
// //   try {
// //     const items = await _sp.web.lists.getByTitle("Departments").items
// //       .select("ID", "Title", "DepartmentName", "Vision", "HeadOfDepartment/Id", "HeadOfDepartment/Title")
// //       .expand("HeadOfDepartment")();

// //     return items;
// //   } catch (error) {
// //     console.error("Error fetching departments:", error);
// //     throw error;
// //   }
// // }

// // // IEPs API (Updated with Scorecard)
// // export async function getIEPs(_sp) {
// //   try {
// //     let items = await _sp.web.lists.getByTitle("IEPs").items
// //       .select(
// //         "ID", "Title", 
// //         "OrganizationalGoal/ID", "OrganizationalGoal/Year", "OrganizationalGoal/ScorecardName",
// //         "Department/ID", "Department/Title", "Department/DepartmentName",
// //         "OperationalGoal", "OperationalTactic", "PerformanceMeasure", "Target",
// //         "OrganizationalGoalsAlignment", "Plan3YearGoalsAlignment", "HLCCriteriaAlignment",
// //         "PerformanceMeasureResults", "ResultsMet", "ContinuousImprovement",
// //         "FutureBudgetImpact", "BudgetImpactDescription","IfYesPleaseDescribe", "StartDate", "EndDate", "Priority","Tag/Id","Tag/Tag"
// //         //,"Tag/TagType"
// //       )
// //       .expand("OrganizationalGoal", "Department","Tag")();

// //       console.log(items,'items');

// //      // items = items.filter(x=>x.Tags?.TagType=="IEPs")

// //     return items;
// //   } catch (error) {
// //     console.error("Error fetching IEPs:", error);
// //     throw error;
// //   }
// // }

// // export async function getIEPsByScorecard(_sp,scorecardId) {
// //   try {
// //     const items = await _sp.web.lists.getByTitle("IEPs").items
// //       .filter(`ScorecardId eq ${scorecardId}`)
// //       .select(
// //         "ID", "Title", 
// //         "Scorecard/ID", "Scorecard/Title", "Scorecard/Mission", "Scorecard/Year", "Scorecard/Description",
// //         "Department/ID", "Department/Title", "Department/DepartmentName",
// //         "OperationalGoal", "OperationalTactic", "PerformanceMeasure", "Target",
// //         "OrganizationalGoalAlignment", "Plan3yrGoalAlignment", "HLCCriteriaAlignment",
// //         "PerformanceMeasureResults", "ResultsMet", "ContinuousImprovement",
// //         "FutureBudgetImpact", "BudgetImpactDescription", "StartDate", "EndDate", "Priority"
// //       )
// //       .expand("Scorecard", "Department")();

// //     return items;
// //   } catch (error) {
// //     console.error("Error fetching IEPs by scorecard:", error);
// //     throw error;
// //   }
// // }

// // export async function getIEPsByDepartment(_sp,departmentId) {
// //   try {
// //     const items = await _sp.web.lists.getByTitle("IEPs").items
// //       .filter(`DepartmentId eq ${departmentId}`)
// //       .select(
// //         "ID", "Title", 
// //         "Scorecard/ID", "Scorecard/Title", "Scorecard/Mission", "Scorecard/Year", "Scorecard/Description",
// //         "Department/ID", "Department/Title", "Department/DepartmentName",
// //         "OperationalGoal", "OperationalTactic", "PerformanceMeasure", "Target",
// //         "OrganizationalGoalAlignment", "Plan3yrGoalAlignment", "HLCCriteriaAlignment",
// //         "PerformanceMeasureResults", "ResultsMet", "ContinuousImprovement",
// //         "FutureBudgetImpact", "BudgetImpactDescription", "StartDate", "EndDate", "Priority"
// //       )
// //       .expand("Scorecard", "Department")();

// //     return items;
// //   } catch (error) {
// //     console.error("Error fetching IEPs by department:", error);
// //     throw error;
// //   }
// // }

// // // Create methods
// // export async function createOrganizationalScorecard(_sp,scorecardData) {
// //   try {
// //     const result = await _sp.web.lists.getByTitle("OrganizationalScorecards").items.add(scorecardData);
// //     return result;
// //   } catch (error) {
// //     console.error("Error creating organizational scorecard:", error);
// //     throw error;
// //   }
// // }

// // export async function createIEP(_sp,iepData) {
// //   try {
// //     const result = await _sp.web.lists.getByTitle("IEPs").items.add(iepData);
// //     return result;
// //   } catch (error) {
// //     console.error("Error creating IEP:", error);
// //     throw error;
// //   }
// // }

// // export async function updateIEP(_sp,iepId, iepData) {
// //   try {
// //     const result = await _sp.web.lists.getByTitle("IEPs").items.getById(iepId).update(iepData);
// //     return result;
// //   } catch (error) {
// //     console.error("Error updating IEP:", error);
// //     throw error;
// //   }
// // }
// // APIsServices/SharePointService.ts

// import { SPFI } from "@pnp/sp/presets/all";

// // Organizational Scorecards API - CORRECTED
// export async function getOrganizationalScorecards(_sp: SPFI) {
//   try {
//     const items = await _sp.web.lists.getByTitle("OrganizationalGoals").items
//       .select("Id", "Title", "Mission", "Year", "ScorecardName", "Description")
//       .orderBy("Year", false)();

//     return items;
//   } catch (error) {
//     console.error("Error fetching organizational scorecards:", error);
//     throw error;
//   }
// }

// // Departments API - CORRECT
// export async function getDepartments(_sp: SPFI) {
//   try {
//     const items = await _sp.web.lists.getByTitle("Departments").items
//       .select("Id", "Title", "DepartmentName", "Vision","DepartmentShortName", "HeadOfDepartment/Id", "HeadOfDepartment/Title")
//       .expand("HeadOfDepartment")();

//     return items;
//   } catch (error) {
//     console.error("Error fetching departments:", error);
//     throw error;
//   }
// }
// export async function getOrganizationalGoalsAlignment(platform, sp) {
//   switch (platform) {
//     case "SharePoint":
//       try {
//         // Ensure LicenseeId is a number for the filter query
//         const result = await sp.web.lists
//           .getByTitle("OrganizationGoalAlignment")
//           .items
//           .select("Value")
//           //.orderBy("OrganizationalGoalAlignment", true) // Corrected: use Number() to ensure it's a number
//           ();
//         return result;
//       } catch (error) {
//         return [];
//       }

//     default:
//       return [];
//   }
// };

// export async function getThreeYearGoalsAlignment(platform, sp) {
//   switch (platform) {
//     case "SharePoint":
//       try {
//         // Ensure LicenseeId is a number for the filter query
//         const result = await sp.web.lists
//           .getByTitle("SharedServiceCampusGoalAlignment")
//           .items
//           .select("ThreeYRSharedService")
//           //.orderBy("ThreeYRSharedService", true) // Corrected: use Number() to ensure it's a number
//           ();
//         return result;
//       } catch (error) {
//         return [];
//       }

//     default:
//       return [];
//   }
// };

// export async function getHlcCriteria(platform, sp) {
//   switch (platform) {
//     case "SharePoint":
//       try {
//         // Ensure LicenseeId is a number for the filter query
//         const result = await sp.web.lists
//           .getByTitle("HLCAlignment")
//           .items
//           .select("HLCAlignment")
//           //.orderBy("HLCAlignment", true) // Corrected: use Number() to ensure it's a number
//           ();
//         return result;
//       } catch (error) {
//         return [];
//       }

//     default:
//       return [];
//   }
// };

// // IEPs API - CORRECTED (Use Id, not ID)
// // export async function getIEPs(_sp: SPFI) {
// //   try {
// //     debugger
// //     // Fetch main IEP items
// //     const items = await _sp.web.lists.getByTitle("IEPs").items
// //       .select(
// //         "Id",
// //         "Title",
// //         "OperationalGoal",
// //         "OperationalTactic",
// //         "PerformanceMeasure",
// //         "Target",
// //         "BudgetImpactDescription",
// //         "OrganizationalGoalsAlignment/Id",
// //         "HLCCriteriaAlignment/Id",
// //         "Plan3YearGoalsAlignment/Id",
// //         "OrganizationalGoal/Id",
// //         "Department/Id",
// //         "SubDepartments/Id",
// //         "SubSubDepartments/Id",
// //         "Tag/Id"
// //       )
// //       .expand(
// //         "OrganizationalGoalsAlignment",
// //         "HLCCriteriaAlignment",
// //         "Plan3YearGoalsAlignment",
// //         "OrganizationalGoal",
// //         "Department",
// //         "SubDepartments",
// //         "SubSubDepartments",
// //         "Tag"
// //       )();

// //     // Fetch related lookup lists
// //     const [
// //       orgAlign,
// //       hlcAlign,
// //       organizations,
// //       departments,
// //       threeYrAlign,
// //       subDepartments,
// //       subsubDepartments,
// //       tags
// //     ] = await Promise.all([
// //       _sp.web.lists.getByTitle("OrganizationGoalAlignment").items.select("Id", "OrganizationalGoalAlignment", "Value")(),
// //       _sp.web.lists.getByTitle("HLCAlignment").items.select("Id", "HLCAlignment", "Description")(),
// //       _sp.web.lists.getByTitle("OrganizationalGoals").items.select("Id", "ScorecardName", "Year")(),
// //       _sp.web.lists.getByTitle("Departments").items.select("Id", "DepartmentName", "Vision")(),
// //       _sp.web.lists.getByTitle("SharedServiceCampusGoalAlignment").items
// //         .select("Id", "ThreeYRSharedService", "Department/DepartmentName")
// //         .expand("Department")(),
// //       _sp.web.lists.getByTitle("SubDepartments").items.select("Id", "SubDepartmentName")(),
// //       _sp.web.lists.getByTitle("SubSubDepartments").items.select("Id", "SubSubDepartmentName")(),

// //       _sp.web.lists.getByTitle("Tags").items.select("Id", "Tag", "TagType")(),
// //     ]);

// //     console.log(organizations, "organizations>>");

// //     console.log(items, 'items');

// //     // Merge lookup data
// //     const merged = items.map((item) => ({
// //       ...item,
// //       OrganizationalGoalsAlignment:
// //         item.OrganizationalGoalsAlignment?.map((x) =>
// //           orgAlign.find((y) => y.Id === x.Id)
// //         ) ?? [],
// //       HLCCriteriaAlignment:
// //         item.HLCCriteriaAlignment?.map((x) =>
// //           hlcAlign.find((y) => y.Id === x.Id)
// //         ) ?? [],
// //       Plan3YearGoalsAlignment:
// //         item.Plan3YearGoalsAlignment?.map((x) =>
// //           threeYrAlign.find((y) => y.Id === x.Id)
// //         ) ?? [],
// //       Department:
// //         item.Department
// //           ? departments.find((y) => y.Id === item.Department.Id)
// //           : null,
// //       OrganizationalGoal:
// //         item.OrganizationalGoal
// //           ? organizations.find((y) => y.Id === item.OrganizationalGoal.Id)
// //           : null,
// //       Tag:
// //         item.Tag
// //           ? tags.find((y) => y.Id === item.Tag.Id)
// //           : null,
// //       SubDepartments:
// //         item.SubDepartments
// //           ? subDepartments.find((y) => y.Id === item.SubDepartments.Id)
// //           : null,
// //       SubSubDepartments:
// //         item.SubSubDepartments
// //           ? subsubDepartments.find((y) => y.Id === item.SubSubDepartments.Id)
// //           : null,
// //     }));

// //     console.log("IEPs merged with lookups:", merged);
// //     return merged;
// //   } catch (error) {
// //     console.error("Error fetching IEPs:", error);
// //     throw error;
// //   }
// // }

// export async function getIEPs(_sp: SPFI, filters?: {
//   organizationalGoalId?: number;
//   departmentId?: number;
//   subDepartmentId?: number;
//   subSubDepartmentId?: number;
//   tagId?: number;
// }) {
//   try {
//     // Build OData filter string using lookup id fields (SharePoint stores lookup id fields as <FieldName>Id)
//     const filterParts: string[] = [];
//     if (filters?.organizationalGoalId != null) {
//       filterParts.push(`OrganizationalGoalId eq ${filters.organizationalGoalId}`);
//     }
//     if (filters?.departmentId != null) {
//       filterParts.push(`DepartmentId eq ${filters.departmentId}`);
//     }
//     if (filters?.subDepartmentId != null) {
//       filterParts.push(`SubDepartmentsId eq ${filters.subDepartmentId}`);
//     }
//     if (filters?.subSubDepartmentId != null) {
//       filterParts.push(`SubSubDepartmentsId eq ${filters.subSubDepartmentId}`);
//     }
//     if (filters?.tagId != null) {
//       filterParts.push(`TagId eq ${filters.tagId}`);
//     }
//     const filterStr = filterParts.length ? filterParts.join(' and ') : undefined;

//     // Base query
//     let query = _sp.web.lists.getByTitle("IEPs").items
//       .select(
//         "Id",
//         "Title",
//         "OperationalGoal",
//         "OperationalTactic",
//         "PerformanceMeasure",
//         "PerformanceMeasureResults",
//         "Target",
//         "BudgetImpactDescription",
//         "ContinuousImprovement",
//         "FutureBudgetImpact",
//         "IfYesPleaseDescribe",
//         "ResultsMet",
//         // include lookup expansions (we will also fetch lookup lists separately)
//         "OrganizationalGoalsAlignment/Id",
//         "HLCCriteriaAlignment/Id",
//         "Plan3YearGoalsAlignment/Id",
//         "OrganizationalGoal/Id",
//         "Department/Id",
//         "SubDepartments/Id",
//         "SubSubDepartments/Id",
//         "Tag/Id",
//         "Created",
//         "Modified",
//         "Priority",
//         "Title","*"
//       )
//       .expand(
//         "OrganizationalGoalsAlignment",
//         "HLCCriteriaAlignment",
//         "Plan3YearGoalsAlignment",
//         "OrganizationalGoal",
//         "Department",
//         "SubDepartments",
//         "SubSubDepartments",
//         "Tag",
    
//       )
//       .orderBy("Modified", false) // false = descending → newest first
//       ;

//     if (filterStr) {
//       query = (query as any).filter(filterStr);
//     }

//     const items = await query();
// console.log(items, 'recent act')
//     // Fetch lookup lists (we need these to compose richer objects)
//     const [
//       orgAlign,
//       hlcAlign,
//       organizations,
//       departments,
//       threeYrAlign,
//       subDepartments,
//       subsubDepartments,
//       tags
//     ] = await Promise.all([
//       _sp.web.lists.getByTitle("OrganizationGoalAlignment").items.select("Id", "OrganizationalGoalAlignment", "Value")(),
//       _sp.web.lists.getByTitle("HLCAlignment").items.select("Id", "HLCAlignment", "Description")(),
//       _sp.web.lists.getByTitle("OrganizationalGoals").items.select("Id", "ScorecardName", "Year", "Mission", "Description")(),
//       _sp.web.lists.getByTitle("Departments").items.select("Id", "DepartmentName", "DepartmentShortName", "Vision")(),
//       _sp.web.lists.getByTitle("SharedServiceCampusGoalAlignment").items
//         .select("Id", "ThreeYRSharedService", "Department/DepartmentName")
//         .expand("Department")(),
//       _sp.web.lists.getByTitle("SubDepartments").items.select("Id", "SubDepartmentName")(),
//       _sp.web.lists.getByTitle("SubSubDepartments").items.select("Id", "SubSubDepartmentName")(),
//       _sp.web.lists.getByTitle("Tags").items.select("Id", "Tag", "TagType")(),
//     ]);

//     // Merge lookup data into each IEP row
//     const merged = items.map((item: any) => ({
//       ...item,
//       // map alignment ids to full objects from lookup lists (if present)
//       OrganizationalGoalsAlignment:
//         item.OrganizationalGoalsAlignment?.map((x: any) =>
//           orgAlign.find((y: any) => y.Id === x.Id)
//         ) ?? [],
//       HLCCriteriaAlignment:
//         item.HLCCriteriaAlignment?.map((x: any) =>
//           hlcAlign.find((y: any) => y.Id === x.Id)
//         ) ?? [],
//       Plan3YearGoalsAlignment:
//         item.Plan3YearGoalsAlignment?.map((x: any) =>
//           threeYrAlign.find((y: any) => y.Id === x.Id)
//         ) ?? [],
//       Department:
//         item.Department
//           ? departments.find((y: any) => y.Id === item.Department.Id)
//           : null,
//       OrganizationalGoal:
//         item.OrganizationalGoal
//           ? organizations.find((y: any) => y.Id === item.OrganizationalGoal.Id)
//           : null,
//       Tag:
//         item.Tag
//           ? tags.find((y: any) => y.Id === item.Tag.Id)
//           : null,
//       SubDepartments:
//         item.SubDepartments
//           ? subDepartments.find((y: any) => y.Id === item.SubDepartments.Id)
//           : null,
//       SubSubDepartments:
//         item.SubSubDepartments
//           ? subsubDepartments.find((y: any) => y.Id === item.SubSubDepartments.Id)
//           : null,
//     }));

//     return merged;
//   } catch (error) {
//     console.error("Error fetching IEPs:", error);
//     throw error;
//   }
// }


// // ✅ Fetch IEPs filtered by Organizational Goal (Scorecard)
// // export async function getIEPsByScorecard(_sp: SPFI, scorecardId: number) {
// //   try {
// //     // Step 1: Get main IEPs — ordered by Modified (newest first)
// //     const items = await _sp.web.lists.getByTitle("IEPs").items
// //       .filter(`OrganizationalGoal/Id eq ${scorecardId}`)
// //       .select(
// //         "Id",
// //         "Title",
// //         "OperationalGoal",
// //         "OperationalTactic",
// //         "PerformanceMeasure",
// //         "Target",
// //         "PerformanceMeasureResults",
// //         "ResultsMet",
// //         "ContinuousImprovement",
// //         "FutureBudgetImpact",
// //         "BudgetImpactDescription",
// //         "IfYesPleaseDescribe",
// //         "StartDate",
// //         "EndDate",
// //         "Priority",
// //         "OrganizationalGoal/Id",
// //         "OrganizationalGoal/Year",
// //         "OrganizationalGoal/ScorecardName",
// //         "Department/Id",
// //         "Department/Title",
// //         "Department/DepartmentName",
// //         "Department/DepartmentShortName",
// //         "Tag/Id",
// //         "Tag/Tag",
// //         "OrganizationalGoalsAlignment/Id",
// //         "HLCCriteriaAlignment/Id",
// //         "Plan3YearGoalsAlignment/Id", "*"
// //       )
// //       .expand(
// //         "OrganizationalGoal",
// //         "Department",
// //         "Tag",
// //         "OrganizationalGoalsAlignment",
// //         "HLCCriteriaAlignment",
// //         "Plan3YearGoalsAlignment"
// //       )
// //       .orderBy("Modified", false)(); // false = descending → newest first

// //     // Fetch related lookup lists
// //     const [
// //       orgAlign,
// //       hlcAlign,
// //       organizations,
// //       departments,
// //       threeYrAlign,
// //       tags
// //     ] = await Promise.all([
// //       _sp.web.lists.getByTitle("OrganizationGoalAlignment").items.select("Id", "OrganizationalGoalAlignment", "Value")(),
// //       _sp.web.lists.getByTitle("HLCAlignment").items.select("Id", "HLCAlignment", "Description")(),
// //       _sp.web.lists.getByTitle("OrganizationalGoals").items.select("Id", "ScorecardName", "Year")(),
// //       _sp.web.lists.getByTitle("Departments").items.select("Id", "DepartmentName", "Vision")(),
// //       _sp.web.lists.getByTitle("SharedServiceCampusGoalAlignment").items
// //         .select("Id", "ThreeYRSharedService", "Department/DepartmentName")
// //         .expand("Department")(),
// //       _sp.web.lists.getByTitle("Tags").items.select("Id", "Tag", "TagType")(),
// //     ]);

// //     console.log(organizations, "organizations>>");

// //     // Merge lookup data
// //     const merged = items.map((item) => ({
// //       ...item,
// //       OrganizationalGoalsAlignment:
// //         item.OrganizationalGoalsAlignment?.map((x) =>
// //           orgAlign.find((y) => y.Id === x.Id)
// //         ) ?? [],
// //       HLCCriteriaAlignment:
// //         item.HLCCriteriaAlignment?.map((x) =>
// //           hlcAlign.find((y) => y.Id === x.Id)
// //         ) ?? [],
// //       Plan3YearGoalsAlignment:
// //         item.Plan3YearGoalsAlignment?.map((x) =>
// //           threeYrAlign.find((y) => y.Id === x.Id)
// //         ) ?? [],
// //       Department:
// //         item.Department
// //           ? departments.find((y) => y.Id === item.Department.Id)
// //           : null,
// //       OrganizationalGoal:
// //         item.OrganizationalGoal
// //           ? organizations.find((y) => y.Id === item.OrganizationalGoal.Id)
// //           : null,
// //       Tag:
// //         item.Tag
// //           ? tags.find((y) => y.Id === item.Tag.Id)
// //           : null,
// //     }));

// //     return merged;
// //   } catch (error) {
// //     console.error("Error fetching IEPs by scorecard:", error);
// //     throw error;
// //   }
// // }
// export async function getIEPsByScorecard(_sp: SPFI, scorecardId: number) {
//   try {
//     // Step 1: Get main IEPs
//     const items = await _sp.web.lists.getByTitle("IEPs").items
//       .filter(`OrganizationalGoal/Id eq ${scorecardId}`)
//       .select(
//         "Id",
//         "Title",
//         "OperationalGoal",
//         "OperationalTactic",
//         "PerformanceMeasure",
//         "Target",
//         "PerformanceMeasureResults",
//         "ResultsMet",
//         "ContinuousImprovement",
//         "FutureBudgetImpact",
//         "BudgetImpactDescription",
//         "IfYesPleaseDescribe",
//         "StartDate",
//         "EndDate",
//         "Priority",
//         "OrganizationalGoal/Id",
//         "OrganizationalGoal/Year",
//         "OrganizationalGoal/ScorecardName",
//         "Department/Id",
//         "Department/Title",
//         "Department/DepartmentName",
//         "Department/DepartmentShortName",
//         "Tag/Id",
//         "Tag/Tag",
//         "OrganizationalGoalsAlignment/Id",
//         "HLCCriteriaAlignment/Id",
//         "Plan3YearGoalsAlignment/Id",
//         "Department/Id",
//         "Tag/Id","*"
//       )
//       .expand(
//         "OrganizationalGoal",
//         "Department",
//         "Tag",
//         "OrganizationalGoalsAlignment",
//         "HLCCriteriaAlignment",
//         "Plan3YearGoalsAlignment", "Department",
//         "Tag"
//       )();

//     // Fetch related lookup lists
//     const [
//       orgAlign,
//       hlcAlign,
//       organizations,
//       departments,
//       threeYrAlign,
//       tags
//     ] = await Promise.all([
//       _sp.web.lists.getByTitle("OrganizationGoalAlignment").items.select("Id", "OrganizationalGoalAlignment", "Value")(),
//       _sp.web.lists.getByTitle("HLCAlignment").items.select("Id", "HLCAlignment", "Description")(),
//       _sp.web.lists.getByTitle("OrganizationalGoals").items.select("Id", "ScorecardName", "Year")(),
//       _sp.web.lists.getByTitle("Departments").items.select("Id", "DepartmentName", "Vision")(),
//       _sp.web.lists.getByTitle("SharedServiceCampusGoalAlignment").items
//         .select("Id", "ThreeYRSharedService", "Department/DepartmentName")
//         .expand("Department")(),
//       _sp.web.lists.getByTitle("Tags").items.select("Id", "Tag", "TagType")(),
//     ]);

//     console.log(organizations, "organizations>>");

//     // Merge lookup data
//     const merged = items.map((item) => ({
//       ...item,
//       OrganizationalGoalsAlignment:
//         item.OrganizationalGoalsAlignment?.map((x) =>
//           orgAlign.find((y) => y.Id === x.Id)
//         ) ?? [],
//       HLCCriteriaAlignment:
//         item.HLCCriteriaAlignment?.map((x) =>
//           hlcAlign.find((y) => y.Id === x.Id)
//         ) ?? [],
//       Plan3YearGoalsAlignment:
//         item.Plan3YearGoalsAlignment?.map((x) =>
//           threeYrAlign.find((y) => y.Id === x.Id)
//         ) ?? [],
//       Department:
//         item.Department
//           ? departments.find((y) => y.Id === item.Department.Id)
//           : null,
//       OrganizationalGoal:
//         item.OrganizationalGoal
//           ? organizations.find((y) => y.Id === item.OrganizationalGoal.Id)
//           : null,
//       Tag:
//         item.Tag
//           ? tags.find((y) => y.Id === item.Tag.Id)
//           : null,
//     }));

//     return merged;
//   } catch (error) {
//     console.error("Error fetching IEPs by scorecard:", error);
//     throw error;
//   }
// }


// // FIXED: Use Department/Id
// // ✅ Fetch IEPs filtered by Department
// export async function getIEPsByDepartment(_sp: SPFI, departmentId: number) {
//   try {
//     // Step 1: Get main IEPs
//     const items = await _sp.web.lists.getByTitle("IEPs").items
//       .filter(`Department/Id eq ${departmentId}`)
//       .select(
//         "Id",
//         "Title",
//         "OperationalGoal",
//         "OperationalTactic",
//         "PerformanceMeasure",
//         "Target",
//         "PerformanceMeasureResults",
//         "ResultsMet",
//         "ContinuousImprovement",
//         "FutureBudgetImpact",
//         "BudgetImpactDescription",
//         "IfYesPleaseDescribe",
//         "StartDate",
//         "EndDate",
//         "Priority",
//         "OrganizationalGoal/Id",
//         "OrganizationalGoal/Year",
//         "OrganizationalGoal/ScorecardName",
//         "Department/Id",
//         "Department/Title",
//         "Department/DepartmentName",
//         "Department/DepartmentShortName",
//         "Tag/Id",
//         "OrganizationalGoalsAlignment/Id",
//         "HLCCriteriaAlignment/Id",
//         "Plan3YearGoalsAlignment/Id", "Department/Id",
//         "Tag/Id", "*","Author/Id","Author/Title"

//       )
//       .expand(
//         "OrganizationalGoal",
//         "Department",
//         "Tag",
//         "OrganizationalGoalsAlignment",
//         "HLCCriteriaAlignment",
//         "Plan3YearGoalsAlignment", "Department",
//         "Tag","Author"
//       ).orderBy("Modified", false) // false = descending → newest first
//       ();

//     // Fetch related lookup lists
//     const [
//       orgAlign,
//       hlcAlign,
//       organizations,
//       departments,
//       threeYrAlign,
//       tags
//     ] = await Promise.all([
//       _sp.web.lists.getByTitle("OrganizationGoalAlignment").items.select("Id", "OrganizationalGoalAlignment", "Value")(),
//       _sp.web.lists.getByTitle("HLCAlignment").items.select("Id", "HLCAlignment", "Description")(),
//       _sp.web.lists.getByTitle("OrganizationalGoals").items.select("Id", "ScorecardName", "Year")(),
//       _sp.web.lists.getByTitle("Departments").items.select("Id", "DepartmentName", "Vision")(),
//       _sp.web.lists.getByTitle("SharedServiceCampusGoalAlignment").items
//         .select("Id", "ThreeYRSharedService", "Department/DepartmentName")
//         .expand("Department")(),
//       _sp.web.lists.getByTitle("Tags").items.select("Id", "Tag", "TagType")(),
     
//     ]);

//     console.log(organizations, "organizations>>");

//     // Merge lookup data
//     const merged = items.map((item) => ({
//       ...item,
//       OrganizationalGoalsAlignment:
//         item.OrganizationalGoalsAlignment?.map((x) =>
//           orgAlign.find((y) => y.Id === x.Id)
//         ) ?? [],
//       HLCCriteriaAlignment:
//         item.HLCCriteriaAlignment?.map((x) =>
//           hlcAlign.find((y) => y.Id === x.Id)
//         ) ?? [],
//       Plan3YearGoalsAlignment:
//         item.Plan3YearGoalsAlignment?.map((x) =>
//           threeYrAlign.find((y) => y.Id === x.Id)
//         ) ?? [],
//       Department:
//         item.Department
//           ? departments.find((y) => y.Id === item.Department.Id)
//           : null,
//       OrganizationalGoal:
//         item.OrganizationalGoal
//           ? organizations.find((y) => y.Id === item.OrganizationalGoal.Id)
//           : null,
//       Tag:
//         item.Tag
//           ? tags.find((y) => y.Id === item.Tag.Id)
//           : null,
//     }));

//     return merged;
//   } catch (error) {
//     console.error("Error fetching IEPs by department:", error);
//     throw error;
//   }
// }

// // Create Organizational Goal - CORRECTED
// export async function createOrganizationalGoal(_sp: SPFI, goalData: any) {
//   try {
//     const result = await _sp.web.lists.getByTitle("OrganizationalGoals").items.add(goalData);
//     return result.data;
//   } catch (error) {
//     console.error("Error creating organizational goal:", error);
//     throw error;
//   }
// }

// // Create IEP
// export async function createIEP(_sp: SPFI, iepData: any) {
//   try {
//     const result = await _sp.web.lists.getByTitle("IEPs").items.add(iepData);
//     return result.data;
//   } catch (error) {
//     console.error("Error creating IEP:", error);
//     throw error;
//   }
// }

// // Update IEP
// export async function updateIEP(_sp: SPFI, iepId: number, iepData: any) {
//   try {
//     const result = await _sp.web.lists.getByTitle("IEPs").items.getById(iepId).update(iepData);
//     return result;
//   } catch (error) {
//     console.error("Error updating IEP:", error);
//     throw error;
//   }
// }

// // export async function fetchUsersListAs(sp, platform, Id) {
// //   switch (platform) {
// //     case "SharePoint":
// //       try {
// //         const items = await sp.web.lists.getByTitle("Users").items
// //           .select(
// //             "Id",
// //             "Title",
// //             "User/Id",
// //             "User/Title",
// //             "User/Name",
// //             "User/EMail",
// //             "Department/Id",
// //             "Department/DepartmentName",
// //             "Role"
// //           )
// //           .expand("User", "Department")
// //           .filter(`User/Id eq ${Id}`) // Filter by People field user Id
// //           (); // ✅ Correct way to execute query
// // const [
   
// //       departments
// //     ] = await Promise.all([
// //       sp.web.lists.getByTitle("Departments").items.select("Id", "DepartmentName", "Vision")()
// //     ]);

// //      const merged = items.map((item) => ({
// //       ...item,
// //       Department:
// //         item.Department
// //           ? departments.find((y) => y.Id === item.Department.Id)
// //           : null
// //     }));

// //     return merged;
// //         const formattedUsers = items.map(item => ({
// //           Id: item.Id,
// //           User: item.User ? {
// //             Id: item.User.Id,
// //             Title: item.User.Title,
// //             Email: item.User.EMail,     // ✅ Correct internal name for email
// //             LoginName: item.User.Name,  // ✅ Correct internal name for login
// //           } : null,
// //           Department: item.Department ? {
// //             Id: item.Department.Id,
// //             Title: item.Department.DepartmentName, // ✅ Lookup field name
// //           } : null,
// //           Role: item.Role || "",
// //         }));

// //         console.log("Formatted Users:", formattedUsers);
// //         return formattedUsers;

// //       } catch (error) {
// //         console.error("Error fetching users list:", error);
// //         return [];
// //       }

// //     default:
// //       return [];
// //   }
// // }

// Fetch DefaultDataTable data from SharePoint List
export async function getDefaultDataTable(_sp: any) {
  try {
    const items = await _sp.web.lists
      .getByTitle("DefaultDataTable")
      .items
      .top(5000)
      .select("Id", "LeftText", "RightText", "DefaultValueHeaderIEP")
      ();

    console.log("DefaultDataTable items:", items);
    return items;
  } catch (error) {
    console.error("Error fetching DefaultDataTable:", error);
    throw error;
  }
}

// Update DefaultDataTable item
export async function updateDefaultDataTable(_sp: any, itemId: number, data: any) {
  try {
    await _sp.web.lists
      .getByTitle("DefaultDataTable")
      .items
      .getById(itemId)
      .update(data);

    console.log("DefaultDataTable item updated successfully");
    return true;
  } catch (error) {
    console.error("Error updating DefaultDataTable:", error);
    throw error;
  }
}

/**
 * Delete an IEP from SharePoint
 */
export async function deleteIEP(_sp: any, iepId: number) {
  try {
    const list = _sp.web.lists.getByTitle('IEPs');
    await list.items.getById(iepId).delete();
    console.log("IEP deleted successfully");
    return { success: true, message: 'IEP deleted successfully' };
  } catch (error) {
    console.error('Error deleting IEP:', error);
    throw error;
  }
}

// ============================================
// IEP DISCUSSION / COMMENTS API
// ============================================

/**
 * Fetch discussions for a specific IEP filtered by department
 * Only shows discussions created by the current user
 */
export async function fetchDiscussionsByIEP(_sp: any, iepId: number, departmentId: number, currentUserId: number) {
  try {
    const items = await _sp.web.lists
      .getByTitle("IEPDiscussions")
      .items
      .select(
        "Id",
        "Comment",
        "ParentCommentId",
        "IEP/Id",
        "Department/Id",
        "Author/Id",
        "Author/Title",
        "Created",
        "Modified",
        "MentionedUsers/Id",
        "MentionedUsers/Title",
        "MentionedUsers/EMail"
      )
      .expand("IEP", "Department", "Author", "MentionedUsers")
      .filter(`IEP/Id eq ${iepId} and Department/Id eq ${departmentId} and Author/Id eq ${currentUserId}`)
      .orderBy("Created", false)
      ();
      console.log(items, 'discussion items');
      

    return items;
  } catch (error) {
    console.error("Error fetching IEP discussions:", error);
    throw error;
  }
}

/**
 * Create a new discussion comment
 */
export async function createDiscussionComment(_sp: any, data: {
  IEPId: number;
  DepartmentId: number;
  Comment: string;
  MentionedUserIds?: number[];
}) {
  try {
    const itemData: any = {
      Comment: data.Comment,
      IEPId: data.IEPId,
      DepartmentId: data.DepartmentId
    };

    // Include mentioned users in the initial add if present
    if (data.MentionedUserIds && data.MentionedUserIds.length > 0) {
      itemData.MentionedUsersId = { results: data.MentionedUserIds };
    }

    // Add the item
    const addResult = await _sp.web.lists
      .getByTitle("IEPDiscussions")
      .items
      .add(itemData);

    console.log("Discussion comment created successfully");
    return addResult.data;
  } catch (error) {
    console.error("Error creating discussion comment:", error);
    throw error;
  }
}

/**
 * Create a reply to an existing comment
 */
export async function createDiscussionReply(_sp: any, data: {
  IEPId: number;
  DepartmentId: number;
  Comment: string;
  ParentCommentId: number;
  MentionedUsersIds?: number[];
}) {
  try {
    const itemData: any = {
      Comment: data.Comment,
      IEPId: data.IEPId,
      DepartmentId: data.DepartmentId,
      ParentCommentId: data.ParentCommentId
    };

    // Include mentioned users in the initial add if present
    if (data.MentionedUsersIds && data.MentionedUsersIds.length > 0) {
      itemData.MentionedUsersId = { results: data.MentionedUsersIds };
    }

    // Add the item
    const addResult = await _sp.web.lists
      .getByTitle("IEPDiscussions")
      .items
      .add(itemData);

    console.log("Discussion reply created successfully");
    return addResult.data;
  } catch (error) {
    console.error("Error creating discussion reply:", error);
    throw error;
  }
}
