// Add to SharePointService.js
export const createOrganizationalGoal = async (sp, goalData) => {
  try {
    const list = sp.web.lists.getByTitle('OrganizationalGoals'); // Replace with your actual list name
    debugger;
    const result = await list.items.add({
      Mission: goalData.mission,
      ScorecardName: goalData.scorecardName,
      Year: goalData.year,
      Description: goalData.description
    });

    return result.data;
  } catch (error) {
    console.error('Error creating organizational goal:', error);
    throw error;
  }
};

export const getOrganizationalGoalsAlignment = async (platform, sp) => {
  switch (platform) {
    case "SharePoint":
      try {
        const result = await sp.web.lists
          .getByTitle("OrganizationGoalAlignment")
          .items
          .top(5000)
          .select("*,Value,Tag")
          ();
        return result;
      } catch (error) {
        return [];
      }

    default:
      return [];
  }
};

export const getThreeYearGoalsAlignment = async (platform, sp) => {
  switch (platform) {
    case "SharePoint":
      try {
        const result = await sp.web.lists
          .getByTitle("SharedServiceCampusGoalAlignment")
          .items
          .top(5000)
          .select("*,ThreeYRSharedService,Departments/Id,Departments/DepartmentName,Departments/DepartmentShortName")
          .expand("Departments")
          ();
        return result;
      } catch (error) {
        return [];
      }

    default:
      return [];
  }
};

export const getHlcCriteria = async (platform, sp) => {
  switch (platform) {
    case "SharePoint":
      try {
        const result = await sp.web.lists
          .getByTitle("HLCAlignment")
          .items
          .top(5000)
          .select("*,HLCAlignment")
          ();
        console.log(result, 'HLCAlignment');
        return result;

      } catch (error) {
        return [];
      }

    default:
      return [];
  }
};
export const getDefinition = async (platform, sp) => {
  switch (platform) {
    case "SharePoint":
      try {
        const result = await sp.web.lists
          .getByTitle("Definitions")
          .items
          .top(5000)
          .select("*")
          ();
        console.log(result, 'Definitions');
        return result;

      } catch (error) {
        return [];
      }

    default:
      return [];
  }
};

export const getTags = async (platform, sp) => {
  if (platform !== "SharePoint" || !sp) {
    return [];
  }

  try {
    const result = await sp.web.lists
      .getByTitle("Tags")
      .items
      .top(5000)
      .select("Id", "Tag", "TagType")();
    return result;
  } catch (error) {
    console.error("getTags error:", error);
    return [];
  }
};

export async function fetchUsersListAs(sp, platform, Id) {
  switch (platform) {
    case "SharePoint":
      try {
        const items = await sp.web.lists.getByTitle("Users").items
          .top(5000)
          .select(
            "Id",
            "Title",
            "User/Id",
            "User/Title",
            "User/Name",
            "User/EMail",
            "Departments/Id",
            "Departments/DepartmentName",
            "Role"
          )
          .expand("User", "Departments")
          .filter(`User/Id eq ${Id}`) // Filter by People field user Id
          (); // ✅ Correct way to execute query


        const formattedUsers = items.map(item => ({
          Id: item.Id,
          User: item.User ? {
            Id: item.User.Id,
            Title: item.User.Title,
            Email: item.User.EMail,     // ✅ Correct internal name for email
            LoginName: item.User.Name,  // ✅ Correct internal name for login
          } : null,
          Departments: item.Departments ? {
            Id: item.Departments.Id,
            Title: item.Departments.DepartmentName, // ✅ Lookup field name
          } : null,
          Role: item.Role || "",
        }));

        console.log("Formatted Users:", formattedUsers);
        return formattedUsers;

      } catch (error) {
        console.error("Error fetching users list:", error);
        return [];
      }

    default:
      return [];
  }
}

// === CREATE IEP API (Supports Multi-Select) ===
export const createIEP = async (
  platform,
  sp,
  data,
  departments
) => {
  if (platform !== "SharePoint") return null;

  try {
    const list = sp.web.lists.getByTitle("IEPs");
    const deptId = departments.find((d) => d.DepartmentName === data.Department)?.Id;

    // Add the item with all fields including multi-lookup
    const addResult = await list.items.add(data);
    const itemId = addResult.data.Id;

    console.log('Item created successfully with ID:', itemId);

    // Return the created item
    return addResult.data;
  } catch (error) {
    console.error("Error creating IEP:", error);
    console.error("Error details:", error.message);
    throw new Error(error.message || "Failed to create IEP");
  }
};
// Add this to your existing OrgnaizationAPI.ts
// Updated API function to fetch by DepartmentId instead of DepartmentName
export const getSubDepartmentsByDepartment = async (
  platform,
  sp,
  departmentId
) => {
  if (platform !== "SharePoint") return [];

  try {
    const items = await sp.web.lists
      .getByTitle('SubDepartments')
      .items
      .top(5000)
      .select('*', 'Id', 'Title', 'SubDepartmentName', 'Departments/Id', 'Departments/DepartmentName')
      .filter(`Departments/Id eq ${departmentId}`)
      .expand('Departments')
      ();
    console.log(items, 'items>>');

    return items.map((i) => ({
      Id: i.Id,
      SubDepartmentName: i.SubDepartmentName,
      DepartmentId: i.Department?.Id
    }));
  } catch (e) {
    console.error('getSubDepartmentsByDepartment error:', e);
    return [];
  }
};
export const getSubSubDepartmentsBySubDepartment = async (
  platform,
  sp,
  subDepartmentId
) => {
  if (platform !== "SharePoint") return [];

  try {
    const items = await sp.web.lists
      .getByTitle('SubSubDepartments')
      .items
      .top(5000)
      .select('Id', 'Title', 'SubSubDepartmentName', 'SubDepartments/Id', 'SubDepartments/SubDepartmentName')
      .filter(`SubDepartments/Id eq ${subDepartmentId}`)
      .expand('SubDepartments')();

    console.log(items, 'SubSubDepartments items >>');

    return items.map((i) => ({
      Id: i.Id,
      SubSubDepartmentName: i.SubSubDepartmentName || i.Title,
      SubDepartmentId: i.SubDepartment?.Id
    }));
  } catch (e) {
    console.error('getSubSubDepartmentsBySubDepartment error:', e);
    return [];
  }
};

// Get ALL SubDepartments with their parent Department relationships
export const getAllSubDepartments = async (sp) => {
  try {
    const items = await sp.web.lists
      .getByTitle('SubDepartments')
      .items
      .top(5000)
      .select('Id', 'SubDepartmentName', 'Departments/Id', 'Departments/DepartmentName')
      .expand('Departments')()
      .catch(() => []);

    return items.map((i) => ({
      Id: i.Id,
      SubDepartmentName: i.SubDepartmentName,
      DepartmentId: i.Departments?.Id
    }));
  } catch (e) {
    console.error('getAllSubDepartments error:', e);
    return [];
  }
};

// Get ALL SubSubDepartments with their parent SubDepartment relationships
export const getAllSubSubDepartments = async (sp) => {
  try {
    const items = await sp.web.lists
      .getByTitle('SubSubDepartments')
      .items
      .top(5000)
      .select('Id', 'SubSubDepartmentName', 'SubDepartments/Id', 'SubDepartments/SubDepartmentName')
      .expand('SubDepartments')()
      .catch(() => []);

    return items.map((i) => ({
      Id: i.Id,
      SubSubDepartmentName: i.SubSubDepartmentName,
      SubDepartmentId: i.SubDepartments?.Id
    }));
  } catch (e) {
    console.error('getAllSubSubDepartments error:', e);
    return [];
  }
};

export const RecentActivities = async (sp) => {
  const items = await sp.web.lists
    .getByTitle('RecentActivities')
    .items
    .top(5000)
    .select('Id', 'Actor', 'ActorName', 'Actor/Id', 'Actor/Title', "Activity", "Entity")
    // .filter(`SubDepartments/Id eq ${subDepartmentId}`)
    .expand('Actor')();

  console.log(items, 'RecentActivities items >>');
  return items;
}

export async function getIEPs(_sp, filters) {
  try {
    // Build OData filter string using lookup id fields (SharePoint stores lookup id fields as <FieldName>Id)
    const filterParts = [];
    if (filters?.organizationalGoalId != null) {
      filterParts.push(`OrganizationalGoalsId eq ${filters.organizationalGoalId}`);
    }
    if (filters?.departmentId != null) {
      filterParts.push(`DepartmentsId eq ${filters.departmentId}`);
    }
    if (filters?.subDepartmentId != null) {
      filterParts.push(`SubDepartmentsId eq ${filters.subDepartmentId}`);
    }
    if (filters?.subSubDepartmentId != null) {
      filterParts.push(`SubSubDepartmentsId eq ${filters.subSubDepartmentId}`);
    }

    const filterStr = filterParts.length ? filterParts.join(' and ') : undefined;

    console.log(filterStr, 'filterStr');


    // Base query
    let query = _sp.web.lists.getByTitle("IEPs").items
      .top(5000)
      .select(
        "Id",
        "Title",
        "OperationalGoal",
        "IsGlobalGoal",
        "OperationalTactic",
        "PerformanceMeasure",
        "PerformanceMeasureResults",
        "Target",
        "BudgetImpactDescription",
        "ContinuousImprovement",
        "FutureBudgetImpact",
        "IfYesPleaseDescribe",
        "ResultsMet",
        // include lookup expansions (we will also fetch lookup lists separately)
        "OrganizationGoalAlignment/Id",
        "HLCAlignment/Id",
        "SharedServiceCampusGoalAlignment/Id",
        "OrganizationalGoals/Id",
        "Departments/Id",
        "SubDepartments/Id",
        "SubSubDepartments/Id",

        "Created",
        "Modified",
        "Priority",
        "Title", "*"
      )
      .expand(
        "OrganizationGoalAlignment",
        "HLCAlignment",
        "SharedServiceCampusGoalAlignment",
        "OrganizationalGoals",
        "Departments",
        "SubDepartments",
        "SubSubDepartments",


      )
      .orderBy("Modified", false) // false = descending → newest first
      ;

    if (filterStr) {
      query = query.filter(filterStr);
    }

    // Fetch all items using pagination
    let allItems = [];
    let pagedResults = await query.getPaged();
    allItems = allItems.concat(pagedResults.results);

    // Continue fetching if there are more pages
    while (pagedResults.hasNext) {
      pagedResults = await pagedResults.getNext();
      allItems = allItems.concat(pagedResults.results);
    }

    console.log(allItems, 'recent act - total items:', allItems.length);
    const items = allItems;

    // Fetch lookup lists (we need these to compose richer objects)
    const [
      orgAlign,
      hlcAlign,
      organizations,
      departments,
      threeYrAlign,
      subDepartments,
      subsubDepartments,

    ] = await Promise.all([
      _sp.web.lists.getByTitle("OrganizationGoalAlignment").items.top(5000).select("Id", "OrganizationalGoalAlignment", "Value", "Tag")(),
      _sp.web.lists.getByTitle("HLCAlignment").items.top(5000).select("Id", "HLCAlignment", "Description")(),
      _sp.web.lists.getByTitle("OrganizationalGoals").items.top(5000).select("Id", "ScorecardName", "Year", "Mission", "Description", "GlobalGoal")(),
      _sp.web.lists.getByTitle("Departments").items.top(5000).select("Id", "DepartmentName", "DepartmentShortName", "Vision")(),
      _sp.web.lists.getByTitle("SharedServiceCampusGoalAlignment").items.top(5000)
        .select("Id", "ThreeYRSharedService", "Department/DepartmentName")
        .expand("Department")(),
      _sp.web.lists.getByTitle("SubDepartments").items.top(5000).select("Id", "SubDepartmentName")(),
      _sp.web.lists.getByTitle("SubSubDepartments").items.top(5000).select("Id", "SubSubDepartmentName")(),

    ]);

    console.log('Organizations with GlobalGoal:', organizations);
    console.log('items', items);

    // Merge lookup data into each IEP row
    const merged = items.map((item) => ({
      ...item,
      // map alignment ids to full objects from lookup lists (if present)
      OrganizationGoalAlignment:
        item.OrganizationGoalAlignment?.map((x) =>
          orgAlign.find((y) => y.Id === x.Id)
        ) ?? [],
      HLCAlignment:
        item.HLCAlignment?.map((x) =>
          hlcAlign.find((y) => y.Id === x.Id)
        ) ?? [],
      SharedServiceCampusGoalAlignment:
        item.SharedServiceCampusGoalAlignment?.map((x) =>
          threeYrAlign.find((y) => y.Id === x.Id)
        ) ?? [],
      Departments:
        item.Departments
          ? departments.find((y) => y.Id === item.Departments.Id)
          : null,
      OrganizationalGoals:
        item.OrganizationalGoals
          ? organizations.find((y) => y.Id === item.OrganizationalGoals.Id)
          : null,

      SubDepartments:
        item.SubDepartments
          ? subDepartments.find((y) => y.Id === item.SubDepartments.Id)
          : null,
      SubSubDepartments:
        item.SubSubDepartments
          ? subsubDepartments.find((y) => y.Id === item.SubSubDepartments.Id)
          : null,
    }));

    console.log('Merged IEPs with GlobalGoal:', merged.slice(0, 2));
    return merged;
  } catch (error) {
    console.error("Error fetching IEPs:", error);
    throw error;
  }
}


export async function getIEPss(_sp, filters) {
  try {
    // Build OData filter string using lookup id fields (SharePoint stores lookup id fields as <FieldName>Id)
    const filterParts = [];
    if (filters && filters.organizationalGoalId != null) {
      filterParts.push(`OrganizationalGoalsId eq ${filters.organizationalGoalId}`);
    }
    if (filters && filters.departmentId != null) {
      filterParts.push(`DepartmentsId eq ${filters.departmentId}`);
    }
    if (filters && filters.subDepartmentId != null) {
      filterParts.push(`SubDepartmentsId eq ${filters.subDepartmentId}`);
    }
    if (filters && filters.subSubDepartmentId != null) {
      filterParts.push(`SubSubDepartmentsId eq ${filters.subSubDepartmentId}`);
    }
    if (filters && filters.tagId != null) {
      filterParts.push(`TagId eq ${filters.tagId}`);
    }

    const filterStr = filterParts.length ? filterParts.join(' and ') : undefined;

    // Base query
    let query = _sp.web.lists.getByTitle("IEPs").items
      .top(5000)
      .select(
        "Id",
        "Title",
        "OperationalGoal",
        "IsGlobalGoal",
        "OperationalTactic",
        "PerformanceMeasure",
        "Target",
        "PerformanceMeasureResults",
        "ResultsMet",
        "ContinuousImprovement",
        "FutureBudgetImpact",
        "BudgetImpactDescription",
        "IfYesPleaseDescribe",
        "StartDate",
        "EndDate",
        "Priority",
        "OrganizationalGoals/Id",
        "OrganizationalGoals/Year",
        "OrganizationalGoals/Mission",
        "OrganizationalGoals/ScorecardName",
        "OrganizationalGoals/Description",
        "Departments/Id",
        "Departments/DepartmentName",
        "Departments/DepartmentShortName",
        "SubDepartments/Id",
        "SubDepartments/SubDepartmentName",
        "SubSubDepartments/Id",
        "SubSubDepartments/SubSubDepartmentName",
        // "Tag/Id",
        "OrganizationGoalAlignment/Id",
        "OrganizationGoalAlignment/Value",
        "OrganizationGoalAlignment/Tag",
        "SharedServiceCampusGoalAlignment/Id",
        "SharedServiceCampusGoalAlignment/ThreeYRSharedService",
        // "Tag/Id",
        "Author/Id", "Author/Title",
        "HLCAlignment/Id",
        "HLCAlignment/HLCAlignment",
      )
      .expand(
        "OrganizationGoalAlignment",

        "SharedServiceCampusGoalAlignment",
        "OrganizationalGoals",
        "Departments",
        "SubDepartments",
        "SubSubDepartments",
        // "Tag"
        "HLCAlignment", "Author"
      )
      .orderBy("Modified", false); // false = descending → newest first

    if (filterStr) {
      query = query.filter(filterStr);
    }

    // Fetch all items using pagination
    let allItems = [];
    let pagedResults = await query.getPaged();
    allItems = allItems.concat(pagedResults.results);

    // Continue fetching if there are more pages
    while (pagedResults.hasNext) {
      pagedResults = await pagedResults.getNext();
      allItems = allItems.concat(pagedResults.results);
    }

    console.log('Total IEPs fetched:', allItems.length);
    const items = allItems;

    // // Fetch lookup lists (we need these to compose richer objects)
    // const [
    //   orgAlign,
    //   hlcAlign,
    //   organizations,
    //   departments,
    //   threeYrAlign,
    //   subDepartments,
    //   subsubDepartments,
    //   tags
    // ] = await Promise.all([
    //   _sp.web.lists.getByTitle("OrganizationGoalAlignment").items.select("Id", "OrganizationalGoalAlignment", "Value")(),
    //   _sp.web.lists.getByTitle("HLCAlignment").items.select("Id", "HLCAlignment", "Description")(),
    //   _sp.web.lists.getByTitle("OrganizationalGoals").items.select("Id", "ScorecardName", "Year", "Mission", "Description")(),
    //   _sp.web.lists.getByTitle("Departments").items.select("Id", "DepartmentName", "DepartmentShortName", "Vision")(),
    //   _sp.web.lists.getByTitle("SharedServiceCampusGoalAlignment").items
    //     .select("Id", "ThreeYRSharedService", "Department/DepartmentName")
    //     .expand("Department")(),
    //   _sp.web.lists.getByTitle("SubDepartments").items.select("Id", "SubDepartmentName")(),
    //   _sp.web.lists.getByTitle("SubSubDepartments").items.select("Id", "SubSubDepartmentName")(),
    //   _sp.web.lists.getByTitle("Tags").items.select("Id", "Tag", "TagType")(),
    // ]);

    // // Merge lookup data into each IEP row
    // const merged = items.map(item => ({
    //   ...item,
    //   OrganizationalGoalsAlignment:
    //     item.OrganizationalGoalsAlignment?.map(x =>
    //       orgAlign.find(y => y.Id === x.Id)
    //     ) ?? [],
    //   HLCCriteriaAlignment:
    //     item.HLCCriteriaAlignment?.map(x =>
    //       hlcAlign.find(y => y.Id === x.Id)
    //     ) ?? [],
    //   Plan3YearGoalsAlignment:
    //     item.Plan3YearGoalsAlignment?.map(x =>
    //       threeYrAlign.find(y => y.Id === x.Id)
    //     ) ?? [],
    //   Department: item.Department
    //     ? departments.find(y => y.Id === item.Department.Id)
    //     : null,
    //   OrganizationalGoal: item.OrganizationalGoal
    //     ? organizations.find(y => y.Id === item.OrganizationalGoal.Id)
    //     : null,
    //   Tag: item.Tag
    //     ? tags.find(y => y.Id === item.Tag.Id)
    //     : null,
    //   SubDepartments: item.SubDepartments
    //     ? subDepartments.find(y => y.Id === item.SubDepartments.Id)
    //     : null,
    //   SubSubDepartments: item.SubSubDepartments
    //     ? subsubDepartments.find(y => y.Id === item.SubSubDepartments.Id)
    //     : null,
    // }));

    return items;

  } catch (error) {
    console.error("Error fetching IEPs:", error);
    throw error;
  }
}
export async function getOrganizationalScorecards(_sp) {
  try {
    const query = _sp.web.lists.getByTitle("OrganizationalGoals").items
      .top(5000)
      .select("Id", "Title", "Mission", "Year", "ScorecardName", "Description", "Created", "GlobalGoal")
      .orderBy("Year", false);

    // Fetch all items using pagination
    let allItems = [];
    let pagedResults = await query.getPaged();
    allItems = allItems.concat(pagedResults.results);

    while (pagedResults.hasNext) {
      pagedResults = await pagedResults.getNext();
      allItems = allItems.concat(pagedResults.results);
    }

    return allItems;
  } catch (error) {
    console.error("Error fetching organizational scorecards:", error);
    throw error;
  }
}
// Departments API - CORRECT
export async function getDepartments(_sp) {
  try {
    const query = _sp.web.lists.getByTitle("Departments").items
      .top(5000)
      .select("Id", "Title", "DepartmentName", "Vision", "Mission", "DepartmentShortName", "HeadOfDepartment/Id", "HeadOfDepartment/Title")
      .expand("HeadOfDepartment");

    // Fetch all items using pagination
    let allItems = [];
    let pagedResults = await query.getPaged();
    allItems = allItems.concat(pagedResults.results);

    while (pagedResults.hasNext) {
      pagedResults = await pagedResults.getNext();
      allItems = allItems.concat(pagedResults.results);
    }

    return allItems;
  } catch (error) {
    console.error("Error fetching departments:", error);
    throw error;
  }
}


export async function getIEPsByScorecard(_sp, scorecardId) {
  try {
    // Step 1: Get main IEPs with pagination
    const query = _sp.web.lists.getByTitle("IEPs").items
      .top(5000)
      .filter(`OrganizationalGoals/Id eq ${scorecardId}`)
      .select(
        "Id",
        "Title",
        "OperationalGoal",
        "IsGlobalGoal",
        "OperationalTactic",
        "PerformanceMeasure",
        "Target",
        "PerformanceMeasureResults",
        "ResultsMet",
        "ContinuousImprovement",
        "FutureBudgetImpact",
        "BudgetImpactDescription",
        "IfYesPleaseDescribe",
        "StartDate",
        "EndDate",
        "Priority",
        "OrganizationalGoals/Id",
        "OrganizationalGoals/Year",
        "OrganizationalGoals/Mission",
        "OrganizationalGoals/ScorecardName",
        "OrganizationalGoals/Description",
        "Departments/Id",
        "Departments/DepartmentName",
        "Departments/DepartmentShortName",
        "SubDepartments/Id",
        "SubDepartments/SubDepartmentName",
        "SubSubDepartments/Id",
        "SubSubDepartments/SubSubDepartmentName",
        // "Tag/Id",
        "OrganizationGoalAlignment/Id",
        "OrganizationGoalAlignment/Value",
        "OrganizationGoalAlignment/Tag",
        "HLCAlignment/Id",
        "HLCAlignment/HLCAlignment",
        "SharedServiceCampusGoalAlignment/Id",
        "SharedServiceCampusGoalAlignment/ThreeYRSharedService",
        "Tag/Id", "Author/Id", "Author/Title"
      )
      .expand(
        "OrganizationGoalAlignment",
        "HLCAlignment",
        "SharedServiceCampusGoalAlignment",
        "OrganizationalGoals",
        "Departments",
        "SubDepartments",
        "SubSubDepartments",
        // "Tag"
      );

    // Fetch all items using pagination
    let allItems = [];
    let pagedResults = await query.getPaged();
    allItems = allItems.concat(pagedResults.results);

    while (pagedResults.hasNext) {
      pagedResults = await pagedResults.getNext();
      allItems = allItems.concat(pagedResults.results);
    }

    console.log('IEPs by Scorecard - Total items:', allItems.length);
    const items = allItems;

    // Fetch related lookup lists
    const [
      orgAlign,
      hlcAlign,
      organizations,
      departments,
      threeYrAlign,
      subDepartments,
      subsubDepartments
    ] = await Promise.all([
      _sp.web.lists.getByTitle("OrganizationGoalAlignment").items.top(5000).select("Id", "OrganizationalGoalAlignment", "Value", "Tag")(),
      _sp.web.lists.getByTitle("HLCAlignment").items.top(5000).select("Id", "HLCAlignment", "Description")(),
      _sp.web.lists.getByTitle("OrganizationalGoals").items.top(5000).select("Id", "ScorecardName", "Year", "Mission", "Description", "GlobalGoal")(),
      _sp.web.lists.getByTitle("Departments").items.top(5000).select("Id", "DepartmentName", "DepartmentShortName", "Vision")(),
      _sp.web.lists.getByTitle("SharedServiceCampusGoalAlignment").items.top(5000)
        .select("Id", "ThreeYRSharedService", "Department/DepartmentName")
        .expand("Department")(),
      _sp.web.lists.getByTitle("SubDepartments").items.top(5000).select("Id", "SubDepartmentName")(),
      _sp.web.lists.getByTitle("SubSubDepartments").items.top(5000).select("Id", "SubSubDepartmentName")(),
    ]);

    console.log('Organizations with GlobalGoal (by Scorecard):', organizations);

    // Merge lookup data
    const merged = items.map((item) => ({
      ...item,
      OrganizationGoalAlignment:
        item.OrganizationGoalAlignment?.map((x) =>
          orgAlign.find((y) => y.Id === x.Id)
        ) ?? [],
      HLCAlignment:
        item.HLCAlignment?.map((x) =>
          hlcAlign.find((y) => y.Id === x.Id)
        ) ?? [],
      SharedServiceCampusGoalAlignment:
        item.SharedServiceCampusGoalAlignment?.map((x) =>
          threeYrAlign.find((y) => y.Id === x.Id)
        ) ?? [],
      Departments:
        item.Departments
          ? departments.find((y) => y.Id === item.Departments.Id)
          : null,
      OrganizationalGoals:
        item.OrganizationalGoals
          ? organizations.find((y) => y.Id === item.OrganizationalGoals.Id)
          : null,
      SubDepartments:
        item.SubDepartments
          ? subDepartments.find((y) => y.Id === item.SubDepartments.Id)
          : null,
      SubSubDepartments:
        item.SubSubDepartments
          ? subsubDepartments.find((y) => y.Id === item.SubSubDepartments.Id)
          : null,
    }));

    console.log('Merged IEPs by Scorecard with GlobalGoal:', merged.slice(0, 2));
    return merged;
  } catch (error) {
    console.error("Error fetching IEPs by scorecard:", error);
    throw error;
  }
}


// FIXED: Use Department/Id
// ✅ Fetch IEPs filtered by Department
export async function getIEPsByDepartment(_sp, departmentId) {
  try {
    // Step 1: Get main IEPs with pagination
    const query = _sp.web.lists.getByTitle("IEPs").items
      .top(5000)
      .filter(`Departments/Id eq ${departmentId}`)
      .select(
        "Id",
        "Title",
        "OperationalGoal",
        "IsGlobalGoal",
        "OperationalTactic",
        "PerformanceMeasure",
        "Target",
        "PerformanceMeasureResults",
        "ResultsMet",
        "ContinuousImprovement",
        "FutureBudgetImpact",
        "BudgetImpactDescription",
        "IfYesPleaseDescribe",
        "StartDate",
        "EndDate",
        "Priority",
        "OrganizationalGoals/Id",
        "OrganizationalGoals/Year",
        "OrganizationalGoals/Mission",
        "OrganizationalGoals/ScorecardName",
        "OrganizationalGoals/Description",
        "Departments/Id",
        "Departments/DepartmentName",
        "Departments/DepartmentShortName",
        "SubDepartments/Id",
        "SubDepartments/SubDepartmentName",
        "SubSubDepartments/Id",
        "SubSubDepartments/SubSubDepartmentName",
        // "Tag/Id",
        "OrganizationGoalAlignment/Id",
        "OrganizationGoalAlignment/Value",
        "HLCAlignment/Id",
        "HLCAlignment/HLCAlignment",
        "SharedServiceCampusGoalAlignment/Id",
        "SharedServiceCampusGoalAlignment/ThreeYRSharedService",
        "Tag/Id", "Author/Id", "Author/Title"
      )
      .expand(
        "OrganizationGoalAlignment",
        "HLCAlignment",
        "SharedServiceCampusGoalAlignment",
        "OrganizationalGoals",
        "Departments",
        "SubDepartments",
        "SubSubDepartments",
        // "Tag"
      ).orderBy("Modified", false); // false = descending → newest first

    // Fetch all items using pagination
    let allItems = [];
    let pagedResults = await query.getPaged();
    allItems = allItems.concat(pagedResults.results);

    while (pagedResults.hasNext) {
      pagedResults = await pagedResults.getNext();
      allItems = allItems.concat(pagedResults.results);
    }

    console.log('IEPs by Department - Total items:', allItems.length);
    const items = allItems;

    // Fetch related lookup lists
    const [
      orgAlign,
      hlcAlign,
      organizations,
      departments,
      threeYrAlign,
      subDepartments,
      subsubDepartments
    ] = await Promise.all([
      _sp.web.lists.getByTitle("OrganizationGoalAlignment").items.top(5000).select("Id", "OrganizationalGoalAlignment", "Value", "Tag")(),
      _sp.web.lists.getByTitle("HLCAlignment").items.top(5000).select("Id", "HLCAlignment", "Description")(),
      _sp.web.lists.getByTitle("OrganizationalGoals").items.top(5000).select("Id", "ScorecardName", "Year", "Mission", "Description", "GlobalGoal")(),
      _sp.web.lists.getByTitle("Departments").items.top(5000).select("Id", "DepartmentName", "DepartmentShortName", "Vision")(),
      _sp.web.lists.getByTitle("SharedServiceCampusGoalAlignment").items.top(5000)
        .select("Id", "ThreeYRSharedService", "Department/DepartmentName")
        .expand("Department")(),
      _sp.web.lists.getByTitle("SubDepartments").items.top(5000).select("Id", "SubDepartmentName")(),
      _sp.web.lists.getByTitle("SubSubDepartments").items.top(5000).select("Id", "SubSubDepartmentName")(),
    ]);

    console.log('Organizations with GlobalGoal (by Department):', organizations);

    // Merge lookup data
    const merged = items.map((item) => ({
      ...item,
      OrganizationGoalAlignment:
        item.OrganizationGoalAlignment?.map((x) =>
          orgAlign.find((y) => y.Id === x.Id)
        ) ?? [],
      HLCAlignment:
        item.HLCAlignment?.map((x) =>
          hlcAlign.find((y) => y.Id === x.Id)
        ) ?? [],
      SharedServiceCampusGoalAlignment:
        item.SharedServiceCampusGoalAlignment?.map((x) =>
          threeYrAlign.find((y) => y.Id === x.Id)
        ) ?? [],
      Departments:
        item.Departments
          ? departments.find((y) => y.Id === item.Departments.Id)
          : null,
      OrganizationalGoals:
        item.OrganizationalGoals
          ? organizations.find((y) => y.Id === item.OrganizationalGoals.Id)
          : null,
      SubDepartments:
        item.SubDepartments
          ? subDepartments.find((y) => y.Id === item.SubDepartments.Id)
          : null,
      SubSubDepartments:
        item.SubSubDepartments
          ? subsubDepartments.find((y) => y.Id === item.SubSubDepartments.Id)
          : null,
    }));

    console.log('Merged IEPs by Department with GlobalGoal:', merged.slice(0, 2));
    return merged;
  } catch (error) {
    console.error("Error fetching IEPs by department:", error);
    throw error;
  }
}

// Create Organizational Goal - CORRECTED
// export async function createOrganizationalGoal(_sp, goalData) {
//   try {
//     const result = await _sp.web.lists.getByTitle("OrganizationalGoals").items.add(goalData);
//     return result.data;
//   } catch (error) {
//     console.error("Error creating organizational goal:", error);
//     throw error;
//   }
// }

// Create IEP
// export async function createIEP(str, _sp,iepData,departments) {
//   try {
//     const result = await _sp.web.lists.getByTitle("IEPs").items.add(iepData);
//     return result.data;
//   } catch (error) {
//     console.error("Error creating IEP:", error);
//     throw error;
//   }
// }

// Update IEP
// Add this function to your existing API service file
export const updateIEP = async (dataSource, sp, id, data, departments) => {
  try {
    // Get the list name from your SharePoint configuration
    const list = sp.web.lists.getByTitle("IEPs"); // Replace with your actual list name

    // Prepare the update data
    // const updateData = {
    //   Title: data.OperationalGoal,
    //   OperationalGoal: data.OperationalGoal,
    //   OperationalTactic: data.OperationalTactic,
    //   PerformanceMeasure: data.PerformanceMeasure,
    //   PerformanceMeasureResults: data.PerformanceMeasureResults,
    //   ResultsMet: data.ResultsMet,
    //   ContinuousImprovement: data.ContinuousImprovement,
    //   FutureBudgetImpact: data.FutureBudgetImpact,
    //   IfYesPleaseDescribe: data.IfYesPleaseDescribe,
    //   StartDate: data.StartDate,
    //   EndDate: data.EndDate,
    //   Priority: data.Priority,
    //   Target: data.Target,
    //   BudgetImpactDescription: data.BudgetImpactDescription,
    //   // Lookup fields
    //   OrganizationalGoalsId: data.OrganizationalGoalsId,
    //   DepartmentsId: data.DepartmentsId,
    //   SubDepartmentsId: data.SubDepartmentsId,
    //   SubSubDepartmentsId: data.SubSubDepartmentsId,
    //   // Multi-select lookup fields need special handling
    //   OrganizationGoalAlignmentId: data.OrganizationGoalAlignmentId,
    //   HLCAlignmentId: data.HLCAlignmentId,
    //   SharedServiceCampusGoalAlignmentId: data.SharedServiceCampusGoalAlignmentId,
    //   TagId: data.TagId || null,
    // };

    // Update the item
    await list.items.getById(id).update(data);

    return { success: true, id: id };
  } catch (error) {
    console.error('Error updating IEP:', error);
    throw error;
  }
};
export async function updateOrganizationalGoal(source, sp, id, payload) {
  if (!sp) throw new Error("SharePoint context (sp) is required");
  if (!id) throw new Error("ID is required to update an organizational goal");

  const listTitle =
    process.env.REACT_APP_ORG_GOALS_LIST_NAME || "OrganizationalGoals";

  try {
    if (source !== "SharePoint") {
      throw new Error("Unsupported source: " + source);
    }

    await sp.web.lists.getByTitle(listTitle).items.getById(id).update(payload);

    try {
      return await sp.web.lists.getByTitle(listTitle).items.getById(id).get();
    } catch (e) {
      return { success: true };
    }

  } catch (error) {
    console.error("updateOrganizationalGoal error:", error);
    throw error;
  }
}


export async function updateDepartment(source, sp, id, payload) {
  if (!sp) throw new Error("SharePoint context (sp) is required");
  if (!id) throw new Error("ID is required to update department");

  const listTitle =
    process.env.REACT_APP_DEPARTMENTS_LIST_NAME || "Departments";

  try {
    if (source !== "SharePoint") {
      throw new Error("Unsupported source: " + source);
    }

    await sp.web.lists.getByTitle(listTitle).items.getById(id).update(payload);

    try {
      return await sp.web.lists.getByTitle(listTitle).items.getById(id).get();
    } catch (e) {
      return { success: true };
    }

  } catch (error) {
    console.error("updateDepartment error:", error);
    throw error;
  }
}
